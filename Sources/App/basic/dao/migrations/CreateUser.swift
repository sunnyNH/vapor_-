import Fluent

struct CreateUser: AsyncMigration {
    func prepare(on database: Database) async throws {
        try await database.schema("users")
            .field("id", .int, .identifier(auto: true))
            .field("uuid", .string, .required)
            .field("phone", .string, .required)
            .field("password", .string, .required)
            .field("name", .string)
            .field("avatar", .string)
            .field("age", .int)
            .field("gender", .int)
            .field("overview", .string)
            .field("address", .string)
            .field("create_at", .int, .required)
            .unique(on: "phone")
            .unique(on: "uuid")
            .create()
    }

    func revert(on database: Database) async throws {
        try await database.schema("users").delete()
    }
} 