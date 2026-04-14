# 图表系统 v5 (Chart Engine v5)

> 数据视觉引擎 — Data Rendering Engine

---

## 系统定位

```
核心升级: 从"ECharts 配置集合"升级为"数据视觉引擎"

三大核心系统:
1. Light Field System — 三层光场结构
2. Data Semantic System — 数据语义自动映射
3. Interaction Focus System — 交互焦点聚焦
```

---

## 核心概念

### Light Field System（光场系统）

图表不再是"画图"，而是"发光数据场"。

```
三层光结构：

Base Layer（基础层）
├── 用途: 非聚焦数据
├── opacity: 0.45
└── blur: 0px

Mid Layer（交互层）
├── 用途: hover / selected
├── opacity: 0.85
├── shadowBlur: 20
└── scale: 1.03

Glow Layer（核心层）
├── 用途: 选中数据 / 核心指标
├── shadowBlur: 40
├── shadowColor: rgba(102,126,234,0.6)
└── brightness: 1.2
```

### Data Semantic System（数据语义系统）

不再使用随机颜色数组，而是根据数据"意义"自动映射颜色。

```
mapDataType('growth')   → #10B981 (增长/正向)
mapDataType('decline')  → #EF4444 (下跌/负向)
mapDataType('core')     → #667EEA (核心指标)
mapDataType('support')  → #22D3EE (辅助数据)
mapDataType('warning')  → #F59E0B (波动)
mapDataType('neutral')  → #94A3B8 (对比数据)
mapDataType('accent')   → #A855F7 (强调点)
```

### Interaction Focus System（交互焦点系统）

Hover 不再只是变色，而是"全图重新分层"。

```
核心行为:
1. Hover 某个数据
2. 其他数据 dim（opacity: 0.2）
3. 当前数据 glow + scale
4. tooltip 自动对齐
5. label 提升层级
```

---

## 文件结构

```
src/
 ├── const/
 │    ├── chartSemantics.ts     ← 数据语义系统（P0）
 │    └── chartTheme.ts         ← 主题预设系统（P0）
 │
 ├── components/
 │    ├── idc/
 │    │    ├── BaseChartV5.vue  ← 核心合成引擎（P0）
 │    │    ├── BarChartView.vue     ← v5 改造
 │    │    ├── LineChartView.vue    ← v5 改造
 │    │    ├── PieChartView.vue     ← v5 改造
 │    │    └── HeatmapView.vue      ← v5 改造
```

---

## 数据语义系统 (chartSemantics.ts)

### DataSemantic 常量

```typescript
export const DataSemantic = {
  // 核心指标（主品牌色）
  primary: '#667EEA',

  // 辅助指标（次要数据）
  secondary: '#22D3EE',

  // 增长 / 正向
  success: '#10B981',

  // 下跌 / 负向
  danger: '#EF4444',

  // 波动 / 中性警示
  warning: '#F59E0B',

  // 对比数据 / 背景数据
  neutral: '#94A3B8',

  // 强调点 / 高亮
  accent: '#A855F7',

  // 色板（按语义排列，用于图表数组数据）
  palette: [
    '#667EEA',   // primary — 核心
    '#22D3EE',   // secondary — 辅助
    '#10B981',   // success — 增长
    '#EF4444',   // danger — 下跌
    '#F59E0B',   // warning — 波动
    '#A855F7',   // accent — 强调
    '#94A3B8',   // neutral — 对比
    '#818CF8',   // 亮紫 — 品牌扩展
  ],

  // 扩展色板
  extendedPalette: [
    '#667EEA', '#764BA2', '#A855F7', '#22D3EE',
    '#EC4899', '#10B981', '#F59E0B', '#818CF8',
    '#6B7280', '#34D399', '#FCD34D', '#FCA5A5',
  ],
} as const

// 快捷导出色板
export const CHART_COLORS = DataSemantic.palette
```

### mapDataType 函数

```typescript
/**
 * 数据类型 → 语义颜色映射
 * @param type - 数据语义类型
 * @returns 对应的十六进制颜色
 */
export function mapDataType(type: string): string {
  switch (type.toLowerCase()) {
    case 'growth':
    case 'increase':
    case 'up':
      return DataSemantic.success

    case 'decline':
    case 'decrease':
    case 'down':
      return DataSemantic.danger

    case 'core':
    case 'primary':
    case 'main':
    case 'brand':
      return DataSemantic.primary

    case 'support':
    case 'secondary':
    case 'compare':
      return DataSemantic.secondary

    case 'alert':
    case 'warning':
      return DataSemantic.warning

    case 'emphasis':
    case 'accent':
    case 'highlight':
      return DataSemantic.accent

    case 'neutral':
    case 'baseline':
      return DataSemantic.neutral

    default:
      return DataSemantic.neutral
  }
}
```

---

## 主题预设系统 (chartTheme.ts)

### Glow System（三层分级）

```typescript
export const GlowSystem = {
  // Soft Glow — 背景呼吸（Base Layer）
  soft: '0 0 20px rgba(102, 126, 234, 0.10)',

  // Active Glow — hover 激活（Mid Layer）
  active: '0 0 40px rgba(102, 126, 234, 0.25)',

  // Core Glow — 选中/核心数据（Glow Layer）
  core: '0 0 80px rgba(34, 211, 238, 0.35)',
}
```

### Tooltip v5（Floating Data Card）

```typescript
export const TooltipConfig = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(102, 126, 234, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    padding: [12, 16],
    backdropFilter: 'blur(18px)',
    textStyle: {
      color: '#374151',
      fontSize: 12,
    },
    extraCssText: [
      'box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 40px rgba(102, 126, 234, 0.2);',
      'backdrop-filter: blur(18px);',
      'transform: translateY(-2px);',
    ].join(''),
  },
  dark: {
    backgroundColor: 'rgba(11, 15, 26, 0.92)',
    borderColor: 'rgba(102, 126, 234, 0.3)',
    // ...
  },
}
```

### Focus System（交互焦点）

```typescript
export const FocusSystem = {
  bar: {
    emphasis: {
      focus: 'series',
      blurScope: 'coordinateSystem',
      itemStyle: {
        shadowBlur: 30,
        shadowColor: DataSemantic.primary,
        scale: 1.06,
      },
    },
  },
  line: {
    emphasis: {
      focus: 'series',
      blurScope: 'coordinateSystem',
      itemStyle: {
        shadowBlur: 30,
        shadowColor: DataSemantic.primary,
        scale: 1.06,
      },
    },
  },
  pie: {
    emphasis: {
      focus: 'item',
      blurScope: 'coordinateSystem',
      itemStyle: {
        shadowBlur: 40,
        shadowColor: 'rgba(102, 126, 234, 0.5)',
        scale: 1.08,
      },
    },
  },
}
```

### 主题预设

```typescript
export const ChartThemes: Record<'light' | 'glass' | 'dark', ChartThemeConfig> = {
  light: {
    theme: 'light',
    colors: DataSemantic.palette,
    tooltip: TooltipConfig.light,
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    // ...
  },
  glass: {
    theme: 'glass',
    colors: DataSemantic.palette,
    tooltip: TooltipConfig.light,
    // ... 默认使用 glass
  },
  dark: {
    theme: 'dark',
    colors: DataSemantic.extendedPalette,
    tooltip: TooltipConfig.dark,
    // ...
  },
}
```

### 动效预设

```typescript
export const AnimationConfig = {
  // 统一 ≤200ms 原则（ECharts 图表动画通常需要更长）
  chartDuration: 800,      // ECharts 图表专用
  transitionDuration: 200, // CSS 过渡专用
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
}
```

---

## BaseChartV5 核心组件

### Props 设计

```typescript
interface Props {
  // 基础
  option: EChartsOption
  height?: string              // 默认 '360px'

  // 主题
  theme?: 'light' | 'glass' | 'dark'   // 默认 'glass'

  // 光效强度
  intensity?: 'low' | 'medium' | 'high' // 默认 'medium'

  // 系统开关
  semantic?: boolean    // 语义色映射，默认 true
  focusMode?: boolean   // 交互聚焦，默认 true
  glow?: boolean        // Glow 光效，默认 true
}
```

### Chart Engine Pipeline

```
输入: rawOption + config
         ↓
┌────────────────────┐
│ Step 1: 基础主题   │ ← light / glass / dark
└────────┬───────────┘
         ↓
┌────────────────────┐
│ Step 2: 语义色     │ ← DataSemantic 自动映射
└────────┬───────────┘
         ↓
┌────────────────────┐
│ Step 3: Glow层     │ ← soft / active / core
└────────┬───────────┘
         ↓
┌────────────────────┐
│ Step 4: Focus系统  │ ← hover 聚焦
└────────┬───────────┘
         ↓
┌────────────────────┐
│ Step 5: 用户配置   │ ← props.option（最高优先）
└────────┬───────────┘
         ↓
输出: finalOption
```

### 合成引擎核心逻辑

```typescript
function buildChartOption(rawOption: EChartsOption): EChartsOption {
  const theme = currentTheme.value

  // Step 1: 基础主题配置
  const baseOption = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" },
    color: theme.colors,
    animation: theme.animation,
    animationDuration: theme.animationDuration,
    animationEasing: theme.animationEasing,
  }

  // Step 2: Grid / Axis
  const gridOption = {
    grid: theme.grid,
    legend: theme.legend,
    xAxis: theme.xAxis,
    yAxis: theme.yAxis,
  }

  // Step 3: Tooltip（Floating Data Card）
  const tooltipOption = props.showTooltip
    ? { tooltip: theme.tooltip }
    : { tooltip: { show: false } }

  // Step 4: 语义色注入
  let semanticOption = {}
  if (props.semantic) {
    semanticOption = injectSemanticColors(rawOption)
  }

  // Step 5: Focus System 注入
  let focusOption = {}
  if (props.focusMode) {
    focusOption = injectFocusSystem(rawOption, props.intensity)
  }

  // Step 6: 按优先级合并
  return merge(
    {},
    baseOption,
    gridOption,
    tooltipOption,
    semanticOption,
    focusOption,
    rawOption, // 用户配置最高优先
  )
}
```

### 语义色注入逻辑

```typescript
function injectSemanticColors(option: EChartsOption): EChartsOption {
  if (!option.series) return {}

  const series = Array.isArray(option.series)
    ? option.series
    : [option.series]

  const coloredSeries = series.map((s: any, idx) => {
    // 如果已经有颜色配置，跳过
    if (s.itemStyle?.color) return s

    // 使用语义色板
    const semanticColor = CHART_COLORS[idx % CHART_COLORS.length]

    return {
      ...s,
      itemStyle: {
        ...s.itemStyle,
        color: semanticColor,
      },
    }
  })

  return { series: coloredSeries }
}
```

### Focus System 注入逻辑

```typescript
function injectFocusSystem(
  option: EChartsOption,
  intensity: 'low' | 'medium' | 'high'
): EChartsOption {
  const intensityConfig = {
    low: { shadowBlur: 15, scale: 1.03 },
    medium: { shadowBlur: 25, scale: 1.05 },
    high: { shadowBlur: 40, scale: 1.08 },
  }[intensity]

  const series = Array.isArray(option.series)
    ? option.series
    : [option.series]

  const focusedSeries = series.map((s: any) => {
    const type = s.type || 'bar'

    // 根据图表类型选择 focus 配置
    let focusConfig: object
    switch (type) {
      case 'line':
        focusConfig = {
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: intensityConfig.shadowBlur,
              shadowColor: 'rgba(102, 126, 234, 0.5)',
              scale: intensityConfig.scale,
            },
          },
        }
        break
      case 'pie':
        focusConfig = {
          emphasis: {
            focus: 'item',
            itemStyle: {
              shadowBlur: intensityConfig.shadowBlur * 1.2,
              shadowColor: 'rgba(102, 126, 234, 0.5)',
              scale: intensityConfig.scale * 1.05,
            },
          },
        }
        break
      default: // bar
        focusConfig = {
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: intensityConfig.shadowBlur,
              shadowColor: 'rgba(102, 126, 234, 0.5)',
              scale: intensityConfig.scale,
            },
          },
        }
    }

    return { ...s, ...focusConfig }
  })

  return { series: focusedSeries }
}
```

---

## 各图表类型 v5 配置

### 柱状图 v5 配置

```typescript
const barChartOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: props.showLegend !== false ? { data: props.data.series.map(s => s.name), bottom: 0 } : undefined,
  grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
  xAxis: { type: 'category', data: props.data.categories, axisLabel: { rotate: 30 } },
  yAxis: { type: 'value' },
  series: props.data.series.map((s, idx) => {
    const baseColor = CHART_COLORS[idx % CHART_COLORS.length]
    return {
      name: s.name,
      type: 'bar',
      data: s.data,
      barMaxWidth: 60,
      itemStyle: {
        // 渐变色（顶部深，底部浅）
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: baseColor },
            { offset: 1, color: `${baseColor}99` },
          ],
        },
        borderRadius: [6, 6, 0, 0],
        // Soft Glow Base Layer
        shadowBlur: 8,
      },
    }
  }),
}))
```

### 折线图 v5 配置

```typescript
const lineChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: props.data.series.map(s => s.name), bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
  xAxis: { type: 'category', data: props.data.categories, boundaryGap: false },
  yAxis: { type: 'value' },
  series: props.data.series.map((s, idx) => {
    const baseColor = CHART_COLORS[idx % CHART_COLORS.length]
    return {
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: props.smooth !== false,
      // 数据点配置
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: false,
      lineStyle: { width: 2.5, color: baseColor },
      areaStyle: props.showArea ? {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: `${baseColor}30` },
            { offset: 1, color: `${baseColor}05` },
          ],
        },
      } : undefined,
    }
  }),
}))
```

### 饼图 v5 配置

```typescript
const pieChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
  legend: { orient: 'vertical', right: 10, top: 'center' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['40%', '50%'],
    data: props.data.categories.map((cat, i) => ({
      name: cat,
      value: props.data.series[0]?.data[i] || 0,
      itemStyle: {
        color: CHART_COLORS[i % CHART_COLORS.length],
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        // Soft Glow
        shadowBlur: 10,
        shadowColor: 'rgba(102, 126, 234, 0.15)',
      },
    })),
    label: { show: false },
    // Focus System 在 BaseChartV5 中自动注入
  }],
}))
```

---

## 使用示例

```vue
<template>
  <!-- 玻璃主题（默认） -->
  <BaseChartV5
    :option="barOption"
    theme="glass"
    :semantic="true"
    :focus-mode="true"
    :intensity="'medium'"
    height="360px"
  />

  <!-- 深色主题 -->
  <BaseChartV5
    :option="pieOption"
    theme="dark"
    :semantic="true"
  />

  <!-- 高强度 Glow -->
  <BaseChartV5
    :option="lineOption"
    theme="light"
    :intensity="'high'"
    :glow="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChartV5 from '@/components/idc/BaseChartV5.vue'
import { CHART_COLORS } from '@/const/chartSemantics'

// 示例柱状图配置
const barOption = computed(() => ({
  xAxis: { type: 'category', data: ['HP', 'Canon', 'Epson', 'Brother'] },
  yAxis: { type: 'value' },
  series: [{
    type: 'bar',
    data: [45231, 32847, 28456, 19234],
    itemStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: CHART_COLORS[0] },
          { offset: 1, color: '#818CF8' },
        ],
      },
      borderRadius: [6, 6, 0, 0],
    },
  }],
}))
</script>
```

---

## 图表配色对照表

| 图表类型 | 当前颜色 | v5 语义色 |
|---------|---------|---------|
| 核心品牌数据 | `#3B82F6` | `#667EEA` (primary) |
| 辅助数据 | `#10B981` | `#22D3EE` (secondary) |
| 增长指标 | 随机 | `#10B981` (success) |
| 下跌指标 | 随机 | `#EF4444` (danger) |
| 波动/警示 | `#F59E0B` | `#F59E0B` (warning) |
| 强调/高亮 | `#8B5CF6` | `#A855F7` (accent) |
| 对比数据 | `#94A3B8` | `#94A3B8` (neutral) |

---

## 效果对照

```
改造前 (v4)                    改造后 (v5 Data Rendering Engine)

┌──────────────────────────┐    ┌──────────────────────────┐
│                          │    │                          │
│  [========] ████ 柱状图   │    │  [========] ░░░░ 柱状图  │
│                          │    │   ↑ Soft Glow Base Layer │
│  hover: 纯色变色           │    │                          │
│  emphasis: 无              │    │  hover: 其他数据 dim(0.2)│
│                          │    │        当前数据 glow+scale│
│  Tooltip: 纯白+轻阴影       │    │                          │
│                          │    │  Tooltip: 玻璃卡片+Glow   │
│  数据点: 无光效             │    │                          │
│                          │    │  数据点: Glow Layer       │
│  colors: 随机饱和色          │    │                          │
│                          │    │  colors: DataSemantic     │
└──────────────────────────┘    └──────────────────────────┘
```
