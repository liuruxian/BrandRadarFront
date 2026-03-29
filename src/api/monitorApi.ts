import { get } from './client'
import type { PriceChangesData, PriceChangesParams } from './types'

export const monitorApi = {
  getPriceChanges: (params?: PriceChangesParams) =>
    get<PriceChangesData>('/api/monitor/price-changes', params as Record<string, unknown>)
}
