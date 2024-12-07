# Vapor 后端项目

这是一个基于 Swift Vapor 框架的后端项目，前端页面使用 Element UI 渲染。

## 项目结构

```
.
├── Package.swift              # 包管理
├── Public                     # 存储文件夹
│   ├── db.sqlite              # SQLite 数据库文件
│   ├── admin.html             # 管理后台页面
│   ├── login.html             # 登录页面
│   ├── css/                  # 样式文件
│   ├── js/                   # JavaScript文件
│   └── assets/               # 静态资源文件
└── Sources
    └── App
        ├── Middleware/       # 中间件
        │   ├── AuthMiddleware.swift
        │   ├── LogMiddleware.swift
        │   └── OperationLogMiddleware.swift
        ├── basic/           # 基础层
        │   ├── dao/         # 数据访问层
        │   │   ├── Models/  # 数据模型
        │   │   │   ├── File.swift
        │   │   │   ├── OperationLog.swift
        │   │   │   ├── Permission.swift
        │   │   │   ├── Role.swift
        │   │   │   ├── RolePermission.swift
        │   │   │   ├── TokenBlacklist.swift
        │   │   │   ├── User.swift
        │   │   │   └── UserRole.swift
        │   │   ├── impl/   # DAO实现
        │   │   │   └── userdao.swift
        │   │   └── migrations/  # 数据库迁移
        │   └── utils/      # 工具类
        │       ├── Extensions.swift
        │       ├── MD5.swift
        │       ├── Request+Extension.swift
        │       └── Validators.swift
        ├── business/       # 业务逻辑层
        │   ├── OperationLogBusiness.swift
        │   └── UserBusiness.swift
        ├── web/           # Web层
        │   ├── controller/  # 控制器
        │   │   ├── ChatController.swift
        │   │   ├── FileController.swift
        │   │   ├── OperationLogController.swift
        │   │   ├── RoleController.swift
        │   │   ├── SignController.swift
        │   │   ├── UserController.swift
        │   │   └── WebController.swift
        │   └── viewmodel/   # 视图模型
        │       ├── ResponseModel.swift
        │       ├── chat_viewmodel.swift
        │       └── user_viewmodel.swift
        ├── configure.swift  # 配置文件
        └── main.swift       # 入口文件
```

## 最佳实践

### 模型定义规范

```swift
final class OperationLog: Model, Content, @unchecked Sendable {
    static let schema = "operation_logs"
    
    /// 主键
    @ID(custom: "id", generatedBy: .database)
    var id: Int?
    
    /// 创建时间
    @Field(key: "created_at")
    var createdAt: Int
}
```

### 项目分层说明

1. **展现层 (web)**
   - 负责 HTTP 接口定义
   - 处理请求参数验证
   - 调用业务逻辑层处理具体业务

2. **业务逻辑层 (business)**
   - 实现具体的业务场景逻辑
   - 可根据业务需求自定义目录结构

3. **基础框架层 (basic)**
   - 提供底层支持，包括数据访问、工具类等
   - 中间件实现：认证、拦截器等
   - 数据库操作封装
   - 通用工具和扩展方法

### 开发规范

1. 所有代码必须有清晰的中文注释
2. 遵循 Swift 标准命名规范
3. 控制器方法需要明确的输入输出文档
4. 复杂业务逻辑需要添加详细的实现说明
5. 数据库模型必须定义清晰的字段注释 # vapor_-
# vapor_-
# vapor_-
# vapor_-
# vapor_-
