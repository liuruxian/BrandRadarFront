// ─── 通用响应结构 ───────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  meta?: PaginationMeta | CountMeta | null
  error?: ApiError | null
}

export interface PaginationMeta {
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface CountMeta {
  count: number
}

export interface ApiError {
  error_code: string
  message: string
  detail?: unknown
}

// ─── System ─────────────────────────────────────────────────
export interface HealthData {
  status: 'ok' | 'degraded' | 'error'
  version: string
  env: string
  db_backend: string
  uptime_seconds: number
  browser_engine?: string
  browser_check_mode?: string
  browser_ready?: boolean
  browser_error?: string
}

export interface SummaryData {
  total_brands: number
  total_countries: number
  total_products: number
  last_updated: string
  by_brand?: Record<string, number>
}

// ─── Products ───────────────────────────────────────────────
export interface Product {
  id?: number
  brand: string
  country: string
  product_id: string
  name: string
  sku?: string
  model?: string
  url: string
  status: 'on_sale' | 'discontinued'
  price?: number
  currency?: string
  created_at: string
  updated_at: string
}

export interface ProductsData {
  products: Product[]
}

export interface ProductsParams {
  brand?: string
  country?: string
  status?: 'on_sale' | 'discontinued'
  page?: number
  page_size?: number
}

// ─── Specs ──────────────────────────────────────────────────
export interface SpecsProductList {
  brand: string
  country: string
  product_ids: string[]
  total: number
}

export interface SpecsProduct {
  product_id: string
  brand: string
  country: string
  spec_original?: string
  spec_en?: string
  source_url?: string
  updated_at: string
}

// ─── Crawl ──────────────────────────────────────────────────
export type TaskStatus = 'queued' | 'running' | 'done' | 'failed'

export interface CrawlTask {
  task_id: string
  status: TaskStatus
  brand: string | null
  country: string | null
  created_at: string | null
  started_at: string | null
  finished_at: string | null
  summary: string | null
  error_message: string | null
}

export interface CrawlTriggerTask extends CrawlTask {
  task_id: string
  brand: string
  country: string
  status: 'queued' | 'running' | 'done' | 'failed'
  created_at: string
  started_at: string | null
  finished_at: string | null
  summary: string | null
  error_message: string | null
}

export interface CrawlTriggerBody {
  brand?: string | null
  country?: string | null
  update_existing?: boolean
  force?: boolean
}

export interface TasksData {
  tasks: CrawlTask[]
}

export interface CleanupData {
  removed: number
}

// ─── Monitor ────────────────────────────────────────────────
export interface PriceChange {
  product_id: string
  brand: string
  country: string
  product_name: string
  old_price: number
  new_price: number
  change_pct: number
  change_type: 'up' | 'down' | 'stable'
  changed_at: string
}

export interface PriceChangesData {
  changes: PriceChange[]
  meta?: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface PriceChangesParams {
  brand?: string
  country?: string
  status?: 'on_sale' | 'discontinued'
  direction?: 'up' | 'down' | 'stable'
  keyword?: string
  start_time?: string
  end_time?: string
  sort_by?: 'time' | 'abs_change_pct' | 'change_pct'
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

// ─── Backup ────────────────────────────────────────────────
export interface BackupStatus {
  daemon_alive: boolean
  last_backup_at?: string
  next_backup_at?: string
  backup_in_progress: boolean
}

// ─── Scheduler ──────────────────────────────────────────────
export interface SilentHours {
  enabled: boolean
  start: string
  end: string
}

export interface SchedulerStatus {
  mode: 'auto' | 'manual'
  interval_minutes: number
  cron_expression?: string
  silent_hours_enabled: boolean
  silent_start: string
  silent_end: string
  max_daily_runs: number
  today_runs: number
  next_run_in_seconds: number
  daemon_alive: boolean
}

// ─── Scheduler Batch Crawl ─────────────────────────────────
export interface SchedulerCrawlTask {
  task_id: string
  brand: string
  country: string
  status: 'queued' | 'running' | 'done' | 'failed'
  error: string | null
}

export interface SchedulerCrawlData {
  tasks: SchedulerCrawlTask[]
  total: number
}
export interface SilentHours {
  enabled: boolean
  start: string
  end: string
}

export interface SchedulerStatus {
  mode: 'auto' | 'manual'
  interval_minutes: number
  cron_expression?: string
  silent_hours_enabled: boolean
  silent_start: string
  silent_end: string
  max_daily_runs: number
  today_runs: number
  next_run_in_seconds: number
  daemon_alive: boolean
}
