import { get, post, put, del } from './client'

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'

export interface SystemState {
  last_heartbeat: string
  pause_crawling: boolean
  disk_usage: number
}

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

export interface LogEntry {
  id: string
  level: 'ERROR' | 'WARN' | 'INFO'
  module: 'Crawler' | 'System' | 'User'
  message: string
  detail?: string
  timestamp: string
}

export interface LogsData {
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

export interface Session {
  token: string
  username: string
  login_at: string
  last_active_at: string
}

export interface SessionsData { sessions: Session[] }

export interface BackupFile {
  filename: string
  size_bytes: number
  created_at: string
}

export interface BackupListData { backups: BackupFile[] }

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

export interface LogsBackupConfig {
  enabled: boolean
  retention_days: number
  backup_dir: string
  since_hours: number
  max_local_backup_files?: number
  cleanup_window?: string
}

export interface SystemConfig {
  enabled: boolean
  schedule: BackupScheduleConfig
  database: DatabaseBackupConfig
  logs: LogsBackupConfig
  schedule_desc?: string
  next_run_at?: string

  // 兼容扩展字段
  main_service_running?: boolean
  backup_service_running?: boolean
}

export interface Announcement {
  content: string
  updated_at: string
}

export const adminApi = {
  // 系统状态
  getSystemState:  () => get<SystemState>('/api/admin/system/state'),
  getMetrics:      () => get<SystemMetrics>('/api/admin/system/metrics'),
  togglePause:     () => post<SystemState>('/api/admin/system/pause', {}),
  restartService:  () => post<void>('/api/admin/system/restart', {}),

  // 日志
  getLogs:   (params: LogsParams) => get<LogsData>('/api/admin/logs', params as Record<string, unknown>),
  clearLogs: ()                   => del<void>('/api/admin/logs/clear'),

  // 会话
  getSessions:  ()              => get<SessionsData>('/api/admin/sessions'),
  kickSession:  (token: string) => del<void>(`/api/admin/sessions/${token}`),

  // 备份
  createBackup:  ()                    => post<{ filename: string }>('/api/admin/backup', {}),
  listBackups:   ()                    => get<BackupListData>('/api/admin/backup/list'),
  restoreBackup: (filename: string)    => post<void>('/api/admin/backup/restore', { filename }),

  // 配置
  getConfig:    ()                          => get<SystemConfig>('/api/backup/config'),
  updateConfig: (cfg: Partial<SystemConfig>) => put<SystemConfig>('/api/backup/config', cfg),

  // 公告
  getAnnouncement:    ()               => get<Announcement>('/api/admin/announcement'),
  updateAnnouncement: (content: string) => put<Announcement>('/api/admin/announcement', { content }),

  // SSE
  openStream: (): EventSource => {
    const apiKey = (import.meta.env.VITE_API_KEY as string) || ''
    return new EventSource(`${BASE}/api/admin/stream${apiKey ? `?api_key=${apiKey}` : ''}`)
  },
}
