import Fluent
import Vapor

final class RolePermission: Model, @unchecked Sendable {
    // 表名
    static let schema = "role_permissions"
    
    // 主键
    @ID(custom: "id", generatedBy: .database)
    var id: Int?
    
    // 角色ID
    @Parent(key: "role_id")
    var role: Role
    
    // 权限ID
    @Parent(key: "permission_id")
    var permission: Permission
    
    // 创建时间
    @Field(key: "created_at")
    var createdAt: Int
    
    // 空构造函数
    init() { }
    
    // 构造函数
    init(id: Int? = nil,
         roleId: Role.IDValue,
         permissionId: Permission.IDValue) {
        self.id = id
        self.$role.id = roleId
        self.$permission.id = permissionId
        self.createdAt = Int(Date().timeIntervalSince1970)
    }
} 