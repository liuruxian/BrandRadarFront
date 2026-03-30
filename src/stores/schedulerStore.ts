import { defineStore } from 'pinia'
import { ref } from 'vue'
import { schedulerApi } from '@/api/schedulerApi'
import type { SchedulerStatus } from '@/api/types'

export const useSchedulerStore = defineStore('scheduler', () => {
  const status    = ref<SchedulerStatus | null>(null)
  const loading   = ref(false)
  const reloading = ref(false)
  const saving    = ref(false)
  const error     = ref<string | null>(null)

  async function fetchStatus() {
    loading.value = true
    error.value = null
    try {
      const res = await schedulerApi.getStatus()
      if (res.success && res.data) status.value = res.data
    } catch (e: unknown) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function setMode(mode: 'auto' | 'manual') {
    saving.value = true
    error.value = null
    try {
      const res = await schedulerApi.setMode(mode)
      if (res.success && res.data) status.value = res.data
      return res.success
    } catch (e: unknown) {
      error.value = (e as Error).message
      return false
    } finally {
      saving.value = false
    }
  }

  async function setSchedule(cfg: Parameters<typeof schedulerApi.setSchedule>[0]) {
    saving.value = true
    error.value = null
    try {
      const res = await schedulerApi.setSchedule(cfg)
      if (res.success && res.data) status.value = res.data
      return res.success
    } catch (e: unknown) {
      error.value = (e as Error).message
      return false
    } finally {
      saving.value = false
    }
  }

  async function reload() {
    reloading.value = true
    error.value = null
    try {
      const res = await schedulerApi.reload()
      if (res.success && res.data) status.value = res.data
      return res.success
    } catch (e: unknown) {
      error.value = (e as Error).message
      return false
    } finally {
      reloading.value = false
    }
  }

  return { status, loading, reloading, saving, error, fetchStatus, setMode, setSchedule, reload }
})
