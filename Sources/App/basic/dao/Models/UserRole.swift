import Fluent
import Vapor

final class UserRole: Model, @unchecked Sendable {
    // 表名
    static let schema = "user_roles"
    
    // 主键
    @ID(custom: "id", generatedBy: .database)
    var id: Int?
    
    // 用户ID
    @Parent(key: "user_id")
    var user: User
    
    // 角色ID
    @Parent(key: "role_id")
    var role: Role
    
    // 创建时间
    @Field(key: "created_at")
    var createdAt: Int
    
    // 空构造函数
    init() { }
    
    // 构造函数
    init(id: Int? = nil,
         userId: User.IDValue,
         roleId: Role.IDValue) {
        self.id = id
        self.$user.id = userId
        self.$role.id = roleId
        self.createdAt = Int(Date().timeIntervalSince1970)
    }
} 