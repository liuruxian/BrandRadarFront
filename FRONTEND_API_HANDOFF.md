# BrandRadar 前端接口交付文档

> 交付对象：前端项目
> 
> 目的：给前端一份可直接对接的单文件接口说明，覆盖认证方式、统一返回结构、主要接口清单、推荐调用方式与注意事项。

---

## 1. 基础信息

### 1.1 服务地址

- 开发环境：`http://127.0.0.1:8000`
- Swagger UI：`/docs`
- OpenAPI JSON：`/openapi.json`

建议前端同时保留一份静态接口定义：
- 仓库内文件：`api_schema.json`
- 推荐复制到前端项目：`src/api/openapi.json`

### 1.2 认证方式

当前后端支持 JWT 认证。

公开接口：
- `GET /health`
- `POST /api/auth/login`
- `/docs`
- `/redoc`
- `/openapi.json`

其余接口默认都需要认证。

前端请求头统一带：

```http
Authorization: Bearer <access_token>
```

---

## 2. 统一返回格式

所有接口统一返回以下信封结构：

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "error": null
}
```

### 2.1 成功返回

```json
{
  "success": true,
  "data": {
    "items": []
  },
  "meta": {
    "total": 100,
    "page": 1,
    "page_size": 50,
    "total_pages": 2
  },
  "error": null
}
```

### 2.2 失败返回

```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "error_code": "AUTHENTICATION_FAILED",
    "message": "Invalid or missing token",
    "detail": null
  }
}
```

### 2.3 分页字段说明

分页接口通常在 `meta` 中返回：

- `total`: 总记录数
- `page`: 当前页，从 1 开始
- `page_size`: 每页条数
- `total_pages`: 总页数

---

## 3. 登录与用户态

### 3.1 登录

**POST** `/api/auth/login`

请求体：

```json
{
  "email": "admin@system",
  "password": "123456"
}
```

响应示例：

```json
{
  "success": true,
  "data": {
    "access_token": "<jwt>",
    "token_type": "bearer",
    "user_id": "uuid",
    "email": "admin@system",
    "user_type": "system",
    "roles": ["superadmin"]
  }
}
```

### 3.2 获取当前登录用户

**GET** `/api/auth/me`

### 3.3 修改当前登录用户密码

**POST** `/api/auth/password`

请求体：

```json
{
  "old_password": "old-pass",
  "new_password": "new-pass"
}
```

### 3.4 获取/更新当前用户个人资料

- **GET** `/api/users/me`
- **PUT** `/api/users/me`

`PUT /api/users/me` 请求体示例：

```json
{
  "nickname": "运营管理员",
  "email": "admin@system",
  "phone": "13800138000"
}
```

---

## 4. 权限说明

后端是 RBAC 模型，前端需要根据当前用户权限决定页面和按钮是否展示。

常见权限：

- `dashboard:read`
- `products:read`
- `specs:read`
- `crawl:read`
- `crawl:write`
- `scheduler:read`
- `scheduler:write`
- `monitor:read`
- `users:read`
- `users:write`
- `roles:read`
- `roles:write`
- `backup:read`
- `backup:write`
- `system:read`
- `system:write`

推荐前端在登录后：
1. 获取当前用户信息
2. 根据用户角色/权限生成菜单
3. 403 时提示“无权限访问”

---

## 5. 产品与规格接口

这是前端业务主链路。

### 5.1 查询产品列表

**GET** `/api/products`

查询参数：

- `brand`: 品牌，如 `HP`
- `country`: 国家代码，如 `dk-da`
- `status`: `on_sale` / `discontinued`
- `page`: 页码，默认 1
- `page_size`: 每页条数，默认 50，最大 200

示例：

```http
GET /api/products?brand=HP&country=dk-da&status=on_sale&page=1&page_size=20
```

### 5.2 查询指定品牌+国家产品

**GET** `/api/products/{brand}/{country}`

补充参数：
- `status`
- `page`
- `page_size`

> 前端建议统一优先使用 `/api/products` query 版，列表筛选更自然。

### 5.3 品牌列表

**GET** `/api/brands`

### 5.4 配置里的品牌与地区信息

**GET** `/api/brands/config`

适合前端初始化筛选器和静态配置展示。

### 5.5 国家列表

**GET** `/api/countries`

参数：
- `brand`：按品牌过滤

### 5.6 品牌国家映射

#### 查询指定品牌国家映射
**GET** `/api/country-mappings/{brand}`

参数：
- `locale`：默认 `zh-CN`，可传 `en-US`

#### 更新品牌国家映射
**PUT** `/api/country-mappings/{brand}/{country_code}`

适合后台配置页。

### 5.7 已采集规格产品 ID 列表

**GET** `/api/specs/{brand}/{country}`

### 5.8 查询单个产品规格

**GET** `/api/specs/{brand}/{country}/{product_id}`

参数：
- `lang`: `both` / `original` / `en`

建议：
- 详情页默认用 `both`
- 如 UI 只展示英文可传 `en`

---

## 6. 采集任务与调度接口

### 6.1 触发单个采集任务

**POST** `/api/crawl`

请求体：

```json
{
  "brand": "HP",
  "country": "dk-da",
  "update_existing": true,
  "force": false
}
```

返回 202，包含 `task_id`。

### 6.2 查询采集任务列表

**GET** `/api/crawl`

参数：
- `brand`
- `country`

### 6.3 查询单个采集任务状态

**GET** `/api/crawl/{task_id}`

### 6.4 清理过期采集任务

**DELETE** `/api/crawl/cleanup`

通常仅后台管理页使用。

### 6.5 批量触发调度采集

**POST** `/api/scheduler/crawl`

请求体示例：

```json
{
  "brand": "HP",
  "countries": ["dk-da", "fr-fr", "gb-en"],
  "update_existing": true,
  "force": false
}
```

适合“按品牌批量跑国家”的前端入口。

### 6.6 查看调度状态

**GET** `/api/scheduler/status`

返回内容适合展示：
- 当前模式
- 间隔分钟
- cron 表达式
- 静默期配置
- 今日执行次数
- 最大执行次数
- 下次执行倒计时
- daemon 是否存活

### 6.7 更新调度时间

**PUT** `/api/scheduler/schedule`

可选字段：

```json
{
  "interval_minutes": 60,
  "cron_expression": "0 2 * * *",
  "silent_hours_enabled": true,
  "silent_start": "00:00",
  "silent_end": "06:00"
}
```

### 6.8 查询调度任务列表

**GET** `/api/scheduler/tasks`

参数：
- `brand`
- `country`

### 6.9 热重载调度配置

**POST** `/api/scheduler/reload`

用于修改调度配置后立即生效。

---

## 7. 监控与告警接口

### 7.1 价格变动列表

**GET** `/api/monitor/price-changes`

支持参数：
- `brand`
- `country`
- `status`
- `direction`：`up` / `down` / `stable`
- `keyword`
- `start_time`
- `end_time`
- `page`
- `page_size`
- `sort_by`：`time` / `abs_change_pct` / `change_pct`
- `sort_order`：`asc` / `desc`

适合价格波动列表页。

### 7.2 价格变动趋势

**GET** `/api/monitor/price-changes/trend`

必填参数：
- `start_time`
- `end_time`
- `bucket`: `day` / `week` / `month`

可选参数：
- `brand`
- `country`
- `direction`

### 7.3 品牌国家热力图

**GET** `/api/monitor/price-changes/heatmap`

参数：
- `start_time`
- `end_time`
- `direction`
- `brand`：可多选
- `country`：可多选

### 7.4 Top 波动榜

**GET** `/api/monitor/price-changes/top-volatility`

参数：
- `start_time`
- `end_time`
- `brand`
- `country`
- `direction`: `up` / `down` / `all`
- `limit`

### 7.5 单产品价格历史

**GET** `/api/monitor/price-changes/{product_id}/history`

参数：
- `brand`（必填）
- `country`（必填）
- `start_time`
- `end_time`
- `limit`

### 7.6 系统监控总览

**GET** `/api/monitor/overview`

这是前端监控大屏的主接口，返回：
- 系统健康状态
- 调度状态
- 备份状态
- 备份心跳状态
- 看门狗状态
- 采集任务统计
- 告警统计
- 主机指标
- 数据库指标
- 任务性能
- 备份任务表现
- 日志指标

前端建议：
- 直接使用返回里的 `display_titles` 作为模块标题映射
- 不要在前端硬编码中文卡片名

### 7.7 预警列表

**GET** `/api/alerts`

参数：
- `brand`
- `country`
- `status`: `pending` / `resolved`
- `source_url`
- `product_id`
- `start_time`
- `end_time`
- `page`
- `page_size`

### 7.8 处理预警

**PUT** `/api/alerts/{alert_id}/decision`

用于标记预警处理结果。

---

## 8. 备份、心跳、看门狗

### 8.1 备份配置

- **GET** `/api/backup/config`
- **PUT** `/api/backup/config`

### 8.2 手动触发备份

**POST** `/api/backup/trigger`

### 8.3 备份任务列表

**GET** `/api/backup/tasks`

参数：
- `limit`

### 8.4 备份调度状态

**GET** `/api/backup/status`

### 8.5 备份服务器心跳

- **GET** `/api/backup/heartbeat/status`
- **GET** `/api/backup/heartbeat/history`
- **POST** `/api/backup/heartbeat/refresh`
- **PUT** `/api/backup/heartbeat/config`

### 8.6 服务看门狗

- **GET** `/api/watchdog/config`
- **PUT** `/api/watchdog/config`
- **GET** `/api/watchdog/status`
- **POST** `/api/watchdog/check`

前端建议：
- 这三块可组合成“运维后台”页面
- 状态展示推荐红黄绿灯 + 最近错误原因

---

## 9. 用户、角色、会话管理

### 9.1 用户管理

- **POST** `/api/users`
- **GET** `/api/users`
- **GET** `/api/users/{user_id}`
- **PUT** `/api/users/{user_id}`
- **DELETE** `/api/users/{user_id}`

`GET /api/users` 支持：
- `user_type`: `system` / `frontend`
- `page`
- `page_size`

### 9.2 角色管理

- **GET** `/api/roles`
- **POST** `/api/roles`
- **GET** `/api/roles/{role_id}`
- **PUT** `/api/roles/{role_id}`
- **DELETE** `/api/roles/{role_id}`

### 9.3 会话管理

- **GET** `/api/sessions`
- **POST** `/api/sessions/{session_id}/terminate`

`GET /api/sessions` 支持：
- `user_type`
- `page`
- `page_size`

适合后台安全审计页。

---

## 10. 公告与 IDC 模块

### 10.1 公告

- **GET** `/api/announcements`
- **POST** `/api/announcements`
- **PUT** `/api/announcements/{announcement_id}`
- **DELETE** `/api/announcements/{announcement_id}`

`GET /api/announcements` 参数：
- `include_unpublished`

适合首页公告栏、系统通知配置页。

### 10.2 IDC 模块

- **GET** `/api/idc/home`
- **GET** `/api/idc/modules`
- **GET** `/api/idc/insights`
- **GET** `/api/idc/brands`
- **GET** `/api/idc/countries`
- **GET** `/api/idc/categories`
- **GET** `/api/idc/trend`

部分参数：
- `GET /api/idc/insights?limit=10`
- `GET /api/idc/brands?top_n=10`
- `GET /api/idc/countries?top_n=10`
- `GET /api/idc/categories?top_n=10`

适合数据驾驶舱/市场洞察页面。

---

## 11. SSE 实时事件

### 11.1 订阅事件流

**GET** `/api/stream/events`

返回 `text/event-stream`。

### 11.2 发布测试事件

**POST** `/api/stream/publish`

通常仅开发或内部调试使用。

### 11.3 查看 SSE 订阅统计

**GET** `/api/stream/stats`

### 11.4 前端接入建议

浏览器原生示例：

```javascript
const es = new EventSource('/api/stream/events', { withCredentials: false });

es.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('SSE event:', data);
};

es.onerror = () => {
  console.warn('SSE disconnected, retrying...');
};
```

建议：
- 关键页面用 “SSE + 轮询兜底”
- 断线重连后主动刷新一次核心状态接口

---

## 12. 系统接口

### 12.1 健康检查

**GET** `/health`

支持参数：
- `browser_check=light|deep`

返回可用于展示：
- `status`
- `version`
- `env`
- `db_backend`
- `uptime_seconds`
- `browser_engine`
- `browser_check_mode`
- `browser_ready`
- `browser_error`

### 12.2 全局汇总

**GET** `/api/summary`

适合作为首页业务总览。

---

## 13. 前端推荐封装

### 13.1 Axios 请求拦截器

建议统一封装：
- 自动注入 JWT
- 统一处理 `401`
- 统一处理 `403`
- 统一判断 `success`

### 13.2 错误处理建议

- `401`：跳转登录页，并清空本地 token
- `403`：提示无权限，不要反复重试
- `422`：表单参数校验错误，直接展示后端 message
- `500`：提示系统异常，并保留请求日志

### 13.3 推荐页面与主接口映射

- 登录页：`/api/auth/login`
- 首页总览：`/api/summary` 或 `/api/idc/home`
- 产品列表页：`/api/products`
- 产品详情规格页：`/api/specs/{brand}/{country}/{product_id}`
- 调度任务页：`/api/scheduler/tasks` + `/api/stream/events`
- 监控大盘：`/api/monitor/overview`
- 价格波动页：`/api/monitor/price-changes`
- 用户角色页：`/api/users` + `/api/roles`
- 备份运维页：`/api/backup/*` + `/api/backup/heartbeat/*` + `/api/watchdog/*`

---

## 14. 目前建议前端优先使用的主接口

如果前端先做 MVP，建议优先接以下接口：

1. `POST /api/auth/login`
2. `GET /api/auth/me`
3. `GET /api/products`
4. `GET /api/brands`
5. `GET /api/countries`
6. `GET /api/specs/{brand}/{country}/{product_id}`
7. `GET /api/monitor/overview`
8. `GET /api/monitor/price-changes`
9. `GET /api/scheduler/tasks`
10. `GET /api/scheduler/status`
11. `GET /api/alerts`
12. `GET /api/stream/events`

---

## 15. 交付备注

本文件基于当前代码与 `api_schema.json` 整理，适合作为前端单文件交付说明。

如需进一步自动生成 TypeScript 类型，建议直接基于：
- `api_schema.json`
- `/openapi.json`

进行代码生成。
