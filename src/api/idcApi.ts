// IDC Market Analysis API Client
import { get, post, put, del } from './client'
import type { ApiResponse } from './types'
import type {
  FilterOptionsData,
  FilterApplyRequest,
  KPIData,
  TrendChartData,
  BrandDistributionData,
  PivotRequest,
  PivotData,
  TemplateItem,
  GeoHeatmapItem,
  CountryDetailData,
  GeoCompareData,
  ProductSearchItem,
  ProductCompareData,
  ChannelSankeyData,
  ChannelStackedData,
  OnlineOfflineData,
  PriceSegmentData,
  InkTankAnalysisData,
  SpeedSegmentData,
  MFPFunctionData,
  RankingData,
  ExportData,
  DualCategoryKPIData,
  DualCategoryTrendData,
  CategoryBrandDistribution,
  AdvancedPivotRequest,
  AdvancedPivotData,
  AdvancedTemplateItem,
  MyTemplateItem,
  SaveTemplateRequest,
  UpdateTemplateRequest,
  FilterConditions,
} from './idcApiTypes'

// Filter APIs
export async function getFilterOptions(parentField?: string, parentValue?: string): Promise<ApiResponse<FilterOptionsData>> {
  const params = new URLSearchParams()
  if (parentField) params.append('parent_field', parentField)
  if (parentValue) params.append('parent_value', parentValue)
  return get<FilterOptionsData>(`/api/idc/filters/options?${params}`)
}

export async function applyFilters(body: FilterApplyRequest): Promise<ApiResponse<FilterOptionsData>> {
  return post<FilterOptionsData>('/api/idc/filters/apply', body)
}

// Overview APIs
export async function getOverviewKPI(filters?: Record<string, unknown>): Promise<ApiResponse<KPIData & { yoy_change_units?: number; yoy_change_value?: number; mom_change_units?: number; mom_change_value?: number }>> {
  const params = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ''
  const res = await get<KPIData>(`/api/idc/overview/kpi${params}`)
  if (res.success && res.data) {
    const d = res.data as KPIData & Record<string, unknown>
    d.yoy_change_units = d.units_yoy ?? 0
    d.yoy_change_value = d.value_yoy ?? 0
    d.mom_change_units = d.units_mom ?? 0
    d.mom_change_value = d.value_mom ?? 0
  }
  return res as ApiResponse<KPIData & { yoy_change_units?: number; yoy_change_value?: number; mom_change_units?: number; mom_change_value?: number }>
}

export async function getOverviewTrend(
  trendType: 'dual_axis' | 'region_stacked' | 'brand_share',
  topN: number = 10,
  filters?: Record<string, unknown>
): Promise<ApiResponse<TrendChartData>> {
  const params = new URLSearchParams({ trend_type: trendType, top_n: String(topN) })
  if (filters) params.append('filters', JSON.stringify(filters))
  const res = await get<TrendChartData>(`/api/idc/overview/trend?${params}`)
  if (res.success && res.data) {
    const data = res.data as TrendChartData & Record<string, unknown>
    const unitsSeries = (res.data as TrendChartData).series?.find((s: { name: string }) => s.name === '销量' || s.name === 'Units')
    const valuesSeries = (res.data as TrendChartData).series?.find((s: { name: string }) => s.name === '销售额' || s.name === 'Value')
    if (unitsSeries) data.units = unitsSeries.data
    if (valuesSeries) data.values = valuesSeries.data
  }
  return res as ApiResponse<TrendChartData>
}

export async function getBrandDistribution(
  type: 'top_n' | 'oem' | 'compare',
  brands?: string[],
  filters?: Record<string, unknown>
): Promise<ApiResponse<BrandDistributionData>> {
  const params = new URLSearchParams({ type })
  if (brands?.length) params.append('brands', brands.join(','))
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<BrandDistributionData>(`/api/idc/overview/brand?${params}`)
}

// Explore APIs
export async function queryPivot(body: PivotRequest): Promise<ApiResponse<PivotData>> {
  return post<PivotData>('/api/idc/explore/pivot', body)
}

export async function getTemplates(): Promise<ApiResponse<TemplateItem[]>> {
  return get<TemplateItem[]>('/api/idc/explore/templates')
}

// Geography APIs
export async function getGeoHeatmap(
  metric: 'units' | 'value' | 'asp' = 'units',
  filters?: Record<string, unknown>
): Promise<ApiResponse<GeoHeatmapItem[]>> {
  const params = new URLSearchParams({ metric })
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<GeoHeatmapItem[]>(`/api/idc/geo/heatmap?${params}`)
}

export async function getCountryDetail(
  countryCode: string,
  filters?: Record<string, unknown>
): Promise<ApiResponse<CountryDetailData>> {
  const params = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ''
  return get<CountryDetailData>(`/api/idc/geo/country/${countryCode}${params}`)
}

export async function compareGeo(
  countries: string[],
  filters?: Record<string, unknown>
): Promise<ApiResponse<GeoCompareData>> {
  const params = new URLSearchParams({ countries: countries.join(',') })
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<GeoCompareData>(`/api/idc/geo/compare?${params}`)
}

// Product Compare APIs
export async function searchProducts(params: {
  keyword: string
  brand?: string
  product?: string
  format?: string
  product_category?: string
  limit?: number
}): Promise<ApiResponse<ProductSearchItem[]>> {
  const queryParams = new URLSearchParams({ keyword: params.keyword })
  if (params.brand) queryParams.append('brand', params.brand)
  if (params.product) queryParams.append('product', params.product)
  if (params.format) queryParams.append('format', params.format)
  if (params.product_category) queryParams.append('product_category', params.product_category)
  if (params.limit) queryParams.append('limit', String(params.limit))
  return get<ProductSearchItem[]>(`/api/idc/product/search?${queryParams}`)
}

export async function compareProducts(
  modelKeys: string[],
  compareType: 'spec' | 'market' | 'region' | 'channel' | 'trend' = 'spec',
  filters?: Record<string, unknown>
): Promise<ApiResponse<ProductCompareData>> {
  const params = new URLSearchParams({
    model_keys: modelKeys.join(','),
    compare_type: compareType,
  })
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<ProductCompareData>(`/api/idc/product/compare?${params}`)
}

// Channel APIs
export async function getChannelSankey(
  metric: 'units' | 'value' = 'units',
  filters?: Record<string, unknown>
): Promise<ApiResponse<ChannelSankeyData>> {
  const params = new URLSearchParams({ metric })
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<ChannelSankeyData>(`/api/idc/channel/sankey?${params}`)
}

export async function getChannelStacked(
  topNBrands: number = 10,
  filters?: Record<string, unknown>
): Promise<ApiResponse<ChannelStackedData>> {
  const params = new URLSearchParams({ top_n_brands: String(topNBrands) })
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<ChannelStackedData>(`/api/idc/channel/stacked?${params}`)
}

export async function getChannelOnlineOffline(
  filters?: Record<string, unknown>
): Promise<ApiResponse<OnlineOfflineData>> {
  const params = new URLSearchParams()
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<OnlineOfflineData>(`/api/idc/channel/online_offline?${params}`)
}

// Price APIs
export async function getPriceSegments(
  segmentType: 'market_capacity' | 'brand_position' | 'asp_trend' | 'brand_asp_compare',
  filters?: Record<string, unknown>
): Promise<ApiResponse<PriceSegmentData>> {
  const params = new URLSearchParams({ segment_type: segmentType })
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<PriceSegmentData>(`/api/idc/price/segments?${params}`)
}

// Technology APIs
export async function getInkTankAnalysis(
  analysisType: 'overall' | 'region' | 'brand' | 'drilldown',
  drilldownType?: 'country' | 'model',
  filters?: Record<string, unknown>
): Promise<ApiResponse<InkTankAnalysisData>> {
  const params = new URLSearchParams({ analysis_type: analysisType })
  if (drilldownType) params.append('drilldown_type', drilldownType)
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<InkTankAnalysisData>(`/api/idc/tech/ink_tank?${params}`)
}

export async function getSpeedSegmentAnalysis(
  analysisType: 'capacity' | 'brand_share' | 'scatter' | 'trend',
  filters?: Record<string, unknown>
): Promise<ApiResponse<SpeedSegmentData>> {
  const params = new URLSearchParams({ analysis_type: analysisType })
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<SpeedSegmentData>(`/api/idc/tech/speed_segment?${params}`)
}

export async function getMFPFunctionAnalysis(
  analysisType: 'coverage' | 'combination' | 'brand_diff' | 'region_diff',
  filters?: Record<string, unknown>
): Promise<ApiResponse<MFPFunctionData>> {
  const params = new URLSearchParams({ analysis_type: analysisType })
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<MFPFunctionData>(`/api/idc/tech/mfp_function?${params}`)
}

// Ranking APIs
export async function getRanking(params: {
  rankType: 'brand' | 'country' | 'region' | 'model' | 'oem' | 'channel_group'
  sortBy?: 'units' | 'value' | 'asp' | 'active_models'
  order?: 'asc' | 'desc'
  topN?: number
  page?: number
  pageSize?: number
  filters?: Record<string, unknown>
}): Promise<ApiResponse<RankingData>> {
  const queryParams = new URLSearchParams({
    rank_type: params.rankType,
    sort_by: params.sortBy || 'units',
    order: params.order || 'desc',
    top_n: String(params.topN || 10),
    page: String(params.page || 1),
    page_size: String(params.pageSize || 20),
  })
  if (params.filters) queryParams.append('filters', JSON.stringify(params.filters))
  return get<RankingData>(`/api/idc/rank?${queryParams}`)
}

// Export APIs
export interface ExportCurrentViewRequest {
  filters?: FilterConditions
  export_type?: 'pivot'
  format?: 'excel'
}

export interface ExportRawDataRequest {
  filters?: FilterConditions
  format?: 'csv'
}

export async function exportCurrentView(body: ExportCurrentViewRequest): Promise<ApiResponse<ExportData>> {
  return post<ExportData>('/api/idc/export/current_view', body)
}

export async function exportRawData(body: ExportRawDataRequest): Promise<ApiResponse<ExportData>> {
  return post<ExportData>('/api/idc/export/raw_data', body)
}

// Dual Category APIs
export async function getDualCategoryKPI(filters?: Record<string, unknown>): Promise<ApiResponse<DualCategoryKPIData>> {
  const params = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ''
  return get<DualCategoryKPIData>(`/api/idc/overview/kpi/dual_category${params}`)
}

export async function getDualCategoryTrend(
  trendType: 'dual_axis' | 'region_stacked' | 'brand_share',
  filters?: Record<string, unknown>
): Promise<ApiResponse<DualCategoryTrendData>> {
  console.log('[getDualCategoryTrend] 调用, trendType:', trendType)
  try {
    const params = new URLSearchParams({ trend_type: trendType })
    if (filters) params.append('filters', JSON.stringify(filters))
    console.log('[getDualCategoryTrend] 请求URL:', `/api/idc/overview/trend/dual_category?${params}`)
    const res = await get<{ periods?: string[]; series?: Array<{ name: string; data: number[] }> }>(`/api/idc/overview/trend/dual_category?${params}`)
    console.log('[getDualCategoryTrend] 响应:', res)
    if (res.success && res.data) {
      const d = res.data
      console.log('[getDualCategoryTrend] data:', d)
      if (!d || typeof d !== 'object') {
        console.error('[getDualCategoryTrend] data 不是对象:', d)
        return { success: false, data: null, error: { code: 'INVALID_DATA', message: '数据格式错误' }, meta: null }
      }
      const series = d.series || []
      console.log('[getDualCategoryTrend] series:', series)
      const laserSeries = series.find(s => /laser/i.test(s.name))
      const inkjetSeries = series.find(s => /inkjet/i.test(s.name))
      const result: DualCategoryTrendData = {
        periods: d.periods ?? [],
        laser_units: laserSeries?.data ?? [],
        inkjet_units: inkjetSeries?.data ?? [],
        laser_value: laserSeries?.data ?? [],
        inkjet_value: inkjetSeries?.data ?? [],
      }
      console.log('[getDualCategoryTrend] 结果:', result)
      return { success: true, data: result, error: null, meta: null }
    }
    console.warn('[getDualCategoryTrend] 请求失败或无数据:', res)
    return { success: false, data: null, error: (res.error ?? { code: 'UNKNOWN', message: 'Failed to fetch dual category trend' }) as ApiResponse<DualCategoryTrendData>['error'], meta: null }
  } catch (e) {
    console.error('[getDualCategoryTrend] 异常:', e)
    return { success: false, data: null, error: { code: 'UNKNOWN', message: String(e) }, meta: null }
  }
}

export async function getCategoryBrandDistribution(
  topN: number = 10,
  filters?: Record<string, unknown>
): Promise<ApiResponse<CategoryBrandDistribution>> {
  const params = new URLSearchParams({ top_n: String(topN) })
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<CategoryBrandDistribution>(`/api/idc/overview/brand/category_distribution?${params}`)
}

// Advanced Explore APIs
export async function queryAdvancedPivot(body: AdvancedPivotRequest): Promise<ApiResponse<AdvancedPivotData>> {
  return post<AdvancedPivotData>('/api/idc/explore/pivot/advanced', body)
}

// Template APIs
export async function getAdvancedTemplates(): Promise<ApiResponse<AdvancedTemplateItem[]>> {
  return get<AdvancedTemplateItem[]>('/api/idc/templates/advanced')
}

export async function getMyTemplates(): Promise<ApiResponse<MyTemplateItem[]>> {
  return get<MyTemplateItem[]>('/api/idc/templates/my')
}

export async function saveTemplate(body: SaveTemplateRequest): Promise<ApiResponse<MyTemplateItem[]>> {
  return post<MyTemplateItem[]>('/api/idc/templates', body)
}

export async function updateTemplate(id: string, body: UpdateTemplateRequest): Promise<ApiResponse<MyTemplateItem[]>> {
  return put<MyTemplateItem[]>(`/api/idc/templates/${id}`, body)
}

export async function deleteTemplate(id: string): Promise<ApiResponse<{ success: boolean }>> {
  return del<{ success: boolean }>(`/api/idc/templates/${id}`)
}

export async function cloneTemplate(id: string, newName: string): Promise<ApiResponse<MyTemplateItem[]>> {
  return post<MyTemplateItem[]>(`/api/idc/templates/${id}/clone`, { name: newName })
}

// Aggregation APIs
export async function getAggregationDefinitions() {
  return get<{ success: boolean; data: unknown[] }>('/api/idc/aggregations/definitions')
}

export async function getValueFieldOptions() {
  return get<{ success: boolean; data: unknown[] }>('/api/idc/aggregations/options')
}

export async function getDefaultValueConfigs() {
  return get<{ success: boolean; data: unknown[] }>('/api/idc/aggregations/defaults')
}

export const idcApi = {
  // Filters
  getFilterOptions,
  applyFilters,
  // Overview
  getOverviewKPI,
  getOverviewTrend,
  getBrandDistribution,
  // Dual Category
  getDualCategoryKPI,
  getDualCategoryTrend,
  getCategoryBrandDistribution,
  // Explore
  queryPivot,
  queryAdvancedPivot,
  getTemplates,
  // Templates
  getAdvancedTemplates,
  getMyTemplates,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  cloneTemplate,
  // Aggregation
  getAggregationDefinitions,
  getValueFieldOptions,
  getDefaultValueConfigs,
  // Geography
  getGeoHeatmap,
  getCountryDetail,
  compareGeo,
  // Product
  searchProducts,
  compareProducts,
  // Channel
  getChannelSankey,
  getChannelStacked,
  getChannelOnlineOffline,
  // Price
  getPriceSegments,
  // Technology
  getInkTankAnalysis,
  getSpeedSegmentAnalysis,
  getMFPFunctionAnalysis,
  // Ranking
  getRanking,
  // Export
  exportCurrentView,
  exportRawData,
}
