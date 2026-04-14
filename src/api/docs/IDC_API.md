# IDC 市场探索模块 - 接口文档

> 更新时间: 2026-04-10
> 版本: v2.0

## 一、概述

本文档描述 IDC 市场探索模块的 API 接口规范。系统采用前后分离架构，前端使用 Vue 3 + TypeScript，后端提供 RESTful API，同时支持 Mock 数据进行前端开发调试。

### 1.1 基础信息

- **Base URL**: `/api/idc`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: Bearer Token (预留)

### 1.2 响应格式

所有接口返回统一的响应格式：

```typescript
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code?: string
    message?: string
  }
}
```

### 1.3 Mock 切换

开发环境下使用 Mock 数据，可通过修改 `src/api/idcApi.ts` 中的导入切换：

```typescript
// 使用 Mock API
import { idcMockApi as idcApi } from '@/api/idcMockApi'

// 使用真实 API
import { idcApi } from '@/api/idcApi'
```

---

## 二、统计量系统 (30个)

### 2.1 统计量分组

| 分组 | 数量 | 说明 |
|------|------|------|
| 基础聚合 | 10 | SUM/AVG/MAX/MIN/COUNT |
| 核心衍生 | 12 | ASP/份额/增长率等 |
| 高级分析 | 8 | CR5/成本估算等 |

### 2.2 统计量枚举

```typescript
enum AggregationType {
  // 基础聚合 (10个)
  SUM_UNITS = 'sum_units',           // 销量求和
  SUM_VALUE = 'sum_value',           // 销售额求和
  COUNT_ROWS = 'count_rows',         // 记录行数
  AVG_UNITS = 'avg_units',           // 销量平均值
  AVG_VALUE = 'avg_value',           // 销售额平均值
  MAX_UNITS = 'max_units',           // 销量最大值
  MAX_VALUE = 'max_value',           // 销售额最大值
  MIN_UNITS = 'min_units',           // 销量最小值
  MIN_VALUE = 'min_value',           // 销售额最小值
  COUNT_MODELS = 'count_models',     // 型号数量

  // 核心衍生 (12个)
  ASP = 'asp',                       // 平均单价
  MARKET_SHARE = 'market_share',     // 市场份额
  VALUE_SHARE = 'value_share',       // 销售额占比
  CATEGORY_UNITS_PCT = 'category_units_pct',  // 品类销量占比
  INKTANK_PENETRATION = 'inktank_penetration',  // 墨仓式渗透率
  FUNCTION_PENETRATION = 'function_penetration', // 功能普及率
  HIGHEND_UNITS_PCT = 'highend_units_pct',  // 高端机型占比
  A3_FORMAT_PCT = 'a3_format_pct',   // A3幅面占比
  MFP_PCT = 'mfp_pct',               // MFP占比
  YoY_GROWTH = 'yoy_growth',         // 同比增长率
  HoH_GROWTH = 'hoh_growth',         // 环比增长率
  CUMULATIVE_UNITS = 'cumulative_units',  // 累计销量

  // 高级分析 (8个)
  CR5_CONCENTRATION = 'cr5_concentration',  // 品牌集中度
  AVG_UNITS_PER_MODEL = 'avg_units_per_model',  // 单型号平均销量
  UNITS_PER_REGION = 'units_per_region',  // 单位区域销量
  CHANNEL_EFFICIENCY = 'channel_efficiency',  // 渠道效率
  SPEED_SEGMENT_COUNT = 'speed_segment_count',  // 速度段分布计数
  PRICE_SEGMENT_UNITS = 'price_segment_units',  // 价格段分布销量
  COST_PER_PAGE = 'cost_per_page',       // 单页耗材成本估算
  DEVIATION_FROM_AVG = 'deviation_from_avg',  // 与均值偏差
}
```

### 2.3 统计量定义接口

#### GET /api/idc/aggregations

获取所有统计量定义列表。

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "id": "sum_units",
      "name": "销量求和",
      "nameEn": "Total Units",
      "group": "basic_agg",
      "description": "计算选中维度的销量总和",
      "unit": "台",
      "format": "number",
      "decimalPlaces": 0,
      "sourceFields": ["units"],
      "calculateMethod": "SUM(units)"
    }
  ]
}
```

---

## 三、筛选接口

### 3.1 获取筛选选项

#### GET /api/idc/filters/options

获取所有可选的筛选值列表。

**响应示例:**

```json
{
  "success": true,
  "data": {
    "years": ["2020", "2021", "2022", "2023", "2024", "2025"],
    "half_years": ["H1", "H2"],
    "global_regions": [
      { "value": "Americas", "label": "美洲" },
      { "value": "EMEA", "label": "欧洲、中东、非洲" },
      { "value": "APJ", "label": "亚太地区" }
    ],
    "brands": [
      { "value": "HP", "label": "HP" },
      { "value": "Canon", "label": "Canon" }
    ]
  }
}
```

### 3.2 筛选条件

```typescript
interface FilterConditions {
  years?: string[]           // 年份
  half_years?: string[]      // 半年度
  global_regions?: string[]  // 全球区域
  regions?: string[]         // 区域
  countries?: string[]        // 国家
  brands?: string[]          // 品牌
  products?: string[]         // 产品类型
  ink_types?: string[]        // 耗材类型
  channels?: string[]         // 渠道
  // ... 更多筛选字段
  product_type?: 'all' | 'laser' | 'inkjet'  // 品类类型
}
```

---

## 四、透视表接口

### 4.1 简单透视查询

#### POST /api/idc/pivot/query

**请求参数:**

```typescript
interface PivotRequest {
  filters?: FilterConditions      // 筛选条件
  row_fields: string[]           // 行维度列表
  col_field?: string              // 列维度
  value_field: 'units' | 'value' | 'asp' | 'active_models'  // 值字段
  sort_field?: string             // 排序字段
  sort_order?: 'asc' | 'desc'    // 排序方向
  page?: number                  // 页码
  page_size?: number             // 每页条数
}
```

**请求示例:**

```json
{
  "row_fields": ["Brand", "Year"],
  "value_field": "units",
  "sort_field": "units",
  "sort_order": "desc",
  "page": 1,
  "page_size": 50
}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "headers": [["Brand"], ["Year"], ["Units"]],
    "rows": [
      ["HP", "2024", 13800000],
      ["HP", "2025", 13500000],
      ["Canon", "2024", 9200000]
    ],
    "totals": ["Total", "", 45000000],
    "total_count": 25,
    "page": 1,
    "page_size": 50
  }
}
```

### 4.2 高级透视查询 (支持30个统计量)

#### POST /api/idc/pivot/advanced

**请求参数:**

```typescript
interface AdvancedPivotRequest {
  filters?: FilterConditions
  row_fields: string[]                    // 行维度列表
  col_field?: string                      // 列维度
  value_fields: ValueFieldConfig[]        // 值字段配置列表
  sort_field?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
  include_totals?: boolean                // 包含汇总
  include_subtotals?: boolean             // 包含小计
  drilldown_enabled?: boolean             // 启用下钻
}

interface ValueFieldConfig {
  aggregation: AggregationType              // 聚合类型
  sourceField: string                     // 源字段
  label: string                           // 显示标签
  format: 'number' | 'percent' | 'currency' | 'ratio'
  decimalPlaces: number
}
```

**请求示例:**

```json
{
  "row_fields": ["Brand", "Year"],
  "value_fields": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "asp", "sourceField": "asp", "label": "ASP", "format": "currency", "decimalPlaces": 2 },
    { "aggregation": "market_share", "sourceField": "units", "label": "份额", "format": "percent", "decimalPlaces": 2 }
  ],
  "sort_field": "sum_units",
  "sort_order": "desc",
  "page": 1,
  "page_size": 50
}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "headers": [["Brand", "Year", "销量", "ASP", "份额"]],
    "rows": [
      { "Brand": "HP", "Year": "2024", "销量": 13800000, "ASP": 279.35, "份额": 30.5 }
    ],
    "totals": { "销量": 45000000, "ASP": 278.15, "份额": 100 },
    "grand_totals": { "销量": 45000000 },
    "total_count": 25,
    "aggregation_used": ["sum_units", "asp", "market_share"],
    "computation_time_ms": 156
  }
}
```

---

## 五、模板接口

### 5.1 获取模板列表

#### GET /api/idc/templates

**查询参数:**

- `category`: 模板分类 (可选)
- `keyword`: 搜索关键字 (可选)
- `page`: 页码 (可选)
- `page_size`: 每页条数 (可选)

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "id": "global_halfyear_trend",
      "name": "全球市场半年度趋势",
      "description": "分析全球打印机市场的半年度销量和销售额变化趋势",
      "category": "market_overview",
      "categoryLabel": "市场概览",
      "row_fields": ["Half Year"],
      "value_configs": [
        { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 }
      ],
      "recommended_views": ["line", "bar"]
    }
  ]
}
```

### 5.2 保存模板

#### POST /api/idc/templates

**请求参数:**

```typescript
interface SaveTemplateRequest {
  name: string
  description?: string
  category: TemplateCategory
  row_fields: string[]
  col_field?: string
  value_configs: ValueFieldConfig[]
  filters?: Partial<FilterConditions>
  share_status?: 'private' | 'team' | 'public'
}
```

### 5.3 更新模板

#### PUT /api/idc/templates/:id

### 5.4 删除模板

#### DELETE /api/idc/templates/:id

---

## 六、配置验证接口

### 6.1 验证透视表配置

#### POST /api/idc/pivot/validate

在执行查询前验证配置的有效性。

**请求参数:**

```typescript
interface ValidateConfigRequest {
  row_fields: string[]
  col_field?: string
  value_configs: ValueFieldConfig[]
  filters?: Partial<FilterConditions>
}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "conflicts": [],
    "warnings": ["数据跨度较大，建议设置筛选条件"],
    "recommendations": [
      {
        "type": "view",
        "priority": 8,
        "title": "推荐使用折线图",
        "description": "时间序列数据适合使用折线图展示趋势",
        "confidence": 0.85,
        "reason": "检测到时间维度，建议使用趋势图",
        "suggested_view": "line"
      }
    ],
    "dataQuality": {
      "estimatedRows": 150,
      "dataSparsity": 5,
      "confidence": 0.92
    }
  }
}
```

---

## 七、导出接口

### 7.1 通用导出

#### POST /api/idc/export

**请求参数:**

```typescript
interface ExportRequest {
  filters?: FilterConditions
  export_type: 'current_view' | 'raw_data' | 'excel_with_format' | 'csv_utf8'
  format?: 'csv' | 'excel'
  params?: {
    filename?: string
    include_totals?: boolean
    include_header?: boolean
    encoding?: 'utf-8' | 'gbk'
  }
}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "task_id": "export_1712659200000",
    "status": "completed",
    "download_url": "/api/idc/export/download/export_1712659200000.csv",
    "message": "导出成功"
  }
}
```

### 7.2 前端导出 (Mock)

在前端 Mock 模式下，提供以下导出函数：

```typescript
// 导出 CSV
idcApi.exportToCSV(data, filename)

// 导出 Excel
idcApi.exportToExcel(data, filename, sheetName)
```

---

## 八、视图类型

### 8.1 视图类型枚举

```typescript
enum ViewType {
  TABLE = 'table',     // 表格视图
  BAR = 'bar',         // 柱状图
  LINE = 'line',      // 折线图
  PIE = 'pie',        // 饼图
  HEATMAP = 'heatmap', // 热力图
}
```

### 8.2 视图配置

```typescript
interface ViewConfig {
  type: ViewType
  title?: string
  // 柱状图
  barType?: 'stacked' | 'grouped' | 'stacked_percent'
  showDataLabel?: boolean
  showLegend?: boolean
  // 折线图
  smooth?: boolean
  showArea?: boolean
  showSymbol?: boolean
  // 饼图
  pieType?: 'pie' | 'ring'
  showPercent?: boolean
  // 热力图
  heatmapColorScheme?: string
  showValues?: boolean
}
```

---

## 九、数据字段

### 9.1 维度字段

| 字段名 | 中文名 | 说明 |
|--------|--------|------|
| Year | 年份 | 2020-2025 |
| Half Year | 半年度 | H1/H2 |
| Global Region | 全球区域 | Americas/EMEA/APJ |
| Region | 区域 | 细分区域 |
| Country | 国家 | 国家代码 |
| Brand | 品牌 | HP/Canon/Epson... |
| Product | 产品类型 | Laser Printer/Inkjet... |
| Format | 幅面 | A4/A3/Letter |
| Speed Range A4 | 速度段 A4 | <20ppm/20-40ppm... |
| Ink Tank/ Ink Cartridge | 耗材类型 | Ink Tank/Ink Cartridge |
| Channel | 渠道 | Dealer/VAR/SI... |
| Channel Group | 渠道组 | Online/Offline |

### 9.2 度量字段

| 字段名 | 中文名 | 说明 |
|--------|--------|------|
| units | 销量 | 台数 |
| value | 销售额 | USD Million |
| asp | 平均单价 | USD |

---

## 十、错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 无效的筛选条件 |
| 1002 | 维度字段不存在 |
| 1003 | 统计量类型不支持 |
| 1004 | 数据量超限 |
| 1005 | 导出失败 |
| 2001 | 模板不存在 |
| 2002 | 模板保存失败 |
| 2003 | 权限不足 |

---

## 附录

### A. Mock 数据

Mock 数据定义在 `src/api/idcMockData.ts` 中，包含：

- 30 个统计量定义
- 26 个高级模板
- 完整的筛选选项数据
- 模拟的查询响应数据

### B. API 调用示例

```typescript
import { idcMockApi as idcApi } from '@/api/idcMockApi'

// 1. 获取筛选选项
const filterRes = await idcApi.getFilterOptions()

// 2. 获取模板列表
const templateRes = await idcApi.getAdvancedTemplates()

// 3. 验证配置
const validateRes = await idcApi.validatePivotConfig({
  row_fields: ['Brand', 'Year'],
  value_configs: [
    { aggregation: 'sum_units', sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 }
  ]
})

// 4. 执行查询
const pivotRes = await idcApi.queryAdvancedPivot({
  row_fields: ['Brand', 'Year'],
  value_configs: [
    { aggregation: 'sum_units', sourceField: 'units', label: '销量', format: 'number', decimalPlaces: 0 }
  ],
  page: 1,
  page_size: 50
})

// 5. 导出数据
idcApi.exportToCSV(pivotRes.data?.rows || [], 'IDC_Report')
```

### C. 组件使用

```vue
<template>
  <div class="idc-explore">
    <FieldPool @field-select="handleFieldSelect" />
    <ConfigCanvas @apply="handleApply" />
    <ResultView :data="pivotData" />
    <SmartAssistant
      :conflicts="conflicts"
      :recommendations="recommendations"
    />
    <TemplateManager @apply="handleApplyTemplate" />
    <ExportModal />
  </div>
</template>
```

---

*文档更新时间: 2026-04-10*
