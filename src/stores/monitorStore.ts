import { defineStore } from 'pinia'
import { ref } from 'vue'
import { monitorApi } from '@/api/monitorApi'
import type { PriceChange, PriceChangesParams } from '@/api/types'

export const useMonitorStore = defineStore('monitor', () => {
  const changes = ref<PriceChange[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const count = ref(0)

  async function fetchChanges(params?: PriceChangesParams) {
    loading.value = true
    error.value = null
    try {
      const res = await monitorApi.getPriceChanges(params)
      if (res.success && res.data) {
        changes.value = res.data.changes
        count.value = (res.meta as { count?: number })?.count ?? res.data.changes.length
      }
    } catch (e: unknown) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  return { changes, loading, error, count, fetchChanges }
})
