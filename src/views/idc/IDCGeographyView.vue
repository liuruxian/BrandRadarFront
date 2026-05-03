<template>
  <div class="page-container idc-geography">
    <!-- 热力图视图 -->
    <div class="geo-layout">
      <!-- 左侧：地图 -->
      <div class="geo-layout-left">
        <div class="geo-panel">
          <div class="geo-panel-header">
            <span class="geo-panel-title">全球市场分布</span>
            <div class="geo-metric-tabs">
              <button
                v-for="opt in GEO_METRIC_OPTIONS"
                :key="opt.value"
                class="geo-metric-btn"
                :class="{ active: geoMetric === opt.value }"
                @click="geoMetric = opt.value"
              >{{ opt.label }}</button>
            </div>
          </div>
          <div class="geo-map-wrapper">
            <div v-if="heatmapLoading" class="geo-empty">
              <div class="loading-spinner"><div class="spinner-ring" /></div>
              <p>正在加载地理数据...</p>
            </div>
            <WorldMapChart v-else :heatmap="heatmapData.heatmap" :metric="geoMetric" />
          </div>
        </div>
      </div>

      <!-- 右侧：排名 -->
      <div class="geo-layout-right">
        <div class="geo-panel">
          <div class="geo-panel-header">
            <span class="geo-panel-title">TOP 10 国家</span>
          </div>
          <div class="geo-bar-wrapper">
            <div v-if="countryLoading" class="geo-empty">
              <div class="loading-spinner"><div class="spinner-ring" /></div>
            </div>
            <BaseChart v-else :option="barChartOption" />
          </div>
        </div>
        <div class="geo-panel">
          <div class="geo-panel-header">
            <span class="geo-panel-title">完整排名</span>
            <n-input
              v-model:value="countrySearch"
              placeholder="搜索国家..."
              clearable
              size="small"
              style="width: 160px"
            />
          </div>
          <div class="geo-table-wrapper">
            <n-data-table
              :columns="countryColumns"
              :data="filteredCountryData"
              :loading="countryLoading"
              :pagination="{ pageSize: 10 }"
              :bordered="false"
              size="small"
              row-key="code"
              :row-class-name="() => 'clickable-row'"
              @row-click="handleCountryClick"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 国家详情抽屉 -->
    <n-drawer
      v-model:show="showCountryDrawer"
      :width="600"
      placement="right"
    >
      <n-drawer-content :title="countryDetail?.country_name || '国家详情'" closable>
        <template v-if="countryDetail">
          <div v-if="countryCategoryData" class="category-share-section">
            <h4>品类结构</h4>
            <div class="category-share-bar">
              <div
                class="laser-bar"
                :style="{ width: countryCategoryData.laser_share + '%' }"
              >
                <span>激光 {{ countryCategoryData.laser_share.toFixed(1) }}%</span>
              </div>
              <div
                class="inkjet-bar"
                :style="{ width: countryCategoryData.inkjet_share + '%' }"
              >
                <span>喷墨 {{ countryCategoryData.inkjet_share.toFixed(1) }}%</span>
              </div>
            </div>
            <div class="category-kpi-row">
              <div class="category-kpi laser">
                <span class="label">激光销量</span>
                <span class="value">{{ formatNumber(countryCategoryData.laser_units) }}</span>
              </div>
              <div class="category-kpi inkjet">
                <span class="label">喷墨销量</span>
                <span class="value">{{ formatNumber(countryCategoryData.inkjet_units) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-kpi-grid">
            <KPICard label="销量" :value="countryDetail.kpi.units" color="primary" compact />
            <KPICard label="销售额" :value="countryDetail.kpi.value" suffix="USD M" color="info" format="currency" compact />
            <KPICard label="ASP" :value="countryDetail.kpi.asp" suffix="USD" color="success" format="currency" compact />
            <KPICard label="活跃型号" :value="countryDetail.kpi.active_models" color="warning" compact />
          </div>

          <div class="detail-section">
            <h4>市场趋势</h4>
            <BaseChart :option="countryTrendOption" style="height: 250px" />
          </div>

          <div class="detail-section">
            <h4>Top 10 型号</h4>
            <n-data-table
              :columns="topModelColumns"
              :data="countryDetail.top_models"
              :bordered="false"
              size="small"
            />
          </div>

          <div class="detail-section">
            <h4>品牌结构</h4>
            <BaseChart :option="countryBrandOption" style="height: 250px" />
          </div>

          <div class="detail-section">
            <h4>国家规格对比</h4>
            <CountryCompareMatrix
              :countries="compareCountries"
              :available-countries="availableForCompare"
              v-model:selected-countries="compareSelectedCodes"
            />
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import {
  NButton,
  NButtonGroup,
  NSelect,
  NInput,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NTag,
  NEmpty,
} from 'naive-ui'
import { useSafeMessage } from '@/composables/useSafeMessage'
import type { DataTableColumn } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useIDCStore } from '@/stores/idcStore'
import { idcApi } from '@/api/idcApi'
import type {
  GeoHeatmapItem,
  CountryDetailData,
} from '@/api/idcApiTypes'
import KPICard from '@/components/idc/KPICard.vue'
import BaseChart from '@/components/idc/BaseChart.vue'
import WorldMapChart from '@/components/idc/WorldMapChart.vue'
import IDCFiltersDrawer from '@/components/idc/IDCFiltersDrawer.vue'
import CountryCompareMatrix from '@/components/idc/CountryCompareMatrix.vue'

const message = useSafeMessage()
const idcStore = useIDCStore()
const { filters, hasActiveFilters, filterOptions } = storeToRefs(idcStore)

// ==================== State ====================
const heatmapMetric = ref<'units' | 'value' | 'asp'>('units')
const heatmapView = ref<'map' | 'bar'>('map')
const heatmapData = ref<{ heatmap: GeoHeatmapItem[] }>({ heatmap: [] })
const heatmapLoading = ref(false)
const showFilterDrawer = ref(false)
const showCountryDrawer = ref(false)

// Country table
const countrySearch = ref('')
const countryLoading = ref(false)

// Country detail
const selectedCountry = ref<GeoHeatmapItem | null>(null)
const countryDetail = ref<CountryDetailData | null>(null)
const countryDetailLoading = ref(false)

// 品类数据（用于国家详情）
interface CountryCategoryData {
  laser_units: number
  laser_value: number
  laser_asp: number
  laser_share: number
  inkjet_units: number
  inkjet_value: number
  inkjet_asp: number
  inkjet_share: number
}
const countryCategoryData = ref<CountryCategoryData | null>(null)

// 国家对比矩阵状态
interface CompareCountryItem {
  code: string
  name: string
  kpi: { units: number; value: number; asp: number; active_models: number }
  spec_data?: Record<string, any>
  trend?: { periods: string[]; units: number[]; value: number[] }
}
const compareCountries = ref<CompareCountryItem[]>([])
const compareSelectedCodes = ref<string[]>([])

// 可用于对比的国家列表
const availableForCompare = computed(() =>
  heatmapData.value.heatmap.map(c => ({
    code: c.code,
    name: c.name,
    units: c.units,
    value: c.value,
    asp: c.asp,
  }))
)

// ==================== Computed ====================
interface CountryRow {
  code: string
  name: string
  units: number
  value: number
  asp: number
  share: number
}

const countryColumns: DataTableColumn<CountryRow>[] = [
  { title: '国家', key: 'name', width: 150 },
  {
    title: '销量',
    key: 'units',
    align: 'right',
    render: (row) => formatNumber(row.units),
  },
  {
    title: '销售额',
    key: 'value',
    align: 'right',
    render: (row) => `$${row.value.toFixed(2)}M`,
  },
  {
    title: 'ASP',
    key: 'asp',
    align: 'right',
    render: (row) => `$${row.asp.toFixed(0)}`,
  },
]

const topModelColumns: DataTableColumn<{ brand: string; model_name: string; units: number; value: number }>[] = [
  { title: '品牌', key: 'brand', width: 100 },
  { title: '型号', key: 'model_name', ellipsis: true },
  { title: '销量', key: 'units', align: 'right', render: (r) => formatNumber(r.units) },
  { title: '销售额', key: 'value', align: 'right', render: (r) => `$${r.value.toFixed(2)}M` },
]

const filteredCountryData = computed(() => {
  if (!countrySearch.value) return heatmapData.value.heatmap
  const search = countrySearch.value.toLowerCase()
  return heatmapData.value.heatmap.filter((d) =>
    d.name.toLowerCase().includes(search)
  )
})

// ==================== Charts ====================
const barChartOption = computed(() => {
  const data = [...heatmapData.value.heatmap]
    .sort((a, b) => b[heatmapMetric.value] - a[heatmapMetric.value])
    .slice(0, 10)

  const metricLabel = heatmapMetric.value === 'units' ? '销量' : heatmapMetric.value === 'value' ? '销售额' : 'ASP'
  const maxValue = data.length > 0 ? data[0][heatmapMetric.value] : 100

  return {
    backgroundColor: 'transparent',
    height: 160,
    grid: { top: 4, bottom: 4, left: 4, right: 80 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
      shadowColor: 'rgba(0, 74, 198, 0.06)',
      shadowBlur: 10,
      formatter: (params: any) => {
        const item = params[0]
        return `<strong>${item.name}</strong><br/>${metricLabel}: <span style="color:#004ac6;font-weight:bold">${formatNumber(item.value)}</span>`
      },
    },
    grid: {
      left: '3%',
      right: '10%',
      top: '3%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#4b5563',
        formatter: (val: number) => formatNumber(val),
      },
      splitLine: {
        lineStyle: { color: '#f3f4f6', type: 'dashed' },
      },
    },
    yAxis: {
      type: 'category',
      data: data.map((d) => d.name).reverse(),
      axisLabel: {
        color: '#4b5563',
        fontSize: 12,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: data.map((d, idx) => ({
          value: d[heatmapMetric.value],
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#004ac6' },
                { offset: 1, color: '#2563eb' },
              ],
            },
            shadowColor: 'rgba(0, 74, 198, 0.15)',
            shadowBlur: 6,
          },
        })).reverse(),
        barWidth: 20,
        label: {
          show: true,
          position: 'right',
          color: '#4b5563',
          fontSize: 11,
          fontWeight: 600,
          formatter: (params: any) => formatNumber(params.value),
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(0, 74, 198, 0.25)',
          },
        },
      },
    ],
  }
})

const countryTrendOption = computed(() => {
  const trend = countryDetail.value?.trend
  if (!trend) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
      shadowColor: 'rgba(37, 99, 235, 0.08)',
      shadowBlur: 10,
      axisPointer: { type: 'cross', lineStyle: { color: '#e7e5e4', type: 'dashed' } },
    },
    legend: { data: ['销量', '销售额'], bottom: 0, textStyle: { color: '#4b5563', fontSize: 12 } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trend.periods,
      axisLine: { lineStyle: { color: '#e7e5e4' } },
      axisLabel: { color: '#4b5563', fontSize: 12 },
      splitLine: { show: false },
    },
    yAxis: [
      { type: 'value', name: '销量', axisLine: { show: false }, axisLabel: { color: '#4b5563' }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } },
      { type: 'value', name: '销售额', axisLine: { show: false }, axisLabel: { color: '#4b5563' }, splitLine: { show: false } },
    ],
    series: [
      { name: '销量', type: 'line', data: trend.units, smooth: 0.4, lineStyle: { width: 3, color: '#004ac6' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0, 74, 198, 0.15)' }, { offset: 1, color: 'rgba(0, 74, 198, 0)' }] } }, showSymbol: false, emphasis: { showSymbol: true, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#fff', borderColor: '#004ac6', borderWidth: 2, shadowColor: '#004ac6', shadowBlur: 8 } } },
      { name: '销售额', type: 'line', yAxisIndex: 1, data: trend.value, smooth: 0.4, lineStyle: { width: 3, color: '#2563eb' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(37, 99, 235, 0.15)' }, { offset: 1, color: 'rgba(37, 99, 235, 0)' }] } }, showSymbol: false, emphasis: { showSymbol: true, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#fff', borderColor: '#2563eb', borderWidth: 2, shadowColor: '#2563eb', shadowBlur: 8 } } },
    ],
  }
})

const countryBrandOption = computed(() => {
  const brands = countryDetail.value?.brand_structure
  if (!brands) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
      shadowColor: 'rgba(0, 74, 198, 0.06)',
      shadowBlur: 8,
    },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#4b5563', fontSize: 12 } },
    series: [
      {
        type: 'pie',
        radius: ['65%', '85%'],
        center: ['35%', '50%'],
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
        label: { show: false },
        emphasis: { scale: true, scaleSize: 8, label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#1c1917' }, itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 74, 198, 0.2)' } },
        data: brands.map((b, idx) => ({
          name: b.brand,
          value: b.units,
          itemStyle: { color: WEB3_COLORS[idx % WEB3_COLORS.length] },
        })),
      },
    ],
  }
})

// ==================== 地图视图配置 ====================
const geoMetric = ref<'units' | 'value' | 'asp'>('units')
const GEO_METRIC_OPTIONS = [
  { label: '销量', value: 'units' as const },
  { label: '销售额', value: 'value' as const },
  { label: '平均单价', value: 'asp' as const },
]

// ==================== Methods ====================
function formatNumber(val: number): string {
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
  return val.toLocaleString()
}

// ==================== 模拟数据 ====================
const MOCK_GEO_DATA: GeoHeatmapItem[] = [
  { rank: 1, code: 'USA', name: 'United States', units: 15234567, value: 4234.56, asp: 278, share: 18.5 },
  { rank: 2, code: 'CHN', name: 'China', units: 12893456, value: 3891.23, asp: 302, share: 15.7 },
  { rank: 3, code: 'DEU', name: 'Germany', units: 4523789, value: 1234.56, asp: 273, share: 5.5 },
  { rank: 4, code: 'GBR', name: 'United Kingdom', units: 3890123, value: 987.45, asp: 254, share: 4.7 },
  { rank: 5, code: 'JPN', name: 'Japan', units: 3567890, value: 1123.45, asp: 315, share: 4.3 },
  { rank: 6, code: 'FRA', name: 'France', units: 2987654, value: 756.78, asp: 253, share: 3.6 },
  { rank: 7, code: 'BRA', name: 'Brazil', units: 2678901, value: 567.89, asp: 212, share: 3.3 },
  { rank: 8, code: 'IND', name: 'India', units: 2345678, value: 456.78, asp: 195, share: 2.9 },
  { rank: 9, code: 'CAN', name: 'Canada', units: 1987654, value: 534.12, asp: 269, share: 2.4 },
  { rank: 10, code: 'AUS', name: 'Australia', units: 1765432, value: 489.34, asp: 277, share: 2.1 },
  { rank: 11, code: 'KOR', name: 'South Korea', units: 1654321, value: 423.56, asp: 256, share: 2.0 },
  { rank: 12, code: 'ITA', name: 'Italy', units: 1543210, value: 398.76, asp: 258, share: 1.9 },
  { rank: 13, code: 'MEX', name: 'Mexico', units: 1432109, value: 312.45, asp: 218, share: 1.7 },
  { rank: 14, code: 'RUS', name: 'Russia', units: 1321098, value: 345.67, asp: 262, share: 1.6 },
  { rank: 15, code: 'ESP', name: 'Spain', units: 1209876, value: 289.45, asp: 239, share: 1.5 },
  { rank: 16, code: 'NLD', name: 'Netherlands', units: 1098765, value: 278.34, asp: 253, share: 1.3 },
  { rank: 17, code: 'POL', name: 'Poland', units: 987654, value: 234.56, asp: 238, share: 1.2 },
  { rank: 18, code: 'TUR', name: 'Turkey', units: 876543, value: 198.76, asp: 227, share: 1.1 },
  { rank: 19, code: 'IDN', name: 'Indonesia', units: 765432, value: 178.45, asp: 233, share: 0.9 },
  { rank: 20, code: 'SWE', name: 'Sweden', units: 654321, value: 167.89, asp: 257, share: 0.8 },
  { rank: 21, code: 'BEL', name: 'Belgium', units: 543210, value: 145.67, asp: 268, share: 0.7 },
  { rank: 22, code: 'SGP', name: 'Singapore', units: 432109, value: 134.56, asp: 311, share: 0.5 },
  { rank: 23, code: 'CHE', name: 'Switzerland', units: 321098, value: 123.45, asp: 384, share: 0.4 },
  { rank: 24, code: 'AUT', name: 'Austria', units: 210987, value: 98.76, asp: 468, share: 0.3 },
  { rank: 25, code: 'THA', name: 'Thailand', units: 198765, value: 67.89, asp: 341, share: 0.25 },
  { rank: 26, code: 'SAU', name: 'Saudi Arabia', units: 187654, value: 89.34, asp: 476, share: 0.23 },
  { rank: 27, code: 'ARG', name: 'Argentina', units: 176543, value: 56.78, asp: 322, share: 0.21 },
  { rank: 28, code: 'NOR', name: 'Norway', units: 165432, value: 87.65, asp: 530, share: 0.20 },
  { rank: 29, code: 'ARE', name: 'UAE', units: 154321, value: 78.90, asp: 511, share: 0.19 },
  { rank: 30, code: 'ZAF', name: 'South Africa', units: 143210, value: 45.67, asp: 319, share: 0.17 },
  { rank: 31, code: 'MYS', name: 'Malaysia', units: 132109, value: 56.34, asp: 427, share: 0.16 },
  { rank: 32, code: 'DNK', name: 'Denmark', units: 121098, value: 67.89, asp: 561, share: 0.15 },
  { rank: 33, code: 'COL', name: 'Colombia', units: 110987, value: 34.56, asp: 311, share: 0.13 },
  { rank: 34, code: 'PHL', name: 'Philippines', units: 100876, value: 32.45, asp: 322, share: 0.12 },
  { rank: 35, code: 'VNM', name: 'Vietnam', units: 98765, value: 31.23, asp: 316, share: 0.12 },
  { rank: 36, code: 'FIN', name: 'Finland', units: 87654, value: 45.67, asp: 521, share: 0.11 },
  { rank: 37, code: 'IRL', name: 'Ireland', units: 76543, value: 34.56, asp: 452, share: 0.09 },
  { rank: 38, code: 'CZE', name: 'Czech Republic', units: 65432, value: 23.45, asp: 359, share: 0.08 },
  { rank: 39, code: 'PRT', name: 'Portugal', units: 54321, value: 21.34, asp: 393, share: 0.07 },
  { rank: 40, code: 'EGY', name: 'Egypt', units: 43210, value: 18.76, asp: 434, share: 0.05 },
  { rank: 41, code: 'NZL', name: 'New Zealand', units: 43210, value: 23.45, asp: 543, share: 0.05 },
  { rank: 42, code: 'IRN', name: 'Iran', units: 32109, value: 15.67, asp: 488, share: 0.04 },
  { rank: 43, code: 'ISR', name: 'Israel', units: 32109, value: 19.87, asp: 619, share: 0.04 },
  { rank: 44, code: 'GRC', name: 'Greece', units: 21098, value: 12.34, asp: 585, share: 0.03 },
  { rank: 45, code: 'PAK', name: 'Pakistan', units: 21098, value: 8.76, asp: 415, share: 0.03 },
  { rank: 46, code: 'CHL', name: 'Chile', units: 21098, value: 11.23, asp: 533, share: 0.03 },
  { rank: 47, code: 'NGA', name: 'Nigeria', units: 18765, value: 9.45, asp: 503, share: 0.02 },
  { rank: 48, code: 'KAZ', name: 'Kazakhstan', units: 16543, value: 8.90, asp: 538, share: 0.02 },
  { rank: 49, code: 'PER', name: 'Peru', units: 15432, value: 7.89, asp: 511, share: 0.02 },
  { rank: 50, code: 'UKR', name: 'Ukraine', units: 14321, value: 6.78, asp: 474, share: 0.02 },
  { rank: 51, code: 'ROU', name: 'Romania', units: 13210, value: 7.65, asp: 579, share: 0.02 },
  { rank: 52, code: 'HUN', name: 'Hungary', units: 12109, value: 6.54, asp: 540, share: 0.01 },
  { rank: 53, code: 'BGD', name: 'Bangladesh', units: 10987, value: 5.43, asp: 494, share: 0.01 },
  { rank: 54, code: 'ECU', name: 'Ecuador', units: 9876, value: 4.56, asp: 462, share: 0.01 },
  { rank: 55, code: 'SVN', name: 'Slovenia', units: 8765, value: 5.67, asp: 647, share: 0.01 },
  { rank: 56, code: 'SVK', name: 'Slovakia', units: 7654, value: 4.89, asp: 639, share: 0.01 },
  { rank: 57, code: 'HRV', name: 'Croatia', units: 6543, value: 4.12, asp: 630, share: 0.01 },
  { rank: 58, code: 'KEN', name: 'Kenya', units: 5432, value: 3.45, asp: 635, share: 0.01 },
  { rank: 59, code: 'MAR', name: 'Morocco', units: 5432, value: 3.21, asp: 591, share: 0.01 },
  { rank: 60, code: 'QAT', name: 'Qatar', units: 4321, value: 4.56, asp: 1056, share: 0.01 },
]

async function loadHeatmapData() {
  heatmapLoading.value = true
  countryLoading.value = true

  try {
    const res = await idcApi.getGeoData({
      metric: heatmapMetric.value,
      top_n: 50,
      ...(hasActiveFilters.value ? filters.value : {}),
    })
    if (res.success && res.data?.heatmap?.length) {
      heatmapData.value = { heatmap: res.data.heatmap }
    } else {
      // 使用模拟数据
      heatmapData.value = { heatmap: MOCK_GEO_DATA }
    }
  } catch (e) {
    // API 失败时使用模拟数据
    heatmapData.value = { heatmap: MOCK_GEO_DATA }
  } finally {
    heatmapLoading.value = false
    countryLoading.value = false
  }
}

async function handleCountryClick(row: CountryRow) {
  selectedCountry.value = heatmapData.value.heatmap.find((d) => d.code === row.code) || null
  showCountryDrawer.value = true

  countryDetailLoading.value = true
  try {
    const res = await idcApi.getCountryDetail(
      row.code,
      hasActiveFilters.value ? filters.value : undefined
    )
    if (res.success && res.data) {
      countryDetail.value = res.data
      countryCategoryData.value = generateCategoryData(res.data.kpi.units)
    } else {
      countryDetail.value = generateMockCountryDetail(row)
    }
  } catch (e) {
    countryDetail.value = generateMockCountryDetail(row)
  } finally {
    countryDetailLoading.value = false
  }

  // 初始化对比矩阵：加入当前国家，并补充其他国家的模拟数据
  const currentCompare: CompareCountryItem = {
    code: row.code,
    name: row.name,
    kpi: {
      units: row.units,
      value: row.value,
      asp: row.asp,
      active_models: Math.floor(row.units / 500000) + 10,
    },
    spec_data: generateMockSpecData(row.code),
    trend: {
      periods: ['2023H1', '2023H2', '2024H1', '2024H2'],
      units: [
        Math.round(row.units * (0.4 + Math.random() * 0.1)),
        Math.round(row.units * (0.45 + Math.random() * 0.1)),
        Math.round(row.units * (0.48 + Math.random() * 0.1)),
        row.units,
      ],
      value: [
        row.value * (0.4 + Math.random() * 0.1),
        row.value * (0.45 + Math.random() * 0.1),
        row.value * (0.48 + Math.random() * 0.1),
        row.value,
      ],
    },
  }

  // 再加 2 个随机国家用于对比展示（从 heatmap 中取）
  const otherCountries = heatmapData.value.heatmap
    .filter(d => d.code !== row.code)
    .slice(0, 2)
    .map(other => ({
      code: other.code,
      name: other.name,
      kpi: {
        units: other.units,
        value: other.value,
        asp: other.asp,
        active_models: Math.floor(other.units / 500000) + 10,
      },
      spec_data: generateMockSpecData(other.code),
      trend: {
        periods: ['2023H1', '2023H2', '2024H1', '2024H2'],
        units: [
          Math.round(other.units * (0.4 + Math.random() * 0.1)),
          Math.round(other.units * (0.45 + Math.random() * 0.1)),
          Math.round(other.units * (0.48 + Math.random() * 0.1)),
          other.units,
        ],
        value: [
          other.value * (0.4 + Math.random() * 0.1),
          other.value * (0.45 + Math.random() * 0.1),
          other.value * (0.48 + Math.random() * 0.1),
          other.value,
        ],
      },
    }))

  compareCountries.value = [currentCompare, ...otherCountries]
  compareSelectedCodes.value = [row.code]
}

/** 生成模拟国家详情 */
function generateMockCountryDetail(row: CountryRow): CountryDetailData {
  const laserShare = 0.58 + Math.random() * 0.1
  const laserUnits = Math.round(row.units * laserShare)
  const inkjetUnits = row.units - laserUnits
  return {
    country_name: row.name,
    country_code: row.code,
    kpi: {
      units: row.units,
      value: row.value,
      asp: row.asp,
      active_models: Math.floor(row.units / 500000) + 10,
    },
    trend: {
      periods: ['2023H1', '2023H2', '2024H1', '2024H2'],
      units: [
        Math.round(row.units * (0.4 + Math.random() * 0.1)),
        Math.round(row.units * (0.45 + Math.random() * 0.1)),
        Math.round(row.units * (0.48 + Math.random() * 0.1)),
        row.units,
      ],
      value: [
        row.value * (0.4 + Math.random() * 0.1),
        row.value * (0.45 + Math.random() * 0.1),
        row.value * (0.48 + Math.random() * 0.1),
        row.value,
      ],
    },
    brand_structure: [
      { brand: 'HP', units: Math.round(row.units * 0.28), share: 0.28 },
      { brand: 'Canon', units: Math.round(row.units * 0.22), share: 0.22 },
      { brand: 'Epson', units: Math.round(row.units * 0.18), share: 0.18 },
      { brand: 'Brother', units: Math.round(row.units * 0.12), share: 0.12 },
      { brand: 'Samsung', units: Math.round(row.units * 0.08), share: 0.08 },
      { brand: 'Xerox', units: Math.round(row.units * 0.05), share: 0.05 },
      { brand: 'Other', units: Math.round(row.units * 0.07), share: 0.07 },
    ],
    top_models: [],
  }
}

/**
 * 生成模拟规格数据
 */
function generateMockSpecData(countryCode: string) {
  const seed = countryCode.charCodeAt(0) + countryCode.charCodeAt(countryCode.length - 1)
  const rand = (min: number, max: number) => min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min)
  return {
    a4_color_speed: Math.round(rand(15, 45)),
    a4_mono_speed: Math.round(rand(25, 60)),
    iso_color_speed: Math.round(rand(10, 30)),
    iso_mono_speed: Math.round(rand(20, 50)),
    function: 'MFP',
    adf: 'Yes',
    duplex: 'Yes',
    wireless: 'Yes',
    network: 'Yes',
    ink_tank: rand(0, 1) > 0.5 ? 'Ink Tank' : 'Cartridge',
    black_toner_max: Math.round(rand(3000, 15000)),
    color_toner_max: Math.round(rand(2000, 10000)),
    duty_cycle: Math.round(rand(20000, 100000)),
    weight: parseFloat(rand(7, 25).toFixed(1)),
    production_class: rand(0, 1) > 0.7 ? 'Production' : rand(0, 1) > 0.5 ? 'Mid-range' : 'Entry',
    business_inkjet: rand(0, 1) > 0.6 ? '03: High-end' : rand(0, 1) > 0.3 ? '02: Mid-range' : '01: Entry',
    a4_a3_ratio: `${Math.round(rand(75, 92))}|||${Math.round(rand(8, 25))}`,
    color_mono_mix: Math.round(rand(40, 70)),
  }
}

/**
 * 生成模拟品类数据（用于展示）
 */
function generateCategoryData(totalUnits: number) {
  const laserShare = 0.58 + Math.random() * 0.1 // 58%-68%
  const laserUnits = Math.round(totalUnits * laserShare)
  const inkjetUnits = totalUnits - laserUnits
  const laserValue = laserUnits * (250 + Math.random() * 100) / 1000000
  const inkjetValue = inkjetUnits * (150 + Math.random() * 80) / 1000000

  return {
    laser_units: laserUnits,
    laser_value: laserValue,
    laser_asp: Math.round(laserValue / laserUnits * 1000000),
    laser_share: laserShare * 100,
    inkjet_units: inkjetUnits,
    inkjet_value: inkjetValue,
    inkjet_asp: Math.round(inkjetValue / inkjetUnits * 1000000),
    inkjet_share: (1 - laserShare) * 100,
  }
}

// ==================== Compare Methods ====================

// ==================== Lifecycle ====================
onMounted(async () => {
  await idcStore.loadFilterOptions()
  await loadHeatmapData()
})

watch(heatmapMetric, () => {
  geoMetric.value = heatmapMetric.value
  loadHeatmapData()
})

</script>

<style scoped>
.idc-geography {
  /* layout handled by .page-container */
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dt-space-3) 0;
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
  font-size: var(--dt-text-sm);
  color: rgba(255, 255, 255, 0.85);
  margin: var(--dt-space-1) 0 0;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
}

.page-actions :deep(.n-button) {
  height: var(--dt-btn-height-sm);
  padding: 0 var(--dt-space-3);
  border-radius: var(--dt-radius-xs);
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-weight-semibold);
  border: 1px solid var(--dt-color-border);
  background: var(--dt-btn-ghost-bg);
  color: var(--dt-btn-ghost-text);
  transition: all var(--dt-duration-fast) var(--dt-ease-smooth);
}
.page-actions :deep(.n-button:hover) {
  background: var(--dt-btn-ghost-bg-hover);
  color: var(--dt-btn-ghost-text-hover);
  border-color: var(--dt-color-primary);
}
.page-actions :deep(.n-button-group .n-button) {
  height: var(--dt-btn-height-sm);
  padding: 0 var(--dt-space-3);
  border-radius: var(--dt-radius-xs);
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-weight-semibold);
  border: 1px solid var(--dt-color-border);
  background: var(--dt-btn-ghost-bg);
  color: var(--dt-btn-ghost-text);
  transition: all var(--dt-duration-fast) var(--dt-ease-smooth);
}
.page-actions :deep(.n-button-group .n-button:hover) {
  background: var(--dt-btn-ghost-bg-hover);
  color: var(--dt-btn-ghost-text-hover);
  border-color: var(--dt-color-primary);
}
.page-actions :deep(.n-button-group .n-button--button-type-primary) {
  background: var(--dt-btn-primary-bg) !important;
  border-color: var(--dt-btn-primary-border) !important;
  color: var(--dt-btn-primary-text) !important;
  box-shadow: var(--dt-btn-primary-shadow);
}
.page-actions :deep(.n-button-group .n-button--button-type-primary:hover) {
  background: var(--dt-btn-primary-bg-hover) !important;
  border-color: var(--dt-btn-primary-border-hover) !important;
}
.page-actions :deep(.n-button--button-type-primary) {
  background: var(--dt-btn-primary-bg) !important;
  border-color: var(--dt-btn-primary-border) !important;
  color: var(--dt-btn-primary-text) !important;
  box-shadow: var(--dt-btn-primary-shadow);
}
.page-actions :deep(.n-button--button-type-primary:hover) {
  background: var(--dt-btn-primary-bg-hover) !important;
  border-color: var(--dt-btn-primary-border-hover) !important;
}

/* ==================== 地理布局 ==================== */
.geo-layout {
  display: flex;
  gap: var(--dt-space-4);
  height: calc(100vh - 160px);
  min-height: 400px;
}

.geo-layout-left {
  flex: 0 0 58%;
  min-width: 0;
}

.geo-layout-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.geo-panel {
  background: var(--dt-color-bg-surface);
  border: 1px solid var(--dt-color-border);
  border-radius: 4px;
  box-shadow: var(--dt-shadow-sm);
  display: flex;
  flex-direction: column;
  padding: 0;
}

.geo-layout-left .geo-panel {
  flex: 1;
}

.geo-layout-right .geo-panel:first-child {
  flex: 0 0 200px;
}

.geo-layout-right .geo-panel:last-child {
  flex: 1;
  overflow: hidden;
}

.geo-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--dt-space-3);
  flex-shrink: 0;
  padding: var(--dt-space-4) var(--dt-space-4) 0;
}

.geo-panel-title {
  font-size: var(--dt-text-base);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-color-text-primary);
}

.geo-metric-tabs {
  display: flex;
  gap: var(--dt-space-1);
}

.geo-metric-btn {
  padding: var(--dt-space-1) var(--dt-space-3);
  border-radius: var(--dt-radius-xs);
  border: 1px solid var(--dt-color-border);
  background: transparent;
  color: var(--dt-color-text-secondary);
  font-size: var(--dt-text-xs);
  cursor: pointer;
  font-weight: var(--dt-weight-medium);
  transition: all var(--dt-duration-fast) var(--dt-ease-smooth);
}

.geo-metric-btn:hover {
  background: var(--dt-color-bg-muted);
  color: var(--dt-color-text-primary);
}

.geo-metric-btn.active {
  background: var(--dt-color-primary);
  border-color: var(--dt-color-primary);
  color: var(--dt-color-primary-text);
  font-weight: var(--dt-weight-semibold);
}

.geo-map-wrapper {
  flex: 1;
  min-height: 480px;
  border-radius: 4px;
  overflow: hidden;
  padding: var(--dt-space-4);
}

.geo-bar-wrapper {
  flex: 1;
  min-height: 0;
  padding: 0 var(--dt-space-4) var(--dt-space-4);
}

.geo-table-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 0 var(--dt-space-4) var(--dt-space-4);
}

.geo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--dt-space-2);
  color: var(--dt-color-text-secondary);
}

/* ==================== 旧样式兼容 ==================== */

.detail-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--dt-space-3);
  margin-bottom: var(--dt-space-5);
}

.detail-section {
  margin-bottom: var(--dt-space-5);
}

.detail-section h4 {
  font-size: var(--dt-text-base);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-primary);
  margin: 0 0 var(--dt-space-3) 0;
}

/* ====== 品类相关样式 ====== */
.category-share-section {
  margin-bottom: var(--dt-space-5);
  padding: var(--dt-space-4);
  background: var(--dt-color-bg-muted);
  border: 1px solid var(--dt-color-border-light);
  border-radius: var(--dt-radius-md);
}

.category-share-section h4 {
  font-size: var(--dt-text-base);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-primary);
  margin: 0 0 var(--dt-space-3) 0;
}

.category-share-bar {
  display: flex;
  height: 28px;
  border-radius: var(--dt-radius-sm);
  overflow: hidden;
  margin-bottom: var(--dt-space-3);
}

.category-share-bar .laser-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.category-share-bar .inkjet-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #13c2c2, #36cfc9);
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.category-kpi-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.category-kpi {
  display: flex;
  flex-direction: column;
  padding: var(--dt-space-2) var(--dt-space-3);
  border-radius: var(--dt-radius-sm);
}

.category-kpi.laser {
  background: rgba(24, 144, 255, 0.08);
}

.category-kpi.inkjet {
  background: rgba(19, 194, 194, 0.08);
}

.category-kpi .label {
  font-size: 11px;
  color: var(--dt-color-text-secondary);
}

.category-kpi .value {
  font-size: 16px;
  font-weight: 600;
  color: var(--dt-color-text-primary);
}

/* Loading spinner */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 32px;
  height: 32px;
  border: 3px solid var(--dt-color-border);
  border-top-color: var(--dt-color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
