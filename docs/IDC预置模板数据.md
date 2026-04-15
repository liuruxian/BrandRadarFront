# IDC 预置模板数据

> 生成时间：2026-04-15
> 用途：后端创建模板表时需要初始化的预置数据
> 模板总数：24个
> 区分字段：`is_system` (system=预置模板, custom=自定义模板)

---

## 一、模板表结构建议

```sql
CREATE TABLE idc_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    description TEXT COMMENT '模板描述',
    category VARCHAR(50) NOT NULL COMMENT '模板分类',
    category_label VARCHAR(50) COMMENT '分类中文名',
    row_fields JSON COMMENT '行维度配置',
    col_field JSON COMMENT '列维度配置',
    value_configs JSON COMMENT '值字段配置',
    suggested_filters JSON COMMENT '建议筛选条件',
    recommended_views JSON COMMENT '推荐视图',
    applicable_scenarios JSON COMMENT '适用场景',
    is_system BOOLEAN DEFAULT FALSE COMMENT 'TRUE=预置模板, FALSE=自定义模板',
    user_id VARCHAR(50) DEFAULT NULL COMMENT '创建用户ID，预置模板为NULL',
    share_status VARCHAR(20) DEFAULT 'private' COMMENT 'private/team/public',
    version INT DEFAULT 1 COMMENT '版本号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_is_system (is_system),
    INDEX idx_user_id (user_id),
    INDEX idx_category (category)
);
```

---

## 二、预置模板数据

### 2.1 市场概览类 (6个)

#### 1. 全球市场半年度趋势

```json
{
  "id": "global_halfyear_trend",
  "name": "全球市场半年度趋势",
  "description": "分析全球打印机市场的半年度销量和销售额变化趋势",
  "category": "market_overview",
  "category_label": "市场概览",
  "row_fields": ["Half Year"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "sum_value", "sourceField": "value", "label": "销售额", "format": "currency", "decimalPlaces": 2 },
    { "aggregation": "asp", "sourceField": "asp", "label": "ASP", "format": "currency", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["line", "bar"],
  "applicable_scenarios": ["季度复盘", "年度总结", "市场趋势分析"],
  "is_system": true
}
```

#### 2. 品牌年度销量排名

```json
{
  "id": "brand_year_ranking",
  "name": "品牌年度销量排名",
  "description": "按年度统计各品牌的销量和销售额排名",
  "category": "market_overview",
  "category_label": "市场概览",
  "row_fields": ["Year", "Brand"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "market_share", "sourceField": "units", "label": "份额", "format": "percent", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar"],
  "applicable_scenarios": ["品牌竞争分析", "市场份额追踪"],
  "is_system": true
}
```

#### 3. 区域市场份额分布

```json
{
  "id": "region_market_share",
  "name": "区域市场份额分布",
  "description": "分析各全球区域的市场份额占比",
  "category": "market_overview",
  "category_label": "市场概览",
  "row_fields": ["Global Region"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "market_share", "sourceField": "units", "label": "份额", "format": "percent", "decimalPlaces": 2 },
    { "aggregation": "asp", "sourceField": "asp", "label": "ASP", "format": "currency", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["pie", "bar"],
  "applicable_scenarios": ["区域市场分析", "市场潜力评估"],
  "is_system": true
}
```

#### 4. 激光 vs 喷墨品类对比

```json
{
  "id": "laser_vs_inkjet_compare",
  "name": "激光 vs 喷墨品类对比",
  "description": "对比分析激光打印机和喷墨打印机的市场份额",
  "category": "market_overview",
  "category_label": "市场概览",
  "row_fields": ["Product"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "sum_value", "sourceField": "value", "label": "销售额", "format": "currency", "decimalPlaces": 2 },
    { "aggregation": "category_units_pct", "sourceField": "units", "label": "品类占比", "format": "percent", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["pie", "bar"],
  "applicable_scenarios": ["品类对比", "产品策略制定"],
  "is_system": true
}
```

#### 5. 渠道结构分析

```json
{
  "id": "channel_structure",
  "name": "渠道结构分析",
  "description": "分析不同渠道的销售占比和效率",
  "category": "market_overview",
  "category_label": "市场概览",
  "row_fields": ["Channel Group", "Channel"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "value_share", "sourceField": "value", "label": "销售额占比", "format": "percent", "decimalPlaces": 2 },
    { "aggregation": "channel_efficiency", "sourceField": "units", "label": "渠道效率", "format": "ratio", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar"],
  "applicable_scenarios": ["渠道策略分析", "渠道优化"],
  "is_system": true
}
```

#### 6. 高端机型市场占比

```json
{
  "id": "highend_market_share",
  "name": "高端机型市场占比",
  "description": "分析高端机型在整体市场中的占比",
  "category": "market_overview",
  "category_label": "市场概览",
  "row_fields": ["Production Classification"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "highend_units_pct", "sourceField": "units", "label": "高端占比", "format": "percent", "decimalPlaces": 2 },
    { "aggregation": "asp", "sourceField": "asp", "label": "ASP", "format": "currency", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["pie", "bar"],
  "applicable_scenarios": ["产品结构分析", "高端市场定位"],
  "is_system": true
}
```

---

### 2.2 地理分析类 (5个)

#### 7. 国家销量 Top 20

```json
{
  "id": "country_top20",
  "name": "国家销量 Top 20",
  "description": "展示销量最高的前20个国家",
  "category": "geo_analysis",
  "category_label": "地理分析",
  "row_fields": ["Country"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "market_share", "sourceField": "units", "label": "份额", "format": "percent", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar", "heatmap"],
  "applicable_scenarios": ["国家排名分析", "重点市场识别"],
  "is_system": true
}
```

#### 8. 区域×品牌交叉分析

```json
{
  "id": "region_brand_cross",
  "name": "区域×品牌交叉分析",
  "description": "分析各品牌在不同区域的市场表现",
  "category": "geo_analysis",
  "category_label": "地理分析",
  "row_fields": ["Global Region", "Brand"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "market_share", "sourceField": "units", "label": "份额", "format": "percent", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar"],
  "applicable_scenarios": ["区域品牌策略", "竞争格局分析"],
  "is_system": true
}
```

#### 9. 各国激光/喷墨偏好

```json
{
  "id": "country_laser_inkjet_preference",
  "name": "各国激光/喷墨偏好",
  "description": "分析各国家/地区对激光和喷墨产品的偏好差异",
  "category": "geo_analysis",
  "category_label": "地理分析",
  "row_fields": ["Country", "Product"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "category_units_pct", "sourceField": "units", "label": "品类占比", "format": "percent", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar"],
  "applicable_scenarios": ["区域产品策略", "市场需求分析"],
  "is_system": true
}
```

#### 10. 区域高端机型渗透率

```json
{
  "id": "region_highend_penetration",
  "name": "区域高端机型渗透率",
  "description": "分析各区域高端机型的渗透程度",
  "category": "geo_analysis",
  "category_label": "地理分析",
  "row_fields": ["Global Region", "Production Classification"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "highend_units_pct", "sourceField": "units", "label": "高端占比", "format": "percent", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar"],
  "applicable_scenarios": ["区域高端市场分析", "市场升级趋势"],
  "is_system": true
}
```

#### 11. 国家渠道效率对比

```json
{
  "id": "country_channel_efficiency",
  "name": "国家渠道效率对比",
  "description": "对比各国家的渠道效率差异",
  "category": "geo_analysis",
  "category_label": "地理分析",
  "row_fields": ["Country", "Channel Group"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "channel_efficiency", "sourceField": "units", "label": "渠道效率", "format": "ratio", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar"],
  "applicable_scenarios": ["渠道效率分析", "分销优化"],
  "is_system": true
}
```

---

### 2.3 技术分析类 (6个)

#### 12. 激光机速度段分布

```json
{
  "id": "laser_speed_distribution",
  "name": "激光机速度段分布",
  "description": "分析激光打印机的速度段市场分布",
  "category": "tech_analysis",
  "category_label": "技术分析",
  "row_fields": ["Speed Range A4"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "market_share", "sourceField": "units", "label": "份额", "format": "percent", "decimalPlaces": 2 },
    { "aggregation": "avg_units", "sourceField": "units", "label": "平均销量", "format": "number", "decimalPlaces": 0 }
  ],
  "suggested_filters": { "product_type": "laser" },
  "recommended_views": ["table", "bar", "pie"],
  "applicable_scenarios": ["产品定位", "技术趋势分析"],
  "is_system": true
}
```

#### 13. 喷墨机墨仓式渗透率

```json
{
  "id": "inkjet_inktype_penetration",
  "name": "喷墨机墨仓式渗透率",
  "description": "分析喷墨打印机中墨仓式vs墨盒式的渗透率",
  "category": "tech_analysis",
  "category_label": "技术分析",
  "row_fields": ["Ink Tank/ Ink Cartridge"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "inktank_penetration", "sourceField": "units", "label": "渗透率", "format": "percent", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "inkjet" },
  "recommended_views": ["table", "pie"],
  "applicable_scenarios": ["耗材技术分析", "产品创新评估"],
  "is_system": true
}
```

#### 14. MFP 功能普及率

```json
{
  "id": "mfp_function_penetration",
  "name": "MFP 功能普及率",
  "description": "分析MFP多功能一体机各功能的普及程度",
  "category": "tech_analysis",
  "category_label": "技术分析",
  "row_fields": ["Product Category"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "mfp_pct", "sourceField": "units", "label": "MFP占比", "format": "percent", "decimalPlaces": 2 },
    { "aggregation": "function_penetration", "sourceField": "units", "label": "功能普及率", "format": "percent", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar"],
  "applicable_scenarios": ["功能需求分析", "产品功能规划"],
  "is_system": true
}
```

#### 15. A3幅面市场占比

```json
{
  "id": "a3_format_market",
  "name": "A3幅面市场占比",
  "description": "分析A3幅面打印机在市场的占比",
  "category": "tech_analysis",
  "category_label": "技术分析",
  "row_fields": ["Format", "Brand"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "a3_format_pct", "sourceField": "units", "label": "A3占比", "format": "percent", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "pie"],
  "applicable_scenarios": ["幅面市场分析", "产品线规划"],
  "is_system": true
}
```

#### 16. 功能配置×品牌矩阵

```json
{
  "id": "function_brand_matrix",
  "name": "功能配置×品牌矩阵",
  "description": "分析各品牌的功能配置分布",
  "category": "tech_analysis",
  "category_label": "技术分析",
  "row_fields": ["Brand", "ADF", "Duplex", "Wireless"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "function_penetration", "sourceField": "units", "label": "功能普及率", "format": "percent", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table"],
  "applicable_scenarios": ["功能竞争分析", "差异化策略"],
  "is_system": true
}
```

#### 17. 生产级设备专项分析

```json
{
  "id": "production_grade_analysis",
  "name": "生产级设备专项分析",
  "description": "分析生产级打印机的市场表现",
  "category": "tech_analysis",
  "category_label": "技术分析",
  "row_fields": ["Production Classification", "Brand"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "sum_value", "sourceField": "value", "label": "销售额", "format": "currency", "decimalPlaces": 2 },
    { "aggregation": "asp", "sourceField": "asp", "label": "ASP", "format": "currency", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar"],
  "applicable_scenarios": ["生产级市场分析", "高端产品策略"],
  "is_system": true
}
```

---

### 2.4 商业分析类 (5个)

#### 18. 价格段分布分析

```json
{
  "id": "price_segment_analysis",
  "name": "价格段分布分析",
  "description": "分析不同价格段的市场分布",
  "category": "business_analysis",
  "category_label": "商业分析",
  "row_fields": ["Brand"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "price_segment_units", "sourceField": "units", "label": "价格段销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "asp", "sourceField": "asp", "label": "ASP", "format": "currency", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar"],
  "applicable_scenarios": ["价格策略", "市场定位"],
  "is_system": true
}
```

#### 19. ASP 趋势与品牌对比

```json
{
  "id": "asp_trend_brand_compare",
  "name": "ASP 趋势与品牌对比",
  "description": "分析各品牌ASP的变化趋势",
  "category": "business_analysis",
  "category_label": "商业分析",
  "row_fields": ["Year", "Brand"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "asp", "sourceField": "asp", "label": "ASP", "format": "currency", "decimalPlaces": 2 },
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "line"],
  "applicable_scenarios": ["价格趋势分析", "品牌定价策略"],
  "is_system": true
}
```

#### 20. 渠道×价格段交叉

```json
{
  "id": "channel_price_cross",
  "name": "渠道×价格段交叉",
  "description": "分析不同渠道的价格段分布",
  "category": "business_analysis",
  "category_label": "商业分析",
  "row_fields": ["Channel Group", "Brand"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "channel_efficiency", "sourceField": "units", "label": "渠道效率", "format": "ratio", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar"],
  "applicable_scenarios": ["渠道价格策略", "分销策略"],
  "is_system": true
}
```

#### 21. 品牌集中度 (CR5) 分析

```json
{
  "id": "cr5_concentration_analysis",
  "name": "品牌集中度 (CR5) 分析",
  "description": "分析行业品牌集中度CR5指标",
  "category": "business_analysis",
  "category_label": "商业分析",
  "row_fields": ["Year", "Global Region"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "cr5_concentration", "sourceField": "units", "label": "CR5", "format": "percent", "decimalPlaces": 2 },
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "line"],
  "applicable_scenarios": ["行业集中度分析", "竞争强度评估"],
  "is_system": true
}
```

#### 22. 高端机型渠道效率

```json
{
  "id": "highend_channel_efficiency",
  "name": "高端机型渠道效率",
  "description": "分析高端机型在不同渠道的销售效率",
  "category": "business_analysis",
  "category_label": "商业分析",
  "row_fields": ["Channel Group", "Production Classification"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "highend_units_pct", "sourceField": "units", "label": "高端占比", "format": "percent", "decimalPlaces": 2 },
    { "aggregation": "channel_efficiency", "sourceField": "units", "label": "渠道效率", "format": "ratio", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table", "bar"],
  "applicable_scenarios": ["高端渠道分析", "分销策略优化"],
  "is_system": true
}
```

---

### 2.5 深度洞察类 (2个)

#### 23. 品牌×速度段×区域三维

```json
{
  "id": "brand_speed_region_3d",
  "name": "品牌×速度段×区域三维",
  "description": "三维交叉分析品牌、速度段、区域的组合表现",
  "category": "deep_insight",
  "category_label": "深度洞察",
  "row_fields": ["Global Region", "Speed Range A4", "Brand"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "avg_units_per_model", "sourceField": "units", "label": "单型号销量", "format": "number", "decimalPlaces": 0 }
  ],
  "suggested_filters": { "product_type": "all" },
  "recommended_views": ["table"],
  "applicable_scenarios": ["多维竞争分析", "产品组合优化"],
  "is_system": true
}
```

#### 24. 墨仓式×区域×品牌交叉

```json
{
  "id": "inktype_region_brand_cross",
  "name": "墨仓式×区域×品牌交叉",
  "description": "分析墨仓式产品在各区域品牌的渗透情况",
  "category": "deep_insight",
  "category_label": "深度洞察",
  "row_fields": ["Global Region", "Brand", "Ink Tank/ Ink Cartridge"],
  "col_field": null,
  "value_configs": [
    { "aggregation": "sum_units", "sourceField": "units", "label": "销量", "format": "number", "decimalPlaces": 0 },
    { "aggregation": "inktank_penetration", "sourceField": "units", "label": "渗透率", "format": "percent", "decimalPlaces": 2 }
  ],
  "suggested_filters": { "product_type": "inkjet" },
  "recommended_views": ["table"],
  "applicable_scenarios": ["墨仓市场渗透", "区域产品策略"],
  "is_system": true
}
```

---

## 三、后端需实现的接口

### 3.1 预置模板接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/idc/templates/advanced` | GET | 获取所有预置模板（is_system=true） |
| `/api/idc/templates/my` | GET | 获取当前用户的自定义模板（is_system=false） |

### 3.2 模板管理接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/idc/templates` | POST | 创建自定义模板 |
| `/api/idc/templates/{id}` | PUT | 更新模板 |
| `/api/idc/templates/{id}` | DELETE | 删除模板 |
| `/api/idc/templates/{id}/clone` | POST | 复制模板 |

### 3.3 响应格式

```json
{
  "success": true,
  "data": [
    {
      "id": "global_halfyear_trend",
      "name": "全球市场半年度趋势",
      "description": "...",
      "category": "market_overview",
      "categoryLabel": "市场概览",
      "row_fields": ["Half Year"],
      "col_field": null,
      "value_configs": [...],
      "is_system": true
    }
  ]
}
```

### 3.4 创建/更新请求格式

```json
{
  "name": "我的模板",
  "description": "模板描述",
  "category": "market_overview",
  "row_fields": ["Brand"],
  "col_field": "Half Year",
  "value_configs": [...],
  "filters": {},
  "share_status": "private"
}
```

---

## 四、分类说明

| 分类 | category | 说明 |
|------|----------|------|
| market_overview | 市场概览 | 市场整体分析相关模板 |
| geo_analysis | 地理分析 | 区域、国家相关分析模板 |
| tech_analysis | 技术分析 | 技术规格、速度段等功能分析 |
| business_analysis | 商业分析 | 价格、渠道、商业指标分析 |
| deep_insight | 深度洞察 | 多维交叉、高复杂度分析 |

---

## 五、视图类型说明

| 视图类型 | 说明 |
|----------|------|
| table | 表格视图 |
| bar | 柱状图 |
| line | 折线图 |
| pie | 饼图 |
| heatmap | 热力图 |

---

## 六、统计量说明

| 统计量 | aggregation | 说明 |
|--------|-------------|------|
| **基础聚合** | | |
| sum_units | 销量求和 |
| sum_value | 销售额求和 |
| count_rows | 记录行数 |
| avg_units | 销量平均值 |
| avg_value | 销售额平均值 |
| max_units | 销量最大值 |
| max_value | 销售额最大值 |
| min_units | 销量最小值 |
| min_value | 销售额最小值 |
| count_models | 型号数量 |
| **核心衍生** | | |
| asp | 平均单价 |
| market_share | 市场份额 |
| value_share | 销售额占比 |
| category_units_pct | 品类销量占比 |
| inktank_penetration | 墨仓式渗透率 |
| function_penetration | 功能普及率 |
| a3_format_pct | A3幅面占比 |
| mfp_pct | MFP占比 |
| yoy_growth | 同比增长率 |
| hoh_growth | 环比增长率 |
| cumulative_units | 累计销量 |
| **高级分析** | | |
| cr5_concentration | 品牌集中度 |
| avg_units_per_model | 单型号平均销量 |
| channel_efficiency | 渠道效率 |
| speed_segment_count | 速度段分布计数 |
| price_segment_units | 价格段分布销量 |
| deviation_from_avg | 与均值偏差 |

**统计量分组**：
| 分组 | group | 说明 |
|------|-------|------|
| 基础聚合 | basic_agg | 求和、平均、计数、最大最小值等 |
| 核心衍生 | core_derived | ASP、份额、增长率等衍生指标 |
| 高级分析 | advanced_analysis | CR5、效率等高级指标 |

---

*文档结束*
