import Fluent
import Vapor
import Crypto

/// 用户模型
final class User: Model, Content, Authenticatable, @unchecked Sendable {
    static let schema = "users"
    
    /// id
    @ID(custom: "id", generatedBy: .database)
    var id: Int?
    
    /// uuid
    @Field(key: "uuid")
    var uuid: String
    
    /// 电话
    @Field(key: "phone")
    var phone: String
    
    /// 密码
    @Field(key: "password")
    var password: String
    
    /// 姓名
    @Field(key: "name")
    var name: String?
    
    /// 头像
    @Field(key: "avatar")
    var avatar: String?
    
    /// 年龄
    @Field(key: "age")
    var age: Int?
    
    /// 性别
    @Field(key: "gender")
    var gender: Int?
    
    /// 简介
    @Field(key: "overview")
    var overview: String?
    
    /// 地址
    @Field(key: "address")
    var address: String?
    
    /// 创建时间
    @Field(key: "create_at")
    var create_at: Int
    
    init() {
        createUUid()
    }
    
    init(phone: String) {
        createUUid()
        self.phone = phone
        create_at = Int(Date().timeIntervalSince1970)
    }
    
    /// 生成UUID
    private func createUUid() {
        uuid = UUID().uuidString.md5
    }
    
    /// 设置密码（加密）
    func setPassword(_ password: String) throws {
        self.password = try Bcrypt.hash(password, cost: 12)
    }
    
    /// 验证密码
    func verifyPassword(_ password: String) throws -> Bool {
        try Bcrypt.verify(password, created: self.password)
    }
}