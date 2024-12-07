import Fluent
import Vapor

final class Role: Model, Content, @unchecked Sendable {
    // 表名
    static let schema = "roles"
    
    // 主键
    @ID(custom: "id", generatedBy: .database)
    var id: Int?
    
    // 角色名称
    @Field(key: "name")
    var name: String
    
    // 角色标识
    @Field(key: "code")
    var code: String
    
    // 角色描述
    @OptionalField(key: "description")
    var description: String?
    
    // 状态：1-启用，0-禁用
    @Field(key: "status")
    var status: Int
    
    // 创建时间
    @Field(key: "created_at")
    var createdAt: Int
    
    // 更新时间
    @Field(key: "updated_at")
    var updatedAt: Int
    
    // 与用户的多对多关系
    @Siblings(through: UserRole.self, from: \.$role, to: \.$user)
    var users: [User]
    
    // 与权限的多对多关系
    @Siblings(through: RolePermission.self, from: \.$role, to: \.$permission)
    var permissions: [Permission]
    
    // 空构造函数
    init() { }
    
    // 构造函数
    init(id: Int? = nil,
         name: String,
         code: String,
         description: String? = nil,
         status: Int = 1) {
        self.id = id
        self.name = name
        self.code = code
        self.description = description
        self.status = status
        self.createdAt = Int(Date().timeIntervalSince1970)
        self.updatedAt = Int(Date().timeIntervalSince1970)
    }
} 