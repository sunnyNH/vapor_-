import Vapor
import Fluent

struct WebController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        /// web 首页
        routes.get("", use: home)
    }
    func home(req: Request) async throws -> Response {

        let token = req.cookies["dc_0"]?.string
        
        var path = "admin.html"
        guard let validToken = token else {
            path = "login.html"
            return req.fileio.streamFile(at: req.application.directory.publicDirectory + path)
        }
        // 检查token是否在黑名单中
        if let _ = try await TokenBlacklist
            .query(on: req.db)
            .filter(\.$token == validToken)
            .first() {
            path = "login.html"
        }
        // 验证 token 并获取用户信息
        do {
            let payload = try req.jwt.verify(validToken, as: UserPayload.self)
            let _ = try await req.user(uuid: payload.uuid)
        } catch {
            path = "login.html"
        }
        return req.fileio.streamFile(at: req.application.directory.publicDirectory + path)
    }
}
