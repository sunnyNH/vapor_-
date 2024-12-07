import Fluent
import Vapor

final class Permission: Model, Content, @unchecked Sendable{
    // 表名
    static let schema = "permissions"
    
    // 主键
    @ID(custom: "id", generatedBy: .database)
    var id: Int?
    
    // 父级ID
    @OptionalField(key: "parent_id")
    var parentId: Int?
    
    // 权限名称
    @Field(key: "name")
    var name: String
    
    // 权限标识
    @Field(key: "code")
    var code: String
    
    // 权限类型：menu-菜单，button-按钮
    @Field(key: "type")
    var type: String
    
    // 前端路由路径
    @OptionalField(key: "path")
    var path: String?
    
    // 前端组件
    @OptionalField(key: "component")
    var component: String?
    
    // 图标
    @OptionalField(key: "icon")
    var icon: String?
    
    // 排序
    @Field(key: "sort")
    var sort: Int
    
    // 状态：1-启用，0-禁用
    @Field(key: "status")
    var status: Int
    
    // 创建时间
    @Field(key: "created_at")
    var createdAt: Int
    
    // 更新时间
    @Field(key: "updated_at")
    var updatedAt: Int
    
    // 与角色的多对多关系
    @Siblings(through: RolePermission.self, from: \.$permission, to: \.$role)
    var roles: [Role]
    
    // 空构造函数
    init() { }
    
    // 构造函数
    init(id: Int? = nil,
         parentId: Int? = nil,
         name: String,
         code: String,
         type: String,
         path: String? = nil,
         component: String? = nil,
         icon: String? = nil,
         sort: Int = 0,
         status: Int = 1) {
        self.id = id
        self.parentId = parentId
        self.name = name
        self.code = code
        self.type = type
        self.path = path
        self.component = component
        self.icon = icon
        self.sort = sort
        self.status = status
        self.createdAt = Int(Date().timeIntervalSince1970)
        self.updatedAt = Int(Date().timeIntervalSince1970)
    }
} 