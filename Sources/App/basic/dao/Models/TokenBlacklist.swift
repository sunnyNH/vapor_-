import Fluent
import Vapor

final class TokenBlacklist: Model, Content, @unchecked Sendable {
    static let schema = "token_blacklist"
    
    @ID(custom: "id", generatedBy: .database)
    var id: Int?
    
    @Field(key: "token")
    var token: String
    
    @Field(key: "expired_at")
    var expiredAt: Date
    
    init() {}
    
    init(token: String, expiredAt: Date) {
        self.token = token
        self.expiredAt = expiredAt
    }
} 