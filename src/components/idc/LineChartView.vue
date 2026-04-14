// 折线图视图组件 - 粉紫 Web3 风格
// 特点：平滑曲线 + 渐变面积 + Hover 数据点
<template>
  <div class="line-chart-view">
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
import { LineChart as LineChartCore } from 'echarts/charts'
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
  LineChartCore,
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
    smooth?: boolean
    showArea?: boolean
    showDataLabel?: boolean
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

// 粉紫 Web3 线条颜色
const WEB3_LINE_COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981']

// 创建渐变面积
function createAreaGradient(lineColor: string) {
  return {
    type: 'linear' as const,
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: lineColor.replace(')', ', 0.35)').replace('rgb', 'rgba') },
      { offset: 0.6, color: lineColor.replace(')', ', 0.1)').replace('rgb', 'rgba') },
      { offset: 1, color: 'rgba(255, 255, 255, 0)' },
    ],
  }
}

// 处理 rgba 颜色格式
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const chartOption = computed<EChartsOption>(() => {
  const smooth = props.config?.smooth ?? true
  const showArea = props.config?.showArea ?? true
  const showDataLabel = props.config?.showDataLabel ?? false

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
      shadowColor: 'rgba(139, 92, 246, 0.15)',
      shadowBlur: 10,
      axisPointer: {
        type: 'cross',
        lineStyle: { color: '#e7e5e4', type: 'dashed' as const },
        crossStyle: { color: '#d1d5db' },
      },
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: '#44403c', fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: props.data.categories,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e7e5e4' } },
      axisLabel: { color: '#4b5563', fontSize: 12 },
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
    series: props.data.series.map((s, index) => {
      const lineColor = WEB3_LINE_COLORS[index % WEB3_LINE_COLORS.length]
      return {
        name: s.name,
        type: 'line',
        data: s.data,
        smooth,
        // 线条宽度 3px
        lineStyle: {
          width: 3,
          color: lineColor,
        },
        // 渐变面积
        areaStyle: showArea
          ? {
              color: {
                type: 'linear' as const,
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: hexToRgba(lineColor, 0.25) },
                  { offset: 0.5, color: hexToRgba(lineColor, 0.08) },
                  { offset: 1, color: hexToRgba(lineColor, 0) },
                ],
              },
            }
          : undefined,
        // 数据点：平时隐藏，Hover 显示
        showSymbol: false,
        emphasis: {
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#fff',
            borderColor: lineColor,
            borderWidth: 2,
            shadowColor: lineColor,
            shadowBlur: 8,
          },
        },
        // 数据标签（可选）
        label: showDataLabel
          ? {
              show: true,
              position: 'top',
              formatter: '{c}',
              fontSize: 11,
              color: lineColor,
              fontWeight: 600,
            }
          : { show: false },
      }
    }),
    dataZoom: props.data.categories.length > 10
      ? [{ type: 'inside', start: 0, end: 100 }]
      : undefined,
  }
})
</script>

<style scoped>
.line-chart-view {
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
