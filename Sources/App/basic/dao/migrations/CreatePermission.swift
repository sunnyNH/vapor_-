import Fluent

struct CreatePermission: AsyncMigration {
    func prepare(on database: Database) async throws {
        try await database.schema("permissions")
            .field("id", .int, .identifier(auto: true))
            .field("parent_id", .int)
            .field("name", .string, .required)
            .field("code", .string, .required)
            .field("type", .string, .required)
            .field("path", .string)
            .field("component", .string)
            .field("icon", .string)
            .field("sort", .int, .required, .sql(.default(0)))
            .field("status", .int, .required, .sql(.default(1)))
            .field("created_at", .int, .required)
            .field("updated_at", .int, .required)
            .unique(on: "code")
            .create()
    }

    func revert(on database: Database) async throws {
        try await database.schema("permissions").delete()
    }
} 