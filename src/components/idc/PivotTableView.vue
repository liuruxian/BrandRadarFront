// 透视表格视图组件 - 完整版
// 更新时间: 2026-04-24
// 规范：多级钻取、行列冻结、全屏沉浸模式
<template>
  <div class="pivot-table-container" :class="{ 'is-fullscreen': isFullscreen }" ref="containerRef">
    <!-- 工具栏 -->
    <div class="pivot-toolbar">
      <div class="toolbar-left">
        <span class="toolbar-title">透视表</span>
        <span class="toolbar-hint">{{ data.length }} 行 × {{ columnCount }} 列</span>
      </div>
      <div class="toolbar-right">
        <!-- 展开/折叠全部 -->
        <button class="toolbar-btn" @click="toggleAll" :title="allExpanded ? '全部折叠' : '全部展开'">
          <IconExpand />
          <span>{{ allExpanded ? '折叠' : '展开' }}</span>
        </button>
        <!-- 全屏 -->
        <button class="toolbar-btn" @click="toggleFullscreen" title="全屏">
          <IconFullscreen v-if="!isFullscreen" />
          <IconFullscreenExit v-else />
        </button>
      </div>
    </div>

    <!-- 表格主体 -->
    <div class="pivot-table-wrapper" ref="tableWrapperRef">
      <table class="pivot-table" ref="tableRef">
        <!-- 表头区 -->
        <thead>
          <!-- 第一行：行维度标签 + 列维度值分组 -->
          <tr class="header-row-1">
            <!-- 合并的行维度列 -->
            <th
              v-for="(col, idx) in leftFixedCols"
              :key="`fix-${col.key}-${idx}`"
              class="th-row-field th-left-fixed"
              :class="{ 'is-last-row': rowHeaderDepth === 1 }"
              :rowspan="rowHeaderDepth"
              :style="{ width: col.width + 'px', minWidth: col.width + 'px' }"
            >
              {{ col.title }}
            </th>

            <!-- 列维度值分组（每个值跨多个统计量） -->
            <th
              v-for="group in columnGroups"
              :key="group.key"
              class="th-col-group"
              :colspan="group.colspan"
              :style="{ background: group.color }"
            >
              {{ group.title }}
            </th>
          </tr>

          <!-- 第二行及以后：行维度嵌套 + 统计量列 -->
          <tr v-if="rowHeaderDepth > 1" class="header-row-2">
            <!-- 行维度嵌套表头（无额外内容，但保留占位） -->
            <th
              v-for="(col, idx) in nestedRowHeaders"
              :key="`nested-${col.key}-${idx}`"
              class="th-row-nested th-left-fixed"
              :rowspan="rowHeaderDepth - 1"
              :style="{ width: col.width + 'px', minWidth: col.width + 'px' }"
            >
              {{ col.title }}
            </th>

            <!-- 统计量子列 -->
            <th
              v-for="subCol in valueSubColumns"
              :key="subCol.key"
              class="th-value-sub th-right-fixed"
              :style="subCol.style"
              :align="subCol.align || 'right'"
            >
              {{ subCol.title }}
            </th>
          </tr>

          <!-- 仅统计量行（无行维度嵌套时） -->
          <tr v-else class="header-row-value">
            <th
              v-for="subCol in valueSubColumns"
              :key="subCol.key"
              class="th-value-sub"
              :style="subCol.style"
              :align="subCol.align || 'right'"
            >
              {{ subCol.title }}
            </th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody>
          <template v-for="(row, rowIdx) in processedData" :key="row._rowKey">
            <!-- 展开行 -->
            <tr
              v-if="row._isExpanded !== false"
              class="data-row"
              :class="{
                'row-even': rowIdx % 2 === 0,
                'row-odd': rowIdx % 2 !== 0,
                'row-level-0': row._level === 0,
                'row-level-1': row._level === 1,
                'row-level-2': row._level === 2,
              }"
            >
              <!-- 行维度单元格 -->
              <td
                v-for="(col, colIdx) in leftFixedCols"
                :key="`cell-${row._rowKey}-${col.key}-${colIdx}`"
                class="td-row-field td-left-fixed"
                :style="{
                  paddingLeft: (row._level || 0) * 20 + 12 + 'px',
                  width: col.width + 'px',
                  minWidth: col.width + 'px',
                }"
              >
                <!-- 展开/折叠图标（非最后一级行维度） -->
                <span v-if="colIdx === leftFixedCols.length - 1 && hasChildren(row)" class="row-toggle">
                  <button class="toggle-btn" @click.stop="toggleRow(row._rowKey)">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      :style="{ transform: isRowExpanded(row._rowKey) ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms' }"
                    >
                      <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </span>
                <span class="cell-value">{{ row[col.key] ?? '—' }}</span>
              </td>

              <!-- 值单元格 -->
              <td
                v-for="subCol in valueSubColumns"
                :key="`val-${row._rowKey}-${subCol.key}`"
                class="td-value"
                :class="[`value-color-${subCol.colorIndex}`, { 'td-right-fixed': subCol.fixed === 'right' }]"
                :style="subCol.style"
                :align="subCol.align || 'right'"
              >
                <span class="cell-value">{{ formatCellValue(row[subCol.key], subCol) }}</span>
              </td>
            </tr>
          </template>

          <!-- 空状态 -->
          <tr v-if="processedData.length === 0">
            <td :colspan="totalColspan" class="empty-cell">
              <div class="empty-state">
                <IconEmpty />
                <span>暂无数据</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import IconExpand from './icons/IconExpand.vue'
import IconFullscreen from './icons/IconFullscreen.vue'
import IconFullscreenExit from './icons/IconFullscreenExit.vue'
import IconEmpty from './icons/IconEmpty.vue'

// ─── 类型定义 ───────────────────────────────────────────────────────────────

interface PivotRowData extends Record<string, any> {
  _rowKey: string
  _level?: number
  _isExpanded?: boolean
  _hasChildren?: boolean
  [key: string]: any
}

interface ValueColumn {
  key: string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
  format?: string
  decimalPlaces?: number
  colorIndex?: number
  style?: Record<string, string>
  fixed?: 'left' | 'right'
}

interface ColumnGroup {
  key: string
  title: string
  color: string
  colspan: number
  subColumns: ValueColumn[]
}

interface Props {
  data?: PivotRowData[]
  /** 左侧固定行维度列（透视图已计算好的列配置） */
  leftFixedCols?: { key: string; title: string; width: number }[]
  /** 列维度值分组（如 [H1 2024, H2 2024] × 统计量） */
  columnGroups?: ColumnGroup[]
  /** 嵌套行表头（多级钻取时） */
  nestedRowHeaders?: { key: string; title: string; width: number }[]
  /** 统计量子列 */
  valueSubColumns?: ValueColumn[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  leftFixedCols: () => [],
  columnGroups: () => [],
  nestedRowHeaders: () => [],
  valueSubColumns: () => [],
  loading: false,
})

// ─── 状态 ───────────────────────────────────────────────────────────────────

const isFullscreen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const tableWrapperRef = ref<HTMLElement | null>(null)
const tableRef = ref<HTMLElement | null>(null)

const expandedRows = ref<Set<string>>(new Set())
const allExpanded = ref(true)

// ─── 计算属性 ──────────────────────────────────────────────────────────────

/** 左侧固定列数量 */
const leftFixedCols = computed(() => props.leftFixedCols)

/** 行表头深度（用于 rowspan） */
const rowHeaderDepth = computed(() => {
  return Math.max(1, props.nestedRowHeaders.length + 1)
})

/** 统计量子列 */
const valueSubColumns = computed(() => props.valueSubColumns)

/** 列维度值分组 */
const columnGroups = computed(() => props.columnGroups)

/** 总列数 */
const totalColspan = computed(() => {
  return props.leftFixedCols.length + props.valueSubColumns.length
})

/** 已有子节点标记的行 */
function hasChildren(row: PivotRowData): boolean {
  return row._hasChildren === true
}

/** 某行是否已展开 */
function isRowExpanded(key: string): boolean {
  return expandedRows.value.has(key)
}

/** 处理后的数据（根据展开折叠状态过滤） */
const processedData = computed(() => {
  if (allExpanded.value) return props.data

  // 收集所有需要显示的行
  const visible = new Set<string>()
  const parents: string[] = []

  for (const row of props.data) {
    if (row._level === 0) {
      visible.add(row._rowKey)
      if (isRowExpanded(row._rowKey)) {
        parents.push(row._rowKey)
      }
    } else if (row._level === 1) {
      if (parents.includes(row._parentKey || '')) {
        visible.add(row._rowKey)
        if (isRowExpanded(row._rowKey)) {
          parents.push(row._rowKey)
        }
      }
    } else if (row._level === 2) {
      if (parents.includes(row._parentKey || '')) {
        visible.add(row._rowKey)
      }
    }
  }

  return props.data.filter(row => visible.has(row._rowKey))
})

// ─── 列数统计 ──────────────────────────────────────────────────────────────

const columnCount = computed(() => {
  if (props.valueSubColumns.length > 0) {
    return props.valueSubColumns.length
  }
  if (props.data.length > 0) {
    return Object.keys(props.data[0]).filter(k => !k.startsWith('_')).length
  }
  return 0
})

// ─── 交互 ───────────────────────────────────────────────────────────────────

function toggleRow(key: string) {
  if (expandedRows.value.has(key)) {
    expandedRows.value.delete(key)
  } else {
    expandedRows.value.add(key)
  }
  expandedRows.value = new Set(expandedRows.value)
}

function toggleAll() {
  if (allExpanded.value) {
    expandedRows.value = new Set()
    allExpanded.value = false
  } else {
    expandedRows.value = new Set(props.data.filter(r => r._hasChildren).map(r => r._rowKey))
    allExpanded.value = true
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  nextTick(() => {
    syncScroll()
  })
}

// ─── 滚动同步 ─────────────────────────────────────────────────────────────

function syncScroll() {
  if (!tableWrapperRef.value || !tableRef.value) return
  const wrapper = tableWrapperRef.value
  const table = tableRef.value

  // 横向滚动 → 同步固定列
  wrapper.addEventListener('scroll', () => {
    const leftCells = table.querySelectorAll('.td-left-fixed, .th-left-fixed')
    leftCells.forEach(cell => {
      (cell as HTMLElement).style.transform = `translateX(-${wrapper.scrollLeft}px)`
    })

    const rightCells = table.querySelectorAll('.td-right-fixed, .th-right-fixed')
    rightCells.forEach(cell => {
      (cell as HTMLElement).style.transform = `translateX(-${wrapper.scrollLeft}px)`
    })
  })
}

// ─── 格式化 ─────────────────────────────────────────────────────────────────

function formatCellValue(val: any, col: ValueColumn): string {
  if (val === null || val === undefined || val === '') return '—'

  if (col.format === 'percent') {
    const num = Number(val) * 100
    const dp = col.decimalPlaces ?? 2
    return `${num.toFixed(dp)}%`
  }

  if (col.format === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: col.decimalPlaces ?? 0,
      maximumFractionDigits: col.decimalPlaces ?? 2,
    }).format(Number(val))
  }

  const num = Number(val)
  if (!isNaN(num)) {
    const dp = col.decimalPlaces ?? 0
    return num.toLocaleString('en-US', {
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
    })
  }

  return String(val)
}

// ─── 键盘快捷键 ─────────────────────────────────────────────────────────────

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}

// ─── 初始化 ─────────────────────────────────────────────────────────────────

onMounted(() => {
  // 默认全部展开
  expandedRows.value = new Set(props.data.filter(r => r._hasChildren).map(r => r._rowKey))
  document.addEventListener('keydown', handleKeydown)
  nextTick(() => syncScroll())
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 当数据变化时重新初始化展开状态
watch(() => props.data, (newData) => {
  expandedRows.value = new Set(newData.filter(r => r._hasChildren).map(r => r._rowKey))
}, { deep: true })
</script>

<style scoped>
/* ── 容器 ── */
.pivot-table-container {
  display: flex;
  flex-direction: column;
  background: var(--dt-color-bg-surface);
  border: 1px solid var(--dt-color-border);
  border-radius: var(--dt-radius-md);
  overflow: hidden;
  height: 100%;
}

.pivot-table-container.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  border-radius: 0;
  border: none;
  background: #fff;
}

/* ── 工具栏 ── */
.pivot-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--dt-color-border);
  background: var(--dt-color-bg-muted);
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-title {
  font-size: var(--dt-text-sm);
  font-weight: 600;
  color: var(--dt-color-text-primary);
}

.toolbar-hint {
  font-size: var(--dt-text-xs);
  color: var(--dt-color-text-muted);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--dt-color-border);
  border-radius: 6px;
  background: var(--dt-color-bg-surface);
  color: var(--dt-color-text-secondary);
  font-size: var(--dt-text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--dt-duration-fast);
  font-family: var(--dt-font-sans);
}

.toolbar-btn:hover {
  background: var(--dt-color-primary-light);
  border-color: var(--dt-color-primary);
  color: var(--dt-color-primary);
}

.toolbar-btn svg {
  font-size: 14px;
}

/* ── 表格主体 ── */
.pivot-table-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
}

.pivot-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--dt-text-sm);
  font-family: var(--dt-font-sans);
  table-layout: fixed;
}

/* ── 表头 ── */
.pivot-table thead th {
  background: var(--dt-color-bg-muted);
  color: var(--dt-color-text-secondary);
  font-size: var(--dt-text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 12px;
  border-bottom: 1px solid var(--dt-color-border);
  border-right: 1px solid var(--dt-color-border-light);
  white-space: nowrap;
  text-align: left;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 10;
}

.pivot-table thead th:last-child {
  border-right: none;
}

/* 行维度列（固定左侧） */
.th-left-fixed {
  position: sticky;
  left: 0;
  z-index: 11;
  background: var(--dt-color-bg-muted);
}

/* 统计量列 */
.th-value-sub {
  font-weight: 600;
  text-align: right !important;
}

/* 列维度值分组表头 */
.th-col-group {
  text-align: center !important;
  color: #fff !important;
  font-weight: 700;
  font-size: var(--dt-text-xs);
  letter-spacing: 0.03em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

/* ── 表体 ── */
.pivot-table tbody tr.data-row {
  transition: background var(--dt-duration-fast);
}

.pivot-table tbody tr.row-even {
  background: #fff;
}

.pivot-table tbody tr.row-odd {
  background: rgba(37, 99, 235, 0.015);
}

.pivot-table tbody tr:hover {
  background: var(--dt-color-bg-hover) !important;
}

/* 行维度单元格 */
.td-row-field {
  text-align: left !important;
  color: var(--dt-color-text-primary);
  font-weight: 500;
  border-bottom: 1px solid var(--dt-color-border-light);
  border-right: 1px solid var(--dt-color-border-light);
  position: sticky;
  left: 0;
  z-index: 5;
  background: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-row-field .cell-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.row-toggle {
  display: inline-flex;
  align-items: center;
  margin-right: 2px;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: var(--dt-color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: background var(--dt-duration-fast);
}

.toggle-btn:hover {
  background: var(--dt-color-bg-muted);
  color: var(--dt-color-primary);
}

/* 值单元格 */
.td-value {
  text-align: right !important;
  padding: 8px 12px;
  color: var(--dt-color-text-primary);
  font-variant-numeric: tabular-nums;
  font-family: var(--dt-font-data, var(--dt-font-sans));
  border-bottom: 1px solid var(--dt-color-border-light);
  border-right: 1px solid var(--dt-color-border-light);
  white-space: nowrap;
}

.td-value:last-child {
  border-right: none;
}

.td-value .cell-value {
  font-weight: 500;
}

/* 层级缩进 */
.row-level-1 .td-row-field {
  background: rgba(0, 0, 0, 0.01);
}

.row-level-2 .td-row-field {
  background: rgba(0, 0, 0, 0.02);
}

/* ── 空状态 ── */
.empty-cell {
  text-align: center;
  padding: 40px 12px;
  border: none !important;
}

.empty-state {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--dt-color-text-muted);
  font-size: var(--dt-text-sm);
}

.empty-state svg {
  font-size: 32px;
  opacity: 0.5;
}
</style>
