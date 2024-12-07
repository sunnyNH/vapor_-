import Vapor

struct ChatController: RouteCollection {
    // API 配置
    private let baseURL = "https://qianfan.baidubce.com/v2/app"
    private let token = "bce-v3/ALTAK-4go4EjDWROtNyVIsbWDMX/b4d67b2474352dc33fc33578d55259d5425b38c8"
    private let appId = "50e150f7-0d9a-4b06-aced-474e1a975c2f"
    
    func boot(routes: RoutesBuilder) throws {
        // 添加认证中间件
        let authMiddleware = AuthMiddleware()
        let auth = routes.grouped(authMiddleware)
        
        // 所有聊天相关的路由都需要认证
        let chat = auth.grouped("api", "conversation")
        chat.post(use: createConversation)
        chat.post("runs", use: handleChat)
    }
    
    // 创建会话
    func createConversation(req: Request) async throws -> ClientResponse {
        // 准备请求
        let uri = URI(string: "\(baseURL)/conversation")
        
        var headers = HTTPHeaders()
        headers.add(name: "Authorization", value: "Bearer \(token)")
        headers.add(name: "Content-Type", value: "application/json")
        
        let body = ["app_id": appId]
        
        // 发送请求并直接返回响应
        return try await req.client.post(uri, headers: headers) { req in
            try req.content.encode(body)
        }
    }
    
    // 处理聊天
    func handleChat(req: Request) async throws -> ClientResponse {
        // 解码请求
        let chatRequest = try req.content.decode(ChatRequest.self)
        req.logger.info("收到客户端请求: \(chatRequest)")
        
        guard let conversationId = chatRequest.conversationId else {
            throw Abort(.badRequest, reason: "缺少会话ID")
        }
        
        // 准备请求
        let uri = URI(string: "\(baseURL)/conversation/runs")
        
        var headers = HTTPHeaders()
        headers.add(name: "Authorization", value: "Bearer \(token)")
        headers.add(name: "Content-Type", value: "application/json")
        
        let body = ChatRequestBody(
            appId: appId,
            conversationId: conversationId,
            query: chatRequest.query,
            stream: false
        )
        
        // 发送请求并直接返回响应
        return try await req.client.post(uri, headers: headers) { req in
            try req.content.encode(body)
        }
    }
}

struct ChatRequestBody: Content {
    let appId: String
    let conversationId: String
    let query: String
    let stream: Bool
    
    enum CodingKeys: String, CodingKey {
        case appId = "app_id"
        case conversationId = "conversation_id"
        case query, stream
    }
} 