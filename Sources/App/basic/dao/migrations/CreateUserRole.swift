import Fluent

struct CreateUserRole: AsyncMigration {
    func prepare(on database: Database) async throws {
        try await database.schema("user_roles")
            .field("id", .int, .identifier(auto: true))
            .field("user_id", .uuid, .required, .references("users", "id", onDelete: .cascade))
            .field("role_id", .int, .required, .references("roles", "id", onDelete: .cascade))
            .field("created_at", .int, .required)
            .unique(on: "user_id", "role_id")
            .create()
    }

    func revert(on database: Database) async throws {
        try await database.schema("user_roles").delete()
    }
} 