import Fluent

struct CreateRole: AsyncMigration {
    func prepare(on database: Database) async throws {
        try await database.schema("roles")
            .field("id", .int, .identifier(auto: true))
            .field("name", .string, .required)
            .field("code", .string, .required)
            .field("description", .string)
            .field("status", .int, .required, .sql(.default(1)))
            .field("created_at", .int, .required)
            .field("updated_at", .int, .required)
            .unique(on: "name")
            .unique(on: "code")
            .create()
    }

    func revert(on database: Database) async throws {
        try await database.schema("roles").delete()
    }
} 