import { get, post, put } from './client'
import type { PriceChangesData, PriceChangesParams } from './types'

// Monitor Overview 类型
export interface MonitorOverview {
  display_titles?: Record<string, string>
  system_health?: {
    api_alive: boolean
    scheduler_alive: boolean
    backup_alive: boolean
    watchdog_alive: boolean
  }
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
  backup_status?: {
    next_run_at?: string
    schedule_desc?: string
    daemon_alive?: boolean
  }
  backup_heartbeat_status?: {
    health: boolean
    consecutive_failures: number
  }
  service_watchdog_status?: {
    overall_status: string
    checks: Array<{ name: string; status: string; message?: string }>
  }
  crawl_task_stats?: { queued: number; running: number; done: number; failed: number }
  alert_stats?: { pending: number; approved: number; rejected: number }
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
  log_metrics?: {
    error_per_minute: number
    warn_per_minute: number
    recent_exceptions: string[]
    log_growth_bytes_last_minute: number
  }
}

// 价格变动
export interface PriceChange {
  change_id?: string
  time?: string
  brand: string
  country: string
  product_id: string
  model: string
  old_price: string
  new_price: string
  change_pct: number
  direction: 'up' | 'down' | 'stable'
}

export interface PriceChangesData {
  changes: PriceChange[]
  total?: number
  page?: number
  page_size?: number
}

// 价格变动趋势
export interface PriceTrendBucket {
  time: string
  up_count: number
  down_count: number
  stable_count: number
  total_count: number
}

export interface PriceTrendData {
  buckets: PriceTrendBucket[]
  start_time: string
  end_time: string
  bucket: 'day' | 'week' | 'month'
}

// 热力图数据
export interface HeatmapCell {
  brand: string
  country: string
  up_count: number
  down_count: number
  stable_count: number
  total_count: number
}

export interface HeatmapData {
  cells: HeatmapCell[]
  brands: string[]
  countries: string[]
}

// Top 波动榜
export interface TopVolatilityItem {
  brand: string
  country: string
  product_id: string
  model: string
  old_price: string
  new_price: string
  change_pct: number
  direction: 'up' | 'down' | 'stable'
  time: string
}

export interface TopVolatilityData {
  items: TopVolatilityItem[]
}

// 价格历史
export interface PriceHistoryItem {
  time: string
  price: string
  available: boolean
}

export interface PriceHistoryData {
  history: PriceHistoryItem[]
  product_id: string
  brand: string
  country: string
}

// 告警
export interface AlertItem {
  alert_id: string
  brand?: string
  country?: string
  parser_id?: string
  alert_type?: string
  status: 'pending' | 'resolved'
  old_count?: number
  new_count?: number
  message?: string
  trigger_count?: number
  first_seen_at?: string
  last_seen_at?: string
  resolved_at?: string
  resolved_by?: string
  notes?: string
}

export interface AlertsData {
  alerts: AlertItem[]
  total?: number
  page?: number
  page_size?: number
}

export interface ResolveAlertBody {
  operator: string
  notes?: string
}

// 备份任务
export interface BackupTask {
  task_id: string
  status: 'queued' | 'running' | 'done' | 'failed' | 'skipped'
  target: 'all' | 'database' | 'logs'
  started_at?: string | null
  finished_at?: string | null
  error?: string | null
}

export interface BackupTasksData {
  tasks: BackupTask[]
  total?: number
  page?: number
  page_size?: number
}

// Stream SSE
export interface StreamStats {
  active_connections: number
  total_events: number
  events_last_hour: number
}

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'

export const monitorApi = {
  // 价格变动
  getPriceChanges: (params?: PriceChangesParams) =>
    get<PriceChangesData>('/api/monitor/price-changes', params as Record<string, unknown>),

  getPriceTrend: (params: {
    start_time: string
    end_time: string
    bucket: 'day' | 'week' | 'month'
    brand?: string
    country?: string
    direction?: 'up' | 'down' | 'stable'
  }) => get<PriceTrendData>('/api/monitor/price-changes/trend', params),

  getPriceHeatmap: (params: {
    start_time: string
    end_time: string
    direction?: 'up' | 'down' | 'stable'
    brand?: string[]
    country?: string[]
  }) => get<HeatmapData>('/api/monitor/price-changes/heatmap', params as Record<string, unknown>),

  getTopVolatility: (params: {
    start_time: string
    end_time: string
    brand?: string
    country?: string
    direction?: 'up' | 'down' | 'all'
    limit?: number
  }) => get<TopVolatilityData>('/api/monitor/price-changes/top-volatility', params),

  getPriceHistory: (params: {
    product_id: string
    brand: string
    country: string
    start_time?: string
    end_time?: string
    limit?: number
  }) => get<PriceHistoryData>(`/api/monitor/price-changes/${params.product_id}/history`, params),

  // 系统总览
  getOverview: () => get<MonitorOverview>('/api/monitor/overview'),

  // 告警
  getAlerts: (params?: {
    brand?: string
    country?: string
    status?: 'pending' | 'resolved'
    alert_type?: string
    page?: number
    page_size?: number
  }) => get<AlertsData>('/api/alerts', params as Record<string, unknown>),

  resolveAlert: (alertId: string, body: ResolveAlertBody) =>
    put<void>(`/api/alerts/${alertId}/resolve`, body),

  // 备份任务
  getBackupTasks: (params?: { page?: number; page_size?: number }) =>
    get<BackupTasksData>('/api/backup/tasks', params as Record<string, unknown>),

  triggerBackup: (body: { force?: boolean; target?: 'local'; schedule_at?: string | null }) =>
    post<{ task_id: string }>('/api/backup/trigger', body),

  // Stream SSE
  openEvents: (): EventSource => {
    const apiKey = (import.meta.env.VITE_API_KEY as string) || ''
    return new EventSource(`${BASE}/api/stream/events${apiKey ? `?api_key=${apiKey}` : ''}`)
  },

  getStreamStats: () => get<StreamStats>('/api/stream/stats'),
}
