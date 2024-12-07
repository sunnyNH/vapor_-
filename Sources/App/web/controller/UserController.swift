import Fluent
import FluentKit
import Vapor

struct UserController: RouteCollection {
    /// 处理用户业务
    let userBusiness: UserBusiness
    init() {
        print("UserController init")
        self.userBusiness = UserBusiness()
    }
    func boot(routes: RoutesBuilder) throws {
        let user = routes.grouped("user")
        let logged = user.grouped(AuthMiddleware())
        // 获取自己的信息
        logged.get("profile", use: profile)
        // 修改自己的信息
        logged.put("profile", use: putProfile)
        // 获取所有用户列表
        logged.get("list", use: list)
    }
    
    // 获取所有用户列表
    func list(req: Request) async throws -> ResponseModel<[User.Public]> {
        // 获取所有用户
        let users = try await User.query(on: req.db)
            .sort(\.$create_at, .descending) // 按创建时间降序排序
            .all()
        
        // 转换为公开信息
        let publicUsers = users.map { user in
            user.asPublic(req)
        }
        
        return publicUsers.successResponse
    }

    // 获取自己的信息
    func profile(req: Request) async throws -> ResponseModel<User.Public> {
        let user = try req.loginUser
        return user.asPublic(req).successResponse
    }
    
    // 修改自己的信息
    func putProfile(req: Request) async throws -> ResponseModel<User.Public> {
        // 获取登录用户 
        let user: User = try req.loginUser
        req.logger.info("修改用户信息: \(user)")
        // 修改用户信息
        let updatedUser = try await userBusiness.updateProfile(req: req, user: user)
        // 返回用户信息
        return updatedUser.asPublic(req).successResponse
    }
}
