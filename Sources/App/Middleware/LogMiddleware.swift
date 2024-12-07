import Vapor
import Foundation

struct LogMiddleware: AsyncMiddleware {
    // 日期格式化器
    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss.SSS"
        return formatter
    }()
    
    func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response {
        let start = Date()
        let requestInfo = extractRequestInfo(from: request)
        
        // 记录请求日志
        logRequest(requestInfo: requestInfo, request: request)
        
        do {
            let response = try await next.respond(to: request)
            let duration = Date().timeIntervalSince(start)
            
            // 记录响应日志
            logResponse(response: response, duration: duration, request: request)
            
            return response
        } catch {
            // 记录错误日志
            logError(error: error, requestInfo: requestInfo, request: request)
            throw error
        }
    }
    
    // MARK: - Private Methods
    
    private func extractRequestInfo(from request: Request) -> RequestInfo {
        // 获取各种可能的 IP 地址
        let forwardedFor = request.headers.first(name: "X-Forwarded-For")    // 请求经过的所有代理服务器的 IP 列表，第一个为客户端真实 IP
        let realIP = request.headers.first(name: "X-Real-IP")                // Nginx 代理传递的客户端真实 IP
        let remoteIP = request.remoteAddress?.hostname                       // 直接与服务器建立 TCP 连接的客户端 IP
        
        // 按优先级获取客户端 IP：
        // 1. X-Forwarded-For：一般是最真实的客户端 IP（如果经过代理）
        // 2. X-Real-IP：Nginx 设置的真实 IP
        // 3. remoteIP：直连 IP（如果没有代理，这个就是真实 IP）
        let clientIP = forwardedFor ?? realIP ?? remoteIP ?? "unknown"
        
        // 如果存在 X-Forwarded-For，说明经过代理，那么直连 IP 就是代理 IP
        let proxyIP = forwardedFor != nil ? (realIP ?? remoteIP ?? "无") : "无"
        
        let userAgent = request.headers.first(name: .userAgent) ?? "unknown"
        let parameters = getRequestParameters(request)
        let contentType = request.headers.contentType?.description ?? "无"
        
        // 获取用户 UUID
        let token = request.cookies["dc_0"]?.string ?? request.headers.bearerAuthorization?.token
        var userUUID = "未登录"
        if let validToken = token {
            if let payload = try? request.jwt.verify(validToken, as: UserPayload.self) {
                userUUID = payload.uuid
            }
        }
        
        return RequestInfo(
            method: request.method,
            url: request.url,
            clientIP: clientIP,
            proxyIP: proxyIP,
            userAgent: userAgent,
            parameters: parameters,
            contentType: contentType,
            userUUID: userUUID
        )
    }
    
    private func getRequestParameters(_ request: Request) -> String? {
        if request.method == .GET {
            return request.url.query
        }
        
        guard let contentType = request.headers.contentType else { return nil }
        
        switch (contentType.type, contentType.subType) {
        case ("application", "json"):
            return try? request.content
                .decode([String: AnyDecodable].self)
                .description
        case ("application", "x-www-form-urlencoded"):
            return try? request.content
                .decode([String: String].self)
                .description
        case ("multipart", "form-data"):
            return try? request.content
                .decode([String: String].self)
                .map { "\($0): \($1)" }
                .joined(separator: ", ")
        default:
            return nil
        }
    }
    
    private func logRequest(requestInfo: RequestInfo, request: Request) {
        let userInfo = requestInfo.userUUID == "未登录" ? "未登录用户" : "用户(\(requestInfo.userUUID))"
        let requestLog = """
        \(ConsoleColor.green)⬇️  开始请求\(ConsoleColor.reset) [\(currentTimeString)]
        \(ConsoleColor.blue)\(userInfo)\(ConsoleColor.reset)
        \(ConsoleColor.cyan)\(requestInfo.method) \(requestInfo.url)\(ConsoleColor.reset)
        客户端: \(ConsoleColor.gray)\(requestInfo.clientIP)\(ConsoleColor.reset)
        代理IP: \(ConsoleColor.gray)\(requestInfo.proxyIP)\(ConsoleColor.reset)
        设备: \(ConsoleColor.gray)\(requestInfo.userAgent)\(ConsoleColor.reset)
        Content-Type: \(ConsoleColor.gray)\(requestInfo.contentType)\(ConsoleColor.reset)
        参数: \(ConsoleColor.gray)\(requestInfo.parameters ?? "无")\(ConsoleColor.reset)
        
        """
        request.logger.info("\(requestLog)")
    }
    
    private func logResponse(response: Response, duration: TimeInterval, request: Request) {
        let responseContent = response.body.buffer.map { String(buffer: $0) } ?? "无"
        
        let responseLog = """
        \(ConsoleColor.yellow)⬆️  结束请求\(ConsoleColor.reset) [\(currentTimeString)]
        耗时: \(ConsoleColor.gray)\(String(format: "%.3f", duration))s\(ConsoleColor.reset)
        状态: \(ConsoleColor.cyan)\(response.status.code)\(ConsoleColor.reset)
        响应: \(ConsoleColor.gray)\(responseContent)\(ConsoleColor.reset)

        """
        request.logger.info("\(responseLog)")
    }
    
    private func logError(error: Error, requestInfo: RequestInfo, request: Request) {
        let errorLog = """
        \(ConsoleColor.red)❌ 结束请求\(ConsoleColor.reset) [\(currentTimeString)] 
        \(ConsoleColor.cyan)\(requestInfo.method) \(requestInfo.url)\(ConsoleColor.reset)
        来源: \(ConsoleColor.gray)\(requestInfo.clientIP)\(ConsoleColor.reset)
        设备: \(ConsoleColor.gray)\(requestInfo.userAgent)\(ConsoleColor.reset)
        错误: \(ConsoleColor.red)\(error)\(ConsoleColor.reset)

        """
        request.logger.error("\(errorLog)")
    }
    
    private var currentTimeString: String {
        dateFormatter.string(from: Date())
    }
}

// MARK: - Supporting Types

private struct RequestInfo {
    let method: HTTPMethod
    let url: URI
    let clientIP: String
    let proxyIP: String
    let userAgent: String
    let parameters: String?
    let contentType: String
    let userUUID: String
}

private struct AnyDecodable: Decodable {
    var value: Any
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let string = try? container.decode(String.self) {
            value = string
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let dict = try? container.decode([String: AnyDecodable].self) {
            value = dict.mapValues { $0.value }
        } else if let array = try? container.decode([AnyDecodable].self) {
            value = array.map { $0.value }
        } else {
            value = "无法解析的数据类型"
        }
    }
}

private struct ConsoleColor {
    static let reset = "\u{001B}[0m"
    static let green = "\u{001B}[32;1m"      // 加亮的绿色
    static let yellow = "\u{001B}[33;1m"     // 加亮的黄色
    static let red = "\u{001B}[31;1m"        // 加亮的红色
    static let cyan = "\u{001B}[36;1m"       // 加亮的青色
    static let gray = "\u{001B}[38;5;245m"   // 更柔和的灰色
    static let blue = "\u{001B}[34;1m"       // 加亮的蓝色
} 