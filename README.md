# Vapor Admin 后台管理系统

现代化的后台管理系统，使用 Swift Vapor 4 + Vue 3 + TypeScript + Element Plus 构建。

## 技术栈

### 后端
- **Swift Vapor 4** - 现代化的 Swift Web 框架
- **Fluent ORM** - 数据库操作
- **SQLite** - 轻量级数据库

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Element Plus** - Vue 3 组件库
- **Vite** - 现代化构建工具
- **ECharts** - 数据可视化图表
- **Vue Router** - 前端路由
- **Pinia** - 状态管理

## 项目结构

```
vapor_-/
├── Sources/App/              # Swift Vapor 后端
│   ├── basic/               # 基础层
│   │   ├── dao/            # 数据访问层
│   │   └── utils/          # 工具类
│   ├── business/           # 业务逻辑层
│   ├── web/               # Web层
│   │   ├── controller/    # 控制器
│   │   └── viewmodel/     # 视图模型
│   ├── Middleware/        # 中间件
│   ├── configure.swift    # 配置文件
│   └── main.swift         # 入口文件
├── frontend/              # Vue 3 前端项目
│   ├── src/
│   │   ├── components/    # Vue 组件
│   │   ├── views/         # 页面视图
│   │   ├── api/          # API 接口
│   │   ├── utils/        # 工具函数
│   │   ├── types/        # TypeScript 类型
│   │   └── router/       # 路由配置
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── Public/               # 静态资源（前端构建输出）
├── Package.swift         # Swift 包管理
├── build.sh             # 生产构建脚本
├── dev.sh              # 开发启动脚本
└── README.md
```

## 功能特性

### 用户认证
- JWT Token 认证
- 角色权限管理
- 登录状态保持

### 流量监控
- 全局数据动态
- 推荐/搜索热度趋势
- 实时数据图表

### 内容管理
- 内容列表/榜单
- 单个内容明细查询
- 批量操作

### 创作者管理
- 创作者列表
- 创作者信息查询

### 系统管理
- 用户管理
- 操作日志

## 快速开始

### 环境要求

- **macOS** 10.15+ / **Linux** Ubuntu 18.04+
- **Swift** 5.7+
- **Node.js** 16+
- **npm** 或 **yarn**

### 开发模式

1. **克隆项目**
```bash
git clone <repository-url>
cd vapor_-
```

2. **启动开发环境**
```bash
./dev.sh
```

这将同时启动：
- 前端开发服务器：http://localhost:5173
- 后端API服务器：http://localhost:8080

### 生产构建

```bash
./build.sh
```

构建完成后：
- 前端文件输出到 `Public/` 目录
- 后端可执行文件：`.build/release/App`

### 手动操作

#### 前端开发
```bash
cd frontend
npm install
npm run dev        # 开发模式
npm run build      # 生产构建
```

#### 后端开发
```bash
vapor run          # 开发模式
vapor build --configuration release  # 生产构建
```

## API 文档

详细的 API 文档请查看 [docs/API.md](docs/API.md)

## 架构说明

### 前后端分离架构
- 前端：Vue 3 SPA，开发时运行在 5173 端口
- 后端：Vapor API 服务，运行在 8080 端口
- 生产：前端构建后的静态文件由 Vapor 托管

### 开发工作流
1. 前端使用 Vite 开发服务器，支持热重载
2. API 请求通过 Vite 代理转发到后端
3. 生产时前端构建到 Public 目录，由 Vapor 统一服务

### 类型安全
- 后端：Swift 静态类型系统
- 前端：TypeScript 类型检查
- API：统一的响应格式和错误处理

## 部署

### Docker 部署
```bash
docker-compose up -d
```

### 手动部署
1. 运行构建脚本：`./build.sh`
2. 启动后端服务：`.build/release/App`
3. 配置反向代理（如 Nginx）

## 开发指南

### 添加新页面
1. 在 `frontend/src/components/` 创建组件
2. 在 `frontend/src/router/index.ts` 添加路由
3. 在后端 `Sources/App/web/controller/` 添加对应的 API

### API 开发规范
- 使用 RESTful 风格
- 统一使用 ResponseModel 返回格式
- 错误处理中间件统一处理异常

### 前端开发规范
- 使用 Composition API
- TypeScript 类型定义
- Element Plus 组件库
- 响应式设计

## 贡献指南

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/new-feature`
3. 提交改动：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

## 许可证

MIT License

## 支持

如有问题，请提交 Issue 或联系开发团队。