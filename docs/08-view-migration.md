# 视图改造指南 (View Migration)

> 将现有视图迁移到 BrandRadar UI v5 系统

---

## 改造概览

| 视图文件 | 图表数 | 改造内容 | 优先级 |
|---------|--------|---------|--------|
| `DashboardView.vue` | 1 | 饼图 v5 + 语义色 | P1 |
| `IDCOvOverviewView.vue` | 5 | v5 全部 + tooltip玻璃化 | P0 |
| `IDCGeographyView.vue` | 3 | v5 全部 + 渐变重置 | P1 |
| `IDCMarketExploreView.vue` | 4 | v5 全部 | P1 |
| `IDCTechSegmentView.vue` | 4 | v5 全部 + glow散点 | P1 |

---

## 改造原则

```
1. 颜色替换
   - 将硬编码颜色数组替换为 CHART_COLORS
   - 将随机色替换为 DataSemantic 语义色

2. Tooltip 升级
   - 将纯白 tooltip 替换为玻璃卡片风格

3. 组件替换
   - 将普通 div 卡片替换为 BaseCard
   - 将普通按钮替换为 BaseButton
   - 将普通表格替换为 BaseTable

4. 布局升级
   - 使用 AppLayout 统一布局
   - 使用 KPI Grid 布局统计卡片
```

---

## DashboardView.vue 改造

### 当前状态

- 1 个饼图（品牌分布）
- 颜色使用硬编码数组
- tooltip 使用纯白风格

### 改造步骤

**Step 1: 导入 v5 资源**

```typescript
import { CHART_COLORS, DataSemantic } from '@/const/chartSemantics'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseKPICard from '@/components/data/BaseKPICard.vue'
```

**Step 2: 替换颜色数组**

```typescript
// 改动前
const COLORS = ['#00C4CC', '#8A7FFF', '#10B981', '#F59E0B', '#FF6B6B', '#6366F1']

// 改动后
const COLORS = CHART_COLORS // 使用语义色板
```

**Step 3: 升级 tooltip**

```typescript
// 改动前
tooltip: {
  backgroundColor: '#FFFFFF',
  borderColor: '#E5E7EB',
  textStyle: { color: '#374151', fontSize: 12 },
}

// 改动后
tooltip: {
  backgroundColor: 'rgba(255, 255, 255, 0.88)',
  borderColor: 'rgba(102, 126, 234, 0.25)',
  borderWidth: 1,
  borderRadius: 12,
  padding: [12, 16],
  textStyle: {
    color: '#374151',
    fontSize: 12,
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  },
  extraCssText: [
    'box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 40px rgba(102, 126, 234, 0.2);',
    'backdrop-filter: blur(18px);',
  ].join(''),
}
```

**Step 4: 升级饼图 emphasis**

```typescript
// 改动后
emphasis: {
  itemStyle: {
    shadowBlur: 40,
    shadowColor: DataSemantic.primary,
    scale: 1.08,
  },
}
```

**Step 5: 替换卡片组件**

```vue
<!-- 改动前 -->
<div class="chart-card">
  <h3>品牌分布</h3>
  <BaseChartV5 :option="pieOption" />
</div>

<!-- 改动后 -->
<BaseCard class="chart-card" :hoverable="true">
  <template #header>
    <h3 class="card-title">品牌分布</h3>
  </template>
  <BaseChartV5 :option="pieOption" />
</BaseCard>
```

---

## IDCOvOverviewView.vue 改造

### 当前状态

- 5 个图表：双品类柱状图、区域堆叠图、品牌饼图/柱图、高端线图、OEM柱图
- 颜色使用多种硬编码数组
- tooltip 风格不统一

### 改造步骤

**Step 1: 统一导入**

```typescript
import { CHART_COLORS, DataSemantic } from '@/const/chartSemantics'
import BaseChartV5 from '@/components/idc/BaseChartV5.vue'
```

**Step 2: 统一颜色数组**

```typescript
// 改动前
const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6']

// 改动后
const colors = CHART_COLORS
```

**Step 3: 升级双品类柱状图**

```typescript
// 改动前
itemStyle: {
  color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [{ offset: 0, color: '#1890ff' }, { offset: 1, color: '#40a9ff' }] },
}

// 改动后
itemStyle: {
  color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: DataSemantic.primary },
      { offset: 1, color: '#818CF8' },
    ] },
  borderRadius: [6, 6, 0, 0],
}
```

**Step 4: 升级高端线图**

```typescript
// 改动前
lineStyle: { width: 2, color: '#8B5CF6' },
areaStyle: { color: 'rgba(139, 92, 246, 0.1)' },
itemStyle: { color: '#8B5CF6' },

// 改动后 — 使用语义色 + Glow
lineStyle: { width: 2.5, color: DataSemantic.accent },
areaStyle: {
  color: {
    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: `${DataSemantic.accent}20` },
      { offset: 1, color: `${DataSemantic.accent}02` },
    ],
  },
},
itemStyle: {
  color: DataSemantic.accent,
  borderWidth: 3,
  borderColor: '#FFFFFF',
  shadowBlur: 15,
  shadowColor: `${DataSemantic.accent}60`,
},
```

**Step 5: 统一所有 tooltip**

为每个图表的 tooltip 添加玻璃卡片样式：

```typescript
tooltip: {
  trigger: 'axis',
  backgroundColor: 'rgba(255, 255, 255, 0.88)',
  borderColor: 'rgba(102, 126, 234, 0.25)',
  borderWidth: 1,
  borderRadius: 12,
  padding: [12, 16],
  textStyle: { color: '#374151', fontSize: 12 },
  extraCssText: 'box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 40px rgba(102,126,234,0.2);',
}
```

---

## IDCGeographyView.vue 改造

### 当前状态

- 3 个图表：国家柱状图、国家趋势图、品牌饼图
- 渐变色使用蓝青配色
- tooltip 有额外阴影但不够统一

### 改造步骤

**Step 1: 替换渐变色**

```typescript
// 改动前
colorStops: [
  { offset: 0, color: '#3b82f6' },
  { offset: 1, color: '#06b6d4' },
]

// 改动后 — 品牌紫蓝渐变
colorStops: [
  { offset: 0, color: DataSemantic.primary },
  { offset: 1, color: DataSemantic.secondary },
]
```

**Step 2: 统一 tooltip**

```typescript
// 改动前
tooltip: {
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  borderColor: '#e2e8f0',
  extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
}

// 改动后 — v5 玻璃卡片
tooltip: {
  trigger: 'axis',
  backgroundColor: 'rgba(255, 255, 255, 0.88)',
  borderColor: 'rgba(102, 126, 234, 0.25)',
  borderWidth: 1,
  borderRadius: 12,
  padding: [12, 16],
  textStyle: { color: '#374151', fontSize: 12 },
  extraCssText: 'box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 40px rgba(102,126,234,0.2);',
}
```

**Step 3: 替换颜色数组**

```typescript
// 改动前
const brandColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6']

// 改动后
const brandColors = CHART_COLORS
```

---

## IDCMarketExploreView.vue 改造

### 当前状态

- 4 个图表：柱状图、饼图、折线图、热力图
- 颜色直接硬编码
- tooltip 风格简单

### 改造步骤

**Step 1: 统一颜色使用**

```typescript
// 在所有图表配置中使用 CHART_COLORS
import { CHART_COLORS } from '@/const/chartSemantics'

// 示例：柱状图
series: [{
  type: 'bar',
  data: seriesData,
  itemStyle: {
    color: CHART_COLORS[0], // 使用语义色板第一个颜色
    borderRadius: [6, 6, 0, 0],
  },
}]

// 示例：饼图
series: [{
  type: 'pie',
  data: data.map((d, i) => ({
    name: String(d[firstKey]),
    value: Number(d[secondKey]),
    itemStyle: {
      color: CHART_COLORS[i % CHART_COLORS.length],
      borderRadius: 6,
    },
  })),
}]
```

**Step 2: 升级 tooltip**

```typescript
tooltip: {
  trigger: 'axis', // 或 'item' 用于饼图
  backgroundColor: 'rgba(255, 255, 255, 0.88)',
  borderColor: 'rgba(102, 126, 234, 0.25)',
  borderWidth: 1,
  borderRadius: 12,
  padding: [12, 16],
  textStyle: { color: '#374151', fontSize: 12 },
  extraCssText: 'box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 40px rgba(102,126,234,0.2);',
}
```

---

## IDCTechSegmentView.vue 改造

### 当前状态

- 4 个图表：墨仓饼图、速度段柱图、速度-价格散点图、墨仓趋势图
- 颜色使用多种硬编码
- 散点图无特殊效果

### 改造步骤

**Step 1: 替换墨仓饼图颜色**

```typescript
// 改动前
{ name: '墨仓式', value: ..., itemStyle: { color: '#10B981' } },
{ name: '墨盒式', value: ..., itemStyle: { color: '#3B82F6' } },

// 改动后 — 使用语义色 + Glow
{
  name: '墨仓式',
  value: ...,
  itemStyle: {
    color: DataSemantic.success,
    shadowBlur: 10,
    shadowColor: 'rgba(16,185,129,0.3)',
  },
},
{
  name: '墨盒式',
  value: ...,
  itemStyle: {
    color: DataSemantic.primary,
    shadowBlur: 10,
    shadowColor: 'rgba(102,126,234,0.3)',
  },
},
```

**Step 2: 替换散点图颜色数组**

```typescript
// 改动前
const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D6']

// 改动后
const colors = CHART_COLORS

// 散点图每个系列使用语义色
series: brands.slice(0, 8).map((brand, idx) => ({
  name: brand,
  type: 'scatter',
  data: ...,
  itemStyle: {
    color: colors[idx % colors.length],
    opacity: 0.7,
    shadowBlur: 12,
    shadowColor: `${colors[idx % colors.length]}40`,
  },
}))
```

**Step 3: 升级所有 tooltip**

为每个图表添加统一的 v5 tooltip 配置。

---

## 验收标准

```
改造完成后，所有视图必须满足：

✓ 所有图表使用 CHART_COLORS 或 DataSemantic 语义色
✓ 所有 tooltip 使用玻璃卡片风格（v5）
✓ 所有柱状图使用渐变色 + borderRadius
✓ 所有饼图使用语义色 + emphasis glow
✓ 所有线图使用 areaStyle 渐变
✓ 所有组件使用 Base* 组件（BaseCard、BaseButton 等）
✓ 整体视觉与 Stripe Dashboard / Linear 风格一致
✓ 无硬编码颜色（除 CHART_COLORS 和 DataSemantic 外）
✓ 无纯白背景（使用 var(--bg-base) 或 var(--bg-glass)）
✓ 所有动效 ≤ 200ms
```

---

## 改造检查清单

- [ ] DashboardView.vue — 饼图配色 + tooltip
- [ ] IDCOvOverviewView.vue — 5 个图表全部改造
- [ ] IDCGeographyView.vue — 渐变色 + tooltip
- [ ] IDCMarketExploreView.vue — 4 个图表全部改造
- [ ] IDCTechSegmentView.vue — 配色 + glow 散点
- [ ] 所有图表使用 BaseChartV5 组件
- [ ] 所有卡片使用 BaseCard 组件
- [ ] 所有按钮使用 BaseButton 组件
- [ ] 所有表格使用 BaseTable 组件
- [ ] 所有 KPI 使用 BaseKPICard 组件
- [ ] 运行验收标准检查

---

## 快速参考

### 常用导入

```typescript
// 图表语义色
import { CHART_COLORS, DataSemantic } from '@/const/chartSemantics'

// Base 组件
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTag from '@/components/base/BaseTag.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseModal from '@/components/base/BaseModal.vue'

// 数据组件
import BaseKPICard from '@/components/data/BaseKPICard.vue'
import BaseStatCard from '@/components/data/BaseStatCard.vue'
import BaseTable from '@/components/data/BaseTable.vue'

// 图表组件
import BaseChartV5 from '@/components/idc/BaseChartV5.vue'
```

### 常用令牌

```typescript
// 颜色
var(--primary)           // #667EEA
var(--secondary)          // #764BA2
var(--success)            // #10B981
var(--danger)             // #EF4444
var(--warning)            // #F59E0B
var(--accent)             // #A855F7
var(--bg-base)            // #F6F8FC
var(--bg-glass)           // rgba(255,255,255,0.72)

// 阴影
var(--card-shadow)
var(--card-shadow-hover)
var(--glow-primary)
var(--glow-active)

// 圆角
var(--radius-sm)          // 6px
var(--radius-md)          // 10px
var(--radius-lg)          // 14px
var(--radius-button)      // 10px
var(--radius-card)        // 14px

// 动效
var(--transition)        // all 200ms ease
var(--ease)               // cubic-bezier(0.4, 0, 0.2, 1)
```
