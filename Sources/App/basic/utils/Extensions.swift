import Foundation
import Vapor
import Crypto // 添加 Vapor 的 Crypto 模块导入

// MARK: - Abort 扩展
extension Abort {
    static func badRequest(_ message: String) -> Abort {
        return Abort(HTTPResponseStatus.badRequest, reason: message)
    }
}

// MARK: - String 扩展
extension String {
    /// 验证是否为手机号
    var isPhone: Bool {
        let pattern = "^1[3-9]\\d{9}$"
        let predicate = NSPredicate(format: "SELF MATCHES %@", pattern)
        return predicate.evaluate(with: self)
    }
}