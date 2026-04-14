# IDC 市场分析模块 - 后端接口清单

> 前端调用路径: `/api/idc/*`
> 更新时间: 2026-04-14
> 认证: Bearer Token (从 localStorage 的 `brand_radar_token` 传入)

---

## 通用规范

### 请求格式
- Content-Type: `application/json`
- 所有列表类参数用逗号分隔，如 `brands=HP,Canon,Epson`
- 筛选条件统一用 `filters=JSON.stringify(filters)` 方式传递

### 响应格式
```json
{
  "success": true,
  "data": { ... }
}
// 失败时
{
  "success": false,
  "error": { "code": "xxx", "message": "错误信息" }
}
```

---

## 一、筛选体系 API `/idc/filters/*`

### 1.1 获取筛选选项 `GET /idc/filters/options`

获取所有可选的筛选项值列表。

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| parent_field | string | 否 | 父字段名，用于级联查询 |
| parent_value | string | 否 | 父字段值 |

**响应字段说明 (`FilterOptionsData`):**

| 字段 | 类型 | 说明 |
|---|---|---|
| years | string[] | 年份: 2020~2025 |
| half_years | string[] | 半年期: H1/H2 |
| global_regions | FilterOption[] | 全球区域: Americas/EMEA/APJ |
| regions | FilterOption[] | 区域: Western Europe/Latin America... |
| countries | FilterOption[] | 国家: US/CN/DE... |
| companies | FilterOption[] | 公司: Canon Group/HP Inc... |
| vendors | FilterOption[] | 厂商: Canon/HP... |
| brands | FilterOption[] | 品牌: HP/Canon/Epson... |
| oems | FilterOption[] | OEM: Canon/HP/Ricoh... |
| product_categories | FilterOption[] | 产品类别: MFP/Laser/Inkjet... |
| products | FilterOption[] | 产品: Laser Printer/Inkjet MFP... |
| formats | FilterOption[] | 幅面: A4/A3/Letter... |
| speed_ranges_a4 | string[] | A4速度段: <20 ppm/20-40 ppm... |
| speed_ranges_letter | string[] | Letter速度段 |
| adf_options | FilterOption[] | ADF: Y/N |
| duplex_options | FilterOption[] | 双面: Y/N |
| network_options | FilterOption[] | 网络: Y/N |
| wireless_options | FilterOption[] | 无线: Y/N |
| ink_types | FilterOption[] | 墨水类型: Ink Tank/Ink Cartridge |
| channels | FilterOption[] | 渠道: Direct/Dealer/VAR/SI... |
| channel_groups | FilterOption[] | 渠道组: Online/Offline/Direct |
| production_classifications | FilterOption[] | 生产级别分类 |
| business_inkjet_detail | FilterOption[] | 商用喷墨细分: 01: Entry/02: Mid-range/03: High-end |
| laser_product_details | FilterOption[] | 激光产品细分: Color Laser/Mono Laser |
| toner_capacity_ranges | FilterOption[] | 碳粉容量区间: 0/1-3000/3001-10000/>10000 |
| inkjet_product_details | FilterOption[] | 喷墨产品细分: Color Inkjet/Mono Inkjet |
| high_end_only | FilterOption[] | 高端机型快捷选项 |

### 1.2 应用筛选条件 `POST /idc/filters/apply`

**请求体 (`FilterApplyRequest`):**
```json
{
  "filters": {
    "years": ["2025"],
    "half_years": ["H1"],
    "brands": ["HP", "Canon"],
    "product_categories": ["Laser"],
    "global_regions": ["EMEA"],
    "product_type": "laser",
    "laser_product_details": ["Color Laser"],
    "toner_capacity_ranges": ["3001-10000"],
    "high_end_only": false
  }
}
```

---

## 二、市场总览 API `/idc/overview/*`

### 2.1 KPI 数据 `GET /idc/overview/kpi`

获取当前筛选条件下的核心KPI指标。

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| filters | string | 否 | JSON.stringify后的FilterConditions |

**响应字段 (`KPIData`):**
| 字段 | 类型 | 说明 |
|---|---|---|
| total_units | number | 总销量 SUM(Units) |
| total_value | number | 总销售额 SUM(Value USD M) |
| asp | number | 平均单价 ASP = SUM(Value)/SUM(Units)*1,000,000 |
| active_models | number | 活跃型号数 COUNT(DISTINCT Model Name) |
| countries_covered | number | 覆盖国家数 COUNT(DISTINCT Country) |
| units_yoy | number | 销量同比增长率(%) |
| units_mom | number | 销量环比增长率(%) |
| value_yoy | number | 销售额同比增长率(%) |
| value_mom | number | 销售额环比增长率(%) |
| current_period | string | 当前期间如 "2025H1" |
| previous_period | string | 环比上一期 |
| yoy_period | string | 同比期 |

### 2.2 趋势图数据 `GET /idc/overview/trend`

获取市场趋势数据，支持三种趋势类型。

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| trend_type | string | 是 | dual_axis / region_stacked / brand_share |
| top_n | number | 否 | 默认10，品牌趋势时取前N名 |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**响应字段 (`TrendChartData`):**
| 字段 | 类型 | 说明 |
|---|---|---|
| metric | units \| value | 当前指标类型 |
| periods | string[] | 时间序列: 2020H1 ~ 2025H1 |
| series | TrendSeries[] | 数据系列 |

**TrendSeries:**
```json
{
  "name": "HP",
  "data": [1200000, 1350000, 1420000, ...]
}
```

### 2.3 品牌分布 `GET /idc/overview/brand`

获取品牌分布数据。

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| type | string | 是 | top_n / oem / compare |
| brands | string | 否 | compare时传入逗号分隔的品牌列表 |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**响应 (type=top_n):**
```json
{
  "type": "top_n",
  "brands": [
    {
      "brand": "HP",
      "units": 13800000,
      "value": 3850,
      "asp": 279,
      "units_share": 30.67,
      "value_share": 33.48
    }
  ]
}
```

**响应 (type=oem):**
```json
{
  "type": "oem",
  "oems": [
    { "oem": "HP", "units": 13800000, "value": 3850 }
  ]
}
```

---

## 三、市场探索 API `/idc/explore/*`

### 3.1 透视表查询 `POST /idc/explore/pivot`

基础透视表查询（支持4种统计量）。

**请求体 (`PivotRequest`):**
| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| filters | FilterConditions | 否 | 筛选条件 |
| row_fields | PivotDimension[] | 是 | 行维度，支持多选 |
| col_field | PivotDimension | 否 | 列维度 |
| value_field | PivotValueField | 是 | 值字段: units / value / asp / active_models |
| sort_field | string | 否 | 排序字段 |
| sort_order | asc \| desc | 否 | 排序方向 |
| page | number | 否 | 页码，默认1 |
| page_size | number | 否 | 每页条数，默认50 |

**PivotDimension 可选值:**
```
Year | Half Year | Global Region | Region | Country
Company | Vendor | Brand | OEM
Product Category | Product | Format
Speed Range A4 | Speed Range Letter
ADF | Duplex | Wireless
Ink Tank/ Ink Cartridge | Channel | Channel Group
Production Classification | Business Inkjet Detail
```

**响应字段 (`PivotData`):**
| 字段 | 类型 | 说明 |
|---|---|---|
| headers | string[][] | 表头行 |
| rows | unknown[][] | 数据行 |
| totals | unknown[] | 合计行 |
| total_count | number | 总行数 |
| page | number | 当前页 |
| page_size | number | 每页条数 |

### 3.2 高级透视表查询 `POST /idc/explore/pivot/advanced`

支持30种统计量的高级透视表。

**请求体 (`AdvancedPivotRequest`):**
| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| filters | FilterConditions | 否 | 筛选条件 |
| row_fields | PivotDimension[] | 是 | 行维度 |
| col_field | PivotDimension | 否 | 列维度 |
| value_fields | ValueFieldConfig[] | 是 | 值字段配置（支持多选） |
| sort_field | string | 否 | 排序字段 |
| sort_order | asc \| desc | 否 | 排序方向 |
| page | number | 否 | 页码 |
| page_size | number | 否 | 每页条数 |
| include_totals | boolean | 否 | 包含合计 |
| include_subtotals | boolean | 否 | 包含小计 |
| drilldown_enabled | boolean | 否 | 启用钻取 |

**ValueFieldConfig 结构:**
```json
{
  "aggregation": "sum_units",
  "sourceField": "units",
  "label": "销量",
  "format": "number",
  "decimalPlaces": 0
}
```

### 3.3 统计量定义 `GET /idc/explore/aggregations`

获取所有30种统计量的定义列表。

**响应:** `AggregationDefinition[]`

### 3.4 统计量选项 `GET /idc/explore/aggregations/options`

获取UI下拉用的统计量选项（带分组）。

### 3.5 默认统计量配置 `GET /idc/explore/aggregations/defaults`

获取系统默认的统计量配置。

### 3.6 预置模板列表 `GET /idc/explore/templates`

获取透视表预置模板。

**响应:** `TemplateItem[]`

### 3.7 高级模板列表 `GET /idc/explore/templates/advanced`

获取26个高级分析模板（支持30种统计量）。

### 3.8 我的模板列表 `GET /idc/explore/templates/my`

获取用户自定义模板（需认证）。

### 3.9 保存模板 `POST /idc/explore/templates`

**请求体 (`SaveTemplateRequest`):**
```json
{
  "name": "HP品牌分析",
  "description": "分析HP各区域销量",
  "category": "market_overview",
  "row_fields": ["Brand", "Region"],
  "col_field": "Half Year",
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 }
  ],
  "filters": { "brands": ["HP"] },
  "share_status": "private"
}
```

### 3.10 更新模板 `PUT /idc/explore/templates/:id`

**请求体 (`UpdateTemplateRequest`):**
同 SaveTemplateRequest，需传入 `id` 和可选的 `version`（乐观锁）。

### 3.11 删除模板 `DELETE /idc/explore/templates/:id`

### 3.12 复制模板 `POST /idc/explore/templates/:id/clone`

**请求体:**
```json
{ "name": "HP品牌分析-副本" }
```

### 3.13 配置验证 `POST /idc/explore/validate`

验证透视表配置的有效性，返回冲突和警告。

**请求体 (`ValidateConfigRequest`):**
```json
{
  "row_fields": ["Brand", "Region", "Half Year", "Country"],
  "col_field": "Product",
  "value_configs": [...],
  "filters": {}
}
```

**响应 (`ValidateConfigResponse`):**
```json
{
  "valid": false,
  "conflicts": [
    {
      "type": "too_many_dimensions",
      "severity": "warning",
      "message": "维度过多可能导致数据稀疏",
      "suggestion": "建议减少维度数量到4个以内"
    }
  ],
  "warnings": [],
  "recommendations": [],
  "dataQuality": {
    "estimatedRows": 15000,
    "dataSparsity": 0.45,
    "confidence": 0.72
  }
}
```

---

## 四、地理分析 API `/idc/geo/*`

### 4.1 热力图数据 `GET /idc/geo/heatmap`

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| metric | string | 否 | units / value / asp，默认units |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**响应:** `GeoHeatmapItem[]`
```json
[
  {
    "country_code": "US",
    "country_name": "United States",
    "iso_code": "USA",
    "units": 8500000,
    "value": 2650,
    "asp": 312
  }
]
```

### 4.2 国家详情 `GET /idc/geo/country/:countryCode`

获取指定国家的详细分析数据。

**响应 (`CountryDetailData`):**
```json
{
  "country_code": "US",
  "country_name": "United States",
  "kpi": {
    "units": 8500000,
    "value": 2650,
    "asp": 312,
    "active_models": 1250
  },
  "top_models": [
    { "brand": "HP", "model_name": "LaserJet Pro MFP", "units": 320000, "value": 98 }
  ],
  "trend": {
    "periods": ["2024H1", "2024H2", "2025H1"],
    "units": [4100000, 4200000, 4300000],
    "value": [1250, 1280, 1320]
  },
  "brand_structure": [
    { "brand": "HP", "units": 2800000, "share": 32.9 }
  ]
}
```

### 4.3 地理对比 `GET /idc/geo/compare`

对比多个国家或区域的数据。

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| countries | string | 是 | 逗号分隔的国家代码列表 |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**响应:**
```json
{
  "items": [
    {
      "name": "US",
      "type": "country",
      "units": 8500000,
      "value": 2650,
      "asp": 312,
      "active_models": 1250,
      "brand_structure": [...],
      "trend": {...}
    }
  ]
}
```

---

## 五、型号对标 API `/idc/product/*`

### 5.1 型号搜索 `GET /idc/product/search`

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| keyword | string | 是 | 搜索关键词 |
| brand | string | 否 | 品牌筛选 |
| product | string | 否 | 产品筛选 |
| format | string | 否 | 幅面筛选 |
| product_category | string | 否 | 产品类别筛选 |
| limit | number | 否 | 返回条数限制 |

**响应:** `ProductSearchItem[]`
```json
[
  {
    "model_key": "HP-LaserJet-Pro-MFP-M428fdw",
    "brand": "HP",
    "model_name": "LaserJet Pro MFP M428fdw",
    "product_brand": "HP",
    "product_category": "Laser MFP",
    "product": "Laser MFP",
    "format": "A4"
  }
]
```

### 5.2 型号对比 `GET /idc/product/compare`

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| model_keys | string | 是 | 逗号分隔的型号key列表 |
| compare_type | string | 否 | spec / market / region / channel / trend，默认spec |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**响应 (`ProductCompareData`):**
```json
{
  "spec_matrix": {
    "basic_info": [
      ["品牌", "HP", "Canon"],
      ["型号", "LaserJet Pro MFP M428fdw", "imageCLASS MF455dw"]
    ],
    "speed_specs": [
      ["A4 Color Speed", "38 ppm", "36 ppm"],
      ["A4 Mono Speed", "40 ppm", "38 ppm"]
    ],
    "function_specs": [
      ["Function", "Print/Copy/Scan/Fax", "Print/Copy/Scan"],
      ["ADF", "Y", "Y"]
    ],
    "consumable_specs": [
      ["Ink Tank/ Ink Cartridge", "Ink Cartridge", "Ink Cartridge"]
    ],
    "physical_specs": [
      ["Duty Cycle", "80000 pages", "75000 pages"]
    ],
    "production_specs": [
      ["Production Classification", "Office", "Office"]
    ]
  },
  "market_compare": {
    "units": [320000, 285000],
    "value": [98, 82],
    "asp": [306, 288]
  },
  "region_distribution": [
    ["Americas", 150000, 130000],
    ["EMEA", 120000, 110000]
  ],
  "channel_distribution": [
    ["Dealer/VAR/SI", 160000, 145000],
    ["Retail", 100000, 90000]
  ],
  "time_trend": {
    "periods": ["2024H1", "2024H2", "2025H1"],
    "series": [
      { "name": "HP", "data": [310000, 315000, 320000] },
      { "name": "Canon", "data": [280000, 282000, 285000] }
    ]
  }
}
```

---

## 六、渠道分析 API `/idc/channel/*`

### 6.1 渠道桑基图 `GET /idc/channel/sankey`

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| metric | string | 否 | units / value，默认units |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**响应 (`ChannelSankeyData`):**
```json
{
  "nodes": [
    { "name": "Dealer/VAR/SI", "category": "channel" },
    { "name": "HP", "category": "brand" }
  ],
  "links": [
    { "source": "HP", "target": "Dealer/VAR/SI", "value": 5800000 }
  ]
}
```

### 6.2 线上线下趋势 `GET /idc/channel/online_offline`

**响应 (`OnlineOfflineData`):**
```json
{
  "periods": ["2024H1", "2024H2", "2025H1"],
  "online": [3200000, 3500000, 3800000],
  "offline": [6800000, 6700000, 6500000],
  "online_share": [32.0, 34.3, 36.9],
  "offline_share": [68.0, 65.7, 63.1]
}
```

### 6.3 渠道堆叠图 `GET /idc/channel/stacked`

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| top_n_brands | number | 否 | 默认10 |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**响应 (`ChannelStackedData`):**
```json
{
  "brands": ["HP", "Canon", "Epson"],
  "channel_groups": ["Dealer/VAR/SI", "Retail", "eTailer", "Internet", "Direct"],
  "series": [
    {
      "name": "HP",
      "data": [5800000, 2100000, 1800000, 1200000, 400000]
    }
  ]
}
```

---

## 七、价格段分析 API `/idc/price/*`

### 7.1 价格段数据 `GET /idc/price/segments`

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| segment_type | string | 是 | market_capacity / brand_position / asp_trend / brand_asp_compare |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**segment_type=market_capacity 响应:**
```json
{
  "type": "market_capacity",
  "segments": [
    { "name": "<$200", "range": "<$200", "units": 8500000, "value": 1200, "share": 21.2 },
    { "name": "$200-1000", "range": "$200-1000", "units": 18000000, "value": 8500, "share": 45.0 },
    { "name": ">$1000", "range": ">$1000", "units": 13500000, "value": 2800, "share": 33.8 }
  ]
}
```

**segment_type=brand_position 响应:**
```json
{
  "type": "brand_position",
  "brands": ["HP", "Canon", "Epson"],
  "series": [
    { "name": "<$200", "data": [25.0, 28.0, 35.0] },
    { "name": "$200-1000", "data": [55.0, 52.0, 48.0] },
    { "name": ">$1000", "data": [20.0, 20.0, 17.0] }
  ]
}
```

**segment_type=asp_trend 响应:**
```json
{
  "type": "asp_trend",
  "periods": ["2024H1", "2024H2", "2025H1"],
  "series": [
    { "name": "HP", "data": [275, 278, 281] },
    { "name": "Canon", "data": [285, 288, 292] }
  ]
}
```

**segment_type=brand_asp_compare 响应:**
```json
{
  "type": "brand_asp_compare",
  "brands": ["HP", "Canon", "Epson", "Brother"],
  "asp": [279, 291, 269, 259]
}
```

---

## 八、技术与细分市场 API `/idc/tech/*`

### 8.1 墨仓式分析 `GET /idc/tech/ink_tank`

墨仓式打印机渗透率分析（仅 Product='Inkjet'）。

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| analysis_type | string | 是 | overall / region / brand / drilldown |
| drilldown_type | string | 否 | country / model，analysis_type=drilldown时必填 |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**analysis_type=overall 响应:**
```json
{
  "type": "overall",
  "ink_tank_units": 8500000,
  "ink_tank_value": 1950,
  "ink_tank_share_units": 53.1,
  "ink_tank_share_value": 45.3,
  "cartridge_units": 7500000,
  "cartridge_value": 2350,
  "unknown_units": 500000
}
```

**analysis_type=region 响应:**
```json
{
  "type": "region",
  "regions": [
    { "region": "Americas", "ink_tank_share": 58.2 },
    { "region": "EMEA", "ink_tank_share": 62.5 },
    { "region": "APJ", "ink_tank_share": 45.8 }
  ]
}
```

**analysis_type=brand 响应:**
```json
{
  "type": "brand",
  "brands": [
    { "brand": "Epson", "ink_tank_share": 92.5, "ink_tank_units": 7200000, "total_units": 7800000 },
    { "brand": "HP", "ink_tank_share": 35.2, "ink_tank_units": 1200000, "total_units": 3410000 }
  ]
}
```

### 8.2 速度段分析 `GET /idc/tech/speed_segment`

按 Speed Range A4 分组的速度段市场分析。

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| analysis_type | string | 是 | capacity / brand_share / scatter / trend |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**analysis_type=capacity 响应:**
```json
{
  "type": "capacity",
  "segments": [
    { "segment": "<20 ppm", "units": 12000000, "value": 2500 },
    { "segment": "20-40 ppm", "units": 18500000, "value": 5200 },
    { "segment": "40-60 ppm", "units": 9800000, "value": 3200 },
    { "segment": ">60 ppm", "units": 4200000, "value": 1650 }
  ]
}
```

**analysis_type=scatter 响应:**
```json
{
  "type": "scatter",
  "points": [
    {
      "model_name": "LaserJet Pro MFP M428fdw",
      "brand": "HP",
      "speed": 40,
      "asp": 306,
      "units": 320000
    }
  ]
}
```

### 8.3 MFP功能普及率 `GET /idc/tech/mfp_function`

MFP多功能一体机功能普及率分析（仅 Product Category='MFP'）。

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| analysis_type | string | 是 | coverage / combination / brand_diff / region_diff |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**analysis_type=coverage 响应:**
```json
{
  "type": "coverage",
  "print_rate": 98.5,
  "copy_rate": 85.2,
  "scan_rate": 82.3,
  "fax_rate": 28.5,
  "adf_rate": 72.1
}
```

---

## 九、排行 API `/idc/rank`

### 9.1 多维度排行 `GET /idc/rank`

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| rank_type | string | 是 | brand / country / region / model / oem / channel_group |
| sort_by | string | 否 | units / value / asp / active_models，默认units |
| order | string | 否 | asc / desc，默认desc |
| top_n | number | 否 | 默认10 |
| page | number | 否 | 页码，默认1 |
| page_size | number | 否 | 每页条数，默认20 |
| filters | string | 否 | JSON.stringify后的FilterConditions |

**响应:**
```json
{
  "items": [
    {
      "rank": 1,
      "name": "HP",
      "units": 13800000,
      "value": 3850,
      "asp": 279,
      "active_models": 520
    }
  ],
  "total_count": 10,
  "page": 1,
  "page_size": 10
}
```

---

## 十、全品类分析 API `/idc/dual/*`

支持激光+喷墨双品类对比分析。

### 10.1 双品类KPI `GET /idc/dual/kpi`

**Query 参数:**
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| filters | string | 否 | JSON.stringify后的FilterConditions |

**响应 (`DualCategoryKPIData`):**
```json
{
  "laser": {
    "product_type": "laser",
    "total_units": 24500000,
    "total_value": 7200,
    "asp": 294,
    "active_models": 3200,
    "countries_covered": 45,
    "units_yoy": 3.2,
    "value_yoy": 4.1
  },
  "inkjet": {
    "product_type": "inkjet",
    "total_units": 16000000,
    "total_value": 4300,
    "asp": 269,
    "active_models": 2800,
    "countries_covered": 42,
    "units_yoy": -1.5,
    "value_yoy": 0.8
  },
  "combined": { ... },
  "laser_share": { "units_share": 60.5, "value_share": 62.6 },
  "inkjet_share": { "units_share": 39.5, "value_share": 37.4 }
}
```

### 10.2 双品类趋势 `GET /idc/dual/trend`

### 10.3 品类品牌分布 `GET /idc/dual/brand`

### 10.4 高端机型分析 `GET /idc/dual/high_end`

### 10.5 高端机型列表 `GET /idc/dual/high_end/models`

### 10.6 地理双品类热力图 `GET /idc/dual/geo/heatmap`

### 10.7 国家详情双品类 `GET /idc/dual/geo/country/:code`

### 10.8 渠道双品类桑基图 `GET /idc/dual/channel/sankey`

### 10.9 价格段双品类 `GET /idc/dual/price/segments`

---

## 十一、数据导出 API `/idc/export/*`

### 11.1 导出当前视图 `POST /idc/export/current_view`

**请求体 (`ExportRequest`):**
```json
{
  "filters": {},
  "export_type": "current_view",
  "format": "csv"
}
```

### 11.2 导出原始数据 `POST /idc/export/raw_data`

导出筛选条件下的原始行数据（含全部字段）。

### 11.3 导出报告 `POST /idc/export/report`

**请求体 (`ReportExportRequest`):**
```json
{
  "filters": {},
  "sections": ["kpi", "trend", "brand", "region"],
  "title": "HP品牌分析报告",
  "format": "pdf"
}
```

**响应:**
```json
{
  "task_id": "export_1712345678",
  "status": "completed",
  "download_url": "/api/idc/export/download/export_1712345678.pdf",
  "message": "导出成功"
}
```

---

## 十二、30种统计量完整清单

| 聚合类型 | 中文名 | 英文名 | 格式 | 计算方法 |
|---|---|---|---|---|
| sum_units | 销量求和 | Total Units | number | SUM(Units) |
| sum_value | 销售额求和 | Total Value (USD M) | currency | SUM(Value) |
| count_rows | 记录行数 | Row Count | number | COUNT(*) |
| avg_units | 销量平均值 | Avg Units | number | AVG(Units) |
| avg_value | 销售额平均值 | Avg Value | currency | AVG(Value) |
| max_units | 销量最大值 | Max Units | number | MAX(Units) |
| max_value | 销售额最大值 | Max Value | currency | MAX(Value) |
| min_units | 销量最小值 | Min Units | number | MIN(Units) |
| min_value | 销售额最小值 | Min Value | currency | MIN(Value) |
| count_models | 型号数量 | Active Models | number | COUNT(DISTINCT Model Name) |
| asp | 平均单价 | ASP | currency | SUM(Value)/SUM(Units)*1,000,000 |
| market_share | 市场份额 | Market Share | percent | SUM(Units)/TOTAL_UNITS*100 |
| value_share | 销售额份额 | Value Share | percent | SUM(Value)/TOTAL_VALUE*100 |
| category_units_pct | 品类销量占比 | Category Units % | percent | SUM(Units)/CATEGORY_TOTAL*100 |
| inktank_penetration | 墨仓式渗透率 | Ink Tank Penetration | percent | INKTANK_UNITS/TOTAL*100 |
| function_penetration | 功能普及率 | Function Penetration | percent | FUNC_YES/TOTAL*100 |
| highend_units_pct | 高端机型占比 | High-End % | percent | HIGHEND_UNITS/TOTAL*100 |
| a3_format_pct | A3幅面占比 | A3 Format % | percent | A3_UNITS/TOTAL*100 |
| mfp_pct | MFP占比 | MFP % | percent | MFP_UNITS/TOTAL*100 |
| yoy_growth | 同比增长率 | YoY Growth | percent | (CUR-PREV)/PREV*100 |
| hoh_growth | 环比增长率 | HoH Growth | percent | (CUR-LAST)/LAST*100 |
| cumulative_units | 累计销量 | Cumulative Units | number | 累加计算 |
| cr5_concentration | 品牌集中度CR5 | CR5 Concentration | percent | TOP5_UNITS/TOTAL*100 |
| avg_units_per_model | 单型号平均销量 | Avg Units/Model | number | SUM(Units)/COUNT(MODEL) |
| units_per_region | 单位区域销量 | Units/Region | number | SUM(Units)/COUNT(REGION) |
| channel_efficiency | 渠道效率 | Channel Efficiency | ratio | ONLINE_UNITS/OFFLINE_UNITS |
| speed_segment_count | 速度段分布计数 | Speed Segments | number | COUNT(DISTINCT Speed) |
| price_segment_units | 价格段分布销量 | Price Segment Units | number | 分组后SUM |
| cost_per_page | 单页耗材成本 | Cost/Page | ratio | 估算值 |
| deviation_from_avg | 与均值偏差 | Deviation from Avg | percent | (VAL-AVG)/AVG*100 |

---

## 数据库表结构参考

**主表: `idc_printer_market`**

| 字段名 | 类型 | 说明 |
|---|---|---|
| Year | int | 年份 |
| Half Year | varchar | 半年期: H1/H2 |
| Global Region | varchar | 全球区域 |
| Region | varchar | 区域 |
| Country | varchar | 国家 |
| Company | varchar | 公司 |
| Vendor | varchar | 厂商 |
| Brand | varchar | 品牌 |
| OEM | varchar | OEM |
| Product Category | varchar | 产品类别: MFP/Laser/Inkjet |
| Product | varchar | 产品 |
| Model Name | varchar | 型号名 |
| Format | varchar | 幅面: A4/A3/Letter |
| Speed Range A4 | varchar | A4速度段 |
| Speed Range Letter | varchar | Letter速度段 |
| A4 Color Speed | varchar | A4彩速 |
| A4 Mono Speed | varchar | A4黑白速 |
| Units | bigint | 销量 |
| Value (USD M) | decimal | 销售额(百万美元) |
| ASP | decimal | 平均单价 |
| Active Models | int | 活跃型号数 |
| ADF | varchar | ADF: Y/N |
| Duplex | varchar | 双面: Y/N |
| Network | varchar | 网络: Y/N |
| Wireless | varchar | 无线: Y/N |
| Ink Tank/ Ink Cartridge | varchar | 墨水类型 |
| Black Toner Max Pages | int | 黑色碳粉最大页数 |
| Color Toner Max Pages | int | 彩色碳粉最大页数 |
| Function | varchar | 功能 |
| Duty Cycle | int | 月负载 |
| Weight | varchar | 重量 |
| Tray Size | varchar | 纸盒容量 |
| Flatbed | varchar | 平板: Y/N |
| Sheetfed | varchar | 输稿器: Y/N |
| Channel | varchar | 渠道 |
| Channel Group | varchar | 渠道组 |
| Production Classification | varchar | 生产级别 |
| Business Inkjet Detail | varchar | 商用喷墨细分 |
| Product Brand | varchar | 产品品牌 |
