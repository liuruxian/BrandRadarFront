// 折线图视图组件 - 简化版
// 更新时间: 2026-04-10
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

const chartOption = computed<EChartsOption>(() => {
  const smooth = props.config?.smooth ?? true
  const showArea = props.config?.showArea ?? false

  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 0 },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: props.data.categories, boundaryGap: false },
    yAxis: { type: 'value' },
    series: props.data.series.map(s => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth,
      areaStyle: showArea ? { opacity: 0.3 } : undefined,
    })),
  }
})
</script>

<style scoped>
.line-chart-view { width: 100%; }
.chart-container { width: 100%; min-height: 300px; }
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}
</style>
