import Vapor
import Fluent

struct FileController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        let files = routes.grouped("files")
        let auth = files.grouped(AuthMiddleware())
        
        // 文件列表
        auth.get("list", use: list)
        // 文件上传 - 设置最大允许 100MB
        auth.on(.POST, "upload", body: .collect(maxSize: "100mb"), use: upload)
        // 文件下载
        auth.get("download", ":fileID", use: download)
        // 文件删除
        auth.delete(":fileID", use: delete)
        // 头像上传 - 设置最大允许 10MB
        auth.on(.POST, "avatar", body: .collect(maxSize: "10mb"), use: uploadAvatar)
    }
    
    // 获取文件列表
    func list(req: Request) async throws -> ResponseModel<[File.Public]> {
        guard let user = try? req.auth.require(User.self) else {
            throw Abort(.unauthorized)
        }
        
        let userID = try user.requireID()
        let files = try await File.query(on: req.db)
            .filter(\.$user.$id == userID)
            .sort(\.$uploadTime, .descending)
            .all()
        
        return try files.map { try $0.asPublic() }.successResponse
    }
    
    // 上传文件
    func upload(req: Request) async throws -> ResponseModel<File.Public> {
        do {
            guard let user = try? req.auth.require(User.self) else {
                throw Abort(.unauthorized, reason: "User not authenticated")
            }
            
            // 获取上传的文件
            let file = try req.content.get(Vapor.File.self, at: "file")
            
            req.logger.info("Received file: \(file.filename), size: \(file.data.readableBytes)")
            
            // 创建文件保存目录
            let uploadDir = req.application.directory.publicDirectory + "uploads/"
            try FileManager.default.createDirectory(atPath: uploadDir, withIntermediateDirectories: true)
            
            // 生成唯一文件名
            let fileExt = file.filename.components(separatedBy: ".").last ?? ""
            let fileName = UUID().uuidString + (fileExt.isEmpty ? "" : "." + fileExt)
            let filePath = uploadDir + fileName
            
            req.logger.info("Saving file to: \(filePath)")
            
            // 写入文件
            try await req.fileio.writeFile(file.data, at: filePath)
            
            // 创建文件记录
            let fileModel = File(
                name: fileName,
                originalName: file.filename,
                size: Int64(file.data.readableBytes),
                mimeType: file.contentType?.serialize() ?? "application/octet-stream",
                userID: try user.requireID()
            )
            
            try await fileModel.save(on: req.db)
            req.logger.info("File saved to database with name: \(fileName)")
            
            return try fileModel.asPublic().successResponse
        } catch {
            req.logger.error("File upload error: \(error)")
            throw error
        }
    }
    
    // 下载文件
    func download(req: Request) async throws -> Response {
        guard let fileID = req.parameters.get("fileID", as: Int.self) else {
            throw Abort(.badRequest, reason: "Invalid file ID")
        }
        
        // 获取文件记录
        guard let file = try await File.find(fileID, on: req.db) else {
            throw Abort(.notFound, reason: "File not found")
        }
        
        // 检查文件是否存在
        let filePath = "Public/uploads/" + file.name
        guard FileManager.default.fileExists(atPath: filePath) else {
            throw Abort(.notFound, reason: "File not found")
        }
        
        // 设置响应头
        let response = req.fileio.streamFile(at: filePath)
        
        // 解析 MIME 类型
        let parts = file.mimeType.split(separator: "/")
        if parts.count == 2 {
            response.headers.contentType = HTTPMediaType(type: String(parts[0]), subType: String(parts[1]))
        } else {
            response.headers.contentType = HTTPMediaType(type: "application", subType: "octet-stream")
        }
        
        // 如果是图片，则设置为内联显示，否则设置为下载
        if file.mimeType.hasPrefix("image/") {
            response.headers.contentDisposition = .init(.inline, filename: file.originalName)
        } else {
            response.headers.contentDisposition = .init(.attachment, filename: file.originalName)
        }
        
        return response
    }
    
    // 删除文件
    func delete(req: Request) async throws -> ResponseModel<String> {
        do {
            let fileIDString = req.parameters.get("fileID") ?? ""
            req.logger.info("Received file ID: \(fileIDString)")
            
            guard let fileID = Int(fileIDString) else {
                req.logger.error("Invalid file ID format: \(fileIDString)")
                throw Abort(.badRequest, reason: "Invalid file ID format")
            }
            
            // 获取当前用户
            guard let user = try? req.auth.require(User.self) else {
                req.logger.error("User not authenticated")
                throw Abort(.unauthorized)
            }
            
            // 获取文件记录
            let userID = try user.requireID()
            guard let file = try await File.query(on: req.db)
                .filter(\.$id == fileID)
                .filter(\.$user.$id == userID)
                .first() else {
                req.logger.error("File not found or no permission: ID=\(fileID), userID=\(userID)")
                throw Abort(.notFound, reason: "File not found or no permission")
            }
            
            req.logger.info("Deleting file: \(file.name)")
            
            // 删除物理文件
            let filePath = "Public/uploads/" + file.name
            if FileManager.default.fileExists(atPath: filePath) {
                try FileManager.default.removeItem(atPath: filePath)
                req.logger.info("Physical file deleted: \(filePath)")
            } else {
                req.logger.warning("Physical file not found: \(filePath)")
            }
            
            // 删除数据库记录
            try await file.delete(on: req.db)
            req.logger.info("Database record deleted for file: \(file.name)")
            
            return "文件删除成功".successResponse
        } catch {
            req.logger.error("File deletion error: \(error)")
            throw error
        }
    }
    
    // 修改头像上传处理方法
    func uploadAvatar(req: Request) async throws -> ResponseModel<File.Public> {
        guard let user = try? req.auth.require(User.self) else {
            throw Abort(.unauthorized)
        }
        
        let response = try await upload(req: req)
        if let file = response.data {
            req.logger.info("Avatar file name: \(file.name)")
            user.avatar = "/uploads/\(file.name)"
            try await user.save(on: req.db)
        }
        
        return response
    }
}

struct FileResponse: Content {
    let path: String
}
