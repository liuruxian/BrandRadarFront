// 热力图视图组件 - 粉紫 Web3 风格
<template>
  <div class="heatmap-view">
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
import { HeatmapChart as HeatmapChartCore } from 'echarts/charts'
import {
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

use([CanvasRenderer, HeatmapChartCore, TooltipComponent, VisualMapComponent, GridComponent])

interface Props {
  data?: { x: string; y: string; value: number }[]
  loading?: boolean
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  height: 400,
})

const chartRef = ref<HTMLElement>()
const hasData = computed(() => props.data.length > 0)

// 粉紫 Web3 风格热力图颜色：粉 → 紫 → 青
const HEATMAP_COLORS = ['#eff6ff', '#bfdbfe', '#004ac6', '#2563eb', '#06b6d4', '#0891b2']

const chartOption = computed<EChartsOption>(() => {
  const xAxisData = [...new Set(props.data.map(d => d.x))]
  const yAxisData = [...new Set(props.data.map(d => d.y))]
  const values = props.data.map(d => d.value)
  const maxVal = Math.max(...values, 1)
  const minVal = Math.min(...values, 0)

  return {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
      shadowColor: 'rgba(0, 74, 198, 0.08)',
      shadowBlur: 8,
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#e7e5e4' } },
      axisLabel: { color: '#4b5563', fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#e7e5e4' } },
      axisLabel: { color: '#4b5563', fontSize: 11 },
    },
    visualMap: {
      min: minVal,
      max: maxVal,
      calculable: true,
      orient: 'vertical',
      right: 0,
      top: 'center',
      textStyle: { color: '#4b5563', fontSize: 11 },
      inRange: { color: HEATMAP_COLORS },
      itemWidth: 12,
      itemHeight: 120,
    },
    series: [{
      type: 'heatmap',
      data: props.data.map(d => [xAxisData.indexOf(d.x), yAxisData.indexOf(d.y), d.value]),
      label: { show: true, color: '#fff', fontSize: 11, fontWeight: 600 },
      emphasis: {
        itemStyle: {
          shadowBlur: 8,
          shadowColor: 'rgba(0, 74, 198, 0.2)',
        },
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
      },
    }],
  }
})
</script>

<style scoped>
.heatmap-view { width: 100%; }
.chart-container { width: 100%; min-height: 300px; }
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}
</style>
