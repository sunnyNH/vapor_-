import Fluent

struct CreateTokenBlacklist: AsyncMigration {
    func prepare(on database: Database) async throws {
        try await database.schema(TokenBlacklist.schema)
            .field("id", .int, .identifier(auto: true))
            .field("token", .string, .required)
            .field("expired_at", .datetime, .required)
            .unique(on: "token")
            .create()
    }
    
    func revert(on database: Database) async throws {
        try await database.schema(TokenBlacklist.schema).delete()
    }
} 