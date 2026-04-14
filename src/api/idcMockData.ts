// IDC Mock Data - 模拟数据用于测试
// 更新时间: 2026-04-10
import type {
  FilterOption,
  FilterOptionsData,
  KPIData,
  TrendChartData,
  BrandDistributionData,
  GeoHeatmapItem,
  CountryDetailData,
  ProductSearchItem,
  ProductCompareData,
  ChannelSankeyData,
  OnlineOfflineData,
  PriceSegmentData,
  InkTankAnalysisData,
  SpeedSegmentData,
  MFPFunctionData,
  PivotData,
  TemplateItem,
  DualCategoryKPIData,
  DualCategoryTrendData,
  CategoryBrandDistribution,
  HighEndModel,
  HighEndAnalysisData,
  ProductType,
  AggregationType,
  AggregationGroup,
  AggregationDefinition,
  ValueFieldOption,
  ValueFieldConfig,
  AdvancedTemplateItem,
  TemplateCategory,
  ViewType,
  ViewConfig,
  ValidateConfigResponse,
  AdvancedPivotData,
} from './idcApiTypes'
import { AggregationType as AggType, AggregationGroup as AggGroup, TemplateCategory as TplCat, ViewType as VType } from './idcApiTypes'

// 延迟函数模拟网络请求
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ==================== 30个统计量定义 ====================

/**
 * 完整的30个统计量定义
 */
export const aggregationDefinitions: AggregationDefinition[] = [
  // ====== 基础聚合函数 (5个) ======
  {
    id: AggType.SUM_UNITS,
    name: '销量求和',
    nameEn: 'Total Units',
    group: AggGroup.BASIC_AGG,
    description: '计算选中维度的销量总和',
    unit: '台',
    format: 'number',
    decimalPlaces: 0,
    sourceFields: ['units'],
    calculateMethod: 'SUM(units)',
  },
  {
    id: AggType.SUM_VALUE,
    name: '销售额求和',
    nameEn: 'Total Value',
    group: AggGroup.BASIC_AGG,
    description: '计算选中维度的销售额总和',
    unit: 'USD M',
    format: 'currency',
    decimalPlaces: 2,
    sourceFields: ['value'],
    calculateMethod: 'SUM(value)',
  },
  {
    id: AggType.COUNT_ROWS,
    name: '记录行数',
    nameEn: 'Row Count',
    group: AggGroup.BASIC_AGG,
    description: '统计记录行数',
    format: 'number',
    decimalPlaces: 0,
    sourceFields: [],
    calculateMethod: 'COUNT(*)',
  },
  {
    id: AggType.AVG_UNITS,
    name: '销量平均值',
    nameEn: 'Avg Units',
    group: AggGroup.BASIC_AGG,
    description: '计算选中维度的平均销量',
    unit: '台',
    format: 'number',
    decimalPlaces: 0,
    sourceFields: ['units'],
    calculateMethod: 'AVG(units)',
  },
  {
    id: AggType.AVG_VALUE,
    name: '销售额平均值',
    nameEn: 'Avg Value',
    group: AggGroup.BASIC_AGG,
    description: '计算选中维度的平均销售额',
    unit: 'USD M',
    format: 'currency',
    decimalPlaces: 2,
    sourceFields: ['value'],
    calculateMethod: 'AVG(value)',
  },

  // ====== 核心衍生统计 (12个) ======
  {
    id: AggType.ASP,
    name: '平均单价 (ASP)',
    nameEn: 'Average Selling Price',
    group: AggGroup.CORE_DERIVED,
    description: '销售额/销量计算平均单价',
    unit: 'USD',
    format: 'currency',
    decimalPlaces: 2,
    sourceFields: ['units', 'value'],
    calculateMethod: 'SUM(value) / SUM(units) * 1000000',
  },
  {
    id: AggType.MARKET_SHARE,
    name: '市场份额',
    nameEn: 'Market Share',
    group: AggGroup.CORE_DERIVED,
    description: '销量占总销量的百分比',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['units'],
    calculateMethod: 'SUM(units) / TOTAL_SUM(units) * 100',
  },
  {
    id: AggType.VALUE_SHARE,
    name: '销售额占比',
    nameEn: 'Value Share',
    group: AggGroup.CORE_DERIVED,
    description: '销售额占总销售额的百分比',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['value'],
    calculateMethod: 'SUM(value) / TOTAL_SUM(value) * 100',
  },
  {
    id: AggType.CATEGORY_UNITS_PCT,
    name: '品类销量占比',
    nameEn: 'Category Units %',
    group: AggGroup.CORE_DERIVED,
    description: '该品类销量占全品类销量的比例',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['units', 'product_category'],
    calculateMethod: 'CATEGORY_SUM(units) / TOTAL_SUM(units) * 100',
  },
  {
    id: AggType.INKTANK_PENETRATION,
    name: '墨仓式渗透率',
    nameEn: 'Ink Tank Penetration',
    group: AggGroup.CORE_DERIVED,
    description: '墨仓式产品销量占喷墨总销量的比例',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['units', 'ink_types'],
    calculateMethod: 'INK_TANK_UNITS / TOTAL_INKJET_UNITS * 100',
  },
  {
    id: AggType.FUNCTION_PENETRATION,
    name: '功能普及率',
    nameEn: 'Function Penetration',
    group: AggGroup.CORE_DERIVED,
    description: '某功能（如ADF/Wifi）的普及程度',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['units', 'function_fields'],
    calculateMethod: 'FUNCTION_YES_UNITS / TOTAL_UNITS * 100',
  },
  {
    id: AggType.HIGHEND_UNITS_PCT,
    name: '高端机型占比',
    nameEn: 'High-end Units %',
    group: AggGroup.CORE_DERIVED,
    description: '高端机型销量占总销量的比例',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['units', 'production_classification', 'business_inkjet_detail'],
    calculateMethod: 'HIGHEND_UNITS / TOTAL_UNITS * 100',
  },
  {
    id: AggType.A3_FORMAT_PCT,
    name: 'A3幅面占比',
    nameEn: 'A3 Format %',
    group: AggGroup.CORE_DERIVED,
    description: 'A3幅面产品销量占比',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['units', 'format'],
    calculateMethod: 'A3_UNITS / TOTAL_UNITS * 100',
  },
  {
    id: AggType.MFP_PCT,
    name: 'MFP占比',
    nameEn: 'MFP %',
    group: AggGroup.CORE_DERIVED,
    description: '多功能一体机销量占总销量的比例',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['units', 'product_category'],
    calculateMethod: 'MFP_UNITS / TOTAL_UNITS * 100',
  },
  {
    id: AggType.YoY_GROWTH,
    name: '同比增长率 (YoY)',
    nameEn: 'Year-over-Year Growth',
    group: AggGroup.CORE_DERIVED,
    description: '与去年同期的销量增长率',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['units', 'year'],
    calculateMethod: '(CURRENT_UNITS - PREVIOUS_YEAR_UNITS) / PREVIOUS_YEAR_UNITS * 100',
  },
  {
    id: AggType.HoH_GROWTH,
    name: '环比增长率 (HoH)',
    nameEn: 'Half-over-Half Growth',
    group: AggGroup.CORE_DERIVED,
    description: '与上期的销量增长率',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['units', 'half_year'],
    calculateMethod: '(CURRENT_UNITS - PREVIOUS_PERIOD_UNITS) / PREVIOUS_PERIOD_UNITS * 100',
  },
  {
    id: AggType.CUMULATIVE_UNITS,
    name: '累计销量',
    nameEn: 'Cumulative Units',
    group: AggGroup.CORE_DERIVED,
    description: '从起始期到当前期的累计销量',
    unit: '台',
    format: 'number',
    decimalPlaces: 0,
    sourceFields: ['units'],
    calculateMethod: 'SUM(units) OVER (ORDER BY period)',
  },

  // ====== 高级分析统计 (8个) ======
  {
    id: AggType.CR5_CONCENTRATION,
    name: '品牌集中度 (CR5)',
    nameEn: 'CR5 Concentration',
    group: AggGroup.ADVANCED_ANALYSIS,
    description: '前5大品牌销量占总销量的比例（行业集中度指标）',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['units', 'brand'],
    calculateMethod: 'TOP5_SUM(units) / TOTAL_SUM(units) * 100',
  },
  {
    id: AggType.AVG_UNITS_PER_MODEL,
    name: '单型号平均销量',
    nameEn: 'Avg Units per Model',
    group: AggGroup.ADVANCED_ANALYSIS,
    description: '每个型号的平均销量',
    unit: '台/型号',
    format: 'number',
    decimalPlaces: 0,
    sourceFields: ['units', 'model_name'],
    calculateMethod: 'SUM(units) / COUNT(DISTINCT model_name)',
  },
  {
    id: AggType.UNITS_PER_REGION,
    name: '单位区域销量',
    nameEn: 'Units per Region',
    group: AggGroup.ADVANCED_ANALYSIS,
    description: '每个区域单位面积的平均销量',
    unit: '台/万km²',
    format: 'ratio',
    decimalPlaces: 2,
    sourceFields: ['units', 'region'],
    calculateMethod: 'SUM(units) / REGION_AREA',
  },
  {
    id: AggType.CHANNEL_EFFICIENCY,
    name: '渠道效率',
    nameEn: 'Channel Efficiency',
    group: AggGroup.ADVANCED_ANALYSIS,
    description: '各渠道销量/型号数的比值',
    unit: '台/型号',
    format: 'ratio',
    decimalPlaces: 2,
    sourceFields: ['units', 'channel', 'model_name'],
    calculateMethod: 'CHANNEL_UNITS / CHANNEL_MODELS',
  },
  {
    id: AggType.SPEED_SEGMENT_COUNT,
    name: '速度段分布计数',
    nameEn: 'Speed Segment Count',
    group: AggGroup.ADVANCED_ANALYSIS,
    description: '各速度段的产品型号数量',
    format: 'number',
    decimalPlaces: 0,
    sourceFields: ['speed_range_a4', 'model_name'],
    calculateMethod: 'COUNT(DISTINCT model_name) BY speed_range',
  },
  {
    id: AggType.PRICE_SEGMENT_UNITS,
    name: '价格段分布销量',
    nameEn: 'Price Segment Units',
    group: AggGroup.ADVANCED_ANALYSIS,
    description: '各价格段的总销量',
    unit: '台',
    format: 'number',
    decimalPlaces: 0,
    sourceFields: ['units', 'asp'],
    calculateMethod: 'SUM(units) BY price_segment',
  },
  {
    id: AggType.COST_PER_PAGE,
    name: '单页耗材成本估算',
    nameEn: 'Cost Per Page (Est.)',
    group: AggGroup.ADVANCED_ANALYSIS,
    description: '基于墨粉/墨水容量的单页成本估算',
    unit: 'USD/页',
    format: 'currency',
    decimalPlaces: 4,
    sourceFields: ['toner_max_pages', 'toner_price', 'ink_types'],
    calculateMethod: 'TONER_PRICE / TONER_MAX_PAGES',
  },
  {
    id: AggType.DEVIATION_FROM_AVG,
    name: '与均值偏差',
    nameEn: 'Deviation from Average',
    group: AggGroup.ADVANCED_ANALYSIS,
    description: '当前值与平均值的偏差百分比',
    format: 'percent',
    decimalPlaces: 2,
    sourceFields: ['units', 'avg_units'],
    calculateMethod: '(value - AVG(value)) / AVG(value) * 100',
  },
]

/**
 * 统计量分组配置
 */
export const aggregationGroups = [
  { value: AggGroup.BASIC_AGG, label: '基础聚合', description: '求和、平均、计数等基本统计' },
  { value: AggGroup.CORE_DERIVED, label: '核心衍生', description: 'ASP、份额、增长率等衍生指标' },
  { value: AggGroup.ADVANCED_ANALYSIS, label: '高级分析', description: 'CR5、成本估算等高级指标' },
]

/**
 * 获取统计量选项列表（用于UI下拉选择）
 */
export function getValueFieldOptions(): ValueFieldOption[] {
  return aggregationDefinitions.map((def) => ({
    value: def.id,
    label: def.name,
    group: def.group,
    groupLabel: aggregationGroups.find((g) => g.value === def.group)?.label || '',
    description: def.description,
    format: def.format || 'number',
  }))
}

/**
 * 获取常用的统计量配置（默认选中的4个）
 */
export function getDefaultValueConfigs(): ValueFieldConfig[] {
  return [
    { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
    { aggregation: AggType.SUM_VALUE, sourceField: 'value', label: '销售额', format: 'currency', decimalPlaces: 2 },
    { aggregation: AggType.ASP, sourceField: 'asp', label: 'ASP', format: 'currency', decimalPlaces: 2 },
    { aggregation: AggType.MARKET_SHARE, sourceField: 'units', label: '份额', format: 'percent', decimalPlaces: 2 },
  ]
}

// ==================== 筛选选项 ====================
export const mockFilterOptions: FilterOptionsData = {
  years: ['2020', '2021', '2022', '2023', '2024', '2025'],
  half_years: ['H1', 'H2'],
  global_regions: [
    { value: 'Americas', label: '美洲' },
    { value: 'EMEA', label: '欧洲、中东、非洲' },
    { value: 'APJ', label: '亚太地区' },
  ],
  regions: [
    { value: 'North America', label: '北美' },
    { value: 'Latin America', label: '拉丁美洲' },
    { value: 'Western Europe', label: '西欧' },
    { value: 'Central/Eastern Europe', label: '中欧/东欧' },
    { value: 'Middle East & Africa', label: '中东/非洲' },
    { value: 'Asia/Pacific', label: '亚太' },
    { value: 'Greater China', label: '大中华区' },
    { value: 'Japan', label: '日本' },
  ],
  countries: [
    { value: 'US', label: '美国' },
    { value: 'CN', label: '中国' },
    { value: 'DE', label: '德国' },
    { value: 'JP', label: '日本' },
    { value: 'UK', label: '英国' },
    { value: 'FR', label: '法国' },
    { value: 'IN', label: '印度' },
    { value: 'BR', label: '巴西' },
    { value: 'AU', label: '澳大利亚' },
    { value: 'CA', label: '加拿大' },
    { value: 'IT', label: '意大利' },
    { value: 'MX', label: '墨西哥' },
  ],
  companies: [
    { value: 'HP Inc', label: 'HP Inc' },
    { value: 'Canon', label: 'Canon' },
    { value: 'Epson', label: 'Epson' },
    { value: 'Brother', label: 'Brother' },
    { value: 'Samsung', label: 'Samsung' },
    { value: 'Xerox', label: 'Xerox' },
    { value: 'Ricoh', label: 'Ricoh' },
    { value: 'Lexmark', label: 'Lexmark' },
  ],
  brands: [
    { value: 'HP', label: 'HP' },
    { value: 'Canon', label: 'Canon' },
    { value: 'Epson', label: 'Epson' },
    { value: 'Brother', label: 'Brother' },
    { value: 'Samsung', label: 'Samsung' },
    { value: 'Xerox', label: 'Xerox' },
    { value: 'Ricoh', label: 'Ricoh' },
    { value: 'Lexmark', label: 'Lexmark' },
    { value: 'Kyocera', label: 'Kyocera' },
    { value: 'OKI', label: 'OKI' },
  ],
  oems: [
    { value: 'Canon', label: 'Canon' },
    { value: 'HP', label: 'HP' },
    { value: 'Ricoh', label: 'Ricoh' },
    { value: 'Brother', label: 'Brother' },
  ],
  product_categories: [
    { value: 'Laser', label: '激光打印机' },
    { value: 'Inkjet', label: '喷墨打印机' },
    { value: 'MFP', label: '多功能一体机' },
    { value: 'Copier', label: '复印机' },
    { value: 'Label', label: '标签打印机' },
  ],
  products: [
    { value: 'Laser Printer', label: '激光打印机' },
    { value: 'Inkjet Printer', label: '喷墨打印机' },
    { value: 'Laser MFP', label: '激光一体机' },
    { value: 'Inkjet MFP', label: '喷墨一体机' },
  ],
  formats: [
    { value: 'A4', label: 'A4' },
    { value: 'A3', label: 'A3' },
    { value: 'Letter', label: 'Letter' },
    { value: 'Large Format', label: '大幅面' },
  ],
  channels: [
    { value: 'Direct', label: '直销' },
    { value: 'Dealer/VAR/SI', label: '经销商' },
    { value: 'Retail', label: '零售' },
    { value: 'eTailer', label: '电商' },
    { value: 'Internet', label: '互联网' },
  ],
  channel_groups: [
    { value: 'Online', label: '线上' },
    { value: 'Offline', label: '线下' },
    { value: 'Direct', label: '直销' },
  ],
  speed_ranges_a4: ['<20 ppm', '20-40 ppm', '40-60 ppm', '>60 ppm'],
  speed_ranges_letter: ['<20 ppm', '20-40 ppm', '40-60 ppm', '>60 ppm'],
  ink_types: [
    { value: 'Ink Tank', label: 'Ink Tank' },
    { value: 'Ink Cartridge', label: 'Ink Cartridge' },
    { value: 'Unknown', label: 'Unknown' },
  ] as FilterOption[],
  adf_options: [
    { value: 'Y', label: '有 (Y)' },
    { value: 'N', label: '无 (N)' },
  ],
  duplex_options: [
    { value: 'Y', label: '有 (Y)' },
    { value: 'N', label: '无 (N)' },
  ],
  network_options: [
    { value: 'Y', label: '有 (Y)' },
    { value: 'N', label: '无 (N)' },
  ],
  wireless_options: [
    { value: 'Y', label: '有 (Y)' },
    { value: 'N', label: '无 (N)' },
  ],
  production_classifications: [
    { value: 'New', label: 'New' },
    { value: 'Remanufactured', label: 'Remanufactured' },
    { value: 'Unknown', label: 'Unknown' },
  ] as FilterOption[],
  business_inkjet_detail: [
    { value: '01: Entry', label: '01: Entry' },
    { value: '02: Mid-range', label: '02: Mid-range' },
    { value: '03: High-end', label: '03: High-end' },
  ],
  // ====== 激光专属选项 ======
  laser_product_details: [
    { value: 'Color Laser', label: '彩色激光' },
    { value: 'Mono Laser', label: '黑白激光' },
  ] as FilterOption[],
  toner_capacity_ranges: [
    { value: '0', label: 'N/A (无数据)' },
    { value: '1-3000', label: '1-3,000页' },
    { value: '3001-10000', label: '3,001-10,000页' },
    { value: '>10000', label: '>10,000页' },
  ] as FilterOption[],
  // ====== 喷墨专属选项 ======
  inkjet_product_details: [
    { value: 'Color Inkjet', label: '彩色喷墨' },
    { value: 'Mono Inkjet', label: '黑白喷墨' },
  ] as FilterOption[],
  // ====== 高端机型快捷选项 ======
  high_end_only: [
    { value: 'true', label: '只看高端机型' },
  ] as FilterOption[],
}

// ==================== KPI 数据 ====================
export function getMockKPI(): KPIData {
  const total_units = 45236789
  const total_value = 12567.89
  return {
    total_units,
    total_value,
    asp: Math.round((total_value / total_units) * 1000000),
    active_models: 3421,
    countries_covered: 45,
    units_yoy: 5.2,
    units_mom: -2.3,
    value_yoy: 3.8,
    value_mom: -1.5,
    current_period: '2025H1',
    previous_period: '2024H2',
    yoy_period: '2024H1',
  }
}

// ==================== 趋势数据 ====================
export function getMockTrendData(): TrendChartData {
  const periods = ['2020H1', '2020H2', '2021H1', '2021H2', '2022H1', '2022H2', '2023H1', '2023H2', '2024H1', '2024H2', '2025H1']
  return {
    metric: 'units',
    periods,
    series: [
      {
        name: '销量',
        data: [3850000, 4200000, 4100000, 4350000, 4050000, 4280000, 4150000, 4320000, 4250000, 4380000, 4200000],
      },
      {
        name: '销售额 (USD M)',
        data: [980, 1120, 1050, 1180, 1020, 1150, 1080, 1200, 1150, 1250, 1180],
      },
    ],
  }
}

export function getMockRegionStackedData(): TrendChartData {
  const periods = ['2020H1', '2020H2', '2021H1', '2021H2', '2022H1', '2022H2', '2023H1', '2023H2', '2024H1', '2024H2', '2025H1']
  return {
    metric: 'units',
    periods,
    series: [
      { name: '美洲', data: [1200000, 1350000, 1280000, 1400000, 1300000, 1450000, 1380000, 1500000, 1450000, 1550000, 1500000] },
      { name: 'EMEA', data: [1100000, 1250000, 1180000, 1300000, 1150000, 1280000, 1200000, 1320000, 1280000, 1380000, 1350000] },
      { name: '亚太', data: [1550000, 1600000, 1640000, 1650000, 1600000, 1550000, 1570000, 1500000, 1520000, 1450000, 1350000] },
    ],
  }
}

export function getMockBrandShareTrend(): TrendChartData {
  const periods = ['2020H1', '2020H2', '2021H1', '2021H2', '2022H1', '2022H2', '2023H1', '2023H2', '2024H1', '2024H2', '2025H1']
  return {
    metric: 'units',
    periods,
    series: [
      { name: 'HP', data: [38.5, 37.8, 38.2, 37.5, 36.8, 36.2, 35.5, 34.8, 34.2, 33.5, 32.8] },
      { name: 'Canon', data: [18.2, 18.5, 18.8, 19.2, 19.5, 19.8, 20.2, 20.5, 20.8, 21.2, 21.5] },
      { name: 'Epson', data: [15.5, 15.8, 15.2, 15.5, 15.8, 16.2, 16.5, 16.8, 17.2, 17.5, 17.8] },
      { name: 'Brother', data: [10.2, 10.5, 10.8, 11.2, 11.5, 11.8, 12.2, 12.5, 12.8, 13.2, 13.5] },
      { name: 'Samsung', data: [5.5, 5.8, 6.2, 6.5, 6.8, 7.2, 7.5, 7.8, 8.2, 8.5, 8.8] },
      { name: '其他', data: [12.1, 11.6, 10.8, 10.1, 9.6, 8.8, 8.1, 7.6, 6.8, 6.1, 5.6] },
    ],
  }
}

// ==================== 品牌分布 ====================
export function getMockBrandTopN(): BrandDistributionData {
  return {
    type: 'top_n',
    brands: [
      { brand: 'HP', units: 13800000, value: 3850, asp: 279, units_share: 30.5, value_share: 30.6 },
      { brand: 'Canon', units: 9200000, value: 2680, asp: 291, units_share: 20.3, value_share: 21.3 },
      { brand: 'Epson', units: 7800000, value: 2100, asp: 269, units_share: 17.2, value_share: 16.7 },
      { brand: 'Brother', units: 5600000, value: 1450, asp: 259, units_share: 12.4, value_share: 11.5 },
      { brand: 'Samsung', units: 3200000, value: 890, asp: 278, units_share: 7.1, value_share: 7.1 },
      { brand: 'Xerox', units: 1800000, value: 620, asp: 344, units_share: 4.0, value_share: 4.9 },
      { brand: 'Ricoh', units: 1500000, value: 540, asp: 360, units_share: 3.3, value_share: 4.3 },
      { brand: 'Lexmark', units: 1100000, value: 380, asp: 345, units_share: 2.4, value_share: 3.0 },
      { brand: 'Kyocera', units: 780000, value: 280, asp: 359, units_share: 1.7, value_share: 2.2 },
      { brand: 'OKI', units: 450000, value: 145, asp: 322, units_share: 1.0, value_share: 1.2 },
    ],
  }
}

export function getMockBrandOEM(): BrandDistributionData {
  return {
    type: 'oem',
    oems: [
      { oem: 'HP Inc', units: 13800000, value: 3850 },
      { oem: 'Canon', units: 9200000, value: 2680 },
      { oem: 'Brother Industries', units: 5600000, value: 1450 },
      { oem: 'Samsung Electronics', units: 3200000, value: 890 },
      { oem: 'Xerox', units: 1800000, value: 620 },
      { oem: 'Ricoh', units: 1500000, value: 540 },
      { oem: 'Lexmark', units: 1100000, value: 380 },
      { oem: 'Kyocera', units: 780000, value: 280 },
      { oem: '其他', units: 4200000, value: 878 },
    ],
  }
}

export function getMockBrandCompare(brands: string[]): BrandDistributionData {
  const brandData: Record<string, { units: number; value: number; asp: number; active_models: number; countries_covered: number }> = {
    HP: { units: 13800000, value: 3850, asp: 279, active_models: 485, countries_covered: 145 },
    Canon: { units: 9200000, value: 2680, asp: 291, active_models: 412, countries_covered: 138 },
    Epson: { units: 7800000, value: 2100, asp: 269, active_models: 356, countries_covered: 125 },
    Brother: { units: 5600000, value: 1450, asp: 259, active_models: 285, countries_covered: 118 },
    Samsung: { units: 3200000, value: 890, asp: 278, active_models: 198, countries_covered: 95 },
  }

  return {
    type: 'compare',
    brands: brands.map((b) => ({
      brand: b,
      ...(brandData[b] || { units: 1000000, value: 280, asp: 280, active_models: 100, countries_covered: 50 }),
    })),
  }
}

// ==================== 地理数据 ====================
export function getMockGeoHeatmap(): GeoHeatmapItem[] {
  return [
    { country_code: 'US', country_name: '美国', iso_code: 'USA', units: 8500000, value: 2450, asp: 288 },
    { country_code: 'CN', country_name: '中国', iso_code: 'CHN', units: 6200000, value: 1680, asp: 271 },
    { country_code: 'DE', country_name: '德国', iso_code: 'DEU', units: 2100000, value: 620, asp: 295 },
    { country_code: 'JP', country_name: '日本', iso_code: 'JPN', units: 1950000, value: 580, asp: 297 },
    { country_code: 'UK', country_name: '英国', iso_code: 'GBR', units: 1800000, value: 520, asp: 289 },
    { country_code: 'FR', country_name: '法国', iso_code: 'FRA', units: 1650000, value: 475, asp: 288 },
    { country_code: 'IN', country_name: '印度', iso_code: 'IND', units: 1500000, value: 320, asp: 213 },
    { country_code: 'BR', country_name: '巴西', iso_code: 'BRA', units: 1200000, value: 285, asp: 238 },
    { country_code: 'AU', country_name: '澳大利亚', iso_code: 'AUS', units: 980000, value: 295, asp: 301 },
    { country_code: 'CA', country_name: '加拿大', iso_code: 'CAN', units: 950000, value: 280, asp: 295 },
    { country_code: 'IT', country_name: '意大利', iso_code: 'ITA', units: 920000, value: 265, asp: 288 },
    { country_code: 'MX', country_name: '墨西哥', iso_code: 'MEX', units: 780000, value: 185, asp: 237 },
  ]
}

export function getMockCountryDetail(countryCode: string): CountryDetailData {
  const countryData: Record<string, { name: string }> = {
    US: { name: '美国' },
    CN: { name: '中国' },
    DE: { name: '德国' },
    JP: { name: '日本' },
  }
  const name = countryData[countryCode]?.name || countryCode

  return {
    country_code: countryCode,
    country_name: name,
    kpi: { units: 8500000, value: 2450, asp: 288, active_models: 456 },
    top_models: [
      { brand: 'HP', model_name: 'LaserJet Pro MFP M428fdw', units: 125000, value: 42.5 },
      { brand: 'Canon', model_name: 'imageCLASS MF644Cdw', units: 98000, value: 35.2 },
      { brand: 'Epson', model_name: 'WorkForce Pro WF-4820', units: 85000, value: 28.9 },
      { brand: 'Brother', model_name: 'MFC-L8900CDW', units: 72000, value: 24.5 },
      { brand: 'HP', model_name: 'OfficeJet Pro 9015', units: 68000, value: 23.1 },
    ],
    trend: {
      periods: ['2020H1', '2020H2', '2021H1', '2021H2', '2022H1', '2022H2', '2023H1', '2023H2', '2024H1', '2024H2', '2025H1'],
      units: [7800000, 8200000, 8100000, 8500000, 8300000, 8700000, 8400000, 8800000, 8600000, 8900000, 8500000],
      value: [2180, 2350, 2280, 2480, 2380, 2550, 2450, 2650, 2550, 2750, 2450],
    },
    brand_structure: [
      { brand: 'HP', units: 2800000, share: 32.9 },
      { brand: 'Canon', units: 1850000, share: 21.8 },
      { brand: 'Epson', units: 1450000, share: 17.1 },
      { brand: 'Brother', units: 980000, share: 11.5 },
      { brand: 'Samsung', units: 720000, share: 8.5 },
      { brand: '其他', units: 700000, share: 8.2 },
    ],
  }
}

// ==================== 型号搜索 ====================
export function getMockProductSearch(keyword: string): ProductSearchItem[] {
  const models = [
    { model_key: 'HP_LaserJet Pro MFP M428fdw', brand: 'HP', model_name: 'LaserJet Pro MFP M428fdw', product_brand: 'HP', product_category: 'MFP', product: 'Laser MFP', format: 'A4' },
    { model_key: 'Canon_imageCLASS MF644Cdw', brand: 'Canon', model_name: 'imageCLASS MF644Cdw', product_brand: 'Canon', product_category: 'MFP', product: 'Laser MFP', format: 'A4' },
    { model_key: 'Epson_WorkForce Pro WF-4820', brand: 'Epson', model_name: 'WorkForce Pro WF-4820', product_brand: 'Epson', product_category: 'MFP', product: 'Inkjet MFP', format: 'A4' },
    { model_key: 'Brother_MFC-L8900CDW', brand: 'Brother', model_name: 'MFC-L8900CDW', product_brand: 'Brother', product_category: 'MFP', product: 'Laser MFP', format: 'A4' },
    { model_key: 'HP_OfficeJet Pro 9015', brand: 'HP', model_name: 'OfficeJet Pro 9015', product_brand: 'HP', product_category: 'MFP', product: 'Inkjet MFP', format: 'A4' },
    { model_key: 'HP_LaserJet Pro M404n', brand: 'HP', model_name: 'LaserJet Pro M404n', product_brand: 'HP', product_category: 'Laser', product: 'Laser Printer', format: 'A4' },
    { model_key: 'Canon_i-SENSYS LBP226dw', brand: 'Canon', model_name: 'i-SENSYS LBP226dw', product_brand: 'Canon', product_category: 'Laser', product: 'Laser Printer', format: 'A4' },
    { model_key: 'Epson_EcoTank ET-4760', brand: 'Epson', model_name: 'EcoTank ET-4760', product_brand: 'Epson', product_category: 'MFP', product: 'Inkjet MFP', format: 'A4' },
    { model_key: 'Samsung_Xpress M4080FX', brand: 'Samsung', model_name: 'Xpress M4080FX', product_brand: 'Samsung', product_category: 'MFP', product: 'Laser MFP', format: 'A4' },
    { model_key: 'Xerox_VersaLink C405', brand: 'Xerox', model_name: 'VersaLink C405', product_brand: 'Xerox', product_category: 'MFP', product: 'Laser MFP', format: 'A4' },
  ]

  const lowerKeyword = keyword.toLowerCase()
  return models.filter(
    (m) =>
      m.model_name.toLowerCase().includes(lowerKeyword) ||
      m.brand.toLowerCase().includes(lowerKeyword) ||
      m.product_brand.toLowerCase().includes(lowerKeyword)
  )
}

// ==================== 型号对比 ====================
export function getMockProductCompare(modelKeys: string[]): ProductCompareData {
  return {
    spec_matrix: {
      basic_info: [
        ['Brand', ...modelKeys.map((k) => k.split('_')[0])],
        ['Product Category', 'MFP', 'MFP', 'MFP'],
        ['Product', 'Laser MFP', 'Laser MFP', 'Inkjet MFP'],
        ['Format', 'A4', 'A4', 'A4'],
        ['Model Name', ...modelKeys.map((k) => k.split('_')[1])],
      ],
      speed_specs: [
        ['A4 Color Speed (ppm)', '60', '55', '15'],
        ['A4 Mono Speed (ppm)', '60', '55', '20'],
        ['ISO Color Speed (ppm)', '58', '52', '14'],
        ['ISO Mono Speed (ppm)', '58', '52', '19'],
      ],
      function_specs: [
        ['Function', 'Print/Copy/Scan', 'Print/Copy/Scan', 'Print/Copy/Scan'],
        ['ADF', 'Y', 'Y', 'Y'],
        ['Duplex', 'Y', 'Y', 'Y'],
        ['Wireless', 'Y', 'Y', 'Y'],
        ['Network', 'Y', 'Y', 'N'],
      ],
      consumable_specs: [
        ['Ink Tank/ Ink Cartridge', 'Ink Cartridge', 'Ink Cartridge', 'Ink Tank'],
        ['Black Toner Max Pages', '10000', '8000', '-'],
        ['Color Toner Max Pages', '7000', '6000', '-'],
      ],
      physical_specs: [
        ['Duty Cycle (pages/month)', '80000', '50000', '5000'],
        ['Weight (kg)', '12.4', '18.5', '6.6'],
        ['Tray Size (sheets)', '350', '250', '250'],
        ['Flatbed/Sheetfed', 'Flatbed', 'Flatbed', 'Sheetfed'],
      ],
      production_specs: [
        ['Production Classification', 'Color Very Light Production', 'Color Very Light Production', 'New'],
        ['Business Inkjet Detail', '02: Mid-range', '01: Entry', '03: High-end'],
      ],
    },
    market_compare: {
      units: [125000, 98000, 85000],
      value: [42.5, 35.2, 28.9],
      asp: [340, 359, 340],
    },
    region_distribution: [
      ['Americas', 45000, 35000, 32000],
      ['EMEA', 40000, 32000, 28000],
      ['APJ', 40000, 31000, 25000],
    ],
    channel_distribution: [
      ['Dealer/VAR/SI', 50000, 40000, 30000],
      ['Retail', 35000, 28000, 25000],
      ['eTailer', 25000, 20000, 20000],
      ['Direct', 15000, 10000, 10000],
    ],
    time_trend: {
      periods: ['2020H1', '2020H2', '2021H1', '2021H2', '2022H1', '2022H2', '2023H1', '2023H2', '2024H1', '2024H2', '2025H1'],
      series: modelKeys.map((key, idx) => ({
        name: key.split('_')[1].substring(0, 20),
        data: [85000 + idx * 5000, 92000 + idx * 5000, 98000 + idx * 5000, 105000 + idx * 5000, 110000 + idx * 5000, 115000 + idx * 5000, 120000 + idx * 5000, 125000 + idx * 5000, 125000 + idx * 5000, 130000 + idx * 5000, 125000 + idx * 5000],
      })),
    },
  }
}

// ==================== 渠道桑基图 ====================
export function getMockChannelSankey(): ChannelSankeyData {
  return {
    nodes: [
      { name: 'Dealer/VAR/SI', category: 'channel' },
      { name: 'Retail', category: 'channel' },
      { name: 'eTailer', category: 'channel' },
      { name: 'Internet', category: 'channel' },
      { name: 'Direct', category: 'channel' },
      { name: 'Online', category: 'channel_group' },
      { name: 'Offline', category: 'channel_group' },
      { name: 'HP', category: 'brand' },
      { name: 'Canon', category: 'brand' },
      { name: 'Epson', category: 'brand' },
      { name: 'Brother', category: 'brand' },
      { name: 'Samsung', category: 'brand' },
    ],
    links: [
      { source: 'Dealer/VAR/SI', target: 'Offline', value: 15000000 },
      { source: 'Retail', target: 'Offline', value: 8500000 },
      { source: 'Direct', target: 'Offline', value: 3200000 },
      { source: 'eTailer', target: 'Online', value: 8500000 },
      { source: 'Internet', target: 'Online', value: 5200000 },
      { source: 'Offline', target: 'HP', value: 8500000 },
      { source: 'Offline', target: 'Canon', value: 5200000 },
      { source: 'Offline', target: 'Brother', value: 3800000 },
      { source: 'Online', target: 'HP', value: 2800000 },
      { source: 'Online', target: 'Canon', value: 2500000 },
      { source: 'Online', target: 'Epson', value: 3200000 },
      { source: 'Online', target: 'Samsung', value: 1800000 },
      { source: 'Online', target: 'Brother', value: 1200000 },
    ],
  }
}

// ==================== 线上/线下趋势 ====================
export function getMockOnlineOfflineTrend(): OnlineOfflineData {
  const periods = ['2020H1', '2020H2', '2021H1', '2021H2', '2022H1', '2022H2', '2023H1', '2023H2', '2024H1', '2024H2', '2025H1']
  return {
    periods,
    online: [2800000, 3200000, 3500000, 3800000, 4200000, 4800000, 5200000, 5800000, 6200000, 6800000, 6500000],
    offline: [3400000, 3600000, 3500000, 3700000, 3600000, 3500000, 3400000, 3300000, 3200000, 3100000, 3000000],
    online_share: [0.45, 0.47, 0.50, 0.51, 0.54, 0.58, 0.60, 0.64, 0.66, 0.69, 0.68],
    offline_share: [0.55, 0.53, 0.50, 0.49, 0.46, 0.42, 0.40, 0.36, 0.34, 0.31, 0.32],
  }
}

// ==================== 价格段 ====================
export function getMockPriceSegments(type: 'market_capacity' | 'brand_position' | 'asp_trend' | 'brand_asp_compare'): PriceSegmentData {
  if (type === 'market_capacity') {
    return {
      type: 'market_capacity',
      segments: [
        { name: '入门', range: '< $200', units: 18500000, value: 2850, share: 40.9 },
        { name: '中端', range: '$200 - $1000', units: 15200000, value: 4850, share: 33.6 },
        { name: '高端', range: '> $1000', units: 11500000, value: 4868, share: 25.4 },
      ],
    }
  }
  if (type === 'brand_position') {
    return {
      type: 'brand_position',
      brands: ['HP', 'Canon', 'Epson', 'Brother', 'Samsung'],
      series: [
        { name: 'HP', data: [32, 48, 20] },
        { name: 'Canon', data: [25, 42, 33] },
        { name: 'Epson', data: [45, 38, 17] },
        { name: 'Brother', data: [38, 44, 18] },
        { name: 'Samsung', data: [30, 40, 30] },
      ],
    }
  }
  if (type === 'asp_trend') {
    return {
      type: 'asp_trend',
      periods: ['2020H1', '2020H2', '2021H1', '2021H2', '2022H1', '2022H2', '2023H1', '2023H2', '2024H1', '2024H2', '2025H1'],
      series: [
        { name: '市场 ASP', data: [265, 272, 268, 275, 270, 278, 272, 280, 275, 282, 278] },
      ],
    }
  }
  if (type === 'brand_asp_compare') {
    return {
      type: 'brand_asp_compare',
      brands: ['HP', 'Canon', 'Epson', 'Brother', 'Samsung', 'Xerox', 'Ricoh'],
      asp: [279, 291, 269, 259, 278, 344, 360],
    }
  }
  return {
    type: 'market_capacity',
    segments: [
      { name: '入门', range: '< $200', units: 18500000, value: 2850, share: 40.9 },
      { name: '中端', range: '$200 - $1000', units: 15200000, value: 4850, share: 33.6 },
      { name: '高端', range: '> $1000', units: 11500000, value: 4868, share: 25.4 },
    ],
  }
}

// ==================== 墨仓分析 ====================
export function getMockInkTankAnalysis(type: 'overall' | 'region' | 'brand'): InkTankAnalysisData {
  if (type === 'overall') {
    return {
      type: 'overall',
      ink_tank_units: 8500000,
      ink_tank_value: 2100,
      ink_tank_share_units: 0.32,
      ink_tank_share_value: 0.28,
      cartridge_units: 16500000,
      cartridge_value: 5200,
      unknown_units: 1250000,
    }
  }
  if (type === 'region') {
    return {
      type: 'region',
      regions: [
        { region: '美洲', ink_tank_share: 0.28 },
        { region: 'EMEA', ink_tank_share: 0.35 },
        { region: '亚太', ink_tank_share: 0.38 },
        { region: '大中华区', ink_tank_share: 0.42 },
        { region: '日本', ink_tank_share: 0.25 },
      ],
    }
  }
  return {
    type: 'brand',
    brands: [
      { brand: 'Epson', ink_tank_share: 0.85, ink_tank_units: 4500000, total_units: 5300000 },
      { brand: 'Brother', ink_tank_share: 0.65, ink_tank_units: 2100000, total_units: 3200000 },
      { brand: 'Canon', ink_tank_share: 0.45, ink_tank_units: 1500000, total_units: 3300000 },
      { brand: 'HP', ink_tank_share: 0.25, ink_tank_units: 1200000, total_units: 4800000 },
      { brand: 'Samsung', ink_tank_share: 0.15, ink_tank_units: 300000, total_units: 2000000 },
    ],
  }
}

// ==================== 速度段分析 ====================
export function getMockSpeedSegmentAnalysis(type: 'capacity' | 'brand_share' | 'scatter' | 'trend'): SpeedSegmentData {
  if (type === 'capacity') {
    return {
      type: 'capacity',
      segments: [
        { segment: '<20 ppm', units: 12000000, value: 2500 },
        { segment: '20-40 ppm', units: 18500000, value: 5200 },
        { segment: '40-60 ppm', units: 9800000, value: 3200 },
        { segment: '>60 ppm', units: 4936789, value: 1668 },
      ],
    }
  }
  if (type === 'scatter') {
    return {
      type: 'scatter',
      points: [
        { model_name: 'LaserJet Pro M404n', speed: 38, asp: 280, units: 125000, brand: 'HP' },
        { model_name: 'i-SENSYS LBP226dw', speed: 24, asp: 320, units: 98000, brand: 'Canon' },
        { model_name: 'WorkForce Pro WF-4820', speed: 20, asp: 290, units: 85000, brand: 'Epson' },
        { model_name: 'MFC-L8900CDW', speed: 33, asp: 310, units: 72000, brand: 'Brother' },
        { model_name: 'Xpress M4080FX', speed: 40, asp: 340, units: 65000, brand: 'Samsung' },
        { model_name: 'VersaLink C405', speed: 45, asp: 380, units: 58000, brand: 'Xerox' },
        { model_name: 'LaserJet Pro MFP M428fdw', speed: 38, asp: 340, units: 115000, brand: 'HP' },
        { model_name: 'imageCLASS MF644Cdw', speed: 24, asp: 359, units: 92000, brand: 'Canon' },
      ],
    }
  }
  return {
    type: 'capacity',
    segments: [
      { segment: '<20 ppm', units: 12000000, value: 2500 },
      { segment: '20-40 ppm', units: 18500000, value: 5200 },
      { segment: '40-60 ppm', units: 9800000, value: 3200 },
      { segment: '>60 ppm', units: 4936789, value: 1668 },
    ],
  }
}

// ==================== MFP 功能 ====================
export function getMockMFPFunction(type: 'coverage' | 'combination' | 'brand_diff' | 'region_diff'): MFPFunctionData {
  if (type === 'coverage') {
    return {
      type: 'coverage',
      print_rate: 0.98,
      copy_rate: 0.85,
      scan_rate: 0.82,
      fax_rate: 0.45,
      adf_rate: 0.78,
    }
  }
  if (type === 'combination') {
    return {
      type: 'combination',
      combinations: [
        { functions: ['Print', 'Copy', 'Scan'], count: 8500000, share: 0.45 },
        { functions: ['Print', 'Copy', 'Scan', 'Fax'], count: 4200000, share: 0.22 },
        { functions: ['Print', 'Copy'], count: 2800000, share: 0.15 },
        { functions: ['Print'], count: 1800000, share: 0.09 },
        { functions: ['Print', 'Scan'], count: 1500000, share: 0.08 },
      ],
    }
  }
  return {
    type: 'coverage',
    print_rate: 0.98,
    copy_rate: 0.85,
    scan_rate: 0.82,
    fax_rate: 0.45,
    adf_rate: 0.78,
  }
}

// ==================== 透视表 ====================
export function getMockPivotData(): PivotData {
  return {
    headers: [['Brand'], ['Metric'], ['2024H1', '2024H2', '2025H1']],
    rows: [
      ['HP', 'Units', 4200000, 4350000, 4200000],
      ['HP', 'Value (USD M)', 1150, 1180, 1120],
      ['Canon', 'Units', 2800000, 2950000, 2850000],
      ['Canon', 'Value (USD M)', 820, 860, 830],
      ['Epson', 'Units', 2400000, 2500000, 2400000],
      ['Epson', 'Value (USD M)', 650, 680, 650],
      ['Brother', 'Units', 1700000, 1800000, 1720000],
      ['Brother', 'Value (USD M)', 440, 465, 445],
    ],
    totals: ['Total', '', 14500000, 15200000, 14600000],
    total_count: 8,
    page: 1,
    page_size: 50,
  }
}

// ==================== 高级模板（26个） ====================

/**
 * 高级透视模板（26个）
 * 按需求文档分类：
 * - 市场概览类: 6个
 * - 地理分析类: 5个
 * - 技术分析类: 6个
 * - 商业分析类: 5个
 * - 深度洞察类: 4个
 */
export const mockAdvancedTemplates: AdvancedTemplateItem[] = [
  // ====== 市场概览类 (6个) ======
  {
    id: 'global_halfyear_trend',
    name: '全球市场半年度趋势',
    description: '分析全球打印机市场的半年度销量和销售额变化趋势',
    category: TplCat.MARKET_OVERVIEW,
    categoryLabel: '市场概览',
    row_fields: ['Half Year'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.SUM_VALUE, sourceField: 'value', label: '销售额', format: 'currency', decimalPlaces: 2 },
      { aggregation: AggType.ASP, sourceField: 'asp', label: 'ASP', format: 'currency', decimalPlaces: 2 },
    ],
    recommended_views: [VType.LINE, VType.BAR],
    applicable_scenarios: ['季度复盘', '年度总结', '市场趋势分析'],
  },
  {
    id: 'brand_year_ranking',
    name: '品牌年度销量排名',
    description: '按年度统计各品牌的销量和销售额排名',
    category: TplCat.MARKET_OVERVIEW,
    categoryLabel: '市场概览',
    row_fields: ['Year', 'Brand'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.MARKET_SHARE, sourceField: 'units', label: '份额', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.BAR],
    applicable_scenarios: ['品牌竞争分析', '市场份额追踪'],
  },
  {
    id: 'region_market_share',
    name: '区域市场份额分布',
    description: '分析各全球区域的市场份额占比',
    category: TplCat.MARKET_OVERVIEW,
    categoryLabel: '市场概览',
    row_fields: ['Global Region'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.MARKET_SHARE, sourceField: 'units', label: '份额', format: 'percent', decimalPlaces: 2 },
      { aggregation: AggType.ASP, sourceField: 'asp', label: 'ASP', format: 'currency', decimalPlaces: 2 },
    ],
    recommended_views: [VType.PIE, VType.BAR],
    applicable_scenarios: ['区域市场分析', '市场潜力评估'],
  },
  {
    id: 'laser_vs_inkjet_compare',
    name: '激光 vs 喷墨品类对比',
    description: '对比分析激光打印机和喷墨打印机的市场份额',
    category: TplCat.MARKET_OVERVIEW,
    categoryLabel: '市场概览',
    row_fields: ['Product'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.SUM_VALUE, sourceField: 'value', label: '销售额', format: 'currency', decimalPlaces: 2 },
      { aggregation: AggType.CATEGORY_UNITS_PCT, sourceField: 'units', label: '品类占比', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.PIE, VType.BAR],
    applicable_scenarios: ['品类对比', '产品策略制定'],
  },
  {
    id: 'highend_market_share',
    name: '高端机型市场占比',
    description: '分析高端机型（生产级/商用高端）的市场份额',
    category: TplCat.MARKET_OVERVIEW,
    categoryLabel: '市场概览',
    row_fields: ['Production Classification', 'Business Inkjet Detail'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.HIGHEND_UNITS_PCT, sourceField: 'units', label: '高端占比', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.PIE],
    applicable_scenarios: ['高端市场分析', '产品升级策略'],
  },
  {
    id: 'channel_structure',
    name: '渠道结构分析',
    description: '分析不同渠道的销售占比和效率',
    category: TplCat.MARKET_OVERVIEW,
    categoryLabel: '市场概览',
    row_fields: ['Channel Group', 'Channel'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.VALUE_SHARE, sourceField: 'value', label: '销售额占比', format: 'percent', decimalPlaces: 2 },
      { aggregation: AggType.CHANNEL_EFFICIENCY, sourceField: 'units', label: '渠道效率', format: 'ratio', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.BAR],
    applicable_scenarios: ['渠道策略分析', '渠道优化'],
  },

  // ====== 地理分析类 (5个) ======
  {
    id: 'country_top20',
    name: '国家销量 Top 20',
    description: '展示销量最高的前20个国家',
    category: TplCat.GEO_ANALYSIS,
    categoryLabel: '地理分析',
    row_fields: ['Country'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.MARKET_SHARE, sourceField: 'units', label: '份额', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.BAR, VType.HEATMAP],
    applicable_scenarios: ['国家排名分析', '重点市场识别'],
  },
  {
    id: 'region_brand_cross',
    name: '区域×品牌交叉分析',
    description: '分析各品牌在不同区域的市场表现',
    category: TplCat.GEO_ANALYSIS,
    categoryLabel: '地理分析',
    row_fields: ['Global Region', 'Brand'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.MARKET_SHARE, sourceField: 'units', label: '份额', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.BAR],
    applicable_scenarios: ['区域品牌策略', '竞争格局分析'],
  },
  {
    id: 'country_laser_inkjet_preference',
    name: '各国激光/喷墨偏好',
    description: '分析各国家/地区对激光和喷墨产品的偏好差异',
    category: TplCat.GEO_ANALYSIS,
    categoryLabel: '地理分析',
    row_fields: ['Country', 'Product'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.CATEGORY_UNITS_PCT, sourceField: 'units', label: '品类占比', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.BAR],
    applicable_scenarios: ['区域产品策略', '市场需求分析'],
  },
  {
    id: 'region_highend_penetration',
    name: '区域高端机型渗透率',
    description: '分析各区域高端机型的渗透率',
    category: TplCat.GEO_ANALYSIS,
    categoryLabel: '地理分析',
    row_fields: ['Global Region'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '总销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.HIGHEND_UNITS_PCT, sourceField: 'units', label: '高端占比', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.BAR],
    applicable_scenarios: ['高端市场拓展', '区域消费能力分析'],
  },
  {
    id: 'country_channel_efficiency',
    name: '国家渠道效率对比',
    description: '对比不同国家的渠道效率',
    category: TplCat.GEO_ANALYSIS,
    categoryLabel: '地理分析',
    row_fields: ['Country', 'Channel Group'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.CHANNEL_EFFICIENCY, sourceField: 'units', label: '渠道效率', format: 'ratio', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE],
    applicable_scenarios: ['渠道策略优化', '市场进入策略'],
  },

  // ====== 技术分析类 (6个) ======
  {
    id: 'laser_speed_distribution',
    name: '激光机速度段分布',
    description: '分析激光打印机的速度段市场分布',
    category: TplCat.TECH_ANALYSIS,
    categoryLabel: '技术分析',
    row_fields: ['Speed Range A4'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.MARKET_SHARE, sourceField: 'units', label: '份额', format: 'percent', decimalPlaces: 2 },
      { aggregation: AggType.AVG_UNITS, sourceField: 'units', label: '平均销量', format: 'number', decimalPlaces: 0 },
    ],
    recommended_views: [VType.TABLE, VType.BAR, VType.PIE],
    applicable_scenarios: ['产品定位', '技术趋势分析'],
  },
  {
    id: 'inkjet_inktype_penetration',
    name: '喷墨机墨仓式渗透率',
    description: '分析喷墨打印机中墨仓式vs墨盒式的渗透率',
    category: TplCat.TECH_ANALYSIS,
    categoryLabel: '技术分析',
    row_fields: ['Ink Tank/ Ink Cartridge'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.INKTANK_PENETRATION, sourceField: 'units', label: '渗透率', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.PIE],
    applicable_scenarios: ['耗材技术分析', '产品创新评估'],
  },
  {
    id: 'mfp_function_penetration',
    name: 'MFP 功能普及率',
    description: '分析MFP多功能一体机各功能的普及程度',
    category: TplCat.TECH_ANALYSIS,
    categoryLabel: '技术分析',
    row_fields: ['Product Category'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.MFP_PCT, sourceField: 'units', label: 'MFP占比', format: 'percent', decimalPlaces: 2 },
      { aggregation: AggType.FUNCTION_PENETRATION, sourceField: 'units', label: '功能普及率', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.BAR],
    applicable_scenarios: ['功能需求分析', '产品功能规划'],
  },
  {
    id: 'a3_format_market',
    name: 'A3幅面市场占比',
    description: '分析A3幅面打印机在市场的占比',
    category: TplCat.TECH_ANALYSIS,
    categoryLabel: '技术分析',
    row_fields: ['Format', 'Brand'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.A3_FORMAT_PCT, sourceField: 'units', label: 'A3占比', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.PIE],
    applicable_scenarios: ['幅面市场分析', '产品线规划'],
  },
  {
    id: 'function_brand_matrix',
    name: '功能配置×品牌矩阵',
    description: '分析各品牌的功能配置分布',
    category: TplCat.TECH_ANALYSIS,
    categoryLabel: '技术分析',
    row_fields: ['Brand', 'ADF', 'Duplex', 'Wireless'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.FUNCTION_PENETRATION, sourceField: 'units', label: '功能普及率', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE],
    applicable_scenarios: ['功能竞争分析', '差异化策略'],
  },
  {
    id: 'production_grade_analysis',
    name: '生产级设备专项分析',
    description: '分析生产级激光打印机的市场分布',
    category: TplCat.TECH_ANALYSIS,
    categoryLabel: '技术分析',
    row_fields: ['Production Classification', 'Brand'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.HIGHEND_UNITS_PCT, sourceField: 'units', label: '生产级占比', format: 'percent', decimalPlaces: 2 },
      { aggregation: AggType.ASP, sourceField: 'asp', label: 'ASP', format: 'currency', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.BAR],
    applicable_scenarios: ['高端市场分析', '产能规划'],
  },

  // ====== 商业分析类 (5个) ======
  {
    id: 'price_segment_analysis',
    name: '价格段分布分析',
    description: '分析不同价格段的市场分布',
    category: TplCat.BUSINESS_ANALYSIS,
    categoryLabel: '商业分析',
    row_fields: ['Brand'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.PRICE_SEGMENT_UNITS, sourceField: 'units', label: '价格段销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.ASP, sourceField: 'asp', label: 'ASP', format: 'currency', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.BAR],
    applicable_scenarios: ['价格策略', '市场定位'],
  },
  {
    id: 'asp_trend_brand_compare',
    name: 'ASP 趋势与品牌对比',
    description: '分析各品牌ASP的变化趋势',
    category: TplCat.BUSINESS_ANALYSIS,
    categoryLabel: '商业分析',
    row_fields: ['Year', 'Brand'],
    value_configs: [
      { aggregation: AggType.ASP, sourceField: 'asp', label: 'ASP', format: 'currency', decimalPlaces: 2 },
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
    ],
    recommended_views: [VType.TABLE, VType.LINE],
    applicable_scenarios: ['价格趋势分析', '品牌定价策略'],
  },
  {
    id: 'cost_per_page_analysis',
    name: '单页耗材成本估算',
    description: '估算不同型号的单页耗材成本',
    category: TplCat.BUSINESS_ANALYSIS,
    categoryLabel: '商业分析',
    row_fields: ['Brand', 'Ink Tank/ Ink Cartridge'],
    value_configs: [
      { aggregation: AggType.COST_PER_PAGE, sourceField: 'units', label: '单页成本', format: 'currency', decimalPlaces: 4 },
      { aggregation: AggType.AVG_UNITS, sourceField: 'units', label: '平均销量', format: 'number', decimalPlaces: 0 },
    ],
    recommended_views: [VType.TABLE],
    applicable_scenarios: ['耗材成本分析', 'TCO分析'],
  },
  {
    id: 'channel_price_cross',
    name: '渠道×价格段交叉',
    description: '分析不同渠道的价格段分布',
    category: TplCat.BUSINESS_ANALYSIS,
    categoryLabel: '商业分析',
    row_fields: ['Channel Group', 'Brand'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.CHANNEL_EFFICIENCY, sourceField: 'units', label: '渠道效率', format: 'ratio', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.BAR],
    applicable_scenarios: ['渠道价格策略', '分销策略'],
  },
  {
    id: 'cr5_concentration_analysis',
    name: '品牌集中度 (CR5) 分析',
    description: '分析行业品牌集中度CR5指标',
    category: TplCat.BUSINESS_ANALYSIS,
    categoryLabel: '商业分析',
    row_fields: ['Year', 'Global Region'],
    value_configs: [
      { aggregation: AggType.CR5_CONCENTRATION, sourceField: 'units', label: 'CR5', format: 'percent', decimalPlaces: 2 },
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
    ],
    recommended_views: [VType.TABLE, VType.LINE],
    applicable_scenarios: ['行业集中度分析', '竞争强度评估'],
  },

  // ====== 深度洞察类 (4个) ======
  {
    id: 'brand_speed_region_3d',
    name: '品牌×速度段×区域三维',
    description: '三维交叉分析品牌、速度段、区域的组合表现',
    category: TplCat.DEEP_INSIGHT,
    categoryLabel: '深度洞察',
    row_fields: ['Global Region', 'Speed Range A4', 'Brand'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.AVG_UNITS_PER_MODEL, sourceField: 'units', label: '单型号销量', format: 'number', decimalPlaces: 0 },
    ],
    recommended_views: [VType.TABLE],
    applicable_scenarios: ['多维竞争分析', '产品组合优化'],
  },
  {
    id: 'inktype_region_brand_cross',
    name: '墨仓式×区域×品牌交叉',
    description: '分析墨仓式产品在各区域品牌的渗透情况',
    category: TplCat.DEEP_INSIGHT,
    categoryLabel: '深度洞察',
    row_fields: ['Global Region', 'Brand', 'Ink Tank/ Ink Cartridge'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.INKTANK_PENETRATION, sourceField: 'units', label: '渗透率', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE],
    applicable_scenarios: ['墨仓市场渗透', '区域产品策略'],
  },
  {
    id: 'highend_channel_efficiency',
    name: '高端机型渠道效率',
    description: '分析高端机型在不同渠道的销售效率',
    category: TplCat.DEEP_INSIGHT,
    categoryLabel: '深度洞察',
    row_fields: ['Channel Group', 'Brand'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.HIGHEND_UNITS_PCT, sourceField: 'units', label: '高端占比', format: 'percent', decimalPlaces: 2 },
      { aggregation: AggType.CHANNEL_EFFICIENCY, sourceField: 'units', label: '渠道效率', format: 'ratio', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE],
    applicable_scenarios: ['高端渠道策略', 'TCO优化'],
  },
  {
    id: 'custom_multi_dimension',
    name: '自定义多维透视',
    description: '用户自定义维度组合进行深度分析',
    category: TplCat.DEEP_INSIGHT,
    categoryLabel: '深度洞察',
    row_fields: ['Year', 'Global Region', 'Product', 'Brand'],
    value_configs: [
      { aggregation: AggType.SUM_UNITS, sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 },
      { aggregation: AggType.SUM_VALUE, sourceField: 'value', label: '销售额', format: 'currency', decimalPlaces: 2 },
      { aggregation: AggType.MARKET_SHARE, sourceField: 'units', label: '份额', format: 'percent', decimalPlaces: 2 },
    ],
    recommended_views: [VType.TABLE, VType.BAR],
    applicable_scenarios: ['自定义分析', '专题研究'],
  },
]

// 兼容旧版本的模板数据
export const mockTemplates: TemplateItem[] = mockAdvancedTemplates.map((t) => ({
  id: t.id,
  name: t.name,
  description: t.description,
  row_fields: t.row_fields,
  col_field: t.col_field,
  value_field: t.value_configs[0]?.sourceField as any || 'units',
}))

// ==================== 全品类分析（激光+喷墨）====================

/**
 * 生成双品类KPI数据
 * 激光占比约58.5%，喷墨占比约41.5%
 */
export function getMockDualCategoryKPI(): DualCategoryKPIData {
  const combined_units = 45236789
  const combined_value = 12567.89

  // 激光数据：约58.5%销量，约72.3%销售额
  const laser_units = 26463350
  const laser_value = 9086.59

  // 喷墨数据：约41.5%销量，约27.7%销售额
  const inkjet_units = 18773439
  const inkjet_value = 3481.30

  return {
    laser: {
      product_type: 'laser',
      total_units: laser_units,
      total_value: laser_value,
      asp: Math.round((laser_value / laser_units) * 1000000),
      active_models: 1856,
      countries_covered: 45,
      units_yoy: 3.8,
      units_mom: -1.5,
      value_yoy: 2.5,
      value_mom: -0.8,
      current_period: '2025H1',
      previous_period: '2024H2',
      yoy_period: '2024H1',
    },
    inkjet: {
      product_type: 'inkjet',
      total_units: inkjet_units,
      total_value: inkjet_value,
      asp: Math.round((inkjet_value / inkjet_units) * 1000000),
      active_models: 1565,
      countries_covered: 45,
      units_yoy: 7.2,
      units_mom: -3.5,
      value_yoy: 5.8,
      value_mom: -2.5,
      current_period: '2025H1',
      previous_period: '2024H2',
      yoy_period: '2024H1',
    },
    combined: {
      total_units: combined_units,
      total_value: combined_value,
      asp: Math.round((combined_value / combined_units) * 1000000),
      active_models: 3421,
      countries_covered: 45,
      units_yoy: 5.2,
      units_mom: -2.3,
      value_yoy: 3.8,
      value_mom: -1.5,
      current_period: '2025H1',
      previous_period: '2024H2',
      yoy_period: '2024H1',
    },
    laser_share: {
      units_share: (laser_units / combined_units) * 100,
      value_share: (laser_value / combined_value) * 100,
    },
    inkjet_share: {
      units_share: (inkjet_units / combined_units) * 100,
      value_share: (inkjet_value / combined_value) * 100,
    },
  }
}

/**
 * 生成双品类趋势数据
 */
export function getMockDualCategoryTrend(): DualCategoryTrendData {
  const periods = ['2020H1', '2020H2', '2021H1', '2021H2', '2022H1', '2022H2', '2023H1', '2023H2', '2024H1', '2024H2', '2025H1']

  // 激光销量趋势
  const laser_units = [2250000, 2480000, 2400000, 2550000, 2380000, 2520000, 2450000, 2550000, 2500000, 2600000, 2500000]

  // 喷墨销量趋势
  const inkjet_units = [1600000, 1720000, 1700000, 1800000, 1670000, 1760000, 1700000, 1770000, 1750000, 1780000, 1700000]

  // 激光销售额趋势
  const laser_value = [620, 720, 680, 760, 650, 740, 700, 780, 750, 820, 780]

  // 喷墨销售额趋势
  const inkjet_value = [360, 400, 370, 420, 370, 410, 380, 420, 400, 430, 400]

  return {
    periods,
    laser_units,
    inkjet_units,
    laser_value,
    inkjet_value,
  }
}

/**
 * 生成品类品牌分布数据
 */
export function getMockCategoryBrandDistribution(): CategoryBrandDistribution {
  // 激光品牌分布
  const laser: CategoryBrandDistribution['laser'] = [
    { brand: 'HP', units: 8200000, value: 2280, asp: 278, share: 31.0 },
    { brand: 'Canon', units: 5800000, value: 1680, asp: 290, share: 21.9 },
    { brand: 'Brother', units: 3800000, value: 980, asp: 258, share: 14.4 },
    { brand: 'Samsung', units: 2200000, value: 620, asp: 282, share: 8.3 },
    { brand: 'Xerox', units: 1500000, value: 520, asp: 347, share: 5.7 },
    { brand: 'Ricoh', units: 1200000, value: 430, asp: 358, share: 4.5 },
    { brand: 'Lexmark', units: 950000, value: 330, asp: 347, share: 3.6 },
    { brand: 'Kyocera', units: 680000, value: 245, asp: 360, share: 2.6 },
    { brand: 'OKI', units: 420000, value: 135, share: 1.6, asp: 321 },
    { brand: '其他', units: 1207650, value: 366.59, asp: 304, share: 4.6 },
  ]

  // 喷墨品牌分布
  const inkjet: CategoryBrandDistribution['inkjet'] = [
    { brand: 'Epson', units: 5600000, value: 1500, asp: 268, share: 29.8 },
    { brand: 'HP', units: 4600000, value: 1200, asp: 261, share: 24.5 },
    { brand: 'Canon', units: 3400000, value: 920, asp: 271, share: 18.1 },
    { brand: 'Brother', units: 1800000, value: 470, asp: 261, share: 9.6 },
    { brand: 'Samsung', units: 1000000, value: 270, asp: 270, share: 5.3 },
    { brand: '其他', units: 2373439, value: 121.30, asp: 51, share: 12.6 },
  ]

  return { laser, inkjet }
}

/**
 * 生成高端机型分析数据
 */
export function getMockHighEndAnalysis(): HighEndAnalysisData {
  return {
    laser_high_end_units: 3200000,
    inkjet_high_end_units: 1850000,
    total_high_end_units: 5050000,
    laser_high_end_share: 12.1,
    inkjet_high_end_share: 9.9,
    laser_high_end_value: 1520,
    inkjet_high_end_value: 680,
    brand_ranking: [
      { brand: 'HP', units: 1450000, share: 28.7 },
      { brand: 'Canon', units: 980000, share: 19.4 },
      { brand: 'Epson', units: 720000, share: 14.3 },
      { brand: 'Xerox', units: 520000, share: 10.3 },
      { brand: 'Brother', units: 420000, share: 8.3 },
    ],
  }
}

/**
 * 生成高端机型列表
 */
export function getMockHighEndModels(productType?: ProductType): HighEndModel[] {
  const allModels: HighEndModel[] = [
    // 激光高端机型
    {
      model_key: 'Canon_i-SENSYS MF9630Cdn',
      brand: 'Canon',
      model_name: 'i-SENSYS MF9630Cdn',
      product_type: 'laser',
      units: 45000,
      value: 25.5,
      asp: 567,
      high_end_flags: {
        is_production: true,
        is_high_end_inkjet: false,
        production_class: 'Color Very Light Production',
        inkjet_class: null,
      },
    },
    {
      model_key: 'HP_LaserJet Enterprise Flow MFP M830z',
      brand: 'HP',
      model_name: 'LaserJet Enterprise Flow MFP M830z',
      product_type: 'laser',
      units: 38000,
      value: 28.5,
      asp: 750,
      high_end_flags: {
        is_production: true,
        is_high_end_inkjet: false,
        production_class: 'Color Very Light Production',
        inkjet_class: null,
      },
    },
    {
      model_key: 'Xerox_VersaLink C9000DT',
      brand: 'Xerox',
      model_name: 'VersaLink C9000DT',
      product_type: 'laser',
      units: 32000,
      value: 22.4,
      asp: 700,
      high_end_flags: {
        is_production: true,
        is_high_end_inkjet: false,
        production_class: 'Color Very Light Production',
        inkjet_class: null,
      },
    },
    // 喷墨高端机型
    {
      model_key: 'Epson_SureColor SC-T5700D',
      brand: 'Epson',
      model_name: 'SureColor SC-T5700D',
      product_type: 'inkjet',
      units: 28000,
      value: 18.2,
      asp: 650,
      high_end_flags: {
        is_production: false,
        is_high_end_inkjet: true,
        production_class: null,
        inkjet_class: '03: High-end',
      },
    },
    {
      model_key: 'HP_OfficeJet Enterprise Color MFP X585z',
      brand: 'HP',
      model_name: 'OfficeJet Enterprise Color MFP X585z',
      product_type: 'inkjet',
      units: 25000,
      value: 15.0,
      asp: 600,
      high_end_flags: {
        is_production: false,
        is_high_end_inkjet: true,
        production_class: null,
        inkjet_class: '03: High-end',
      },
    },
    {
      model_key: 'Canon imagePROGRAF TC-20',
      brand: 'Canon',
      model_name: 'imagePROGRAF TC-20',
      product_type: 'inkjet',
      units: 22000,
      value: 13.2,
      asp: 600,
      high_end_flags: {
        is_production: false,
        is_high_end_inkjet: true,
        production_class: null,
        inkjet_class: '03: High-end',
      },
    },
  ]

  if (productType === 'laser') {
    return allModels.filter(m => m.product_type === 'laser')
  }
  if (productType === 'inkjet') {
    return allModels.filter(m => m.product_type === 'inkjet')
  }
  return allModels
}
