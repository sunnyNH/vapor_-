import Vapor
import Fluent

struct WebController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        // 只处理非 API 的根级路由
        routes.get("", use: spaHandler) // 首页
        routes.get("login", use: spaHandler)
        routes.get("content-list", use: spaHandler)
        routes.get("data-overview", use: spaHandler)
        routes.get("trend-analysis", use: spaHandler)
        routes.get("creator-list", use: spaHandler)
        routes.get("content-detail-query", use: spaHandler)
        routes.get("user-management", use: spaHandler)
    }
    
    func spaHandler(req: Request) async throws -> Response {
        let indexPath = req.application.directory.publicDirectory + "index.html"
        return req.fileio.streamFile(at: indexPath)
    }
}
