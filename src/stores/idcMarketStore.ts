// IDC Market Data Store - 用于各页面数据管理
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { idcMockApi as idcApi } from '@/api/idcMockApi'
import type {
  FilterConditions,
  KPIData,
  TrendChartData,
  BrandDistributionData,
} from '@/api/idcApiTypes'

export const useIDCMarketStore = defineStore('idcMarket', () => {
  // Loading states
  const loading = ref(false)
  const kpiLoading = ref(false)
  const trendLoading = ref(false)
  const brandLoading = ref(false)

  // Error state
  const error = ref<string | null>(null)

  // Data states
  const kpiData = ref<KPIData | null>(null)
  const trendDualAxis = ref<TrendChartData | null>(null)
  const trendRegionStacked = ref<TrendChartData | null>(null)
  const trendBrandShare = ref<TrendChartData | null>(null)
  const brandTopN = ref<BrandDistributionData | null>(null)
  const brandOEM = ref<BrandDistributionData | null>(null)
  const brandCompare = ref<BrandDistributionData | null>(null)

  // ==================== KPI ====================
  async function fetchKPI() {
    kpiLoading.value = true
    error.value = null
    try {
      const res = await idcApi.getOverviewKPI()
      if (res.success && res.data) {
        kpiData.value = res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      kpiLoading.value = false
    }
  }

  // ==================== Trend ====================
  async function fetchTrendDualAxis() {
    trendLoading.value = true
    try {
      const res = await idcApi.getOverviewTrend('dual_axis')
      if (res.success && res.data) {
        trendDualAxis.value = res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      trendLoading.value = false
    }
  }

  async function fetchTrendRegionStacked() {
    trendLoading.value = true
    try {
      const res = await idcApi.getOverviewTrend('region_stacked')
      if (res.success && res.data) {
        trendRegionStacked.value = res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      trendLoading.value = false
    }
  }

  async function fetchTrendBrandShare() {
    trendLoading.value = true
    try {
      const res = await idcApi.getOverviewTrend('brand_share')
      if (res.success && res.data) {
        trendBrandShare.value = res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      trendLoading.value = false
    }
  }

  // ==================== Brand ====================
  async function fetchBrandTopN() {
    brandLoading.value = true
    try {
      const res = await idcApi.getBrandDistribution('top_n')
      if (res.success && res.data) {
        brandTopN.value = res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      brandLoading.value = false
    }
  }

  async function fetchBrandOEM() {
    brandLoading.value = true
    try {
      const res = await idcApi.getBrandDistribution('oem')
      if (res.success && res.data) {
        brandOEM.value = res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      brandLoading.value = false
    }
  }

  async function fetchBrandCompare(brands: string[]) {
    brandLoading.value = true
    try {
      const res = await idcApi.getBrandDistribution('compare', brands)
      if (res.success && res.data) {
        brandCompare.value = res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      brandLoading.value = false
    }
  }

  // ==================== Reset ====================
  function resetAll() {
    loading.value = false
    kpiLoading.value = false
    trendLoading.value = false
    brandLoading.value = false
    error.value = null
    kpiData.value = null
    trendDualAxis.value = null
    trendRegionStacked.value = null
    trendBrandShare.value = null
    brandTopN.value = null
    brandOEM.value = null
    brandCompare.value = null
  }

  return {
    // Loading
    loading,
    kpiLoading,
    trendLoading,
    brandLoading,
    error,

    // Data
    kpiData,
    trendDualAxis,
    trendRegionStacked,
    trendBrandShare,
    brandTopN,
    brandOEM,
    brandCompare,

    // Actions
    fetchKPI,
    fetchTrendDualAxis,
    fetchTrendRegionStacked,
    fetchTrendBrandShare,
    fetchBrandTopN,
    fetchBrandOEM,
    fetchBrandCompare,
    resetAll,
  }
})
