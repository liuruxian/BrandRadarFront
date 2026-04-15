# IDC 未实现接口清单

> 生成时间：2026-04-15
> 交付对象：后端开发团队
> 文档用途：明确 IDC 模块中后端尚未实现的接口

---

## 一、概述

本文档列出 IDC 市场分析模块中**前端已定义但后端尚未实现或路径不一致**的接口。

### 1.1 状态说明

| 状态 | 说明 |
|------|------|
| ❌ 未实现 | 后端尚未提供该接口 |
| ⚠️ 路径不一致 | 接口存在但路由路径不同 |
| ⚠️ 字段缺失 | 接口存在但返回字段不完整 |

---

## 二、路径不一致的接口

> 以下接口前端调用路径与后端实现方案中的路径不匹配

### 2.1 双品类 KPI 查询

| 对比项 | 前端调用路径 | 后端实现路径 |
|--------|-------------|-------------|
| **状态** | ⚠️ 路径不一致 | `GET /api/idc/dual/kpi` |

**前端期望路径**:
```
GET /api/idc/overview/kpi/dual_category
```

**后端实现路径**:
```
GET /api/idc/dual/kpi
```

**建议方案**：后端同时实现两个路径，或统一使用 `/api/idc/dual/kpi`

---

### 2.2 双品类趋势查询

| 对比项 | 前端调用路径 | 后端实现路径 |
|--------|-------------|-------------|
| **状态** | ⚠️ 路径不一致 | `GET /api/idc/dual/trend` |

**前端期望路径**:
```
GET /api/idc/overview/trend/dual_category
```

**后端实现路径**:
```
GET /api/idc/dual/trend
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `trend_type` | string | 是 | 趋势类型: dual_axis / region_stacked / brand_share |
| `filters` | string | 否 | 筛选条件 JSON |
| `top_n` | number | 否 | 品牌数量，默认10 |

---

### 2.3 品类品牌分布

| 对比项 | 前端调用路径 | 后端实现路径 |
|--------|-------------|-------------|
| **状态** | ⚠️ 路径不一致 | `GET /api/idc/dual/brand` |

**前端期望路径**:
```
GET /api/idc/overview/brand/category_distribution
```

**后端实现路径**:
```
GET /api/idc/dual/brand
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `top_n` | number | 否 | 返回Top N品牌，默认10 |
| `filters` | string | 否 | 筛选条件 JSON |

**响应格式**:
```json
{
  "success": true,
  "data": {
    "laser": [
      {
        "brand": "HP",
        "units": 8500000,
        "value": 2550,
        "asp": 300,
        "share": 34.7
      }
    ],
    "inkjet": [
      {
        "brand": "Epson",
        "units": 6200000,
        "value": 1650,
        "asp": 266,
        "share": 38.8
      }
    ]
  }
}
```

---

## 三、前端需要但后端未提供的接口

> 以下接口在前端 `idcApi.ts` 中已定义，但后端实现方案中未包含

### 3.1 高级模板列表

| 状态 | 接口路径 | 方法 |
|------|----------|------|
| ❌ 未实现（路径确认中） | `/api/idc/templates/advanced` | GET |

**功能**: 获取 26 个高级分析预置模板

**前端调用**:
```typescript
// idcApi.ts
export async function getAdvancedTemplates(): Promise<AdvancedTemplatesResponse> {
  return request(client.get<AdvancedTemplatesResponse>('/idc/templates/advanced'))
}
```

**响应格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": "brand-region-matrix",
      "name": "品牌-区域矩阵",
      "description": "按品牌和区域交叉分析销量",
      "category": "market_overview",
      "categoryLabel": "市场概览",
      "row_fields": ["Brand", "Region"],
      "col_field": "Half Year",
      "value_configs": [
        {
          "aggregation": "sum_units",
          "sourceField": "units",
          "label": "销量",
          "format": "number",
          "decimalPlaces": 0
        }
      ],
      "suggested_filters": {
        "product_type": "all"
      },
      "is_system": true,
      "is_public": true
    }
  ]
}
```

---

### 3.2 我的模板列表

| 状态 | 接口路径 | 方法 |
|------|----------|------|
| ❌ 未实现 | `/api/idc/templates/my` | GET |

**功能**: 获取当前用户保存的自定义模板

**前端调用**:
```typescript
export async function getMyTemplates(): Promise<MyTemplatesResponse> {
  return request(client.get<MyTemplatesResponse>('/idc/templates/my'))
}
```

**响应格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": "custom_1712345678901",
      "name": "我的自定义模板",
      "description": "",
      "category": "market_overview",
      "categoryLabel": "市场概览",
      "row_fields": [{ "value": "Brand", "label": "品牌" }],
      "col_field": { "value": "Half Year", "label": "半年度" },
      "value_configs": [],
      "user_id": "user_123",
      "created_at": "2025-04-10T12:00:00Z",
      "updated_at": "2025-04-10T12:00:00Z",
      "share_status": "private",
      "version": 1
    }
  ]
}
```

---

### 3.3 保存模板

| 状态 | 接口路径 | 方法 |
|------|----------|------|
| ❌ 未实现 | `/api/idc/templates` | POST |

**功能**: 保存用户自定义模板

**前端调用**:
```typescript
export async function saveTemplate(body: SaveTemplateRequest): Promise<MyTemplatesResponse> {
  return request(client.post<MyTemplatesResponse>('/idc/templates', body))
}
```

**请求体**:
```json
{
  "name": "新品类分析",
  "description": "按产品类型分析",
  "category": "market_overview",
  "row_fields": [{ "value": "Product", "label": "产品" }],
  "col_field": { "value": "Year", "label": "年份" },
  "value_configs": [
    {
      "aggregation": "sum_units",
      "sourceField": "units",
      "label": "销量",
      "format": "number",
      "decimalPlaces": 0
    }
  ],
  "filters": {
    "product_type": "all"
  },
  "share_status": "private"
}
```

---

### 3.4 更新模板

| 状态 | 接口路径 | 方法 |
|------|----------|------|
| ❌ 未实现 | `/api/idc/templates/{id}` | PUT |

**功能**: 更新用户自定义模板

**前端调用**:
```typescript
export async function updateTemplate(id: string, body: UpdateTemplateRequest): Promise<MyTemplatesResponse> {
  return request(client.put<MyTemplatesResponse>(`/idc/templates/${id}`, body))
}
```

**请求体**:
```json
{
  "name": "更新后的模板名称",
  "description": "更新后的描述",
  "category": "market_overview",
  "row_fields": [{ "value": "Brand", "label": "品牌" }],
  "col_field": { "value": "Year", "label": "年份" },
  "value_configs": [],
  "filters": {},
  "share_status": "team",
  "version": 1
}
```

---

### 3.5 删除模板

| 状态 | 接口路径 | 方法 |
|------|----------|------|
| ❌ 未实现 | `/api/idc/templates/{id}` | DELETE |

**功能**: 删除用户自定义模板

**前端调用**:
```typescript
export async function deleteTemplate(id: string): Promise<{ success: boolean }> {
  return request(client.delete<{ success: boolean }>(`/idc/templates/${id}`))
}
```

**响应**:
```json
{
  "success": true
}
```

---

### 3.6 复制模板

| 状态 | 接口路径 | 方法 |
|------|----------|------|
| ❌ 未实现 | `/api/idc/templates/{id}/clone` | POST |

**功能**: 复制已有模板创建新模板

**前端调用**:
```typescript
export async function cloneTemplate(id: string, newName: string): Promise<MyTemplatesResponse> {
  return request(client.post<MyTemplatesResponse>(`/idc/templates/${id}/clone`, { name: newName }))
}
```

**请求体**:
```json
{
  "name": "品牌区域分析-副本"
}
```

---

## 四、统计量相关接口

### 4.1 获取统计量定义

| 状态 | 接口路径 | 方法 |
|------|----------|------|
| ❌ 未实现 | `/api/idc/aggregations/definitions` | GET |

**功能**: 获取所有可用统计量的定义（硬编码返回）

**前端调用**:
```typescript
export async function getAggregationDefinitions() {
  return request(client.get('/idc/aggregations/definitions'))
}
```

**响应格式**:
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

**完整24个统计量定义数据**（硬编码）:

```json
[
  // ====== 基础聚合函数 (10个) ======
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
  },
  {
    "id": "sum_value",
    "name": "销售额求和",
    "nameEn": "Total Value",
    "group": "basic_agg",
    "description": "计算选中维度的销售额总和",
    "unit": "USD M",
    "format": "currency",
    "decimalPlaces": 2,
    "sourceFields": ["value"],
    "calculateMethod": "SUM(value)"
  },
  {
    "id": "count_rows",
    "name": "记录行数",
    "nameEn": "Row Count",
    "group": "basic_agg",
    "description": "统计记录行数",
    "format": "number",
    "decimalPlaces": 0,
    "sourceFields": [],
    "calculateMethod": "COUNT(*)"
  },
  {
    "id": "avg_units",
    "name": "销量平均值",
    "nameEn": "Avg Units",
    "group": "basic_agg",
    "description": "计算选中维度的平均销量",
    "unit": "台",
    "format": "number",
    "decimalPlaces": 0,
    "sourceFields": ["units"],
    "calculateMethod": "AVG(units)"
  },
  {
    "id": "avg_value",
    "name": "销售额平均值",
    "nameEn": "Avg Value",
    "group": "basic_agg",
    "description": "计算选中维度的平均销售额",
    "unit": "USD M",
    "format": "currency",
    "decimalPlaces": 2,
    "sourceFields": ["value"],
    "calculateMethod": "AVG(value)"
  },
  {
    "id": "max_units",
    "name": "销量最大值",
    "nameEn": "Max Units",
    "group": "basic_agg",
    "description": "计算选中维度的最大销量",
    "unit": "台",
    "format": "number",
    "decimalPlaces": 0,
    "sourceFields": ["units"],
    "calculateMethod": "MAX(units)"
  },
  {
    "id": "max_value",
    "name": "销售额最大值",
    "nameEn": "Max Value",
    "group": "basic_agg",
    "description": "计算选中维度的最大销售额",
    "unit": "USD M",
    "format": "currency",
    "decimalPlaces": 2,
    "sourceFields": ["value"],
    "calculateMethod": "MAX(value)"
  },
  {
    "id": "min_units",
    "name": "销量最小值",
    "nameEn": "Min Units",
    "group": "basic_agg",
    "description": "计算选中维度的最小销量",
    "unit": "台",
    "format": "number",
    "decimalPlaces": 0,
    "sourceFields": ["units"],
    "calculateMethod": "MIN(units)"
  },
  {
    "id": "min_value",
    "name": "销售额最小值",
    "nameEn": "Min Value",
    "group": "basic_agg",
    "description": "计算选中维度的最小销售额",
    "unit": "USD M",
    "format": "currency",
    "decimalPlaces": 2,
    "sourceFields": ["value"],
    "calculateMethod": "MIN(value)"
  },
  {
    "id": "count_models",
    "name": "型号数量",
    "nameEn": "Model Count",
    "group": "basic_agg",
    "description": "统计型号数量",
    "format": "number",
    "decimalPlaces": 0,
    "sourceFields": ["model_name"],
    "calculateMethod": "COUNT(DISTINCT model_name)"
  },

  // ====== 核心衍生统计 (11个) ======
  {
    "id": "asp",
    "name": "平均单价 (ASP)",
    "nameEn": "Average Selling Price",
    "group": "core_derived",
    "description": "销售额/销量计算平均单价",
    "unit": "USD",
    "format": "currency",
    "decimalPlaces": 2,
    "sourceFields": ["units", "value"],
    "calculateMethod": "SUM(value) / SUM(units) * 1000000"
  },
  {
    "id": "market_share",
    "name": "市场份额",
    "nameEn": "Market Share",
    "group": "core_derived",
    "description": "销量占总销量的百分比",
    "format": "percent",
    "decimalPlaces": 2,
    "sourceFields": ["units"],
    "calculateMethod": "SUM(units) / TOTAL_SUM(units) * 100"
  },
  {
    "id": "value_share",
    "name": "销售额占比",
    "nameEn": "Value Share",
    "group": "core_derived",
    "description": "销售额占总销售额的百分比",
    "format": "percent",
    "decimalPlaces": 2,
    "sourceFields": ["value"],
    "calculateMethod": "SUM(value) / TOTAL_SUM(value) * 100"
  },
  {
    "id": "category_units_pct",
    "name": "品类销量占比",
    "nameEn": "Category Units %",
    "group": "core_derived",
    "description": "该品类销量占全品类销量的比例",
    "format": "percent",
    "decimalPlaces": 2,
    "sourceFields": ["units", "product_category"],
    "calculateMethod": "CATEGORY_SUM(units) / TOTAL_SUM(units) * 100"
  },
  {
    "id": "inktank_penetration",
    "name": "墨仓式渗透率",
    "nameEn": "Ink Tank Penetration",
    "group": "core_derived",
    "description": "墨仓式产品销量占喷墨总销量的比例",
    "format": "percent",
    "decimalPlaces": 2,
    "sourceFields": ["units", "ink_types"],
    "calculateMethod": "INK_TANK_UNITS / TOTAL_INKJET_UNITS * 100"
  },
  {
    "id": "function_penetration",
    "name": "功能普及率",
    "nameEn": "Function Penetration",
    "group": "core_derived",
    "description": "某功能（如ADF/Wifi）的普及程度",
    "format": "percent",
    "decimalPlaces": 2,
    "sourceFields": ["units", "function_fields"],
    "calculateMethod": "FUNCTION_YES_UNITS / TOTAL_UNITS * 100"
  },
  {
    "id": "a3_format_pct",
    "name": "A3幅面占比",
    "nameEn": "A3 Format %",
    "group": "core_derived",
    "description": "A3幅面产品销量占比",
    "format": "percent",
    "decimalPlaces": 2,
    "sourceFields": ["units", "format"],
    "calculateMethod": "A3_UNITS / TOTAL_UNITS * 100"
  },
  {
    "id": "mfp_pct",
    "name": "MFP占比",
    "nameEn": "MFP %",
    "group": "core_derived",
    "description": "多功能一体机销量占总销量的比例",
    "format": "percent",
    "decimalPlaces": 2,
    "sourceFields": ["units", "product_category"],
    "calculateMethod": "MFP_UNITS / TOTAL_UNITS * 100"
  },
  {
    "id": "yoy_growth",
    "name": "同比增长率 (YoY)",
    "nameEn": "Year-over-Year Growth",
    "group": "core_derived",
    "description": "与去年同期的销量增长率",
    "format": "percent",
    "decimalPlaces": 2,
    "sourceFields": ["units", "year"],
    "calculateMethod": "(CURRENT_UNITS - PREVIOUS_YEAR_UNITS) / PREVIOUS_YEAR_UNITS * 100"
  },
  {
    "id": "hoh_growth",
    "name": "环比增长率 (HoH)",
    "nameEn": "Half-over-Half Growth",
    "group": "core_derived",
    "description": "与上期的销量增长率",
    "format": "percent",
    "decimalPlaces": 2,
    "sourceFields": ["units", "half_year"],
    "calculateMethod": "(CURRENT_UNITS - PREVIOUS_PERIOD_UNITS) / PREVIOUS_PERIOD_UNITS * 100"
  },
  {
    "id": "cumulative_units",
    "name": "累计销量",
    "nameEn": "Cumulative Units",
    "group": "core_derived",
    "description": "从起始期到当前期的累计销量",
    "unit": "台",
    "format": "number",
    "decimalPlaces": 0,
    "sourceFields": ["units"],
    "calculateMethod": "SUM(units) OVER (ORDER BY period)"
  },

  // ====== 高级分析统计 (6个) ======
  {
    "id": "cr5_concentration",
    "name": "品牌集中度 (CR5)",
    "nameEn": "CR5 Concentration",
    "group": "advanced_analysis",
    "description": "前5大品牌销量占总销量的比例",
    "format": "percent",
    "decimalPlaces": 2,
    "sourceFields": ["units", "brand"],
    "calculateMethod": "TOP5_SUM(units) / TOTAL_SUM(units) * 100"
  },
  {
    "id": "avg_units_per_model",
    "name": "单型号平均销量",
    "nameEn": "Avg Units per Model",
    "group": "advanced_analysis",
    "description": "每个型号的平均销量",
    "unit": "台/型号",
    "format": "number",
    "decimalPlaces": 0,
    "sourceFields": ["units", "model_name"],
    "calculateMethod": "SUM(units) / COUNT(DISTINCT model_name)"
  },
  {
    "id": "channel_efficiency",
    "name": "渠道效率",
    "nameEn": "Channel Efficiency",
    "group": "advanced_analysis",
    "description": "各渠道销量/型号数的比值",
    "unit": "台/型号",
    "format": "ratio",
    "decimalPlaces": 2,
    "sourceFields": ["units", "channel", "model_name"],
    "calculateMethod": "CHANNEL_UNITS / CHANNEL_MODELS"
  },
  {
    "id": "speed_segment_count",
    "name": "速度段分布计数",
    "nameEn": "Speed Segment Count",
    "group": "advanced_analysis",
    "description": "各速度段的产品型号数量",
    "format": "number",
    "decimalPlaces": 0,
    "sourceFields": ["speed_range_a4", "model_name"],
    "calculateMethod": "COUNT(DISTINCT model_name) BY speed_range"
  },
  {
    "id": "price_segment_units",
    "name": "价格段分布销量",
    "nameEn": "Price Segment Units",
    "group": "advanced_analysis",
    "description": "各价格段的总销量",
    "unit": "台",
    "format": "number",
    "decimalPlaces": 0,
    "sourceFields": ["units", "asp"],
    "calculateMethod": "SUM(units) BY price_segment"
  },
  {
    "id": "deviation_from_avg",
    "name": "与均值偏差",
    "nameEn": "Deviation from Average",
    "group": "advanced_analysis",
    "description": "当前值与平均值的偏差百分比",
    "format": "percent",
    "decimalPlaces": 2,
    "sourceFields": ["units", "avg_units"],
    "calculateMethod": "(value - AVG(value)) / AVG(value) * 100"
  }
]
```

---

### 4.2 获取统计量选项

| 状态 | 接口路径 | 方法 |
|------|----------|------|
| ❌ 未实现 | `/api/idc/aggregations/options` | GET |

**功能**: 获取统计量选项（用于 UI 下拉选择）

**响应格式**:
```json
{
  "success": true,
  "data": [
    {
      "value": "sum_units",
      "label": "销量求和",
      "group": "basic_agg",
      "groupLabel": "基础聚合",
      "description": "计算选中维度的销量总和",
      "format": "number"
    }
  ]
}
```

**完整数据**（复用上面的24个定义，映射格式）:

```json
[
  { "value": "sum_units", "label": "销量求和", "group": "basic_agg", "groupLabel": "基础聚合", "description": "计算选中维度的销量总和", "format": "number" },
  { "value": "sum_value", "label": "销售额求和", "group": "basic_agg", "groupLabel": "基础聚合", "description": "计算选中维度的销售额总和", "format": "currency" },
  { "value": "count_rows", "label": "记录行数", "group": "basic_agg", "groupLabel": "基础聚合", "description": "统计记录行数", "format": "number" },
  { "value": "avg_units", "label": "销量平均值", "group": "basic_agg", "groupLabel": "基础聚合", "description": "计算选中维度的平均销量", "format": "number" },
  { "value": "avg_value", "label": "销售额平均值", "group": "basic_agg", "groupLabel": "基础聚合", "description": "计算选中维度的平均销售额", "format": "currency" },
  { "value": "max_units", "label": "销量最大值", "group": "basic_agg", "groupLabel": "基础聚合", "description": "计算选中维度的最大销量", "format": "number" },
  { "value": "max_value", "label": "销售额最大值", "group": "basic_agg", "groupLabel": "基础聚合", "description": "计算选中维度的最大销售额", "format": "currency" },
  { "value": "min_units", "label": "销量最小值", "group": "basic_agg", "groupLabel": "基础聚合", "description": "计算选中维度的最小销量", "format": "number" },
  { "value": "min_value", "label": "销售额最小值", "group": "basic_agg", "groupLabel": "基础聚合", "description": "计算选中维度的最小销售额", "format": "currency" },
  { "value": "count_models", "label": "型号数量", "group": "basic_agg", "groupLabel": "基础聚合", "description": "统计型号数量", "format": "number" },
  { "value": "asp", "label": "平均单价 (ASP)", "group": "core_derived", "groupLabel": "核心衍生", "description": "销售额/销量计算平均单价", "format": "currency" },
  { "value": "market_share", "label": "市场份额", "group": "core_derived", "groupLabel": "核心衍生", "description": "销量占总销量的百分比", "format": "percent" },
  { "value": "value_share", "label": "销售额占比", "group": "core_derived", "groupLabel": "核心衍生", "description": "销售额占总销售额的百分比", "format": "percent" },
  { "value": "category_units_pct", "label": "品类销量占比", "group": "core_derived", "groupLabel": "核心衍生", "description": "该品类销量占全品类销量的比例", "format": "percent" },
  { "value": "inktank_penetration", "label": "墨仓式渗透率", "group": "core_derived", "groupLabel": "核心衍生", "description": "墨仓式产品销量占喷墨总销量的比例", "format": "percent" },
  { "value": "function_penetration", "label": "功能普及率", "group": "core_derived", "groupLabel": "核心衍生", "description": "某功能的普及程度", "format": "percent" },
  { "value": "a3_format_pct", "label": "A3幅面占比", "group": "core_derived", "groupLabel": "核心衍生", "description": "A3幅面产品销量占比", "format": "percent" },
  { "value": "mfp_pct", "label": "MFP占比", "group": "core_derived", "groupLabel": "核心衍生", "description": "多功能一体机销量占总销量的比例", "format": "percent" },
  { "value": "yoy_growth", "label": "同比增长率 (YoY)", "group": "core_derived", "groupLabel": "核心衍生", "description": "与去年同期的销量增长率", "format": "percent" },
  { "value": "hoh_growth", "label": "环比增长率 (HoH)", "group": "core_derived", "groupLabel": "核心衍生", "description": "与上期的销量增长率", "format": "percent" },
  { "value": "cumulative_units", "label": "累计销量", "group": "core_derived", "groupLabel": "核心衍生", "description": "从起始期到当前期的累计销量", "format": "number" },
  { "value": "cr5_concentration", "label": "品牌集中度 (CR5)", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "前5大品牌销量占总销量的比例", "format": "percent" },
  { "value": "avg_units_per_model", "label": "单型号平均销量", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "每个型号的平均销量", "format": "number" },
  { "value": "channel_efficiency", "label": "渠道效率", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "各渠道销量/型号数的比值", "format": "ratio" },
  { "value": "speed_segment_count", "label": "速度段分布计数", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "各速度段的产品型号数量", "format": "number" },
  { "value": "price_segment_units", "label": "价格段分布销量", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "各价格段的总销量", "format": "number" },
  { "value": "deviation_from_avg", "label": "与均值偏差", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "当前值与平均值的偏差百分比", "format": "percent" }
]
```

---

### 4.3 获取默认统计量配置

| 状态 | 接口路径 | 方法 |
|------|----------|------|
| ❌ 未实现 | `/api/idc/aggregations/defaults` | GET |

**功能**: 获取默认选中的4个统计量配置

**响应格式**:
```json
{
  "success": true,
  "data": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "sum_value", "sourceField": "value", "label": "销售额", "format": "currency", "decimalPlaces": 2 },
    { "aggregation": "asp", "sourceField": "asp", "label": "ASP", "format": "currency", "decimalPlaces": 2 },
    { "aggregation": "market_share", "sourceField": "units", "label": "份额", "format": "percent", "decimalPlaces": 2 }
  ]
}
```

---

## 五、数据类型定义

### 5.1 模板保存请求 (SaveTemplateRequest)

```typescript
interface SaveTemplateRequest {
  name: string
  description?: string
  category: TemplateCategory
  row_fields: PivotDimension[]
  col_field?: PivotDimension
  value_configs: ValueFieldConfig[]
  filters?: Partial<FilterConditions>
  share_status?: 'private' | 'team' | 'public'
}
```

### 5.2 模板更新请求 (UpdateTemplateRequest)

```typescript
interface UpdateTemplateRequest extends SaveTemplateRequest {
  id: string
  version?: number  // 用于乐观锁
}
```

### 5.3 统计量配置 (ValueFieldConfig)

```typescript
interface ValueFieldConfig {
  aggregation: AggregationType
  sourceField: string
  label: string
  format: 'number' | 'percent' | 'currency' | 'ratio'
  decimalPlaces: number
}
```

### 5.4 统计量枚举 (AggregationType)

```typescript
enum AggregationType {
  SUM_UNITS = 'sum_units',
  SUM_VALUE = 'sum_value',
  COUNT_ROWS = 'count_rows',
  AVG_UNITS = 'avg_units',
  AVG_VALUE = 'avg_value',
  MAX_UNITS = 'max_units',
  MAX_VALUE = 'max_value',
  MIN_UNITS = 'min_units',
  MIN_VALUE = 'min_value',
  COUNT_MODELS = 'count_models',
  ASP = 'asp',
  MARKET_SHARE = 'market_share',
  VALUE_SHARE = 'value_share',
  CATEGORY_UNITS_PCT = 'category_units_pct',
  INKTANK_PENETRATION = 'inktank_penetration',
  FUNCTION_PENETRATION = 'function_penetration',
  HIGHEND_UNITS_PCT = 'highend_units_pct',
  A3_FORMAT_PCT = 'a3_format_pct',
  MFP_PCT = 'mfp_pct',
  YoY_GROWTH = 'yoy_growth',
  HoH_GROWTH = 'hoh_growth',
  CUMULATIVE_UNITS = 'cumulative_units',
  CR5_CONCENTRATION = 'cr5_concentration',
  AVG_UNITS_PER_MODEL = 'avg_units_per_model',
  CHANNEL_EFFICIENCY = 'channel_efficiency',
  SPEED_SEGMENT_COUNT = 'speed_segment_count',
  PRICE_SEGMENT_UNITS = 'price_segment_units',
  DEVIATION_FROM_AVG = 'deviation_from_avg',
}
```

---

## 六、汇总表

| 序号 | 接口 | 方法 | 状态 | 说明 |
|------|------|------|------|------|
| 1 | `/api/idc/overview/kpi/dual_category` | GET | ⚠️ 路径不一致 | 建议使用 `/api/idc/dual/kpi` |
| 2 | `/api/idc/overview/trend/dual_category` | GET | ⚠️ 路径不一致 | 建议使用 `/api/idc/dual/trend` |
| 3 | `/api/idc/overview/brand/category_distribution` | GET | ⚠️ 路径不一致 | 建议使用 `/api/idc/dual/brand` |
| 4 | `/api/idc/templates/advanced` | GET | ❌ 未实现 | 获取高级预置模板 |
| 5 | `/api/idc/templates/my` | GET | ❌ 未实现 | 获取用户自定义模板 |
| 6 | `/api/idc/templates` | POST | ❌ 未实现 | 保存新模板 |
| 7 | `/api/idc/templates/{id}` | PUT | ❌ 未实现 | 更新模板 |
| 8 | `/api/idc/templates/{id}` | DELETE | ❌ 未实现 | 删除模板 |
| 9 | `/api/idc/templates/{id}/clone` | POST | ❌ 未实现 | 复制模板 |
| 10 | `/api/idc/aggregations/definitions` | GET | ❌ 未实现 | 统计量定义列表 |
| 11 | `/api/idc/aggregations/options` | GET | ❌ 未实现 | 统计量选项 |
| 12 | `/api/idc/aggregations/defaults` | GET | ❌ 未实现 | 默认统计量配置 |

---

## 七、建议实施方案

### 7.1 路径统一方案

建议后端同时支持以下两套路径，保证前端兼容性：

```python
# 双品类KPI
@router.get("/idc/overview/kpi/dual_category")
@router.get("/idc/dual/kpi")  # 别名

# 双品类趋势
@router.get("/idc/overview/trend/dual_category")
@router.get("/idc/dual/trend")  # 别名

# 品类品牌分布
@router.get("/idc/overview/brand/category_distribution")
@router.get("/idc/dual/brand")  # 别名
```

### 7.2 模板管理表结构建议

```sql
CREATE TABLE idc_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    row_fields JSON,
    col_field JSON,
    value_configs JSON,
    filters JSON,
    user_id VARCHAR(50),
    share_status VARCHAR(20) DEFAULT 'private',
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 7.3 开发优先级

| 优先级 | 接口 | 说明 |
|--------|------|------|
| 🔴 高 | `/api/idc/templates/*` | 模板管理是市场探索页核心功能 |
| 🔴 高 | `/api/idc/dual/*` | 双品类分析是总览页核心功能 |
| 🟡 中 | `/api/idc/aggregations/*` | 统计量辅助接口 |

---

*文档结束*
