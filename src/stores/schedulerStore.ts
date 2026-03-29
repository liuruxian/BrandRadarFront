import { defineStore } from 'pinia'
import { ref } from 'vue'
import { schedulerApi } from '@/api/schedulerApi'
import type { SchedulerStatus } from '@/api/types'

export const useSchedulerStore = defineStore('scheduler', () => {
  const status = ref<SchedulerStatus | null>(null)
  const loading = ref(false)
  const reloading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStatus() {
    loading.value = true
    error.value = null
    try {
      const res = await schedulerApi.getStatus()
      if (res.success) status.value = res.data
    } catch (e: unknown) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function reload() {
    reloading.value = true
    error.value = null
    try {
      const res = await schedulerApi.reload()
      if (res.success) status.value = res.data
      return res.success
    } catch (e: unknown) {
      error.value = (e as Error).message
      return false
    } finally {
      reloading.value = false
    }
  }

  return { status, loading, reloading, error, fetchStatus, reload }
})
