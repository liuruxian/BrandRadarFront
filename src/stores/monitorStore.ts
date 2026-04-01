import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { monitorApi, type AlertItem, type BackupTask, type MonitorOverview } from '@/api/monitorApi'
import { schedulerApi } from '@/api/schedulerApi'

type CrawlTask = {
  task_id: string
  brand?: string | null
  country?: string | null
  status: 'queued' | 'running' | 'done' | 'failed'
  started_at?: string | null
  finished_at?: string | null
  progress?: string | null
  product_count?: number | null
  new_count?: number | null
  updated_count?: number | null
  error?: string | null
}

export const useMonitorStore = defineStore('monitor', () => {
  const overview = ref<MonitorOverview | null>(null)
  const crawlTasks = ref<Record<string, CrawlTask>>({})
  const backupTasks = ref<Record<string, BackupTask>>({})
  const alerts = ref<Record<string, AlertItem>>({})
  const priceChanges = ref<Array<{ time: string; brand: string; country: string; product_id: string; model: string; old_price: string; new_price: string; change_pct: number; direction: string }>>([])
  const sseConnected = ref(false)
  const lastSyncAt = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  let sse: EventSource | null = null

  const MAX_FALLBACK_RETRIES = 3
  const fallbackFailures = ref<Record<string, number>>({})

  const crawlTaskList = computed(() => Object.values(crawlTasks.value).sort((a, b) => (b.started_at || '').localeCompare(a.started_at || '')))
  const backupTaskList = computed(() => Object.values(backupTasks.value).sort((a, b) => (b.started_at || '').localeCompare(a.started_at || '')))
  const pendingAlerts = computed(() => Object.values(alerts.value).filter((a) => a.status === 'pending'))
  const alertList = computed(() => Object.values(alerts.value).sort((a, b) => (b.last_seen_at || '').localeCompare(a.last_seen_at || '')))

  function setLastSync() {
    lastSyncAt.value = new Date().toISOString()
  }

  async function runFallback(
    key: 'overview' | 'schedulerTasks' | 'backupTasks' | 'alerts',
    fn: () => Promise<void>
  ) {
    const cur = fallbackFailures.value[key] ?? 0
    if (cur >= MAX_FALLBACK_RETRIES) return
    try {
      await fn()
      fallbackFailures.value[key] = 0
      setLastSync()
    } catch {
      fallbackFailures.value[key] = cur + 1
    }
  }

  function resetFallbackFailures() {
    fallbackFailures.value = {}
  }

  function upsertCrawlTask(task: CrawlTask) {
    crawlTasks.value[task.task_id] = { ...crawlTasks.value[task.task_id], ...task }
  }

  function upsertBackupTask(task: BackupTask) {
    backupTasks.value[task.task_id] = { ...backupTasks.value[task.task_id], ...task }
  }

  function upsertAlert(alert: AlertItem) {
    alerts.value[alert.id] = { ...alerts.value[alert.id], ...alert }
  }

  async function fetchOverview() {
    const res = await monitorApi.getOverview()
    if (res.success && res.data) overview.value = res.data
  }

  async function fetchSchedulerTasks() {
    const res = await schedulerApi.getSchedulerTasks()
    if (!res.success || !res.data) return

    const rows = Array.isArray(res.data)
      ? res.data
      : ((res.data as { tasks?: CrawlTask[] }).tasks ?? [])

    for (const item of rows as CrawlTask[]) upsertCrawlTask(item)
  }

  async function fetchBackupTasks() {
    const res = await monitorApi.getBackupTasks({ limit: 50 })
    if (!res.success || !res.data) return

    const rows = Array.isArray(res.data)
      ? res.data
      : ((res.data as { tasks?: BackupTask[]; items?: BackupTask[] }).tasks ?? (res.data as { items?: BackupTask[] }).items ?? [])

    for (const item of rows) upsertBackupTask(item)
  }

  async function fetchAlerts(params?: { status?: 'pending' | 'approved' | 'rejected'; limit?: number }) {
    const res = await monitorApi.getAlerts(params)
    if (!res.success || !res.data) return

    const rows = Array.isArray(res.data)
      ? res.data
      : ((res.data as { items?: AlertItem[]; alerts?: AlertItem[] }).items ?? (res.data as { alerts?: AlertItem[] }).alerts ?? [])

    for (const item of rows) upsertAlert(item)
  }

  async function fetchPendingAlerts() {
    await fetchAlerts({ status: 'pending' })
  }

  async function fetchPriceChanges() {
    const res = await monitorApi.getPriceChanges({ limit: 100 })
    if (res.success && res.data) priceChanges.value = res.data.changes
  }

  async function fetchInitial() {
    loading.value = true
    error.value = null
    try {
      await Promise.all([fetchOverview(), fetchSchedulerTasks(), fetchBackupTasks(), fetchPendingAlerts()])
      setLastSync()
    } catch (e: unknown) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function handleSseEvent(name: string, data: any) {
    if (name.startsWith('crawl_task_')) {
      if (data?.task_id) upsertCrawlTask(data)
      if (name === 'crawl_task_completed' && Number(data?.price_change_count || 0) > 0) {
        try {
          await fetchPriceChanges()
          setLastSync()
        } catch {
          await runFallback('schedulerTasks', fetchSchedulerTasks)
        }
      }
      return
    }

    if (name === 'alert_pending') {
      if (data?.id) upsertAlert({ ...data, status: 'pending' })
      setLastSync()
      return
    }

    if (name === 'alert_decided') {
      if (data?.id) upsertAlert(data)
      setLastSync()
      return
    }

    if (name.startsWith('backup_task_')) {
      if (data?.task_id) upsertBackupTask(data)
      if (name === 'backup_task_completed' || name === 'backup_task_failed') {
        await runFallback('overview', fetchOverview)
        await runFallback('backupTasks', fetchBackupTasks)
      } else {
        setLastSync()
      }
    }
  }

  function connectSse() {
    if (sse) return
    sse = monitorApi.openEvents()
    sse.onopen = () => {
      sseConnected.value = true
      resetFallbackFailures()
      fetchInitial()
    }
    sse.onmessage = async (evt) => {
      try {
        const payload = JSON.parse(evt.data)
        const eventName = payload?.event || payload?.type || 'message'
        await handleSseEvent(eventName, payload?.data ?? payload)
      } catch {
        // ignore invalid payload
      }
    }
    sse.onerror = () => {
      sseConnected.value = false
      sse?.close()
      sse = null
      setTimeout(connectSse, 3000)
    }
  }

  function disconnectSse() {
    sseConnected.value = false
    sse?.close()
    sse = null
  }

  return {
    overview,
    crawlTasks,
    backupTasks,
    alerts,
    priceChanges,
    sseConnected,
    lastSyncAt,
    loading,
    error,
    fallbackFailures,
    crawlTaskList,
    backupTaskList,
    pendingAlerts,
    alertList,
    fetchInitial,
    fetchOverview,
    fetchSchedulerTasks,
    fetchBackupTasks,
    fetchPendingAlerts,
    fetchAlerts,
    fetchPriceChanges,
    connectSse,
    disconnectSse,
  }
})
