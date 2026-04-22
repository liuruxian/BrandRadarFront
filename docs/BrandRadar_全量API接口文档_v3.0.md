# BrandRadar 全量 API 接口文档

> **文档版本**：v3.0
> **生成时间**：2026-04-17
> **文档类型**：接口规格说明书
> **状态**：Crawler 平台（已实现）/ IDC 市场分析（已实现）
> **目标读者**：前端开发工程师、后端开发工程师

---

## 一、项目概览

### 1.1 模块划分

BrandRadar 系统包含两大独立模块：

| 模块 | 数据来源 | 数据表 | 状态 |
|------|----------|--------|------|
| **Crawler 产品平台** | 品牌官网爬虫采集 | `products`、`product_specs`、`listing_urls` 等 | 已实现，68 个接口 |
| **IDC 市场分析** | IDC 第三方市场调研数据 | `idc_printer_market`、`idc_pivot_templates` 等 | 已实现，10 个接口 |

### 1.2 技术规范

**统一响应信封**：

```typescript
// 成功
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "page": 1, "page_size": 50, "total": 100 }
}

// 失败
{
  "success": false,
  "data": null,
  "error": {
    "error_code": "INVALID_PARAMS",
    "message": "参数错误",
    "detail": null
  }
}
```

**认证方式**：JWT Bearer Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

除 `/health` 外，所有接口均需携带有效 Token。

**分页约定**：列表接口统一支持以下参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | int | 1 | 页码，从 1 开始 |
| page_size | int | 50 | 每页条数，上限 200 |

**数组参数**：多个值使用逗号分隔

```http
GET /api/idc/brand?year=2025&brand=HP,Canon,Epson
```

---

## 二、已实现接口总览

### 2.1 接口清单（Crawler 产品平台）

| # | 模块 | 接口路径 | 方法 | 说明 |
|---|------|---------|------|------|
| 1 | 系统 | `/health` | GET | 服务健康检查（公开） |
| 2 | 系统 | `/api/summary` | GET | 全局数据汇总 |
| 3 | 系统 | `/api/scheduler/reload` | POST | 热重载调度配置 |
| 4 | 认证 | `/api/auth/login` | POST | 用户登录 |
| 5 | 认证 | `/api/auth/me` | GET | 当前用户信息 |
| 6 | 认证 | `/api/auth/password` | POST | 修改当前用户密码 |
| 7 | 用户 | `/api/users` | GET | 用户列表（分页） |
| 8 | 用户 | `/api/users` | POST | 创建用户 |
| 9 | 用户 | `/api/users/me` | GET | 当前用户个人资料 |
| 10 | 用户 | `/api/users/me` | PUT | 更新当前用户个人资料 |
| 11 | 用户 | `/api/users/{user_id}` | GET | 查询单个用户 |
| 12 | 用户 | `/api/users/{user_id}` | PUT | 更新用户（管理员） |
| 13 | 用户 | `/api/users/{user_id}` | DELETE | 删除用户 |
| 14 | 角色 | `/api/roles` | GET | 角色列表 |
| 15 | 角色 | `/api/roles` | POST | 创建自定义角色 |
| 16 | 角色 | `/api/roles/{role_id}` | GET | 查询单个角色 |
| 17 | 角色 | `/api/roles/{role_id}` | PUT | 更新角色权限/说明 |
| 18 | 角色 | `/api/roles/{role_id}` | DELETE | 删除角色（内置不可删） |
| 19 | 会话 | `/api/sessions` | GET | 会话列表（分页） |
| 20 | 会话 | `/api/sessions/{session_id}/terminate` | POST | 终止会话 |
| 21 | 产品 | `/api/products` | GET | 产品列表（支持过滤+分页） |
| 22 | 产品 | `/api/products/{brand}/{country}` | GET | 按品牌+国家查产品 |
| 23 | 产品 | `/api/brands` | GET | 已有数据的品牌列表 |
| 24 | 产品 | `/api/brands/config` | GET | 配置文件中的品牌信息 |
| 25 | 产品 | `/api/countries` | GET | 已有数据的国家列表 |
| 26 | 规格 | `/api/specs/{brand}/{country}` | GET | 已采集规格的产品ID列表 |
| 27 | 规格 | `/api/specs/{brand}/{country}/{product_id}` | GET | 单个产品规格（支持多语言） |
| 28 | 采集 | `/api/crawl` | POST | 触发采集任务（异步） |
| 29 | 采集 | `/api/crawl` | GET | 采集任务列表 |
| 30 | 采集 | `/api/crawl/{task_id}` | GET | 单个任务状态 |
| 31 | 采集 | `/api/crawl/cleanup` | DELETE | 清理过期任务 |
| 32 | 调度 | `/api/scheduler/crawl` | POST | 按品牌/国家批量触发采集 |
| 33 | 调度 | `/api/scheduler/status` | GET | 调度器运行状态 |
| 34 | 调度 | `/api/scheduler/mode` | PUT | 切换调度模式（auto/manual） |
| 35 | 调度 | `/api/scheduler/schedule` | PUT | 配置自动调度时间 |
| 36 | 调度 | `/api/scheduler/tasks` | GET | 采集任务列表 |
| 37 | 监控 | `/api/monitor/price-changes` | GET | 价格变动记录（分页+排序） |
| 38 | 监控 | `/api/monitor/price-changes/trend` | GET | 价格变动趋势 |
| 39 | 监控 | `/api/monitor/price-changes/heatmap` | GET | 品牌国家热力图 |
| 40 | 监控 | `/api/monitor/price-changes/top-volatility` | GET | 波动榜 |
| 41 | 监控 | `/api/monitor/price-changes/{product_id}/history` | GET | 单产品价格历史 |
| 42 | 监控 | `/api/monitor/overview` | GET | 运维看板总览 |
| 43 | 告警 | `/api/alerts` | GET | 采集告警列表（新版） |
| 44 | 告警 | `/api/alerts/{alert_id}/resolve` | PUT | 处理告警 |
| 45 | 告警 | `/api/alerts/old` | GET | 旧版预警列表（兼容） |
| 46 | 告警 | `/api/alerts/{alert_id}/decision` | PUT | 旧版处理预警（兼容） |
| 47 | 备份 | `/api/backup/config` | GET | 备份配置 |
| 48 | 备份 | `/api/backup/config` | PUT | 更新备份配置 |
| 49 | 备份 | `/api/backup/trigger` | POST | 手动触发备份 |
| 50 | 备份 | `/api/backup/tasks` | GET | 备份任务列表 |
| 51 | 备份 | `/api/backup/status` | GET | 备份调度状态 |
| 52 | 备份心跳 | `/api/backup/heartbeat/status` | GET | 心跳状态 |
| 53 | 备份心跳 | `/api/backup/heartbeat/history` | GET | 心跳历史 |
| 54 | 备份心跳 | `/api/backup/heartbeat/refresh` | POST | 手动刷新心跳 |
| 55 | 备份心跳 | `/api/backup/heartbeat/config` | PUT | 更新心跳配置 |
| 56 | 国家映射 | `/api/country-mappings/{brand}` | GET | 品牌国家映射列表 |
| 57 | 国家映射 | `/api/country-mappings/{brand}/{country_code}` | PUT | 更新映射 |
| 58 | SSE流 | `/api/stream/events` | GET | SSE 事件流订阅 |
| 59 | SSE流 | `/api/stream/publish` | POST | 发布测试事件 |
| 60 | SSE流 | `/api/stream/stats` | GET | SSE 订阅统计 |
| 61 | 看门狗 | `/api/watchdog/config` | GET | 看门狗配置 |
| 62 | 看门狗 | `/api/watchdog/config` | PUT | 更新看门狗配置 |
| 63 | 看门狗 | `/api/watchdog/status` | GET | 看门狗状态 |
| 64 | 看门狗 | `/api/watchdog/check` | POST | 手动执行一次检测 |
| 65 | 公告 | `/api/announcements` | GET | 公告列表 |
| 66 | 公告 | `/api/announcements` | POST | 新增公告 |
| 67 | 公告 | `/api/announcements/{announcement_id}` | PUT | 更新公告 |
| 68 | 公告 | `/api/announcements/{announcement_id}` | DELETE | 删除公告 |

---

## 三、系统与认证模块

### 3.1 健康检查

```
GET /health
```

公开接口，无需认证。用于负载均衡器心跳检测。

**响应**：

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "env": "production",
    "db_backend": "postgresql",
    "uptime_seconds": 86400.5,
    "browser_engine": "playwright",
    "browser_check_mode": "light",
    "browser_ready": true,
    "browser_error": ""
  }
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| status | string | ok（正常）/ degraded（降级）/ error（错误） |
| version | string | 应用版本号 |
| env | string | 运行环境：development / staging / production |
| db_backend | string | 数据库后端：postgresql / sqlite |
| uptime_seconds | float | 服务运行时长（秒） |
| browser_engine | string | 浏览器引擎：playwright |
| browser_check_mode | string | 浏览器检查模式：light（轻量）/ deep（深度） |
| browser_ready | bool | 浏览器运行时是否就绪 |
| browser_error | string | 浏览器检查失败时的错误信息 |

---

### 3.2 全局数据汇总

```
GET /api/summary
```

返回各品牌/国家产品数量统计以及最近更新时间。

**响应**：

```json
{
  "success": true,
  "data": {
    "total_products": 1234,
    "total_brands": 4,
    "total_countries": 28,
    "by_brand": {
      "HP": 456,
      "Canon": 312,
      "Brother": 289,
      "Epson": 177
    },
    "last_updated": "2026-04-17T10:30:00Z"
  }
}
```

**权限要求**：`dashboard:read`

---

### 3.3 用户登录

```
POST /api/auth/login
```

**请求**：

```json
{
  "email": "admin@brandradar.com",
  "password": "xxxxxx"
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 86400
  }
}
```

**错误响应**：

```json
{
  "success": false,
  "error": {
    "error_code": "AUTH_FAILED",
    "message": "邮箱或密码错误"
  }
}
```

---

### 3.4 当前用户信息

```
GET /api/auth/me
Authorization: Bearer <token>
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "admin@brandradar.com",
    "username": "admin",
    "nickname": "管理员",
    "phone": "138xxxx",
    "user_type": "frontend",
    "status": "active",
    "roles": ["dashboard_user"],
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### 3.5 修改密码

```
POST /api/auth/password
Authorization: Bearer <token>
```

**请求**：

```json
{
  "old_password": "xxxx",
  "new_password": "xxxx"
}
```

**业务规则**：
- 新密码长度至少 6 位
- 旧密码必须正确
- 修改后需重新登录

---

## 四、用户与角色管理模块

### 4.1 用户列表

```
GET /api/users
```

**Query 参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| user_type | string | - | system / frontend |
| page | int | 1 | 页码 |
| page_size | int | 50 | 每页条数，上限 200 |

**响应**：

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid-string",
        "email": "user@example.com",
        "username": "user1",
        "nickname": "用户1",
        "phone": "138xxxx",
        "user_type": "frontend",
        "status": "active",
        "roles": ["dashboard_user"],
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
      }
    ]
  },
  "meta": {
    "total": 10,
    "page": 1,
    "page_size": 50,
    "total_pages": 1
  }
}
```

**权限要求**：`users:read`

---

### 4.2 创建用户

```
POST /api/users
```

**请求**：

```json
{
  "email": "new@example.com",
  "password": "password123",
  "user_type": "frontend",
  "roles": ["dashboard_user"],
  "username": "newuser",
  "nickname": "新用户",
  "phone": "138xxxx"
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱，唯一 |
| password | string | 是 | 密码，最少 6 位 |
| user_type | string | 是 | system / frontend |
| roles | string[] | 是 | 角色 code 列表 |
| username | string | 否 | 用户名 |
| nickname | string | 否 | 昵称 |
| phone | string | 否 | 手机号 |

**响应**：返回创建的用户对象（状态码 201）

**权限要求**：`users:write`

---

### 4.3 查询单个用户

```
GET /api/users/{user_id}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "username": "user1",
    "nickname": "用户1",
    "phone": "138xxxx",
    "user_type": "frontend",
    "status": "active",
    "roles": ["dashboard_user"],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
}
```

**权限要求**：`users:read`

---

### 4.4 更新用户

```
PUT /api/users/{user_id}
```

**请求**：

```json
{
  "is_active": true,
  "roles": ["dashboard_user", "products_read"],
  "password": "newpassword",
  "username": "updated_user",
  "nickname": "更新后的昵称",
  "phone": "139xxxx"
}
```

**说明**：所有字段均为可选，只更新传入的字段。

**权限要求**：`users:write`

---

### 4.5 删除用户

```
DELETE /api/users/{user_id}
```

删除指定用户。不可删除自己。

**权限要求**：`users:write`

---

### 4.6 当前用户资料

```
GET  /api/users/me         ← 获取当前用户个人资料
PUT  /api/users/me         ← 更新当前用户个人资料
```

**GET 响应**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "admin@brandradar.com",
    "username": "admin",
    "nickname": "管理员",
    "phone": "138xxxx",
    "user_type": "frontend",
    "status": "active",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

**PUT 请求**（更新个人资料）：

```json
{
  "nickname": "新昵称",
  "email": "newemail@example.com",
  "phone": "139xxxx"
}
```

---

### 4.7 角色列表

```
GET /api/roles
```

**响应**：

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "dashboard_user",
      "label": "看板用户",
      "description": "只读访问看板数据",
      "permissions": ["dashboard:read", "products:read", "specs:read"],
      "user_type": "frontend",
      "is_system": true,
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "uuid-string",
      "name": "crawler_operator",
      "label": "采集操作员",
      "description": "管理爬虫采集任务",
      "permissions": ["crawl:read", "crawl:write", "scheduler:read", "scheduler:write"],
      "user_type": "system",
      "is_system": true,
      "created_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "uuid-string",
      "name": "admin",
      "label": "系统管理员",
      "description": "完全访问权限",
      "permissions": ["*"],
      "user_type": "system",
      "is_system": true,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**权限要求**：`roles:read`

---

### 4.8 创建角色

```
POST /api/roles
```

**请求**：

```json
{
  "name": "custom_role",
  "label": "自定义角色",
  "description": "用于特定业务场景",
  "permissions": ["dashboard:read", "products:read"]
}
```

**权限要求**：`roles:write`

---

### 4.9 更新角色

```
PUT /api/roles/{role_id}
```

**请求**：

```json
{
  "label": "更新后的角色名",
  "description": "更新后的描述",
  "permissions": ["dashboard:read", "products:read", "products:write"]
}
```

**说明**：系统内置角色（`is_system: true`）不可修改权限。

**权限要求**：`roles:write`

---

### 4.10 删除角色

```
DELETE /api/roles/{role_id}
```

**说明**：系统内置角色不可删除。

**权限要求**：`roles:write`

---

### 4.11 会话列表

```
GET /api/sessions
```

**Query 参数**：`user_type`（system/frontend）、`page`、`page_size`

**响应**：

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "session_id": "uuid-string",
        "user_id": "uuid-string",
        "user_email": "admin@brandradar.com",
        "user_type": "frontend",
        "created_at": "2026-04-17T08:00:00Z",
        "last_active": "2026-04-17T10:30:00Z",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
      }
    ]
  },
  "meta": { "total": 5, "page": 1, "page_size": 50, "total_pages": 1 }
}
```

**权限要求**：`users:read`

---

### 4.12 终止会话

```
POST /api/sessions/{session_id}/terminate
```

**请求**：

```json
{
  "reason": "用户主动登出"
}
```

**说明**：可强制终止任意会话，包括自己的会话。

**权限要求**：`users:write`

---

## 五、产品与规格模块

### 5.1 产品列表

```
GET /api/products
```

**Query 参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| brand | string | 品牌名称，如 HP |
| country | string | 国家代码，如 dk-da |
| status | string | on_sale / discontinued |
| page | int | 页码，默认 1 |
| page_size | int | 每页条数，默认 50，上限 200 |

**响应**：

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 123,
        "brand": "HP",
        "country": "dk-da",
        "product_id": "HP-LaserJet-Pro-M404dn",
        "name": "HP LaserJet Pro M404dn",
        "url": "https://www.hp.com/dk-da/...",
        "status": "on_sale",
        "price": 299.99,
        "currency": "DKK",
        "created_at": "2026-04-10T12:00:00Z",
        "updated_at": "2026-04-17T10:00:00Z"
      }
    ]
  },
  "meta": {
    "total": 456,
    "page": 1,
    "page_size": 50,
    "total_pages": 10
  }
}
```

**权限要求**：`products:read`

---

### 5.2 按品牌+国家查产品

```
GET /api/products/{brand}/{country}
```

**Query 参数**：`status`、`page`、`page_size`

**说明**：与产品列表接口功能相同，但路径中直接指定品牌和国家。

**权限要求**：`products:read`

---

### 5.3 品牌列表

```
GET /api/brands
```

返回数据库中已有数据的品牌列表（去重）。

**响应**：

```json
{
  "success": true,
  "data": ["HP", "Canon", "Brother", "Epson"]
}
```

**权限要求**：`products:read`

---

### 5.4 品牌配置

```
GET /api/brands/config
```

返回 `config.json` 中的品牌和地区配置信息，包含品牌的完整元数据。

**响应**：

```json
{
  "success": true,
  "data": [
    {
      "brand": "HP",
      "regions": [
        {
          "country_code": "us-en",
          "country_name_en": "United States",
          "country_name_zh": "美国",
          "language": "en",
          "url": "https://www.hp.com/...",
          "listing_url": "https://www.hp.com/...",
          "spec_url": "https://www.hp.com/..."
        }
      ]
    }
  ]
}
```

**权限要求**：`products:read`

---

### 5.5 国家列表

```
GET /api/countries
```

**Query 参数**：`brand`（按品牌过滤）

返回已有数据的国家列表。

**响应**：

```json
{
  "success": true,
  "data": ["us-en", "uk-en", "de-de", "fr-fr", "dk-da"]
}
```

**权限要求**：`products:read`

---

### 5.6 规格产品ID列表

```
GET /api/specs/{brand}/{country}
```

返回已采集规格的产品 ID 列表（即 `product_specs` 表中有记录的型号）。

**响应**：

```json
{
  "success": true,
  "data": {
    "brand": "HP",
    "country": "us-en",
    "product_ids": [
      "HP-LaserJet-Pro-M404dn",
      "HP-LaserJet-Pro-M428fdw",
      "HP-OfficeJet-Pro-9010"
    ],
    "total": 3
  }
}
```

**权限要求**：`specs:read`

---

### 5.7 单个产品规格

```
GET /api/specs/{brand}/{country}/{product_id}
```

**Query 参数**：`lang`（both / original / en）

| lang 值 | 说明 |
|---------|------|
| both（默认） | 返回原文 + 英文两个版本 |
| original | 仅返回原文版本 |
| en | 仅返回英文版本 |

**响应**（lang=both）：

```json
{
  "success": true,
  "data": {
    "product_id": "HP-LaserJet-Pro-M404dn",
    "brand": "HP",
    "country": "us-en",
    "spec_original": "Print speed: up to 40 ppm (black)...\nFirst page out: as fast as 6.1 seconds...",
    "spec_en": "Print speed: up to 40 ppm (black)...\nFirst page out: as fast as 6.1 seconds...",
    "source_url": "https://www.hp.com/us-en/shop/...",
    "updated_at": "2026-04-17T10:00:00Z"
  }
}
```

**权限要求**：`specs:read`

---

## 六、采集与调度模块

### 6.1 触发采集任务

```
POST /api/crawl
```

**请求**：

```json
{
  "brand": "HP",
  "country": "us-en",
  "update_existing": false,
  "force": false
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| brand | string | 是 | 品牌名称 |
| country | string | 是 | 国家代码 |
| update_existing | bool | 否 | 是否更新已有产品（默认 false） |
| force | bool | 否 | 是否强制重新采集（默认 false） |

**响应**（状态码 202 Accepted）：

```json
{
  "success": true,
  "data": {
    "task_id": "crawl_20260417_abcd1234",
    "brand": "HP",
    "country": "us-en",
    "status": "queued",
    "created_at": "2026-04-17T10:30:00Z",
    "started_at": null,
    "finished_at": null,
    "summary": null,
    "error_message": null
  }
}
```

**任务状态流转**：`queued` → `running` → `done` / `failed`

**权限要求**：`crawl:write`

---

### 6.2 采集任务列表

```
GET /api/crawl
```

**Query 参数**：`brand`、`country`

**响应**：

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "task_id": "crawl_20260417_abcd1234",
        "brand": "HP",
        "country": "us-en",
        "status": "done",
        "created_at": "2026-04-17T10:30:00Z",
        "started_at": "2026-04-17T10:30:05Z",
        "finished_at": "2026-04-17T10:35:12Z",
        "summary": "采集完成，新增 12 个产品，更新 45 个产品",
        "error_message": null
      }
    ]
  }
}
```

**权限要求**：`crawl:read`

---

### 6.3 单个任务状态

```
GET /api/crawl/{task_id}
```

**权限要求**：`crawl:read`

---

### 6.4 清理过期任务

```
DELETE /api/crawl/cleanup
```

清理已完成且超过 TTL（默认 7 天）的任务记录。

**响应**：

```json
{
  "success": true,
  "data": { "removed": 23 }
}
```

**权限要求**：`crawl:write`

---

### 6.5 批量触发采集

```
POST /api/scheduler/crawl
```

按品牌/国家维度批量触发采集任务，返回任务明细列表。

**请求**：

```json
{
  "brand": "HP",
  "countries": ["us-en", "uk-en", "de-de", "fr-fr"],
  "force": false,
  "update_existing": true
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "tasks": [
      { "task_id": "crawl_20260417_001", "brand": "HP", "country": "us-en", "status": "queued", "error": null },
      { "task_id": "crawl_20260417_002", "brand": "HP", "country": "uk-en", "status": "queued", "error": null },
      { "task_id": "crawl_20260417_003", "brand": "HP", "country": "de-de", "status": "queued", "error": null },
      { "task_id": "crawl_20260417_004", "brand": "HP", "country": "fr-fr", "status": "queued", "error": null }
    ],
    "total": 4
  }
}
```

**权限要求**：`scheduler:write`

---

### 6.6 调度器状态

```
GET /api/scheduler/status
```

**响应**：

```json
{
  "success": true,
  "data": {
    "mode": "manual",
    "interval_minutes": 1440,
    "cron_expression": "",
    "silent_hours_enabled": true,
    "silent_start": "00:00",
    "silent_end": "06:00",
    "today_runs": 0,
    "max_daily_runs": 2,
    "next_run_in_seconds": 0,
    "daemon_alive": true
  }
}
```

**字段说明**：

| 字段 | 说明 |
|------|------|
| mode | auto（自动调度）/ manual（手动触发） |
| interval_minutes | 自动调度间隔（分钟） |
| cron_expression | Cron 表达式（优先级高于 interval） |
| silent_hours_enabled | 是否启用静默期 |
| silent_start / silent_end | 静默期时间段（UTC） |
| today_runs | 今日已执行次数 |
| max_daily_runs | 每日最大执行次数 |
| next_run_in_seconds | 距下次执行的秒数 |
| daemon_alive | 调度守护进程是否存活 |

**权限要求**：`scheduler:read`

---

### 6.7 切换调度模式

```
PUT /api/scheduler/mode
```

**请求**：

```json
{ "mode": "auto" }
```

或

```json
{ "mode": "manual" }
```

**说明**：
- `auto`：按配置的 interval_minutes 或 cron_expression 自动触发
- `manual`：仅通过 `/api/scheduler/crawl` 手动触发

**权限要求**：`scheduler:write`

---

### 6.8 配置调度时间

```
PUT /api/scheduler/schedule
```

**请求**：

```json
{
  "interval_minutes": 720,
  "cron_expression": "0 2 * * *",
  "silent_hours_enabled": true,
  "silent_start": "00:00",
  "silent_end": "06:00"
}
```

**字段说明**：
- `interval_minutes`：固定间隔，最小 30 分钟
- `cron_expression`：Cron 表达式，优先级高于 interval
- `silent_hours_enabled`：静默期开关
- `silent_start / silent_end`：静默期时间范围，格式 HH:MM

**说明**：所有字段均为可选，未传字段保持原值。配置写入文件，立即生效。

**权限要求**：`scheduler:write`

---

### 6.9 采集任务列表（调度模块）

```
GET /api/scheduler/tasks
```

**Query 参数**：`brand`、`country`

**说明**：与 `/api/crawl` 类似，但额外返回产品计数和进度信息。

**响应**：

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "task_id": "crawl_20260417_001",
        "brand": "HP",
        "country": "us-en",
        "status": "done",
        "started_at": "2026-04-17T10:30:05Z",
        "finished_at": "2026-04-17T10:35:12Z",
        "product_count": 57,
        "new_count": 12,
        "updated_count": 45,
        "error": null,
        "progress": 100
      }
    ],
    "total": 4
  },
  "meta": {
    "done": 3,
    "failed": 0,
    "running": 1,
    "queued": 0
  }
}
```

**权限要求**：`scheduler:read`

---

## 七、监控模块

### 7.1 价格变动记录

```
GET /api/monitor/price-changes
```

**Query 参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| brand | string | 品牌筛选 |
| country | string | 国家筛选 |
| status | string | on_sale / discontinued |
| direction | string | up（涨价）/ down（降价）/ stable（不变） |
| keyword | string | 产品名称关键词 |
| start_time | string | 开始时间，ISO 8601 格式 |
| end_time | string | 结束时间，ISO 8601 格式 |
| sort_by | string | time / abs_change_pct / change_pct |
| sort_order | string | asc / desc |
| page | int | 页码，默认 1 |
| page_size | int | 每页，默认 50，上限 500 |

**响应**：

```json
{
  "success": true,
  "data": {
    "changes": [
      {
        "product_id": "HP-LaserJet-Pro-M404dn",
        "brand": "HP",
        "country": "us-en",
        "product_name": "HP LaserJet Pro M404dn",
        "old_price": 299.99,
        "new_price": 279.99,
        "change_pct": -6.7,
        "change_type": "down",
        "changed_at": "2026-04-17T10:30:00Z"
      }
    ]
  },
  "meta": {
    "total": 123,
    "page": 1,
    "page_size": 50,
    "total_pages": 3
  }
}
```

**权限要求**：`monitor:read`

---

### 7.2 价格变动趋势

```
GET /api/monitor/price-changes/trend
```

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| start_time | string | 是 | 开始时间 |
| end_time | string | 是 | 结束时间 |
| bucket | string | 是 | day / week / month |
| brand | string | 否 | 品牌筛选 |
| country | string | 否 | 国家筛选 |
| direction | string | 否 | up / down / stable |

**响应**：

```json
{
  "success": true,
  "data": {
    "points": [
      { "time": "2026-04-17", "up_count": 5, "down_count": 3, "stable_count": 45 },
      { "time": "2026-04-18", "up_count": 8, "down_count": 2, "stable_count": 48 }
    ]
  },
  "meta": { "count": 2 }
}
```

**权限要求**：`monitor:read`

---

### 7.3 品牌国家热力图

```
GET /api/monitor/price-changes/heatmap
```

**Query 参数**：`start_time`（必填）、`end_time`（必填）、`direction`、`brand`（数组）、`country`（数组）

**响应**：

```json
{
  "success": true,
  "data": {
    "cells": [
      {
        "brand": "HP",
        "country": "us-en",
        "total_changes": 25,
        "up_count": 10,
        "down_count": 8,
        "stable_count": 7,
        "avg_change_pct": 2.3
      }
    ]
  },
  "meta": { "count": 28 }
}
```

**权限要求**：`monitor:read`

---

### 7.4 波动榜

```
GET /api/monitor/price-changes/top-volatility
```

**Query 参数**：`start_time`（必填）、`end_time`（必填）、`brand`、`country`、`direction`（up/down/all，默认 all）、`limit`（默认 20，上限 200）

**响应**：

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "rank": 1,
        "product_id": "HP-LaserJet-Pro-M404dn",
        "brand": "HP",
        "country": "us-en",
        "product_name": "HP LaserJet Pro M404dn",
        "change_pct": -15.2,
        "change_type": "down",
        "old_price": 349.99,
        "new_price": 296.99
      }
    ]
  },
  "meta": { "count": 20 }
}
```

**权限要求**：`monitor:read`

---

### 7.5 单产品价格历史

```
GET /api/monitor/price-changes/{product_id}/history
```

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| brand | string | 是 | 品牌 |
| country | string | 是 | 国家 |
| start_time | string | 否 | 开始时间 |
| end_time | string | 否 | 结束时间 |
| limit | int | 否 | 返回条数，默认 200，上限 2000 |

**响应**：

```json
{
  "success": true,
  "data": {
    "product": {
      "product_id": "HP-LaserJet-Pro-M404dn",
      "brand": "HP",
      "country": "us-en"
    },
    "points": [
      { "price": 299.99, "changed_at": "2026-04-17T10:30:00Z" },
      { "price": 279.99, "changed_at": "2026-04-15T08:00:00Z" },
      { "price": 299.99, "changed_at": "2026-04-10T14:20:00Z" }
    ]
  }
}
```

**权限要求**：`monitor:read`

---

### 7.6 运维看板总览

```
GET /api/monitor/overview
```

返回系统全量运维指标，用于运维人员监控。

**响应**：

```json
{
  "success": true,
  "data": {
    "display_titles": {
      "system_health": "系统健康状态",
      "scheduler_status": "调度服务状态",
      "backup_status": "备份服务状态",
      "crawl_task_stats": "采集任务统计",
      "alert_stats": "告警处理统计",
      "host_metrics": "主机资源指标",
      "database_metrics": "数据库连接指标"
    },
    "system_health": {
      "api_alive": true,
      "scheduler_alive": true,
      "backup_alive": true,
      "watchdog_alive": true
    },
    "scheduler_status": {
      "mode": "manual",
      "daemon_alive": true
    },
    "backup_status": {
      "daemon_alive": true
    },
    "crawl_task_stats": {
      "queued": 0,
      "running": 1,
      "done": 156,
      "failed": 3
    },
    "alert_stats": {
      "pending": 5,
      "resolved": 42
    },
    "host_metrics": { ... },
    "database_metrics": { ... }
  }
}
```

**权限要求**：`monitor:read`

---

## 八、告警模块

### 8.1 采集告警列表（新版）

```
GET /api/alerts
```

**Query 参数**：`brand`、`country`、`status`（pending/resolved）、`alert_type`、`page`、`page_size`

**alert_type 枚举**：

| 值 | 说明 |
|---|---|
| `empty_page` | 列表页返回 0 条产品 |
| `http_error` | HTTP 请求失败（非 200） |
| `parse_error` | 解析器加载/执行失败 |
| `model_missing` | 采集到的产品 model 字段为空 |

**响应**：

```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_20260417_001",
        "brand": "HP",
        "country": "us-en",
        "source_url": "https://www.hp.com/...",
        "parser_id": "hp_shop_listaspx",
        "alert_type": "empty_page",
        "status": "pending",
        "trigger_count": 3,
        "first_seen_at": "2026-04-15T10:00:00Z",
        "last_seen_at": "2026-04-17T10:00:00Z",
        "decided_at": null,
        "decided_by": null,
        "notes": ""
      }
    ]
  },
  "meta": {
    "total": 5,
    "page": 1,
    "page_size": 50,
    "total_pages": 1
  }
}
```

**权限要求**：`monitor:read`

---

### 8.2 处理告警

```
PUT /api/alerts/{alert_id}/resolve
```

**请求**：

```json
{
  "operator": "admin",
  "notes": "确认网站改版，正常减少"
}
```

**说明**：处理后，该 URL 的阻塞状态将被解除。

**权限要求**：`scheduler:write`

---

### 8.3 旧版预警列表（兼容）

```
GET /api/alerts/old
```

**Query 参数**：`brand`、`country`、`status`、`source_url`、`product_id`、`start_time`、`end_time`、`page`、`page_size`

**说明**：兼容旧版数据告警接口，功能与新版类似但字段略有不同。

**权限要求**：`monitor:read`

---

### 8.4 旧版处理预警（兼容）

```
PUT /api/alerts/{alert_id}/decision
```

**请求**：

```json
{
  "decision": "accepted",
  "operator": "admin"
}
```

**权限要求**：`scheduler:write`

---

## 九、备份与看门狗模块

### 9.1 备份配置

```
GET  /api/backup/config       ← 查看备份配置
PUT  /api/backup/config       ← 更新备份配置
```

**GET 响应**：

```json
{
  "success": true,
  "data": {
    "backup_enabled": true,
    "backup_path": "/backups",
    "max_backups": 7,
    "backup_schedule": "0 3 * * *",
    "compression": true,
    "target": "local"
  }
}
```

**PUT 请求**：

```json
{
  "backup_enabled": true,
  "max_backups": 14,
  "compression": true
}
```

**权限要求**：`backup:read`（GET）/ `backup:write`（PUT）

---

### 9.2 手动触发备份

```
POST /api/backup/trigger
```

**请求**：

```json
{
  "force": true,
  "target": "local",
  "schedule_at": null
}
```

**说明**：
- `force: true` 表示即使备份正在进行也强制执行
- `target` 指定备份目标：local（本地）/ remote（远程）
- `schedule_at` 指定定时执行时间，null 表示立即执行

**响应**（状态码 202）：

```json
{
  "success": true,
  "data": {
    "task_id": "backup_20260417_001",
    "status": "running",
    "started_at": "2026-04-17T10:30:00Z"
  }
}
```

**权限要求**：`backup:write`

---

### 9.3 备份任务列表

```
GET /api/backup/tasks?limit=50
```

**响应**：

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "task_id": "backup_20260417_001",
        "status": "completed",
        "target": "local",
        "file_path": "/backups/brandradar_20260417.sql.gz",
        "file_size": 15728640,
        "started_at": "2026-04-17T10:30:00Z",
        "finished_at": "2026-04-17T10:35:00Z",
        "triggered_by": "manual"
      }
    ]
  },
  "meta": { "count": 1 }
}
```

**权限要求**：`backup:read`

---

### 9.4 备份调度状态

```
GET /api/backup/status
```

**响应**：

```json
{
  "success": true,
  "data": {
    "daemon_alive": true,
    "last_backup_at": "2026-04-17T03:00:00Z",
    "next_backup_at": "2026-04-18T03:00:00Z",
    "backup_in_progress": false
  }
}
```

**权限要求**：`backup:read`

---

### 9.5 备份心跳

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/backup/heartbeat/status` | 获取心跳状态 |
| GET | `/api/backup/heartbeat/history?limit=50` | 获取心跳历史 |
| POST | `/api/backup/heartbeat/refresh` | 手动刷新心跳 |
| PUT | `/api/backup/heartbeat/config` | 更新心跳配置 |

**权限要求**：`backup:read`（GET）/ `backup:write`（POST/PUT）

---

### 9.6 看门狗

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/watchdog/config` | 查看看门狗配置 |
| PUT | `/api/watchdog/config` | 更新看门狗配置 |
| GET | `/api/watchdog/status` | 查看看门狗状态 |
| POST | `/api/watchdog/check` | 手动执行一次检测 |

**权限要求**：`system:read`（GET）/ `system:write`（PUT/POST）

---

## 十、公告与流模块

### 10.1 公告

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/announcements` | 公告列表 |
| POST | `/api/announcements` | 新增公告 |
| PUT | `/api/announcements/{announcement_id}` | 更新公告 |
| DELETE | `/api/announcements/{announcement_id}` | 删除公告 |

**GET 请求参数**：`include_unpublished`（bool，默认 false）

**GET 响应**：

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-string",
        "title": "系统维护通知",
        "content": "将于 2026-04-20 02:00-04:00 进行系统维护...",
        "level": "info",
        "is_published": true,
        "created_at": "2026-04-17T10:00:00Z",
        "updated_at": "2026-04-17T10:00:00Z"
      }
    ]
  }
}
```

**POST 请求**：

```json
{
  "title": "新功能上线",
  "content": "IDC 市场分析模块已上线，欢迎使用。",
  "level": "info",
  "is_published": true
}
```

**level 可选值**：`info`（信息）/ `warning`（警告）/ `error`（错误）

**权限要求**：`system:read`（GET）/ `system:write`（POST/PUT/DELETE）

---

### 10.2 SSE 事件流

**建立订阅**：

```
GET /api/stream/events
Authorization: Bearer <token>
```

建立 SSE 连接，接收实时推送事件。前端使用 `EventSource` API 接收：

```javascript
const eventSource = new EventSource('/api/stream/events', {
  headers: { 'Authorization': 'Bearer ' + token }
});

eventSource.addEventListener('task_update', (event) => {
  const data = JSON.parse(event.data);
  console.log('任务更新:', data);
});

eventSource.addEventListener('alert', (event) => {
  const data = JSON.parse(event.data);
  console.log('收到告警:', data);
});
```

**发布测试事件**：

```
POST /api/stream/publish
```

**请求**：

```json
{
  "event": "task_update",
  "topic": "crawl",
  "data": { "task_id": "xxx", "status": "done" }
}
```

**SSE 订阅统计**：

```
GET /api/stream/stats
```

**响应**：

```json
{
  "success": true,
  "data": {
    "total_subscribers": 5,
    "topics": {
      "crawl": 2,
      "alert": 1,
      "system": 2
    }
  }
}
```

**权限要求**：`system:read`

---

## 十一、IDC 市场分析模块

### 11.1 模块概述

IDC 市场分析模块基于第三方 IDC 调研数据，提供打印机市场的多维度分析能力。

**设计原则**：

```
共用配置（静态数据，一次加载） + 页面数据（动态数据，按需加载）
```

**数据粒度**：半年度（Year + Half Year）

**时间覆盖**：2020H1 ~ 2025H2

**接口数量**：10 个

### 11.2 接口清单

| # | 接口路径 | 方法 | 功能 | 优先级 |
|---|----------|------|------|--------|
| 1 | `/api/idc/common/config` | GET | 全局共用配置 | P0 |
| 2 | `/api/idc/overview` | GET | 市场总览 | P0 |
| 3 | `/api/idc/geography` | GET | 地理分析 | P1 |
| 4 | `/api/idc/geography/country/{countryCode}` | GET | 国家详情 | P2 |
| 5 | `/api/idc/brand` | GET | 品牌分析 | P1 |
| 6 | `/api/idc/channel` | GET | 渠道分析 | P2 |
| 7 | `/api/idc/technology` | GET | 技术分析 | P2 |
| 8 | `/api/idc/product/search` | GET | 产品型号搜索 | P3 |
| 9 | `/api/idc/product/compare` | GET | 产品对比 | P3 |
| 10 | `/api/idc/explore` | POST | 透视分析（核心） | P0 |

---

### 11.3 全局共用配置

```
GET /api/idc/common/config
```

**功能说明**：返回全局共用配置数据，包括筛选选项、维度定义、统计量定义、品类选项、视图类型、预设模板。**建议前端缓存 24 小时**。

**请求参数**：无

**响应结构**：

```json
{
  "success": true,
  "data": {
    "filterOptions": {
      "years": ["2020","2021","2022","2023","2024","2025"],
      "halfYears": ["2023H1","2023H2","2024H1","2024H2","2025H1","2025H2"],
      "globalRegions": [
        {"value":"Americas","label":"美洲"},
        {"value":"EMEA","label":"欧洲/中东/非洲"},
        {"value":"APJ","label":"亚太"}
      ],
      "regions": [
        {"value":"Western Europe","label":"西欧"},
        {"value":"Eastern Europe","label":"东欧"},
        {"value":"North America","label":"北美"},
        {"value":"Latin America","label":"拉丁美洲"},
        {"value":"Asia/Pacific","label":"亚太"}
      ],
      "countries": [
        {"value":"US","label":"美国"},
        {"value":"CN","label":"中国"},
        {"value":"DE","label":"德国"},
        {"value":"JP","label":"日本"},
        {"value":"UK","label":"英国"},
        {"value":"FR","label":"法国"}
      ],
      "companies": [
        {"value":"HP Inc","label":"HP Inc"},
        {"value":"Canon Group","label":"Canon Group"},
        {"value":"Epson Group","label":"Epson Group"},
        {"value":"Brother Industries","label":"Brother Industries"}
      ],
      "brands": [
        {"value":"HP","label":"HP"},
        {"value":"Canon","label":"Canon"},
        {"value":"Epson","label":"Epson"},
        {"value":"Brother","label":"Brother"},
        {"value":"Lexmark","label":"Lexmark"},
        {"value":"Xerox","label":"Xerox"},
        {"value":"Ricoh","label":"Ricoh"},
        {"value":"Kyocera","label":"Kyocera"}
      ],
      "products": [
        {"value":"Laser","label":"激光"},
        {"value":"Inkjet","label":"喷墨"}
      ],
      "productCategories": [
        {"value":"MFP","label":"多功能一体机"},
        {"value":"Laser Printer","label":"激光打印机"},
        {"value":"Inkjet Printer","label":"喷墨打印机"}
      ],
      "formats": [
        {"value":"A4","label":"A4"},
        {"value":"A3","label":"A3"},
        {"value":"Letter","label":"Letter"}
      ],
      "colorTypes": [
        {"value":"Color","label":"彩色"},
        {"value":"Mono","label":"黑白"}
      ],
      "channels": [
        {"value":"Direct","label":"直销"},
        {"value":"Dealer","label":"经销商"},
        {"value":"VAR","label":"VAR"},
        {"value":"SI","label":"系统集成商"}
      ],
      "channelGroups": [
        {"value":"Online","label":"线上"},
        {"value":"Offline","label":"线下"},
        {"value":"Direct","label":"直销"}
      ],
      "inkTypes": [
        {"value":"Ink Tank","label":"墨仓式"},
        {"value":"Ink Cartridge","label":"墨盒式"}
      ],
      "speedRangesA4": ["<20 ppm","20-40 ppm","40-70 ppm",">70 ppm"],
      "speedRangesLetter": ["<20 ppm","20-40 ppm","40-70 ppm",">70 ppm"]
    },
    "dimensions": [
      {"value":"Year","label":"Year (年份)","category":"time","group":"时间维度","dataType":"enum","description":"数据统计年份，格式为 YYYY"},
      {"value":"Half Year","label":"Half Year (半年度)","category":"time","group":"时间维度","dataType":"enum","description":"数据统计半年度，格式为 YYYYH1 或 YYYYH2"},
      {"value":"Global Region","label":"Global Region (全球区域)","category":"geo","group":"地理维度","dataType":"enum","description":"全球地理区域划分：Americas/EMEA/APJ"},
      {"value":"Region","label":"Region (区域)","category":"geo","group":"地理维度","dataType":"enum","description":"区域划分，如 Western Europe、North America"},
      {"value":"Country","label":"Country (国家)","category":"geo","group":"地理维度","dataType":"enum","description":"国家，使用 ISO 3166-1 alpha-2 代码"},
      {"value":"Company","label":"Company (公司)","category":"vendor","group":"厂商维度","dataType":"enum","description":"母公司名称"},
      {"value":"Brand","label":"Brand (品牌)","category":"vendor","group":"厂商维度","dataType":"enum","description":"产品销售品牌"},
      {"value":"OEM","label":"OEM (原始制造商)","category":"vendor","group":"厂商维度","dataType":"enum","description":"OEM 原始制造商名称"},
      {"value":"Product","label":"Product (品类)","category":"product","group":"产品维度","dataType":"enum","description":"产品品类：Laser（激光）/ Inkjet（喷墨）"},
      {"value":"Product Category","label":"Product Category (产品类别)","category":"product","group":"产品维度","dataType":"enum","description":"产品类别：MFP/Laser Printer/Inkjet Printer"},
      {"value":"Format","label":"Format (幅面)","category":"product","group":"产品维度","dataType":"enum","description":"纸张幅面：A4/A3/Letter"},
      {"value":"Color Type","label":"Color/Mono (色彩类型)","category":"product","group":"产品维度","dataType":"enum","description":"色彩类型：Color（彩色）/ Mono（黑白）"},
      {"value":"Speed Range A4","label":"Speed Range A4 (A4速度段)","category":"product","group":"速度维度","dataType":"enum","description":"A4 速度段分组：<20 ppm/20-40 ppm/40-70 ppm/>70 ppm"},
      {"value":"ADF","label":"ADF (自动输稿器)","category":"function","group":"功能维度","dataType":"enum","description":"是否配备自动输稿器：Y/N"},
      {"value":"Duplex","label":"Duplex (双面打印)","category":"function","group":"功能维度","dataType":"enum","description":"是否支持自动双面打印：Y/N"},
      {"value":"Wireless","label":"Wireless (无线)","category":"function","group":"功能维度","dataType":"enum","description":"是否支持无线连接：Y/N"},
      {"value":"Ink Tank/ Ink Cartridge","label":"墨仓/墨盒","category":"consumable","group":"耗材维度","dataType":"enum","applicableTo":"inkjet","description":"耗材类型：Ink Tank（墨仓式）/ Ink Cartridge（墨盒式）"},
      {"value":"Channel","label":"Channel (渠道)","category":"channel","group":"渠道维度","dataType":"enum","description":"销售渠道：Direct/Dealer/VAR/SI"},
      {"value":"Channel Group","label":"Channel Group (渠道组)","category":"channel","group":"渠道维度","dataType":"enum","description":"渠道组：Online（线上）/ Offline（线下）/ Direct（直销）"},
      {"value":"Production Classification","label":"Production Classification (生产级)","category":"business","group":"业务分级","dataType":"enum","applicableTo":"laser","description":"生产级分类（激光专属）"},
      {"value":"Business Inkjet Detail","label":"Business Inkjet Detail (商用级别)","category":"business","group":"业务分级","dataType":"enum","applicableTo":"inkjet","description":"商用喷墨级别：Entry/Mid-range/High-end"},
      {"value":"Model Name","label":"Model Name (型号)","category":"product","group":"产品维度","dataType":"string","description":"具体产品型号名称"}
    ],
    "aggregations": [
      {"value":"sum_units","label":"销量求和","format":"number","unit":"K","group":"基础","sourceField":"units","decimalPlaces":0,"applicableTo":null,"description":"统计周期内销量总和","calculateMethod":"SQL: SUM(units)"},
      {"value":"sum_value","label":"销售额","format":"currency","unit":"$M","group":"基础","sourceField":"value","decimalPlaces":1,"applicableTo":null,"description":"统计周期内销售额总和","calculateMethod":"SQL: SUM(value)"},
      {"value":"count_rows","label":"记录数","format":"number","unit":"","group":"基础","sourceField":"id","decimalPlaces":0,"applicableTo":null,"description":"符合条件的记录行数","calculateMethod":"SQL: COUNT(*)"},
      {"value":"avg_units","label":"平均销量","format":"number","unit":"","group":"基础","sourceField":"units","decimalPlaces":1,"applicableTo":null,"description":"每个型号的平均销量","calculateMethod":"SQL: AVG(units)"},
      {"value":"avg_value","label":"平均单价","format":"currency","unit":"$","group":"基础","sourceField":"value","decimalPlaces":0,"applicableTo":null,"description":"平均销售单价","calculateMethod":"SQL: AVG(value)"},
      {"value":"asp","label":"平均单价","format":"currency","unit":"$","group":"衍生","sourceField":"asp","decimalPlaces":0,"applicableTo":null,"description":"平均销售单价（总销售额/总销量）","calculateMethod":"SQL: SUM(value) / SUM(units)"},
      {"value":"market_share","label":"市场份额","format":"percent","unit":"%","group":"衍生","sourceField":"units","decimalPlaces":1,"applicableTo":null,"description":"销量占整体市场的百分比","calculateMethod":"SQL: SUM(units) / SUM(total_units) * 100"},
      {"value":"value_share","label":"销售额份额","format":"percent","unit":"%","group":"衍生","sourceField":"value","decimalPlaces":1,"applicableTo":null,"description":"销售额占整体市场的百分比","calculateMethod":"SQL: SUM(value) / SUM(total_value) * 100"},
      {"value":"yoy_growth","label":"同比增长率","format":"percent","unit":"%","group":"衍生","sourceField":"units","decimalPlaces":1,"applicableTo":null,"description":"与去年同期的增长率","calculateMethod":"(本期销量 - 上年同期销量) / 上年同期销量 * 100"},
      {"value":"hoh_growth","label":"环比增长率","format":"percent","unit":"%","group":"衍生","sourceField":"units","decimalPlaces":1,"applicableTo":null,"description":"与上一统计周期的增长率","calculateMethod":"(本期销量 - 上期销量) / 上期销量 * 100"},
      {"value":"inktank_penetration","label":"墨仓式渗透率","format":"percent","unit":"%","group":"高级","sourceField":"units","decimalPlaces":1,"applicableTo":"inkjet","description":"墨仓式产品销量占喷墨整体的比例","calculateMethod":"SQL: SUM(ink_tank_units) / SUM(inkjet_total_units) * 100"},
      {"value":"mfp_pct","label":"MFP占比","format":"percent","unit":"%","group":"高级","sourceField":"units","decimalPlaces":1,"applicableTo":null,"description":"多功能一体机销量占比","calculateMethod":"SQL: SUM(mfp_units) / SUM(total_units) * 100"},
      {"value":"avg_units_per_model","label":"单型号平均销量","format":"number","unit":"","group":"高级","sourceField":"units","decimalPlaces":1,"applicableTo":null,"description":"每个型号的平均销量","calculateMethod":"SQL: SUM(units) / COUNT(DISTINCT model_name)"},
      {"value":"cr5_concentration","label":"品牌集中度 CR5","format":"percent","unit":"%","group":"高级","sourceField":"units","decimalPlaces":1,"applicableTo":null,"description":"前5大品牌销量之和占比","calculateMethod":"SQL: SUM(top5_units) / SUM(total_units) * 100"}
    ],
    "productTypes": [
      {"value":"all","label":"全品类"},
      {"value":"laser","label":"激光打印"},
      {"value":"inkjet","label":"喷墨打印"}
    ],
    "viewTypes": ["table","bar","line","pie","heatmap"],
    "templates": [
      {"id":"tpl_001","name":"品牌份额分析","description":"分析各品牌的市场份额和排名","category":"market_overview","rowFields":["Brand"],"colField":"Year","valueFields":["sum_units","market_share"],"applicableTo":"all","recommendedViews":["table","bar","pie"]},
      {"id":"tpl_002","name":"区域销量排名","description":"分析各区域的销量情况和市场份额","category":"geo_analysis","rowFields":["Region"],"colField":"Year","valueFields":["sum_units","sum_value"],"applicableTo":"all","recommendedViews":["table","bar"]},
      {"id":"tpl_003","name":"墨仓式渗透率分析","description":"分析喷墨产品中墨仓式的渗透率","category":"tech_analysis","rowFields":["Region","Brand"],"colField":"Year","valueFields":["inktank_penetration","sum_units"],"applicableTo":"inkjet","recommendedViews":["table","bar"]}
    ]
  }
}
```

**数据来源说明**：

| 字段 | 数据来源 | 说明 |
|------|----------|------|
| filterOptions.* | `idc_printer_market` 动态查询 | 从主表 DISTINCT 查询 |
| dimensions | `idc_dimensions` 表 | 维度定义 |
| aggregations | `idc_aggregations` 表 | 统计量定义 |
| templates | `idc_pivot_templates` 表 | 预设模板 |

---

### 11.4 市场总览

```
GET /api/idc/overview
```

**功能说明**：返回市场总览页面所需的全部数据，包括 KPI 指标、品类结构、产品形态、渠道结构、品牌 TOP N、国家 TOP N、趋势数据。

**请求参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| year | string | 最新年份 | 年份筛选，与 half_year 互斥 |
| half_year | string | - | 半年度筛选，与 year 互斥 |
| product_type | string | all | all / laser / inkjet |
| top_n_brands | number | 10 | 品牌 TOP N 数量 |
| top_n_countries | number | 10 | 国家 TOP N 数量 |
| trend_periods | number | 6 | 趋势数据期数 |

**业务规则**：
- `year` 和 `half_year` 不可同时传入
- `year` 筛选时：当前周期为该年最大半年度，同比周期为去年最大半年度
- `half_year` 筛选时：同比周期为去年同半年度，环比周期为上半个年度
- `product_type=laser` 映射为 `product='Laser'`
- `product_type=inkjet` 映射为 `product='Inkjet'`
- `product_type=all` 不过滤品类

**KPI 计算规则**：

```
unitsYoY = (当前销量 - 去年同期销量) / 去年同期销量 * 100
valueYoY = (当前销售额 - 去年同期销售额) / 去年同期销售额 * 100
unitsMoM = (当前销量 - 上期销量) / 上期销量 * 100  （仅 half_year 筛选时有效）
valueMoM = (当前销售额 - 上期销售额) / 上期销售额 * 100  （仅 half_year 筛选时有效）
aspYoY   = (当前ASP - 去年同期ASP) / 去年同期ASP * 100
aspMoM   = (当前ASP - 上期ASP) / 上期ASP * 100  （仅 half_year 筛选时有效）
activeModelsYoY = (当前活跃型号数 - 去年同期活跃型号数) / 去年同期活跃型号数 * 100
activeModelsMoM = (当前活跃型号数 - 上期活跃型号数) / 上期活跃型号数 * 100  （仅 half_year 筛选时有效）
countriesCoveredYoY = (当前国家数 - 去年同期国家数) / 去年同期国家数 * 100
countriesCoveredMoM = (当前国家数 - 上期国家数) / 上期国家数 * 100  （仅 half_year 筛选时有效）
```

**响应字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| data.kpi | object | KPI 指标 |
| data.kpi.totalUnits | number | 总销量（台） |
| data.kpi.totalValue | number | 总销售额（百万美元） |
| data.kpi.asp | number | 平均单价（美元） |
| data.kpi.activeModels | number | 活跃型号数 |
| data.kpi.countriesCovered | number | 覆盖国家数 |
| data.kpi.unitsYoY | number | 销量同比变化率（%） |
| data.kpi.valueYoY | number | 销售额同比变化率（%） |
| data.kpi.unitsMoM | number | 销量环比变化率（%） |
| data.kpi.valueMoM | number | 销售额环比变化率（%） |
| data.kpi.aspYoY | number | ASP 同比变化率（%） |
| data.kpi.aspMoM | number | ASP 环比变化率（%） |
| data.kpi.activeModelsYoY | number | 活跃型号数同比变化率（%） |
| data.kpi.activeModelsMoM | number | 活跃型号数环比变化率（%） |
| data.kpi.countriesCoveredYoY | number | 国家数同比变化率（%） |
| data.kpi.countriesCoveredMoM | number | 国家数环比变化率（%） |
| data.kpi.currentPeriod | string | 当前统计周期 |
| data.kpi.previousPeriod | string | 上一统计周期 |
| data.kpi.yoyPeriod | string | 同比周期描述 |
| data.category | object | 品类结构：laser / inkjet |
| data.form | object | 产品形态：mfp / printer |
| data.channel | object | 渠道结构：direct / indirect |
| data.brands | BrandItem[] | 品牌 TOP N 列表 |
| data.countries | CountryItem[] | 国家 TOP N 列表 |
| data.trend | object | 趋势数据 |

**BrandItem 结构**：

| 字段 | 类型 | 说明 |
|------|------|------|
| rank | number | 排名，从 1 开始 |
| name | string | 品牌名称 |
| units | number | 销量（台） |
| value | number | 销售额（百万美元） |
| share | number | 销量份额（%），保留 1 位小数 |
| asp | number | 平均单价（美元） |
| yoy | number | 同比变化率（%） |

**CountryItem 结构**：

| 字段 | 类型 | 说明 |
|------|------|------|
| rank | number | 排名，从 1 开始 |
| code | string | 国家代码 |
| name | string | 国家中文名称 |
| units | number | 销量（台） |
| value | number | 销售额（百万美元） |
| share | number | 销量份额（%） |

---

### 11.5 地理分析

```
GET /api/idc/geography
```

**请求参数**：`year`、`half_year`、`product_type`、`metric`（units/value/asp）、`top_n`（默认50）

**响应结构**：

```json
{
  "success": true,
  "data": {
    "heatmap": [
      { "rank":1,"code":"US","name":"美国","units":30000000,"value":2040,"asp":680,"share":24.0 },
      { "rank":2,"code":"CN","name":"中国","units":20000000,"value":1200,"asp":600,"share":16.0 },
      { "rank":3,"code":"DE","name":"德国","units":8750000,"value":595,"asp":680,"share":7.0 }
    ],
    "globalRegions": [
      { "name":"美洲","code":"Americas","units":45000000,"value":3060,"share":36.0,"countriesCount":35 },
      { "name":"欧洲/中东/非洲","code":"EMEA","units":40000000,"value":2720,"share":32.0,"countriesCount":65 },
      { "name":"亚太","code":"APJ","units":40000000,"value":2720,"share":32.0,"countriesCount":28 }
    ]
  }
}
```

**说明**：热力图按 `units` 降序排列。

---

### 11.6 国家详情

```
GET /api/idc/geography/country/{countryCode}
```

**路径参数**：`countryCode`（ISO 3166-1 alpha-2 代码，如 US、CN）

**请求参数**：`year`、`half_year`、`product_type`

**错误响应**：

```json
{
  "success": false,
  "error": {
    "error_code": "NOT_FOUND",
    "message": "未找到国家代码：XX（请使用 ISO 3166-1 alpha-2 标准代码）"
  }
}
```

---

### 11.7 品牌分析

```
GET /api/idc/brand
```

**请求参数**：`year`、`half_year`、`product_type`、`top_n`（默认10）、`compare_brands`（逗号分隔，最多5个）

**响应**：

```json
{
  "success": true,
  "data": {
    "topBrands": [ /* BrandItem[] */ ],
    "compareBrands": [ /* BrandCompare[] */ ],
    "oemDistribution": [ /* OEMItem[] */ ],
    "brandTrend": {
      "periods": ["2025H2","2025H1","2024H2","2024H1"],
      "series": [
        { "name":"HP","data":[17500000,17500000,16993548,16993548] },
        { "name":"Canon","data":[12500000,12500000,12078671,12078671] }
      ]
    }
  }
}
```

**BrandCompare 结构**：

| 字段 | 类型 | 说明 |
|------|------|------|
| brand | string | 品牌名称 |
| units | number | 销量（台） |
| value | number | 销售额（百万美元） |
| share | number | 销量份额（%） |
| asp | number | 平均单价（美元） |
| activeModels | number | 活跃型号数 |
| yoy | number | 同比变化率（%） |
| regions | string[] | 主要销售区域列表 |

---

### 11.8 渠道分析

```
GET /api/idc/channel
```

**请求参数**：`year`、`half_year`、`product_type`、`metric`（units/value）

**桑基图数据来源**：从 `idc_printer_market` 表的 `channel` 和 `brand` 字段聚合，无需额外关系表。

**桑基图节点 ID 格式**：`{type}_{name}`，如 `channel_Direct`、`brand_HP`

---

### 11.9 技术分析

```
GET /api/idc/technology
```

**请求参数**：`year`、`half_year`、`product_type`（默认 inkjet）、`analysis_type`（all/ink_tank/speed/mfp）

**墨仓式渗透率计算**：仅适用于 `product='Inkjet'` 的数据

---

### 11.10 产品搜索

```
GET /api/idc/product/search
```

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词，最小 2 字符 |
| brand | string | 否 | 品牌筛选 |
| product | string | 否 | Laser / Inkjet |
| format | string | 否 | A4 / A3 / Letter |
| limit | number | 否 | 默认 20 |

**modelKey 格式**：`品牌-型号名`（URL 安全），用于后续对比接口。例如：`HP-LaserJet-Pro-MFP-M428fdw`

---

### 11.11 产品对比

```
GET /api/idc/product/compare
```

**请求参数**：`model_keys`（必填，逗号分隔，最多5个）、`compare_type`（all/spec/market/region/channel/trend）、`year`、`half_year`

**model_keys 解析**：将 `品牌-型号名` 格式拆分为 `brand` 和 `model_name` 后查询。

**规格参数矩阵**（`specMatrix`）：数据来源为 `idc_printer_market` 表中的规格字段（speed_range_a4、adf、duplex、wireless、function_spec、ink_type、duty_cycle、weight）。详细产品技术规格（如 A4 黑白速度、首页输出时间、墨盒容量等）需从 `file_products` 或 `product_specs` 表单独获取。

---

### 11.12 透视分析

```
POST /api/idc/explore
```

**功能**：支持自定义维度和统计量的通用透视查询，返回交叉表格数据。

**请求体**：

```json
{
  "filters": {
    "year": ["2025"],
    "product_type": "all"
  },
  "rowFields": ["Brand"],
  "colField": "Year",
  "valueFields": [
    { "aggregation": "sum_units", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "market_share", "format": "percent", "decimalPlaces": 1 }
  ],
  "sortField": "2025 销量",
  "sortOrder": "desc",
  "page": 1,
  "pageSize": 20
}
```

**统计量实现映射**：

| aggregation | SQL |
|-------------|-----|
| `sum_units` | `SUM(units)` |
| `sum_value` | `SUM(value)` |
| `asp` | `SUM(value) / SUM(units)` |
| `market_share` | `SUM(units) * 100.0 / :grand_total_units` |
| `value_share` | `SUM(value) * 100.0 / :grand_total_value` |
| `yoy_growth` | 子查询：`(本期 - 去年同期) / 去年同期 * 100` |
| `hoh_growth` | 子查询：`(本期 - 上期) / 上期 * 100` |
| `inktank_penetration` | `SUM(CASE WHEN ink_type='Ink Tank' THEN units ELSE 0 END) * 100.0 / SUM(units)` |
| `mfp_pct` | `SUM(CASE WHEN product_category='MFP' THEN units ELSE 0 END) * 100.0 / SUM(units)` |

**headers 结构**：

```json
[
  ["Brand", "品牌"],
  ["2024 销量", "sum_units"],
  ["2025 销量", "sum_units"],
  ["2024 份额", "market_share"],
  ["2025 份额", "market_share"]
]
```

第一列为维度标签和 key，后续每两列为一组（显示标签 + 统计量类型），列维度有多少值就有多少组。

---

## 十二、IDC 数据库表设计

### 12.1 主数据表：`idc_printer_market`

```sql
CREATE TABLE idc_printer_market (
    -- 主键
    id              BIGSERIAL PRIMARY KEY,

    -- 时间维度
    year            INTEGER NOT NULL,
    half_year       VARCHAR(6),

    -- 地理维度
    global_region   VARCHAR(20),
    region          VARCHAR(50),
    country         VARCHAR(10),
    country_name    VARCHAR(50),

    -- 厂商维度
    company         VARCHAR(100),
    vendor          VARCHAR(100),
    brand           VARCHAR(100),
    oem             VARCHAR(100),

    -- 产品维度
    product         VARCHAR(20),
    product_category VARCHAR(50),
    format          VARCHAR(10),
    color_type      VARCHAR(10),

    -- 技术规格
    speed_range_a4  VARCHAR(20),
    adf             VARCHAR(1),
    duplex          VARCHAR(1),
    wireless        VARCHAR(1),
    function_spec   VARCHAR(100),

    -- 耗材维度（喷墨）
    ink_type        VARCHAR(20),

    -- 业务分级
    production_classification VARCHAR(50),
    business_inkjet_detail   VARCHAR(50),

    -- 渠道维度
    channel         VARCHAR(50),
    channel_group   VARCHAR(20),

    -- 度量值
    units           BIGINT,
    value           DECIMAL(18,2),
    asp             DECIMAL(10,2),
    active_models   INTEGER,

    -- 型号信息
    model_name      VARCHAR(200),

    -- 物理规格
    duty_cycle      INTEGER,
    weight          DECIMAL(8,2),

    -- 时间戳
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_idc_year ON idc_printer_market(year);
CREATE INDEX idx_idc_half_year ON idc_printer_market(half_year);
CREATE INDEX idx_idc_brand ON idc_printer_market(brand);
CREATE INDEX idx_idc_country ON idc_printer_market(country);
CREATE INDEX idx_idc_product ON idc_printer_market(product);
CREATE INDEX idx_idc_region ON idc_printer_market(region);
CREATE INDEX idx_idc_model ON idc_printer_market(model_name);
```

### 12.2 维度定义表：`idc_dimensions`

```sql
CREATE TABLE idc_dimensions (
    id              SERIAL PRIMARY KEY,
    value           VARCHAR(100) NOT NULL UNIQUE,
    label           VARCHAR(200) NOT NULL,
    category        VARCHAR(50) NOT NULL,
    "group"         VARCHAR(50) NOT NULL,
    applicable_to   VARCHAR(20),
    data_type       VARCHAR(20) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 12.3 统计量定义表：`idc_aggregations`

```sql
CREATE TABLE idc_aggregations (
    id              SERIAL PRIMARY KEY,
    value           VARCHAR(100) NOT NULL UNIQUE,
    label           VARCHAR(200) NOT NULL,
    format          VARCHAR(20) NOT NULL,
    unit            VARCHAR(20),
    "group"         VARCHAR(50) NOT NULL,
    source_field    VARCHAR(50),
    decimal_places  INTEGER DEFAULT 0,
    applicable_to   VARCHAR(20),
    description     TEXT,
    calculate_method TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 12.4 透视模板表：`idc_pivot_templates`

```sql
CREATE TABLE idc_pivot_templates (
    id                      VARCHAR(100) PRIMARY KEY,
    name                    VARCHAR(200) NOT NULL,
    description             TEXT,
    category                VARCHAR(50) NOT NULL,
    category_label          VARCHAR(100),
    row_fields_json         TEXT NOT NULL,
    col_field_json          TEXT,
    value_configs_json      TEXT NOT NULL,
    filters_json            TEXT NOT NULL,
    suggested_filters_json  TEXT NOT NULL,
    share_status            VARCHAR(20) NOT NULL,
    is_system               BOOLEAN NOT NULL DEFAULT FALSE,
    is_public               BOOLEAN NOT NULL DEFAULT FALSE,
    user_id                 VARCHAR(100),
    version                 INTEGER NOT NULL DEFAULT 1,
    created_at              TIMESTAMP,
    updated_at              TIMESTAMP
);
```

---

## 十三、权限码定义

| 权限码 | 说明 | 所属模块 |
|--------|------|----------|
| `dashboard:read` | 看板只读 | 系统 |
| `products:read` | 产品数据读取 | 产品 |
| `products:write` | 产品数据写入 | 产品 |
| `specs:read` | 规格数据读取 | 规格 |
| `specs:write` | 规格数据写入 | 规格 |
| `crawl:read` | 采集任务读取 | 采集 |
| `crawl:write` | 采集任务写入 | 采集 |
| `scheduler:read` | 调度状态读取 | 调度 |
| `scheduler:write` | 调度配置写入 | 调度 |
| `monitor:read` | 监控数据读取 | 监控 |
| `monitor:write` | 监控操作写入 | 监控 |
| `users:read` | 用户列表读取 | 用户 |
| `users:write` | 用户管理写入 | 用户 |
| `roles:read` | 角色列表读取 | 角色 |
| `roles:write` | 角色管理写入 | 角色 |
| `system:read` | 系统配置读取 | 系统 |
| `system:write` | 系统配置写入 | 系统 |
| `backup:read` | 备份状态读取 | 备份 |
| `backup:write` | 备份操作写入 | 备份 |

---

## 十四、错误码定义

| 错误码 | HTTP 状态码 | 说明 | 处理建议 |
|--------|-------------|------|----------|
| `INVALID_PARAMS` | 400 | 请求参数错误 | 检查参数格式和必填项 |
| `UNAUTHORIZED` | 401 | 未认证或 Token 过期 | 重新登录获取 Token |
| `FORBIDDEN` | 403 | 无访问权限 | 联系管理员授权 |
| `NOT_FOUND` | 404 | 数据不存在 | 检查请求的资源标识 |
| `COMPUTATION_ERROR` | 500 | 数据计算错误 | 查看服务端日志 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 | 查看服务端日志 |

---

**文档结束**
