<template>
  <div class="idc-channel">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h1>渠道与价格洞察</h1>
        <p class="page-desc">渠道流向分析与价格段分布研究</p>
      </div>
      <div class="page-actions">
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

    <!-- 渠道分析 -->
    <div class="section-title">
      <h2>渠道流向分析</h2>
      <div class="section-tabs">
        <n-radio-group v-model:value="channelCategory">
          <n-radio-button value="all">全品类</n-radio-button>
          <n-radio-button value="laser">激光</n-radio-button>
          <n-radio-button value="inkjet">喷墨</n-radio-button>
        </n-radio-group>
      </div>
    </div>

    <div class="charts-grid">
      <!-- 渠道桑基图 -->
      <ChartCard
        title="渠道流向桑基图"
        tooltip="展示从渠道类型到渠道组再到品牌的流向"
        :loading="sankeyLoading"
        class="chart-large"
      >
        <BaseChart :option="sankeyOption" style="height: 450px" />
      </ChartCard>

      <!-- 渠道占比堆叠图 -->
      <ChartCard
        title="品牌渠道结构"
        tooltip="Top 品牌在不同渠道组的分布"
        :loading="stackedLoading"
        class="chart-medium"
      >
        <template #header>
          <n-select
            v-model:value="stackedTopN"
            :options="topNOptions"
            size="small"
            style="width: 100px"
          />
        </template>
        <BaseChart :option="stackedOption" style="height: 350px" />
      </ChartCard>

      <!-- 线上线下趋势 -->
      <ChartCard
        title="线上线下趋势"
        tooltip="线上渠道(InDirect) vs 线下渠道(Direct) 销量趋势"
        :loading="onlineOfflineLoading"
        class="chart-medium"
      >
        <BaseChart :option="onlineOfflineOption" style="height: 350px" />
      </ChartCard>
    </div>

    <!-- 价格段分析 -->
    <div class="section-title">
      <h2>价格段分布分析</h2>
    </div>

    <div class="charts-grid">
      <!-- 市场价格段容量 -->
      <ChartCard
        title="市场价格段容量"
        tooltip="按价格段统计的市场容量分布"
        :loading="segmentLoading"
        class="chart-medium"
      >
        <BaseChart :option="marketCapacityOption" style="height: 350px" />
      </ChartCard>

      <!-- 品牌价格段占位 -->
      <ChartCard
        title="品牌价格段占位"
        tooltip="各品牌在不同价格段的市场份额"
        :loading="segmentLoading"
        class="chart-medium"
      >
        <BaseChart :option="brandPositionOption" style="height: 350px" />
      </ChartCard>

      <!-- ASP 时间趋势 -->
      <ChartCard
        title="市场 ASP 趋势"
        tooltip="整体市场平均价格的时间变化"
        :loading="segmentLoading"
        class="chart-medium"
      >
        <BaseChart :option="aspTrendOption" style="height: 350px" />
      </ChartCard>

      <!-- 品牌 ASP 对比 -->
      <ChartCard
        title="品牌 ASP 对比"
        tooltip="各品牌平均单价的对比"
        :loading="segmentLoading"
        class="chart-medium"
      >
        <BaseChart :option="brandASPCompareOption" style="height: 350px" />
      </ChartCard>
    </div>

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
import { NButton, NSelect } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useIDCStore } from '@/stores/idcStore'
import { idcApi } from '@/api/idcApi'
import type {
  ChannelSankeyData,
  ChannelStackedData,
  PriceSegmentData,
  OnlineOfflineData,
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
function getGradientBarStyle(colorIndex: number, rounded: 'all' | 'top' | 'none' = 'top') {
  const color = WEB3_COLORS[colorIndex % WEB3_COLORS.length]
  const radius = rounded === 'none' ? [0, 0, 0, 0] : [6, 6, 0, 0]
  return {
    color: {
      type: 'linear' as const,
      x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [
        { offset: 0, color: color },
        { offset: 1, color: color + 'aa' },
      ],
    },
    borderRadius: radius,
  }
}

// 获取折线图样式
function getLineSeriesStyle(colorIndex: number) {
  const color = WEB3_COLORS[colorIndex % WEB3_COLORS.length]
  return {
    color: color,
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

const idcStore = useIDCStore()
const { filters, hasActiveFilters } = storeToRefs(idcStore)

// ==================== State ====================
const showFilterDrawer = ref(false)
const sankeyLoading = ref(false)
const stackedLoading = ref(false)
const segmentLoading = ref(false)
const onlineOfflineLoading = ref(false)
const stackedTopN = ref(10)

// 品类筛选
const channelCategory = ref<'all' | 'laser' | 'inkjet'>('all')

// Data
const sankeyData = ref<ChannelSankeyData | null>(null)
const stackedData = ref<ChannelStackedData | null>(null)
const segmentMarketCapacity = ref<PriceSegmentData | null>(null)
const segmentBrandPosition = ref<PriceSegmentData | null>(null)
const segmentAspTrend = ref<PriceSegmentData | null>(null)
const segmentBrandAspCompare = ref<PriceSegmentData | null>(null)
const onlineOfflineData = ref<OnlineOfflineData | null>(null)

// ==================== Options ====================
const topNOptions = [
  { label: 'Top 5', value: 5 },
  { label: 'Top 10', value: 10 },
  { label: 'Top 15', value: 15 },
]

// ==================== Charts ====================
const sankeyOption = computed(() => {
  const data = sankeyData.value
  if (!data) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      ...WEB3_TOOLTIP,
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: { focus: 'adjacency' },
        nodeAlign: 'left',
        layoutInfo: {
          sort: undefined,
        },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.4,
        },
        itemStyle: {
          borderWidth: 0,
        },
        label: {
          color: '#F8FAFC',
          fontSize: 12,
        },
        data: data.nodes.map((n, idx) => ({
          name: n.name,
          itemStyle: {
            color: WEB3_COLORS[idx % WEB3_COLORS.length],
          },
        })),
        links: data.links.map((l) => ({
          source: l.source,
          target: l.target,
          value: l.value,
        })),
      },
    ],
  }
})

const stackedOption = computed(() => {
  const data = stackedData.value
  if (!data) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    legend: { data: data.brands.slice(0, 10), bottom: 0, ...WEB3_LEGEND },
    grid: { ...WEB3_GRID, bottom: '15%' },
    xAxis: { type: 'category', data: data.channel_groups, ...WEB3_XAXIS, axisLabel: { ...WEB3_XAXIS.axisLabel, rotate: 30 } },
    yAxis: { ...WEB3_YAXIS },
    series: data.brands.slice(0, stackedTopN.value).map((brand, idx) => ({
      name: brand,
      type: 'bar',
      stack: 'total',
      data: data.series[idx]?.data || [],
      itemStyle: getGradientBarStyle(idx, 'none'),
      emphasis: { focus: 'series' },
    })),
  }
})

const marketCapacityOption = computed(() => {
  const data = segmentMarketCapacity.value
  if (!data || data.type !== 'market_capacity') return {}

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
        data: data.segments.map((seg, idx) => ({
          name: `${seg.name} (${seg.range})`,
          value: seg.units,
          itemStyle: { color: WEB3_COLORS[idx % WEB3_COLORS.length] },
        })),
      },
    ],
  }
})

const brandPositionOption = computed(() => {
  const data = segmentBrandPosition.value
  if (!data || data.type !== 'brand_position') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    legend: { data: data.brands.slice(0, 5), bottom: 0, ...WEB3_LEGEND },
    grid: { ...WEB3_GRID, bottom: '15%' },
    xAxis: { type: 'value', axisLabel: { color: '#4b5563', fontSize: 12, formatter: (v: number) => `${(v * 100).toFixed(0)}%` }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } },
    yAxis: { type: 'category', data: ['入门 (<$200)', '中端 ($200-1000)', '高端 (>$1000)'], axisLabel: { color: '#4b5563', fontSize: 12 } },
    series: data.brands.slice(0, 5).map((brand, idx) => ({
      name: brand,
      type: 'bar',
      stack: 'total',
      data: data.series[idx]?.data?.map((v: number) => v / 100) || [],
      itemStyle: getGradientBarStyle(idx, 'none'),
    })),
  }
})

const aspTrendOption = computed(() => {
  const data = segmentAspTrend.value
  if (!data || data.type !== 'asp_trend') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    legend: { data: data.series.map((s) => s.name), bottom: 0, ...WEB3_LEGEND },
    grid: { ...WEB3_GRID, bottom: '15%' },
    xAxis: { type: 'category', data: data.periods, ...WEB3_XAXIS },
    yAxis: { axisLabel: { color: '#4b5563', fontSize: 12, formatter: (v: number) => `$${v.toFixed(0)}` }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, ...WEB3_YAXIS },
    series: data.series.map((s, idx) => ({
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
      ...getLineSeriesStyle(idx),
    })),
  }
})

const brandASPCompareOption = computed(() => {
  const data = segmentBrandAspCompare.value
  if (!data || data.type !== 'brand_asp_compare') return {}

  return {
    backgroundColor: 'transparent',
    tooltip: { ...WEB3_TOOLTIP, trigger: 'axis' },
    grid: { ...WEB3_GRID, bottom: '10%' },
    xAxis: { type: 'category', data: data.brands, ...WEB3_XAXIS, axisLabel: { ...WEB3_XAXIS.axisLabel, rotate: 30 } },
    yAxis: { axisLabel: { color: '#4b5563', fontSize: 12, formatter: (v: number) => `$${v.toFixed(0)}` }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, ...WEB3_YAXIS },
    series: [
      {
        type: 'bar',
        data: data.asp.map((v, idx) => ({
          value: v,
          itemStyle: getGradientBarStyle(idx),
        })),
        barWidth: 30,
      },
    ],
  }
})

// 线上线下趋势图
const onlineOfflineOption = computed(() => {
  const data = onlineOfflineData.value
  if (!data) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: {
      ...WEB3_TOOLTIP,
      trigger: 'axis',
      formatter: (params: any[]) => {
        let result = ''
        params.forEach((p: any) => {
          const value = p.seriesName === '线上份额' || p.seriesName === '线下份额'
            ? `${p.value.toFixed(1)}%`
            : p.value.toLocaleString()
          result += `${p.marker} ${p.seriesName}: ${value}<br/>`
        })
        return result
      },
    },
    legend: { data: ['线上(InDirect)', '线下(Direct)', '线上份额', '线下份额'], bottom: 0, ...WEB3_LEGEND },
    grid: { ...WEB3_GRID, bottom: '15%' },
    xAxis: { type: 'category', data: data.periods, ...WEB3_XAXIS },
    yAxis: [
      {
        ...WEB3_YAXIS,
        name: '销量（台）',
        axisLabel: { color: '#4b5563', fontSize: 12, formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
      },
      {
        type: 'value' as const,
        name: '份额（%）',
        min: 0,
        max: 100,
        axisLabel: { color: '#4b5563', fontSize: 12, formatter: (v: number) => `${v}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '线上(InDirect)',
        type: 'bar',
        stack: 'units',
        data: data.online,
        itemStyle: getGradientBarStyle(1, 'none'),
        emphasis: { focus: 'series' },
      },
      {
        name: '线下(Direct)',
        type: 'bar',
        stack: 'units',
        data: data.offline,
        itemStyle: getGradientBarStyle(0, 'none'),
        emphasis: { focus: 'series' },
      },
      {
        name: '线上份额',
        type: 'line',
        yAxisIndex: 1,
        data: data.online_share,
        smooth: 0.4,
        lineStyle: { width: 2, color: '#8b5cf6' },
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        label: { show: true, position: 'top', formatter: (p: any) => `${p.value.toFixed(1)}%`, fontSize: 10 },
      },
      {
        name: '线下份额',
        type: 'line',
        yAxisIndex: 1,
        data: data.offline_share,
        smooth: 0.4,
        lineStyle: { width: 2, color: '#ec4899' },
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        label: { show: true, position: 'bottom', formatter: (p: any) => `${p.value.toFixed(1)}%`, fontSize: 10 },
      },
    ],
  }
})

// ==================== Methods ====================
async function loadAllData() {
  const filterData = hasActiveFilters.value ? filters.value : undefined

  await Promise.all([
    loadSankeyData(filterData),
    loadStackedData(filterData),
    loadSegmentData(filterData),
    loadOnlineOfflineData(filterData),
  ])
}

async function loadSankeyData(filterData?: typeof filters.value) {
  sankeyLoading.value = true
  try {
    const res = await idcApi.getChannelSankey('units', filterData)
    if (res.success && res.data) {
      sankeyData.value = res.data
    }
  } catch (e) {
    console.error('Failed to load sankey data:', e)
  } finally {
    sankeyLoading.value = false
  }
}

async function loadStackedData(filterData?: typeof filters.value) {
  stackedLoading.value = true
  try {
    const res = await idcApi.getChannelStacked(stackedTopN.value, filterData)
    if (res.success && res.data) {
      stackedData.value = res.data
    }
  } catch (e) {
    console.error('Failed to load stacked data:', e)
  } finally {
    stackedLoading.value = false
  }
}

async function loadSegmentData(filterData?: typeof filters.value) {
  segmentLoading.value = true
  try {
    const [mc, bp, at, bac] = await Promise.all([
      idcApi.getPriceSegments('market_capacity', filterData),
      idcApi.getPriceSegments('brand_position', filterData),
      idcApi.getPriceSegments('asp_trend', filterData),
      idcApi.getPriceSegments('brand_asp_compare', filterData),
    ])
    if (mc.success && mc.data) segmentMarketCapacity.value = mc.data
    if (bp.success && bp.data) segmentBrandPosition.value = bp.data
    if (at.success && at.data) segmentAspTrend.value = at.data
    if (bac.success && bac.data) segmentBrandAspCompare.value = bac.data
  } catch (e) {
    console.error('Failed to load segment data:', e)
  } finally {
    segmentLoading.value = false
  }
}

async function loadOnlineOfflineData(filterData?: typeof filters.value) {
  onlineOfflineLoading.value = true
  try {
    const res = await idcApi.getChannelOnlineOffline(filterData)
    if (res.success && res.data) {
      onlineOfflineData.value = res.data
    }
  } catch (e) {
    console.error('Failed to load online offline data:', e)
  } finally {
    onlineOfflineLoading.value = false
  }
}

// ==================== Lifecycle ====================
onMounted(async () => {
  await idcStore.loadFilterOptions()
  await loadAllData()
})

// 监听品类切换
watch(channelCategory, (newCategory) => {
  idcStore.setProductType(newCategory)
  loadAllData()
})
</script>

<style scoped>
.idc-channel {
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

.section-title {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-title h2 {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
}

.section-tabs {
  display: flex;
  gap: 8px;
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
</style>
