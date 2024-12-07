import Fluent
import Vapor

final class File: Model, Content {
    static let schema = "files"
    
    @ID(custom: "id", generatedBy: .database)
    var id: Int?
    
    @Field(key: "name")
    var name: String
    
    @Field(key: "original_name")
    var originalName: String
    
    @Field(key: "size")
    var size: Int64
    
    @Field(key: "mime_type")
    var mimeType: String
    
    @Field(key: "upload_time")
    var uploadTime: Date
    
    @Parent(key: "user_id")
    var user: User
    
    init() {}
    
    init(id: Int? = nil,
         name: String,
         originalName: String,
         size: Int64,
         mimeType: String,
         uploadTime: Date = Date(),
         userID: User.IDValue) {
        self.id = id
        self.name = name
        self.originalName = originalName
        self.size = size
        self.mimeType = mimeType
        self.uploadTime = uploadTime
        self.$user.id = userID
    }
}

extension File {
    struct Public: Content {
        let id: Int?
        let name: String
        let originalName: String
        let size: Int64
        let mimeType: String
        let uploadTime: Date
    }
    
    func asPublic() throws -> Public {
        return Public(
            id: id,
            name: name,
            originalName: originalName,
            size: size,
            mimeType: mimeType,
            uploadTime: uploadTime
        )
    }
} 