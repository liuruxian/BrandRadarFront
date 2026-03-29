import { defineStore } from 'pinia'
import { ref } from 'vue'
import { crawlApi } from '@/api/crawlApi'
import type { CrawlTask, CrawlTriggerBody } from '@/api/types'

export const useCrawlStore = defineStore('crawl', () => {
  const tasks = ref<CrawlTask[]>([])
  const loading = ref(false)
  const triggering = ref(false)
  const error = ref<string | null>(null)
  const pollingIds = ref<Set<string>>(new Set())
  const timers = ref<Map<string, ReturnType<typeof setInterval>>>(new Map())

  async function fetchTasks(params?: { brand?: string; country?: string }) {
    loading.value = true
    try {
      const res = await crawlApi.getTasks(params)
      if (res.success && res.data) tasks.value = res.data.tasks
    } catch (e: unknown) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function trigger(body: CrawlTriggerBody = {}) {
    triggering.value = true
    error.value = null
    try {
      const res = await crawlApi.trigger(body)
      if (res.success && res.data) {
        const task = res.data
        tasks.value.unshift(task)
        startPolling(task.task_id)
        return task
      }
    } catch (e: unknown) {
      const axiosError = e as { response?: { data?: { error?: { message?: string } } } }
      error.value = axiosError.response?.data?.error?.message ?? (e as Error).message
    } finally {
      triggering.value = false
    }
    return null
  }

  function startPolling(taskId: string) {
    if (pollingIds.value.has(taskId)) return
    pollingIds.value.add(taskId)
    const timer = setInterval(async () => {
      try {
        const res = await crawlApi.getTaskById(taskId)
        if (res.success && res.data) {
          const updated = res.data
          const idx = tasks.value.findIndex(t => t.task_id === taskId)
          if (idx !== -1) tasks.value[idx] = updated
          if (updated.status === 'done' || updated.status === 'failed') {
            stopPolling(taskId)
          }
        }
      } catch {
        stopPolling(taskId)
      }
    }, 3000)
    timers.value.set(taskId, timer)
  }

  function stopPolling(taskId: string) {
    pollingIds.value.delete(taskId)
    const timer = timers.value.get(taskId)
    if (timer) {
      clearInterval(timer)
      timers.value.delete(taskId)
    }
  }

  async function cleanup() {
    try {
      const res = await crawlApi.cleanup()
      return res.data
    } catch {
      return null
    }
  }

  return { tasks, loading, triggering, error, pollingIds, fetchTasks, trigger, cleanup, startPolling, stopPolling }
})
