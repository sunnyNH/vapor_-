# API 文档

## 基础信息

| 项目 | 说明 |
|------|------|
| 基础URL | `http://your-domain.com` |
| API版本 | v1 |
| 内容类型 | `application/json` |

## 认证

所有需要认证的接口都需要在请求头中包含 JWT Token：

```http
Authorization: Bearer <your-token>
```

或者在 Cookie 中包含：

```
dc_0=<your-token>
```

## 错误响应

所有的错误响应都遵循以下格式：

```json
{
    "reason": "错误原因",
    "error": true
}
```

错误响应示例：

```json
{
    "reason": "invalidPassword(\"密码长度必须在8-20个字符之间\")",
    "error": true
}
```

## API 接口列表

### 用户认证

#### 登录/注册

**请求路径**：`POST /signin`

**认证要求**：否

**请求参数示例**：
```json
{
    "phone": "13800138000",
    "password": "YourPassword123!"
}
```

**参数说明**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号码 |
| password | string | 是 | 密码 |

**响应示例**：
```json
{
    "success": true,
    "data": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 退出登录

**请求路径**：`POST /signout`

**认证要求**：是

**响应示例**：
```json
{
    "success": true,
    "message": "退出登录成功"
}
```

### 用户信息

#### 获取个人信息

**请求路径**：`GET /user/profile`

**认证要求**：是

**响应示例**：
```json
{
    "success": true,
    "data": {
        "id": 1,
        "uuid": "user-uuid",
        "phone": "13800138000",
        "name": "用户名",
        "avatar": "头像URL",
        "age": 25,
        "gender": 1,
        "overview": "个人简介",
        "address": "地址",
        "create_at": 1638288000
    }
}
```

#### 更新个人信息

**请求路径**：`PUT /user/profile`

**认证要求**：是

**请求参数示例**：
```json
{
    "name": "新用户名",
    "avatar": "https://example.com/avatar.jpg",
    "age": 26,
    "gender": 1,
    "overview": "新的个人简介",
    "address": "北京市朝阳区..."
}
```

**参数说明**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 用户名 |
| avatar | string | 否 | 头像URL |
| age | integer | 否 | 年龄 |
| gender | integer | 否 | 性别(1:男 2:女) |
| overview | string | 否 | 个人简介 |
| address | string | 否 | 地址 |

**响应示例**：
```json
{
    "success": true,
    "data": {
        "id": 1,
        "uuid": "user-uuid",
        "phone": "13800138000",
        "name": "新用户名",
        "avatar": "新头像URL",
        "age": 26,
        "gender": 1,
        "overview": "新的个人简介",
        "address": "新地址",
        "create_at": 1638288000
    }
}
```

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |