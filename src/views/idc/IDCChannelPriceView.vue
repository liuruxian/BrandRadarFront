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

      <!-- 线上/线下趋势 -->
      <ChartCard
        title="线上/线下渠道趋势"
        tooltip="展示线上和线下渠道的市场份额变化"
        :loading="onlineOfflineLoading"
        class="chart-medium"
      >
        <BaseChart :option="onlineOfflineOption" style="height: 350px" />
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
import { idcMockApi as idcApi } from '@/api/idcMockApi'
import type {
  ChannelSankeyData,
  OnlineOfflineData,
  ChannelStackedData,
  PriceSegmentData,
} from '@/api/idcApiTypes'
import ChartCard from '@/components/idc/ChartCard.vue'
import BaseChart from '@/components/idc/BaseChart.vue'
import IDCFiltersDrawer from '@/components/idc/IDCFiltersDrawer.vue'

const idcStore = useIDCStore()
const { filters, hasActiveFilters } = storeToRefs(idcStore)

// ==================== State ====================
const showFilterDrawer = ref(false)
const sankeyLoading = ref(false)
const onlineOfflineLoading = ref(false)
const stackedLoading = ref(false)
const segmentLoading = ref(false)
const stackedTopN = ref(10)

// 品类筛选
const channelCategory = ref<'all' | 'laser' | 'inkjet'>('all')

// Data
const sankeyData = ref<ChannelSankeyData | null>(null)
const onlineOfflineData = ref<OnlineOfflineData | null>(null)
const stackedData = ref<ChannelStackedData | null>(null)
const segmentMarketCapacity = ref<PriceSegmentData | null>(null)
const segmentBrandPosition = ref<PriceSegmentData | null>(null)
const segmentAspTrend = ref<PriceSegmentData | null>(null)
const segmentBrandAspCompare = ref<PriceSegmentData | null>(null)

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
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
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
        data: data.nodes.map((n) => ({
          name: n.name,
          itemStyle: {
            color: n.category === 'channel'
              ? '#3B82F6'
              : n.category === 'channel_group'
              ? '#10B981'
              : '#F59E0B',
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

const onlineOfflineOption = computed(() => {
  const data = onlineOfflineData.value
  if (!data) return {}

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['线上', '线下', '线上占比', '线下占比'], bottom: 0, textStyle: { color: '#6b7280' } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: data.periods, axisLabel: { color: '#6b7280' } },
    yAxis: [
      { type: 'value', name: '销量', axisLabel: { color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      { type: 'value', name: '占比', axisLabel: { color: '#6b7280', formatter: (v: number) => `${(v * 100).toFixed(0)}%` }, splitLine: { show: false }, max: 1 },
    ],
    series: [
      { name: '线上', type: 'bar', stack: 'total', data: data.online, itemStyle: { color: '#3B82F6' } },
      { name: '线下', type: 'bar', stack: 'total', data: data.offline, itemStyle: { color: '#10B981' } },
      { name: '线上占比', type: 'line', yAxisIndex: 1, data: data.online_share, smooth: true, showSymbol: false, itemStyle: { color: '#06B6D4' } },
    ],
  }
})

const stackedOption = computed(() => {
  const data = stackedData.value
  if (!data) return {}

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#A855F7', '#22D3EE', '#FB7185', '#4ADE80']

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: data.brands.slice(0, 10), bottom: 0, textStyle: { color: '#6b7280' } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: data.channel_groups, axisLabel: { color: '#6b7280', rotate: 30 } },
    yAxis: { type: 'value', axisLabel: { color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: data.brands.slice(0, stackedTopN.value).map((brand, idx) => ({
      name: brand,
      type: 'bar',
      stack: 'total',
      data: data.series[idx]?.data || [],
      itemStyle: { color: colors[idx % colors.length] },
      emphasis: { focus: 'series' },
    })),
  }
})

const marketCapacityOption = computed(() => {
  const data = segmentMarketCapacity.value
  if (!data || data.type !== 'market_capacity') return {}

  const colors = ['#10B981', '#3B82F6', '#EF4444']

  return {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#6b7280' } },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        itemStyle: { borderRadius: 8, borderColor: '#1B1D22', borderWidth: 2 },
        label: { show: true, formatter: '{b}: {d}%', color: '#374151' },
        data: data.segments.map((seg, idx) => ({
          name: `${seg.name} (${seg.range})`,
          value: seg.units,
          itemStyle: { color: colors[idx % colors.length] },
        })),
      },
    ],
  }
})

const brandPositionOption = computed(() => {
  const data = segmentBrandPosition.value
  if (!data || data.type !== 'brand_position') return {}

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: data.brands.slice(0, 5), bottom: 0, textStyle: { color: '#6b7280' } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#6b7280', formatter: (v: number) => `${(v * 100).toFixed(0)}%` }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: ['入门 (<$200)', '中端 ($200-1000)', '高端 (>$1000)'], axisLabel: { color: '#6b7280' } },
    series: data.brands.slice(0, 5).map((brand, idx) => ({
      name: brand,
      type: 'bar',
      stack: 'total',
      data: data.series[idx]?.data?.map((v: number) => v / 100) || [],
      itemStyle: { color: colors[idx % colors.length] },
    })),
  }
})

const aspTrendOption = computed(() => {
  const data = segmentAspTrend.value
  if (!data || data.type !== 'asp_trend') return {}

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: data.series.map((s) => s.name), bottom: 0, textStyle: { color: '#6b7280' } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: data.periods, axisLabel: { color: '#6b7280' } },
    yAxis: { type: 'value', axisLabel: { color: '#6b7280', formatter: (v: number) => `$${v.toFixed(0)}` }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: data.series.map((s, idx) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      showSymbol: false,
      itemStyle: { color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][idx % 4] },
    })),
  }
})

const brandASPCompareOption = computed(() => {
  const data = segmentBrandAspCompare.value
  if (!data || data.type !== 'brand_asp_compare') return {}

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6']

  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: data.brands, axisLabel: { color: '#6b7280', rotate: 30 } },
    yAxis: { type: 'value', axisLabel: { color: '#6b7280', formatter: (v: number) => `$${v.toFixed(0)}` }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: [
      {
        type: 'bar',
        data: data.asp.map((v, idx) => ({
          value: v,
          itemStyle: { color: colors[idx % colors.length] },
        })),
        barWidth: 30,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  }
})

// ==================== Methods ====================
async function loadAllData() {
  const filterData = hasActiveFilters.value ? filters.value : undefined

  await Promise.all([
    loadSankeyData(filterData),
    loadOnlineOfflineData(filterData),
    loadStackedData(filterData),
    loadSegmentData(filterData),
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

async function loadOnlineOfflineData(filterData?: typeof filters.value) {
  onlineOfflineLoading.value = true
  try {
    const res = await idcApi.getOnlineOfflineTrend(filterData)
    if (res.success && res.data) {
      onlineOfflineData.value = res.data
    }
  } catch (e) {
    console.error('Failed to load online/offline data:', e)
  } finally {
    onlineOfflineLoading.value = false
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
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
  overflow: hidden;
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
