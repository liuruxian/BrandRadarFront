import { get, post, put } from './client'
import type { PriceChangesData, PriceChangesParams } from './types'

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

  // 兼容旧字段
  host?: {
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
  health?: {
    api_alive: boolean
    scheduler_alive: boolean
    backup_alive: boolean
    watchdog_alive: boolean
  }
  scheduler?: {
    mode: 'auto' | 'manual'
    next_run_in_seconds: number
  }
  backup?: {
    next_run_at?: string
    schedule_desc?: string
  }
  backup_heartbeat?: {
    health: boolean
    consecutive_failures: number
  }
  watchdog?: {
    overall_status: string
    checks: Array<{ name: string; status: string; message?: string }>
  }
  crawl_tasks?: { queued: number; running: number; done: number; failed: number }
  alerts?: { pending: number; approved: number; rejected: number }
  backup_metrics?: {
    last_status: string
    last_finished_at?: string
    last_db_backup_file?: string
    last_logs_backup_file?: string
    last_error?: string
    seven_day_success_rate: number
    seven_day_done: number
    seven_day_failed: number
  }
  logs?: {
    error_per_minute: number
    warn_per_minute: number
    recent_exceptions: string[]
    log_growth_bytes_last_minute: number
  }
}

export interface AlertItem {
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

export interface BackupTask {
  task_id: string
  status: 'queued' | 'running' | 'done' | 'failed' | 'skipped'
  target: 'all' | 'database' | 'logs'
  started_at?: string | null
  finished_at?: string | null
  error?: string | null
}

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'

export const monitorApi = {
  getPriceChanges: (params?: PriceChangesParams) =>
    get<PriceChangesData>('/api/monitor/price-changes', params as Record<string, unknown>),

  getOverview: () => get<MonitorOverview>('/api/monitor/overview'),

  getAlerts: (params?: { status?: 'pending' | 'approved' | 'rejected'; limit?: number }) =>
    get<{ alerts?: AlertItem[]; items?: AlertItem[] }>('/api/alerts', params as Record<string, unknown>),

  decideAlert: (alertId: string, body: { decision: 'approved' | 'rejected'; operator: string }) =>
    put<AlertItem>(`/api/alerts/${alertId}/decision`, body),

  getBackupTasks: (params?: { limit?: number }) =>
    get<{ tasks: BackupTask[] }>('/api/backup/tasks', params as Record<string, unknown>),

  triggerBackup: (body: { target: 'all' | 'database' | 'logs'; force?: boolean }) =>
    post<{ task_id: string }>('/api/backup/trigger', body),

  openEvents: (): EventSource => {
    const apiKey = (import.meta.env.VITE_API_KEY as string) || ''
    return new EventSource(`${BASE}/api/stream/events${apiKey ? `?api_key=${apiKey}` : ''}`)
  },
}
