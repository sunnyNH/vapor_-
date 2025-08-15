import Vapor
import Fluent

struct WebController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        // SPA 路由处理 - 所有非 API 路径都返回 index.html
        routes.get("*", use: spaHandler)
    }
    
    /// SPA 路由处理器
    func spaHandler(req: Request) async throws -> Response {
        let path = req.url.path
        
        // API 路径不应该被 SPA 处理，让它们返回 404
        if path.hasPrefix("/api/") || 
           path.hasPrefix("/signin") || 
           path.hasPrefix("/signout") || 
           path.hasPrefix("/user") || 
           path.hasPrefix("/files") ||
           path.hasPrefix("/chat") {
            throw Abort(.notFound)
        }
        
        // 静态资源让 FileMiddleware 处理
        let staticExtensions = [".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico"]
        if staticExtensions.contains(where: path.hasSuffix) {
            throw Abort(.notFound)
        }
        
        // 所有其他请求返回 index.html
        let indexPath = req.application.directory.publicDirectory + "index.html"
        return req.fileio.streamFile(at: indexPath)
    }
}
