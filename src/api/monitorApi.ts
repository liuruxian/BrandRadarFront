import { get, post, put } from './client'
import type { PriceChangesParams } from './types'

// Monitor Overview 类型 - 与 API 文档对齐
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
    daemon_alive: boolean
  }
  backup_status?: {
    daemon_alive: boolean
  }
  crawl_task_stats?: { queued: number; running: number; done: number; failed: number }
  alert_stats?: { pending: number; resolved: number }
  host_metrics?: {
    cpu_percent: number
    memory_percent: number
    memory_used_bytes?: number
    memory_total_bytes?: number
    disk_used_percent: number
    disk_total_bytes?: number
    disk_used_bytes?: number
    disk_free_bytes?: number
    service_uptime_seconds: number
    load_avg?: [number, number, number]
  }
  database_metrics?: Record<string, unknown>
}

// 价格变动趋势
export interface PriceTrendBucket {
  time: string
  up_count: number
  down_count: number
  stable_count: number
}

export interface PriceTrendData {
  points: PriceTrendBucket[]
  meta?: { count: number }
}

// 热力图数据 - 与 API 文档对齐
export interface HeatmapCell {
  brand: string
  country: string
  total_changes: number
  up_count: number
  down_count: number
  stable_count: number
  avg_change_pct: number
}

export interface HeatmapData {
  cells: HeatmapCell[]
  meta?: { count: number }
}

// Top 波动榜 - 与 API 文档对齐
export interface TopVolatilityItem {
  rank: number
  product_id: string
  brand: string
  country: string
  product_name: string
  change_pct: number
  change_type: 'up' | 'down' | 'stable'
  old_price: number
  new_price: number
}

export interface TopVolatilityData {
  items: TopVolatilityItem[]
  meta?: { count: number }
}

// 价格历史 - 与 API 文档对齐
export interface PriceHistoryPoint {
  price: number
  changed_at: string
}

export interface PriceHistoryData {
  product: {
    product_id: string
    brand: string
    country: string
  }
  points: PriceHistoryPoint[]
}

// 告警 - 与 API 文档对齐
export interface AlertItem {
  id: string
  brand?: string
  country?: string
  source_url?: string
  parser_id?: string
  alert_type?: string
  status: 'pending' | 'resolved'
  trigger_count: number
  first_seen_at: string
  last_seen_at: string
  decided_at: string | null
  decided_by: string | null
  notes: string
}

export interface AlertsData {
  alerts: AlertItem[]
  meta?: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface ResolveAlertBody {
  operator: string
  notes?: string
}

// 旧版告警类型 - 与 API 文档对齐
export interface OldAlertItem {
  alert_id: string
  brand: string
  country: string
  parser_id: string
  alert_type: string
  status: 'pending' | 'approved' | 'rejected'
  old_count: number
  new_count: number
  change_pct: number
  message: string
  trigger_count: number
  first_seen_at: string
  last_seen_at: string
  resolved_at?: string
  resolved_by?: string
  notes?: string
}

export interface OldAlertsData {
  alerts: OldAlertItem[]
}

export interface OldAlertDecisionBody {
  decision: 'approve' | 'reject'
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
  subscribers?: number
  active_connections?: number
  total_events?: number
  events_last_hour?: number
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

  // 旧版告警
  getOldAlerts: (params?: {
    brand?: string
    country?: string
    status?: 'pending' | 'approved' | 'rejected'
    alert_type?: string
    page?: number
    page_size?: number
  }) => get<OldAlertsData>('/api/alerts/old', params as Record<string, unknown>),

  handleOldAlert: (alertId: string, body: OldAlertDecisionBody) =>
    put<void>(`/api/alerts/${alertId}/decision`, body),

  // 备份任务
  getBackupTasks: (params?: { page?: number; page_size?: number }) =>
    get<BackupTasksData>('/api/backup/tasks', params as Record<string, unknown>),

  triggerBackup: (body?: { force?: boolean; target?: 'local'; schedule_at?: string | null }) =>
    post<{ task_id: string }>('/api/backup/trigger', body ?? {}),

  // Stream SSE
  openEvents: (): EventSource => {
    const apiKey = (import.meta.env.VITE_API_KEY as string) || ''
    return new EventSource(`${BASE}/api/stream/events${apiKey ? `?api_key=${apiKey}` : ''}`)
  },

  getStreamStats: () => get<StreamStats>('/api/stream/stats'),
}
