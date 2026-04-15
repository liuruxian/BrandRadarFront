# IDC 市场探索模块 - 后端接口文档

> 生成时间：2026-04-15
> 供前端团队确认接口可行性
> 后端代码位置：`api/routers/` 下各路由文件

---

## 一、双品类分析接口

### 1.1 双品类 KPI 查询

**接口路径**：`GET /api/idc/overview/kpi/dual_category`

**权限**：需 `dashboard:read` 权限

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| years | string[] | 否 | 年份筛选，如 `["2024", "2025"]` |
| half_years | string[] | 否 | 半年度筛选，如 `["H1", "H2"]` |
| global_regions | string[] | 否 | 全球区域筛选，如 `["EMEA", "Americas"]` |

**响应格式**：

```json
{
  "success": true,
  "data": {
    "laser": {
      "units": 12500000,
      "value": 3750.5,
      "asp": 300.04,
      "active_models": 1250,
      "yoy_growth": 3.2,
      "hoh_growth": 1.5
    },
    "inkjet": {
      "units": 8200000,
      "value": 1640.0,
      "asp": 200.0,
      "active_models": 980,
      "yoy_growth": -2.1,
      "hoh_growth": 0.8
    },
    "combined": {
      "units": 20700000,
      "value": 5390.5,
      "asp": 260.41,
      "active_models": 2230
    },
    "laser_share": 60.39,
    "inkjet_share": 39.61
  }
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| laser | object | 激光品类 KPI |
| inkjet | object | 喷墨品类 KPI |
| combined | object | 合计 KPI |
| laser_share | float | 激光品类销量占比(%) |
| inkjet_share | float | 喷墨品类销量占比(%) |
| units | int | 销量（台） |
| value | float | 销售额（百万美元） |
| asp | float | 平均单价（美元） |
| active_models | int | 活跃型号数 |
| yoy_growth | float | 同比增长率(%) |
| hoh_growth | float | 环比增长率(%) |

---

### 1.2 双品类趋势查询

**接口路径**：`GET /api/idc/overview/trend/dual_category`

**权限**：需 `dashboard:read` 权限

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| trend_type | string | 否 | 趋势类型：`dual_axis`（双轴图）、`region_stacked`（区域堆叠图）、`brand_share`（品牌份额趋势），默认 `dual_axis` |
| years | string[] | 否 | 年份筛选 |
| half_years | string[] | 否 | 半年度筛选 |

**响应格式（trend_type=dual_axis）**：

```json
{
  "success": true,
  "data": {
    "trend_type": "dual_axis",
    "periods": ["2023H1", "2023H2", "2024H1", "2024H2"],
    "laser_units": [5800000, 6200000, 6100000, 6400000],
    "inkjet_units": [4200000, 4000000, 4100000, 4100000],
    "laser_value": [1740.0, 1860.0, 1830.0, 1920.5],
    "inkjet_value": [840.0, 800.0, 820.0, 820.0]
  }
}
```

**响应格式（trend_type=region_stacked）**：

```json
{
  "success": true,
  "data": {
    "trend_type": "region_stacked",
    "periods": ["2023H1", "2023H2", "2024H1", "2024H2"],
    "regions": {
      "EMEA": { "laser": [...], "inkjet": [...] },
      "Americas": { "laser": [...], "inkjet": [...] },
      "Asia/Pacific": { "laser": [...], "inkjet": [...] }
    }
  }
}
```

**响应格式（trend_type=brand_share）**：

```json
{
  "success": true,
  "data": {
    "trend_type": "brand_share",
    "periods": ["2023H1", "2023H2", "2024H1", "2024H2"],
    "brands": {
      "HP": { "laser_share": [...], "inkjet_share": [...] },
      "Canon": { "laser_share": [...], "inkjet_share": [...] },
      "Epson": { "laser_share": [...], "inkjet_share": [...] }
    }
  }
}
```

---

### 1.3 品类品牌分布

**接口路径**：`GET /api/idc/overview/brand/category_distribution`

**权限**：需 `dashboard:read` 权限

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| top_n | int | 否 | 返回 Top N 品牌，默认 10，范围 1-50 |
| years | string[] | 否 | 年份筛选 |
| half_years | string[] | 否 | 半年度筛选 |
| global_regions | string[] | 否 | 全球区域筛选 |

**响应格式**：

```json
{
  "success": true,
  "data": {
    "laser": [
      {
        "brand": "HP",
        "units": 4250000,
        "value": 1275.0,
        "asp": 300.0,
        "share": 34.0
      },
      {
        "brand": "Canon",
        "units": 3200000,
        "value": 960.0,
        "asp": 300.0,
        "share": 25.6
      }
    ],
    "inkjet": [
      {
        "brand": "Epson",
        "units": 3400000,
        "value": 680.0,
        "asp": 200.0,
        "share": 41.46
      },
      {
        "brand": "HP",
        "units": 2100000,
        "value": 420.0,
        "asp": 200.0,
        "share": 25.61
      }
    ]
  }
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| laser | array | 激光品类 TOP 品牌列表 |
| inkjet | array | 喷墨品类 TOP 品牌列表 |
| brand | string | 品牌名称 |
| units | int | 销量（台） |
| value | float | 销售额（百万美元） |
| asp | float | 平均单价（美元） |
| share | float | 品类内份额(%) |

---

## 二、模板管理接口

### 2.1 获取高级模板列表（预置模板）

**接口路径**：`GET /api/idc/templates/advanced`

**权限**：需 `dashboard:read` 权限

**请求参数**：无

**响应格式**：

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
      "row_fields": [
        { "value": "Half Year", "label": "半年度" }
      ],
      "col_field": null,
      "value_configs": [
        {
          "aggregation": "sum_units",
          "sourceField": "units",
          "label": "销量",
          "format": "number",
          "decimalPlaces": 0
        },
        {
          "aggregation": "sum_value",
          "sourceField": "value_usd_m",
          "label": "销售额",
          "format": "currency",
          "decimalPlaces": 2
        },
        {
          "aggregation": "asp",
          "sourceField": "asp",
          "label": "ASP",
          "format": "currency",
          "decimalPlaces": 2
        }
      ],
      "filters": {},
      "suggested_filters": { "product_type": "all" },
      "is_system": true,
      "is_public": true,
      "version": 1
    }
  ]
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 模板唯一标识 |
| name | string | 模板名称 |
| description | string | 模板描述 |
| category | string | 模板分类 |
| categoryLabel | string | 分类中文名 |
| row_fields | array | 行维度配置 |
| col_field | object/null | 列维度配置 |
| value_configs | array | 值字段配置 |
| filters | object | 当前筛选条件 |
| suggested_filters | object | 建议筛选条件 |
| is_system | bool | 是否系统预置模板 |
| is_public | bool | 是否公开模板 |
| version | int | 版本号 |

**模板分类说明**：

| category | categoryLabel |
|----------|---------------|
| market_overview | 市场概览 |
| geo_analysis | 地理分析 |
| tech_analysis | 技术分析 |
| business_analysis | 商业分析 |
| deep_insight | 深度洞察 |

---

### 2.2 获取我的模板列表（自定义模板）

**接口路径**：`GET /api/idc/templates/my`

**权限**：需 `dashboard:read` 权限

**请求头**：

| Header | 必填 | 说明 |
|--------|------|------|
| X-User-Id | 否 | 当前用户 ID，不传则返回所有非系统模板 |

**请求参数**：无

**响应格式**：同 2.1，区别是返回 `is_system: false` 的模板

---

### 2.3 保存模板

**接口路径**：`POST /api/idc/templates`

**权限**：需 `dashboard:read` 权限

**请求头**：

| Header | 必填 | 说明 |
|--------|------|------|
| X-User-Id | 否 | 当前用户 ID |

**请求体**：

```json
{
  "name": "我的自定义模板",
  "description": "按品牌分析销量趋势",
  "category": "market_overview",
  "row_fields": [
    { "value": "Brand", "label": "品牌" }
  ],
  "col_field": { "value": "Half Year", "label": "半年度" },
  "value_configs": [
    {
      "aggregation": "sum_units",
      "sourceField": "units",
      "label": "销量",
      "format": "number",
      "decimalPlaces": 0
    }
  ],
  "filters": {},
  "share_status": "private"
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 模板名称 |
| description | string | 否 | 模板描述 |
| category | string | 是 | 模板分类 |
| row_fields | array | 是 | 行维度配置 |
| col_field | object | 否 | 列维度配置 |
| value_configs | array | 是 | 值字段配置 |
| filters | object | 否 | 筛选条件 |
| share_status | string | 否 | 分享状态：`private`、`team`、`public`，默认 `private` |

**响应格式**：

```json
{
  "success": true,
  "data": {
    "id": "custom_1712345678901",
    "name": "我的自定义模板",
    "description": "按品牌分析销量趋势",
    "category": "market_overview",
    "categoryLabel": "市场概览",
    "row_fields": [...],
    "col_field": {...},
    "value_configs": [...],
    "filters": {},
    "user_id": "user_123",
    "created_at": "2025-04-10T12:00:00Z",
    "updated_at": "2025-04-10T12:00:00Z",
    "share_status": "private",
    "version": 1,
    "is_system": false,
    "is_public": false
  }
}
```

---

### 2.4 更新模板

**接口路径**：`PUT /api/idc/templates/{template_id}`

**权限**：需 `dashboard:read` 权限

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| template_id | string | 是 | 模板 ID |

**请求体**：

```json
{
  "name": "更新后的模板名称",
  "description": "更新后的描述",
  "category": "market_overview",
  "row_fields": [
    { "value": "Brand", "label": "品牌" }
  ],
  "col_field": { "value": "Year", "label": "年份" },
  "value_configs": [...],
  "filters": {},
  "share_status": "team",
  "version": 1
}
```

**乐观锁说明**：`version` 字段用于乐观锁更新。如果传入的 version 与数据库中的版本不一致，则更新失败。

**响应格式**：同 2.3，更新后的模板数据

---

### 2.5 删除模板

**接口路径**：`DELETE /api/idc/templates/{template_id}`

**权限**：需 `dashboard:read` 权限

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| template_id | string | 是 | 模板 ID |

**响应格式**：

```json
{
  "success": true
}
```

**业务规则**：
- 系统预置模板（`is_system=true`）不可删除
- 删除不存在的模板返回 `success: false`

---

### 2.6 复制模板

**接口路径**：`POST /api/idc/templates/{template_id}/clone`

**权限**：需 `dashboard:read` 权限

**请求头**：

| Header | 必填 | 说明 |
|--------|------|------|
| X-User-Id | 否 | 当前用户 ID |

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| template_id | string | 是 | 原模板 ID |

**请求体**：

```json
{
  "name": "品牌区域分析-副本"
}
```

**响应格式**：同 2.3，新创建的副本模板数据

**业务规则**：
- 复制的模板归当前用户所有（`user_id` 为当前用户）
- 复制的模板默认 `share_status: private`

---

## 三、统计量接口

> ⚠️ **重要说明**：以下3个接口的统计量数据为**硬编码返回**，无需数据库支持。

### 3.1 获取统计量定义

**接口路径**：`GET /api/idc/aggregations/definitions`

**权限**：需 `dashboard:read` 权限

**请求参数**：无

**响应格式**：

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
    // ... 共24个统计量，见下方完整数据
  ]
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 统计量唯一标识 |
| name | string | 中文名称 |
| nameEn | string | 英文名称 |
| group | string | 分组：basic_agg（基础聚合）、core_derived（核心衍生）、advanced_analysis（高级分析） |
| description | string | 描述 |
| unit | string | 单位 |
| format | string | 格式：number、percent、currency、ratio |
| decimalPlaces | int | 小数位数 |
| sourceFields | array | 数据源字段 |
| calculateMethod | string | 计算方法说明 |

**完整24个统计量定义数据（硬编码）**：

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

**统计量分组说明**：

| 分组 | group | 统计量数量 | 说明 |
|------|-------|-----------|------|
| 基础聚合 | basic_agg | 10个 | sum、avg、count、max、min |
| 核心衍生 | core_derived | 11个 | asp、份额、增长率等衍生指标 |
| 高级分析 | advanced_analysis | 6个 | CR5、效率等高级指标 |

---

### 3.2 获取统计量选项（UI下拉使用）

**接口路径**：`GET /api/idc/aggregations/options`

**权限**：需 `dashboard:read` 权限

**请求参数**：无

**响应格式**：

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
    // ... 共24个选项
  ]
}
```

**完整24个统计量选项数据（硬编码）**：

```json
[
  // ====== 基础聚合 (10个) ======
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

  // ====== 核心衍生 (11个) ======
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

  // ====== 高级分析 (6个) ======
  { "value": "cr5_concentration", "label": "品牌集中度 (CR5)", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "前5大品牌销量占总销量的比例", "format": "percent" },
  { "value": "avg_units_per_model", "label": "单型号平均销量", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "每个型号的平均销量", "format": "number" },
  { "value": "channel_efficiency", "label": "渠道效率", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "各渠道销量/型号数的比值", "format": "ratio" },
  { "value": "speed_segment_count", "label": "速度段分布计数", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "各速度段的产品型号数量", "format": "number" },
  { "value": "price_segment_units", "label": "价格段分布销量", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "各价格段的总销量", "format": "number" },
  { "value": "deviation_from_avg", "label": "与均值偏差", "group": "advanced_analysis", "groupLabel": "高级分析", "description": "当前值与平均值的偏差百分比", "format": "percent" }
]
```

---

### 3.3 获取默认统计量配置

**接口路径**：`GET /api/idc/aggregations/defaults`

**权限**：需 `dashboard:read` 权限

**请求参数**：无

**响应格式**：

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

**说明**：返回默认选中的4个统计量配置，用户新建透视表时自动填充。

---

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 模板分类，返回该分类的默认配置 |

**响应格式**：

```json
{
  "success": true,
  "data": {
    "default_value_configs": [
      {
        "aggregation": "sum_units",
        "sourceField": "units",
        "label": "销量",
        "format": "number",
        "decimalPlaces": 0
      },
      {
        "aggregation": "market_share",
        "sourceField": "units",
        "label": "份额",
        "format": "percent",
        "decimalPlaces": 2
      }
    ],
    "default_row_fields": ["Brand"],
    "default_col_field": "Half Year"
  }
}
```

---

## 四、透视表查询接口

### 4.1 执行透视表查询

**接口路径**：`POST /api/idc/explore/pivot`

**权限**：需 `dashboard:read` 权限

**请求体**：

```json
{
  "row_fields": [
    { "value": "Brand", "label": "品牌" }
  ],
  "col_field": { "value": "Half Year", "label": "半年度" },
  "value_fields": [
    {
      "aggregation": "sum_units",
      "sourceField": "units",
      "label": "销量",
      "format": "number",
      "decimalPlaces": 0
    },
    {
      "aggregation": "market_share",
      "sourceField": "units",
      "label": "份额",
      "format": "percent",
      "decimalPlaces": 2
    }
  ],
  "filters": {
    "years": ["2024"],
    "product_type": "all"
  },
  "sort_field": "销量",
  "sort_order": "desc",
  "page": 1,
  "page_size": 20,
  "include_totals": true
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| row_fields | array | 是 | 行维度列表 |
| col_field | object | 否 | 列维度（透视表列方向） |
| value_fields | array | 是 | 值字段配置 |
| filters | object | 否 | 筛选条件 |
| sort_field | string | 否 | 排序字段名 |
| sort_order | string | 否 | 排序方向：`asc`、`desc` |
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页条数，默认 20 |
| include_totals | bool | 否 | 是否包含合计，默认 true |

**支持的行维度**：

| value | label |
|-------|-------|
| Year | 年份 |
| Half Year | 半年度 |
| Global Region | 全球区域 |
| Region | 区域 |
| Country | 国家 |
| Company | 公司 |
| Vendor | 供应商 |
| Brand | 品牌 |
| OEM | OEM |
| Product Category | 产品品类 |
| Product | 产品 |
| Format | 幅面 |
| Speed Range A4 | A4速度段 |
| Speed Range Letter | Letter速度段 |
| ADF | ADF |
| Duplex | 双面打印 |
| Wireless | 无线打印 |
| Ink Tank/ Ink Cartridge | 墨仓/墨盒 |
| Channel | 渠道 |
| Channel Group | 渠道组 |
| Production Classification | 生产级别 |
| Business Inkjet Detail | 商业喷墨细分 |
| Product Detail | 产品细分 |
| Color Type | 颜色类型 |
| Function Type | 功能类型 |

**支持的筛选条件**：

| 字段 | 类型 | 说明 |
|------|------|------|
| years | string[] | 年份筛选 |
| half_years | string[] | 半年度筛选 |
| global_regions | string[] | 全球区域筛选 |
| regions | string[] | 区域筛选 |
| countries | string[] | 国家筛选 |
| brands | string[] | 品牌筛选 |
| companies | string[] | 公司筛选 |
| vendors | string[] | 供应商筛选 |
| oems | string[] | OEM筛选 |
| product_categories | string[] | 产品品类筛选 |
| products | string[] | 产品筛选 |
| formats | string[] | 幅面筛选 |
| speed_ranges_a4 | string[] | A4速度段筛选 |
| speed_ranges_letter | string[] | Letter速度段筛选 |
| ink_types | string[] | 墨仓/墨盒类型筛选 |
| channels | string[] | 渠道筛选 |
| channel_groups | string[] | 渠道组筛选 |
| production_classifications | string[] | 生产级别筛选 |
| product_type | string | 产品类型：`all`、`laser`、`inkjet` |

**响应格式**：

```json
{
  "success": true,
  "data": {
    "headers": [
      ["品牌", "2023H1 销量", "2023H1 份额", "2023H2 销量", "2023H2 份额"]
    ],
    "rows": [
      {
        "Brand": "HP",
        "2023H1 销量": 2150000,
        "2023H1 份额": 21.5,
        "2023H2 销量": 2280000,
        "2023H2 份额": 22.3
      },
      {
        "Brand": "Canon",
        "2023H1 销量": 1850000,
        "2023H1 份额": 18.5,
        "2023H2 销量": 1920000,
        "2023H2 份额": 18.8
      }
    ],
    "totals": {
      "2023H1 销量": 10000000,
      "2023H1 份额": 100.0,
      "2023H2 销量": 10230000,
      "2023H2 份额": 100.0
    },
    "grand_totals": {
      "销量": 20230000,
      "销售额": 5060.0
    },
    "total_count": 15,
    "page": 1,
    "page_size": 20,
    "aggregation_used": ["sum_units", "market_share"],
    "computation_time_ms": 45,
    "warnings": []
  }
}
```

---

## 五、错误响应格式

所有接口的错误响应格式统一为：

```json
{
  "success": false,
  "error": {
    "error_code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

**常见错误码**：

| error_code | 说明 |
|------------|------|
| UNAUTHORIZED | 未授权（缺少或无效的 API Key） |
| FORBIDDEN | 无权限（缺少所需权限） |
| NOT_FOUND | 资源不存在 |
| VALIDATION_ERROR | 请求参数校验失败 |
| CONFLICT | 资源冲突（如乐观锁版本不一致） |
| INTERNAL_ERROR | 服务器内部错误 |

---

## 六、认证说明

接口认证通过以下方式：

1. **API Key**：在请求头中添加 `X-API-Key`
2. **用户标识**（可选）：在请求头中添加 `X-User-Id`

示例：

```http
GET /api/idc/overview/kpi/dual_category HTTP/1.1
Host: api.example.com
X-API-Key: your-api-key-here
X-User-Id: user_123
```

---

*文档结束*
