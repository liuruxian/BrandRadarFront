// IDC Market Analysis API Client
import axios from 'axios'
import type {
  FilterOptionsResponse,
  FilterApplyRequest,
  KPIResponse,
  TrendChartResponse,
  BrandDistributionResponse,
  PivotRequest,
  PivotResponse,
  TemplatesResponse,
  GeoHeatmapResponse,
  CountryDetailResponse,
  GeoCompareResponse,
  ProductSearchResponse,
  ProductCompareResponse,
  ChannelSankeyResponse,
  ChannelStackedResponse,
  OnlineOfflineResponse,
  PriceSegmentResponse,
  InkTankAnalysisResponse,
  SpeedSegmentResponse,
  MFPFunctionResponse,
  RankingResponse,
  ExportRequest,
  ReportExportRequest,
  ExportResponse,
  DualCategoryKPIResponse,
  DualCategoryTrendResponse,
  CategoryBrandDistributionResponse,
  AdvancedPivotRequest,
  AdvancedPivotResponse,
  AdvancedTemplatesResponse,
  MyTemplatesResponse,
  SaveTemplateRequest,
  UpdateTemplateRequest,
} from './idcApiTypes'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Add auth token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('brand_radar_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Generic API response handler
async function request<T>(promise: Promise<{ data: T }>): Promise<T> {
  const { data } = await promise
  return data
}

// Filter APIs
export async function getFilterOptions(parentField?: string, parentValue?: string): Promise<FilterOptionsResponse> {
  const params = new URLSearchParams()
  if (parentField) params.append('parent_field', parentField)
  if (parentValue) params.append('parent_value', parentValue)
  return request(client.get<FilterOptionsResponse>(`/idc/filters/options?${params}`))
}

export async function applyFilters(body: FilterApplyRequest): Promise<FilterOptionsResponse> {
  return request(client.post<FilterOptionsResponse>('/idc/filters/apply', body))
}

// Overview APIs
export async function getOverviewKPI(filters?: Record<string, unknown>): Promise<KPIResponse> {
  const params = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ''
  return request(client.get<KPIResponse>(`/idc/overview/kpi${params}`))
}

export async function getOverviewTrend(
  trendType: 'dual_axis' | 'region_stacked' | 'brand_share',
  topN: number = 10,
  filters?: Record<string, unknown>
): Promise<TrendChartResponse> {
  const params = new URLSearchParams({ trend_type: trendType, top_n: String(topN) })
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<TrendChartResponse>(`/idc/overview/trend?${params}`))
}

export async function getBrandDistribution(
  type: 'top_n' | 'oem' | 'compare',
  brands?: string[],
  filters?: Record<string, unknown>
): Promise<BrandDistributionResponse> {
  const params = new URLSearchParams({ type })
  if (brands?.length) params.append('brands', brands.join(','))
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<BrandDistributionResponse>(`/idc/overview/brand?${params}`))
}

// Explore APIs
export async function queryPivot(body: PivotRequest): Promise<PivotResponse> {
  return request(client.post<PivotResponse>('/idc/explore/pivot', body))
}

export async function getTemplates(): Promise<TemplatesResponse> {
  return request(client.get<TemplatesResponse>('/idc/explore/templates'))
}

// Geography APIs
export async function getGeoHeatmap(
  metric: 'units' | 'value' | 'asp' = 'units',
  filters?: Record<string, unknown>
): Promise<GeoHeatmapResponse> {
  const params = new URLSearchParams({ metric })
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<GeoHeatmapResponse>(`/idc/geo/heatmap?${params}`))
}

export async function getCountryDetail(
  countryCode: string,
  filters?: Record<string, unknown>
): Promise<CountryDetailResponse> {
  const params = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ''
  return request(client.get<CountryDetailResponse>(`/idc/geo/country/${countryCode}${params}`))
}

export async function compareGeo(
  countries: string[],
  filters?: Record<string, unknown>
): Promise<GeoCompareResponse> {
  const params = new URLSearchParams({ countries: countries.join(',') })
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<GeoCompareResponse>(`/idc/geo/compare?${params}`))
}

// Product Compare APIs
export async function searchProducts(params: {
  keyword: string
  brand?: string
  product?: string
  format?: string
  product_category?: string
  limit?: number
}): Promise<ProductSearchResponse> {
  const queryParams = new URLSearchParams({ keyword: params.keyword })
  if (params.brand) queryParams.append('brand', params.brand)
  if (params.product) queryParams.append('product', params.product)
  if (params.format) queryParams.append('format', params.format)
  if (params.product_category) queryParams.append('product_category', params.product_category)
  if (params.limit) queryParams.append('limit', String(params.limit))
  return request(client.get<ProductSearchResponse>(`/idc/product/search?${queryParams}`))
}

export async function compareProducts(
  modelKeys: string[],
  compareType: 'spec' | 'market' | 'region' | 'channel' | 'trend' = 'spec',
  filters?: Record<string, unknown>
): Promise<ProductCompareResponse> {
  const params = new URLSearchParams({
    model_keys: modelKeys.join(','),
    compare_type: compareType,
  })
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<ProductCompareResponse>(`/idc/product/compare?${params}`))
}

// Channel APIs
export async function getChannelSankey(
  metric: 'units' | 'value' = 'units',
  filters?: Record<string, unknown>
): Promise<ChannelSankeyResponse> {
  const params = new URLSearchParams({ metric })
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<ChannelSankeyResponse>(`/idc/channel/sankey?${params}`))
}

export async function getChannelStacked(
  topNBrands: number = 10,
  filters?: Record<string, unknown>
): Promise<ChannelStackedResponse> {
  const params = new URLSearchParams({ top_n_brands: String(topNBrands) })
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<ChannelStackedResponse>(`/idc/channel/stacked?${params}`))
}

// 线上线下趋势
export async function getChannelOnlineOffline(
  filters?: Record<string, unknown>
): Promise<OnlineOfflineResponse> {
  const params = new URLSearchParams()
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<OnlineOfflineResponse>(`/idc/channel/online_offline?${params}`))
}

// Price APIs
export async function getPriceSegments(
  segmentType: 'market_capacity' | 'brand_position' | 'asp_trend' | 'brand_asp_compare',
  filters?: Record<string, unknown>
): Promise<PriceSegmentResponse> {
  const params = new URLSearchParams({ segment_type: segmentType })
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<PriceSegmentResponse>(`/idc/price/segments?${params}`))
}

// Technology APIs
export async function getInkTankAnalysis(
  analysisType: 'overall' | 'region' | 'brand' | 'drilldown',
  drilldownType?: 'country' | 'model',
  filters?: Record<string, unknown>
): Promise<InkTankAnalysisResponse> {
  const params = new URLSearchParams({ analysis_type: analysisType })
  if (drilldownType) params.append('drilldown_type', drilldownType)
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<InkTankAnalysisResponse>(`/idc/tech/ink_tank?${params}`))
}

export async function getSpeedSegmentAnalysis(
  analysisType: 'capacity' | 'brand_share' | 'scatter' | 'trend',
  filters?: Record<string, unknown>
): Promise<SpeedSegmentResponse> {
  const params = new URLSearchParams({ analysis_type: analysisType })
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<SpeedSegmentResponse>(`/idc/tech/speed_segment?${params}`))
}

export async function getMFPFunctionAnalysis(
  analysisType: 'coverage' | 'combination' | 'brand_diff' | 'region_diff',
  filters?: Record<string, unknown>
): Promise<MFPFunctionResponse> {
  const params = new URLSearchParams({ analysis_type: analysisType })
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<MFPFunctionResponse>(`/idc/tech/mfp_function?${params}`))
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
}): Promise<RankingResponse> {
  const queryParams = new URLSearchParams({
    rank_type: params.rankType,
    sort_by: params.sortBy || 'units',
    order: params.order || 'desc',
    top_n: String(params.topN || 10),
    page: String(params.page || 1),
    page_size: String(params.pageSize || 20),
  })
  if (params.filters) queryParams.append('filters', JSON.stringify(params.filters))
  return request(client.get<RankingResponse>(`/idc/rank?${queryParams}`))
}

// Export APIs
export async function exportCurrentView(body: ExportRequest): Promise<ExportResponse> {
  return request(client.post<ExportResponse>('/idc/export/current_view', body))
}

export async function exportRawData(body: ExportRequest): Promise<ExportResponse> {
  return request(client.post<ExportResponse>('/idc/export/raw_data', body))
}

export async function exportReport(body: ReportExportRequest): Promise<ExportResponse> {
  return request(client.post<ExportResponse>('/idc/export/report', body))
}

// Dual Category APIs
export async function getDualCategoryKPI(filters?: Record<string, unknown>): Promise<DualCategoryKPIResponse> {
  const params = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ''
  return request(client.get<DualCategoryKPIResponse>(`/idc/overview/kpi/dual_category${params}`))
}

export async function getDualCategoryTrend(
  trendType: 'dual_axis' | 'region_stacked' | 'brand_share',
  filters?: Record<string, unknown>
): Promise<DualCategoryTrendResponse> {
  const params = new URLSearchParams({ trend_type: trendType })
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<DualCategoryTrendResponse>(`/idc/overview/trend/dual_category?${params}`))
}

export async function getCategoryBrandDistribution(
  topN: number = 10,
  filters?: Record<string, unknown>
): Promise<CategoryBrandDistributionResponse> {
  const params = new URLSearchParams({ top_n: String(topN) })
  if (filters) params.append('filters', JSON.stringify(filters))
  return request(client.get<CategoryBrandDistributionResponse>(`/idc/overview/brand/category_distribution?${params}`))
}

// Advanced Explore APIs
export async function queryAdvancedPivot(body: AdvancedPivotRequest): Promise<AdvancedPivotResponse> {
  return request(client.post<AdvancedPivotResponse>('/idc/explore/pivot/advanced', body))
}

// Template APIs
export async function getAdvancedTemplates(): Promise<AdvancedTemplatesResponse> {
  return request(client.get<AdvancedTemplatesResponse>('/idc/templates/advanced'))
}

export async function getMyTemplates(): Promise<MyTemplatesResponse> {
  return request(client.get<MyTemplatesResponse>('/idc/templates/my'))
}

export async function saveTemplate(body: SaveTemplateRequest): Promise<MyTemplatesResponse> {
  return request(client.post<MyTemplatesResponse>('/idc/templates', body))
}

export async function updateTemplate(id: string, body: UpdateTemplateRequest): Promise<MyTemplatesResponse> {
  return request(client.put<MyTemplatesResponse>(`/idc/templates/${id}`, body))
}

export async function deleteTemplate(id: string): Promise<{ success: boolean }> {
  return request(client.delete<{ success: boolean }>(`/idc/templates/${id}`))
}

export async function cloneTemplate(id: string, newName: string): Promise<MyTemplatesResponse> {
  return request(client.post<MyTemplatesResponse>(`/idc/templates/${id}/clone`, { name: newName }))
}

// Aggregation APIs
export async function getAggregationDefinitions() {
  return request(client.get<{ success: boolean; data: unknown[] }>('/idc/aggregations/definitions'))
}

export async function getValueFieldOptions() {
  return request(client.get<{ success: boolean; data: unknown[] }>('/idc/aggregations/options'))
}

export async function getDefaultValueConfigs() {
  return request(client.get<{ success: boolean; data: unknown[] }>('/idc/aggregations/defaults'))
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
  exportReport,
}
