import { get, post, put } from './client'
import type { SchedulerStatus } from './types'

export const schedulerApi = {
  // GET /api/scheduler/status
  getStatus: () => get<SchedulerStatus>('/api/scheduler/status'),

  // PUT /api/scheduler/schedule
  setSchedule: (cfg: {
    interval_minutes?: number
    cron_expression?: string
    silent_hours_enabled?: boolean
    silent_start?: string
    silent_end?: string
    max_daily_runs?: number
  }) => put<SchedulerStatus>('/api/scheduler/schedule', cfg),

  // POST /api/scheduler/crawl  — 通过调度器批量触发
  schedulerCrawl: (params?: { brand?: string; countries?: string[] }) =>
    post<unknown>('/api/scheduler/crawl', params ?? {}),

  // GET /api/scheduler/tasks  — 查询调度批量任务
  getSchedulerTasks: () => get<unknown[]>('/api/scheduler/tasks'),

  // POST /api/scheduler/reload
  reload: () => post<SchedulerStatus>('/api/scheduler/reload', {}),
}
