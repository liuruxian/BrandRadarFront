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
}

export interface SummaryData {
  total_brands: number
  total_countries: number
  total_products: number
  total_on_sale: number
  total_discontinued: number
  last_updated: string
  by_brand: BrandStat[]
}

export interface BrandStat {
  brand: string
  total: number
  on_sale: number
  discontinued: number
}

// ─── Products ───────────────────────────────────────────────
export interface Product {
  brand: string
  country: string
  product_id: string
  sku: string
  model: string
  url: string
  price: string
  original_price: string
  image: string
  rating: string
  total_reviews: string
  status: 'on_sale' | 'discontinued'
  scraped_at: string
  listed_at: string
  delisted_at: string
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

// ─── Crawl ──────────────────────────────────────────────────
export type TaskStatus = 'queued' | 'running' | 'done' | 'failed'

export interface CrawlTask {
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
  time: string
  brand: string
  country: string
  product_id: string
  model: string
  old_price: string
  new_price: string
  change_pct: number
  direction: string
}

export interface PriceChangesData {
  changes: PriceChange[]
}

export interface PriceChangesParams {
  brand?: string
  country?: string
  limit?: number
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
