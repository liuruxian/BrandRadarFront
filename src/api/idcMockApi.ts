// IDC Mock API - 使用模拟数据的 API 函数
// 更新时间: 2026-04-10
import * as mockData from './idcMockData'
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
  PriceSegmentResponse,
  InkTankAnalysisResponse,
  SpeedSegmentResponse,
  MFPFunctionResponse,
  RankingResponse,
  ExportRequest,
  ReportExportRequest,
  ExportResponse,
  FilterConditions,
  DualCategoryKPIResponse,
  DualCategoryTrendResponse,
  CategoryBrandDistributionResponse,
  ProductType,
  AdvancedPivotRequest,
  AdvancedPivotResponse,
  AdvancedTemplateItem,
  AdvancedTemplatesResponse,
  ValidateConfigRequest,
  ValidateConfigResponse,
  ViewType,
  ViewConfig,
  ValueFieldConfig,
  SaveTemplateRequest,
  UpdateTemplateRequest,
  MyTemplatesResponse,
  MyTemplateItem,
  ExportType,
} from './idcApiTypes'

// 模拟网络延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 创建统一的成功响应
function successResponse<T>(data: T): { success: true; data: T } {
  return { success: true, data }
}

// ==================== Filter APIs ====================
export async function getFilterOptions(): Promise<FilterOptionsResponse> {
  await delay(300)
  return successResponse(mockData.mockFilterOptions)
}

export async function applyFilters(_body: FilterApplyRequest): Promise<FilterOptionsResponse> {
  await delay(300)
  return successResponse(mockData.mockFilterOptions)
}

// ==================== Overview APIs ====================
export async function getOverviewKPI(): Promise<KPIResponse> {
  await delay(400)
  return successResponse(mockData.getMockKPI())
}

export async function getOverviewTrend(
  trendType: 'dual_axis' | 'region_stacked' | 'brand_share'
): Promise<TrendChartResponse> {
  await delay(500)
  let data
  switch (trendType) {
    case 'dual_axis':
      data = mockData.getMockTrendData()
      break
    case 'region_stacked':
      data = mockData.getMockRegionStackedData()
      break
    case 'brand_share':
      data = mockData.getMockBrandShareTrend()
      break
    default:
      data = mockData.getMockTrendData()
  }
  return successResponse(data)
}

export async function getBrandDistribution(
  type: 'top_n' | 'oem' | 'compare',
  brands?: string[]
): Promise<BrandDistributionResponse> {
  await delay(400)
  let data
  switch (type) {
    case 'top_n':
      data = mockData.getMockBrandTopN()
      break
    case 'oem':
      data = mockData.getMockBrandOEM()
      break
    case 'compare':
      data = mockData.getMockBrandCompare(brands || ['HP', 'Canon', 'Epson'])
      break
    default:
      data = mockData.getMockBrandTopN()
  }
  return successResponse(data)
}

// ==================== Explore APIs ====================
export async function queryPivot(_body: PivotRequest): Promise<PivotResponse> {
  await delay(600)
  return successResponse(mockData.getMockPivotData())
}

export async function getTemplates(): Promise<TemplatesResponse> {
  await delay(300)
  return successResponse(mockData.mockTemplates)
}

// ==================== Geography APIs ====================
export async function getGeoHeatmap(
  _metric: 'units' | 'value' | 'asp' = 'units',
  _filters?: Record<string, unknown>
): Promise<GeoHeatmapResponse> {
  await delay(500)
  return successResponse(mockData.getMockGeoHeatmap())
}

export async function getCountryDetail(
  countryCode: string,
  _filters?: Record<string, unknown>
): Promise<CountryDetailResponse> {
  await delay(400)
  return successResponse(mockData.getMockCountryDetail(countryCode))
}

export async function compareGeo(
  countries: string[],
  _filters?: Record<string, unknown>
): Promise<GeoCompareResponse> {
  await delay(500)
  const items = countries.map((code) => ({
    name: code,
    type: 'country' as const,
    units: Math.floor(Math.random() * 5000000) + 1000000,
    value: Math.random() * 1000 + 200,
    asp: Math.floor(Math.random() * 100) + 200,
    active_models: Math.floor(Math.random() * 300) + 100,
    brand_structure: mockData.getMockCountryDetail(code).brand_structure,
    trend: mockData.getMockCountryDetail(code).trend,
  }))
  return successResponse({ items })
}

// ==================== Product APIs ====================
export async function searchProducts(params: {
  keyword: string
  brand?: string
  product?: string
  format?: string
  product_category?: string
  limit?: number
}): Promise<ProductSearchResponse> {
  await delay(400)
  return successResponse(mockData.getMockProductSearch(params.keyword))
}

export async function compareProducts(
  modelKeys: string[],
  _compareType?: 'spec' | 'market' | 'region' | 'channel' | 'trend',
  _filters?: Record<string, unknown>
): Promise<ProductCompareResponse> {
  await delay(600)
  return successResponse(mockData.getMockProductCompare(modelKeys))
}

// ==================== Channel APIs ====================
export async function getChannelSankey(
  _metric: 'units' | 'value' = 'units',
  _filters?: Record<string, unknown>
): Promise<ChannelSankeyResponse> {
  await delay(500)
  return successResponse(mockData.getMockChannelSankey())
}

export async function getChannelStacked(
  _topNBrands: number = 10,
  _filters?: Record<string, unknown>
): Promise<ChannelStackedResponse> {
  await delay(500)
  // 生成堆叠数据
  const brands = ['HP', 'Canon', 'Epson', 'Brother', 'Samsung', 'Xerox', 'Ricoh']
  const channelGroups = ['Dealer/VAR/SI', 'Retail', 'eTailer', 'Internet', 'Direct']
  const series = brands.map((brand, idx) => ({
    name: brand,
    data: channelGroups.map(() => Math.floor(Math.random() * 2000000) + 200000),
  }))
  return successResponse({ brands, channel_groups: channelGroups, series })
}

// ==================== Price APIs ====================
export async function getPriceSegments(
  segmentType: 'market_capacity' | 'brand_position' | 'asp_trend' | 'brand_asp_compare',
  _filters?: Record<string, unknown>
): Promise<PriceSegmentResponse> {
  await delay(400)
  return successResponse(mockData.getMockPriceSegments(segmentType))
}

// ==================== Technology APIs ====================
export async function getInkTankAnalysis(
  analysisType: 'overall' | 'region' | 'brand' | 'drilldown',
  _drilldownType?: 'country' | 'model',
  _filters?: Record<string, unknown>
): Promise<InkTankAnalysisResponse> {
  await delay(500)
  if (analysisType === 'drilldown') {
    return successResponse(mockData.getMockInkTankAnalysis('region'))
  }
  return successResponse(mockData.getMockInkTankAnalysis(analysisType))
}

export async function getSpeedSegmentAnalysis(
  analysisType: 'capacity' | 'brand_share' | 'scatter' | 'trend',
  _filters?: Record<string, unknown>
): Promise<SpeedSegmentResponse> {
  await delay(500)
  return successResponse(mockData.getMockSpeedSegmentAnalysis(analysisType))
}

export async function getMFPFunctionAnalysis(
  analysisType: 'coverage' | 'combination' | 'brand_diff' | 'region_diff',
  _filters?: Record<string, unknown>
): Promise<MFPFunctionResponse> {
  await delay(400)
  return successResponse(mockData.getMockMFPFunction(analysisType))
}

// ==================== Ranking APIs ====================
export async function getRanking(params: {
  rankType: 'brand' | 'country' | 'region' | 'model' | 'oem' | 'channel_group'
}): Promise<RankingResponse> {
  await delay(400)
  const items = []
  for (let i = 0; i < 10; i++) {
    items.push({
      rank: i + 1,
      name: `Item ${i + 1}`,
      units: Math.floor(Math.random() * 5000000) + 500000,
      value: Math.random() * 1000 + 200,
      asp: Math.floor(Math.random() * 100) + 200,
    })
  }
  return successResponse({ items, total_count: 10, page: 1, page_size: 10 })
}

// ==================== Export APIs ====================
export async function exportCurrentView(_body: ExportRequest): Promise<ExportResponse> {
  await delay(1000)
  return successResponse({
    task_id: `export_${Date.now()}`,
    status: 'completed',
    download_url: '#',
    message: '导出成功',
  })
}

export async function exportRawData(_body: ExportRequest): Promise<ExportResponse> {
  await delay(1500)
  return successResponse({
    task_id: `export_${Date.now()}`,
    status: 'completed',
    download_url: '#',
    message: '导出成功',
  })
}

export async function exportReport(_body: ReportExportRequest): Promise<ExportResponse> {
  await delay(2000)
  return successResponse({
    task_id: `report_${Date.now()}`,
    status: 'completed',
    download_url: '#',
    message: '报告生成成功',
  })
}

// ==================== 全品类分析 APIs（激光+喷墨）====================

/**
 * 获取双品类KPI数据（激光 + 喷墨 + 全品类）
 */
export async function getDualCategoryKPI(_filters?: FilterConditions): Promise<DualCategoryKPIResponse> {
  await delay(500)
  return successResponse(mockData.getMockDualCategoryKPI())
}

/**
 * 获取双品类趋势数据
 */
export async function getDualCategoryTrend(
  _trendType: 'dual_axis' | 'region_stacked' | 'brand_share',
  _filters?: FilterConditions
): Promise<DualCategoryTrendResponse> {
  await delay(500)
  return successResponse(mockData.getMockDualCategoryTrend())
}

/**
 * 获取品类品牌分布（激光/喷墨分品牌）
 */
export async function getCategoryBrandDistribution(
  _type: 'top_n' | 'compare' = 'top_n',
  _brands?: string[],
  _filters?: FilterConditions
): Promise<CategoryBrandDistributionResponse> {
  await delay(400)
  return successResponse(mockData.getMockCategoryBrandDistribution())
}

// ==================== 高级透视表 API（支持30个统计量）====================

/**
 * 高级透视表查询（支持30个统计量）
 * 根据请求配置动态生成模拟数据
 */
export async function queryAdvancedPivot(body: AdvancedPivotRequest): Promise<AdvancedPivotResponse> {
  await delay(800)

  // 获取配置参数
  const { row_fields = [], col_field, value_fields = [] } = body

  // 模拟数据源
  const brandData = [
    { brand: 'HP', units: 13800000, value: 3850, asp: 279 },
    { brand: 'Canon', units: 9200000, value: 2680, asp: 291 },
    { brand: 'Epson', units: 7800000, value: 2100, asp: 269 },
    { brand: 'Brother', units: 5600000, value: 1450, asp: 259 },
    { brand: 'Samsung', units: 3200000, value: 890, asp: 278 },
    { brand: 'Xerox', units: 1800000, value: 620, asp: 344 },
  ]

  const regionData = [
    { region: 'Americas', units: 15000000, value: 4500, asp: 300 },
    { region: 'EMEA', units: 13500000, value: 3800, asp: 281 },
    { region: 'APJ', units: 12000000, value: 3200, asp: 267 },
  ]

  const periodData = [
    { period: '2025H1', units: 14500000, value: 4200 },
    { period: '2024H2', units: 14200000, value: 4100 },
    { period: '2024H1', units: 13800000, value: 3950 },
  ]

  const productData = [
    { product: 'Laser', units: 24500000, value: 7200, asp: 294 },
    { product: 'Inkjet', units: 16000000, value: 4300, asp: 269 },
  ]

  const channelData = [
    { channel: 'Dealer/VAR/SI', units: 18500000, value: 5300 },
    { channel: 'Retail', units: 9500000, value: 2800 },
    { channel: 'eTailer', units: 8500000, value: 2400 },
    { channel: 'Direct', units: 4000000, value: 1000 },
  ]

  const formatData = [
    { format: 'A4', units: 32000000, value: 8800 },
    { format: 'A3', units: 8500000, value: 2700 },
  ]

  const speedData = [
    { speed: '<20 ppm', units: 12000000, value: 2500 },
    { speed: '20-40 ppm', units: 18500000, value: 5200 },
    { speed: '40-60 ppm', units: 9800000, value: 3200 },
    { speed: '>60 ppm', units: 4200000, value: 1650 },
  ]

  // 根据字段组合生成数据
  const rows: Record<string, unknown>[] = []

  // 基础维度映射
  const dimensionMap: Record<string, unknown[]> = {
    'Brand': brandData,
    'Global Region': regionData,
    'Region': regionData,
    'Half Year': periodData,
    'Year': periodData,
    'Product': productData,
    'Channel': channelData,
    'Format': formatData,
    'Speed Range A4': speedData,
  }

  // 获取主维度数据
  const primaryDimension = row_fields[0] || 'Brand'
  const primaryData = dimensionMap[primaryDimension] || brandData

  // 生成行数据
  primaryData.forEach((item: any) => {
    const row: Record<string, unknown> = {}

    // 添加行维度
    if (primaryDimension === 'Brand') {
      row['Brand'] = (item as any).brand
    } else if (primaryDimension === 'Global Region' || primaryDimension === 'Region') {
      row[primaryDimension] = (item as any).region
    } else if (primaryDimension === 'Half Year' || primaryDimension === 'Year') {
      row[primaryDimension] = (item as any).period
    } else if (primaryDimension === 'Product') {
      row[primaryDimension] = (item as any).product
    } else if (primaryDimension === 'Channel') {
      row[primaryDimension] = (item as any).channel
    } else if (primaryDimension === 'Format') {
      row[primaryDimension] = (item as any).format
    } else if (primaryDimension === 'Speed Range A4') {
      row[primaryDimension] = (item as any).speed
    }

    // 添加列维度（如果有）
    if (col_field) {
      if (col_field === 'Brand') {
        brandData.forEach((col: any) => {
          const colRow = { ...row, [col_field]: col.brand } as Record<string, unknown>
          // 添加值字段
          value_fields.forEach(vf => {
            const valueKey = `${vf.label}`
            colRow[valueKey] = Math.floor(item.units * (col.units / 45000000) * (Math.random() * 0.3 + 0.7))
          })
          rows.push(colRow)
        })
      } else if (col_field === 'Half Year') {
        periodData.forEach((col: any) => {
          const colRow = { ...row, [col_field]: col.period } as Record<string, unknown>
          value_fields.forEach(vf => {
            const valueKey = `${vf.label}`
            colRow[valueKey] = Math.floor(item.units * 0.35 * (Math.random() * 0.2 + 0.8))
          })
          rows.push(colRow)
        })
      } else if (col_field === 'Product') {
        productData.forEach((col: any) => {
          const colRow = { ...row, [col_field]: col.product } as Record<string, unknown>
          value_fields.forEach(vf => {
            const valueKey = `${vf.label}`
            const share = col.product === 'Laser' ? 0.6 : 0.4
            colRow[valueKey] = Math.floor(item.units * share * (Math.random() * 0.3 + 0.7))
          })
          rows.push(colRow)
        })
      }
    } else {
      // 没有列维度，直接添加值字段
      value_fields.forEach(vf => {
        const valueKey = `${vf.label}`
        let value: number

        switch (vf.aggregation) {
          case 'sum_units':
            value = (item as any).units
            break
          case 'sum_value':
            value = (item as any).value
            break
          case 'asp':
            value = (item as any).asp
            break
          case 'market_share':
            value = ((item as any).units / 45000000) * 100
            break
          case 'value_share':
            value = ((item as any).value / 11500) * 100
            break
          default:
            value = (item as any).units * (Math.random() * 0.5 + 0.5)
        }

        // 添加随机波动
        value = Number((value * (Math.random() * 0.2 + 0.9)).toFixed(2))
        row[valueKey] = value
      })
      rows.push(row)
    }
  })

  // 生成表头
  const headers = [
    row_fields,
    col_field ? [col_field] : [],
    value_fields.map(vf => vf.label),
  ].filter(arr => arr.length > 0)

  return successResponse({
    headers: headers as string[][],
    rows,
    totals: {},
    grand_totals: {
      'Total Units': rows.reduce((sum, r) => sum + (r[value_fields[0]?.label || '销量'] as number || 0), 0),
      'Total Value': rows.reduce((sum, r) => sum + (r[value_fields.find(v => v.aggregation === 'sum_value')?.label || ''] as number || 0), 0),
    },
    total_count: rows.length,
    page: body.page || 1,
    page_size: body.page_size || 50,
    aggregation_used: value_fields.map(vf => vf.aggregation),
    computation_time_ms: Math.floor(Math.random() * 200) + 100,
  })
}

// ==================== 统计量 API ====================

/**
 * 获取统计量定义列表
 */
export async function getAggregationDefinitions() {
  await delay(200)
  return successResponse(mockData.aggregationDefinitions)
}

/**
 * 获取统计量选项（用于UI下拉）
 */
export async function getValueFieldOptions() {
  await delay(200)
  return successResponse(mockData.getValueFieldOptions())
}

/**
 * 获取默认统计量配置
 */
export async function getDefaultValueConfigs() {
  await delay(100)
  return successResponse(mockData.getDefaultValueConfigs())
}

// ==================== 配置验证 API ====================

/**
 * 验证透视表配置
 */
export async function validatePivotConfig(_body: ValidateConfigRequest): Promise<ValidateConfigResponse> {
  await delay(300)

  const conflicts: any[] = []
  const warnings: string[] = []
  const recommendations: any[] = []

  // 简单验证规则
  if (_body.row_fields.length > 4) {
    conflicts.push({
      type: 'too_many_dimensions',
      severity: 'warning',
      message: '维度过多可能导致数据稀疏',
      messageEn: 'Too many dimensions may result in sparse data',
      suggestion: '建议减少维度数量到4个以内',
      dataImpact: '预计数据行数 > 10000',
    })
  }

  return {
    valid: conflicts.filter((c) => c.severity === 'error').length === 0,
    conflicts,
    warnings,
    recommendations,
  }
}

// ==================== 高级模板 API ====================

/**
 * 获取高级模板列表（26个）
 */
export async function getAdvancedTemplates(): Promise<AdvancedTemplatesResponse> {
  await delay(300)
  return successResponse(mockData.mockAdvancedTemplates)
}

// 本地存储键名
const MY_TEMPLATES_KEY = 'idc_my_templates'

/**
 * 获取我的模板列表
 */
export async function getMyTemplates(): Promise<MyTemplatesResponse> {
  await delay(200)
  const stored = localStorage.getItem(MY_TEMPLATES_KEY)
  const templates: MyTemplateItem[] = stored ? JSON.parse(stored) : []
  return successResponse(templates)
}

/**
 * 保存模板
 */
export async function saveTemplate(body: SaveTemplateRequest): Promise<MyTemplatesResponse> {
  await delay(300)

  const stored = localStorage.getItem(MY_TEMPLATES_KEY)
  const templates: MyTemplateItem[] = stored ? JSON.parse(stored) : []

  const newTemplate: MyTemplateItem = {
    id: `custom_${Date.now()}`,
    name: body.name,
    description: body.description || '',
    categoryLabel: body.category,
    category: body.category,
    row_fields: body.row_fields,
    col_field: body.col_field,
    value_configs: body.value_configs,
    user_id: 'current_user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    share_status: body.share_status || 'private',
    version: 1,
  }

  templates.push(newTemplate)
  localStorage.setItem(MY_TEMPLATES_KEY, JSON.stringify(templates))

  return successResponse(templates)
}

/**
 * 更新模板
 */
export async function updateTemplate(body: UpdateTemplateRequest): Promise<MyTemplatesResponse> {
  await delay(300)

  const stored = localStorage.getItem(MY_TEMPLATES_KEY)
  const templates: MyTemplateItem[] = stored ? JSON.parse(stored) : []

  const index = templates.findIndex((t) => t.id === body.id)
  if (index >= 0) {
    templates[index] = {
      ...templates[index],
      ...body,
      categoryLabel: body.category,
      updated_at: new Date().toISOString(),
      version: (templates[index].version || 1) + 1,
    }
    localStorage.setItem(MY_TEMPLATES_KEY, JSON.stringify(templates))
    return successResponse(templates)
  }

  return { success: false, error: { message: '模板不存在' } }
}

/**
 * 删除模板
 */
export async function deleteTemplate(id: string): Promise<{ success: boolean }> {
  await delay(200)

  const stored = localStorage.getItem(MY_TEMPLATES_KEY)
  const templates: MyTemplateItem[] = stored ? JSON.parse(stored) : []

  const filtered = templates.filter((t) => t.id !== id)
  localStorage.setItem(MY_TEMPLATES_KEY, JSON.stringify(filtered))

  return { success: true }
}

/**
 * 复制模板（用于创建变体）
 */
export async function cloneTemplate(id: string, newName: string): Promise<MyTemplatesResponse> {
  await delay(200)

  const stored = localStorage.getItem(MY_TEMPLATES_KEY)
  const templates: MyTemplateItem[] = stored ? JSON.parse(stored) : []

  const original = templates.find((t) => t.id === id)
  if (original) {
    const clone: MyTemplateItem = {
      ...original,
      id: `custom_${Date.now()}`,
      name: newName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    }
    templates.push(clone)
    localStorage.setItem(MY_TEMPLATES_KEY, JSON.stringify(templates))
    return successResponse(templates)
  }

  return { success: false, error: { message: '原模板不存在' } }
}

// ==================== 导出 API ====================

/**
 * 通用导出接口
 */
export async function exportData(
  exportType: ExportType,
  data: unknown,
  options?: { filename?: string; format?: 'csv' | 'excel' }
): Promise<{ success: boolean; downloadUrl?: string; message?: string }> {
  await delay(1000)

  // 实际导出逻辑将在前端组件中实现
  // 这里只返回成功状态
  const filename = options?.filename || `IDC_Export_${Date.now()}`

  return {
    success: true,
    downloadUrl: `#export_${filename}`,
    message: '导出成功',
  }
}

/**
 * 导出为CSV
 */
export function exportToCSV(data: unknown[], filename: string, headers?: string[]) {
  const rows = data as Record<string, unknown>[]

  // 生成CSV内容
  const headerRow = headers || (rows.length > 0 ? Object.keys(rows[0]) : [])
  const csvContent = [
    headerRow.join(','),
    ...rows.map((row) => headerRow.map((h) => `"${row[h] ?? ''}"`).join(',')),
  ].join('\n')

  // 下载文件
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 导出为Excel (使用简单方式)
 */
export function exportToExcel(data: unknown[], filename: string, sheetName: string = 'Data') {
  const rows = data as Record<string, unknown>[]

  if (rows.length === 0) {
    console.warn('No data to export')
    return
  }

  // 简单Excel XML格式
  const headers = Object.keys(rows[0])

  // 构建HTML表格用于Excel打开
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${sheetName}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th style="background:#4472C4;color:white;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                ${headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  // 下载文件
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.xls`
  link.click()
  URL.revokeObjectURL(url)
}

// 导出模拟 API 对象
export const idcMockApi = {
  // Filters
  getFilterOptions,
  applyFilters,
  // Overview
  getOverviewKPI,
  getOverviewTrend,
  getBrandDistribution,
  // Explore
  queryPivot,
  queryAdvancedPivot,
  getTemplates,
  getAdvancedTemplates,
  validatePivotConfig,
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
  exportData,
  exportToCSV,
  exportToExcel,
  // ====== 全品类分析 APIs ======
  getDualCategoryKPI,
  getDualCategoryTrend,
  getCategoryBrandDistribution,
  // ====== 统计量 APIs ======
  getAggregationDefinitions,
  getValueFieldOptions,
  getDefaultValueConfigs,
  // ====== 模板管理 APIs ======
  getMyTemplates,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  cloneTemplate,
}