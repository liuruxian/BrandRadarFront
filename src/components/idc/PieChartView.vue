// 饼图视图组件 - 简化版
// 更新时间: 2026-04-10
<template>
  <div class="pie-chart-view">
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
import { PieChart as PieChartCore } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

use([CanvasRenderer, PieChartCore, TooltipComponent, LegendComponent])

interface Props {
  data?: {
    categories: string[]
    series: { name: string; data: number[] }[]
  }
  config?: {
    pieType?: 'pie' | 'ring'
    showPercent?: boolean
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
  const pieType = props.config?.pieType || 'pie'
  const radius = pieType === 'ring' ? ['40%', '70%'] : '60%'

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius,
      center: ['40%', '50%'],
      data: props.data.categories.map((cat, i) => ({
        name: cat,
        value: props.data.series[0]?.data[i] || 0,
      })),
    }],
  }
})
</script>

<style scoped>
.pie-chart-view { width: 100%; }
.chart-container { width: 100%; min-height: 300px; }
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}
</style>
