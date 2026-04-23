// 柱状图视图组件 - 粉紫 Web3 风格
// 特点：渐变填充 + 顶部圆角 + 粉色投影
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

use([
  CanvasRenderer,
  BarChartCore,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
])

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

// 蓝色 Web3 渐变色系
const WEB3_COLORS = [
  ['#2563eb', '#004ac6'], // 深蓝渐变
  ['#60a5fa', '#2563eb'], // 浅蓝渐变
  ['#67e8f9', '#06b6d4'], // 浅青 → 青色
  ['#fcd34d', '#f59e0b'], // 浅橙 → 橙色
  ['#a8a29e', '#78716c'], // 浅灰 → 灰色
]

// 创建渐变色
function createBarGradient(colorIndex: number) {
  const [color1, color2] = WEB3_COLORS[colorIndex % WEB3_COLORS.length]
  return {
    type: 'linear' as const,
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: color1 },
      { offset: 1, color: color2 },
    ],
  }
}

const chartOption = computed<EChartsOption>(() => {
  const showDataLabel = props.config?.showDataLabel ?? true
  const showLegend = props.config?.showLegend ?? true

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
      shadowColor: 'rgba(0, 74, 198, 0.1)',
      shadowBlur: 10,
    },
    legend: showLegend
      ? {
          top: 0,
          right: 0,
          textStyle: { color: '#44403c', fontSize: 12 },
        }
      : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: showLegend ? '8%' : '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: props.data.categories,
      axisLine: { lineStyle: { color: '#e7e5e4' } },
      axisLabel: {
        color: '#4b5563',
        fontSize: 12,
        rotate: 30,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#4b5563', fontSize: 12 },
      splitLine: {
        lineStyle: { color: '#f3f4f6', type: 'dashed' as const },
      },
    },
    series: props.data.series.map((s, index) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      barMaxWidth: 60,
      barCategoryGap: '30%',
      // 顶部圆角 6px
      itemStyle: {
        color: createBarGradient(index),
        borderRadius: [6, 6, 0, 0],
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 8,
          shadowColor: 'rgba(0, 74, 198, 0.15)',
        },
      },
      label: showDataLabel
        ? {
            show: true,
            position: 'top',
            formatter: '{c}',
            fontSize: 11,
            color: '#4b5563',
            fontWeight: 600,
          }
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
