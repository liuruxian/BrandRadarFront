<template>
  <div class="idc-tech">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h1>技术与细分市场</h1>
        <p class="page-desc">墨仓渗透率、速度段竞争格局与 MFP 功能分析</p>
      </div>
      <div class="page-actions">
        <!-- 品类切换 -->
        <div class="category-switcher">
          <n-radio-group v-model:value="selectedCategory" size="small">
            <n-radio-button value="all">全品类</n-radio-button>
            <n-radio-button value="laser">激光</n-radio-button>
            <n-radio-button value="inkjet">喷墨</n-radio-button>
          </n-radio-group>
        </div>
        <n-button @click="showFilterDrawer = true">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
          </template>
          筛选条件
        </n-button>
      </div>
    </div>

    <!-- 标签页 -->
    <n-tabs v-model:value="activeTab" type="line">
      <!-- 墨仓式渗透率分析 -->
      <n-tab-pane name="ink_tank" tab="墨仓式渗透率">
        <div class="category-hint">
          <n-alert type="info" :show-icon="true">
            墨仓式分析仅适用于喷墨打印机产品
          </n-alert>
        </div>

        <div class="tab-content">
          <!-- 分析类型选择 -->
          <div class="analysis-controls">
            <n-radio-group v-model:value="inkTankType">
              <n-radio-button value="overall">整体分析</n-radio-button>
              <n-radio-button value="region">区域渗透率</n-radio-button>
              <n-radio-button value="brand">品牌渗透率</n-radio-button>
            </n-radio-group>
          </div>

          <div class="charts-grid">
            <!-- 整体分析 -->
            <template v-if="inkTankType === 'overall'">
              <ChartCard title="墨仓 vs 墨盒 销量占比" :loading="inkTankLoading">
                <BaseChart :option="inkTankOverallOption" style="height: 350px" />
              </ChartCard>
              <ChartCard title="墨仓 vs 墨盒 销售额占比" :loading="inkTankLoading">
                <BaseChart :option="inkTankValueOption" style="height: 350px" />
              </ChartCard>
            </template>

            <!-- 区域渗透率 -->
            <template v-if="inkTankType === 'region'">
              <ChartCard title="各区域墨仓渗透率" :loading="inkTankLoading">
                <BaseChart :option="inkTankRegionOption" style="height: 400px" />
              </ChartCard>
            </template>

            <!-- 品牌渗透率 -->
            <template v-if="inkTankType === 'brand'">
              <ChartCard title="各品牌墨仓渗透率" :loading="inkTankLoading">
                <BaseChart :option="inkTankBrandOption" style="height: 400px" />
              </ChartCard>
            </template>
          </div>

          <!-- 下钻按钮 -->
          <div class="drilldown-section">
            <n-button @click="showDrilldownModal = true">查看详细下钻数据</n-button>
          </div>
        </div>
      </n-tab-pane>

      <!-- 速度段竞争格局 -->
      <n-tab-pane name="speed" tab="速度段竞争">
        <div class="tab-content">
          <div class="analysis-controls">
            <n-radio-group v-model:value="speedType">
              <n-radio-button value="capacity">市场容量</n-radio-button>
              <n-radio-button value="brand_share">品牌份额</n-radio-button>
              <n-radio-button value="scatter">速度-价格散点</n-radio-button>
              <n-radio-button value="trend">趋势变化</n-radio-button>
            </n-radio-group>
          </div>

          <div class="charts-grid">
            <!-- 市场容量 -->
            <template v-if="speedType === 'capacity'">
              <ChartCard title="速度段市场容量" :loading="speedLoading">
                <BaseChart :option="speedCapacityOption" style="height: 350px" />
              </ChartCard>
            </template>

            <!-- 品牌份额 -->
            <template v-if="speedType === 'brand_share'">
              <ChartCard title="各速度段品牌份额" :loading="speedLoading">
                <BaseChart :option="speedBrandShareOption" style="height: 400px" />
              </ChartCard>
            </template>

            <!-- 速度-价格散点 -->
            <template v-if="speedType === 'scatter'">
              <ChartCard title="速度-价格散点图" tooltip="每个点代表一个型号，气泡大小代表销量" :loading="speedLoading" class="chart-large">
                <BaseChart :option="speedScatterOption" style="height: 450px" />
              </ChartCard>
            </template>

            <!-- 趋势变化 -->
            <template v-if="speedType === 'trend'">
              <ChartCard title="速度段趋势变化" :loading="speedLoading" class="chart-large">
                <BaseChart :option="speedTrendOption" style="height: 400px" />
              </ChartCard>
            </template>
          </div>
        </div>
      </n-tab-pane>

      <!-- MFP 功能普及率 -->
      <n-tab-pane name="mfp" tab="MFP 功能">
        <div class="tab-content">
          <div class="analysis-controls">
            <n-radio-group v-model:value="mfpType">
              <n-radio-button value="coverage">功能覆盖率</n-radio-button>
              <n-radio-button value="combination">功能组合</n-radio-button>
              <n-radio-button value="brand_diff">品牌差异</n-radio-button>
              <n-radio-button value="region_diff">区域差异</n-radio-button>
            </n-radio-group>
          </div>

          <div class="charts-grid">
            <!-- 功能覆盖率 -->
            <template v-if="mfpType === 'coverage'">
              <ChartCard title="MFP 功能覆盖率 (Product Category='MFP')" :loading="mfpLoading">
                <div class="coverage-note">基于 Function 字段解析，含 Print/Copy/Scan/Fax/ADF</div>
                <BaseChart :option="mfpCoverageOption" style="height: 350px" />
              </ChartCard>
            </template>

            <!-- 功能组合 -->
            <template v-if="mfpType === 'combination'">
              <ChartCard title="常见功能组合分布" :loading="mfpLoading">
                <BaseChart :option="mfpCombinationOption" style="height: 400px" />
              </ChartCard>
            </template>

            <!-- 品牌差异 -->
            <template v-if="mfpType === 'brand_diff'">
              <ChartCard title="各品牌 MFP 功能配置" :loading="mfpLoading" class="chart-large">
                <BaseChart :option="mfpBrandDiffOption" style="height: 400px" />
              </ChartCard>
            </template>

            <!-- 区域差异 -->
            <template v-if="mfpType === 'region_diff'">
              <ChartCard title="各区域 MFP 功能普及" :loading="mfpLoading" class="chart-large">
                <BaseChart :option="mfpRegionDiffOption" style="height: 400px" />
              </ChartCard>
            </template>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 下钻弹窗 -->
    <n-modal
      v-model:show="showDrilldownModal"
      preset="dialog"
      title="墨仓式下钻分析"
      style="width: 800px"
    >
      <n-tabs type="line">
        <n-tab-pane name="country" tab="国家 Top N">
          <n-data-table :columns="drilldownColumns" :data="drilldownData" :bordered="false" size="small" />
        </n-tab-pane>
        <n-tab-pane name="model" tab="型号 Top N">
          <n-data-table :columns="drilldownColumns" :data="drilldownData" :bordered="false" size="small" />
        </n-tab-pane>
      </n-tabs>
    </n-modal>

    <!-- 筛选抽屉 -->
    <IDCFiltersDrawer
      v-model:visible="showFilterDrawer"
      title="筛选条件"
      @confirm="loadAllData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  NButton,
  NRadioGroup,
  NRadioButton,
  NTabs,
  NTabPane,
  NDataTable,
  NModal,
  NAlert,
  useMessage,
} from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useIDCStore } from '@/stores/idcStore'
import { idcApi } from '@/api/idcApi'
import type {
  InkTankAnalysisData,
  SpeedSegmentData,
  MFPFunctionData,
} from '@/api/idcApiTypes'
import ChartCard from '@/components/idc/ChartCard.vue'
import BaseChart from '@/components/idc/BaseChart.vue'
import IDCFiltersDrawer from '@/components/idc/IDCFiltersDrawer.vue'

// ==================== Web3 粉紫风格常量 ====================
const WEB3_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#34d399', '#f87171', '#f472b6', '#a78bfa']

// 统一 tooltip
const WEB3_TOOLTIP = {
  trigger: 'axis',
  backgroundColor: '#fff',
  borderColor: '#e2e8f0',
  borderWidth: 1,
  textStyle: { color: '#44403c', fontSize: 12 },
  shadowColor: 'rgba(236, 72, 153, 0.1)',
  shadowBlur: 10,
}

// 统一 grid
const WEB3_GRID = {
  left: '3%', right: '4%', bottom: '10%', top: '10%',
  containLabel: true,
}

// 统一 xAxis
const WEB3_XAXIS = {
  axisLine: { lineStyle: { color: '#e7e5e4' } },
  axisLabel: { color: '#4b5563', fontSize: 12 },
  splitLine: { show: false },
}

// 统一 yAxis
const WEB3_YAXIS = {
  type: 'value' as const,
  axisLine: { show: false },
  axisLabel: { color: '#4b5563', fontSize: 12 },
  splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' as const } },
}

// 统一 legend
const WEB3_LEGEND = {
  textStyle: { color: '#4b5563', fontSize: 12 },
}

// 获取渐变柱状图 itemStyle
function getGradientBarStyle(colorIndex: number) {
  const color = WEB3_COLORS[colorIndex % WEB3_COLORS.length]
  return {
    color: {
      type: 'linear' as const,
      x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [
        { offset: 0, color: color },
        { offset: 1, color: color + 'aa' },
      ],
    },
    borderRadius: [6, 6, 0, 0],
  }
}

// 获取折线图样式
function getLineSeriesStyle(colorIndex: number) {
  const color = WEB3_COLORS[colorIndex % WEB3_COLORS.length]
  return {
    color: color,
    lineStyle: { width: 3, color: color },
    areaStyle: {
      color: {
        type: 'linear' as const,
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: color + '33' },
          { offset: 1, color: color + '00' },
        ],
      },
    },
    emphasis: {
      showSymbol: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#fff', borderColor: color, borderWidth: 2, shadowColor: color, shadowBlur: 8 },
    },
  }
}

const message = useMessage()
const idcStore = useIDCStore()
const { filters, hasActiveFilters } = storeToRefs(idcStore)

// ==================== State ====================
const showFilterDrawer = ref(false)
const showDrilldownModal = ref(false)
const activeTab = ref('ink_tank')

// 品类筛选
const selectedCategory = ref<'all' | 'laser' | 'inkjet'>('all')

// Ink Tank
const inkTankType = ref<'overall' | 'region' | 'brand'>('overall')
const inkTankData = ref<InkTankAnalysisData | null>(null)
const inkTankLoading = ref(false)
const drilldownData = ref<Record<string, unknown>[]>([])

// Speed
const speedType = ref<'capacity' | 'brand_share' | 'scatter' | 'trend'>('capacity')
const speedData = ref<SpeedSegmentData | null>(null)
const speedLoading = ref(false)

// MFP
const mfpType = ref<'coverage' | 'combination' | 'brand_diff' | 'region_diff'>('coverage')
const mfpData = ref<MFPFunctionData | null>(null)
const mfpLoading = ref(false)

// ==================== Columns ====================
const drilldownColumns = [
  { title: '排名', key: 'rank', width: 60, align: 'center' as const },
  { title: '品牌/国家/型号', key: 'name', ellipsis: true },
  { title: '销量', key: 'units', align: 'right' as const },
  { title: '销售额', key: 'value', align: 'right' as const },
  { title: '墨仓占比', key: 'share', align: 'right' as const },
]

// ==================== Charts - Ink Tank ====================
const inkTankOverallOption = computed(() => {
  const data = inkTankData.value as { type?: string; ink_tank_units?: number; cartridge_units?: number; unknown_units?: number } | null
  if (!data || data.type !== 'overall') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'center', ...WEB3_LEGEND },
    series: [
      {
        type: 'pie',
        radius: ['65%', '85%'],
        center: ['35%', '50%'],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: { shadowBlur: 20, shadowColor: 'rgba(236, 72, 153, 0.3)' },
        },
        data: [
          { name: '墨仓式', value: data.ink_tank_units || 0, itemStyle: { color: WEB3_COLORS[0] } },
          { name: '墨盒式', value: data.cartridge_units || 0, itemStyle: { color: WEB3_COLORS[1] } },
          { name: '未知', value: data.unknown_units || 0, itemStyle: { color: WEB3_COLORS[2] } },
        ],
      },
    ],
  }
})

const inkTankValueOption = computed(() => {
  const data = inkTankData.value as { type?: string; ink_tank_value?: number; cartridge_value?: number } | null
  if (!data || data.type !== 'overall') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'center', ...WEB3_LEGEND },
    series: [
      {
        type: 'pie',
        radius: ['65%', '85%'],
        center: ['35%', '50%'],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: { shadowBlur: 20, shadowColor: 'rgba(236, 72, 153, 0.3)' },
        },
        data: [
          { name: '墨仓式', value: data.ink_tank_value || 0, itemStyle: { color: WEB3_COLORS[0] } },
          { name: '墨盒式', value: data.cartridge_value || 0, itemStyle: { color: WEB3_COLORS[1] } },
        ],
      },
    ],
  }
})

const inkTankRegionOption = computed(() => {
  const data = inkTankData.value as { type?: string; regions?: { region: string; ink_tank_share: number }[] } | null
  if (!data || data.type !== 'region') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    grid: { ...WEB3_GRID },
    xAxis: { type: 'category', data: data.regions?.map((r) => r.region) || [], ...WEB3_XAXIS, axisLabel: { ...WEB3_XAXIS.axisLabel, rotate: 30 } },
    yAxis: { axisLabel: { color: '#4b5563', fontSize: 12, formatter: (v: number) => `${v.toFixed(0)}%` }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, ...WEB3_YAXIS },
    series: [
      {
        type: 'bar',
        data: data.regions?.map((r, idx) => ({ value: r.ink_tank_share * 100, itemStyle: getGradientBarStyle(idx) })) || [],
        barWidth: 30,
      },
    ],
  }
})

const inkTankBrandOption = computed(() => {
  const data = inkTankData.value as { type?: string; brands?: { brand: string; ink_tank_share: number }[] } | null
  if (!data || data.type !== 'brand') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    grid: { ...WEB3_GRID },
    xAxis: { type: 'category', data: data.brands?.map((b) => b.brand) || [], ...WEB3_XAXIS, axisLabel: { ...WEB3_XAXIS.axisLabel, rotate: 30 } },
    yAxis: { axisLabel: { color: '#4b5563', fontSize: 12, formatter: (v: number) => `${v.toFixed(0)}%` }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, ...WEB3_YAXIS },
    series: [
      {
        type: 'bar',
        data: data.brands?.map((b, idx) => ({ value: b.ink_tank_share * 100, itemStyle: getGradientBarStyle(idx) })) || [],
        barWidth: 20,
      },
    ],
  }
})

// ==================== Charts - Speed ====================
const speedCapacityOption = computed(() => {
  const data = speedData.value as { type?: string; segments?: { segment: string; units: number; value: number }[] } | null
  if (!data || data.type !== 'capacity') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    legend: { data: ['销量', '销售额'], bottom: 0, ...WEB3_LEGEND },
    grid: { ...WEB3_GRID, bottom: '15%' },
    xAxis: { type: 'category', data: data.segments?.map((s) => s.segment) || [], ...WEB3_XAXIS },
    yAxis: [
      { name: '销量', ...WEB3_YAXIS },
      { name: '销售额', axisLabel: { color: '#4b5563', fontSize: 12 }, splitLine: { show: false }, ...WEB3_YAXIS },
    ],
    series: [
      { name: '销量', type: 'bar', data: data.segments?.map((s, idx) => ({ value: s.units, itemStyle: getGradientBarStyle(idx) })) || [], barWidth: 30 },
      { name: '销售额', type: 'bar', yAxisIndex: 1, data: data.segments?.map((s, idx) => ({ value: s.value, itemStyle: getGradientBarStyle(idx + 1) })) || [], barWidth: 30 },
    ],
  }
})

const speedBrandShareOption = computed(() => {
  const data = speedData.value as { type?: string; segments?: string[]; brands?: string[]; series?: number[][] } | null
  if (!data || data.type !== 'brand_share') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    legend: { data: data.brands?.slice(0, 6) || [], bottom: 0, ...WEB3_LEGEND },
    grid: { ...WEB3_GRID, bottom: '15%' },
    xAxis: { type: 'category', data: data.segments || [], ...WEB3_XAXIS },
    yAxis: { axisLabel: { color: '#4b5563', fontSize: 12, formatter: (v: number) => `${v.toFixed(0)}%` }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, ...WEB3_YAXIS },
    series: data.brands?.slice(0, 6).map((brand, idx) => ({
      name: brand,
      type: 'bar',
      stack: 'total',
      data: data.series?.[idx]?.map((v: number) => v * 100) || [],
      itemStyle: getGradientBarStyle(idx),
    })) || [],
  }
})

const speedScatterOption = computed(() => {
  const data = speedData.value as { type?: string; points?: { speed: number; asp: number; units: number; brand: string }[] } | null
  if (!data || data.type !== 'scatter') return {}

  const brands = [...new Set(data.points?.map((p) => p.brand) || [])]

  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: (params: { data: { brand: string; speed: number; asp: number; units: number; name: string } }) => `${params.data.name}<br/>品牌: ${params.data.brand}<br/>速度: ${params.data.speed} ppm<br/>ASP: $${params.data.asp.toFixed(0)}<br/>销量: ${params.data.units.toLocaleString()}`, ...WEB3_TOOLTIP },
    legend: { data: brands.slice(0, 8), bottom: 0, ...WEB3_LEGEND },
    grid: { ...WEB3_GRID, bottom: '15%' },
    xAxis: { type: 'value', name: '速度 (PPM)', ...WEB3_XAXIS, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } },
    yAxis: { type: 'value', name: 'ASP (USD)', ...WEB3_YAXIS, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } },
    series: brands.slice(0, 8).map((brand, idx) => ({
      name: brand,
      type: 'scatter',
      data: data.points?.filter((p) => p.brand === brand).map((p) => ({ ...p, value: [p.speed, p.asp, p.units] })) || [],
      symbolSize: (val: number[]) => Math.sqrt(val[2]) / 10,
      itemStyle: { color: WEB3_COLORS[idx % WEB3_COLORS.length], opacity: 0.7 },
    })) || [],
  }
})

const speedTrendOption = computed(() => {
  const data = speedData.value as { type?: string; periods?: string[]; series?: { name: string; data: number[] }[] } | null
  if (!data || data.type !== 'trend') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    legend: { data: data.series?.map((s) => s.name) || [], bottom: 0, ...WEB3_LEGEND },
    grid: { ...WEB3_GRID, bottom: '15%' },
    xAxis: { type: 'category', data: data.periods || [], ...WEB3_XAXIS },
    yAxis: { ...WEB3_YAXIS },
    series: data.series?.map((s, idx) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: 0.4,
      showSymbol: false,
      lineStyle: { width: 3, color: WEB3_COLORS[idx % WEB3_COLORS.length] },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: WEB3_COLORS[idx % WEB3_COLORS.length] + '33' },
            { offset: 1, color: WEB3_COLORS[idx % WEB3_COLORS.length] + '00' },
          ],
        },
      },
      emphasis: {
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#fff', borderColor: WEB3_COLORS[idx % WEB3_COLORS.length], borderWidth: 2, shadowColor: WEB3_COLORS[idx % WEB3_COLORS.length], shadowBlur: 8 },
      },
    })) || [],
  }
})

// ==================== Charts - MFP ====================
const mfpCoverageOption = computed(() => {
  const data = mfpData.value as { type?: string; print_rate?: number; copy_rate?: number; scan_rate?: number; fax_rate?: number; adf_rate?: number } | null
  if (!data || data.type !== 'coverage') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    grid: { ...WEB3_GRID },
    xAxis: { type: 'category', data: ['Print', 'Copy', 'Scan', 'Fax', 'ADF'], ...WEB3_XAXIS },
    yAxis: { axisLabel: { color: '#4b5563', fontSize: 12, formatter: (v: number) => `${v.toFixed(0)}%` }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, max: 100, ...WEB3_YAXIS },
    series: [
      {
        type: 'bar',
        data: [
          { value: (data.print_rate || 0) * 100, itemStyle: getGradientBarStyle(0) },
          { value: (data.copy_rate || 0) * 100, itemStyle: getGradientBarStyle(1) },
          { value: (data.scan_rate || 0) * 100, itemStyle: getGradientBarStyle(2) },
          { value: (data.fax_rate || 0) * 100, itemStyle: getGradientBarStyle(3) },
          { value: (data.adf_rate || 0) * 100, itemStyle: getGradientBarStyle(4) },
        ],
        barWidth: 40,
      },
    ],
  }
})

const mfpCombinationOption = computed(() => {
  const data = mfpData.value as { type?: string; combinations?: { functions: string[]; count: number; share: number }[] } | null
  if (!data || data.type !== 'combination') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'center', ...WEB3_LEGEND },
    series: [
      {
        type: 'pie',
        radius: ['65%', '85%'],
        center: ['35%', '50%'],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: { shadowBlur: 20, shadowColor: 'rgba(236, 72, 153, 0.3)' },
        },
        data: data.combinations?.map((c, idx) => ({
          name: c.functions.join('+'),
          value: c.count,
          itemStyle: { color: WEB3_COLORS[idx % WEB3_COLORS.length] },
        })) || [],
      },
    ],
  }
})

const mfpBrandDiffOption = computed(() => {
  const data = mfpData.value as { type?: string; brands?: { brand: string; functions: { print_rate?: number; copy_rate?: number; scan_rate?: number; fax_rate?: number; adf_rate?: number } }[] } | null
  if (!data || data.type !== 'brand_diff') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    legend: { data: ['Print', 'Copy', 'Scan', 'Fax', 'ADF'], bottom: 0, ...WEB3_LEGEND },
    grid: { ...WEB3_GRID, bottom: '15%' },
    xAxis: { type: 'category', data: data.brands?.map((b) => b.brand) || [], ...WEB3_XAXIS, axisLabel: { ...WEB3_XAXIS.axisLabel, rotate: 30 } },
    yAxis: { axisLabel: { color: '#4b5563', fontSize: 12, formatter: (v: number) => `${v.toFixed(0)}%` }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, max: 100, ...WEB3_YAXIS },
    series: [
      { name: 'Print', type: 'bar', data: data.brands?.map((b) => ((b.functions.print_rate || 0) * 100).toFixed(2)) || [], itemStyle: getGradientBarStyle(0) },
      { name: 'Copy', type: 'bar', data: data.brands?.map((b) => ((b.functions.copy_rate || 0) * 100).toFixed(2)) || [], itemStyle: getGradientBarStyle(1) },
      { name: 'Scan', type: 'bar', data: data.brands?.map((b) => ((b.functions.scan_rate || 0) * 100).toFixed(2)) || [], itemStyle: getGradientBarStyle(2) },
      { name: 'Fax', type: 'bar', data: data.brands?.map((b) => ((b.functions.fax_rate || 0) * 100).toFixed(2)) || [], itemStyle: getGradientBarStyle(3) },
      { name: 'ADF', type: 'bar', data: data.brands?.map((b) => ((b.functions.adf_rate || 0) * 100).toFixed(2)) || [], itemStyle: getGradientBarStyle(4) },
    ],
  }
})

const mfpRegionDiffOption = computed(() => {
  const data = mfpData.value as { type?: string; regions?: { region: string; functions: { print_rate?: number; copy_rate?: number; scan_rate?: number; fax_rate?: number; adf_rate?: number } }[] } | null
  if (!data || data.type !== 'region_diff') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    legend: { data: ['Print', 'Copy', 'Scan', 'Fax', 'ADF'], bottom: 0, ...WEB3_LEGEND },
    grid: { ...WEB3_GRID, bottom: '15%' },
    xAxis: { type: 'category', data: data.regions?.map((r) => r.region) || [], ...WEB3_XAXIS, axisLabel: { ...WEB3_XAXIS.axisLabel, rotate: 30 } },
    yAxis: { axisLabel: { color: '#4b5563', fontSize: 12, formatter: (v: number) => `${v.toFixed(0)}%` }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, max: 100, ...WEB3_YAXIS },
    series: [
      { name: 'Print', type: 'bar', data: data.regions?.map((r) => ((r.functions.print_rate || 0) * 100).toFixed(2)) || [], itemStyle: getGradientBarStyle(0) },
      { name: 'Copy', type: 'bar', data: data.regions?.map((r) => ((r.functions.copy_rate || 0) * 100).toFixed(2)) || [], itemStyle: getGradientBarStyle(1) },
      { name: 'Scan', type: 'bar', data: data.regions?.map((r) => ((r.functions.scan_rate || 0) * 100).toFixed(2)) || [], itemStyle: getGradientBarStyle(2) },
      { name: 'Fax', type: 'bar', data: data.regions?.map((r) => ((r.functions.fax_rate || 0) * 100).toFixed(2)) || [], itemStyle: getGradientBarStyle(3) },
      { name: 'ADF', type: 'bar', data: data.regions?.map((r) => ((r.functions.adf_rate || 0) * 100).toFixed(2)) || [], itemStyle: getGradientBarStyle(4) },
    ],
  }
})

// ==================== Methods ====================
async function loadAllData() {
  await Promise.all([
    loadInkTankData(),
    loadSpeedData(),
    loadMFPData(),
  ])
}

async function loadInkTankData() {
  inkTankLoading.value = true
  try {
    const res = await idcApi.getInkTankAnalysis(
      inkTankType.value,
      undefined,
      hasActiveFilters.value ? filters.value : undefined
    )
    if (res.success && res.data) {
      inkTankData.value = res.data
    }
  } catch (e) {
    message.error('加载墨仓数据失败')
  } finally {
    inkTankLoading.value = false
  }
}

async function loadSpeedData() {
  speedLoading.value = true
  try {
    const res = await idcApi.getSpeedSegmentAnalysis(
      speedType.value,
      hasActiveFilters.value ? filters.value : undefined
    )
    if (res.success && res.data) {
      speedData.value = res.data
    }
  } catch (e) {
    message.error('加载速度段数据失败')
  } finally {
    speedLoading.value = false
  }
}

async function loadMFPData() {
  mfpLoading.value = true
  try {
    const res = await idcApi.getMFPFunctionAnalysis(
      mfpType.value,
      hasActiveFilters.value ? filters.value : undefined
    )
    if (res.success && res.data) {
      mfpData.value = res.data
    }
  } catch (e) {
    message.error('加载 MFP 数据失败')
  } finally {
    mfpLoading.value = false
  }
}

// ==================== Lifecycle ====================
onMounted(async () => {
  await idcStore.loadFilterOptions()
  await loadAllData()
})

watch(selectedCategory, (newCategory) => {
  idcStore.setProductType(newCategory)
  loadAllData()
})
</script>

<style scoped>
.idc-tech {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.25);
  overflow: hidden;
  margin: 0;
}

.page-title h1 {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.2;
}

.page-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin: 4px 0 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.page-actions :deep(.n-button) {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}
.page-actions :deep(.n-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}
.page-actions :deep(.n-radio-group) {
  color: white;
}
.page-actions :deep(.n-radio-button) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}
.page-actions :deep(.n-radio-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}
.page-actions :deep(.n-radio-button--checked) {
  background: rgba(255, 255, 255, 0.35) !important;
  border-color: rgba(255, 255, 255, 0.6) !important;
  color: white !important;
}

.tab-content {
  padding-top: 16px;
}

.analysis-controls {
  margin-bottom: 16px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-large {
  grid-column: 1 / -1;
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.drilldown-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

/* ====== 品类相关样式 ====== */
.category-switcher {
  margin-right: 8px;
}

.category-hint {
  margin-bottom: 16px;
}

.category-hint .n-alert {
  border-radius: 8px;
}
</style>
