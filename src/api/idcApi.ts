// IDC Market Analysis API Client
import { get, post, put, del } from './client'
import type { ApiResponse } from './types'
import type {
  FilterOptionsData,
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
  OverviewData,
} from './idcApiTypes'

// ─── 全局共用配置 ──────────────────────────────────────────────
export async function getCommonConfig(): Promise<ApiResponse<FilterOptionsData>> {
  return get<FilterOptionsData>('/api/idc/common/config')
}

// ─── 市场总览 ──────────────────────────────────────────────
export interface OverviewParams {
  year?: string
  half_year?: string
  product_type?: 'all' | 'laser' | 'inkjet'
  top_n_brands?: number
  top_n_countries?: number
  trend_periods?: number
}

export async function getOverview(params?: OverviewParams): Promise<ApiResponse<OverviewData>> {
  const query = new URLSearchParams()
  if (params?.year) query.set('year', params.year)
  if (params?.half_year) query.set('half_year', params.half_year)
  if (params?.product_type) query.set('product_type', params.product_type)
  if (params?.top_n_brands) query.set('top_n_brands', String(params.top_n_brands))
  if (params?.top_n_countries) query.set('top_n_countries', String(params.top_n_countries))
  if (params?.trend_periods) query.set('trend_periods', String(params.trend_periods))
  const qs = query.toString()
  return get<OverviewData>(`/api/idc/overview${qs ? '?' + qs : ''}`)
}

// ─── 地理分析 ──────────────────────────────────────────────
export interface GeoParams {
  year?: string
  half_year?: string
  product_type?: 'all' | 'laser' | 'inkjet'
  metric?: 'units' | 'value' | 'asp'
  top_n?: number
}

export interface GeoData {
  heatmap: GeoHeatmapItem[]
  globalRegions: Array<{
    name: string
    code: string
    units: number
    value: number
    share: number
    countriesCount: number
  }>
}

export async function getGeoData(params?: GeoParams): Promise<ApiResponse<GeoData>> {
  const query = new URLSearchParams()
  if (params?.year) query.set('year', params.year)
  if (params?.half_year) query.set('half_year', params.half_year)
  if (params?.product_type) query.set('product_type', params.product_type)
  if (params?.metric) query.set('metric', params.metric)
  if (params?.top_n) query.set('top_n', String(params.top_n))
  const qs = query.toString()
  return get<GeoData>(`/api/idc/geography${qs ? '?' + qs : ''}`)
}

export async function getCountryDetail(
  countryCode: string,
  params?: { year?: string; half_year?: string; product_type?: 'all' | 'laser' | 'inkjet' }
): Promise<ApiResponse<CountryDetailData>> {
  const query = new URLSearchParams()
  if (params?.year) query.set('year', params.year)
  if (params?.half_year) query.set('half_year', params.half_year)
  if (params?.product_type) query.set('product_type', params.product_type)
  const qs = query.toString()
  return get<CountryDetailData>(`/api/idc/geography/country/${countryCode}${qs ? '?' + qs : ''}`)
}

// ─── 品牌分析 ──────────────────────────────────────────────
export interface BrandParams {
  year?: string
  half_year?: string
  product_type?: 'all' | 'laser' | 'inkjet'
  top_n?: number
  compare_brands?: string
}

export async function getBrandData(params?: BrandParams): Promise<ApiResponse<unknown>> {
  const query = new URLSearchParams()
  if (params?.year) query.set('year', params.year)
  if (params?.half_year) query.set('half_year', params.half_year)
  if (params?.product_type) query.set('product_type', params.product_type)
  if (params?.top_n) query.set('top_n', String(params.top_n))
  if (params?.compare_brands) query.set('compare_brands', params.compare_brands)
  const qs = query.toString()
  return get<unknown>(`/api/idc/brand${qs ? '?' + qs : ''}`)
}

// ─── 渠道分析 ──────────────────────────────────────────────
export interface ChannelParams {
  year?: string
  half_year?: string
  product_type?: 'all' | 'laser' | 'inkjet'
  metric?: 'units' | 'value'
}

export async function getChannelData(params?: ChannelParams): Promise<ApiResponse<unknown>> {
  const query = new URLSearchParams()
  if (params?.year) query.set('year', params.year)
  if (params?.half_year) query.set('half_year', params.half_year)
  if (params?.product_type) query.set('product_type', params.product_type)
  if (params?.metric) query.set('metric', params.metric)
  const qs = query.toString()
  return get<unknown>(`/api/idc/channel${qs ? '?' + qs : ''}`)
}

// ─── 技术分析 ──────────────────────────────────────────────
export interface TechnologyParams {
  year?: string
  half_year?: string
  product_type?: 'inkjet' | 'laser' | 'all'
  analysis_type?: 'all' | 'ink_tank' | 'speed' | 'mfp'
}

export interface TechnologyData {
  type?: string
  [key: string]: unknown
}

export async function getTechnologyData(params?: TechnologyParams): Promise<ApiResponse<TechnologyData>> {
  const query = new URLSearchParams()
  if (params?.year) query.set('year', params.year)
  if (params?.half_year) query.set('half_year', params.half_year)
  if (params?.product_type) query.set('product_type', params.product_type)
  if (params?.analysis_type) query.set('analysis_type', params.analysis_type)
  const qs = query.toString()
  return get<TechnologyData>(`/api/idc/technology${qs ? '?' + qs : ''}`)
}

// ─── 产品型号搜索 ─────────────────────────────────────────
export async function searchProducts(params: {
  keyword: string
  brand?: string
  product?: string
  format?: string
  limit?: number
}): Promise<ApiResponse<ProductSearchItem[]>> {
  const queryParams = new URLSearchParams({ keyword: params.keyword })
  if (params.brand) queryParams.append('brand', params.brand)
  if (params.product) queryParams.append('product', params.product)
  if (params.format) queryParams.append('format', params.format)
  if (params.limit) queryParams.append('limit', String(params.limit))
  return get<ProductSearchItem[]>(`/api/idc/product/search?${queryParams}`)
}

// ─── 产品对比 ──────────────────────────────────────────────
export interface ProductCompareParams {
  model_keys: string
  compare_type?: 'all' | 'spec' | 'market' | 'region' | 'channel' | 'trend'
  year?: string
  half_year?: string
}

export async function compareProducts(params: ProductCompareParams): Promise<ApiResponse<ProductCompareData>> {
  const queryParams = new URLSearchParams({ model_keys: params.model_keys })
  if (params.compare_type) queryParams.append('compare_type', params.compare_type)
  if (params.year) queryParams.append('year', params.year)
  if (params.half_year) queryParams.append('half_year', params.half_year)
  return get<ProductCompareData>(`/api/idc/product/compare?${queryParams}`)
}

// ─── 透视分析 ──────────────────────────────────────────────
export interface PivotBody {
  filters?: FilterConditions
  rowFields: string[]
  colField?: string
  valueFields: Array<{ aggregation: string; format?: string; decimalPlaces?: number }>
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export async function queryPivot(body: PivotRequest): Promise<ApiResponse<PivotData>> {
  return post<PivotData>('/api/idc/explore', body)
}

export async function getTemplates(): Promise<ApiResponse<TemplateItem[]>> {
  return get<TemplateItem[]>('/api/idc/templates')
}

// ─── 排行 ──────────────────────────────────────────────────
export interface RankingParams {
  rankType: 'brand' | 'country' | 'region' | 'model' | 'oem' | 'channel_group'
  year?: string
  half_year?: string
  product_type?: 'all' | 'laser' | 'inkjet'
  sortBy?: 'units' | 'value' | 'asp' | 'active_models'
  order?: 'asc' | 'desc'
  topN?: number
  page?: number
  pageSize?: number
}

export async function getRanking(params: RankingParams): Promise<ApiResponse<RankingData>> {
  const queryParams = new URLSearchParams({ rank_type: params.rankType })
  if (params.year) queryParams.append('year', params.year)
  if (params.half_year) queryParams.append('half_year', params.half_year)
  if (params.product_type) queryParams.append('product_type', params.product_type)
  if (params.sortBy) queryParams.append('sort_by', params.sortBy)
  if (params.order) queryParams.append('order', params.order)
  if (params.topN) queryParams.append('top_n', String(params.topN))
  if (params.page) queryParams.append('page', String(params.page))
  if (params.pageSize) queryParams.append('page_size', String(params.pageSize))
  return get<RankingData>(`/api/idc/rank?${queryParams}`)
}

// ─── 数据导出 ──────────────────────────────────────────────
export interface ExportRequest {
  filters?: FilterConditions
  export_type?: 'pivot' | 'raw'
  format?: 'excel' | 'csv'
}

export async function exportData(body: ExportRequest): Promise<ApiResponse<ExportData>> {
  return post<ExportData>('/api/idc/export', body)
}

// ─── 双品类分析 ──────────────────────────────────────────────
export async function getDualCategoryKPI(filters?: Record<string, unknown>): Promise<ApiResponse<DualCategoryKPIData>> {
  const params = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ''
  return get<DualCategoryKPIData>(`/api/idc/overview/kpi/dual_category${params}`)
}

export async function getDualCategoryTrend(
  trendType: 'dual_axis' | 'region_stacked' | 'brand_share',
  filters?: Record<string, unknown>
): Promise<ApiResponse<DualCategoryTrendData>> {
  try {
    const params = new URLSearchParams({ trend_type: trendType })
    if (filters) params.append('filters', JSON.stringify(filters))
    const res = await get<{ periods?: string[]; series?: Array<{ name: string; data: number[] }> }>(`/api/idc/overview/trend/dual_category?${params}`)
    if (res.success && res.data) {
      const d = res.data
      if (!d || typeof d !== 'object') {
        return { success: false, data: null, error: { code: 'INVALID_DATA', message: '数据格式错误' }, meta: null }
      }
      const series = d.series || []
      const laserSeries = series.find(s => /laser/i.test(s.name))
      const inkjetSeries = series.find(s => /inkjet/i.test(s.name))
      const result: DualCategoryTrendData = {
        periods: d.periods ?? [],
        laser_units: laserSeries?.data ?? [],
        inkjet_units: inkjetSeries?.data ?? [],
        laser_value: laserSeries?.data ?? [],
        inkjet_value: inkjetSeries?.data ?? [],
      }
      return { success: true, data: result, error: null, meta: null }
    }
    return { success: false, data: null, error: (res.error ?? { code: 'UNKNOWN', message: 'Failed to fetch dual category trend' }) as ApiResponse<DualCategoryTrendData>['error'], meta: null }
  } catch (e) {
    return { success: false, data: null, error: { code: 'UNKNOWN', message: String(e) }, meta: null }
  }
}

export async function getCategoryBrandDistribution(
  topN: number = 10,
  filters?: Record<string, unknown>
): Promise<ApiResponse<CategoryBrandDistribution>> {
  const params = new URLSearchParams({ top_n: String(topN) })
  if (filters) params.append('filters', JSON.stringify(filters))
  return get<CategoryBrandDistribution>(`/api/idc/brand/category_distribution?${params}`)
}

// ─── 高级透视 ──────────────────────────────────────────────
export async function queryAdvancedPivot(body: AdvancedPivotRequest): Promise<ApiResponse<AdvancedPivotData>> {
  return post<AdvancedPivotData>('/api/idc/explore', body)
}

// ─── 模板管理 ──────────────────────────────────────────────
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

// ─── 统一导出对象 ──────────────────────────────────────────
export const idcApi = {
  // 全局配置
  getCommonConfig,
  // 市场总览
  getOverview,
  // 地理分析
  getGeoData,
  getCountryDetail,
  // 品牌分析
  getBrandData,
  // 渠道分析
  getChannelData,
  // 技术分析
  getTechnologyData,
  // 产品
  searchProducts,
  compareProducts,
  // 透视分析
  queryPivot,
  queryAdvancedPivot,
  getTemplates,
  // 排行
  getRanking,
  // 数据导出
  exportData,
  // 双品类分析
  getDualCategoryKPI,
  getDualCategoryTrend,
  getCategoryBrandDistribution,
  // 模板管理
  getAdvancedTemplates,
  getMyTemplates,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  cloneTemplate,
}
