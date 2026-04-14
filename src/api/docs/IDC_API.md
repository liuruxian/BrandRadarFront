# IDC 市场分析 - 后端接口清单（精简版）

> 更新时间: 2026-04-14
> 范围: 仅包含前端实际加载页面中调用了的接口，未使用的全部不列
> 前端 API 调用方式: `import { idcMockApi as idcApi } from '@/api/idcMockApi'`
> 切换方式: 改为 `import { idcApi } from '@/api/idcApi'`

---

## 通用规范

**请求**: `Content-Type: application/json`，认证: `Authorization: Bearer {token}`

**通用响应格式**:
```json
{
  "success": true,
  "data": { ... }
}
```

**通用查询参数**: `filters` = `JSON.stringify(FilterConditions)`

---

## 一、筛选体系（2个）

### GET `/idc/filters/options`
获取筛选项列表。无需参数。

### POST `/idc/filters/apply`
应用筛选条件（可选，后端也可直接用 filters 参数）。

---

## 二、市场总览 `/idc/overview`（3个）

### GET `/idc/overview/kpi`
获取 KPI 指标。
```
响应:
{
  "total_units": 45000000,
  "total_value": 11500,
  "asp": 256,
  "active_models": 5800,
  "countries_covered": 48,
  "units_yoy": 2.5,
  "units_mom": 1.2,
  "value_yoy": 4.8,
  "value_mom": 2.1,
  "current_period": "2025H1",
  "previous_period": "2024H2",
  "yoy_period": "2024H1"
}
```

### GET `/idc/overview/trend?trend_type={type}&top_n=10&filters={}`
trend_type 可选: `dual_axis` | `region_stacked` | `brand_share`
```
响应:
{
  "metric": "units",
  "periods": ["2024H1", "2024H2", "2025H1"],
  "series": [
    { "name": "HP", "data": [4200000, 4350000, 4500000] },
    { "name": "Canon", "data": [2800000, 2900000, 3000000] }
  ]
}
```

### GET `/idc/overview/brand?type={type}&brands={}&filters={}`
type 可选: `top_n` | `oem` | `compare`

- type=top_n 响应:
```json
{
  "type": "top_n",
  "brands": [
    { "brand": "HP", "units": 13800000, "value": 3850, "asp": 279, "units_share": 30.7, "value_share": 33.5 }
  ]
}
```
- type=oem 响应:
```json
{
  "type": "oem",
  "oems": [
    { "oem": "HP", "units": 13800000, "value": 3850 }
  ]
}
```
- type=compare&brands=HP,Canon 响应:
```json
{
  "type": "compare",
  "brands": [
    { "brand": "HP", "units": 13800000, "value": 3850, "asp": 279, "active_models": 520, "countries_covered": 45 }
  ]
}
```

---

## 三、全品类分析 `/idc/dual`（3个）

### GET `/idc/dual/kpi`
双品类 KPI（激光 + 喷墨 + 全品类），**这是市场总览页的核心接口**。
```
响应:
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
  "combined": { "total_units": 40500000, "total_value": 11500, "asp": 284 },
  "laser_share": { "units_share": 60.5, "value_share": 62.6 },
  "inkjet_share": { "units_share": 39.5, "value_share": 37.4 }
}
```

### GET `/idc/dual/trend?trend_type={type}&top_n=10&filters={}`
trend_type 可选: `dual_axis` | `region_stacked` | `brand_share`
```
响应:
{
  "periods": ["2024H1", "2024H2", "2025H1"],
  "laser_units": [12000000, 12500000, 12800000],
  "inkjet_units": [8200000, 8100000, 8000000],
  "laser_value": [3500, 3620, 3720],
  "inkjet_value": [2200, 2180, 2160]
}
```

### GET `/idc/dual/brand?type={type}&brands={}&filters={}`
type 可选: `top_n` | `compare`
```
响应:
{
  "laser": [
    { "brand": "HP", "units": 9800000, "value": 2950, "asp": 301, "share": 40.0 }
  ],
  "inkjet": [
    { "brand": "Epson", "units": 6500000, "value": 1750, "asp": 269, "share": 40.6 }
  ]
}
```

---

## 四、市场探索 `/idc/explore`（5个）

### POST `/idc/explore/pivot/advanced`
高级透视表，**市场探索页的核心接口**，支持 30 种统计量。
```
请求:
{
  "filters": { "brands": ["HP"], "product_type": "laser" },
  "row_fields": ["Brand", "Region"],
  "col_field": "Half Year",
  "value_fields": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "asp", "sourceField": "asp", "label": "ASP", "format": "currency", "decimalPlaces": 2 }
  ],
  "sort_field": "销量",
  "sort_order": "desc",
  "page": 1,
  "page_size": 50,
  "include_totals": true,
  "drilldown_enabled": false
}

响应:
{
  "headers": [["Brand", "Region"], ["Half Year"], ["销量", "ASP"]],
  "rows": [
    { "Brand": "HP", "Region": "Americas", "Half Year": "2025H1", "销量": 4200000, "ASP": 285 },
    ...
  ],
  "totals": {},
  "grand_totals": { "销量": 13800000, "ASP": 279 },
  "total_count": 120,
  "page": 1,
  "page_size": 50,
  "aggregation_used": ["sum_units", "asp"],
  "computation_time_ms": 150
}
```

### GET `/idc/explore/templates/advanced`
获取 26 个高级分析模板。
```
响应:
{
  "templates": [
    {
      "id": "brand-region-matrix",
      "name": "品牌-区域矩阵",
      "description": "按品牌和区域交叉分析销量",
      "category": "market_overview",
      "categoryLabel": "市场概览",
      "row_fields": ["Brand", "Region"],
      "col_field": "Half Year",
      "value_configs": [...]
    }
  ]
}
```

### GET `/idc/explore/templates/my`
获取当前用户的自定义模板（需认证）。
```
响应: { "templates": [...] }
```

### POST `/idc/explore/templates`
保存模板。
```
请求:
{
  "name": "HP品牌分析",
  "description": "...",
  "category": "market_overview",
  "row_fields": ["Brand", "Region"],
  "col_field": "Half Year",
  "value_configs": [...],
  "filters": { "brands": ["HP"] },
  "share_status": "private"
}
```

### DELETE `/idc/explore/templates/:id`
删除模板。无需 body。

### POST `/idc/explore/templates/:id/clone`
复制模板。
```
请求: { "name": "HP品牌分析-副本" }
```

---

## 五、地理分析 `/idc/geo`（3个）

### GET `/idc/geo/heatmap?metric={units|value|asp}&filters={}`
metric 默认: `units`
```
响应:
[
  { "country_code": "US", "country_name": "United States", "iso_code": "USA", "units": 8500000, "value": 2650, "asp": 312 },
  { "country_code": "CN", "country_name": "China", "iso_code": "CHN", "units": 6200000, "value": 1580, "asp": 255 }
]
```

### GET `/idc/geo/country/:countryCode?filters={}`
```
响应:
{
  "country_code": "US",
  "country_name": "United States",
  "kpi": { "units": 8500000, "value": 2650, "asp": 312, "active_models": 1250 },
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

### GET `/idc/geo/compare?countries={}&filters={}`
countries 为逗号分隔的国家代码列表，如 `countries=US,CN,JP`

---

## 六、型号对标 `/idc/product`（2个）

### GET `/idc/product/search?keyword={}&brand={}&product={}&format={}&product_category={}&limit={}`
型号搜索。
```
响应:
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

### GET `/idc/product/compare?model_keys={}&compare_type={spec|market|region|channel|trend}&filters={}`
model_keys 为逗号分隔的型号 key 列表，compare_type 默认 `spec`。
```
响应 (spec):
{
  "spec_matrix": {
    "basic_info": [["品牌", "HP", "Canon"], ["型号", "LaserJet Pro MFP M428fdw", "imageCLASS MF455dw"]],
    "speed_specs": [["A4 Color Speed", "38 ppm", "36 ppm"], ["A4 Mono Speed", "40 ppm", "38 ppm"]],
    "function_specs": [["Function", "Print/Copy/Scan/Fax", "Print/Copy/Scan"]],
    "consumable_specs": [["Ink Tank/ Ink Cartridge", "Ink Cartridge", "Ink Cartridge"]],
    "physical_specs": [["Duty Cycle", "80000 pages", "75000 pages"]],
    "production_specs": [["Production Classification", "Office", "Office"]]
  }
}

响应 (market):
{
  "market_compare": {
    "units": [320000, 285000],
    "value": [98, 82],
    "asp": [306, 288]
  }
}
```

---

## 七、渠道与价格 `/idc/channel` + `/idc/price`（4个）

### GET `/idc/channel/sankey?metric={units|value}&filters={}`
```
响应:
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

### GET `/idc/channel/online_offline?filters={}`
线上 vs 线下渠道趋势。
```
响应:
{
  "periods": ["2024H1", "2024H2", "2025H1"],
  "online": [3200000, 3500000, 3800000],
  "offline": [6800000, 6700000, 6500000],
  "online_share": [32.0, 34.3, 36.9],
  "offline_share": [68.0, 65.7, 63.1]
}
```

### GET `/idc/channel/stacked?top_n_brands=10&filters={}`
品牌×渠道堆叠数据。
```
响应:
{
  "brands": ["HP", "Canon", "Epson"],
  "channel_groups": ["Dealer/VAR/SI", "Retail", "eTailer", "Internet", "Direct"],
  "series": [
    { "name": "HP", "data": [5800000, 2100000, 1800000, 1200000, 400000] }
  ]
}
```

### GET `/idc/price/segments?segment_type={type}&filters={}`
segment_type 可选: `market_capacity` | `brand_position` | `asp_trend` | `brand_asp_compare`

---

## 八、技术与细分 `/idc/tech`（3个）

### GET `/idc/tech/ink_tank?analysis_type={type}&drilldown_type={}&filters={}`
analysis_type 可选: `overall` | `region` | `brand` | `drilldown`

### GET `/idc/tech/speed_segment?analysis_type={type}&filters={}`
analysis_type 可选: `capacity` | `brand_share` | `scatter` | `trend`

### GET `/idc/tech/mfp_function?analysis_type={type}&filters={}`
analysis_type 可选: `coverage` | `combination` | `brand_diff` | `region_diff`

---

## 九、数据导出 `/idc/export`（3个）

> 注: 路由已隐藏，前端目前使用内置 `exportToCSV/exportToExcel` 工具函数实现导出，后端可暂缓实现

### POST `/idc/export/current_view`
导出当前筛选+分组条件下的聚合数据。

### POST `/idc/export/raw_data`
导出筛选条件下的原始行数据（含全部字段）。

### POST `/idc/export/report`
```
请求:
{
  "filters": {},
  "sections": ["kpi", "trend", "brand", "region"],
  "title": "HP品牌分析报告",
  "format": "pdf"
}
```

---

## 汇总表

| # | 接口 | 方法 | 路径 | 所在页面 | 备注 |
|---|---|---|---|---|---|
| 1 | 获取筛选项 | GET | `/idc/filters/options` | 全部页面 | 初始化时调用 |
| 2 | KPI | GET | `/idc/overview/kpi` | 市场总览 | |
| 3 | 趋势图 | GET | `/idc/overview/trend` | 市场总览 | dual_axis/region_stacked/brand_share |
| 4 | 品牌分布 | GET | `/idc/overview/brand` | 市场总览 | top_n/oem/compare |
| 5 | 双品类KPI | GET | `/idc/dual/kpi` | 市场总览 | **核心接口** |
| 6 | 双品类趋势 | GET | `/idc/dual/trend` | 市场总览 | |
| 7 | 品类品牌分布 | GET | `/idc/dual/brand` | 市场总览 | |
| 8 | 高级透视表 | POST | `/idc/explore/pivot/advanced` | 市场探索 | **核心接口，支持30种统计量** |
| 9 | 高级模板列表 | GET | `/idc/explore/templates/advanced` | 市场探索 | |
| 10 | 我的模板列表 | GET | `/idc/explore/templates/my` | 市场探索 | |
| 11 | 保存模板 | POST | `/idc/explore/templates` | 市场探索 | |
| 12 | 删除模板 | DELETE | `/idc/explore/templates/:id` | 市场探索 | |
| 13 | 复制模板 | POST | `/idc/explore/templates/:id/clone` | 市场探索 | |
| 14 | 地理热力图 | GET | `/idc/geo/heatmap` | 地理分析 | |
| 15 | 国家详情 | GET | `/idc/geo/country/:code` | 地理分析 | |
| 16 | 地理对比 | GET | `/idc/geo/compare` | 地理分析 | |
| 17 | 型号搜索 | GET | `/idc/product/search` | 型号对标 | |
| 18 | 型号对比 | GET | `/idc/product/compare` | 型号对标 | |
| 19 | 渠道桑基图 | GET | `/idc/channel/sankey` | 渠道与价格 | |
| 20 | 线上线下趋势 | GET | `/idc/channel/online_offline` | 渠道与价格 | |
| 21 | 渠道堆叠图 | GET | `/idc/channel/stacked` | 渠道与价格 | |
| 22 | 价格段分析 | GET | `/idc/price/segments` | 渠道与价格 | 4种类型 |
| 23 | 墨仓分析 | GET | `/idc/tech/ink_tank` | 技术与细分 | |
| 24 | 速度段分析 | GET | `/idc/tech/speed_segment` | 技术与细分 | |
| 25 | MFP功能 | GET | `/idc/tech/mfp_function` | 技术与细分 | |
| 26 | 导出当前视图 | POST | `/idc/export/current_view` | (路由已隐藏) | 前端已有CSV/Excel工具 |
| 27 | 导出原始数据 | POST | `/idc/export/raw_data` | (路由已隐藏) | |
| 28 | 导出报告 | POST | `/idc/export/report` | (路由已隐藏) | |

**后端需要实现的接口共 25 个**（含3个已隐藏路由可暂缓）。

---

## 筛选条件 FilterConditions 结构

传给后端的 filters 参数结构：
```json
{
  "years": ["2025"],
  "half_years": ["H1"],
  "global_regions": ["EMEA"],
  "regions": [],
  "countries": [],
  "brands": ["HP", "Canon"],
  "oems": [],
  "product_categories": ["Laser"],
  "products": [],
  "formats": [],
  "channels": [],
  "channel_groups": [],
  "speed_ranges_a4": [],
  "ink_types": [],
  "adf_options": [],
  "duplex_options": [],
  "network_options": [],
  "wireless_options": [],
  "production_classifications": [],
  "business_inkjet_detail": [],
  "product_type": "laser",
  "laser_product_details": ["Color Laser"],
  "toner_capacity_ranges": [],
  "inkjet_product_details": [],
  "high_end_only": false
}
```
