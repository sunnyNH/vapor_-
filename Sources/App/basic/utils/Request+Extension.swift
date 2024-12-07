import Fluent
import Foundation
import Vapor

extension Request {
    /// 使用动态成员查找来访问请求参数，支持自动类型推断
    ///
    /// 按照以下优先顺序查找参数:
    /// 1. URL 路径参数 (parameters)
    /// 2. URL 查询参数 (query)
    /// 3. 请求体 (content)
    ///
    /// Example:
    /// ```swift
    /// // 获取字符串参数
    /// let name: String? = req.params.name
    /// 
    /// // 获取整型参数
    /// let age: Int? = req.params.age
    /// 
    /// // 获取 UUID 参数
    /// let id: UUID? = req.params.id
    /// ```
    var params: RequestQuery { RequestQuery(request: self) }
}

/// 请求参数查询结构体
///
/// 按照以下优先顺序查找参数:
/// 1. URL 路径参数 (parameters)
/// 2. URL 查询参数 (query)
/// 3. 请求体 (content)
@dynamicMemberLookup
struct RequestQuery {
    let request: Request
    
    /// 动态成员查找下标访问器
    /// - Parameter key: 参数键名
    /// - Returns: 指定类型的可选值
    subscript<T: Decodable>(dynamicMember key: String) -> T? {
        if let value = request.parameters.get(key) as? T {
            return value
        }
        if let value = try? request.query.get(T.self, at: key) {
            return value
        }
        return try? request.content.get(T.self, at: key)
    }
}
