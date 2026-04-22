// IDC Market Analysis API Types
// 基于 idc_printer_market 单表真实字段，100% 对齐需求规格
// 更新时间: 2026-04-10

// ==================== 通用类型 ====================

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code?: string
    message?: string
  }
}

// ==================== 统计量枚举（30个统计量）====================
// 基础聚合函数: 5个
// 核心衍生统计: 12个
// 高级分析统计: 8个
// 辅助统计: 5个

export enum AggregationType {
  // ====== 基础聚合函数 (5个) ======
  SUM_UNITS = 'sum_units',           // 销量求和
  SUM_VALUE = 'sum_value',           // 销售额求和
  COUNT_ROWS = 'count_rows',         // 记录行数
  AVG_UNITS = 'avg_units',           // 销量平均值
  AVG_VALUE = 'avg_value',           // 销售额平均值
  MAX_UNITS = 'max_units',           // 销量最大值
  MAX_VALUE = 'max_value',           // 销售额最大值
  MIN_UNITS = 'min_units',           // 销量最小值
  MIN_VALUE = 'min_value',           // 销售额最小值
  COUNT_MODELS = 'count_models',     // 型号数量（已有）

  // ====== 核心衍生统计 (12个) ======
  ASP = 'asp',                       // 平均单价（已有）
  MARKET_SHARE = 'market_share',     // 市场份额占比
  VALUE_SHARE = 'value_share',       // 销售额占比
  CATEGORY_UNITS_PCT = 'category_units_pct',  // 品类销量占比
  INKTANK_PENETRATION = 'inktank_penetration',  // 墨仓式渗透率
  FUNCTION_PENETRATION = 'function_penetration', // 功能普及率
  A3_FORMAT_PCT = 'a3_format_pct',   // A3幅面占比
  MFP_PCT = 'mfp_pct',               // MFP占比
  YoY_GROWTH = 'yoy_growth',         // 同比增长率
  HoH_GROWTH = 'hoh_growth',         // 环比增长率
  CUMULATIVE_UNITS = 'cumulative_units',  // 累计销量

  // ====== 高级分析统计 (6个) ======
  CR5_CONCENTRATION = 'cr5_concentration',  // 品牌集中度 (CR5)
  AVG_UNITS_PER_MODEL = 'avg_units_per_model',  // 单型号平均销量
  CHANNEL_EFFICIENCY = 'channel_efficiency',  // 渠道效率
  SPEED_SEGMENT_COUNT = 'speed_segment_count',  // 速度段分布计数
  PRICE_SEGMENT_UNITS = 'price_segment_units',  // 价格段分布销量
  DEVIATION_FROM_AVG = 'deviation_from_avg',  // 与均值偏差
}

// 统计量分组
export enum AggregationGroup {
  BASIC_AGG = 'basic_agg',           // 基础聚合
  CORE_DERIVED = 'core_derived',     // 核心衍生
  ADVANCED_ANALYSIS = 'advanced_analysis',  // 高级分析
  HELPER = 'helper',                // 辅助统计
}

// 统计量定义
export interface AggregationDefinition {
  id: AggregationType
  name: string                      // 中文名称
  nameEn: string                    // 英文名称
  group: AggregationGroup
  description: string               // 说明
  unit?: string                     // 单位
  format?: 'number' | 'percent' | 'currency' | 'ratio'  // 格式化类型
  decimalPlaces?: number            // 小数位数
  sourceFields: string[]            // 依赖的源字段
  calculateMethod: string           // 计算方法描述
}

// 统计量配置
export interface ValueFieldConfig {
  aggregation: AggregationType       // 聚合类型
  sourceField: string               // 源字段 (units/value/asp/active_models)
  label: string                     // 显示标签
  format: 'number' | 'percent' | 'currency' | 'ratio'
  decimalPlaces: number
}

// 统计量选项（用于UI选择）
export interface ValueFieldOption {
  value: AggregationType
  label: string
  group: AggregationGroup
  groupLabel: string
  description: string
  format: 'number' | 'percent' | 'currency' | 'ratio'
}

// 透视表值字段选项 —— 与 idc_printer_market 度量字段对应（向后兼容）
export type PivotValueField = 'units' | 'value' | 'asp' | 'active_models'

// ==================== 筛选体系（维度字段）====================
// 与 idc_printer_market 真实字段一一对应

export interface FilterOption {
  value: string
  label: string
}

/** 筛选选项数据 —— 所有可选值列表，与 API 文档 camelCase 对齐 */
export interface FilterOptionsData {
  // 时间维度
  years?: string[]
  halfYears?: string[]
  // 地理维度
  globalRegions?: FilterOption[]
  regions?: FilterOption[]
  countries?: FilterOption[]
  // 厂商维度
  companies?: FilterOption[]
  vendors?: FilterOption[]
  brands?: FilterOption[]
  oems?: FilterOption[]
  // 产品维度
  productCategories?: FilterOption[]
  products?: FilterOption[]
  colorTypes?: FilterOption[]
  formats?: FilterOption[]
  speedRangesA4?: string[]
  speedRangesLetter?: string[]
  // 功能维度
  adfOptions?: FilterOption[]
  duplexOptions?: FilterOption[]
  networkOptions?: FilterOption[]
  wirelessOptions?: FilterOption[]
  // 耗材维度
  inkTypes?: FilterOption[]
  // 渠道维度
  channels?: FilterOption[]
  channelGroups?: FilterOption[]
  // 业务维度
  productionClassifications?: FilterOption[]
  businessInkjetDetail?: FilterOption[]
  // 激光专属选项
  laserProductDetails?: FilterOption[]
  // 喷墨专属选项
  inkjetProductDetails?: FilterOption[]
  // 维度定义
  dimensions?: unknown[]
  // 统计量定义
  aggregations?: unknown[]
  // 品类选项
  productTypes?: FilterOption[]
  // 视图类型
  viewTypes?: string[]
  // 预设模板
  templates?: unknown[]
}

/** 筛选条件 —— 用户当前选中的值，与 API 文档 camelCase 对齐 */
export interface FilterConditions {
  years?: string[]
  halfYears?: string[]
  globalRegions?: string[]
  regions?: string[]
  countries?: string[]
  companies?: string[]
  vendors?: string[]
  brands?: string[]
  oems?: string[]
  productCategories?: string[]
  products?: string[]
  colorTypes?: string[]
  formats?: string[]
  speedRangesA4?: string[]
  speedRangesLetter?: string[]
  adfOptions?: string[]
  duplexOptions?: string[]
  networkOptions?: string[]
  wirelessOptions?: string[]
  inkTypes?: string[]
  channels?: string[]
  channelGroups?: string[]
  productionClassifications?: string[]
  businessInkjetDetail?: string[]
  productType?: ProductType
  laserProductDetails?: string[]
  inkjetProductDetails?: string[]
}

export interface FilterApplyRequest {
  filters?: FilterConditions
}

export type FilterOptionsResponse = APIResponse<FilterOptionsData>

// ==================== KPI 与概览（度量字段）====================

export interface KPIData {
  total_units: number
  total_value: number
  asp: number
  active_models: number
  countries_covered: number
  // 后端实际返回字段名
  units_yoy?: number
  value_yoy?: number
  units_mom?: number
  value_mom?: number
  current_period?: string
  previous_period?: string
  yoy_period?: string
}

export type KPIResponse = APIResponse<KPIData>

/** 趋势图数据 - 后端实际返回结构: series 数组 */
export interface TrendChartData {
  type?: string
  metric?: string
  periods: string[]
  series: Array<{
    name: string
    data: number[]
  }>
  // 兼容扁平格式（前端期望）
  units?: number[]
  values?: number[]
}

export type TrendChartResponse = APIResponse<TrendChartData>

// ==================== 品牌分布 ====================

export interface BrandTopN {
  brand: string              // 品牌名称（后端用brand，不是name）
  units: number             // 销量
  value: number            // 销售额
  asp: number             // 平均单价
  units_share: number     // 销量份额（%）
  value_share: number     // 销售额份额（%）
}

export interface BrandOEM {
  brand: string              // OEM 制造商名称
  units: number             // 销量
  value: number            // 销售额
  units_share: number     // 销量份额（%）
  value_share: number     // 销售额份额（%）
}

// 品牌对比项 - 与 API 文档对齐
export interface BrandCompare {
  brand: string
  units: number
  value: number
  share: number
  asp: number
  activeModels?: number
  yoy?: number
  regions?: string[]
}

export interface BrandDistributionData {
  type?: string
  brands: BrandTopN[]
  total_units?: number
}

export type BrandDistributionResponse = APIResponse<BrandDistributionData>

// ==================== 透视表请求/响应（支持30个统计量）====================

/**
 * 视图类型枚举:
 * - table: 透视表格视图
 * - bar: 柱状图视图
 * - line: 折线图视图
 * - pie: 饼图/环形图视图
 * - heatmap: 热力图视图
 */
export enum ViewType {
  TABLE = 'table',
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  HEATMAP = 'heatmap',
}

/** 透视表可用行/列维度选项 —— 与维度字段对应 */
export type PivotDimension =
  | 'Year'
  | 'Half Year'
  | 'Global Region'
  | 'Region'
  | 'Country'
  | 'Company'
  | 'Vendor'
  | 'Brand'
  | 'OEM'
  | 'Product Category'
  | 'Product'
  | 'Format'
  | 'Speed Range A4'
  | 'Speed Range Letter'
  | 'ADF'
  | 'Duplex'
  | 'Wireless'
  | 'Ink Tank/ Ink Cartridge'
  | 'Channel'
  | 'Channel Group'
  | 'Production Classification'
  | 'Business Inkjet Detail'

export interface AdvancedPivotRequest {
  filters?: FilterConditions
  rowFields: PivotDimension[]
  colField?: PivotDimension
  valueFields: ValueFieldConfig[]
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
  includeTotals?: boolean
  includeSubtotals?: boolean
  drilldownEnabled?: boolean
}

export interface PivotRequest {
  filters?: FilterConditions
  rowFields: PivotDimension[]
  colField?: PivotDimension
  valueField: PivotValueField
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface PivotData {
  headers: string[][]
  rows: Record<string, unknown>[]
  totals: Record<string, unknown>
  grand_totals?: Record<string, unknown>
  total_count: number
  page: number
  page_size: number
  computation_time_ms?: number
}

// 高级透视表响应
export interface AdvancedPivotData {
  headers: string[][]
  rows: Record<string, unknown>[]
  totals: Record<string, unknown>
  grand_totals: Record<string, unknown>
  total_count: number
  page: number
  page_size: number
  // 附加信息
  aggregation_used: AggregationType[]
  computation_time_ms: number
}

export interface AdvancedPivotResponse extends APIResponse<AdvancedPivotData> {
  warnings?: string[]  // 计算警告（如某些统计量无法计算）
}

export type PivotResponse = APIResponse<PivotData>

export interface TemplateItem {
  id: string
  name: string
  description: string
  row_fields: PivotDimension[]
  col_field?: PivotDimension
  value_field: PivotValueField
}

// ====== 高级模板管理类型 ======

/** 模板分类 */
export enum TemplateCategory {
  MARKET_OVERVIEW = 'market_overview',   // 市场概览类
  GEO_ANALYSIS = 'geo_analysis',         // 地理分析类
  TECH_ANALYSIS = 'tech_analysis',       // 技术分析类
  BUSINESS_ANALYSIS = 'business_analysis', // 商业分析类
  DEEP_INSIGHT = 'deep_insight',         // 深度洞察类
}

/** 高级模板项（支持30个统计量） */
export interface AdvancedTemplateItem {
  id: string
  name: string
  description: string
  category: TemplateCategory
  categoryLabel: string
  // 配置
  row_fields: PivotDimension[]
  col_field?: PivotDimension
  value_configs: ValueFieldConfig[]
  // 筛选条件
  suggested_filters?: Partial<FilterConditions>
  // 视图推荐
  recommended_views?: ViewType[]
  // 适用场景
  applicable_scenarios?: string[]
  // 权限
  is_system?: boolean  // 系统内置模板
  is_public?: boolean  // 公开模板
}

/** 我的模板（用户自定义） */
export interface MyTemplateItem extends AdvancedTemplateItem {
  id: string
  name: string
  description: string
  category: TemplateCategory
  // 用户信息
  user_id?: string
  created_at: string
  updated_at: string
  // 分享
  share_status: 'private' | 'team' | 'public'
  share_link?: string
  // 版本
  version: number
  version_history?: TemplateVersion[]
}

/** 模板版本历史 */
export interface TemplateVersion {
  version: number
  content: Partial<AdvancedTemplateItem>
  created_at: string
  created_by?: string
  change_description?: string
}

/** 模板保存请求 */
export interface SaveTemplateRequest {
  name: string
  description?: string
  category: TemplateCategory
  row_fields: PivotDimension[]
  col_field?: PivotDimension
  value_configs: ValueFieldConfig[]
  filters?: Partial<FilterConditions>
  share_status?: 'private' | 'team' | 'public'
}

/** 模板更新请求 */
export interface UpdateTemplateRequest extends SaveTemplateRequest {
  id: string
  version?: number  // 用于乐观锁
}

/** 模板列表查询参数 */
export interface TemplateListQuery {
  category?: TemplateCategory
  keyword?: string
  page?: number
  page_size?: number
  sort_by?: 'name' | 'created_at' | 'updated_at'
  sort_order?: 'asc' | 'desc'
}

/** 模板列表响应 */
export interface TemplateListData {
  templates: (AdvancedTemplateItem | MyTemplateItem)[]
  total_count: number
  page: number
  page_size: number
}

export type TemplatesResponse = APIResponse<TemplateItem[]>
export type AdvancedTemplatesResponse = APIResponse<AdvancedTemplateItem[]>
export type MyTemplatesResponse = APIResponse<MyTemplateItem[]>
export type TemplateListResponse = APIResponse<TemplateListData>

// ==================== 地理分析 ====================

export interface GlobalRegionItem {
  name: string
  code: string
  units: number
  value: number
  share: number
  countriesCount: number
}

export interface GeoHeatmapItem {
  rank: number
  code: string
  name: string
  units: number
  value: number
  asp: number
  share: number
}

export interface GeoDataResponse {
  heatmap: GeoHeatmapItem[]
  globalRegions: GlobalRegionItem[]
}

export type GeoHeatmapResponse = ApiResponse<GeoDataResponse>
export type GeoHeatmapListResponse = ApiResponse<GeoHeatmapItem[]>

// ==================== 国家详情 ====================

export interface CountryKPI {
  units: number
  value: number
  asp: number
  active_models: number
}

export interface TopModel {
  brand: string
  model_name: string    // Model Name 字段
  units: number
  value: number
}

export interface CountryTrend {
  periods: string[]
  units: number[]
  value: number[]
}

export interface BrandStructure {
  brand: string
  units: number
  share: number
}

export interface CountryDetailData {
  country_code: string
  country_name: string
  kpi: CountryKPI
  top_models: TopModel[]       // Top 10 Model Name by units
  trend: CountryTrend
  brand_structure: BrandStructure[]
}

export type CountryDetailResponse = APIResponse<CountryDetailData>

export interface GeoCompareItem {
  name: string
  type: 'country' | 'region' | 'global_region'
  units: number
  value: number
  asp: number
  active_models: number
  brand_structure: BrandStructure[]
  trend: CountryTrend
}

export interface GeoCompareData {
  items: GeoCompareItem[]
}

export type GeoCompareResponse = APIResponse<GeoCompareData>

// ==================== 型号对标 ====================

export interface ProductSearchItem {
  model_key: string
  model_name: string      // Model Name 字段
  brand: string           // Brand 字段
  product: string          // Product 字段 (Laser/Inkjet)
  format: string           // Format 字段 (A4/A3/Letter)
  color_type: string       // Color/Mono
  units: number           // 销量
  asp: number            // 平均单价
}

export type ProductSearchResponse = APIResponse<ProductSearchItem[]>

/**
 * 参数对比矩阵 —— 直接读取 idc_printer_market 各型号真实字段值
 * 参数来源：型号最新一期记录（Year + Half Year 最新的那条）
 */
export interface SpecMatrix {
  /** 基础信息 */
  basic_info: [string, ...string[]][]
  /** 速度指标: A4 Color Speed/A4 Mono Speed/ISO Color Speed/ISO Mono Speed */
  speed_specs: [string, ...string[]][]
  /** 功能配置: Function/ADF/Duplex/Wireless/Network */
  function_specs: [string, ...string[]][]
  /** 耗材参数: Ink Tank/ Ink Cartridge/Black Toner Max Pages/Color Toner Max Pages */
  consumable_specs: [string, ...string[]][]
  /** 物理规格: Duty Cycle/Weight/Tray Size/Flatbed/Sheetfed */
  physical_specs: [string, ...string[]][]
  /** 生产级别: Production Classification/Business Inkjet Detail */
  production_specs: [string, ...string[]][]
}

export interface MarketCompare {
  /** 各型号销量 */
  units: number[]
  /** 各型号销售额 */
  value: number[]
  /** 各型号 ASP */
  asp: number[]
}

export interface TimeTrend {
  periods: string[]
  series: { name: string; data: number[] }[]
}

export interface ProductCompareData {
  spec_matrix?: SpecMatrix
  market_compare?: MarketCompare
  region_distribution?: [string, ...number[]][]
  channel_distribution?: [string, ...number[]][]
  time_trend?: TimeTrend
}

export type ProductCompareResponse = APIResponse<ProductCompareData>

// ==================== 渠道分析 ====================

export interface SankeyNode {
  id: string
  name: string
  type: 'channel' | 'channel_group' | 'brand' | 'oem'
  value: number            // Units 或 Value
}

export interface SankeyLink {
  source: string
  target: string
  value: number    // Units 或 Value
}

export interface ChannelSankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

export type ChannelSankeyResponse = APIResponse<ChannelSankeyData>

export interface ChannelStackedData {
  brands: string[]
  channel_groups: string[]
  series: Array<{ name: string; data: number[] }>
}

export type ChannelStackedResponse = APIResponse<ChannelStackedData>

// 线上线下趋势数据
export interface OnlineOfflineData {
  periods: string[]
  online: number[]
  offline: number[]
  online_share: number[]
  offline_share: number[]
}

export type OnlineOfflineResponse = APIResponse<OnlineOfflineData>

// ==================== 价格段分析 ====================

/** 市场价格段: 先按 Model Name 计算 ASP，再按 <$200/$200-1000/>$1000 分组 */
export interface PriceSegment {
  name: string
  range: string
  units: number
  value: number
  share: number
}

/** 各品牌在特定价格段的份额 */
export interface BrandPositionData {
  type: 'brand_position'
  brands: string[]
  series: { name: string; data: number[] }[]
}

/** ASP 随时间变化 */
export interface ASPTrendData {
  type: 'asp_trend'
  periods: string[]
  series: { name: string; data: number[] }[]
}

/** 各品牌 ASP 对比 */
export interface BrandASPCompareData {
  type: 'brand_asp_compare'
  brands: string[]
  asp: number[]
}

export type PriceSegmentData =
  | { type: 'market_capacity'; segments: PriceSegment[] }
  | BrandPositionData
  | ASPTrendData
  | BrandASPCompareData

export type PriceSegmentResponse = APIResponse<PriceSegmentData>

// ==================== 技术与细分市场 ====================

/** 墨仓整体渗透率: Product='Inkjet', 按 Ink Tank/ Ink Cartridge 分组 */
export interface InkTankOverall {
  type: 'overall'
  ink_tank_units: number
  ink_tank_share: number
  cartridge_units: number
  cartridge_share: number
  ink_tank_value?: number
  ink_tank_share_value?: number
  cartridge_value?: number
}

export interface RegionInkTank {
  region: string
  ink_tank_units: number
  ink_tank_share: number
  total_units: number
}

export interface BrandInkTank {
  brand: string
  ink_tank_units: number
  ink_tank_share: number
  total_units: number
}

export type InkTankAnalysisData =
  | InkTankOverall
  | { type: 'region'; regions: RegionInkTank[] }
  | { type: 'brand'; brands: BrandInkTank[] }

export type InkTankAnalysisResponse = APIResponse<InkTankAnalysisData>

/** 速度段市场容量: 按 Speed Range A4 分组 */
export interface SpeedCapacity {
  range: string      // 速度段范围 (如 "1-20 ppm")
  units: number     // 销量
  share: number     // 市场份额 (%)
  avg_price: number // 平均价格
}

export interface SpeedBrandShare {
  range: string
  units: number
  share: number
  [brand: string]: number | string
}

/** 速度-价格散点: X=速度(Y), Y=ASP, 气泡大小=Units */
export interface ScatterPoint {
  model_name: string
  brand: string
  speed: number
  asp: number
  units: number
}

export type SpeedSegmentData =
  | { type: 'capacity'; segments: SpeedCapacity[] }
  | { type: 'brand_share'; segments: SpeedCapacity[] }
  | { type: 'scatter'; points: ScatterPoint[] }
  | { type: 'trend'; periods: string[]; series: { name: string; data: number[] }[] }

export type SpeedSegmentResponse = APIResponse<SpeedSegmentData>

/** MFP 功能普及率: Product Category='MFP', 解析 Function 字段 */
export interface FunctionCoverage {
  type: 'coverage'
  functions: Array<{
    function: string  // Print/Copy/Scan/Fax/ADF
    coverage: number   // 覆盖率 (%)
    units: number      // 销量
  }>
}

export interface FunctionCombination {
  functions: string[]  // 如 ["Print", "Copy", "Scan"]
  count: number
  share: number
}

export interface BrandFunctionDiff {
  brand: string
  units: number
  share: number
}

export interface RegionFunctionDiff {
  region: string
  units: number
  share: number
}

export type MFPFunctionData =
  | FunctionCoverage
  | { type: 'combination'; combinations: FunctionCombination[] }
  | { type: 'brand_diff'; brands: BrandFunctionDiff[] }
  | { type: 'region_diff'; regions: RegionFunctionDiff[] }

export type MFPFunctionResponse = APIResponse<MFPFunctionData>

// ==================== 排行 ====================

export interface RankingItem {
  rank: number
  name: string
  units: number
  value: number
  share: number         // 市场份额 (%)
  asp: number          // 平均单价
}

export interface RankingData {
  type: 'brand' | 'country' | 'region' | 'model' | 'oem'  // 排行类型
  items: RankingItem[]
  total_count: number
  page: number
  page_size: number
}

export type RankingResponse = APIResponse<RankingData>

// ==================== 数据导出 ====================

export interface ExportData {
  download_url: string
  filename: string
  record_count: number
  expires_at: string
}

export type ExportResponse = APIResponse<ExportData>

export interface ReportExportRequest {
  filters?: FilterConditions
  export_type?: 'pivot' | 'raw'
  format?: 'excel' | 'csv'
  sections?: ('kpi' | 'trend' | 'brand' | 'region' | 'model' | 'summary')[]
  title?: string
}

// ==================== 智能推荐与冲突检测 ====================

/** 冲突类型 */
export enum ConflictType {
  DIMENSION_REDUNDANT = 'dimension_redundant',     // 维度冗余（重复选择）
  DIMENSION_INCOMPATIBLE = 'dimension_incompatible', // 维度不兼容
  AGGREGATION_INVALID = 'aggregation_invalid',       // 聚合方式无效
  DATA_SPARSE = 'data_sparse',                      // 数据稀疏
  FILTER_CONFLICT = 'filter_conflict',              // 筛选条件冲突
  TOO_MANY_DIMENSIONS = 'too_many_dimensions',      // 维度过多
  EMPTY_RESULT = 'empty_result',                    // 结果为空
}

/** 冲突信息 */
export interface ConflictInfo {
  type: ConflictType
  severity: 'error' | 'warning' | 'info'
  message: string                    // 中文提示
  messageEn: string                  // 英文提示
  suggestion: string                 // 建议
  affectedFields?: string[]          // 受影响的字段
  dataImpact?: string                // 数据影响评估
}

/** 推荐类型 */
export enum RecommendationType {
  DIMENSION = 'dimension',           // 维度推荐
  AGGREGATION = 'aggregation',       // 聚合方式推荐
  TEMPLATE = 'template',             // 模板推荐
  FILTER = 'filter',                 // 筛选推荐
  VIEW = 'view',                     // 视图推荐
  COMBINATION = 'combination',       // 组合推荐
}

/** 推荐信息 */
export interface Recommendation {
  type: RecommendationType
  priority: number                   // 优先级 1-10
  title: string                      // 推荐标题
  description: string                // 推荐描述
  confidence: number                 // 置信度 0-1
  reason: string                     // 推荐理由
  // 推荐内容
  suggested_fields?: PivotDimension[]  // 推荐的维度
  suggested_aggregations?: AggregationType[]  // 推荐的聚合方式
  suggested_template?: string        // 推荐的模板ID
  suggested_filters?: Partial<FilterConditions>  // 推荐的筛选
  suggested_view?: ViewType          // 推荐的视图类型
  // 预览数据
  previewData?: unknown              // 预览数据
}

/** 配置验证请求 */
export interface ValidateConfigRequest {
  row_fields: PivotDimension[]
  col_field?: PivotDimension
  value_configs: ValueFieldConfig[]
  filters?: Partial<FilterConditions>
}

/** 配置验证响应 */
export interface ValidateConfigResponse {
  valid: boolean
  conflicts: ConflictInfo[]
  warnings: string[]
  recommendations: Recommendation[]
  dataQuality?: {
    estimatedRows: number
    dataSparsity: number
    confidence: number
  }
}

// ==================== 全品类分析（激光+喷墨）====================
// 新增：支持激光/喷墨双品类分析的核心类型

/** 品类类型枚举 */
export type ProductType = 'all' | 'laser' | 'inkjet'

/** 激光专属筛选条件 */
export interface LaserSpecificFilters {
  product_details?: string[]    // Color Laser / Mono Laser
  toner_capacity?: string[]     // 0 / 1-3000 / 3001-10000 / >10000 (Black Toner Max Pages 区间)
  production_classification?: string[]  // Production Classification
  duty_cycle?: string[]         // Duty Cycle 区间
}

/** 喷墨专属筛选条件 */
export interface InkjetSpecificFilters {
  product_details?: string[]      // Color Inkjet / Mono Inkjet
  ink_type?: string[]             // Ink Tank / Ink Cartridge
  business_inkjet_detail?: string[]  // 01: Entry / 02: Mid-range / 03: High-end
}

/** 品类筛选状态 */
export interface CategoryFilterState {
  product_type: ProductType
  laser_filters: LaserSpecificFilters
  inkjet_filters: InkjetSpecificFilters
}

/** 单品类KPI数据（带品类标识） */
export interface CategoryKPIData extends KPIData {
  product_type: ProductType
}

/** 双品类KPI数据 */
export interface DualCategoryKPIData {
  laser: CategoryKPIData
  inkjet: CategoryKPIData
  combined: KPIData
  laser_share: {
    units_share: number
    value_share: number
  }
  inkjet_share: {
    units_share: number
    value_share: number
  }
}

export type DualCategoryKPIResponse = APIResponse<DualCategoryKPIData>

/** 双品类趋势数据 */
export interface DualCategoryTrendData {
  periods: string[]
  laser_units: number[]
  inkjet_units: number[]
  laser_value: number[]
  inkjet_value: number[]
}

export type DualCategoryTrendResponse = APIResponse<DualCategoryTrendData>

/** 品类品牌分布 */
export interface CategoryBrandItem {
  brand: string
  units: number
  value: number
  asp: number
  share: number
}

export interface CategoryBrandDistribution {
  laser: CategoryBrandItem[]
  inkjet: CategoryBrandItem[]
}

export type CategoryBrandDistributionResponse = APIResponse<CategoryBrandDistribution>

/** 地理分析双品类数据 */
export interface GeoCategoryData {
  laser_units: number
  inkjet_units: number
  laser_value: number
  inkjet_value: number
  laser_asp: number
  inkjet_asp: number
  laser_share: number
  inkjet_share: number
}

export interface GeoHeatmapCategoryItem extends GeoHeatmapItem {
  laser: {
    units: number
    value: number
    asp: number
  }
  inkjet: {
    units: number
    value: number
    asp: number
  }
}

export type GeoHeatmapCategoryResponse = APIResponse<GeoHeatmapCategoryItem[]>

/** 国家详情双品类数据 */
export interface CountryDetailCategoryData extends CountryDetailData {
  laser: {
    kpi: CountryKPI
    top_models: TopModel[]
    brand_structure: BrandStructure[]
  }
  inkjet: {
    kpi: CountryKPI
    top_models: TopModel[]
    brand_structure: BrandStructure[]
  }
}

export type CountryDetailCategoryResponse = APIResponse<CountryDetailCategoryData>

/** 渠道分析双品类数据 */
export interface ChannelSankeyCategoryData {
  laser: ChannelSankeyData
  inkjet: ChannelSankeyData
}

export type ChannelSankeyCategoryResponse = APIResponse<ChannelSankeyCategoryData>

/** 价格段分析双品类数据 */
export interface PriceSegmentCategory {
  product_type: ProductType
  segment: string
  range: string
  units: number
  value: number
  share: number
}

export interface PriceSegmentCategoryData {
  laser: PriceSegment[]
  inkjet: PriceSegment[]
}

export type PriceSegmentCategoryResponse = APIResponse<PriceSegmentCategoryData>

/** 透视表品类预置模板 */
export interface CategoryTemplateItem extends TemplateItem {
  product_type: ProductType
}

export type CategoryTemplatesResponse = APIResponse<CategoryTemplateItem[]>

// ==================== 市场总览统一响应 ====================

/** 市场总览 KPI 指标（API 统一返回驼峰命名） */
export interface OverviewKPIData {
  totalUnits: number
  totalValue: number
  asp: number
  activeModels: number
  countriesCovered: number
  unitsYoY: number
  valueYoY: number
  unitsMoM: number
  valueMoM: number
  aspYoY: number
  aspMoM: number
  activeModelsYoY: number
  activeModelsMoM: number
  countriesCoveredYoY: number
  countriesCoveredMoM: number
  currentPeriod?: string
  previousPeriod?: string
  yoyPeriod?: string
}

/** 品类/形态/渠道结构项 */
export interface OverviewStructureItem {
  name: string
  units: number
  value: number
  share: number
  unitsYoY?: number
  valueYoY?: number
}

/** 品牌 TOP N 项 */
export interface OverviewBrandItem {
  rank: number
  name: string
  units: number
  value: number
  share: number
  asp: number
  yoy?: number
}

/** 国家 TOP N 项 */
export interface OverviewCountryItem {
  rank: number
  code: string
  name: string
  units: number
  value: number
  share: number
}

/** 趋势数据 */
export interface OverviewTrendData {
  periods: string[]
  series: Array<{
    name: string
    data: number[]
  }>
}

/** 市场总览统一响应 */
export interface OverviewData {
  kpi: OverviewKPIData
  category: {
    laser: OverviewStructureItem
    inkjet: OverviewStructureItem
  }
  form: {
    mfp: OverviewStructureItem
    printer: OverviewStructureItem
  }
  channel: {
    direct: OverviewStructureItem
    indirect: OverviewStructureItem
  }
  brands: OverviewBrandItem[]
  countries: OverviewCountryItem[]
  trend: OverviewTrendData
}

export type OverviewResponse = APIResponse<OverviewData>
