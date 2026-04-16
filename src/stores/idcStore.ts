// IDC Market Data Store
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { idcApi } from '@/api/idcApi'
import type {
  FilterConditions,
  FilterOptionsData,
  KPIData,
  TrendChartData,
  BrandDistributionData,
  ProductType,
  DualCategoryKPIData,
  DualCategoryTrendData,
  CategoryBrandDistribution,
} from '@/api/idcApiTypes'

// 全局筛选条件
export const useIDCStore = defineStore('idc', () => {
  // ==================== 品类筛选状态 ====================
  /** 品类类型: all=全品类, laser=激光, inkjet=喷墨 */
  const productType = ref<ProductType>('all')

  // ==================== 基础筛选条件 ====================
  const filters = ref<FilterConditions>({
    years: [],
    half_years: [],
    global_regions: [],
    regions: [],
    countries: [],
    companies: [],
    vendors: [],
    brands: [],
    product_categories: [],
    products: [],
    color_types: [],
    formats: [],
    channels: [],
    channel_groups: [],
    speed_ranges_a4: [],
    ink_types: [],
    production_classifications: [],
    adf_options: [],
    duplex_options: [],
    network_options: [],
    wireless_options: [],
    oems: [],
    business_inkjet_detail: [],
    // 品类专属筛选
    product_type: 'all',
    laser_product_details: [],
    inkjet_product_details: [],
  })

  // ==================== 可用选项 ====================
  const filterOptions = ref<FilterOptionsData>({})
  const loadingFilters = ref(false)

  // ==================== 缓存 ====================
  const kpiCache = ref<Map<string, KPIData>>(new Map())
  const dualKpiCache = ref<Map<string, DualCategoryKPIData>>(new Map())
  const trendCache = ref<Map<string, TrendChartData>>(new Map())
  const dualTrendCache = ref<Map<string, DualCategoryTrendData>>(new Map())
  const brandCache = ref<Map<string, BrandDistributionData>>(new Map())
  const categoryBrandCache = ref<Map<string, CategoryBrandDistribution>>(new Map())

  // ==================== 状态 ====================
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ==================== 计算属性 ====================
  // 生成筛选条件缓存 key
  const filterCacheKey = computed(() => JSON.stringify(filters.value))

  // 是否存在有效筛选条件
  const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(
      (v) => Array.isArray(v) && v.length > 0
    )
  })

  // 已选的时间范围文本
  const selectedTimeRange = computed(() => {
    const years = filters.value.years || []
    const halfYears = filters.value.half_years || []
    if (years.length === 0 && halfYears.length === 0) return '全部时间'
    if (years.length === 1 && halfYears.length === 0) return years[0]
    if (years.length === 1 && halfYears.length === 1) return `${years[0]} ${halfYears[0]}`
    if (years.length === 2 && halfYears.length === 0) return `${years[0]} - ${years[1]}`
    return `${years.length} 个年份`
  })

  // ==================== 品类相关计算属性 ====================

  /** 当前选中品类的中文描述 */
  const productTypeLabel = computed(() => {
    const labels: Record<ProductType, string> = {
      all: '全品类',
      laser: '激光打印机',
      inkjet: '喷墨打印机',
    }
    return labels[productType.value]
  })

  /** 是否选中了全品类 */
  const isAllCategory = computed(() => productType.value === 'all')

  /** 是否选中了激光品类 */
  const isLaserCategory = computed(() => productType.value === 'laser')

  /** 是否选中了喷墨品类 */
  const isInkjetCategory = computed(() => productType.value === 'inkjet')

  /** 获取合并后的筛选条件（用于API调用） */
  const mergedFilters = computed<FilterConditions>(() => {
    const base = { ...filters.value }
    // 确保 product_type 与 productType 一致
    base.product_type = productType.value

    // 如果选中激光，添加激光专属筛选
    if (productType.value === 'laser' && filters.value.laser_product_details?.length) {
      // 将激光产品细分映射到 products
      const laserProducts = filters.value.laser_product_details.map(d => {
        if (d === 'Color Laser') return 'Color Laser MFP'
        if (d === 'Mono Laser') return 'Mono Laser MFP'
        return d
      })
      if (!base.products) base.products = []
      base.products = [...new Set([...base.products, ...laserProducts])]
    }

    // 如果选中喷墨，添加喷墨专属筛选
    if (productType.value === 'inkjet' && filters.value.inkjet_product_details?.length) {
      const inkjetProducts = filters.value.inkjet_product_details.map(d => {
        if (d === 'Color Inkjet') return 'Color Inkjet MFP'
        if (d === 'Mono Inkjet') return 'Mono Inkjet MFP'
        return d
      })
      if (!base.products) base.products = []
      base.products = [...new Set([...base.products, ...inkjetProducts])]
    }

    return base
  })

  /** 品类专属筛选是否激活 */
  const hasCategorySpecificFilters = computed(() => {
    if (productType.value === 'laser') {
      return (filters.value.laser_product_details?.length ?? 0) > 0
    }
    if (productType.value === 'inkjet') {
      return (
        (filters.value.inkjet_product_details?.length ?? 0) > 0 ||
        (filters.value.ink_types?.length ?? 0) > 0
      )
    }
    return false
  })

  // ==================== 方法 ====================

  /**
   * 设置品类类型
   * 切换品类类型时，清除品类专属筛选条件
   */
  function setProductType(type: ProductType) {
    productType.value = type
    filters.value.product_type = type
    // 清除品类专属筛选
    filters.value.laser_product_details = []
    filters.value.inkjet_product_details = []
    clearCache()
  }

  // 加载筛选选项
  async function loadFilterOptions() {
    loadingFilters.value = true
    try {
      const res = await idcApi.getFilterOptions()
      if (res.success && res.data) {
        filterOptions.value = res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loadingFilters.value = false
    }
  }

  // 更新筛选条件
  function updateFilter<K extends keyof FilterConditions>(
    key: K,
    value: FilterConditions[K]
  ) {
    filters.value[key] = value

    // 级联清除子级筛选
    const cascadeMap: Record<string, string[]> = {
      global_regions: ['regions', 'countries'],
      regions: ['countries'],
      companies: ['vendors', 'brands'],
      vendors: ['brands'],
      product_categories: ['products'],
    }

    if (cascadeMap[key]) {
      ;(cascadeMap[key] as string[]).forEach((subKey) => {
        ;(filters.value as Record<string, unknown>)[subKey] = []
      })
    }

    // 如果切换产品类型，清除相关筛选
    if (key === 'product_categories') {
      filters.value.laser_product_details = []
      filters.value.inkjet_product_details = []
    }

    // 如果切换产品筛选，清除品类专属筛选
    if (key === 'products') {
      filters.value.laser_product_details = []
      filters.value.inkjet_product_details = []
    }

    // 如果切换激光产品细分，清除喷墨专属筛选
    if (key === 'laser_product_details') {
      filters.value.inkjet_product_details = []
    }

    // 如果切换喷墨产品细分，清除激光专属筛选
    if (key === 'inkjet_product_details') {
      filters.value.laser_product_details = []
    }

    // 清除相关缓存
    clearCache()
  }

  // 重置筛选条件
  function resetFilters() {
    // 重置品类类型
    productType.value = 'all'
    filters.value.product_type = 'all'

    Object.keys(filters.value).forEach((key) => {
      const k = key as keyof FilterConditions
      if (Array.isArray(filters.value[k])) {
        (filters.value[k] as unknown[]) = []
      }
    })
    clearCache()
  }

  // 清除缓存
  function clearCache() {
    kpiCache.value.clear()
    dualKpiCache.value.clear()
    trendCache.value.clear()
    dualTrendCache.value.clear()
    brandCache.value.clear()
    categoryBrandCache.value.clear()
  }

  // ==================== 品类相关数据获取方法 ====================

  /**
   * 获取双品类KPI数据（激光 + 喷墨 + 全品类）
   */
  async function fetchDualCategoryKPI(): Promise<DualCategoryKPIData | null> {
    const cacheKey = `${productType.value}_${filterCacheKey.value}`
    if (dualKpiCache.value.has(cacheKey)) {
      return dualKpiCache.value.get(cacheKey)!
    }

    loading.value = true
    error.value = null
    try {
      const res = await idcApi.getDualCategoryKPI()
      if (res.success && res.data) {
        dualKpiCache.value.set(cacheKey, res.data)
        return res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
    return null
  }

  /**
   * 获取双品类趋势数据
   */
  async function fetchDualCategoryTrend(
    trendType: 'dual_axis' | 'region_stacked' | 'brand_share',
    topN: number = 10
  ): Promise<DualCategoryTrendData | null> {
    const cacheKey = `${trendType}_${topN}_${productType.value}_${filterCacheKey.value}`
    if (dualTrendCache.value.has(cacheKey)) {
      return dualTrendCache.value.get(cacheKey)!
    }

    loading.value = true
    error.value = null
    try {
      const res = await idcApi.getDualCategoryTrend(trendType)
      if (res.success && res.data) {
        dualTrendCache.value.set(cacheKey, res.data)
        return res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
    return null
  }

  /**
   * 获取品类品牌分布
   */
  async function fetchCategoryBrandDistribution(
    type: 'top_n' | 'compare' = 'top_n',
    brands?: string[]
  ): Promise<CategoryBrandDistribution | null> {
    const cacheKey = `${type}_${brands?.join(',')}_${productType.value}_${filterCacheKey.value}`
    if (categoryBrandCache.value.has(cacheKey)) {
      return categoryBrandCache.value.get(cacheKey)!
    }

    loading.value = true
    error.value = null
    try {
      const res = await idcApi.getCategoryBrandDistribution()
      if (res.success && res.data) {
        categoryBrandCache.value.set(cacheKey, res.data)
        return res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
    return null
  }

  // 获取 KPI 数据
  async function fetchKPI(): Promise<KPIData | null> {
    const cacheKey = filterCacheKey.value
    if (kpiCache.value.has(cacheKey)) {
      return kpiCache.value.get(cacheKey)!
    }

    loading.value = true
    error.value = null
    try {
      const res = await idcApi.getOverviewKPI()
      if (res.success && res.data) {
        kpiCache.value.set(cacheKey, res.data)
        return res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
    return null
  }

  // 获取趋势数据
  async function fetchTrend(
    trendType: 'dual_axis' | 'region_stacked' | 'brand_share',
    topN: number = 10
  ): Promise<TrendChartData | null> {
    const cacheKey = `${trendType}_${topN}_${filterCacheKey.value}`
    if (trendCache.value.has(cacheKey)) {
      return trendCache.value.get(cacheKey)!
    }

    loading.value = true
    error.value = null
    try {
      const res = await idcApi.getOverviewTrend(trendType)
      if (res.success && res.data) {
        trendCache.value.set(cacheKey, res.data)
        return res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
    return null
  }

  // 获取品牌分布
  async function fetchBrandDistribution(
    type: 'top_n' | 'oem' | 'compare',
    brands?: string[]
  ): Promise<BrandDistributionData | null> {
    const cacheKey = `${type}_${brands?.join(',')}_${filterCacheKey.value}`
    if (brandCache.value.has(cacheKey)) {
      return brandCache.value.get(cacheKey)!
    }

    loading.value = true
    error.value = null
    try {
      const res = await idcApi.getBrandDistribution(type, brands)
      if (res.success && res.data) {
        brandCache.value.set(cacheKey, res.data)
        return res.data
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
    return null
  }

  // 应用预设筛选
  function applyPreset(preset: Partial<FilterConditions>) {
    Object.entries(preset).forEach(([key, value]) => {
      const k = key as keyof FilterConditions
      ;(filters.value as Record<string, unknown>)[k] = value
    })
    clearCache()
  }

  return {
    // State
    filters,
    productType,
    filterOptions,
    loadingFilters,
    loading,
    error,

    // Computed
    hasActiveFilters,
    selectedTimeRange,
    filterCacheKey,
    productTypeLabel,
    isAllCategory,
    isLaserCategory,
    isInkjetCategory,
    mergedFilters,
    hasCategorySpecificFilters,

    // Actions
    loadFilterOptions,
    updateFilter,
    setProductType,
    resetFilters,
    clearCache,
    fetchKPI,
    fetchTrend,
    fetchBrandDistribution,
    // 品类相关方法
    fetchDualCategoryKPI,
    fetchDualCategoryTrend,
    fetchCategoryBrandDistribution,
    applyPreset,
  }
})
