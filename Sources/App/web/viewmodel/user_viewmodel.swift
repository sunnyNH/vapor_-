import Vapor
import Fluent


extension User: ModelPublishable {
    struct Public: Content {
        let uuid: String
        let name: String
        let avatar: String
        let overview: String
        let address: String
        let age: Int
        let gender: Int
        let phone: String
    }
    func asPublic(_ req: Request) -> Public {
        return Public(
            uuid: uuid,
            name: name ?? "",
            avatar: avatar ?? "",
            overview: overview ?? "",
            address: address ?? "",
            age: age ?? 0,
            gender: gender ?? 0,
            phone: phone
        )
    }
}
