//
//  File.swift
//
//
//  Created by 牛辉 on 2021/9/10.
//

import Fluent
import Foundation
import Vapor
import JWT

/// 处理用户登录注册相关的控制器
struct SignController: RouteCollection {
    /// 注册路由
    func boot(routes: RoutesBuilder) throws {
        routes.post("signin", use: signin)
        // 需要登录
        let authMiddleware = AuthMiddleware()
        routes.grouped(authMiddleware).post("signout", use: signout)
    }
    
    /// 处理用户登录或注册
    /// - Parameter req: HTTP请求
    /// - Returns: 包含token的HTTP响应
    /// - Throws: 参数验证错误或数据库操作错误
    func signin(req: Request) async throws -> Response {
        // 验证输入
        let phone = try req.validatedPhone()
        let password = try req.validatedPassword()
        
        // 查找或创建用户
        let user = try await findOrCreateUser(req: req, phone: phone, password: password)
        
        // 生成token响应
        return try generateTokenResponse(req: req, user: user)
    }
    
    /// 处理用户退出登录
    /// - Parameter req: HTTP请求
    /// - Returns: HTTP响应
    /// - Throws: 可能的错误
    func signout(req: Request) async throws -> Response {
        // 获取 token (优先从 cookie 获取，其次从 Authorization header 获取)
        let token = req.cookies["dc_0"]?.string ?? req.headers.bearerAuthorization?.token
        
        guard let validToken = token else {
            throw Abort(.badRequest, reason: "请提供有效的认证令牌 (通过 Cookie 或 Authorization Header)")
        }
        let payload = try req.jwt.verify(validToken, as: UserPayload.self)
        // 将token加入黑名单
        let blacklistToken = TokenBlacklist(
            token: validToken,
            expiredAt: payload.exp.value
        )
        try await blacklistToken.save(on: req.db)
        
        // 创建响应
        let response = Response(status: .ok)
        
        // 清除cookie
        response.cookies["dc_0"] = HTTPCookies.Value(
            string: "",
            expires: Date(timeIntervalSince1970: 0),
            maxAge: -1,
            isHTTPOnly: true
        )
        
        // 设置响应体
        let responseData = "退出登录成功".successResponse()
        response.body = try .init(data: JSONEncoder().encode(responseData))
        response.headers.replaceOrAdd(name: .contentType, value: "application/json; charset=utf-8")
        
        return response
    }
}
// MARK: - 登录
extension SignController {
    /// 查找或创建用户
    private func findOrCreateUser(req: Request, phone: String, password: String) async throws -> User {
        if let existingUser = try await User.query(on: req.db)
            .filter(\.$phone == phone)
            .first() {
            // 验证已存在用户的密码
            guard try existingUser.verifyPassword(password) else {
                throw Abort(.unauthorized, reason: "密码错误，请重新输入")
            }
            return existingUser
        }
        
        // 创建新用户
        let newUser = User(phone: phone)
        try newUser.setPassword(password)
        try await newUser.save(on: req.db)
        return newUser
    }
    
    /// 生成包含token的响应
    private func generateTokenResponse(req: Request, user: User) throws -> Response {
        // 设置7天过期时间
        let expiration = Date().addingTimeInterval(7 * 24 * 60 * 60)
        let exp = ExpirationClaim(value: expiration)
        
        // 生成JWT token
        let payload = UserPayload(exp: exp, uuid: user.uuid)
        let token = try req.jwt.sign(payload)
        
        // 创建响应
        let response = Response(status: .ok)
        
        // 设置cookie
        response.cookies["dc_0"] = HTTPCookies.Value(
            string: token,
            expires: expiration
        )
        
        // 设置响应体
        let responseData = token.successResponse()
        response.body = try .init(data: JSONEncoder().encode(responseData))
        response.headers.replaceOrAdd(name: .contentType, value: "application/json; charset=utf-8")
        
        return response
    }
}