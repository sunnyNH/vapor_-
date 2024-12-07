# 使用官方 Swift 镜像作为构建环境
FROM swift:5.9-jammy as builder

# 设置工作目录
WORKDIR /build

# 复制项目文件
COPY . .

# 构建发布版本
RUN swift build -c release

# 使用更小的运行时镜像
FROM swift:5.9-jammy-slim

# 设置工作目录
WORKDIR /app

# 创建 Public 目录
RUN mkdir Public

# 从构建阶段复制编译好的二进制文件
COPY --from=builder /build/.build/release/App .
# 复制 Public 目录内容
COPY --from=builder /build/Public ./Public

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV ENVIRONMENT=production

# 运行应用
CMD ["./App", "serve", "--env", "production", "--hostname", "0.0.0.0", "--port", "8080"] 