import { get, post } from './client'
import type { SchedulerStatus } from './types'

export const schedulerApi = {
  getStatus: () => get<SchedulerStatus>('/api/scheduler/status'),
  reload: () => post<SchedulerStatus>('/api/scheduler/reload')
}
