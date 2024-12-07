import JWT
import Vapor
import Fluent
// 定义 JWT 的载荷结构
struct UserPayload: JWTPayload {
    // 添加需要在载荷中存储的声明
    var exp: ExpirationClaim // 过期时间
    var uuid: String // 用户 ID

    // 验证载荷的方法
    func verify(using _: JWTSigner) throws {
        try exp.verifyNotExpired() // 验证是否过期
    }
}

struct AuthMiddleware: AsyncMiddleware {
    func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response {
        // 获取 token (优先从 cookie 获取，其次从 Authorization header 获取)
        let token = request.cookies["dc_0"]?.string ?? request.headers.bearerAuthorization?.token
        
        guard let validToken = token else {
            throw Abort(.unauthorized, reason: "请提供有效的认证令牌 (通过 Cookie 或 Authorization Header)")
        }
        // 检查token是否在黑名单中
        if let _ = try await TokenBlacklist
            .query(on: request.db)
            .filter(\.$token == validToken)
            .first() {
            throw Abort(.unauthorized, reason: "token已失效")
        }
        // 验证 token 并获取用户信息
        let payload = try request.jwt.verify(validToken, as: UserPayload.self)
        let user = try await request.user(uuid: payload.uuid)
        request.auth.login(user)
        
        return try await next.respond(to: request)
    }
}
