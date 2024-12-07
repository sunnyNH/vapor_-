import Foundation
import Vapor

/// 验证错误
enum ValidationError: LocalizedError {
    case invalidPhone(String)
    case invalidPassword(String)
    case invalidUsername(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidPhone(let message): return message
        case .invalidPassword(let message): return message
        case .invalidUsername(let message): return message
        }
    }
}

/// 输入验证器
struct InputValidator {
    /// 验证手机号
    static func validatePhone(_ phone: String?) throws -> String {
        guard let phone = phone else {
            throw ValidationError.invalidPhone("手机号不能为空")
        }
        
        // 中国手机号格式验证（支持虚拟运营商）
        let phoneRegex = "^1[3-9]\\d{9}$"
        guard phone.range(of: phoneRegex, options: .regularExpression) != nil else {
            throw ValidationError.invalidPhone("请输入正确的手机号")
        }
        
        return phone
    }
    
    /// 验证密码
    static func validatePassword(_ password: String?) throws -> String {
        guard let password = password else {
            throw ValidationError.invalidPassword("密码不能为空")
        }
        
        // 密码长度检查
        guard password.count >= 8 && password.count <= 20 else {
            throw ValidationError.invalidPassword("密码长度必须在8-20个字符之间")
        }
        
        // 密码复杂度检查
        let uppercaseRegex = ".*[A-Z]+.*"
        let lowercaseRegex = ".*[a-z]+.*"
        let digitRegex = ".*[0-9]+.*"        
        guard password.range(of: uppercaseRegex, options: .regularExpression) != nil else {
            throw ValidationError.invalidPassword("密码必须包含至少一个大写字母")
        }
        
        guard password.range(of: lowercaseRegex, options: .regularExpression) != nil else {
            throw ValidationError.invalidPassword("密码必须包含至少一个小写字母")
        }
        
        guard password.range(of: digitRegex, options: .regularExpression) != nil else {
            throw ValidationError.invalidPassword("密码必须包含至少一个数字")
        }
        return password
    }
    
    /// 验证用户名
    static func validateUsername(_ username: String?) throws -> String {
        guard let username = username else {
            throw ValidationError.invalidUsername("用户名不能为空")
        }
        
        // 长度检查
        guard username.count >= 2 && username.count <= 20 else {
            throw ValidationError.invalidUsername("用户名长度必须在2-20个字符之间")
        }
        
        // 格式检查：只允许中文、字母、数字和下划线
        let usernameRegex = "^[\\u4e00-\\u9fa5a-zA-Z0-9_]+$"
        guard username.range(of: usernameRegex, options: .regularExpression) != nil else {
            throw ValidationError.invalidUsername("用户名只能包含中文、字母、数字和下划线")
        }
        
        return username
    }
}

// MARK: - Request 扩展
extension Request {
    /// 获取并验证手机号
    func validatedPhone() throws -> String {
        try InputValidator.validatePhone(self.params.phone)
    }
    
    /// 获取并验证密码
    func validatedPassword() throws -> String {
        try InputValidator.validatePassword(self.params.password)
    }
    
    /// 获取并验证用户名
    func validatedUsername() throws -> String {
        try InputValidator.validateUsername(self.params.username)
    }
} 