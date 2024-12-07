import Vapor

struct ChatRequest: Content {
    let query: String
    let conversationId: String?
    
    enum CodingKeys: String, CodingKey {
        case query
        case conversationId = "conversation_id"
    }
}

struct ChatResponse: Content {
    let result: String
    let conversationId: String
    let errorCode: Int?
    let errorMsg: String?
    
    enum CodingKeys: String, CodingKey {
        case result
        case conversationId = "conversation_id"
        case errorCode = "error_code"
        case errorMsg = "error_msg"
    }
} 