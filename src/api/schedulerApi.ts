import { get, post, put } from './client'
import type { SchedulerStatus, SchedulerCrawlData } from './types'

export const schedulerApi = {
  // GET /api/scheduler/status
  getStatus: () => get<SchedulerStatus>('/api/scheduler/status'),

  // PUT /api/scheduler/mode - 切换调度器模式
  setMode: (mode: 'auto' | 'manual') => put<{ mode: string }>('/api/scheduler/mode', { mode }),

  // PUT /api/scheduler/schedule
  setSchedule: (cfg: {
    interval_minutes?: number
    cron_expression?: string
    silent_hours_enabled?: boolean
    silent_start?: string
    silent_end?: string
    max_daily_runs?: number
  }) => put<SchedulerStatus>('/api/scheduler/schedule', cfg),

  // POST /api/scheduler/crawl — 通过调度器批量触发 - 文档 6.5
  schedulerCrawl: (params?: { brand?: string; countries?: string[]; force?: boolean; update_existing?: boolean }) =>
    post<SchedulerCrawlData>('/api/scheduler/crawl', params ?? {}),

  // GET /api/scheduler/tasks — 查询调度批量任务
  getSchedulerTasks: (params?: { brand?: string; country?: string }) =>
    get<unknown[]>('/api/scheduler/tasks', params as Record<string, unknown>),

  // POST /api/scheduler/reload
  reload: () => post<SchedulerStatus>('/api/scheduler/reload', {}),
}
