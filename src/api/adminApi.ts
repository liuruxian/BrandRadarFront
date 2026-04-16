import { get, post, put, del } from './client'
import type { ApiResponse } from './types'

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'

// 系统状态
export interface SystemState {
  last_heartbeat: string
  pause_crawling: boolean
  disk_usage: number
}

// 系统指标
export interface SystemMetrics {
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

// 日志
export interface LogEntry {
  id: string
  level: 'ERROR' | 'WARN' | 'INFO'
  module: 'Crawler' | 'System' | 'User'
  message: string
  detail?: string
  timestamp: string
}

export interface logsData {
  logs: LogEntry[]
  total: number
}

export interface LogsParams {
  level?: string
  module?: string
  keyword?: string
  start?: string
  end?: string
  page?: number
  page_size?: number
}

// 会话
export interface Session {
  token: string
  username: string
  login_at: string
  last_active_at: string
}

export interface SessionsData { sessions: Session[] }

// 备份文件
export interface BackupFile {
  filename: string
  size_bytes: number
  created_at: string
}

export interface BackupListData { backups: BackupFile[] }

// 备份配置
export interface BackupScheduleConfig {
  schedule_type: 'interval' | 'daily' | 'weekly'
  interval_minutes: number
  time_of_day: string
  weekly_days: number[]
  timezone: string
}

export interface DatabaseBackupConfig {
  enabled: boolean
  retention_days: number
  backup_dir: string
  max_local_backup_files?: number
  cleanup_window?: string
}

export interface logsBackupConfig {
  enabled: boolean
  retention_days: number
  backup_dir: string
  since_hours: number
  max_local_backup_files?: number
  cleanup_window?: string
}

export interface BackupConfigOut {
  enabled: boolean
  schedule: BackupScheduleConfig
  database: DatabaseBackupConfig
  logs: logsBackupConfig
  remote?: {
    enabled: boolean
    protocol: string
    host: string
    port: number
    username: string
    remote_dir: string
    timeout_seconds: number
  }
  schedule_desc?: string
  next_run_at?: string
}

// 备份心跳状态
export interface BackupHeartbeatStatus {
  enabled: boolean
  daemon_alive: boolean
  remote_host: string
  interval_minutes: number
  timeout_seconds: number
  failure_threshold: number
  consecutive_failures: number
  health: 'healthy' | 'degraded' | 'down' | 'unknown'
  last_record?: {
    checked_at: string
    status: 'connected' | 'down' | 'unknown'
    latency_ms: number | null
    error?: string
  }
}

export interface BackupHeartbeatRecord {
  id: string
  checked_at: string
  status: 'connected' | 'down' | 'unknown'
  latency_ms: number | null
  error?: string
}

export interface BackupHeartbeatHistoryData {
  records: BackupHeartbeatRecord[]
}

export interface BackupHeartbeatConfig {
  enabled: boolean
  interval_seconds: number
  timeout_seconds: number
  max_consecutive_failures: number
  webhook_url?: string
}

// 看门狗配置
export interface ServiceWatchdogConfig {
  enabled: boolean
  interval_seconds: number
  failure_threshold: number
  backup_scheduler_required: boolean
  backup_heartbeat_required: boolean
}

// 看门狗状态
export interface ServiceWatchdogStatus {
  enabled: boolean
  daemon_alive: boolean
  next_run_in_seconds: number
  last_checked_at: string
  overall_status: 'healthy' | 'degraded' | 'down' | 'unknown'
  checks: Array<{
    name: string
    status: 'up' | 'down' | 'unknown'
    message?: string
    checked_at?: string
    consecutive_failures?: number
  }>
}

// 公告
export interface Announcement {
  announcement_id: string
  title: string
  content: string
  level: 'info' | 'warning' | 'error'
  is_published: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

// Stream SSE
export interface StreamPublishRequest {
  event: string
  topic?: string
  data?: Record<string, unknown>
}

export interface StreamPublishOut {
  delivered: number
}

// 兼容别名
export type SystemConfig = BackupConfigOut

export interface StreamStats {
  active_connections: number
  total_events: number
  events_last_hour: number
}

export const adminApi = {
  // 系统状态
  getSystemState: () => get<SystemState>('/api/admin/system/state'),
  getMetrics: () => get<SystemMetrics>('/api/admin/system/metrics'),
  togglePause: () => post<SystemState>('/api/admin/system/pause', {}),
  restartService: () => post<void>('/api/admin/system/restart', {}),

  // 日志
  getLogs: (params: LogsParams) => get<logsData>('/api/admin/logs', params as Record<string, unknown>),
  clearLogs: () => del<void>('/api/admin/logs/clear'),

  // 会话
  getSessions: () => get<SessionsData>('/api/admin/sessions'),
  kickSession: (token: string) => del<void>(`/api/admin/sessions/${token}`),

  // 备份配置
  getBackupConfig: () => get<BackupConfigOut>('/api/backup/config'),
  updateBackupConfig: (cfg: Partial<BackupConfigOut>) => put<BackupConfigOut>('/api/backup/config', cfg),
  // 兼容别名
  getConfig: () => get<BackupConfigOut>('/api/backup/config'),
  updateConfig: (cfg: Partial<BackupConfigOut>) => put<BackupConfigOut>('/api/backup/config', cfg),

  // 备份任务
  createBackup: (body?: { force?: boolean; target?: 'local'; schedule_at?: string | null }) =>
    post<{ task_id: string }>('/api/backup/trigger', body ?? {}),

  listBackups: () => get<BackupListData>('/api/admin/backup/list'),

  restoreBackup: (filename: string) => post<void>('/api/admin/backup/restore', { filename }),

  // 备份心跳
  getBackupHeartbeatStatus: () => get<BackupHeartbeatStatus>('/api/backup/heartbeat/status'),
  getBackupHeartbeatHistory: (params?: { limit?: number }) =>
    get<BackupHeartbeatHistoryData>('/api/backup/heartbeat/history', params as Record<string, unknown>),
  refreshBackupHeartbeat: () => post<void>('/api/backup/heartbeat/refresh'),
  updateBackupHeartbeatConfig: (cfg: Partial<BackupHeartbeatConfig>) =>
    put<BackupHeartbeatConfig>('/api/backup/heartbeat/config', cfg),

  // 看门狗
  getWatchdogConfig: () => get<ServiceWatchdogConfig>('/api/watchdog/config'),
  updateWatchdogConfig: (cfg: Partial<ServiceWatchdogConfig>) =>
    put<ServiceWatchdogConfig>('/api/watchdog/config', cfg),
  getWatchdogStatus: () => get<ServiceWatchdogStatus>('/api/watchdog/status'),
  triggerWatchdogCheck: () => post<void>('/api/watchdog/check'),

  // 公告
  getAnnouncement: () => get<Announcement>('/api/admin/announcement'),
  updateAnnouncement: (content: string) => put<Announcement>('/api/admin/announcement', { content }),

  // Stream SSE
  openStream: (): EventSource => {
    const apiKey = (import.meta.env.VITE_API_KEY as string) || ''
    return new EventSource(`${BASE}/api/stream/events${apiKey ? `?api_key=${apiKey}` : ''}`)
  },

  publishStreamEvent: (body: StreamPublishRequest) => post<StreamPublishOut>('/api/stream/publish', body),
  getStreamStats: () => get<StreamStats>('/api/stream/stats'),
}
