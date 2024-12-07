import Fluent

struct CreateFile: AsyncMigration {
    func prepare(on database: Database) async throws {
        try await database.schema("files")
            .field("id", .int, .identifier(auto: true))
            .field("name", .string, .required)
            .field("original_name", .string, .required)
            .field("size", .int64, .required)
            .field("mime_type", .string, .required)
            .field("upload_time", .datetime, .required)
            .field("user_id", .uuid, .required, .references("users", "id", onDelete: .cascade))
            .create()
    }

    func revert(on database: Database) async throws {
        try await database.schema("files").delete()
    }
} 