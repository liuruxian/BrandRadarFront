import { defineStore } from 'pinia'
import { ref } from 'vue'
import { systemApi } from '@/api/systemApi'
import type { HealthData, SummaryData } from '@/api/types'

export const useSystemStore = defineStore('system', () => {
  const health = ref<HealthData | null>(null)
  const summary = ref<SummaryData | null>(null)
  const loadingHealth = ref(false)
  const loadingSummary = ref(false)
  const error = ref<string | null>(null)

  async function fetchHealth() {
    loadingHealth.value = true
    error.value = null
    try {
      const res = await systemApi.getHealth()
      if (res.success) health.value = res.data
    } catch (e: unknown) {
      error.value = (e as Error).message
    } finally {
      loadingHealth.value = false
    }
  }

  async function fetchSummary() {
    loadingSummary.value = true
    error.value = null
    try {
      const res = await systemApi.getSummary()
      if (res.success) summary.value = res.data
    } catch (e: unknown) {
      error.value = (e as Error).message
    } finally {
      loadingSummary.value = false
    }
  }

  async function fetchAll() {
    await Promise.all([fetchHealth(), fetchSummary()])
  }

  return { health, summary, loadingHealth, loadingSummary, error, fetchHealth, fetchSummary, fetchAll }
})
