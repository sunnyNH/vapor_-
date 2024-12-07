import Fluent
import Vapor

struct InitialData: AsyncMigration {
    func prepare(on database: Database) async throws {
        // 检查超级管理员角色是否已存在
        if try await Role.query(on: database)
            .filter(\.$code == "super_admin")
            .first() == nil {
            
            // 1. 创建超级管理员角色
            let superAdminRole = Role(
                name: "超级管理员",
                code: "super_admin",
                description: "系统最高权限管理员",
                status: 1
            )
            try await superAdminRole.save(on: database)
            
            // 2. 创建基础权限
            // 2.1 创建顶级菜单
            let menus = [
                Permission(name: "流量监控", code: "traffic_monitor", type: "menu", path: "/traffic", sort: 1, status: 1),
                Permission(name: "内容管理", code: "content_manage", type: "menu", path: "/content", sort: 2, status: 1),
                Permission(name: "创作者管理", code: "creator_manage", type: "menu", path: "/creator", sort: 3, status: 1),
                Permission(name: "运营工具", code: "operation_tools", type: "menu", path: "/operation", sort: 4, status: 1),
                Permission(name: "系统管理", code: "system_manage", type: "menu", path: "/system", sort: 5, status: 1)
            ]
            
            for menu in menus {
                if try await Permission.query(on: database)
                    .filter(\.$code == menu.code)
                    .first() == nil {
                    try await menu.save(on: database)
                }
            }
            
            // 2.2 创建子菜单和按钮权限
            let trafficMonitorId = try await Permission.query(on: database)
                .filter(\.$code == "traffic_monitor")
                .first()
                .map { $0.id! }
            
            let contentManageId = try await Permission.query(on: database)
                .filter(\.$code == "content_manage")
                .first()
                .map { $0.id! }
            
            let creatorManageId = try await Permission.query(on: database)
                .filter(\.$code == "creator_manage")
                .first()
                .map { $0.id! }
            
            let operationToolsId = try await Permission.query(on: database)
                .filter(\.$code == "operation_tools")
                .first()
                .map { $0.id! }
            
            let systemManageId = try await Permission.query(on: database)
                .filter(\.$code == "system_manage")
                .first()
                .map { $0.id! }
            
            // 创建子菜单
            let subMenus = [
                // 流量监控子菜单
                Permission(parentId: trafficMonitorId, name: "全局数据动态", code: "data_overview", type: "menu", path: "/traffic/overview", component: "data-overview", sort: 1, status: 1),
                Permission(parentId: trafficMonitorId, name: "推荐/搜索热度趋势", code: "trend_analysis", type: "menu", path: "/traffic/trend", component: "trend-analysis", sort: 2, status: 1),
                
                // 内容管理子菜单
                Permission(parentId: contentManageId, name: "内容列表/榜单", code: "content_list", type: "menu", path: "/content/list", component: "content-list", sort: 1, status: 1),
                Permission(parentId: contentManageId, name: "单个内容明细查询", code: "content_detail", type: "menu", path: "/content/detail", component: "content-detail", sort: 2, status: 1),
                
                // 创作者管理子菜单
                Permission(parentId: creatorManageId, name: "创作者列表", code: "creator_list", type: "menu", path: "/creator/list", component: "creator-list", sort: 1, status: 1),
                Permission(parentId: creatorManageId, name: "创作者信息查询", code: "creator_detail", type: "menu", path: "/creator/detail", component: "creator-detail", sort: 2, status: 1),
                
                // 运营工具子菜单
                Permission(parentId: operationToolsId, name: "Push管理", code: "push_manage", type: "menu", path: "/operation/push", component: "push-manage", sort: 1, status: 1),
                Permission(parentId: operationToolsId, name: "私信管理", code: "message_manage", type: "menu", path: "/operation/message", component: "message-manage", sort: 2, status: 1),
                Permission(parentId: operationToolsId, name: "Email通知", code: "email_notify", type: "menu", path: "/operation/email", component: "email-notify", sort: 3, status: 1),
                Permission(parentId: operationToolsId, name: "加量管理", code: "quantity_manage", type: "menu", path: "/operation/quantity", component: "quantity-manage", sort: 4, status: 1),
                Permission(parentId: operationToolsId, name: "邀请管理", code: "invitation_manage", type: "menu", path: "/operation/invitation", component: "invitation-manage", sort: 5, status: 1),
                Permission(parentId: operationToolsId, name: "邀请码", code: "invitation_code", type: "menu", path: "/operation/code", component: "invitation-code", sort: 6, status: 1),
                Permission(parentId: operationToolsId, name: "Banner管理", code: "banner_manage", type: "menu", path: "/operation/banner", component: "banner-manage", sort: 7, status: 1),
                Permission(parentId: operationToolsId, name: "专题管理", code: "topic_manage", type: "menu", path: "/operation/topic", component: "topic-manage", sort: 8, status: 1),
                Permission(parentId: operationToolsId, name: "活动管理", code: "activity_manage", type: "menu", path: "/operation/activity", component: "activity-manage", sort: 9, status: 1),
                
                // 系统管理子菜单
                Permission(parentId: systemManageId, name: "用户管理", code: "user_manage", type: "menu", path: "/system/user", component: "user-management", sort: 1, status: 1),
                Permission(parentId: systemManageId, name: "操作日志", code: "operation_log", type: "menu", path: "/system/log", component: "operation-log", sort: 2, status: 1)
            ]
            
            for subMenu in subMenus {
                try await subMenu.save(on: database)
            }
            
            // 3. 为超级管理员角色分配所有权限
            let allPermissions = try await Permission.query(on: database).all()
            for permission in allPermissions {
                let rolePermission = RolePermission(
                    roleId: superAdminRole.id!,
                    permissionId: permission.id!
                )
                try await rolePermission.save(on: database)
            }
            
            // 4. 创建超级管理员用户
            let superAdmin = User()
            superAdmin.$phone.value = "13800138000"  // 设置管理员手机号
            superAdmin.$password.value = try Bcrypt.hash("admin888M")
            superAdmin.$name.value = "超级管理员"
            superAdmin.$create_at.value = Int(Date().timeIntervalSince1970)  // 设置创建时间戳
            try await superAdmin.save(on: database)
            
            // 5. 为超级管理员用户分配超级管理员角色
            let userRole = UserRole(
                userId: superAdmin.id!,
                roleId: superAdminRole.id!
            )
            try await userRole.save(on: database)
        }
    }
    
    func revert(on database: Database) async throws {
        // 检查并清除初始数据
        if let superAdmin = try await User.query(on: database)
            .filter(\.$phone == "13800138000")
            .first() {
            try await UserRole.query(on: database)
                .filter(\.$user.$id == superAdmin.id!)
                .delete()
            try await superAdmin.delete(on: database)
        }
        
        if let superAdminRole = try await Role.query(on: database)
            .filter(\.$code == "super_admin")
            .first() {
            try await RolePermission.query(on: database)
                .filter(\.$role.$id == superAdminRole.id!)
                .delete()
            try await superAdminRole.delete(on: database)
        }
        
        // 删除所有初始权限
        try await Permission.query(on: database)
            .filter(\.$code ~~ ["traffic_monitor", "content_manage", "creator_manage", "operation_tools", "system_manage"])
            .delete()
    }
} 