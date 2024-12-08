import Foundation
import Vapor
import Crypto // 添加 Vapor 的 Crypto 模块导入

// MARK: - Abort 扩展
extension Abort {
    static func badRequest(_ message: String) -> Abort {
        return Abort(HTTPResponseStatus.badRequest, reason: message)
    }
}