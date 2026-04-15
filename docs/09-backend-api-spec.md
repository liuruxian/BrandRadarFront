# BrandRadar API 接口文档

> 本文档由前端项目自动生成，记录了前端所有调用的接口及字段定义，供后端开发参考。
> 更新时间: 2026-04-15

---

## 一、项目基础配置

### 1.1 服务地址

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `VITE_API_BASE_URL` | API基础URL | `http://localhost:8000` |
| `VITE_API_KEY` | API密钥（旧鉴权方式） | 空 |

### 1.2 请求配置

```typescript
timeout: 30000ms
Content-Type: application/json
```

### 1.3 鉴权方式

前端支持两种鉴权方式，按优先级自动选择：

| 方式 | 头信息 | 说明 |
|------|--------|------|
| JWT Token | `Authorization: Bearer {token}` | 优先使用，从 localStorage 读取 `brand_radar_token` |
| API Key | `X-API-Key: {apiKey}` | 兼容旧版，从环境变量读取 |

### 1.4 通用响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T | null
  meta?: PaginationMeta | CountMeta | null
  error?: ApiError | null
}

interface PaginationMeta {
  total: number
  page: number
  page_size: number
  total_pages: number
}

interface ApiError {
  error_code: string
  message: string
  detail?: unknown
}
```

### 1.5 错误码处理

| HTTP状态码 | error_code | 前端处理 |
|-----------|-----------|---------|
| 401 | AUTHENTICATION_FAILED | 跳转登录页 |
| 429 | RATE_LIMIT_EXCEEDED | 提示限流 |
| 409 | TASK_ALREADY_RUNNING | 业务层自行处理 |
| 500+ | - | 提示服务器错误 |

---

## 二、认证模块 `/api/auth`

### 2.1 用户登录

```
POST /api/auth/login
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**响应字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| token | string | JWT访问令牌 |
| username | string | 用户名 |
| role | string | 角色 |
| expires_at | string | 过期时间 (ISO 8601) |
| menus | string[] | 菜单权限列表 (可选) |

**TypeScript类型：**

```typescript
interface LoginBody {
  username: string
  password: string
}

interface LoginData {
  token: string
  username: string
  role: string
  expires_at: string
  menus?: string[]
}
```

---

### 2.2 获取当前用户

```
GET /api/auth/me
```

**响应字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| username | string | 用户名 |
| role | string | 角色 |
| login_at | string | 登录时间 (ISO 8601) |
| menus | string[] | 菜单权限列表 (可选) |

```typescript
interface MeData {
  username: string
  role: string
  login_at: string
  menus?: string[]
}
```

---

### 2.3 修改密码

```
POST /api/auth/password
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| old_password | string | 是 | 旧密码 |
| new_password | string | 是 | 新密码 |

---

### 2.4 登出

```
POST /api/auth/logout
```

无请求参数。

---

## 三、产品模块 `/api/products` / `/api/brands`

### 3.1 获取产品列表

```
GET /api/products
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| brand | string | 否 | 品牌名称 |
| country | string | 否 | 国家代码 |
| status | 'on_sale' \| 'discontinued' | 否 | 产品状态 |
| page | number | 否 | 页码，默认1 |
| page_size | number | 否 | 每页数量，默认20 |

**响应字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| products | Product[] | 产品列表 |

```typescript
interface Product {
  brand: string              // 品牌
  country: string            // 国家代码
  product_id: string         // 产品ID
  sku: string                // SKU编码
  model: string              // 型号
  url: string                // 产品URL
  price: string              // 当前价格
  original_price: string     // 原价
  image: string              // 产品图片URL
  rating: string             // 评分
  total_reviews: string       // 评论数
  status: 'on_sale' | 'discontinued'  // 状态
  scraped_at: string          // 采集时间
  listed_at: string          // 上架时间
  delisted_at: string        // 下架时间
}
```

---

### 3.2 按品牌+国家查询产品

```
GET /api/products/{brand}/{country}
```

**路径参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| brand | string | 品牌名称 (需URL编码) |
| country | string | 国家代码 |

**查询参数：** 同 3.1

---

### 3.3 获取品牌列表

```
GET /api/brands
```

**响应：** `string[]` 品牌名称数组

---

### 3.4 获取品牌配置信息

```
GET /api/brands/config
```

**响应：** 品牌配置详情数组

---

### 3.5 获取国家列表

```
GET /api/countries
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| brand | string | 否 | 按品牌筛选 |

**响应：** `string[]` 国家代码数组

---

### 3.6 获取产品规格

```
GET /api/specs/{brand}/{country}/{productId}
```

**路径参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| brand | string | 品牌名称 (URL编码) |
| country | string | 国家代码 (URL编码) |
| productId | string | 产品ID (URL编码) |

**查询参数：**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| lang | 'both' \| 'original' \| 'en' | 否 | 'both' | 语言版本 |

**响应：** `Record<string, unknown>` 产品规格详情

---

## 四、采集模块 `/api/crawl`

### 4.1 触发采集任务

```
POST /api/crawl
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| brand | string \| null | 否 | 指定品牌 |
| country | string \| null | 否 | 指定国家 |
| update_existing | boolean | 否 | 是否更新已有数据 |
| force | boolean | 否 | 是否强制执行 |

```typescript
interface CrawlTriggerBody {
  brand?: string | null
  country?: string | null
  update_existing?: boolean
  force?: boolean
}
```

**响应字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| task_id | string | 任务ID |
| status | TaskStatus | 任务状态 |
| brand | string \| null | 品牌 |
| country | string \| null | 国家 |
| started_at | string \| null | 开始时间 |
| finished_at | string \| null | 结束时间 |
| product_count | number \| null | 产品数量 |
| new_count | number \| null | 新增数量 |
| updated_count | number \| null | 更新数量 |
| error | string \| null | 错误信息 |
| progress | string \| null | 进度描述 |

```typescript
type TaskStatus = 'queued' | 'running' | 'done' | 'failed'

interface CrawlTask {
  task_id: string
  status: TaskStatus
  brand: string | null
  country: string | null
  started_at: string | null
  finished_at: string | null
  product_count: number | null
  new_count: number | null
  updated_count: number | null
  error: string | null
  progress: string | null
}
```

---

### 4.2 获取采集任务列表

```
GET /api/crawl
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| brand | string | 否 | 按品牌筛选 |
| country | string | 否 | 按国家筛选 |

**响应：**

```typescript
interface TasksData {
  tasks: CrawlTask[]
}
```

---

### 4.3 获取单个采集任务

```
GET /api/crawl/{taskId}
```

**路径参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| taskId | string | 任务ID |

**响应：** `CrawlTask`

---

### 4.4 清理过期任务

```
DELETE /api/crawl/cleanup
```

**响应：**

```typescript
interface CleanupData {
  removed: number  // 清理的任务数量
}
```

---

## 五、监控模块 `/api/monitor` / `/api/alerts`

### 5.1 获取价格变动

```
GET /api/monitor/price-changes
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| brand | string | 否 | 品牌筛选 |
| country | string | 否 | 国家筛选 |
| limit | number | 否 | 返回数量限制 |

**响应：**

```typescript
interface PriceChange {
  time: string      // 变动时间
  brand: string     // 品牌
  country: string   // 国家
  product_id: string // 产品ID
  model: string     // 型号
  old_price: string // 原价
  new_price: string // 新价
  change_pct: number // 变动百分比
  direction: string // 变动方向
}

interface PriceChangesData {
  changes: PriceChange[]
}
```

---

### 5.2 获取监控概览

```
GET /api/monitor/overview
```

**响应字段：**

```typescript
interface MonitorOverview {
  // 系统健康状态
  system_health?: {
    api_alive: boolean
    scheduler_alive: boolean
    backup_alive: boolean
    watchdog_alive: boolean
  }

  // 调度器状态
  scheduler_status?: {
    mode: 'auto' | 'manual'
    next_run_in_seconds: number
    interval_minutes?: number
    cron_expression?: string
    silent_hours_enabled?: boolean
    silent_start?: string
    silent_end?: string
    max_daily_runs?: number
    today_runs?: number
    daemon_alive?: boolean
  }

  // 备份状态
  backup_status?: {
    next_run_at?: string
    schedule_desc?: string
    daemon_alive?: boolean
  }

  // 备份心跳
  backup_heartbeat_status?: {
    health: boolean
    consecutive_failures: number
  }

  // 服务监控
  service_watchdog_status?: {
    overall_status: string
    checks: Array<{
      name: string
      status: string
      message?: string
    }>
  }

  // 采集任务统计
  crawl_task_stats?: {
    queued: number
    running: number
    done: number
    failed: number
  }

  // 预警统计
  alert_stats?: {
    pending: number
    approved: number
    rejected: number
  }

  // 主机指标
  host_metrics?: {
    cpu_percent: number
    memory_percent: number
    memory_used_bytes: number
    memory_total_bytes: number
    disk_used_percent: number
    disk_total_bytes: number
    disk_used_bytes: number
    disk_free_bytes: number
    service_uptime_seconds: number
    load_avg?: [number, number, number]
  }

  // 备份任务指标
  backup_task_metrics?: {
    last_status: string
    last_finished_at?: string
    last_db_backup_file?: string
    last_logs_backup_file?: string
    last_error?: string
    seven_day_success_rate: number
    seven_day_done: number
    seven_day_failed: number
  }

  // 日志指标
  log_metrics?: {
    error_per_minute: number
    warn_per_minute: number
    recent_exceptions: string[]
    log_growth_bytes_last_minute: number
  }

  // 兼容旧字段
  host?: { /* 同 host_metrics */ }
  health?: { /* 同 system_health */ }
  scheduler?: { /* 部分字段 */ }
  backup?: { /* 部分字段 */ }
  watchdog?: { /* 部分字段 */ }
  crawl_tasks?: { /* 同 crawl_task_stats */ }
  alerts?: { /* 同 alert_stats */ }
}
```

---

### 5.3 获取预警列表

```
GET /api/alerts
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | 'pending' \| 'approved' \| 'rejected' | 否 | 预警状态 |
| limit | number | 否 | 返回数量限制 |

**响应：**

```typescript
interface AlertItem {
  id: string
  brand?: string
  country?: string
  parser_id?: string
  alert_type?: string
  status: 'pending' | 'approved' | 'rejected'
  old_count?: number
  new_count?: number
  last_error?: string
  trigger_count?: number
  first_seen_at?: string
  last_seen_at?: string
  decided_at?: string
  decided_by?: string
}

// 响应格式
{
  alerts?: AlertItem[]
  items?: AlertItem[]
}
```

---

### 5.4 处理预警

```
PUT /api/alerts/{alertId}/decision
```

**路径参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| alertId | string | 预警ID |

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| decision | 'approved' \| 'rejected' | 是 | 处理决定 |
| operator | string | 是 | 操作人 |

**响应：** `AlertItem`

---

### 5.5 获取备份任务列表

```
GET /api/backup/tasks
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 返回数量限制 |

**响应：**

```typescript
interface BackupTask {
  task_id: string
  status: 'queued' | 'running' | 'done' | 'failed' | 'skipped'
  target: 'all' | 'database' | 'logs'
  started_at?: string | null
  finished_at?: string | null
  error?: string | null
}

{
  tasks: BackupTask[]
}
```

---

### 5.6 手动触发备份

```
POST /api/backup/trigger
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| target | 'all' \| 'database' \| 'logs' | 是 | 备份目标 |
| force | boolean | 否 | 是否强制执行 |

**响应：**

```typescript
{
  task_id: string  // 备份任务ID
}
```

---

### 5.7 SSE事件流

```
GET /api/stream/events
GET /api/stream/events?api_key={apiKey}
```

**说明：** Server-Sent Events，用于实时推送

**事件类型：**

| 事件类型 | 说明 |
|---------|------|
| price_change | 价格变动 |
| crawl_progress | 采集进度 |
| alert | 新预警 |
| system_status | 系统状态变更 |

---

## 六、调度模块 `/api/scheduler`

### 6.1 获取调度状态

```
GET /api/scheduler/status
```

**响应：**

```typescript
interface SilentHours {
  enabled: boolean
  start: string   // HH:mm 格式
  end: string     // HH:mm 格式
}

interface SchedulerStatus {
  mode: 'auto' | 'manual'
  interval_minutes: number
  silent_hours: SilentHours
  max_daily_runs: number
  today_runs: number
  next_run_in_seconds: number
}
```

---

### 6.2 设置调度模式

```
PUT /api/scheduler/mode
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| mode | 'auto' \| 'manual' | 是 | 调度模式 |

**响应：** `SchedulerStatus`

---

### 6.3 设置调度计划

```
PUT /api/scheduler/schedule
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| interval_minutes | number | 否 | 间隔分钟数 |
| cron_expression | string | 否 | Cron表达式 |
| schedule_type | 'interval' \| 'cron' | 否 | 调度类型 |
| max_daily_runs | number | 否 | 每日最大运行次数 |
| silent_hours | SilentHours | 否 | 静默时段 |

**响应：** `SchedulerStatus`

---

### 6.4 手动触发采集

```
POST /api/scheduler/crawl
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| brand | string | 否 | 指定品牌 |
| countries | string[] | 否 | 国家列表 |

**响应：** `unknown`

---

### 6.5 获取调度任务列表

```
GET /api/scheduler/tasks
```

**响应：** `unknown[]`

---

### 6.6 热重载调度配置

```
POST /api/scheduler/reload
```

**响应：** `SchedulerStatus`

---

## 七、系统模块 `/health` / `/api/summary`

### 7.1 健康检查

```
GET /health
```

**响应：**

```typescript
interface HealthData {
  status: 'ok' | 'degraded' | 'error'
  version: string
  env: string
  db_backend: string
  uptime_seconds: number
}
```

---

### 7.2 全局数据汇总

```
GET /api/summary
```

**响应：**

```typescript
interface BrandStat {
  brand: string
  total: number
  on_sale: number
  discontinued: number
}

interface SummaryData {
  total_brands: number
  total_countries: number
  total_products: number
  total_on_sale: number
  total_discontinued: number
  last_updated: string
  by_brand: BrandStat[]
}
```

---

## 八、管理模块 `/api/admin`

### 8.1 获取系统状态

```
GET /api/admin/system/state
```

**响应：**

```typescript
interface SystemState {
  last_heartbeat: string
  pause_crawling: boolean
  disk_usage: number
}
```

---

### 8.2 获取系统指标

```
GET /api/admin/system/metrics
```

**响应：**

```typescript
interface SystemMetrics {
  cpu_percent: number
  memory_rss_mb: number
  disk_free_gb: number
  disk_total_gb: number
  disk_percent: number
  uptime_seconds: number
  today_tasks: number
  today_success: number
  today_failed: number
}
```

---

### 8.3 暂停/恢复系统

```
POST /api/admin/system/pause
```

**响应：** `SystemState`

---

### 8.4 重启系统

```
POST /api/admin/system/restart
```

无请求参数。

---

### 8.5 获取日志列表

```
GET /api/admin/logs
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| level | string | 否 | 日志级别 ERROR/WARN/INFO |
| module | string | 否 | 模块名称 |
| keyword | string | 否 | 关键词搜索 |
| start | string | 否 | 开始时间 (ISO 8601) |
| end | string | 否 | 结束时间 (ISO 8601) |
| page | number | 否 | 页码 |
| page_size | number | 否 | 每页数量 |

**响应：**

```typescript
interface LogEntry {
  id: string
  level: 'ERROR' | 'WARN' | 'INFO'
  module: 'Crawler' | 'System' | 'User'
  message: string
  detail?: string
  timestamp: string
}

interface LogsData {
  logs: LogEntry[]
  total: number
}
```

---

### 8.6 清理日志

```
DELETE /api/admin/logs/clear
```

---

### 8.7 获取在线会话

```
GET /api/admin/sessions
```

**响应：**

```typescript
interface Session {
  token: string
  username: string
  login_at: string
  last_active_at: string
}

interface SessionsData {
  sessions: Session[]
}
```

---

### 8.8 强制下线

```
DELETE /api/admin/sessions/{token}
```

**路径参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| token | string | 会话Token |

---

### 8.9 系统备份

```
POST /api/admin/backup
```

**响应：**

```typescript
{
  filename: string  // 备份文件名
}
```

---

### 8.10 列出备份文件

```
GET /api/admin/backup/list
```

**响应：**

```typescript
interface BackupFile {
  filename: string
  size_bytes: number
  created_at: string
}

interface BackupListData {
  backups: BackupFile[]
}
```

---

### 8.11 恢复备份

```
POST /api/admin/backup/restore
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| filename | string | 是 | 备份文件名 |

---

### 8.12 获取系统配置

```
GET /api/backup/config
```

**响应：**

```typescript
interface BackupScheduleConfig {
  schedule_type: 'interval' | 'daily' | 'weekly'
  interval_minutes: number
  time_of_day: string
  weekly_days: number[]
  timezone: string
}

interface DatabaseBackupConfig {
  enabled: boolean
  retention_days: number
  backup_dir: string
  max_local_backup_files?: number
  cleanup_window?: string
}

interface LogsBackupConfig {
  enabled: boolean
  retention_days: number
  backup_dir: string
  since_hours: number
  max_local_backup_files?: number
  cleanup_window?: string
}

interface SystemConfig {
  enabled: boolean
  schedule: BackupScheduleConfig
  database: DatabaseBackupConfig
  logs: LogsBackupConfig
  schedule_desc?: string
  next_run_at?: string
  main_service_running?: boolean
  backup_service_running?: boolean
}
```

---

### 8.13 更新系统配置

```
PUT /api/backup/config
```

**请求参数：** `Partial<SystemConfig>`

---

### 8.14 获取公告

```
GET /api/admin/announcement
```

**响应：**

```typescript
interface Announcement {
  content: string
  updated_at: string
}
```

---

### 8.15 更新公告

```
PUT /api/admin/announcement
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 公告内容 |

**响应：** `Announcement`

---

### 8.16 管理SSE事件流

```
GET /api/admin/stream
GET /api/admin/stream?api_key={apiKey}
```

同 5.7，用于管理员视角的实时事件推送。

---

## 九、用户管理模块 `/api/users` / `/api/roles`

### 9.1 获取用户列表

```
GET /api/users
```

**响应：**

```typescript
interface User {
  id: string
  username: string
  role: string
  status: 'active' | 'disabled'
  created_at: string
  last_login_at: string | null
}

interface UsersData {
  users: User[]
}
```

---

### 9.2 创建用户

```
POST /api/users
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| role | string | 是 | 角色 |

**响应：** `User`

---

### 9.3 更新用户

```
PUT /api/users/{id}
```

**路径参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 用户ID |

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| role | string | 否 | 新角色 |
| status | 'active' \| 'disabled' | 否 | 用户状态 |

**响应：** `User`

---

### 9.4 删除用户

```
DELETE /api/users/{id}
```

---

### 9.5 重置用户密码

```
PUT /api/users/{id}/password
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| password | string | 是 | 新密码 |

---

### 9.6 获取角色列表

```
GET /api/roles
```

**响应：**

```typescript
interface Role {
  name: string
  display_name: string
  is_builtin: boolean
  permissions: string[]
  menus?: string[]
}

interface RolesData {
  roles: Role[]
}
```

---

### 9.7 创建角色

```
POST /api/roles
```

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 角色名称 |
| display_name | string | 是 | 显示名称 |
| permissions | string[] | 是 | 权限列表 |
| menus | string[] | 是 | 菜单列表 |

**响应：** `Role`

---

### 9.8 更新角色

```
PUT /api/roles/{name}
```

**路径参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 角色名称 |

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| display_name | string | 否 | 显示名称 |
| permissions | string[] | 否 | 权限列表 |
| menus | string[] | 否 | 菜单列表 |

**响应：** `Role`

---

### 9.9 删除角色

```
DELETE /api/roles/{name}
```

---

## 十、IDC市场分析模块 `/idc`

> IDC模块基于 `idc_printer_market` 数据表，提供打印机市场数据分析功能。

### 10.1 通用数据结构

#### 10.1.1 API响应格式

```typescript
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code?: string
    message?: string
  }
}
```

#### 10.1.2 筛选条件

```typescript
interface FilterConditions {
  // 时间维度
  years?: string[]           // 如: ["2024", "2025"]
  half_years?: string[]      // 如: ["H1", "H2"]

  // 地理维度
  global_regions?: string[]   // 如: ["Americas", "EMEA", "APJ"]
  regions?: string[]          // 如: ["Western Europe", "Latin America"]
  countries?: string[]       // 如: ["US", "CN", "DE"]

  // 厂商维度
  companies?: string[]        // 如: ["Canon Group", "HP Inc"]
  vendors?: string[]         // 如: ["Canon", "HP"]
  brands?: string[]          // 如: ["HP", "Canon", "Epson"]
  oems?: string[]           // 如: ["Canon", "HP", "Ricoh"]

  // 产品维度
  product_categories?: string[]  // 如: ["MFP", "Laser", "Inkjet"]
  products?: string[]           // 如: ["Laser Printer", "Inkjet MFP"]
  formats?: string[]            // 如: ["A4", "A3", "Letter"]
  speed_ranges_a4?: string[]     // 如: ["<20 ppm", "20-40 ppm"]
  speed_ranges_letter?: string[] // 如: ["<20 ppm", "20-40 ppm"]

  // 功能维度
  adf_options?: string[]      // 如: ["Y", "N"]
  duplex_options?: string[]  // 如: ["Y", "N"]
  network_options?: string[] // 如: ["Y", "N"]
  wireless_options?: string[] // 如: ["Y", "N"]

  // 耗材维度
  ink_types?: string[]       // 如: ["Ink Tank", "Ink Cartridge"]

  // 渠道维度
  channels?: string[]       // 如: ["Direct", "Dealer", "VAR", "SI"]
  channel_groups?: string[]  // 如: ["Online", "Offline", "Direct"]

  // 业务维度
  production_classifications?: string[]
  business_inkjet_detail?: string[]

  // 品类类型
  product_type?: 'all' | 'laser' | 'inkjet'

  // 激光专属筛选
  laser_product_details?: string[]  // Color Laser / Mono Laser
  toner_capacity_ranges?: string[]  // 0 / 1-3000 / 3001-10000 / >10000

  // 喷墨专属筛选
  inkjet_product_details?: string[] // Color Inkjet / Mono Inkjet

  // 高端机型
  high_end_only?: boolean
}
```

#### 10.1.3 筛选选项

```typescript
interface FilterOptionsData {
  // 时间维度
  years?: string[]
  half_years?: string[]

  // 地理维度
  global_regions?: FilterOption[]
  regions?: FilterOption[]
  countries?: FilterOption[]

  // 厂商维度
  companies?: FilterOption[]
  vendors?: FilterOption[]
  brands?: FilterOption[]
  oems?: FilterOption[]

  // 产品维度
  product_categories?: FilterOption[]
  products?: FilterOption[]
  formats?: FilterOption[]
  speed_ranges_a4?: string[]
  speed_ranges_letter?: string[]

  // 功能维度
  adf_options?: FilterOption[]
  duplex_options?: FilterOption[]
  network_options?: FilterOption[]
  wireless_options?: FilterOption[]

  // 耗材维度
  ink_types?: FilterOption[]

  // 渠道维度
  channels?: FilterOption[]
  channel_groups?: FilterOption[]

  // 业务维度
  production_classifications?: FilterOption[]
  business_inkjet_detail?: FilterOption[]

  // 激光专属
  laser_product_details?: FilterOption[]
  toner_capacity_ranges?: FilterOption[]

  // 喷墨专属
  inkjet_product_details?: FilterOption[]

  // 高端
  high_end_only?: FilterOption[]
}

interface FilterOption {
  value: string
  label: string
}
```

---

### 10.2 获取筛选选项

```
GET /idc/filters/options
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| parent_field | string | 否 | 父字段名 |
| parent_value | string | 否 | 父字段值 |

**响应：** `FilterOptionsData`

---

### 10.3 应用筛选

```
POST /idc/filters/apply
```

**请求参数：**

```typescript
interface FilterApplyRequest {
  filters?: FilterConditions
}
```

**响应：** `FilterOptionsData`

---

### 10.4 KPI概览数据

```
GET /idc/overview/kpi
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| filters | string (URL编码的JSON) | 否 | 筛选条件 |

**响应：**

```typescript
interface KPIData {
  total_units: number       // SUM(Units)
  total_value: number       // SUM(Value (USD M))
  asp: number              // ASP = SUM(Value)/SUM(Units)*1,000,000
  active_models: number     // COUNT(DISTINCT Model Name)
  countries_covered: number // COUNT(DISTINCT Country)
  units_yoy: number        // 销量同比 (%)
  units_mom: number        // 销量环比 (%)
  value_yoy: number        // 销售额同比 (%)
  value_mom: number        // 销售额环比 (%)
  current_period: string   // 当前期间如 "2025H1"
  previous_period: string  // 环比上一期
  yoy_period: string       // 同比期
}
```

---

### 10.5 趋势图数据

```
GET /idc/overview/trend
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| trend_type | 'units' \| 'value' | 是 | 趋势类型 |
| top_n | number | 否 | Top N品牌 |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface TrendChartData {
  metric: 'units' | 'value'
  periods: string[]  // 时间序列: 2020H1 ~ 2025H1
  series: TrendSeries[]
}

interface TrendSeries {
  name: string
  data: number[]
}
```

---

### 10.6 品牌分布数据

```
GET /idc/overview/brand
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | 'top_n' \| 'oem' \| 'compare' | 是 | 分布类型 |
| brands | string[] | 否 | 指定品牌 |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface BrandTopN {
  brand: string
  units: number
  value: number
  asp: number
  units_share: number  // 销量份额 (%)
  value_share: number  // 销售额份额 (%)
}

interface BrandOEM {
  oem: string
  units: number
  value: number
}

interface BrandCompare {
  brand: string
  units: number
  value: number
  asp: number
  active_models: number
  countries_covered: number
}

type BrandDistributionData =
  | { type: 'top_n'; brands: BrandTopN[] }
  | { type: 'oem'; oems: BrandOEM[] }
  | { type: 'compare'; brands: BrandCompare[] }
```

---

### 10.7 透视分析

```
POST /idc/explore/pivot
```

**请求参数：**

```typescript
interface PivotRequest {
  filters?: FilterConditions
  row_fields: PivotDimension[]  // 行维度
  col_field?: PivotDimension     // 列维度
  value_field: 'units' | 'value' | 'asp' | 'active_models'  // 值字段
  sort_field?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

type PivotDimension =
  | 'Year'
  | 'Half Year'
  | 'Global Region'
  | 'Region'
  | 'Country'
  | 'Company'
  | 'Vendor'
  | 'Brand'
  | 'OEM'
  | 'Product Category'
  | 'Product'
  | 'Format'
  | 'Speed Range A4'
  | 'Speed Range Letter'
  | 'ADF'
  | 'Duplex'
  | 'Wireless'
  | 'Ink Tank/ Ink Cartridge'
  | 'Channel'
  | 'Channel Group'
  | 'Production Classification'
  | 'Business Inkjet Detail'
```

**响应：**

```typescript
interface PivotData {
  headers: string[][]
  rows: unknown[][]
  totals: unknown[]
  total_count: number
  page: number
  page_size: number
}
```

---

### 10.8 获取分析模板

```
GET /idc/explore/templates
```

**响应：**

```typescript
interface TemplateItem {
  id: string
  name: string
  description: string
  row_fields: PivotDimension[]
  col_field?: PivotDimension
  value_field: 'units' | 'value' | 'asp' | 'active_models'
}
```

---

### 10.9 地理热力图

```
GET /idc/geo/heatmap
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| metric | string | 否 | 度量字段，默认units |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface GeoHeatmapItem {
  country_code: string   // 国家代码
  country_name: string   // 国家名称
  iso_code: string       // ISO代码
  units: number
  value: number
  asp: number
}
```

---

### 10.10 国家详情

```
GET /idc/geo/country/{countryCode}
```

**路径参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| countryCode | string | 国家代码 (如 US, CN) |

**查询参数：** filters?

**响应：**

```typescript
interface CountryKPI {
  units: number
  value: number
  asp: number
  active_models: number
}

interface TopModel {
  brand: string
  model_name: string
  units: number
  value: number
}

interface CountryTrend {
  periods: string[]
  units: number[]
  value: number[]
}

interface BrandStructure {
  brand: string
  units: number
  share: number
}

interface CountryDetailData {
  country_code: string
  country_name: string
  kpi: CountryKPI
  top_models: TopModel[]        // Top 10 型号
  trend: CountryTrend
  brand_structure: BrandStructure[]
}
```

---

### 10.11 国家对比

```
GET /idc/geo/compare
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| countries | string[] | 是 | 国家代码列表 |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface GeoCompareItem {
  name: string
  type: 'country' | 'region' | 'global_region'
  units: number
  value: number
  asp: number
  active_models: number
  brand_structure: BrandStructure[]
  trend: CountryTrend
}

interface GeoCompareData {
  items: GeoCompareItem[]
}
```

---

### 10.12 产品搜索

```
GET /idc/product/search
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| brand | string | 否 | 品牌筛选 |
| product | string | 否 | 产品类型筛选 |
| format | string | 否 | 幅面筛选 |
| product_category | string | 否 | 产品品类筛选 |
| limit | number | 否 | 返回数量限制 |

**响应：**

```typescript
interface ProductSearchItem {
  model_key: string
  brand: string           // Brand 字段
  model_name: string      // Model Name 字段
  product_brand: string   // Product Brand 字段
  product_category: string // Product Category 字段
  product: string         // Product 字段
  format: string          // Format 字段
}
```

---

### 10.13 产品对比

```
GET /idc/product/compare
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model_keys | string[] | 是 | 型号键列表 |
| compare_type | string | 否 | 对比类型 |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface SpecMatrix {
  // 基础信息
  basic_info: [string, ...string[]][]
  // 速度指标
  speed_specs: [string, ...string[]][]  // A4 Color Speed/A4 Mono Speed/ISO Color Speed/ISO Mono Speed
  // 功能配置
  function_specs: [string, ...string[]][]  // Function/ADF/Duplex/Wireless/Network
  // 耗材参数
  consumable_specs: [string, ...string[]][]  // Ink Tank/ Ink Cartridge/Black Toner Max Pages/Color Toner Max Pages
  // 物理规格
  physical_specs: [string, ...string[]][]  // Duty Cycle/Weight/Tray Size/Flatbed/Sheetfed
  // 生产级别
  production_specs: [string, ...string[]][]  // Production Classification/Business Inkjet Detail
}

interface MarketCompare {
  units: number[]
  value: number[]
  asp: number[]
}

interface TimeTrend {
  periods: string[]
  series: { name: string; data: number[] }[]
}

interface ProductCompareData {
  spec_matrix?: SpecMatrix
  market_compare?: MarketCompare
  region_distribution?: [string, ...number[]][]
  channel_distribution?: [string, ...number[]][]
  time_trend?: TimeTrend
}
```

---

### 10.14 渠道桑基图

```
GET /idc/channel/sankey
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| metric | string | 否 | 度量字段 |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface SankeyNode {
  name: string
  category: 'channel' | 'channel_group' | 'brand'
}

interface SankeyLink {
  source: string
  target: string
  value: number  // Units 或 Value
}

interface ChannelSankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
}
```

---

### 10.15 线上线下分析

```
GET /idc/channel/online_offline
```

**查询参数：** filters?

**响应：**

```typescript
interface OnlineOfflineData {
  periods: string[]
  online: number[]      // eTailer + Internet 合计
  offline: number[]     // Dealer/VAR/SI + Retail + Direct 合计
  online_share: number[]
  offline_share: number[]
}
```

---

### 10.16 渠道堆叠图

```
GET /idc/channel/stacked
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| top_n_brands | number | 否 | Top N品牌 |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface ChannelStackedData {
  brands: string[]
  channel_groups: string[]
  series: { name: string; data: number[] }[]
}
```

---

### 10.17 价格段分析

```
GET /idc/price/segments
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| segment_type | string | 是 | 分段类型 |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface PriceSegment {
  name: string
  range: string
  units: number
  value: number
  share: number
}

type PriceSegmentData =
  | { type: 'market_capacity'; segments: PriceSegment[] }
  | { type: 'brand_position'; brands: string[]; series: { name: string; data: number[] }[] }
  | { type: 'asp_trend'; periods: string[]; series: { name: string; data: number[] }[] }
  | { type: 'brand_asp_compare'; brands: string[]; asp: number[] }
```

---

### 10.18 墨仓/墨盒分析

```
GET /idc/tech/ink_tank
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| analysis_type | string | 是 | 分析类型 (overall/region/brand) |
| drilldown_type | string | 否 | 下钻类型 |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface InkTankOverall {
  type: 'overall'
  ink_tank_units: number
  ink_tank_value: number
  ink_tank_share_units: number
  ink_tank_share_value: number
  cartridge_units: number
  cartridge_value: number
  unknown_units: number
}

interface RegionInkTank {
  region: string
  ink_tank_share: number
}

interface BrandInkTank {
  brand: string
  ink_tank_share: number
  ink_tank_units: number
  total_units: number
}

type InkTankAnalysisData =
  | InkTankOverall
  | { type: 'region'; regions: RegionInkTank[] }
  | { type: 'brand'; brands: BrandInkTank[] }
```

---

### 10.19 速度段分析

```
GET /idc/tech/speed_segment
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| analysis_type | string | 是 | 分析类型 (capacity/brand_share/scatter/trend) |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface SpeedCapacity {
  segment: string   // Speed Range A4 值
  units: number
  value: number
}

interface SpeedBrandShare {
  segment: string
  [brand: string]: number | string
}

interface ScatterPoint {
  model_name: string
  brand: string
  speed: number
  asp: number
  units: number
}

type SpeedSegmentData =
  | { type: 'capacity'; segments: SpeedCapacity[] }
  | { type: 'brand_share'; segments: string[]; brands: string[]; series: number[][] }
  | { type: 'scatter'; points: ScatterPoint[] }
  | { type: 'trend'; periods: string[]; series: { name: string; data: number[] }[] }
```

---

### 10.20 多功能分析

```
GET /idc/tech/mfp_function
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| analysis_type | string | 是 | 分析类型 (coverage/combination/brand_diff/region_diff) |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface FunctionCoverage {
  type: 'coverage'
  print_rate: number
  copy_rate: number
  scan_rate: number
  fax_rate: number
  adf_rate: number
}

interface FunctionCombination {
  functions: string[]  // 如 ["Print", "Copy", "Scan"]
  count: number
  share: number
}

interface BrandFunctionDiff {
  brand: string
  functions: {
    print_rate?: number
    copy_rate?: number
    scan_rate?: number
    fax_rate?: number
    adf_rate?: number
  }
}

interface RegionFunctionDiff {
  region: string
  functions: {
    print_rate?: number
    copy_rate?: number
    scan_rate?: number
    fax_rate?: number
    adf_rate?: number
  }
}

type MFPFunctionData =
  | FunctionCoverage
  | { type: 'combination'; combinations: FunctionCombination[] }
  | { type: 'brand_diff'; brands: BrandFunctionDiff[] }
  | { type: 'region_diff'; regions: RegionFunctionDiff[] }
```

---

### 10.21 排行数据

```
GET /idc/rank
```

**查询参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| rank_type | string | 是 | 排行类型 |
| sort_by | string | 否 | 排序字段 |
| order | 'asc' \| 'desc' | 否 | 排序方向 |
| top_n | number | 否 | 返回数量 |
| page | number | 否 | 页码 |
| page_size | number | 否 | 每页数量 |
| filters | string | 否 | 筛选条件 |

**响应：**

```typescript
interface RankingItem {
  rank: number
  name: string
  units: number
  value: number
  asp: number
  active_models?: number
}

interface RankingData {
  items: RankingItem[]
  total_count: number
  page: number
  page_size: number
}
```

---

### 10.22 数据导出

#### 导出当前视图

```
POST /idc/export/current_view
```

**请求参数：**

```typescript
interface ExportRequest {
  filters?: FilterConditions
  export_type: 'current_view' | 'raw_data' | 'report' | 'excel_with_format' | 'csv_utf8' | 'pdf_report' | 'png_chart'
  params?: Record<string, unknown>
  format?: 'csv' | 'excel'
}
```

#### 导出原始数据

```
POST /idc/export/raw_data
```

**请求参数：** 同上

#### 导出报告

```
POST /idc/export/report
```

**请求参数：**

```typescript
interface ReportExportRequest {
  filters?: FilterConditions
  sections: ('kpi' | 'trend' | 'brand' | 'region' | 'model' | 'summary')[]
  title?: string
  format?: 'pdf' | 'excel'
}
```

**导出响应：**

```typescript
interface ExportData {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  download_url?: string
  message?: string
}
```

---

## 十一、IDC统计量定义（30个统计量）

### 11.1 基础聚合函数 (5个)

| 统计量ID | 中文名称 | 英文名称 | 单位 | 说明 |
|---------|---------|---------|------|------|
| sum_units | 销量求和 | SUM Units | - | 销量总计 |
| sum_value | 销售额求和 | SUM Value | USD M | 销售额总计 |
| count_rows | 记录行数 | Count Rows | - | 数据记录数 |
| avg_units | 销量平均值 | AVG Units | - | 销量均值 |
| avg_value | 销售额平均值 | AVG Value | USD M | 销售额均值 |
| max_units | 销量最大值 | MAX Units | - | 最大销量 |
| max_value | 销售额最大值 | MAX Value | USD M | 最大销售额 |
| min_units | 销量最小值 | MIN Units | - | 最小销量 |
| min_value | 销售额最小值 | MIN Value | USD M | 最小销售额 |
| count_models | 型号数量 | Count Models | - | 不同型号数 |

### 11.2 核心衍生统计 (12个)

| 统计量ID | 中文名称 | 英文名称 | 单位 | 说明 |
|---------|---------|---------|------|------|
| asp | 平均单价 | Average Selling Price | USD | SUM(Value)/SUM(Units)*1,000,000 |
| market_share | 市场份额 | Market Share | % | 该品牌销量/市场总销量 |
| value_share | 销售额份额 | Value Share | % | 该品牌销售额/市场总销售额 |
| category_units_pct | 品类销量占比 | Category Units % | % | 该品类销量/产品品类总销量 |
| inktank_penetration | 墨仓式渗透率 | Ink Tank Penetration | % | 墨仓式销量/喷墨总销量 |
| function_penetration | 功能普及率 | Function Penetration | % | 含某功能的机型占比 |
| highend_units_pct | 高端机型占比 | High-end Units % | % | 高端机型销量占比 |
| a3_format_pct | A3幅面占比 | A3 Format % | % | A3幅面产品占比 |
| mfp_pct | MFP占比 | MFP % | % | 多功能一体机占比 |
| yoy_growth | 同比增长率 | YoY Growth | % | 同比变化率 |
| hoh_growth | 环比增长率 | HoH Growth | % | 环比变化率 |
| cumulative_units | 累计销量 | Cumulative Units | - | 累计求和 |

### 11.3 高级分析统计 (8个)

| 统计量ID | 中文名称 | 英文名称 | 单位 | 说明 |
|---------|---------|---------|------|------|
| cr5_concentration | 品牌集中度 | CR5 Concentration | % | Top5品牌市场份额 |
| avg_units_per_model | 单型号平均销量 | Avg Units/Model | - | 销量/型号数 |
| units_per_region | 单位区域销量 | Units/Region | - | 销量/区域数 |
| channel_efficiency | 渠道效率 | Channel Efficiency | % | 线上销量占比 |
| speed_segment_count | 速度段分布计数 | Speed Segment Count | - | 各速度段型号数 |
| price_segment_units | 价格段分布销量 | Price Segment Units | - | 各价格段销量 |
| cost_per_page | 单页耗材成本 | Cost Per Page | USD | 耗材成本/打印页数 |
| deviation_from_avg | 与均值偏差 | Deviation from Avg | % | 与平均值的偏差 |

### 11.4 辅助统计 (5个)

| 统计量ID | 中文名称 | 英文名称 | 单位 | 说明 |
|---------|---------|---------|------|------|
| active_models | 活跃型号数 | Active Models | - | 有销量记录的型号 |
| units_yoy | 销量同比 | Units YoY | % | 本期vs去年同期 |
| value_yoy | 销售额同比 | Value YoY | % | 本期vs去年同期 |
| units_mom | 销量环比 | Units MoM | % | 本期vs上期 |
| value_mom | 销售额环比 | Value MoM | % | 本期vs上期 |

---

## 十二、数据库表结构参考

> 基于 `idc_printer_market` 单表

### 12.1 维度字段

| 字段名 | 类型 | 说明 | 示例值 |
|-------|------|------|--------|
| Year | string | 年份 | "2025" |
| Half Year | string | 半年度 | "H1", "H2" |
| Global Region | string | 全球区域 | "Americas", "EMEA", "APJ" |
| Region | string | 区域 | "Western Europe", "Latin America" |
| Country | string | 国家 | "US", "CN", "DE" |
| Company | string | 公司 | "Canon Group", "HP Inc" |
| Vendor | string | 厂商 | "Canon", "HP" |
| Brand | string | 品牌 | "HP", "Canon", "Epson" |
| OEM | string | OEM厂商 | "Canon", "HP", "Ricoh" |
| Product Category | string | 产品品类 | "MFP", "Laser", "Inkjet" |
| Product | string | 产品类型 | "Laser Printer", "Inkjet MFP" |
| Format | string | 幅面 | "A4", "A3", "Letter" |
| Speed Range A4 | string | A4速度段 | "<20 ppm", "20-40 ppm" |
| Speed Range Letter | string | Letter速度段 | "<20 ppm", "20-40 ppm" |
| ADF | string | 自动输稿器 | "Y", "N" |
| Duplex | string | 双面打印 | "Y", "N" |
| Network | string | 网络功能 | "Y", "N" |
| Wireless | string | 无线功能 | "Y", "N" |
| Ink Tank/ Ink Cartridge | string | 耗材类型 | "Ink Tank", "Ink Cartridge" |
| Channel | string | 渠道 | "Direct", "Dealer", "VAR", "SI" |
| Channel Group | string | 渠道组 | "Online", "Offline", "Direct" |
| Production Classification | string | 生产级别 | 激光生产级别 |
| Business Inkjet Detail | string | 商用喷墨级别 | "01: Entry", "02: Mid-range", "03: High-end" |

### 12.2 度量字段

| 字段名 | 类型 | 说明 | 单位 |
|-------|------|------|------|
| Units | number | 销量 | 台 |
| Value | number | 销售额 | 百万美元 |
| Model Name | string | 型号名称 | - |

### 12.3 产品规格字段

| 字段名 | 类型 | 说明 |
|-------|------|------|
| A4 Color Speed | string | A4彩色速度 |
| A4 Mono Speed | string | A4黑白速度 |
| ISO Color Speed | string | ISO彩色速度 |
| ISO Mono Speed | string | ISO黑白速度 |
| Function | string | 功能列表 |
| Black Toner Max Pages | string | 黑色碳粉最大页数 |
| Color Toner Max Pages | string | 彩色碳粉最大页数 |
| Duty Cycle | string | 月负荷 |
| Weight | string | 重量 |
| Tray Size | string | 纸盒容量 |
| Flatbed | string | 平板扫描 |
| Sheetfed | string | 输稿器扫描 |
