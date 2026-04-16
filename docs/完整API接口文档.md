# BrandRadar API 接口完整文档

> 文档版本：v1.1
> 生成时间：2026-04-16
> 文档类型：接口规格说明书
> 状态：后端所有接口已实现完成，字段已对齐

---

## 接口概览

| 模块 | 路径前缀 | 接口数 | 说明 |
|------|----------|--------|------|
| System | `/` | 2 | 公开接口 |
| Auth | `/api/auth` | 3 | 认证相关 |
| Users | `/api/users` | 7 | 用户管理 |
| Roles | `/api/roles` | 5 | 角色管理 |
| Sessions | `/api/sessions` | 2 | 会话管理 |
| Announcements | `/api/announcements` | 4 | 公告管理 |
| Products | `/api` | 5 | 产品/品牌/国家 |
| Specs | `/api/specs` | 2 | 规格数据 |
| Country Mappings | `/api/country-mappings` | 2 | 国家映射 |
| Monitor | `/api/monitor` | 6 | 价格监控 |
| Alerts | `/api/alerts` | 4 | 告警管理 |
| Crawl | `/api/crawl` | 4 | 采集任务 |
| Scheduler | `/api/scheduler` | 5 | 任务调度 |
| Backup | `/api/backup` | 5 | 数据库备份 |
| Backup Heartbeat | `/api/backup/heartbeat` | 4 | 备份心跳 |
| Watchdog | `/api/watchdog` | 4 | 服务监听 |
| Stream | `/api/stream` | 3 | 实时推送(SSE) |
| IDC 市场分析 | `/api/idc` | 22 | IDC 数据分析 |
| **IDC 预设数据** | `/api/idc/preset` | 3 | 维度与统计量定义 |
| **IDC 模板管理** | `/api/idc/templates` | 6 | 透视表模板 |
| IDC 统计量 | `/api/idc/aggregations` | 3 | 统计量定义 |
| IDC 市场探索 | `/api/idc/explore` | 1 | 高级透视表 |
| IDC 双品类分析 | `/api/idc/overview` | 3 | 双品类分析 |
| IDC 导出 | `/api/idc` | 3 | 导出功能 |

**合计：约 96 个接口**

---

## 认证与权限

所有接口（除 `health` 外）均需携带 JWT Token：

```
Authorization: Bearer <access_token>
```

### 权限清单

| 权限标识 | 说明 |
|----------|------|
| `dashboard:read` | 读取仪表盘数据 |
| `template:write` | 创建/更新/删除模板 |
| `users:read` | 读取用户信息 |
| `users:write` | 创建/更新/删除用户 |
| `roles:read` | 读取角色 |
| `roles:write` | 创建/更新/删除角色 |
| `products:read` | 读取产品数据 |
| `specs:read` | 读取规格数据 |
| `monitor:read` | 读取监控数据 |
| `scheduler:read` | 读取调度状态 |
| `scheduler:write` | 管理调度任务 |
| `crawl:read` | 读取采集任务 |
| `crawl:write` | 触发/管理采集 |
| `backup:read` | 读取备份状态 |
| `backup:write` | 管理备份配置 |
| `system:read` | 读取系统状态 |
| `system:write` | 写入系统配置 |
| `system:config` | 系统初始化 |

### 预置角色

| 角色 | 权限 |
|------|------|
| `admin` | 所有权限 |
| `analyst` | dashboard:read, products:read, specs:read, monitor:read |
| `operator` | scheduler:read/write, crawl:read/write, backup:read/write |
| `viewer` | dashboard:read, products:read, monitor:read |

---

## 一、公开接口（无需认证）

### 1.1 健康检查

**接口**：`GET /health`

公开接口，无需 API Key，用于负载均衡器心跳检测。

**响应示例**：

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "env": "production",
    "db_backend": "postgresql",
    "uptime_seconds": 3600.5,
    "browser_engine": "playwright",
    "browser_check_mode": "light",
    "browser_ready": true,
    "browser_error": ""
  }
}
```

---

## 二、认证 `/api/auth`

### 2.1 用户登录

**接口**：`POST /api/auth/login`

**请求体**：

```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 86400
  }
}
```

---

### 2.2 获取当前用户信息

**接口**：`GET /api/auth/me`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "user_id": "uuid-xxx",
    "email": "user@example.com",
    "username": "admin",
    "nickname": "管理员",
    "phone": "13800138000",
    "is_active": true,
    "user_type": "system",
    "roles": ["admin"],
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### 2.3 修改密码

**接口**：`POST /api/auth/password`

**请求体**：

```json
{
  "old_password": "旧密码",
  "new_password": "新密码"
}
```

**响应示例**：

```json
{
  "success": true,
  "data": null
}
```

---

### 2.4 登出

后端无独立登出接口。前端应在本地清除存储的 access_token，完成前端侧的登出操作。

---

## 三、用户管理 `/api/users`

### 3.1 创建用户（管理员）

**接口**：`POST /api/users`
**权限**：`users:write`

**请求体**：

```json
{
  "email": "newuser@example.com",
  "password": "初始密码",
  "user_type": "system",
  "roles": ["analyst"],
  "username": "newuser",
  "nickname": "新用户",
  "phone": "13800138001"
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "email": "newuser@example.com",
    "username": "newuser",
    "nickname": "新用户",
    "phone": "13800138001",
    "user_type": "system",
    "is_active": true,
    "roles": ["analyst"],
    "permissions": ["dashboard:read", "products:read"],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### 3.2 查询用户列表

**接口**：`GET /api/users`
**权限**：`users:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `user_type` | string | `system` \| `frontend` |
| `page` | int | 页码（从1开始） |
| `page_size` | int | 每页条数（最大200） |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid-xxx",
        "email": "admin@example.com",
        "username": "admin",
        "nickname": "管理员",
        "phone": "13800138000",
        "user_type": "system",
        "is_active": true,
        "roles": ["admin"],
        "permissions": [],
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "page_size": 50,
    "total": 10
  }
}
```

---

### 3.3 查询单个用户

**接口**：`GET /api/users/{user_id}`
**权限**：`users:read`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "email": "user@example.com",
    "username": "user",
    "nickname": "用户",
    "phone": "13800138001",
    "user_type": "system",
    "is_active": true,
    "roles": ["analyst"],
    "permissions": ["dashboard:read", "products:read"],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### 3.4 更新用户

**接口**：`PUT /api/users/{user_id}`
**权限**：`users:write`

可更新字段：`is_active`, `roles`, `password`, `username`, `nickname`, `phone`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "email": "user@example.com",
    "username": "user",
    "nickname": "用户（已更新）",
    "phone": "13900000000",
    "user_type": "system",
    "is_active": false,
    "roles": ["viewer"],
    "permissions": ["dashboard:read"],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-02T00:00:00Z"
  }
}
```

---

### 3.5 删除用户

**接口**：`DELETE /api/users/{user_id}`
**权限**：`users:write`

**响应示例**：

```json
{
  "success": true,
  "data": null
}
```

---

### 3.6 获取当前用户资料

**接口**：`GET /api/users/me`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "username": "admin",
    "nickname": "管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "role": "admin"
  }
}
```

---

### 3.7 更新当前用户资料

**接口**：`PUT /api/users/me`

可更新字段：`nickname`, `email`, `phone`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "username": "admin",
    "nickname": "管理员（已更新）",
    "email": "admin2@example.com",
    "phone": "13900000000",
    "role": "admin"
  }
}
```

---

## 四、角色管理 `/api/roles`

### 4.1 查询所有角色

**接口**：`GET /api/roles`
**权限**：`roles:read`

**响应示例**：

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "name": "admin",
      "label": "管理员",
      "description": "拥有所有权限",
      "is_system": true,
      "permissions": [],
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### 4.2 查询单个角色

**接口**：`GET /api/roles/{role_id}`
**权限**：`roles:read`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "name": "analyst",
    "label": "分析师",
    "description": "数据分析角色",
    "is_system": true,
    "permissions": [],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### 4.3 创建自定义角色

**接口**：`POST /api/roles`
**权限**：`roles:write`

**请求体**：

```json
{
  "name": "custom_role",
  "label": "自定义角色",
  "description": "描述",
  "permissions": ["dashboard:read", "products:read"]
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-zzz",
    "name": "custom_role",
    "label": "自定义角色",
    "description": "描述",
    "is_system": false,
    "permissions": ["dashboard:read", "products:read"],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### 4.4 更新角色

**接口**：`PUT /api/roles/{role_id}`
**权限**：`roles:write`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-zzz",
    "name": "custom_role",
    "label": "自定义角色（已更新）",
    "description": "更新后的描述",
    "is_system": false,
    "permissions": ["dashboard:read", "products:read", "monitor:read"],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-02T00:00:00Z"
  }
}
```

---

### 4.5 删除角色

**接口**：`DELETE /api/roles/{role_id}`
**权限**：`roles:write`

**响应示例**：

```json
{
  "success": true,
  "data": null
}
```

**注意**：内置角色（admin/analyst/operator/viewer）不可删除。

---

## 五、会话管理 `/api/sessions`

### 5.1 会话列表

**接口**：`GET /api/sessions`
**权限**：`users:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `user_type` | string | `system` \| `frontend` |
| `page` | int | 页码 |
| `page_size` | int | 每页条数 |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "session_id": "uuid-xxx",
        "user_id": "uuid-user",
        "user_type": "system",
        "user_email": "admin@example.com",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2026-01-01T00:00:00Z",
        "last_active_at": "2026-01-02T10:00:00Z",
        "is_active": true
      }
    ]
  },
  "meta": {
    "page": 1,
    "page_size": 50,
    "total": 3
  }
}
```

---

### 5.2 终止会话

**接口**：`POST /api/sessions/{session_id}/terminate`
**权限**：`users:write`

**请求体**：

```json
{
  "reason": "手动登出原因"
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "session_id": "uuid-xxx",
    "terminated": true
  }
}
```

---

## 六、公告管理 `/api/announcements`

### 6.1 公告列表

**接口**：`GET /api/announcements`

| 参数 | 类型 | 说明 |
|------|------|------|
| `include_unpublished` | bool | 是否包含未发布公告 |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-xxx",
        "title": "系统升级通知",
        "content": "系统将于周末进行升级...",
        "level": "info",
        "is_published": true,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 6.2 新增公告

**接口**：`POST /api/announcements`
**权限**：`system:write`

**请求体**：

```json
{
  "title": "公告标题",
  "content": "公告内容（支持富文本）",
  "level": "info",
  "is_published": true
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "title": "公告标题",
    "content": "公告内容（支持富文本）",
    "level": "info",
    "is_published": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### 6.3 更新公告

**接口**：`PUT /api/announcements/{announcement_id}`
**权限**：`system:write`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "title": "已更新标题",
    "content": "已更新内容",
    "level": "warning",
    "is_published": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-02T00:00:00Z"
  }
}
```

---

### 6.4 删除公告

**接口**：`DELETE /api/announcements/{announcement_id}`
**权限**：`system:write`

**响应示例**：

```json
{
  "success": true,
  "data": null
}
```

## 七、产品数据 `/api`

### 7.1 查询产品列表

**接口**：`GET /api/products`
**权限**：`products:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `brand` | string | 品牌名称 |
| `country` | string | 国家代码 |
| `status` | string | `on_sale` \| `discontinued` |
| `page` | int | 页码 |
| `page_size` | int | 每页条数（最大200） |

---

### 7.2 查询指定品牌+国家的产品

**接口**：`GET /api/products/{brand}/{country}`
**权限**：`products:read`

---

### 7.3 返回所有品牌列表

**接口**：`GET /api/brands`
**权限**：`products:read`

---

### 7.4 返回配置文件的品牌信息

**接口**：`GET /api/brands/config`
**权限**：`products:read`

---

### 7.5 返回国家列表

**接口**：`GET /api/countries`
**权限**：`products:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `brand` | string | 按品牌过滤（可选） |

---

## 八、规格数据 `/api/specs`

### 8.1 已采集规格的产品 ID 列表

**接口**：`GET /api/specs/{brand}/{country}`
**权限**：`specs:read`

---

### 8.2 查询单个产品规格

**接口**：`GET /api/specs/{brand}/{country}/{product_id}`
**权限**：`specs:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `lang` | string | `both`（默认）\| `original` \| `en` |

---

## 九、国家映射 `/api/country-mappings`

### 9.1 查询品牌国家映射

**接口**：`GET /api/country-mappings/{brand}`
**权限**：`products:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `locale` | string | 语言代码，如 `zh-CN` / `en-US` |

---

### 9.2 更新品牌国家映射

**接口**：`PUT /api/country-mappings/{brand}/{country_code}`
**权限**：`scheduler:write`

---

## 十、价格监控 `/api/monitor`

### 10.1 查询价格变动记录

**接口**：`GET /api/monitor/price-changes`
**权限**：`monitor:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `brand` | string | 品牌 |
| `country` | string | 国家 |
| `status` | string | `on_sale` \| `discontinued` |
| `direction` | string | `up` \| `down` \| `stable` |
| `keyword` | string | 关键词 |
| `start_time` | string | 开始时间 |
| `end_time` | string | 结束时间 |
| `sort_by` | string | `time` \| `abs_change_pct` \| `change_pct` |
| `sort_order` | string | `asc` \| `desc` |
| `page` | int | 页码 |
| `page_size` | int | 每页条数（最大500） |

---

### 10.2 价格变动趋势

**接口**：`GET /api/monitor/price-changes/trend`
**权限**：`monitor:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `start_time` | string | 开始时间（必填） |
| `end_time` | string | 结束时间（必填） |
| `bucket` | string | `day` \| `week` \| `month`（必填） |
| `brand` | string | 品牌 |
| `country` | string | 国家 |
| `direction` | string | `up` \| `down` \| `stable` |

---

### 10.3 品牌国家热力图

**接口**：`GET /api/monitor/price-changes/heatmap`
**权限**：`monitor:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `start_time` | string | 开始时间（必填） |
| `end_time` | string | 结束时间（必填） |
| `direction` | string | `up` \| `down` \| `stable` |
| `brand` | string[] | 品牌列表 |
| `country` | string[] | 国家列表 |

---

### 10.4 Top 波动榜

**接口**：`GET /api/monitor/price-changes/top-volatility`
**权限**：`monitor:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `start_time` | string | 开始时间（必填） |
| `end_time` | string | 结束时间（必填） |
| `brand` | string | 品牌 |
| `country` | string | 国家 |
| `direction` | string | `up` \| `down` \| `all` |
| `limit` | int | 返回数量（最大200） |

---

### 10.5 单产品价格历史

**接口**：`GET /api/monitor/price-changes/{product_id}/history`
**权限**：`monitor:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `product_id` | string | 产品ID（必填） |
| `brand` | string | 品牌（必填） |
| `country` | string | 国家（必填） |
| `start_time` | string | 开始时间 |
| `end_time` | string | 结束时间 |
| `limit` | int | 返回条数（最大2000） |

---

### 10.6 系统监控总览

**接口**：`GET /api/monitor/overview`
**权限**：`monitor:read`

返回运维看板综合数据，包括：系统健康状态、调度服务状态、备份服务状态、服务监听状态、采集任务统计、告警处理统计、主机资源指标、数据库连接指标等。

---

## 十一、告警管理 `/api/alerts`

### 11.1 查询采集告警列表（新版）

**接口**：`GET /api/alerts`
**权限**：`monitor:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `brand` | string | 品牌 |
| `country` | string | 国家 |
| `status` | string | `pending` \| `resolved` |
| `alert_type` | string | 告警类型 |
| `page` | int | 页码 |
| `page_size` | int | 每页条数（最大500） |

---

### 11.2 处理告警（新版）

**接口**：`PUT /api/alerts/{alert_id}/resolve`
**权限**：`scheduler:write`

**请求体**：

```json
{
  "operator": "处理人",
  "notes": "处理备注"
}
```

---

### 11.3 查询预警列表（旧版）

**接口**：`GET /api/alerts/old`
**权限**：`monitor:read`

兼容旧版接口，支持更多过滤条件。

---

### 11.4 处理预警（旧版）

**接口**：`PUT /api/alerts/{alert_id}/decision`
**权限**：`scheduler:write`

---

## 十二、采集任务 `/api/crawl`

### 12.1 触发采集任务

**接口**：`POST /api/crawl`
**权限**：`crawl:write`
**状态码**：202（异步，立即返回 task_id）

**请求体**：

```json
{
  "brand": "HP",
  "country": "dk-da",
  "update_existing": true,
  "force": false
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "task_id": "uuid-xxx",
    "brand": "HP",
    "country": "dk-da",
    "status": "queued",
    "progress": 0,
    "product_count": 0,
    "new_count": 0,
    "updated_count": 0,
    "started_at": "2026-01-01T00:00:00Z",
    "finished_at": null,
    "error": null
  }
}
```

---

### 12.2 列出采集任务

**接口**：`GET /api/crawl`
**权限**：`crawl:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `brand` | string | 按品牌过滤 |
| `country` | string | 按国家过滤 |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "task_id": "uuid-xxx",
        "brand": "HP",
        "country": "dk-da",
        "status": "done",
        "progress": 100,
        "product_count": 150,
        "new_count": 10,
        "updated_count": 30,
        "started_at": "2026-01-01T00:00:00Z",
        "finished_at": "2026-01-01T00:05:00Z",
        "error": null
      }
    ]
  }
}
```

---

### 12.3 查询单个任务状态

**接口**：`GET /api/crawl/{task_id}`
**权限**：`crawl:read`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "task_id": "uuid-xxx",
    "brand": "HP",
    "country": "dk-da",
    "status": "done",
    "progress": 100,
    "product_count": 150,
    "new_count": 10,
    "updated_count": 30,
    "started_at": "2026-01-01T00:00:00Z",
    "finished_at": "2026-01-01T00:05:00Z",
    "error": null
  }
}
```

---

### 12.4 清理过期任务记录

**接口**：`DELETE /api/crawl/cleanup`
**权限**：`crawl:write`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "removed": 5
  }
}
```

---

## 十三、任务调度 `/api/scheduler`

### 13.1 触发采集任务（按品牌/国家）

**接口**：`POST /api/scheduler/crawl`
**权限**：`scheduler:write`
**状态码**：202

**请求体**：

```json
{
  "brand": "HP",
  "countries": ["dk-da", "se-se", "no-no"],
  "force": false,
  "update_existing": true
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "task_id": "uuid-xxx-1",
        "brand": "HP",
        "country": "dk-da",
        "status": "queued",
        "error": null
      },
      {
        "task_id": "uuid-xxx-2",
        "brand": "HP",
        "country": "se-se",
        "status": "queued",
        "error": null
      }
    ],
    "total": 2
  }
}
```

---

### 13.2 查看调度运行状态

**接口**：`GET /api/scheduler/status`
**权限**：`scheduler:read`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "mode": "auto",
    "interval_minutes": 1440,
    "cron_expression": "0 2 * * *",
    "silent_hours_enabled": true,
    "silent_start": "00:00",
    "silent_end": "06:00",
    "today_runs": 1,
    "max_daily_runs": 2,
    "next_run_in_seconds": 3600,
    "daemon_alive": true
  }
}
```

---

### 13.3 切换调度器模式

**接口**：`PUT /api/scheduler/mode`
**权限**：`scheduler:write`

**请求体**：

```json
{
  "mode": "auto"
}
```

- `auto`：自动调度，按配置定时触发
- `manual`：手动模式，仅通过接口触发

**响应示例**：

```json
{
  "success": true,
  "data": {
    "mode": "auto",
    "interval_minutes": 1440,
    "cron_expression": "0 2 * * *",
    "silent_hours_enabled": true,
    "silent_start": "00:00",
    "silent_end": "06:00",
    "today_runs": 1,
    "max_daily_runs": 2,
    "next_run_in_seconds": 3600,
    "daemon_alive": true
  }
}
```

---

### 13.4 配置自动调度时间

**接口**：`PUT /api/scheduler/schedule`
**权限**：`scheduler:write`

**请求体**：

```json
{
  "interval_minutes": 1440,
  "cron_expression": "0 2 * * *",
  "silent_hours_enabled": true,
  "silent_start": "00:00",
  "silent_end": "06:00"
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "interval_minutes": 1440,
    "cron_expression": "0 2 * * *",
    "silent_hours_enabled": true,
    "silent_start": "00:00",
    "silent_end": "06:00",
    "message": "调度时间配置已更新"
  }
}
```

---

### 13.5 查询采集任务列表

**接口**：`GET /api/scheduler/tasks`
**权限**：`scheduler:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `brand` | string | 按品牌过滤 |
| `country` | string | 按国家过滤 |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "task_id": "uuid-xxx",
        "brand": "HP",
        "country": "dk-da",
        "status": "done",
        "started_at": "2026-01-01T00:00:00Z",
        "finished_at": "2026-01-01T00:05:00Z",
        "product_count": 150,
        "new_count": 10,
        "updated_count": 30,
        "error": null,
        "progress": 100
      }
    ],
    "total": 1
  },
  "meta": {
    "done": 1,
    "failed": 0,
    "running": 0,
    "queued": 0
  }
}
```

---

## 十四、数据库备份 `/api/backup`

### 14.1 查看备份配置

**接口**：`GET /api/backup/config`
**权限**：`backup:read`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "schedule": "0 3 * * *",
    "retention_days": 7,
    "target": "local",
    "local_path": "/data/backups",
    "remote_enabled": false
  }
}
```

---

### 14.2 更新备份配置

**接口**：`PUT /api/backup/config`
**权限**：`backup:write`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "schedule": "0 3 * * *",
    "retention_days": 14,
    "target": "local",
    "local_path": "/data/backups",
    "remote_enabled": false
  },
  "meta": {
    "message": "backup config updated"
  }
}
```

---

### 14.3 手动触发备份

**接口**：`POST /api/backup/trigger`
**权限**：`backup:write`

**请求体**：

```json
{
  "force": false,
  "target": "local",
  "schedule_at": null
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "task_id": "uuid-xxx",
    "status": "running",
    "trigger": "manual",
    "started_at": "2026-01-01T00:00:00Z",
    "finished_at": null,
    "error": null
  }
}
```

---

### 14.4 查询备份任务列表

**接口**：`GET /api/backup/tasks`
**权限**：`backup:read`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "task_id": "uuid-xxx",
        "status": "done",
        "trigger": "scheduled",
        "file_path": "/data/backups/backup_20260101.sql.gz",
        "file_size": 1048576,
        "started_at": "2026-01-01T03:00:00Z",
        "finished_at": "2026-01-01T03:05:00Z",
        "error": null
      }
    ]
  },
  "meta": {
    "count": 1
  }
}
```

---

### 14.5 备份调度状态

**接口**：`GET /api/backup/status`
**权限**：`backup:read`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "daemon_alive": true,
    "last_run_at": "2026-01-01T03:00:00Z",
    "next_run_at": "2026-01-02T03:00:00Z",
    "enabled": true
  }
}
```

---

## 十五、备份心跳 `/api/backup/heartbeat`

### 15.1 获取备份服务器心跳状态

**接口**：`GET /api/backup/heartbeat/status`
**权限**：`backup:read`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "status": "connected",
    "last_heartbeat": "2026-01-01T12:00:00Z",
    "interval_seconds": 300
  }
}
```

---

### 15.2 获取心跳历史

**接口**：`GET /api/backup/heartbeat/history`
**权限**：`backup:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `limit` | int | 返回条数（最大500） |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "uuid-xxx",
        "status": "connected",
        "checked_at": "2026-01-01T12:00:00Z",
        "latency_ms": 50
      }
    ]
  },
  "meta": {
    "count": 1
  }
}
```

---

### 15.3 手动刷新心跳

**接口**：`POST /api/backup/heartbeat/refresh`
**权限**：`backup:write`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "status": "connected",
    "checked_at": "2026-01-01T12:00:00Z",
    "latency_ms": 45
  }
}
```

---

### 15.4 更新心跳配置

**接口**：`PUT /api/backup/heartbeat/config`
**权限**：`backup:write`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "interval_seconds": 300,
    "timeout_seconds": 10
  }
}
```

---

## 十六、服务监听 `/api/watchdog`

### 16.1 查看服务监听配置

**接口**：`GET /api/watchdog/config`
**权限**：`system:read`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "check_interval_seconds": 60,
    "services": ["scheduler", "backup", "crawl"]
  }
}
```

---

### 16.2 更新服务监听配置

**接口**：`PUT /api/watchdog/config`
**权限**：`system:write`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "check_interval_seconds": 120,
    "services": ["scheduler", "backup", "crawl"]
  },
  "meta": {
    "message": "watchdog config updated"
  }
}
```

---

### 16.3 查看服务监听状态

**接口**：`GET /api/watchdog/status`
**权限**：`system:read`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "daemon_alive": true,
    "last_check_at": "2026-01-01T12:00:00Z",
    "services": [
      { "name": "scheduler", "status": "healthy", "latency_ms": 10 },
      { "name": "backup", "status": "healthy", "latency_ms": 5 }
    ]
  }
}
```

---

### 16.4 手动执行服务检测

**接口**：`POST /api/watchdog/check`
**权限**：`system:write`

**响应示例**：

```json
{
  "success": true,
  "data": {
    "daemon_alive": true,
    "last_check_at": "2026-01-01T12:00:00Z",
    "services": [
      { "name": "scheduler", "status": "healthy", "latency_ms": 8 },
      { "name": "backup", "status": "healthy", "latency_ms": 4 },
      { "name": "crawl", "status": "healthy", "latency_ms": 12 }
    ]
  }
}
```

---

## 十七、实时推送 `/api/stream`

### 17.1 SSE 事件流

**接口**：`GET /api/stream/events`
**权限**：`system:read`

建立 SSE 连接，接收实时事件推送（如采集进度、系统告警等）。

---

### 17.2 发布测试事件

**接口**：`POST /api/stream/publish`
**权限**：`system:write`

**请求体**：

```json
{
  "event": "test",
  "topic": "global",
  "data": {}
}
```

---

### 17.3 SSE 订阅统计

**接口**：`GET /api/stream/stats`
**权限**：`system:read`

---

## 十八、全局汇总与系统 `/api`

### 18.1 全局数据汇总

**接口**：`GET /api/summary`
**权限**：`dashboard:read`

返回各品牌/国家产品数量统计，以及最近更新时间。

---

### 18.2 热重载调度配置

**接口**：`POST /api/scheduler/reload`
**权限**：`scheduler:write`

重新读取 `schedule_config.json`，立即生效，无需重启服务。

---

### 18.3 初始化预设数据

**接口**：`POST /api/admin/init-data`
**权限**：`system:config`

初始化系统预设数据（角色、权限、角色-权限关联、品牌元数据、国家元数据、国家翻译、IDC透视表模板），仅初始化不存在的记录，不会重复创建。

---

## 十九、IDC 市场分析 `/api/idc`

### 19.1 筛选接口

#### 获取筛选选项列表

**接口**：`GET /api/idc/filters/options`
**权限**：`dashboard:read`

返回所有可用的筛选选项，包括年份、半年度、品牌、国家、产品品类、幅面等维度。

#### 应用筛选条件

**接口**：`POST /api/idc/filters/apply`
**权限**：`dashboard:read`

用于级联筛选：选择某品牌后，返回该品牌下的可选国家列表等。

---

### 19.2 总览接口

#### 获取市场KPI

**接口**：`GET /api/idc/overview/kpi`
**权限**：`dashboard:read`

返回：总销量、总销售额、平均单价(ASP)、活跃型号数、覆盖国家数、同比/环比数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `filters` | string | 筛选条件JSON字符串（可选） |

#### 获取趋势图数据

**接口**：`GET /api/idc/overview/trend`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `trend_type` | string | `dual_axis` \| `region_stacked` \| `brand_share` |
| `top_n` | int | 品牌数量（brand_share类型时使用） |
| `filters` | string | 筛选条件JSON字符串（可选） |

#### 获取品牌分布

**接口**：`GET /api/idc/overview/brand`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | string | `top_n` \| `oem` \| `compare` |
| `brands` | string | 品牌列表，逗号分隔（compare类型时使用） |
| `filters` | string | 筛选条件JSON字符串（可选） |

---

### 19.3 地理分析接口

#### 获取国家排名热力图

**接口**：`GET /api/idc/geo/heatmap`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `metric` | string | `units` \| `value` \| `asp` |
| `filters` | string | 筛选条件JSON字符串（可选） |

#### 获取国家详情

**接口**：`GET /api/idc/geo/country/{country_code}`
**权限**：`dashboard:read`

返回指定国家的KPI指标、趋势数据、品牌结构、畅销型号TOP5。

#### 对比国家/区域

**接口**：`GET /api/idc/geo/compare`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `countries` | string | 国家代码，逗号分隔（2-4个，必填） |
| `filters` | string | 筛选条件JSON字符串（可选） |

---

### 19.4 透视表接口

#### 查询透视数据

**接口**：`POST /api/idc/explore/pivot`
**权限**：`dashboard:read`

**请求体**：

```json
{
  "row_fields": ["Brand", "Country"],
  "col_field": "Half Year",
  "value_fields": [
    { "aggregation": "sum_units", "source_field": "units", "label": "销量", "format": "number" }
  ],
  "filters": { "years": ["2025"] },
  "page": 1,
  "page_size": 100
}
```

#### 获取预置模板

**接口**：`GET /api/idc/explore/templates`
**权限**：`dashboard:read`

---

### 19.5 产品对比接口

#### 搜索产品

**接口**：`GET /api/idc/product/search`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `keyword` | string | 搜索关键词 |
| `brand` | string | 品牌筛选 |
| `format` | string | 幅面筛选 |
| `limit` | int | 返回数量（最大50） |

#### 对比产品

**接口**：`GET /api/idc/product/compare`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `model_keys` | string | 产品型号key，逗号分隔（2-4个，必填） |
| `compare_type` | string | `spec` \| `market` \| `region` \| `channel` \| `trend` |
| `filters` | string | 筛选条件JSON字符串（可选） |

---

### 19.6 渠道分析接口

#### 渠道桑基图

**接口**：`GET /api/idc/channel/sankey`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `metric` | string | `units` \| `value` |
| `filters` | string | 筛选条件JSON字符串（可选） |

#### 线上线下趋势

**接口**：`GET /api/idc/channel/online_offline`
**权限**：`dashboard:read`

**注意**：Direct = 线下，InDirect = 线上（估算）

#### 渠道堆叠图

**接口**：`GET /api/idc/channel/stacked`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `top_n_brands` | int | 品牌数量（最大50） |
| `filters` | string | 筛选条件JSON字符串（可选） |

---

### 19.7 价格分析接口

#### 价格段分析

**接口**：`GET /api/idc/price/segments`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `segment_type` | string | `market_capacity` \| `brand_position` \| `asp_trend` \| `brand_asp_compare` |
| `filters` | string | 筛选条件JSON字符串（可选） |

---

### 19.8 技术分析接口

#### 墨仓分析

**接口**：`GET /api/idc/tech/ink_tank`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `analysis_type` | string | `overall` \| `region` \| `brand` \| `drilldown` |
| `drilldown_type` | string | `country` \| `model`（drilldown时使用） |
| `filters` | string | 筛选条件JSON字符串（可选） |

#### 速度段分析

**接口**：`GET /api/idc/tech/speed_segment`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `analysis_type` | string | `capacity` \| `brand_share` \| `scatter` \| `trend` |
| `filters` | string | 筛选条件JSON字符串（可选） |

#### MFP功能分析

**接口**：`GET /api/idc/tech/mfp_function`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `analysis_type` | string | `coverage` \| `combination` \| `brand_diff` \| `region_diff` |
| `filters` | string | 筛选条件JSON字符串（可选） |

---

### 19.9 排行接口

#### 获取排名数据

**接口**：`GET /api/idc/rank`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `rank_type` | string | `brand` \| `country` \| `region` \| `model` \| `oem` |
| `sort_by` | string | `units` \| `value` \| `asp` |
| `order` | string | `asc` \| `desc` |
| `top_n` | int | 返回前N条（最大100） |
| `page` | int | 页码 |
| `page_size` | int | 每页条数（最大100） |
| `filters` | string | 筛选条件JSON字符串（可选） |

---

### 19.10 导出接口

#### 导出当前视图

**接口**：`POST /api/idc/export/current_view`
**权限**：`dashboard:read`

**请求体**：

```json
{
  "filters": {},
  "export_type": "current_view",
  "format": "excel"
}
```

#### 导出原始数据

**接口**：`POST /api/idc/export/raw_data`
**权限**：`dashboard:read`

**请求体**：

```json
{
  "filters": { "years": ["2025"], "brands": ["HP"] },
  "fields": ["Year", "Brand", "Country", "Units", "Value"],
  "format": "csv"
}
```

---

## 二十、IDC 统计量 `/api/idc/aggregations`

### 20.1 获取统计量定义列表

**接口**：`GET /api/idc/aggregations/definitions`
**权限**：`dashboard:read`

返回全部 27 个统计量的完整定义，包括基础聚合（10个）、核心衍生（11个）、高级分析（6个）。

### 20.2 获取统计量选项列表

**接口**：`GET /api/idc/aggregations/options`
**权限**：`dashboard:read`

返回用于 UI 下拉选择的统计量选项，包含分组信息。

### 20.3 获取默认统计量配置

**接口**：`GET /api/idc/aggregations/defaults`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `category` | string | 模板分类：`market_overview` \| `geo_analysis` \| `tech_analysis` \| `business_analysis` \| `deep_insight` |

---

## 二十一、IDC 预设数据 `/api/idc/preset`

### 21.1 获取所有预设数据

**接口**：`GET /api/idc/preset/all`
**权限**：`dashboard:read`

一次性获取所有维度定义和统计量定义，用于前端初始化下拉选项。

**响应示例**：
```json
{
  "success": true,
  "data": {
    "dimensions": [
      {
        "value": "Brand",
        "label": "品牌",
        "label_en": "Brand",
        "db_field": "brand",
        "field_type": "string",
        "category": "subject",
        "category_label": "主体",
        "display_order": 32,
        "description": "产品品牌，如 HP, Canon, Epson"
      }
    ],
    "aggregations": [
      {
        "aggregation": "sum_units",
        "name": "销量求和",
        "name_en": "Sum Units",
        "group": "basic_agg",
        "group_label": "基础聚合",
        "description": "汇总销量",
        "unit": "台",
        "format": "number",
        "decimal_places": 0,
        "display_order": 1
      }
    ],
    "dimension_groups": {
      "time": [...],
      "geo": [...],
      "subject": [...],
      "product": [...],
      "feature": [...],
      "channel": [...]
    },
    "aggregation_groups": {
      "basic_agg": [...],
      "core_derived": [...],
      "advanced_analysis": [...]
    }
  }
}
```

### 21.2 获取维度定义

**接口**：`GET /api/idc/preset/dimensions`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| category | string | 按分类筛选：`time`、`geo`、`product` 等 |
| active_only | boolean | 仅返回启用状态（默认 true） |

### 21.3 获取统计量定义

**接口**：`GET /api/idc/preset/aggregations`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| group | string | 按分组筛选：`basic_agg`、`core_derived`、`advanced_analysis` |
| active_only | boolean | 仅返回启用状态（默认 true） |

---

## 二十二、IDC 模板管理 `/api/idc/templates`

### 22.1 获取模板列表

**接口**：`GET /api/idc/templates`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| template_type | string | 模板类型：`system`/`user`/`public`/`all`（默认 `all`） |

**template_type 说明**：
| 类型 | 说明 |
|------|------|
| `system` | 系统预置模板（不可删除） |
| `user` | 当前用户的自定义模板（需带 X-User-Id） |
| `public` | 公开模板（系统模板 + 设为公开的用户模板） |
| `all` | 所有可访问模板 |

**认证方式**：通过 `X-User-Id` Header 标识用户

### 22.2 获取模板详情

**接口**：`GET /api/idc/templates/{template_id}`
**权限**：`dashboard:read`

---

### 22.3 创建模板

**接口**：`POST /api/idc/templates`
**权限**：`template:write`

**Header**：`X-User-Id: <user_id>`（必填）

**请求示例**：
```json
{
  "name": "我的分析模板",
  "description": "自定义品牌分析",
  "category": "custom",
  "row_fields": ["Brand", "Country"],
  "col_field": "Half_Year",
  "value_configs": [
    {
      "aggregation": "sum_units",
      "source_field": "units",
      "label": "销量",
      "format": "number",
      "decimal_places": 0
    }
  ],
  "share_status": "private"
}
```

---

### 22.4 更新模板

**接口**：`PUT /api/idc/templates/{template_id}`
**权限**：`dashboard:read`

**说明**：系统模板不可修改

---

### 22.5 删除模板

**接口**：`DELETE /api/idc/templates/{template_id}`
**权限**：`dashboard:read`

**说明**：系统模板不可删除

---

### 22.6 复制模板

**接口**：`POST /api/idc/templates/{template_id}/clone`
**权限**：`dashboard:read`

**Header**：`X-User-Id: <user_id>`（必填）

**请求示例**：
```json
{
  "name": "我的复制版"
}
```

---

## 二十四、IDC 市场探索 `/api/idc/explore`

### 高级透视表查询

**接口**：`POST /api/idc/explore/pivot/advanced`
**权限**：`dashboard:read`

执行高级透视表查询，支持 30+ 种聚合类型，包括 sum_units、sum_value、avg_units、asp、market_share、yoy_growth、hoh_growth、CR5 集中度等。支持多行维度、多列维度、多值字段的透视分析。

---

## 二十五、IDC 双品类分析 `/api/idc/overview`

### 23.1 双品类KPI查询

**接口**：`GET /api/idc/overview/kpi/dual_category`
**权限**：`dashboard:read`

返回激光与喷墨两大品类的 KPI 指标（销量、销售额、ASP、活跃型号数）及合计、占比。

| 参数 | 类型 | 说明 |
|------|------|------|
| `years` | string[] | 年份筛选 |
| `half_years` | string[] | 半年度筛选 |
| `global_regions` | string[] | 全球区域筛选 |

---

### 23.2 双品类趋势查询

**接口**：`GET /api/idc/overview/trend/dual_category`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `trend_type` | string | `dual_axis` \| `region_stacked` \| `brand_share` |
| `years` | string[] | 年份筛选 |
| `half_years` | string[] | 半年度筛选 |

---

### 23.3 品类品牌分布

**接口**：`GET /api/idc/overview/brand/category_distribution`
**权限**：`dashboard:read`

| 参数 | 类型 | 说明 |
|------|------|------|
| `top_n` | int | 返回 Top N 品牌（最大50） |
| `years` | string[] | 年份筛选 |
| `half_years` | string[] | 半年度筛选 |
| `global_regions` | string[] | 全球区域筛选 |

---

## 二十六、IDC 导出 `/api/idc`

### 24.1 导出当前视图

**接口**：`POST /api/idc/export/current_view`

导出当前透视表视图为 Excel 或 CSV 文件。

---

### 24.2 导出原始数据

**接口**：`POST /api/idc/export/raw_data`

导出 IDC 原始数据为 CSV 文件。

---

### 24.3 下载导出文件

**接口**：`GET /api/idc/exports/{filename}`

下载已导出的文件。文件名必须以 `export_` 开头。

---

## 附录

### A. 通用响应格式

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "page_size": 50,
    "total": 1234
  }
}
```

### B. 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

### C. 常用 HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 202 | 异步任务已接受 |
| 400 | 请求参数错误 |
| 401 | 未认证或 Token 无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### D. 统一字段映射（IDC模块）

| 数据库字段 | API字段 | 说明 |
|------------|---------|------|
| `year` | `year` | 年份 |
| `half_year` | `half_year` | 半年度（2025H1） |
| `vendor` / `company` | `brand` | 品牌 |
| `country` | `country` | 国家代码 |
| `product_category` | `product_category` | 产品品类（Printer/MFP） |
| `product` | `product` | 产品品类（Laser/Inkjet） |
| `product_detail` | `product_detail` | 产品详情 |
| `units` | `units` | 销量（台） |
| `value` | `value` | 销售额（USD M） |
| `format` | `format` | 幅面（A4/A3/Letter） |

---

> 文档生成时间：2026-04-16
> 后端所有接口已实现完成
