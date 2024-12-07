import Vapor
import Fluent

struct UserBusiness {
    /// 修改用户信息
    func updateProfile(req: Request, user: User) async throws -> User {
        var isChange = false
        // name
        if let name: String = req.params.name {
            user.name = name
            isChange = true
        }
        // avatar
        if let avatar: String = req.params.avatar {
            user.avatar = avatar
            isChange = true
        }
        // age
        if let age: Int = req.params.age {
            user.age = age
            isChange = true
        }
        // gender
        if let gender: Int = req.params.gender {
            user.gender = gender
            isChange = true
        }
        // overview
        if let overview: String = req.params.overview {
            user.overview = overview
            isChange = true
        }
        // address
        if let address: String = req.params.address {
            user.address = address
            isChange = true
        }
        // 如果修改了信息，则保存
        if isChange {
            try await user.save(on: req.db)
        }
        return user
    }
} 
