import Fluent
import FluentSQLiteDriver
import Vapor
import JWT

public func configure(_ app: Application) throws {
    // 配置 JWT 签名
    // 注意：在生产环境中应该使用环境变量存储密钥
    // 例如：Environment.get("JWT_SECRET") ?? "default-secret"
    let jwtSecret = Environment.get("JWT_SECRET") ?? "default-secret"
    app.jwt.signers.use(.hs256(key: jwtSecret))
    // 配置 SQLite 数据库
    database(app)
    // 配置静态文件服务
    // 使得 Public 目录下的文件可以通过 HTTP 访问
    app.middleware = .init()
    app.middleware.use(FileMiddleware(publicDirectory: app.directory.publicDirectory))
    app.middleware.use(ErrorMiddleware.default(environment: app.environment))
    
    // 确保使用 0.0.0.0 而不是 localhost
    app.http.server.configuration.hostname = "0.0.0.0"
    // 运行数据库迁移
    try app.autoMigrate().wait()
    // 注册所有路由
    try setupRoutes(app)
    // 添加日志中间件
    app.middleware.use(LogMiddleware())
} 
/// 配置数据库
func database(_ app: Application) {
    // 使用 SQLite 数据库
    app.databases.use(.sqlite(.file("Public/db.sqlite")), as: .sqlite)
    
    // 添加用户表迁移
    app.migrations.add(CreateUser())
    app.migrations.add(CreateTokenBlacklist())
    app.migrations.add(CreateFile())
    
    // 添加权限相关的迁移
    app.migrations.add(CreateRole())
    app.migrations.add(CreatePermission())
    app.migrations.add(CreateUserRole())
    app.migrations.add(CreateRolePermission())
    
    // 添加初始数据迁移
    app.migrations.add(InitialData())
}

func setupRoutes(_ app: Application) throws {
    // ... 其他路由 ...
    try app.register(collection: SignController())
    try app.register(collection: UserController())
    try app.register(collection: ChatController())
    try app.register(collection: WebController())
    try app.register(collection: FileController())
}

func setupMigrations(_ app: Application) throws {
    // ... 其他迁移 ...
    app.migrations.add(CreateFile())
}
