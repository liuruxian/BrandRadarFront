// 柱状图视图组件 - 简化版
// 更新时间: 2026-04-10
<template>
  <div class="bar-chart-view">
    <div ref="chartRef" class="chart-container" :style="{ height: height + 'px' }">
      <v-chart
        v-if="hasData"
        :option="chartOption"
        autoresize
        :loading="loading"
      />
      <div v-else class="empty-state">
        <span>暂无数据</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart as BarChartCore } from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

// 注册ECharts组件
use([
  CanvasRenderer,
  BarChartCore,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
])

// Props定义
interface Props {
  data?: {
    categories: string[]
    series: {
      name: string
      data: number[]
    }[]
  }
  config?: {
    barType?: 'stacked' | 'grouped' | 'stacked_percent'
    showDataLabel?: boolean
    showLegend?: boolean
  }
  loading?: boolean
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({ categories: [], series: [] }),
  config: () => ({}),
  loading: false,
  height: 400,
})

const chartRef = ref<HTMLElement>()

const hasData = computed(() => props.data.categories.length > 0)

// 图表配置选项
const chartOption = computed<EChartsOption>(() => {
  const barType = props.config?.barType || 'grouped'
  const showDataLabel = props.config?.showDataLabel ?? true
  const showLegend = props.config?.showLegend ?? true

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: showLegend
      ? { top: 0, right: 0 }
      : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: props.data.categories,
      axisLabel: { rotate: 30 },
    },
    yAxis: { type: 'value' },
    series: props.data.series.map((s, _index) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      barMaxWidth: 60,
      label: showDataLabel
        ? { show: true, position: 'top', formatter: '{c}', fontSize: 11 }
        : { show: false },
    })),
    dataZoom: props.data.categories.length > 10
      ? [{ type: 'inside', start: 0, end: 100 }]
      : undefined,
  }
})
</script>

<style scoped>
.bar-chart-view {
  width: 100%;
}

.chart-container {
  width: 100%;
  min-height: 300px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}
</style>
