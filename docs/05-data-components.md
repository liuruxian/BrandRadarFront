# 数据组件 (Data Components)

> 数据展示层核心组件：KPI 卡片、数据表格、统计卡片

---

## 组件目录

```
src/components/data/
 ├── BaseKPICard.vue     ← KPI 统计卡片（核心）
 ├── BaseStatCard.vue    ← 通用统计卡片
 └── BaseTable.vue       ← 数据表格
```

---

## BaseKPICard.vue — KPI 统计卡片

### 设计规范

```
外观: BaseCard 玻璃卡片
核心: 数字突出（24px, bold）+ 标签辅助（12px, muted）
趋势: 右上角向上/向下箭头 + 变化百分比
Glow: hover 时启用 Core Glow
```

### 视觉结构

```
┌─────────────────────────────┐
│  标签              ↑ 趋势  │
│                             │
│  数值（24px bold）         │
│                             │
│  变化说明（可选）           │
└─────────────────────────────┘
```

### Props 定义

```typescript
type TrendDirection = 'up' | 'down' | 'neutral'
type DataFormat = 'number' | 'percent' | 'currency' | 'raw'

interface Props {
  /** 标签文字 */
  label: string
  /** 数值 */
  value: string | number
  /** 趋势方向 */
  trend?: TrendDirection
  /** 趋势说明文字 */
  trendText?: string
  /** 趋势数值（如 "+12.5%"） */
  trendValue?: string
  /** 语义色 */
  color?: 'primary' | 'success' | 'warning' | 'danger'
  /** 数字格式化类型 */
  format?: DataFormat
  /** 图标（可选） */
  icon?: string
  /** 是否启用 glow */
  glow?: boolean
  /** 描述文字（可选） */
  description?: string
}
```

### 代码实现

```vue
<template>
  <BaseCard class="kpi-card" :glow="glow" :hoverable="true">
    <!-- Header: 标签 + 趋势 -->
    <div class="kpi-header">
      <span class="kpi-label">{{ label }}</span>

      <!-- 趋势标签 -->
      <div v-if="trend" :class="['kpi-trend', trend]">
        <span class="trend-icon" v-html="trendIcon" />
        <span class="trend-value">{{ trendValue }}</span>
      </div>
    </div>

    <!-- 数值 -->
    <div class="kpi-value">{{ formattedValue }}</div>

    <!-- 描述 -->
    <div v-if="description" class="kpi-description">
      {{ description }}
    </div>

    <!-- 趋势说明（底部） -->
    <div v-if="trendText" :class="['kpi-trend-text', trend]">
      {{ trendText }}
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'

const props = withDefaults(defineProps<Props>(), {
  trend: 'neutral',
  format: 'raw',
  color: 'primary',
  glow: false,
})

// 格式化数值
const formattedValue = computed(() => {
  const val = Number(props.value)

  if (isNaN(val)) return props.value

  switch (props.format) {
    case 'number':
      return val.toLocaleString()
    case 'percent':
      return `${val.toFixed(1)}%`
    case 'currency':
      return `$${val.toLocaleString()}`
    default:
      return val.toLocaleString()
  }
})

// 趋势图标
const trendIcon = computed(() => {
  if (props.trend === 'up') {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  }
  if (props.trend === 'down') {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  }
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`
})
</script>

<style scoped>
.kpi-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.kpi-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.kpi-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  border-radius: var(--radius-badge);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.kpi-trend.up {
  background: var(--success-soft);
  color: var(--success);
}

.kpi-trend.down {
  background: var(--danger-soft);
  color: var(--danger);
}

.kpi-trend.neutral {
  background: var(--border);
  color: var(--text-muted);
}

.trend-icon {
  display: flex;
  align-items: center;
}

.kpi-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1.2;
  letter-spacing: var(--tracking-tight);
}

.kpi-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-normal);
}

.kpi-trend-text {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.kpi-trend-text.up {
  color: var(--success);
}

.kpi-trend-text.down {
  color: var(--danger);
}
</style>
```

### 使用示例

```vue
<!-- 基本用法 -->
<BaseKPICard
  label="总销量"
  :value="125847"
  format="number"
/>

<!-- 带趋势 -->
<BaseKPICard
  label="本月新增品牌"
  :value="248"
  trend="up"
  trend-value="+12.5%"
  trend-text="较上月增长"
  color="success"
  glow
/>

<!-- 货币格式 -->
<BaseKPICard
  label="总销售额"
  :value="2345678"
  format="currency"
  trend="up"
  trend-value="+8.2%"
/>

<!-- 百分比格式 -->
<BaseKPICard
  label="市场份额"
  :value="23.5"
  format="percent"
  trend="down"
  trend-value="-1.2%"
  trend-text="较上季度"
/>

<!-- 带图标 -->
<BaseKPICard
  label="活跃用户"
  :value="15847"
  icon="<svg>...</svg>"
  trend="up"
  trend-value="+5.3%"
/>
```

### KPI Grid 布局

```vue
<template>
  <div class="kpi-grid">
    <BaseKPICard
      label="总销量"
      :value="stats.totalUnits"
      format="number"
      trend="up"
      trend-value="+15.2%"
      glow
    />
    <BaseKPICard
      label="总销售额"
      :value="stats.totalValue"
      format="currency"
      trend="up"
      trend-value="+12.8%"
    />
    <BaseKPICard
      label="活跃品牌"
      :value="stats.activeBrands"
      format="number"
      trend="neutral"
      trend-value="0%"
    />
    <BaseKPICard
      label="平均价格"
      :value="stats.avgPrice"
      format="currency"
      trend="down"
      trend-value="-2.1%"
      color="danger"
    />
  </div>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--card-gap);
}

@media (max-width: 1200px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>
```

---

## BaseStatCard.vue — 通用统计卡片

### 设计规范

```
用途: 非 KPI 类统计展示（如对比、排名项）
外观: 比 BaseKPICard 更轻量，无趋势
结构: 标签 + 主值 + 可选图标/描述
```

### Props 定义

```typescript
interface Props {
  /** 标签 */
  label: string
  /** 数值 */
  value: string | number
  /** 格式 */
  format?: 'number' | 'percent' | 'currency' | 'raw'
  /** 语义色 */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  /** 图标（可选） */
  icon?: string
  /** 描述（可选） */
  description?: string
  /** 排名（可选，显示 #1 样式） */
  rank?: number
}
```

### 代码实现

```vue
<template>
  <BaseCard class="stat-card" :hoverable="true">
    <div class="stat-header">
      <span class="stat-label">{{ label }}</span>
      <span v-if="rank" class="stat-rank">#{{ rank }}</span>
    </div>

    <div class="stat-body">
      <div v-if="icon" class="stat-icon" v-html="icon" />
      <span class="stat-value" :style="{ color: semanticColor }">
        {{ formattedValue }}
      </span>
    </div>

    <div v-if="description" class="stat-description">
      {{ description }}
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'

const props = withDefaults(defineProps<Props>(), {
  format: 'raw',
  color: 'primary',
})

const colorMap = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  neutral: 'var(--text-primary)',
}

const semanticColor = computed(() => colorMap[props.color])

const formattedValue = computed(() => {
  const val = Number(props.value)
  if (isNaN(val)) return props.value
  switch (props.format) {
    case 'number': return val.toLocaleString()
    case 'percent': return `${val.toFixed(1)}%`
    case 'currency': return `$${val.toLocaleString()}`
    default: return val.toLocaleString()
  }
})
</script>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

.stat-rank {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--primary);
  background: var(--primary-soft);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.stat-body {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.stat-icon {
  display: flex;
  align-items: center;
  color: var(--text-muted);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: 1.2;
}

.stat-description {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
</style>
```

### 使用示例

```vue
<!-- 品牌排名 -->
<BaseStatCard
  v-for="brand in topBrands"
  :key="brand.id"
  :label="brand.name"
  :value="brand.units"
  :rank="brand.rank"
  color="primary"
  description="本月销量"
/>
```

---

## BaseTable.vue — 数据表格

### 设计规范

```
外观: 无边框 + 底部分隔线
Header: #FAFBFF 背景 + 12px muted 文字
行: hover 高亮 rgba(102,126,234,0.04)
分页: 底部居右
排序: 升序/降序图标
加载: 骨架屏
```

### Props 定义

```typescript
interface Column {
  /** 数据键名 */
  key: string
  /** 列标题 */
  title: string
  /** 列宽 */
  width?: string
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sortable?: boolean
  /** 自定义渲染 */
  render?: (value: any, row: any, index: number) => VNode | string
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  pageSizes?: number[]
  onChange: (page: number, pageSize: number) => void
}

interface Props {
  /** 列配置 */
  columns: Column[]
  /** 数据列表 */
  data: any[]
  /** 加载状态 */
  loading?: boolean
  /** 斑马纹（默认 false） */
  striped?: boolean
  /** 行悬停高亮（默认 true） */
  hoverable?: boolean
  /** 边框（默认 false） */
  bordered?: boolean
  /** 分页配置（可选） */
  pagination?: Pagination
  /** 空状态提示 */
  emptyText?: string
  /** 行点击事件 */
  onRowClick?: (row: any, index: number) => void
}
```

### 代码实现

```vue
<template>
  <div class="base-table-wrapper">
    <table class="base-table">
      <!-- Header -->
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ width: col.width, textAlign: col.align || 'left' }"
            :class="{ sortable: col.sortable }"
            @click="col.sortable && handleSort(col.key)"
          >
            <span class="th-content">
              {{ col.title }}
              <span v-if="col.sortable" class="sort-icon" v-html="getSortIcon(col.key)" />
            </span>
          </th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody>
        <!-- Loading 骨架 -->
        <template v-if="loading">
          <tr v-for="i in 5" :key="`skeleton-${i}`" class="skeleton-row">
            <td v-for="col in columns" :key="col.key">
              <div class="skeleton-cell" />
            </td>
          </tr>
        </template>

        <!-- 空状态 -->
        <tr v-else-if="!data.length">
          <td :colspan="columns.length" class="empty-cell">
            <span>{{ emptyText || '暂无数据' }}</span>
          </td>
        </tr>

        <!-- 数据行 -->
        <template v-else>
          <tr
            v-for="(row, index) in data"
            :key="row.id || index"
            :class="{ clickable: !!onRowClick }"
            @click="onRowClick?.(row, index)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :style="{ textAlign: col.align || 'left' }"
            >
              <!-- 自定义渲染 -->
              <template v-if="col.render">
                <component :is="col.render(row[col.key], row, index)" />
              </template>
              <template v-else>
                {{ row[col.key] }}
              </template>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="pagination" class="table-pagination">
      <span class="pagination-info">
        共 {{ pagination.total }} 条
      </span>
      <div class="pagination-controls">
        <button
          class="pagination-btn"
          :disabled="pagination.page <= 1"
          @click="handlePageChange(pagination.page - 1)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="pagination-page">
          {{ pagination.page }} / {{ totalPages }}
        </span>
        <button
          class="pagination-btn"
          :disabled="pagination.page >= totalPages"
          @click="handlePageChange(pagination.page + 1)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  striped: false,
  hoverable: true,
  bordered: false,
  emptyText: '暂无数据',
})

const emit = defineEmits<{
  (e: 'sort', key: string, direction: 'asc' | 'desc'): void
  (e: 'page-change', page: number, pageSize: number): void
}>()

const totalPages = computed(() => {
  if (!props.pagination) return 1
  return Math.ceil(props.pagination.total / props.pagination.pageSize)
})

function handleSort(key: string) {
  emit('sort', key, 'asc') // TODO: toggle direction
}

function handlePageChange(page: number) {
  props.pagination?.onChange(page, props.pagination.pageSize)
}

function getSortIcon(key: string): string {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}
</script>

<style scoped>
.base-table-wrapper {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.base-table {
  width: 100%;
  border-collapse: collapse;
}

.base-table th {
  padding: 12px 16px;
  background: #FAFBFF;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.base-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.base-table th.sortable:hover {
  color: var(--primary);
}

.th-content {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.sort-icon {
  display: flex;
  align-items: center;
  opacity: 0.4;
}

.base-table td {
  padding: 12px 16px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-subtle);
}

.base-table tr:last-child td {
  border-bottom: none;
}

/* Hover */
.base-table tbody tr {
  transition: background var(--transition);
}

.base-table tbody tr:hover {
  background: rgba(102, 126, 234, 0.04);
}

.base-table tbody tr.clickable {
  cursor: pointer;
}

/* Striped */
.striped tbody tr:nth-child(even) {
  background: rgba(102, 126, 234, 0.02);
}

/* Empty */
.empty-cell {
  text-align: center;
  padding: 48px !important;
  color: var(--text-muted);
  font-size: var(--text-sm);
}

/* Skeleton */
.skeleton-cell {
  height: 20px;
  background: linear-gradient(90deg, var(--border) 25%, var(--bg-base) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Pagination */
.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}

.pagination-info {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary-soft);
  border-color: var(--border-primary);
  color: var(--primary);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-page {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  min-width: 60px;
  text-align: center;
}

/* Bordered */
.bordered .base-table-wrapper {
  border: 1px solid var(--border-strong);
}
</style>
```

### 使用示例

```vue
<template>
  <BaseTable
    :columns="columns"
    :data="tableData"
    :loading="loading"
    :pagination="pagination"
    :hoverable="true"
    @sort="handleSort"
    @page-change="handlePageChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CHART_COLORS } from '@/const/chartSemantics'

const columns = [
  { key: 'rank', title: '排名', width: '60px', align: 'center' },
  { key: 'brand', title: '品牌', sortable: true },
  { key: 'units', title: '销量', sortable: true, align: 'right' },
  { key: 'value', title: '销售额', sortable: true, align: 'right' },
  {
    key: 'share',
    title: '市场份额',
    render: (val: number) => h('div', { class: 'share-bar' }, [
      h('span', { class: 'share-value' }, `${val.toFixed(1)}%`),
      h('div', { class: 'share-track' }, [
        h('div', { class: 'share-fill', style: { width: `${val}%` } }),
      ]),
    ]),
  },
  {
    key: 'status',
    title: '状态',
    render: (val: string) => h(BaseTag, { variant: getVariant(val) }, () => val),
  },
]

const loading = ref(false)
const pagination = {
  page: 1,
  pageSize: 10,
  total: 100,
  onChange: (page, size) => { /* fetch data */ },
}

function getVariant(status: string) {
  const map: Record<string, any> = { '正常': 'success', '预警': 'warning', '新增': 'primary' }
  return map[status] || 'default'
}
</script>
```

---

## 数据组件组合模式

### Dashboard 页面布局

```
┌──────────────────────────────────────────────────────┐
│ KPI Grid (4列)                                       │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ 总销量  │ │ 总销售额 │ │ 活跃品牌 │ │ 平均价格 │    │
│ │ 125,847 │ │ $2.3M   │ │ 248     │ │ $186    │    │
│ │ ↑ 15.2% │ │ ↑ 12.8% │ │ → 0%    │ │ ↓ 2.1%  │    │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
├──────────────────────────────────────────────────────┤
│ Chart Grid (2列)                                     │
│ ┌───────────────────┐ ┌───────────────────┐         │
│ │ 趋势图            │ │ 饼图              │         │
│ └───────────────────┘ └───────────────────┘         │
├──────────────────────────────────────────────────────┤
│ BaseTable                                           │
│ ┌──────────────────────────────────────────────────┐│
│ │ 品牌      │ 销量    │ 销售额   │ 市场份额       ││
│ │ HP        │ 45,231  │ $8.2M    │ 35.9%          ││
│ │ Canon     │ 32,847  │ $6.1M    │ 26.1%          ││
│ └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```
