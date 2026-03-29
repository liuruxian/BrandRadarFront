import { get } from './client'
import type { HealthData, SummaryData } from './types'

export const systemApi = {
  getHealth: () => get<HealthData>('/health'),
  getSummary: () => get<SummaryData>('/api/summary')
}
