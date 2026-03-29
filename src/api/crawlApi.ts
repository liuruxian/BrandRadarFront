import { get, post, del } from './client'
import type { CrawlTask, CrawlTriggerBody, TasksData, CleanupData } from './types'

export const crawlApi = {
  trigger: (body: CrawlTriggerBody = {}) => post<CrawlTask>('/api/crawl', body),

  getTasks: (params?: { brand?: string; country?: string }) =>
    get<TasksData>('/api/crawl', params as Record<string, unknown>),

  getTaskById: (taskId: string) => get<CrawlTask>(`/api/crawl/${taskId}`),

  cleanup: () => del<CleanupData>('/api/crawl/cleanup')
}
