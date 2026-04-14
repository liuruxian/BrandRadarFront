// 图表视图容器组件 - 简化版
// 更新时间: 2026-04-10
<template>
  <div class="result-view">
    <!-- 视图切换标签 -->
    <div class="view-tabs">
      <n-tabs v-model:value="currentView" type="segment">
        <n-tab name="table">表格</n-tab>
        <n-tab name="bar">柱状图</n-tab>
        <n-tab name="line">折线图</n-tab>
        <n-tab name="pie">饼图</n-tab>
        <n-tab name="heatmap">热力图</n-tab>
      </n-tabs>
    </div>

    <!-- 视图内容区域 -->
    <div class="view-content">
      <!-- 表格视图 -->
      <PivotTableView
        v-if="currentView === 'table'"
        :data="data"
        :columns="columnKeys"
      />
      <!-- 柱状图视图 -->
      <BarChartView
        v-else-if="currentView === 'bar'"
        :data="chartData"
      />
      <!-- 折线图视图 -->
      <LineChartView
        v-else-if="currentView === 'line'"
        :data="chartData"
      />
      <!-- 饼图视图 -->
      <PieChartView
        v-else-if="currentView === 'pie'"
        :data="chartData"
      />
      <!-- 热力图视图 -->
      <HeatmapView
        v-else-if="currentView === 'heatmap'"
        :data="heatmapData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NTabs, NTab } from 'naive-ui'

import PivotTableView from './PivotTableView.vue'
import BarChartView from './BarChartView.vue'
import LineChartView from './LineChartView.vue'
import PieChartView from './PieChartView.vue'
import HeatmapView from './HeatmapView.vue'

// Props定义
interface Props {
  data?: Record<string, unknown>[]
  loading?: boolean
  defaultView?: 'table' | 'bar' | 'line' | 'pie' | 'heatmap'
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  defaultView: 'table',
})

// 当前视图
const currentView = ref(props.defaultView)

// 计算属性：列键
const columnKeys = computed(() => {
  if (props.data.length > 0) {
    return Object.keys(props.data[0])
  }
  return []
})

// 计算属性：图表数据
const chartData = computed(() => {
  if (props.data.length === 0) return { categories: [], series: [] }

  const firstRow = props.data[0]
  const keys = Object.keys(firstRow)

  let categoryKey = ''
  for (const key of keys) {
    if (typeof firstRow[key] === 'string') {
      categoryKey = key
      break
    }
  }
  if (!categoryKey) categoryKey = keys[0]

  const categories = props.data.map(row => String(row[categoryKey]))
  const seriesKeys = keys.filter(k => k !== categoryKey && typeof firstRow[k] === 'number')

  const series = seriesKeys.map(key => ({
    name: key,
    data: props.data.map(row => row[key] as number),
  }))

  return { categories, series }
})

// 计算属性：热力图数据
const heatmapData = computed(() => {
  return props.data.map((row, i) => {
    const keys = Object.keys(row)
    const firstKey = keys[0] || `X${i}`
    const secondKey = keys[1] || 'Y'
    const numKey = keys.find(k => typeof row[k] === 'number') || keys[2] || ''
    return {
      x: String(row[firstKey] ?? `X${i}`),
      y: String(row[secondKey] ?? 'Y'),
      value: Number(row[numKey] ?? 0),
    }
  })
})
</script>

<style scoped>
.result-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;
}

.view-tabs {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.view-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}
</style>
