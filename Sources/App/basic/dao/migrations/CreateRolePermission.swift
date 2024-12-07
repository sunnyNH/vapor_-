import Fluent

struct CreateRolePermission: AsyncMigration {
    func prepare(on database: Database) async throws {
        try await database.schema("role_permissions")
            .field("id", .int, .identifier(auto: true))
            .field("role_id", .int, .required, .references("roles", "id", onDelete: .cascade))
            .field("permission_id", .int, .required, .references("permissions", "id", onDelete: .cascade))
            .field("created_at", .int, .required)
            .unique(on: "role_id", "permission_id")
            .create()
    }

    func revert(on database: Database) async throws {
        try await database.schema("role_permissions").delete()
    }
} 