<template>
  <div class="echarts-wrapper" v-if="!needsMap || renderReady">
    <v-chart
      class="echarts-content"
      :option="mergedOption"
      :autoresize="true"
      :update-options="{ notMerge: true }"
    />
  </div>
  <div v-else class="echarts-wrapper echarts-loading">
    <div class="loading-placeholder">
      <span>正在加载地图...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  ScatterChart,
  GaugeChart,
  FunnelChart,
  SankeyChart,
  MapChart,
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  GraphicComponent,
  TitleComponent,
  GeoComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import * as topojson from 'topojson-client'
import type { Topology } from 'topojson-specification'
import 'echarts-gl'

// 地图是否已注册的标记
const mapRegistered = ref(false)

// 注册必要的组件（只执行一次）
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  ScatterChart,
  GaugeChart,
  FunnelChart,
  SankeyChart,
  MapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  GraphicComponent,
  TitleComponent,
  GeoComponent,
])

// 地图注册 Promise，用于等待地图加载完成
let mapLoadPromise: Promise<void> | null = null

// 加载世界地图（只在第一次时加载）
async function ensureWorldMap() {
  if (mapRegistered.value) return
  if (mapLoadPromise) return mapLoadPromise

  mapLoadPromise = (async () => {
    try {
      // 加载 TopoJSON 格式的世界地图（包含国家名称）
      const res = await fetch('/world.json')
      const topoData: Topology = await res.json()

      // 转换为 GeoJSON FeatureCollection 并添加国家名称
      const countries = topojson.feature(topoData, topoData.objects.countries as any) as any

      // 为每个特征添加 name 属性
      if (countries.features) {
        countries.features = countries.features.map((feature: any) => ({
          ...feature,
          name: feature.properties?.name || feature.id || 'Unknown'
        }))
      }

      echarts.registerMap('world', countries)
      mapRegistered.value = true
      console.log('[BaseChart] World map registered with', countries.features?.length, 'countries')
    } catch (e) {
      console.error('[BaseChart] Failed to register world map:', e)
    }
  })()

  return mapLoadPromise
}

onMounted(() => {
  ensureWorldMap()
})

interface Props {
  option: Record<string, unknown>
  darkMode?: boolean
  mapType?: string // 用于标识需要地图的类型
}

const props = withDefaults(defineProps<Props>(), {
  darkMode: false,
  mapType: undefined,
})

// 判断当前配置是否需要地图
const needsMap = computed(() => {
  const option = props.option as { geo?: { map?: string }; series?: Array<{ type?: string; map?: string; coordinateSystem?: string }>; globe?: any }
  return option?.geo?.map || option?.globe || option?.series?.some((s) => s.type === 'map' && s.coordinateSystem === 'globe')
})

// 等待地图加载完成后再渲染
const renderReady = ref(!needsMap.value)
let unwatchNeedsMap: (() => void) | null = null

// 监听是否需要地图，如果需要则等待地图注册完成
if (needsMap.value) {
  unwatchNeedsMap = watch(
    () => mapRegistered.value,
    async (registered) => {
      if (registered) {
        renderReady.value = true
        unwatchNeedsMap?.()
      }
    },
    { immediate: true }
  )

  // 立即触发地图加载
  ensureWorldMap()
}

// 合并基础配置
const mergedOption = computed(() => {
  const baseTheme = {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    },
  }

  // 粉紫 Web3 风格的 Tooltip
  const tooltipTheme = props.darkMode
    ? {
        trigger: 'axis',
        backgroundColor: 'rgba(26, 28, 34, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        textStyle: {
          color: '#F8FAFC',
          fontSize: 12,
        },
        shadowColor: 'rgba(236, 72, 153, 0.2)',
        shadowBlur: 12,
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#94A3B8',
          },
        },
      }
    : {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#44403c',
          fontSize: 12,
        },
        shadowColor: 'rgba(236, 72, 153, 0.1)',
        shadowBlur: 10,
      }

  // 粉紫 Web3 风格的 Grid（降噪处理）
  const gridTheme = props.darkMode
    ? {
        left: '3%',
        right: '4%',
        bottom: '8%',
        containLabel: true,
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }
    : {
        left: '3%',
        right: '4%',
        bottom: '8%',
        containLabel: true,
        borderColor: 'transparent',
      }

  // 粉紫 Web3 风格的 Legend
  const legendTheme = props.darkMode
    ? {
        textStyle: {
          color: '#CBD5E1',
        },
        pageTextStyle: {
          color: '#CBD5E1',
        },
      }
    : {
        textStyle: {
          color: '#4b5563',
        },
      }

  // X 轴样式
  const xAxisTheme = {
    axisLine: {
      lineStyle: { color: '#e7e5e4' }
    },
    axisLabel: {
      color: '#4b5563',
      fontSize: 12,
    },
    splitLine: {
      show: false,
    },
  }

  // Y 轴样式（降噪：隐藏网格或使用淡色虚线）
  const yAxisTheme = {
    axisLine: { show: false },
    axisLabel: {
      color: '#4b5563',
      fontSize: 12,
    },
    splitLine: {
      lineStyle: {
        color: '#f3f4f6',
        type: 'dashed' as const,
        width: 1,
      },
    },
  }

  return {
    ...baseTheme,
    tooltip: { ...tooltipTheme, ...(props.option.tooltip || {}) },
    grid: { ...gridTheme, ...(props.option.grid || {}) },
    legend: { ...legendTheme, ...(props.option.legend || {}) },
    xAxis: { ...xAxisTheme, ...(props.option.xAxis || {}) },
    yAxis: { ...yAxisTheme, ...(props.option.yAxis || {}) },
    ...props.option,
  }
})
</script>

<style scoped>
.echarts-wrapper {
  width: 100%;
  height: 100%;
  min-height: 200px;
  position: relative;
}

.echarts-content {
  width: 100%;
  height: 100%;
}

.echarts-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(243, 244, 246, 0.5);
  border-radius: 8px;
}

.loading-placeholder {
  color: #6b7280;
  font-size: 14px;
}
</style>
