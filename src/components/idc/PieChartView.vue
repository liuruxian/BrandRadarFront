// 饼图视图组件 - 粉紫 Web3 风格
// 特点：环形图 + 白色描边 + 柔和分割
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

// 粉紫 Web3 饼图颜色顺序：粉 → 紫 → 青 → 橙 → 灰
const WEB3_PIE_COLORS = [
  '#ec4899', // 粉红
  '#8b5cf6', // 紫色
  '#06b6d4', // 青色
  '#f59e0b', // 橙色
  '#6b7280', // 灰色
  '#34d399', // 绿色
  '#f87171', // 红色
  '#a78bfa', // 浅紫
]

// 计算总计
const totalValue = computed(() => {
  return props.data.series[0]?.data.reduce((sum, val) => sum + val, 0) || 0
})

const chartOption = computed<EChartsOption>(() => {
  const pieType = props.config?.pieType || 'ring'
  // 环形图：内半径 60%，外半径 80%
  const radius = pieType === 'ring' ? ['65%', '85%'] : '65%'

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
      shadowColor: 'rgba(236, 72, 153, 0.1)',
      shadowBlur: 8,
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#4b5563', fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12,
    },
    series: [{
      type: 'pie',
      radius,
      center: ['38%', '50%'],
      // 环形图中间显示总计
      label: {
        show: pieType === 'ring',
        position: 'center',
        formatter: () => `{a|Total}\n{number|${formatNumber(totalValue.value)}}`,
        rich: {
          a: {
            fontSize: 13,
            color: '#78716c',
            fontWeight: 500,
            lineHeight: 20,
          },
          number: {
            fontSize: 28,
            fontWeight: 700,
            color: '#1c1917',
            fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
            lineHeight: 36,
          },
        },
      },
      emphasis: {
        // 放大效果
        scale: true,
        scaleSize: 8,
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(236, 72, 153, 0.3)',
        },
      },
      data: props.data.categories.map((cat, i) => ({
        name: cat,
        value: props.data.series[0]?.data[i] || 0,
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 2,
          color: WEB3_PIE_COLORS[i % WEB3_PIE_COLORS.length],
        },
      })),
    }],
  }
})

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>

<style scoped>
.pie-chart-view {
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
