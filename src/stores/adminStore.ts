import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminApi } from '@/api/adminApi'
import type { SystemState, SystemMetrics, SystemConfig, Announcement } from '@/api/adminApi'

export const useAdminStore = defineStore('admin', () => {
  const state    = ref<SystemState | null>(null)
  const metrics  = ref<SystemMetrics | null>(null)
  const config   = ref<SystemConfig | null>(null)
  const announce = ref<Announcement | null>(null)
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  let eventSource: EventSource | null = null

  const isHeartbeatDead = computed(() => {
    if (!state.value?.last_heartbeat) return false
    return Date.now() - new Date(state.value.last_heartbeat).getTime() > 60_000
  })

  const isDiskCritical = computed(() => (metrics.value?.disk_percent ?? 0) >= 90)
  const isDiskWarning  = computed(() => (metrics.value?.disk_percent ?? 0) >= 80)

  async function fetchState() {
    try {
      const res = await adminApi.getSystemState()
      if (res.success && res.data) state.value = res.data
    } catch { /* ignore */ }
  }

  async function fetchMetrics() {
    try {
      const res = await adminApi.getMetrics()
      if (res.success && res.data) metrics.value = res.data
    } catch { /* ignore */ }
  }

  async function fetchConfig() {
    loading.value = true
    try {
      const res = await adminApi.getConfig()
      if (res.success && res.data) config.value = res.data
    } catch (e: unknown) {
      error.value = (e as Error).message
    } finally { loading.value = false }
  }

  async function saveConfig(cfg: Partial<SystemConfig>) {
    loading.value = true
    try {
      const res = await adminApi.updateConfig(cfg)
      if (res.success && res.data) { config.value = res.data; return true }
      error.value = res.error?.message ?? '保存失败'
      return false
    } catch (e: unknown) {
      error.value = (e as Error).message
      return false
    } finally { loading.value = false }
  }

  async function fetchAnnouncement() {
    try {
      const res = await adminApi.getAnnouncement()
      if (res.success && res.data) announce.value = res.data
    } catch { /* ignore */ }
  }

  async function togglePause() {
    try {
      const res = await adminApi.togglePause()
      if (res.success && res.data) state.value = res.data
    } catch { /* ignore */ }
  }

  function connectStream() {
    if (eventSource) return
    const es = adminApi.openStream()
    es.onmessage = (e) => {
      try {
        const evt = JSON.parse(e.data)
        if (state.value && evt.data)   Object.assign(state.value,   evt.data)
        if (metrics.value && evt.data) Object.assign(metrics.value, evt.data)
      } catch { /* ignore */ }
    }
    es.onerror = () => { es.close(); eventSource = null }
    eventSource = es
  }

  function disconnectStream() {
    eventSource?.close()
    eventSource = null
  }

  return {
    state, metrics, config, announce, loading, error,
    isHeartbeatDead, isDiskCritical, isDiskWarning,
    fetchState, fetchMetrics, fetchConfig, saveConfig,
    fetchAnnouncement, togglePause, connectStream, disconnectStream
  }
})
