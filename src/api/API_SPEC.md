# API 接口文档

**自动生成于**: 2026-04-02T11:54:05.970904

## 基础信息

- **API 基础 URL**: http://localhost:8000
- **版本**: 0.1.0
- **标题**: BrandRadar API

## 认证

所有请求需要在 Header 中包含 Bearer Token:

```
Authorization: Bearer <your_token>
```

## 接口列表

### GET /api/alerts

**说明**: 查询预警列表

**标签**: Alerts

**参数**:

- `brand` (string) [可选]: 
- `country` (string) [可选]: 
- `status` (string) [可选]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### PUT /api/alerts/{alert_id}/decision

**说明**: 处理预警（批准覆盖/拒绝覆盖）

**标签**: Alerts

**参数**:

- `alert_id` (string) [✓ 必填]: 

**请求体**:

```json
{
  "$ref": "#/components/schemas/DataAlertDecisionRequest"
}
```

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### POST /api/auth/login

**说明**: 用户登录

邮箱 + 密码登录，返回 JWT access token。

**标签**: Auth

**请求体**:

```json
{
  "$ref": "#/components/schemas/LoginRequest"
}
```

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/auth/me

**说明**: 获取当前登录用户信息

**标签**: Auth

**响应**:

- **200**: Successful Response

---

### GET /api/backup/config

**说明**: 查看备份配置

**标签**: Backup

**响应**:

- **200**: Successful Response

---

### PUT /api/backup/config

**说明**: 更新备份配置

**标签**: Backup

**请求体**:

```json
{
  "$ref": "#/components/schemas/BackupConfigUpdate"
}
```

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### PUT /api/backup/heartbeat/config

**说明**: 更新心跳配置

**标签**: BackupHeartbeat

**请求体**:

```json
{
  "$ref": "#/components/schemas/BackupHeartbeatConfig"
}
```

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/backup/heartbeat/history

**说明**: 获取心跳历史

**标签**: BackupHeartbeat

**参数**:

- `limit` (integer) [可选]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### POST /api/backup/heartbeat/refresh

**说明**: 手动刷新心跳

**标签**: BackupHeartbeat

**响应**:

- **200**: Successful Response

---

### GET /api/backup/heartbeat/status

**说明**: 获取备份服务器心跳状态

**标签**: BackupHeartbeat

**响应**:

- **200**: Successful Response

---

### GET /api/backup/status

**说明**: 备份调度状态

**标签**: Backup

**响应**:

- **200**: Successful Response

---

### GET /api/backup/tasks

**说明**: 查询备份任务列表

**标签**: Backup

**参数**:

- `limit` (integer) [可选]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### POST /api/backup/trigger

**说明**: 手动触发备份

**标签**: Backup

**请求体**:

```json
{
  "$ref": "#/components/schemas/BackupTriggerRequest"
}
```

**响应**:

- **202**: Successful Response
- **422**: Validation Error

---

### GET /api/brands

**说明**: 返回所有已有数据的品牌列表

**标签**: Products

**响应**:

- **200**: Successful Response

---

### GET /api/brands/config

**说明**: 返回配置文件中的品牌和地区信息

**标签**: Products

**响应**:

- **200**: Successful Response

---

### GET /api/countries

**说明**: 返回已有数据的国家列表

**标签**: Products

**参数**:

- `brand` (string) [可选]: 按品牌过滤

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/country-mappings/{brand}

**说明**: 查询指定品牌的国家映射

**标签**: CountryMapping

**参数**:

- `brand` (string) [✓ 必填]: 
- `locale` (string) [可选]: 语言代码，例如 zh-CN / en-US

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### PUT /api/country-mappings/{brand}/{country_code}

**说明**: 更新品牌-国家映射

**标签**: CountryMapping

**参数**:

- `brand` (string) [✓ 必填]: 
- `country_code` (string) [✓ 必填]: 

**请求体**:

```json
{
  "$ref": "#/components/schemas/CountryMappingUpsertRequest"
}
```

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### POST /api/crawl

**说明**: 触发采集任务

异步触发采集，立即返回 task_id。通过 GET /api/crawl/{task_id} 轮询任务状态。

**标签**: Crawl

**请求体**:

```json
{
  "$ref": "#/components/schemas/CrawlRequest"
}
```

**响应**:

- **202**: Successful Response
- **422**: Validation Error

---

### GET /api/crawl

**说明**: 列出采集任务

**标签**: Crawl

**参数**:

- `brand` (string) [可选]: 
- `country` (string) [可选]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### DELETE /api/crawl/cleanup

**说明**: 清理过期任务记录

**标签**: Crawl

**响应**:

- **200**: Successful Response

---

### GET /api/crawl/{task_id}

**说明**: 查询单个任务状态

**标签**: Crawl

**参数**:

- `task_id` (string) [✓ 必填]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/monitor/overview

**说明**: 系统监控总览（运维看板）

聚合运维看板核心数据，并返回 display_titles 作为前端标题映射。

前端建议：按 display_titles 的 key 渲染各监控卡片标题，避免硬编码。

**标签**: 系统监控

**响应**:

- **200**: Successful Response

---

### GET /api/monitor/price-changes

**说明**: 查询价格变动记录

返回最近 N 条价格变动，时间倒序。可按品牌/国家过滤。

**标签**: 系统监控

**参数**:

- `brand` (string) [可选]: 品牌过滤
- `country` (string) [可选]: 国家代码过滤
- `limit` (integer) [可选]: 返回条数上限

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/products

**说明**: 查询产品列表

支持按品牌、国家、状态过滤，支持分页。

**标签**: Products

**参数**:

- `brand` (string) [可选]: 品牌名称，如 HP
- `country` (string) [可选]: 国家代码，如 dk-da
- `status` (string) [可选]: 产品状态: on_sale | discontinued
- `page` (integer) [可选]: 页码（从 1 开始）
- `page_size` (integer) [可选]: 每页条数

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/products/{brand}/{country}

**说明**: 查询指定品牌+国家的产品

**标签**: Products

**参数**:

- `brand` (string) [✓ 必填]: 
- `country` (string) [✓ 必填]: 
- `status` (string) [可选]: 
- `page` (integer) [可选]: 
- `page_size` (integer) [可选]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/roles

**说明**: 查询所有角色

**标签**: Roles

**响应**:

- **200**: Successful Response

---

### POST /api/roles

**说明**: 创建自定义角色

**标签**: Roles

**请求体**:

```json
{
  "$ref": "#/components/schemas/CreateRoleRequest"
}
```

**响应**:

- **201**: Successful Response
- **422**: Validation Error

---

### GET /api/roles/{role_id}

**说明**: 查询单个角色

**标签**: Roles

**参数**:

- `role_id` (string) [✓ 必填]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### PUT /api/roles/{role_id}

**说明**: 更新角色权限/说明

**标签**: Roles

**参数**:

- `role_id` (string) [✓ 必填]: 

**请求体**:

```json
{
  "$ref": "#/components/schemas/UpdateRoleRequest"
}
```

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### DELETE /api/roles/{role_id}

**说明**: 删除角色（内置角色不可删除）

**标签**: Roles

**参数**:

- `role_id` (string) [✓ 必填]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### POST /api/scheduler/crawl

**说明**: 触发采集任务（按品牌/国家）

按品牌/国家维度批量触发采集任务，返回任务明细列表。

前端可直接使用 tasks[*].status / error 渲染任务状态与失败原因。

**标签**: 任务调度

**请求体**:

```json
{
  "$ref": "#/components/schemas/SchedulerCrawlRequest"
}
```

**响应**:

- **202**: Successful Response
- **422**: Validation Error

---

### POST /api/scheduler/reload

**说明**: 热重载调度配置

重新读取 schedule_config.json，立即生效，无需重启服务。

用法：修改 schedule_config.json 后调用此接口即可。

**标签**: System

**响应**:

- **200**: Successful Response

---

### PUT /api/scheduler/schedule

**说明**: 配置自动调度时间

更新自动采集的触发时间，立即生效并写回配置文件。

**字段说明：**
- `interval_minutes`: 固定间隔（分钟），最小 30 分钟
- `cron_expression`:  Cron 表达式（优先级高于 interval），如 `0 2 * * *`
- `silent_hours_enabled`: 是否启用静默期
- `silent_start` / `silent_end`: 静默期时间范围，格式 `HH:MM`

至少提供上述字段之一，未传字段保持原值。

**标签**: 任务调度

**请求体**:

```json
{
  "$ref": "#/components/schemas/SetScheduleRequest"
}
```

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/scheduler/status

**说明**: 查看调度运行状态

返回调度器运行状态、静默期配置、今日执行统计与下次执行倒计时。

**标签**: 任务调度

**响应**:

- **200**: Successful Response

---

### GET /api/scheduler/tasks

**说明**: 查询采集任务列表

按品牌/国家过滤查询采集任务。

返回字段包含时间、产出数量、进度与错误信息，便于前端列表与详情页展示。

**标签**: 任务调度

**参数**:

- `brand` (string) [可选]: 
- `country` (string) [可选]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/specs/{brand}/{country}

**说明**: 已采集规格的产品 ID 列表

**标签**: Specs

**参数**:

- `brand` (string) [✓ 必填]: 
- `country` (string) [✓ 必填]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/specs/{brand}/{country}/{product_id}

**说明**: 查询单个产品规格

lang 参数控制返回语言：both（默认）= 原文+英文；original = 仅原文；en = 仅英文

**标签**: Specs

**参数**:

- `brand` (string) [✓ 必填]: 
- `country` (string) [✓ 必填]: 
- `product_id` (string) [✓ 必填]: 
- `lang` (string) [可选]: both | original | en

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/stream/events

**说明**: SSE 事件流

**标签**: Stream

**响应**:

- **200**: Successful Response

---

### POST /api/stream/publish

**说明**: 发布测试事件

**标签**: Stream

**请求体**:

```json
{
  "$ref": "#/components/schemas/StreamPublishRequest"
}
```

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/stream/stats

**说明**: SSE 订阅统计

**标签**: Stream

**响应**:

- **200**: Successful Response

---

### GET /api/summary

**说明**: 全局数据汇总

返回各品牌/国家产品数量统计，以及最近更新时间。

**标签**: System

**响应**:

- **200**: Successful Response

---

### POST /api/users

**说明**: 创建用户（管理员）

**标签**: Users

**请求体**:

```json
{
  "$ref": "#/components/schemas/CreateUserRequest"
}
```

**响应**:

- **201**: Successful Response
- **422**: Validation Error

---

### GET /api/users

**说明**: 查询用户列表

**标签**: Users

**参数**:

- `user_type` (string) [可选]: system | frontend
- `page` (integer) [可选]: 
- `page_size` (integer) [可选]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/users/{user_id}

**说明**: 查询单个用户

**标签**: Users

**参数**:

- `user_id` (string) [✓ 必填]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### PUT /api/users/{user_id}

**说明**: 更新用户（状态/权限/密码）

**标签**: Users

**参数**:

- `user_id` (string) [✓ 必填]: 

**请求体**:

```json
{
  "$ref": "#/components/schemas/UpdateUserRequest"
}
```

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### DELETE /api/users/{user_id}

**说明**: 删除用户

**标签**: Users

**参数**:

- `user_id` (string) [✓ 必填]: 

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### POST /api/watchdog/check

**说明**: 手动执行一次服务检测

**标签**: Watchdog

**响应**:

- **200**: Successful Response

---

### GET /api/watchdog/config

**说明**: 查看服务监听配置

**标签**: Watchdog

**响应**:

- **200**: Successful Response

---

### PUT /api/watchdog/config

**说明**: 更新服务监听配置

**标签**: Watchdog

**请求体**:

```json
{
  "$ref": "#/components/schemas/ServiceWatchdogConfigUpdate"
}
```

**响应**:

- **200**: Successful Response
- **422**: Validation Error

---

### GET /api/watchdog/status

**说明**: 查看服务监听状态

**标签**: Watchdog

**响应**:

- **200**: Successful Response

---

### GET /health

**说明**: 服务健康检查

公开接口，无需 API Key。用于负载均衡器心跳检测。

**标签**: System

**响应**:

- **200**: Successful Response

---
