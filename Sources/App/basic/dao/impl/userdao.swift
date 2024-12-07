import Fluent
import Foundation
import Vapor

/// 登录的用户
extension Request {
    /// 登录过的用户
    var loginUser: User {
        get throws {
            try auth.require(User.self)
        }
    }

    @discardableResult
    func user(uuid: String) async throws -> User {
        guard let user = try await User.query(on: db)
            .filter(\.$uuid == uuid)
            .first()
        else {
            throw Abort(.notFound, reason: "用户不存在")
        }
        return user
    }
    /// 保存用户
    func save(user: User) async throws {
        try await user.save(on: db)
    }
}
