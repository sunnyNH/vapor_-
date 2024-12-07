
import Foundation
import Vapor

protocol ModelPublishable {
    associatedtype Public: Content
    func asPublic(_ req: Request) async throws -> Public
}

struct ResponseModel<T: Content>: Content {
    let status: Bool
    let data: T?
    let error: String?
    let nextUrl: String?
}

var successResponse: ResponseModel<String> {
    return ResponseModel<String>(status: true, data: nil, error: "", nextUrl: nil)
}
var errorResponse: ResponseModel<String> {
    return ResponseModel<String>(status: false, data: nil, error: "请求错误", nextUrl: nil)
}
extension Content {
    
    func successResponse(_ nextUrl: String? = nil) -> ResponseModel<Self> {
        ResponseModel(status: true, data: self, error: "", nextUrl: nextUrl)
    }
    func errorResponse(_ error: String) -> ResponseModel<Self> {
        ResponseModel(status: false, data: nil, error: error, nextUrl: nil)
    }
    var successResponse: ResponseModel<Self> {
        ResponseModel(status: true, data: self, error: "", nextUrl: nil)
    }
}
