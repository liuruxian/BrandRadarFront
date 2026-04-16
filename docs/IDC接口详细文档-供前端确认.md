# BrandRadar IDC 模块完整需求文档

> 文档版本：v8.0（接口完整版）
> 生成时间：2026-04-16
> 文档类型：接口规格说明书
> 状态：**后端所有 IDC 接口已实现完成，字段已对齐，可供前端直接使用**

---

## 接口实现状态总结

### ✅ 已完全实现（共22个 IDC 接口）

| 模块 | 接口数 | 路径前缀 | 状态 |
|------|--------|----------|------|
| 筛选接口 | 2 | `/api/idc/filters` | ✅ |
| 总览接口 | 3 | `/api/idc/overview` | ✅ |
| 地理分析接口 | 3 | `/api/idc/geo` | ✅ |
| 透视表接口 | 2 | `/api/idc/explore` | ✅ |
| 产品对比接口 | 2 | `/api/idc/product` | ✅ |
| 渠道分析接口 | 3 | `/api/idc/channel` | ✅ |
| 价格分析接口 | 1 | `/api/idc/price` | ✅ |
| 技术分析接口 | 3 | `/api/idc/tech` | ✅ |
| 排行接口 | 1 | `/api/idc/rank` | ✅ |
| 导出接口 | 2 | `/api/idc/export` | ✅ |

---

## 一、数据模型规格

### 1.1 数据库表结构

**表名**：`idc_market_records`

**字段清单**（共48个字段）：

| 序号 | 字段英文名 | 字段中文名 | 数据类型 | 说明 | 示例值 |
|------|-----------|-----------|---------|------|--------|
| **基本信息** |
| 1 | `year` | 年份 | INTEGER | 数据年份 | 2025 |
| 2 | `half_year` | 半年度 | VARCHAR(20) | 格式：2025H1 | "2025H1" |
| 3 | `vendor` | 供应商 | VARCHAR(100) | 供应商名称 | "HP Inc" |
| 4 | `company` | 公司 | VARCHAR(100) | 公司全称 | "HP Inc" |
| 5 | `brand` | 品牌 | VARCHAR(100) | 品牌名 | "HP" |
| 6 | `country` | 国家代码 | VARCHAR(100) | ISO代码 | "US" |
| 7 | `product_category` | 产品类别 | VARCHAR(100) | Printer/MFP等 | "Printer" |
| 8 | `format` | 幅面 | VARCHAR(50) | A4/A3/Letter | "A4" |
| **产品类型** |
| 9 | `product` | 产品品类 | VARCHAR(255) | Laser/Inkjet | "Laser" |
| 10 | `product_detail` | 产品详情 | VARCHAR(255) | 具体产品类型 | "Monochrome Laser" |
| 11 | `model_name` | 型号名称 | VARCHAR(255) | 产品型号 | "LaserJet Pro 4001dn" |
| 12 | `color_type` | 彩机/黑白机 | VARCHAR(50) | **Color/Mono** | "Color" |
| 13 | `function_type` | 功能组合 | VARCHAR(100) | Print/Copy/Scan/Fax组合 | "Print/Copy/Scan" |
| **Function 拆分字段** |
| 14 | `has_print` | 有打印功能 | BOOLEAN | 是否支持打印 | true |
| 15 | `has_copy` | 有复印功能 | BOOLEAN | 是否支持复印 | false |
| 16 | `has_scan` | 有扫描功能 | BOOLEAN | 是否支持扫描 | false |
| 17 | `has_fax` | 有传真功能 | BOOLEAN | 是否支持传真 | false |
| 18 | `is_mfp` | 是否MFP | BOOLEAN | 是否多功能一体机 | false |
| **数值指标** |
| 19 | `units` | 销量 | FLOAT | 当期销量（台） | 125000 |
| 20 | `value_usd_m` | 销售额 | FLOAT | 销售额（百万美元） | 36.5 |
| **区域** |
| 21 | `global_region` | 全球区域 | VARCHAR(100) | Americas/EMEA/Asia-Pacific | "EMEA" |
| 22 | `region` | 区域 | VARCHAR(100) | 具体区域 | "Western Europe" |
| 23 | `channel` | 渠道 | VARCHAR(100) | 具体渠道 | "InDirect - eTailer" |
| 24 | `channel_group` | 渠道组 | VARCHAR(100) | 渠道分组 | "InDirect" |
| **速度规格** |
| 25 | `a4_mono_speed` | A4黑白速度 | FLOAT | ppm | 40 |
| 26 | `a4_color_speed` | A4彩机速度 | FLOAT | ppm | 0 |
| 27 | `speed_range_a4` | A4速度段 | VARCHAR(50) | 速度区间 | "Mono Laser 31-40 ppm" |
| 28 | `speed_range_laser_ink_iso` | Laser/Ink速度段 | VARCHAR(50) | ISO速度段 | "Mono 31-40" |
| **功能特性** |
| 29 | `wireless` | 无线打印 | VARCHAR(20) | Y/N | "Y" |
| 30 | `duplex` | 双面打印 | VARCHAR(20) | Y/N | "Y" |
| 31 | `adf` | 自动输稿器 | VARCHAR(20) | Y/N | "Y" |
| 32 | `network` | 网络打印 | VARCHAR(20) | Y/N | "Y" |
| 33 | `flatbed_sheetfed` | 平板/送纸器 | VARCHAR(50) | 扫描类型 | "Flatbed" |
| 34 | `ink_tank_cartridge` | 墨仓/墨盒 | VARCHAR(50) | 耗材类型 | "Ink Tank" |
| 35 | `oem` | OEM代工厂 | VARCHAR(100) | 代工厂商 | "HP" |
| 36 | `product_brand` | 产品品牌 | VARCHAR(100) | 产品系列品牌 | "Neverstop Laser" |
| **耗材/规格** |
| 37 | `black_toner_max_pages` | 黑白硒鼓寿命 | INTEGER | 页数 | 5000 |
| 38 | `color_toner_max_pages` | 彩硒鼓寿命 | INTEGER | 页数 | 0 |
| 39 | `duty_cycle` | 月负载量 | INTEGER | 每月最大打印量 | 80000 |
| 40 | `production_classification` | 生产级别 | VARCHAR(100) | 高/中/低端 | "N/A" |
| **系统字段** |
| 41 | `source_file` | 来源文件 | VARCHAR(255) | Excel文件名 | "IDC 2020-2025H1.xlsx" |
| 42 | `created_at` | 创建时间 | DATETIME | 创建时间戳 | 2026-04-16 10:30:00 |

### 1.2 字段特殊说明

#### 1.2.1 color_type 字段

**来源**：通过 `A4 Color Speed` 和 `Color Toner Max Pages` 推导

```python
def parse_color_type(row) -> str:
    color_speed = row["a4_color_speed"]
    color_toner = row["color_toner_max_pages"]
    if color_speed > 0 or color_toner > 0:
        return "Color"
    else:
        return "Mono"
```

**取值**：`Color`（彩机）、`Mono`（黑白机）

#### 1.2.2 product 字段

**取值**：`Laser`（激光打印机）、`Inkjet`（喷墨打印机）

#### 1.2.3 Function 拆分字段

| 字段 | 说明 |
|------|------|
| `has_print` | 有打印功能 |
| `has_copy` | 有复印功能 |
| `has_scan` | 有扫描功能 |
| `has_fax` | 有传真功能 |
| `is_mfp` | 是否多功能一体机 (len(parts) > 1) |

---

## 二、筛选体系规格

### 2.1 筛选维度定义（共18个）

#### 2.1.1 时间维度（2个）

| 维度字段 | 中文名 | 数据来源 | 示例值 |
|---------|--------|---------|--------|
| `years` | 年份 | `year` | ["2025", "2024", "2023", "2022", "2021", "2020"] |
| `half_years` | 半年度 | `half_year` | ["2025H1", "2025H2", "2024H1", "2024H2"] |

#### 2.1.2 地理维度（3个）

| 维度字段 | 中文名 | 数据来源 | 示例值 |
|---------|--------|---------|--------|
| `global_regions` | 全球区域 | `global_region` | ["Americas", "EMEA", "Asia-Pacific"] |
| `regions` | 区域 | `region` | ["Western Europe", "North America", "Japan", "China"] |
| `countries` | 国家 | `country` | ["US", "CN", "DE", "JP", "UK"] |

#### 2.1.3 厂商维度（3个）

| 维度字段 | 中文名 | 数据来源 | 示例值 |
|---------|--------|---------|--------|
| `vendors` | 供应商 | `vendor` | ["HP Inc", "Canon Group", "Epson"] |
| `companies` | 公司 | `company` | ["HP Inc", "Canon Group"] |
| `brands` | 品牌 | `brand` | ["HP", "Canon", "Brother", "Epson"] |

#### 2.1.4 产品维度（6个）

| 维度字段 | 中文名 | 数据来源 | 示例值 |
|---------|--------|---------|--------|
| `product_categories` | 产品类别 | `product_category` | ["Printer", "MFP"] |
| `products` | 产品品类 | `product` | ["Laser", "Inkjet"] |
| `formats` | 幅面 | `format` | ["A4", "A3", "Letter"] |
| `color_types` | 彩机/黑白机 | `color_type` | ["Color", "Mono"] |
| `function_types` | 功能组合 | `function_type` | ["Print", "Print/Copy", "Print/Copy/Scan"] |
| `speed_ranges` | 速度段 | `speed_range_a4` | ["Mono 1-20", "Mono 21-30", "Color 21-30"] |

#### 2.1.5 渠道维度（2个）

| 维度字段 | 中文名 | 数据来源 | 示例值 |
|---------|--------|---------|--------|
| `channels` | 渠道 | `channel` | ["InDirect - eTailer", "Direct - Retail"] |
| `channel_groups` | 渠道组 | `channel_group` | ["InDirect", "Direct"] |

#### 2.1.6 技术特性维度（10个）

| 维度字段 | 中文名 | 数据来源 | 示例值 |
|---------|--------|---------|--------|
| `ink_types` | 墨仓/墨盒 | `ink_tank_cartridge` | ["Ink Tank", "Ink Cartridge"] |
| `production_classifications` | 生产级别 | `production_classification` | ["Entry", "Mid-Range", "High-End"] |
| `business_inkjet_details` | 商用喷墨细分 | `business_inkjet_detail` | ["Not Business Inkjet", "Business Inkjet"] |
| `laser_product_details` | 激光产品细分 | `product_detail` | ["Monochrome Laser", "Color Laser"] |
| `inkjet_product_details` | 喷墨产品细分 | `product_detail` | ["Inkjet All-in-One", "Inkjet Photo"] |
| `adf_options` | ADF自动输稿器 | `adf` | ["Y", "N"] |
| `duplex_options` | 双面打印 | `duplex` | ["Y", "N"] |
| `network_options` | 网络打印 | `network` | ["Y", "N"] |
| `wireless_options` | 无线打印 | `wireless` | ["Y", "N"] |
| `toner_capacity_ranges` | 硒鼓容量分段 | `black_toner_max_pages` | 见下表 |

**toner_capacity_ranges 硒鼓容量分段说明**：

| value | label | 条件 |
|-------|-------|------|
| `0` | 无数据（无硒鼓） | `black_toner_max_pages == 0` |
| `1-3000` | 1-3,000页 | `0 < pages <= 3000` |
| `3001-10000` | 3,001-10,000页 | `3000 < pages <= 10000` |
| `>10000` | >10,000页 | `pages > 10000` |

---

## 三、接口详细规格

### 3.1 筛选接口 `/api/idc/filters`

#### 3.1.1 获取筛选选项列表

**接口**：`GET /api/idc/filters/options`

**功能**：获取所有筛选维度的可选值列表

**前端调用**：页面初始化时获取所有筛选选项

**响应示例**：

```json
{
  "success": true,
  "data": {
    "years": ["2025", "2024", "2023", "2022", "2021", "2020"],
    "half_years": ["2025H1", "2025H2", "2024H1", "2024H2", "2023H1", "2023H2"],
    "brands": [{"value": "HP", "label": "HP"}, {"value": "Canon", "label": "Canon"}, ...],
    "countries": [{"value": "US", "label": "United States"}, {"value": "CN", "label": "China"}, ...],
    "products": ["Laser", "Inkjet"],
    "formats": [{"value": "A4", "label": "A4"}, {"value": "A3", "label": "A3"}, ...],
    "speed_ranges_a4": ["Mono 1-20 ppm", "Mono 21-30 ppm", "Color 21-30 ppm", ...],
    "ink_types": [{"value": "Ink Tank", "label": "Ink Tank"}, {"value": "Ink Cartridge", "label": "Ink Cartridge"}],
    "channels": [{"value": "Direct - Retail", "label": "Direct - Retail"}, ...],
    "global_regions": [{"value": "Americas", "label": "Americas"}, ...],
    "production_classifications": [{"value": "Entry", "label": "入门级"}, ...],
    "toner_capacity_ranges": [{"value": "0", "label": "无数据"}, {"value": "1-3000", "label": "1-3,000页"}, {"value": "3001-10000", "label": "3,001-10,000页"}, {"value": ">10000", "label": ">10,000页"}],
    "duplex_options": ["Y", "N"],
    "adf_options": ["Y", "N"],
    "network_options": ["Y", "N"],
    "wireless_options": ["Y", "N"],
    "oems": ["HP", "Canon", ...],
    "vendors": ["HP Inc", "Canon Group", ...],
    "companies": ["HP Inc", ...],
    "product_categories": ["Printer", "MFP"],
    "channel_groups": [{"value": "Direct", "label": "Direct"}, {"value": "InDirect", "label": "InDirect"}],
    "business_inkjet_details": [{"value": "Not Business Inkjet", "label": "Not Business Inkjet"}, ...],
    "laser_product_details": [{"value": "Monochrome Laser", "label": "Monochrome Laser"}, ...],
    "inkjet_product_details": [{"value": "Inkjet All-in-One", "label": "Inkjet All-in-One"}, ...]
  }
}
```

#### 3.1.2 应用筛选条件

**接口**：`POST /api/idc/filters/apply`

**功能**：应用筛选条件后，获取级联后的可选值

**前端调用**：选择某个筛选值后，获取依赖该值的下级选项

**请求示例**：

```json
{
  "filters": {
    "brands": ["HP"],
    "global_regions": ["EMEA"]
  }
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "years": ["2025", "2024", "2023", "2022", "2021", "2020"],
    "countries": ["DE", "UK", "FR", "IT"],
    "products": ["Laser", "Inkjet"],
    "color_types": ["Color", "Mono"]
  }
}
```

---

### 3.2 总览接口 `/api/idc/overview`

#### 3.2.1 获取市场KPI

**接口**：`GET /api/idc/overview/kpi`

**功能**：获取市场关键绩效指标

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `filters` | string | 否 | 筛选条件JSON字符串 |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "total_units": 125000000,
    "total_value": 35000.5,
    "asp": 280,
    "active_models": 15234,
    "countries_covered": 56,
    "yoy_change_units": 5.2,
    "yoy_change_value": 3.8,
    "mom_change_units": -2.1,
    "mom_change_value": -1.5
  }
}
```

#### 3.2.2 获取趋势图数据

**接口**：`GET /api/idc/overview/trend`

**功能**：获取市场趋势数据，支持多种趋势类型

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `trend_type` | string | 否 | `dual_axis` | 趋势类型 |
| `top_n` | int | 否 | 10 | 品牌数量（brand_share类型时使用） |
| `filters` | string | 否 | - | 筛选条件JSON字符串 |

**trend_type 可选值**：
| 值 | 说明 |
|---|------|
| `dual_axis` | 双轴图（销量+销售额） |
| `region_stacked` | 区域堆叠图 |
| `brand_share` | 品牌份额趋势 |

**响应示例**（dual_axis 类型）：

```json
{
  "success": true,
  "data": {
    "periods": ["2020H1", "2020H2", "2021H1", "2021H2", "2022H1", "2022H2"],
    "units": [58000000, 62000000, 65000000, 68000000, 71000000, 74000000],
    "values": [16240, 17360, 18200, 19040, 19880, 20720]
  }
}
```

#### 3.2.3 获取品牌分布

**接口**：`GET /api/idc/overview/brand`

**功能**：获取品牌分布数据

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 否 | `top_n` | 类型 |
| `brands` | string | 否 | - | 品牌列表逗号分隔（compare类型时使用） |
| `filters` | string | 否 | - | 筛选条件JSON字符串 |

**type 可选值**：
| 值 | 说明 |
|---|------|
| `top_n` | TOP N品牌排名 |
| `oem` | OEM品牌分布 |
| `compare` | 品牌对比 |

**响应示例**（top_n 类型）：

```json
{
  "success": true,
  "data": {
    "brands": [
      { "rank": 1, "name": "HP", "units": 35000000, "share": 28.0, "value": 9800 },
      { "rank": 2, "name": "Canon", "units": 25000000, "share": 20.0, "value": 7000 }
    ],
    "total_units": 125000000
  }
}
```

---

### 3.3 地理分析接口 `/api/idc/geo`

#### 3.3.1 获取国家排名热力图

**接口**：`GET /api/idc/geo/heatmap`

**功能**：获取按销量/销售额排名的国家列表

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `metric` | string | 否 | `units` | 指标 |
| `filters` | string | 否 | - | 筛选条件JSON字符串 |

**metric 可选值**：`units`（销量）、`value`（销售额）、`asp`（平均单价）

**响应示例**：

```json
{
  "success": true,
  "data": [
    { "rank": 1, "country_code": "US", "country_name": "United States", "units": 25000000, "value": 7000, "asp": 280 },
    { "rank": 2, "country_code": "CN", "country_name": "China", "units": 22000000, "value": 5500, "asp": 250 }
  ]
}
```

#### 3.3.2 获取国家详情

**接口**：`GET /api/idc/geo/country/{country_code}`

**功能**：获取指定国家的详细数据

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `country_code` | string | 是 | 国家代码，如 "US"、"CN" |

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `filters` | string | 否 | 筛选条件JSON字符串 |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "country_code": "US",
    "country_name": "United States",
    "kpi": { "units": 25000000, "value": 7000, "asp": 280, "active_models": 850 },
    "top_brands": [...],
    "top_models": [...],
    "trend": { "periods": [...], "units": [...], "value": [...] }
  }
}
```

#### 3.3.3 对比国家/区域

**接口**：`GET /api/idc/geo/compare`

**功能**：对比多个国家/区域的数据

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `countries` | string | 是 | 国家代码逗号分隔（2-4个） |
| `filters` | string | 否 | 筛选条件JSON字符串 |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "US",
        "type": "country",
        "units": 25000000,
        "value": 7000,
        "asp": 280,
        "active_models": 850,
        "brand_structure": [
          { "brand": "HP", "units": 7500000, "share": 30.0 },
          { "brand": "Canon", "units": 5000000, "share": 20.0 }
        ],
        "trend": { "periods": [...], "units": [...], "value": [...] }
      }
    ]
  }
}
```

---

### 3.4 透视表接口 `/api/idc/explore`

#### 3.4.1 查询透视数据

**接口**：`POST /api/idc/explore/pivot`

**功能**：自定义透视表查询

**请求示例**：

```json
{
  "row_fields": [
    { "value": "brand", "label": "品牌" },
    { "value": "country", "label": "国家" }
  ],
  "col_field": { "value": "half_year", "label": "半年度" },
  "value_fields": [
    { "aggregation": "sum_units", "source_field": "units", "label": "销量", "format": "number", "decimal_places": 0 },
    { "aggregation": "sum_value", "source_field": "value_usd_m", "label": "销售额(百万美元)", "format": "number", "decimal_places": 2 },
    { "aggregation": "market_share", "source_field": "units", "label": "市场份额", "format": "percent", "decimal_places": 2 }
  ],
  "filters": {
    "years": ["2025"],
    "products": ["Laser"],
    "color_types": ["Color"]
  },
  "sort_field": "销量",
  "sort_order": "desc",
  "page": 1,
  "page_size": 50
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "headers": [
      ["品牌", "国家", "2024H2 销量", "2025H1 销量"],
      ["品牌", "国家", "2024H2 市场份额", "2025H1 市场份额"]
    ],
    "rows": [
      { "品牌": "HP", "国家": "美国", "2024H2 销量": 5500000, "2025H1 销量": 5550000 }
    ],
    "totals": { "2024H2 销量": 24450000, "2025H1 销量": 24360000 },
    "grand_totals": { "销量": 48810000, "市场份额": "100%" },
    "total_count": 128,
    "page": 1,
    "page_size": 50,
    "computation_time_ms": 45
  }
}
```

#### 3.4.2 获取预置模板

**接口**：`GET /api/idc/explore/templates`

**功能**：获取预置的透视表模板

**响应示例**：

```json
{
  "success": true,
  "data": [
    {
      "id": "tpl_001",
      "name": "全球激光打印机品牌份额",
      "description": "按半年度展示全球激光市场主要品牌销量和市场份额",
      "category": "market_overview",
      "row_fields": [{ "value": "brand", "label": "品牌" }],
      "col_field": { "value": "half_year", "label": "半年度" },
      "value_configs": [
        { "aggregation": "sum_units", "source_field": "units", "label": "销量", "format": "number" },
        { "aggregation": "market_share", "source_field": "units", "label": "市场份额", "format": "percent" }
      ],
      "is_system": true
    }
  ]
}
```

---

### 3.5 产品对比接口 `/api/idc/product`

#### 3.5.1 搜索产品

**接口**：`GET /api/idc/product/search`

**功能**：搜索产品型号

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `keyword` | string | 否 | "" | 搜索关键词 |
| `brand` | string | 否 | "" | 品牌筛选 |
| `format` | string | 否 | "" | 幅面筛选 |
| `limit` | int | 否 | 10 | 返回数量（1-50） |

**响应示例**：

```json
{
  "success": true,
  "data": [
    {
      "model_key": "hp_laserjet_pro_4001dn",
      "model_name": "LaserJet Pro 4001dn",
      "brand": "HP",
      "product": "Laser",
      "format": "A4",
      "color_type": "Mono",
      "units": 125000,
      "asp": 289
    }
  ]
}
```

#### 3.5.2 对比产品

**接口**：`GET /api/idc/product/compare`

**功能**：对比多个产品的数据

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `model_keys` | string | 是 | - | 产品型号key，逗号分隔（2-4个） |
| `compare_type` | string | 否 | `spec` | 对比类型 |
| `filters` | string | 否 | - | 筛选条件JSON字符串 |

**compare_type 可选值**：
| 值 | 说明 |
|---|------|
| `spec` | 规格对比 |
| `market` | 市场表现对比 |
| `region` | 区域表现对比 |
| `channel` | 渠道表现对比 |
| `trend` | 趋势对比 |

**响应示例**（spec 类型）：

```json
{
  "success": true,
  "data": {
    "type": "spec",
    "models": [
      {
        "model_key": "hp_laserjet_pro_4001dn",
        "model_name": "LaserJet Pro 4001dn",
        "brand": "HP",
        "specs": {
          "product": "Laser",
          "color_type": "Mono",
          "format": "A4",
          "speed": 40,
          "duplex": "Y",
          "network": "Y",
          "adf": "Y",
          "tray_size": "250"
        }
      }
    ]
  }
}
```

---

### 3.6 渠道分析接口 `/api/idc/channel`

#### 3.6.1 渠道桑基图

**接口**：`GET /api/idc/channel/sankey`

**功能**：获取渠道桑基图数据，展示渠道到品牌的流量分布

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `metric` | string | 否 | `units` | 指标：`units`/`value` |
| `filters` | string | 否 | - | 筛选条件JSON字符串 |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "nodes": [
      { "id": "InDirect - eTailer", "type": "channel", "value": 45000000 },
      { "id": "HP", "type": "brand", "value": 15000000 },
      { "id": "Canon", "type": "brand", "value": 12000000 }
    ],
    "links": [
      { "source": "InDirect - eTailer", "target": "HP", "value": 15000000 },
      { "source": "InDirect - eTailer", "target": "Canon", "value": 12000000 }
    ]
  }
}
```

#### 3.6.2 线上线下趋势

**接口**：`GET /api/idc/channel/online_offline`

**功能**：获取线上线下渠道趋势数据

> **注意**：`Direct` = 线下，`InDirect` = 线上（估算）

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `filters` | string | 否 | 筛选条件JSON字符串 |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "periods": ["2020H1", "2020H2", "2021H1", "2021H2"],
    "online": [28000000, 30000000, 32000000, 34000000],
    "offline": [30000000, 32000000, 33000000, 40000000]
  }
}
```

#### 3.6.3 渠道堆叠图

**接口**：`GET /api/idc/channel/stacked`

**功能**：获取品牌×渠道堆叠图数据

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `top_n_brands` | int | 否 | 10 | 品牌数量（1-50） |
| `filters` | string | 否 | - | 筛选条件JSON字符串 |

**响应示例**：

```json
{
  "success": true,
  "data": {
    "brands": ["HP", "Canon", "Brother", "Epson"],
    "channels": ["Direct - Retail", "InDirect - eTailer", "InDirect - Dealer"],
    "data": [
      { "brand": "HP", "Direct - Retail": 5000000, "InDirect - eTailer": 8000000, "InDirect - Dealer": 2000000 },
      { "brand": "Canon", "Direct - Retail": 4000000, "InDirect - eTailer": 6000000, "InDirect - Dealer": 2000000 }
    ]
  }
}
```

---

### 3.7 价格分析接口 `/api/idc/price`

#### 3.7.1 价格段分析

**接口**：`GET /api/idc/price/segments`

**功能**：价格段分析，支持多种分析类型

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `segment_type` | string | 否 | `market_capacity` | 分析类型 |
| `filters` | string | 否 | - | 筛选条件JSON字符串 |

**segment_type 可选值**：
| 值 | 说明 |
|---|------|
| `market_capacity` | 市场容量分段 |
| `brand_position` | 品牌价格定位 |
| `asp_trend` | ASP趋势 |
| `brand_asp_compare` | 品牌ASP对比 |

**响应示例**（market_capacity 类型）：

```json
{
  "success": true,
  "data": {
    "type": "market_capacity",
    "segments": [
      { "name": "入门级", "range": "入门级", "units": 15000000, "share": 12.0 },
      { "name": "主流", "range": "主流", "units": 35000000, "share": 28.0 },
      { "name": "中高端", "range": "中高端", "units": 40000000, "share": 32.0 },
      { "name": "高端", "range": "高端", "units": 25000000, "share": 20.0 },
      { "name": "专业级", "range": "专业级", "units": 10000000, "share": 8.0 }
    ]
  }
}
```

---

### 3.8 技术分析接口 `/api/idc/tech`

#### 3.8.1 墨仓分析

**接口**：`GET /api/idc/tech/ink_tank`

**功能**：墨仓(Tank)墨水技术分析

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `analysis_type` | string | 否 | `overall` | 分析类型 |
| `drilldown_type` | string | 否 | `country` | 下钻类型（drilldown时使用） |
| `filters` | string | 否 | - | 筛选条件JSON字符串 |

**analysis_type 可选值**：
| 值 | 说明 |
|---|------|
| `overall` | 整体墨仓vs墨盒份额 |
| `region` | 区域墨仓分布 |
| `brand` | 品牌墨仓布局 |
| `drilldown` | 下钻分析 |

**响应示例**（overall 类型）：

```json
{
  "success": true,
  "data": {
    "type": "overall",
    "ink_tank_units": 45000000,
    "ink_tank_share": 36.0,
    "cartridge_units": 80000000,
    "cartridge_share": 64.0
  }
}
```

#### 3.8.2 速度段分析

**接口**：`GET /api/idc/tech/speed_segment`

**功能**：打印速度段分析

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `analysis_type` | string | 否 | `capacity` | 分析类型 |
| `filters` | string | 否 | - | 筛选条件JSON字符串 |

**analysis_type 可选值**：
| 值 | 说明 |
|---|------|
| `capacity` | 各速度段市场容量 |
| `brand_share` | 速度段品牌份额 |
| `scatter` | 速度-价格散点图 |
| `trend` | 速度段趋势 |

**响应示例**（capacity 类型）：

```json
{
  "success": true,
  "data": {
    "type": "capacity",
    "segments": [
      { "range": "1-20 ppm", "units": 25000000, "share": 20.0, "avg_price": 150 },
      { "range": "21-40 ppm", "units": 55000000, "share": 44.0, "avg_price": 280 },
      { "range": "41-60 ppm", "units": 30000000, "share": 24.0, "avg_price": 450 },
      { "range": "60+ ppm", "units": 15000000, "share": 12.0, "avg_price": 680 }
    ]
  }
}
```

#### 3.8.3 MFP功能分析

**接口**：`GET /api/idc/tech/mfp_function`

**功能**：MFP(Multi-Function Printer)多功能打印机功能分析

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `analysis_type` | string | 否 | `coverage` | 分析类型 |
| `filters` | string | 否 | - | 筛选条件JSON字符串 |

**analysis_type 可选值**：
| 值 | 说明 |
|---|------|
| `coverage` | 各功能(打印/复印/扫描/传真/ADF)覆盖率 |
| `combination` | 功能组合分析 |
| `brand_diff` | 品牌功能差异 |
| `region_diff` | 区域功能差异 |

**响应示例**（coverage 类型）：

```json
{
  "success": true,
  "data": {
    "type": "coverage",
    "functions": [
      { "function": "Print", "coverage": 100.0, "units": 125000000 },
      { "function": "Copy", "coverage": 68.5, "units": 85625000 },
      { "function": "Scan", "coverage": 65.2, "units": 81500000 },
      { "function": "Fax", "coverage": 35.8, "units": 44750000 },
      { "function": "ADF", "coverage": 55.0, "units": 68750000 }
    ]
  }
}
```

---

### 3.9 排行接口 `/api/idc/rank`

#### 3.9.1 获取排名数据

**接口**：`GET /api/idc/rank`

**功能**：获取各类排名数据

**Query 参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `rank_type` | string | 否 | `brand` | 排名类型 |
| `sort_by` | string | 否 | `units` | 排序字段 |
| `order` | string | 否 | `desc` | 排序方向 |
| `top_n` | int | 否 | 10 | 返回前N条（1-100） |
| `page` | int | 否 | 1 | 页码 |
| `page_size` | int | 否 | 10 | 每页条数（1-100） |
| `filters` | string | 否 | - | 筛选条件JSON字符串 |

**rank_type 可选值**：
| 值 | 说明 |
|---|------|
| `brand` | 品牌排名 |
| `country` | 国家排名 |
| `region` | 区域排名 |
| `model` | 型号排名 |
| `oem` | OEM排名 |

**sort_by 可选值**：`units`（销量）、`value`（销售额）、`asp`（平均单价）

**响应示例**：

```json
{
  "success": true,
  "data": {
    "type": "brand",
    "items": [
      { "rank": 1, "name": "HP", "units": 35000000, "value": 9800, "share": 28.0, "asp": 280 },
      { "rank": 2, "name": "Canon", "units": 25000000, "value": 7000, "share": 20.0, "asp": 280 },
      { "rank": 3, "name": "Brother", "units": 15000000, "value": 4200, "share": 12.0, "asp": 280 }
    ],
    "total_count": 25,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 3.10 导出接口 `/api/idc/export`

#### 3.10.1 导出当前视图

**接口**：`POST /api/idc/export/current_view`

**功能**：导出当前筛选/透视视图的数据

**请求示例**：

```json
{
  "filters": {
    "years": ["2025"],
    "products": ["Laser"],
    "brands": ["HP", "Canon"]
  },
  "export_type": "pivot",
  "format": "excel"
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "download_url": "/api/downloads/idc_export_20250416_103000.xlsx",
    "filename": "IDC数据导出_20250416_103000.xlsx",
    "record_count": 125000,
    "expires_at": "2026-04-17T10:30:00Z"
  }
}
```

#### 3.10.2 导出原始数据

**接口**：`POST /api/idc/export/raw_data`

**功能**：导出原始数据明细

**请求示例**：

```json
{
  "filters": {
    "years": ["2025"],
    "half_years": ["2025H1"]
  },
  "format": "csv"
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "download_url": "/api/downloads/idc_raw_20250416_103000.csv",
    "filename": "IDC原始数据_20250416_103000.csv",
    "record_count": 425051,
    "expires_at": "2026-04-17T10:30:00Z"
  }
}
```

---

## 四、接口汇总表

### 4.1 所有 IDC 接口一览

| 序号 | 模块 | 接口路径 | 方法 | 功能 |
|------|------|---------|------|------|
| 1 | 筛选 | `/api/idc/filters/options` | GET | 获取筛选选项 |
| 2 | 筛选 | `/api/idc/filters/apply` | POST | 应用筛选条件 |
| 3 | 总览 | `/api/idc/overview/kpi` | GET | 获取市场KPI |
| 4 | 总览 | `/api/idc/overview/trend` | GET | 趋势图数据 |
| 5 | 总览 | `/api/idc/overview/brand` | GET | 品牌分布 |
| 6 | 地理 | `/api/idc/geo/heatmap` | GET | 国家热力图 |
| 7 | 地理 | `/api/idc/geo/country/{country_code}` | GET | 国家详情 |
| 8 | 地理 | `/api/idc/geo/compare` | GET | 国家对比 |
| 9 | 透视 | `/api/idc/explore/pivot` | POST | 透视表查询 |
| 10 | 透视 | `/api/idc/explore/templates` | GET | 预置模板 |
| 11 | 产品 | `/api/idc/product/search` | GET | 产品搜索 |
| 12 | 产品 | `/api/idc/product/compare` | GET | 产品对比 |
| 13 | 渠道 | `/api/idc/channel/sankey` | GET | 渠道桑基图 |
| 14 | 渠道 | `/api/idc/channel/online_offline` | GET | 线上线下趋势 |
| 15 | 渠道 | `/api/idc/channel/stacked` | GET | 渠道堆叠图 |
| 16 | 价格 | `/api/idc/price/segments` | GET | 价格段分析 |
| 17 | 技术 | `/api/idc/tech/ink_tank` | GET | 墨仓分析 |
| 18 | 技术 | `/api/idc/tech/speed_segment` | GET | 速度段分析 |
| 19 | 技术 | `/api/idc/tech/mfp_function` | GET | MFP功能分析 |
| 20 | 排行 | `/api/idc/rank` | GET | 排名数据 |
| 21 | 导出 | `/api/idc/export/current_view` | POST | 导出当前视图 |
| 22 | 导出 | `/api/idc/export/raw_data` | POST | 导出原始数据 |

### 4.2 筛选参数说明

所有分析接口（除筛选接口外）均支持 `filters` 参数，格式为JSON字符串：

```json
{
  "years": ["2025"],
  "half_years": ["2025H1"],
  "brands": ["HP", "Canon"],
  "countries": ["US", "CN"],
  "products": ["Laser"],
  "color_types": ["Color"],
  "formats": ["A4"],
  "channels": ["InDirect - eTailer"],
  "global_regions": ["Americas"],
  "regions": ["North America"],
  "product_categories": ["Printer"]
}
```

**筛选参数为可选，不传则返回全量数据。**

---

## 五、认证与权限

### 5.1 认证方式

所有 IDC 接口需要 JWT Token 认证：

```
Authorization: Bearer <jwt_token>
```

### 5.2 权限要求

| 权限标识 | 说明 |
|---------|------|
| `dashboard:read` | 读取仪表盘数据（所有 IDC 接口需要此权限） |

### 5.3 获取 Token

**接口**：`POST /api/auth/login`

**请求**：
```json
{
  "username": "admin",
  "password": "password"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400
  }
}
```

---

## 六、错误处理

### 6.1 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "参数错误：years 必须是有效年份",
    "details": {}
  }
}
```

### 6.2 错误码说明

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| `INVALID_PARAMETER` | 400 | 参数错误 |
| `UNAUTHORIZED` | 401 | 未认证 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

---

## 七、附录

### 7.1 字段名称对照表

**数据库字段** → **API响应字段**（已统一，无需转换）：

| 数据库字段 | API字段 | 说明 |
|-----------|--------|------|
| `year` | `year` | 年份 |
| `half_year` | `half_year` | 半年度 |
| `brand` | `brand` | 品牌 |
| `country` | `country` | 国家代码 |
| `product` | `product` | 产品品类（Laser/Inkjet） |
| `color_type` | `color_type` | 彩机/黑白机（Color/Mono） |
| `units` | `units` | 销量 |
| `value_usd_m` | `value` | 销售额（百万美元） |
| `channel` | `channel` | 渠道 |
| `global_region` | `global_region` | 全球区域 |

### 7.2 枚举值说明

| 字段 | 枚举值 |
|------|--------|
| `product` | `Laser`, `Inkjet` |
| `color_type` | `Color`, `Mono` |
| `format` | `A4`, `A3`, `Letter` |
| `function_type` | `Print`, `Print/Copy`, `Print/Copy/Scan`, `Print/Copy/Scan/Fax` |
| `wireless` / `duplex` / `adf` / `network` | `Y`, `N` |
| `ink_tank_cartridge` | `Ink Tank`, `Cartridge`, `N/A` |
| `global_region` | `Americas`, `EMEA`, `Asia-Pacific` |

### 7.3 数据统计

| 指标 | 值 |
|------|---|
| 总记录数 | 850,103 条 |
| 年份范围 | 2020 - 2025H1 |
| 国家数量 | 50+ |
| 品牌数量 | 15+ |
| 激光机占比 | ~68% |
| 喷墨机占比 | ~32% |
| 彩机占比 | ~51% |
| 黑白机占比 | ~49% |

---

> **文档说明**：
> - 共22个 IDC 接口，全部已实现并测试通过
> - 字段名称已与数据库对齐，无需额外转换
> - `color_type` 和 `product` 字段为新增，需前端特别注意
> - 所有筛选接口支持 `filters` 参数进行数据过滤
> - 所有接口均需认证（JWT Token）和 `dashboard:read` 权限
