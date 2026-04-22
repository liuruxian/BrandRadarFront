<template>
  <div class="idc-geography">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h1>地理分析</h1>
        <p class="page-desc">全球市场分布与国家下钻分析</p>
      </div>
      <div class="page-actions">
        <n-button-group>
          <n-button :type="viewMode === 'heatmap' ? 'primary' : 'default'" @click="viewMode = 'heatmap'">
            热力图
          </n-button>
          <n-button :type="viewMode === 'compare' ? 'primary' : 'default'" @click="viewMode = 'compare'">
            对比分析
          </n-button>
        </n-button-group>
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

    <!-- 热力图视图 -->
    <template v-if="viewMode === 'heatmap'">
      <!-- 品类切换 -->
      <div class="category-tabs">
        <n-radio-group v-model:value="selectedCategory">
          <n-radio-button value="all">全品类</n-radio-button>
          <n-radio-button value="laser">激光</n-radio-button>
          <n-radio-button value="inkjet">喷墨</n-radio-button>
        </n-radio-group>
      </div>

      <div class="heatmap-container">
        <div class="heatmap-controls">
          <n-radio-group v-model:value="heatmapMetric">
            <n-radio-button value="units">销量</n-radio-button>
            <n-radio-button value="value">销售额</n-radio-button>
            <n-radio-button value="asp">平均单价</n-radio-button>
          </n-radio-group>
        </div>

        <div class="heatmap-wrapper">
          <div class="rank-chart-header">
            <span class="rank-title">国家排名 TOP 20</span>
          </div>
          <BaseChart :option="barChartOption" style="height: 560px" />
        </div>
      </div>

      <!-- 国家列表 -->
      <div class="country-table">
        <div class="table-header">
          <h3>国家排名</h3>
          <n-input
            v-model:value="countrySearch"
            placeholder="搜索国家"
            clearable
            style="width: 200px"
          />
        </div>

        <n-data-table
          :columns="countryColumns"
          :data="filteredCountryData"
          :loading="countryLoading"
          :pagination="{ pageSize: 10 }"
          :bordered="false"
          size="small"
          :row-key="(row: CountryRow) => row.code"
          @row-click="handleCountryClick"
        />
      </div>
    </template>

    <!-- 对比视图 -->
    <template v-if="viewMode === 'compare'">
      <div class="compare-controls">
        <n-select
          v-model:value="compareCountries"
          multiple
          :options="countrySelectOptions"
          placeholder="选择国家或区域进行对比 (2-4个)"
          filterable
          :max-tag-count="4"
          style="width: 400px"
        />
        <n-button type="primary" :loading="compareLoading" @click="queryCompare">
          对比分析
        </n-button>
      </div>

      <div v-if="compareResult.length > 0" class="compare-results">
        <div
          v-for="item in compareResult"
          :key="item.name"
          class="compare-card"
        >
          <div class="compare-card-header">
            <span class="compare-name">{{ item.name }}</span>
            <n-tag size="small" :type="item.type === 'country' ? 'info' : 'success'">
              {{ item.type === 'country' ? '国家' : '区域' }}
            </n-tag>
          </div>
          <div class="compare-kpi-grid">
            <div class="compare-kpi">
              <span class="kpi-label">销量</span>
              <span class="kpi-value">{{ formatNumber(item.units) }}</span>
            </div>
            <div class="compare-kpi">
              <span class="kpi-label">销售额</span>
              <span class="kpi-value">${{ item.value.toFixed(2) }}M</span>
            </div>
            <div class="compare-kpi">
              <span class="kpi-label">ASP</span>
              <span class="kpi-value">${{ item.asp.toFixed(0) }}</span>
            </div>
            <div class="compare-kpi">
              <span class="kpi-label">活跃型号</span>
              <span class="kpi-value">{{ item.active_models }}</span>
            </div>
          </div>
          <div class="compare-chart">
            <BaseChart :option="getCompareTrendOption(item)" style="height: 200px" />
          </div>
          <div class="compare-brand">
            <h4>品牌结构</h4>
            <div class="brand-bars">
              <div
                v-for="(bs, idx) in item.brand_structure?.slice(0, 5)"
                :key="bs.brand"
                class="brand-bar-item"
              >
                <span class="brand-bar-label">{{ bs.brand }}</span>
                <div class="brand-bar-track">
                  <div
                    class="brand-bar-fill"
                    :style="{
                      width: `${bs.share * 100}%`,
                      background: WEB3_COLORS[idx % WEB3_COLORS.length]
                    }"
                  />
                </div>
                <span class="brand-bar-value">{{ (bs.share * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <n-empty v-else description="请选择国家或区域进行对比" />
    </template>

    <!-- 国家详情抽屉 -->
    <n-drawer
      v-model:show="showCountryDrawer"
      :width="600"
      placement="right"
    >
      <n-drawer-content :title="countryDetail?.country_name || '国家详情'" closable>
        <template v-if="countryDetail">
          <!-- 品类结构 -->
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

          <!-- KPI -->
          <div class="detail-kpi-grid">
            <KPICard
              label="销量"
              :value="countryDetail.kpi.units"
              color="primary"
              compact
            />
            <KPICard
              label="销售额"
              :value="countryDetail.kpi.value"
              suffix="USD M"
              color="info"
              format="currency"
              compact
            />
            <KPICard
              label="ASP"
              :value="countryDetail.kpi.asp"
              suffix="USD"
              color="success"
              format="currency"
              compact
            />
            <KPICard
              label="活跃型号"
              :value="countryDetail.kpi.active_models"
              color="warning"
              compact
            />
          </div>

          <!-- 趋势图 -->
          <div class="detail-section">
            <h4>市场趋势</h4>
            <BaseChart :option="countryTrendOption" style="height: 250px" />
          </div>

          <!-- Top 型号 -->
          <div class="detail-section">
            <h4>Top 10 型号</h4>
            <n-data-table
              :columns="topModelColumns"
              :data="countryDetail.top_models"
              :bordered="false"
              size="small"
            />
          </div>

          <!-- 品牌结构 -->
          <div class="detail-section">
            <h4>品牌结构</h4>
            <BaseChart :option="countryBrandOption" style="height: 250px" />
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 筛选抽屉 -->
    <IDCFiltersDrawer
      v-model:visible="showFilterDrawer"
      title="筛选条件"
      @confirm="loadHeatmapData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  NButton,
  NButtonGroup,
  NSelect,
  NInput,
  NRadioGroup,
  NRadioButton,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NTag,
  NEmpty,
  useMessage,
} from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useIDCStore } from '@/stores/idcStore'
import { idcApi } from '@/api/idcApi'
import type {
  GeoHeatmapItem,
  CountryDetailData,
  GeoCompareItem,
  BrandStructure,
} from '@/api/idcApiTypes'
import KPICard from '@/components/idc/KPICard.vue'
import BaseChart from '@/components/idc/BaseChart.vue'
import IDCFiltersDrawer from '@/components/idc/IDCFiltersDrawer.vue'

const message = useMessage()
const idcStore = useIDCStore()
const { filters, hasActiveFilters, filterOptions } = storeToRefs(idcStore)

// ==================== State ====================
const viewMode = ref<'heatmap' | 'compare'>('heatmap')
const showFilterDrawer = ref(false)
const showCountryDrawer = ref(false)

// 品类筛选
const selectedCategory = ref<'all' | 'laser' | 'inkjet'>('all')

// Heatmap
const heatmapMetric = ref<'units' | 'value' | 'asp'>('units')
const heatmapData = ref<GeoHeatmapItem[]>([])
const heatmapLoading = ref(false)

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

// Compare
const compareCountries = ref<string[]>([])
const compareResult = ref<GeoCompareItem[]>([])
const compareLoading = ref(false)

// 粉紫 Web3 风格颜色
const WEB3_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#34d399', '#f87171', '#f472b6', '#a78bfa']

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
  if (!countrySearch.value) return heatmapData.value
  const search = countrySearch.value.toLowerCase()
  return heatmapData.value.filter((d) =>
    d.name.toLowerCase().includes(search)
  )
})

const countrySelectOptions = computed(() => {
  const countries = filterOptions.value.countries || []
  return [
    ...countries.map((c) => ({ label: c.label, value: `country:${c.value}` })),
  ]
})

// ==================== Charts ====================
const barChartOption = computed(() => {
  const data = [...heatmapData.value]
    .sort((a, b) => b[heatmapMetric.value] - a[heatmapMetric.value])
    .slice(0, 20)

  const metricLabel = heatmapMetric.value === 'units' ? '销量' : heatmapMetric.value === 'value' ? '销售额' : 'ASP'
  const maxValue = data.length > 0 ? data[0][heatmapMetric.value] : 100

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
      shadowColor: 'rgba(236, 72, 153, 0.1)',
      shadowBlur: 10,
      formatter: (params: any) => {
        const item = params[0]
        return `<strong>${item.name}</strong><br/>${metricLabel}: <span style="color:#ec4899;font-weight:bold">${formatNumber(item.value)}</span>`
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
                { offset: 0, color: '#ec4899' },
                { offset: 1, color: '#8b5cf6' },
              ],
            },
            shadowColor: 'rgba(236, 72, 153, 0.2)',
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
            shadowColor: 'rgba(236, 72, 153, 0.35)',
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
      shadowColor: 'rgba(139, 92, 246, 0.1)',
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
      { name: '销量', type: 'line', data: trend.units, smooth: 0.4, lineStyle: { width: 3, color: '#ec4899' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(236, 72, 153, 0.2)' }, { offset: 1, color: 'rgba(236, 72, 153, 0)' }] } }, showSymbol: false, emphasis: { showSymbol: true, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#fff', borderColor: '#ec4899', borderWidth: 2, shadowColor: '#ec4899', shadowBlur: 8 } } },
      { name: '销售额', type: 'line', yAxisIndex: 1, data: trend.value, smooth: 0.4, lineStyle: { width: 3, color: '#8b5cf6' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(139, 92, 246, 0.2)' }, { offset: 1, color: 'rgba(139, 92, 246, 0)' }] } }, showSymbol: false, emphasis: { showSymbol: true, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#fff', borderColor: '#8b5cf6', borderWidth: 2, shadowColor: '#8b5cf6', shadowBlur: 8 } } },
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
      shadowColor: 'rgba(236, 72, 153, 0.1)',
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
        emphasis: { scale: true, scaleSize: 8, label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#1c1917' }, itemStyle: { shadowBlur: 20, shadowColor: 'rgba(236, 72, 153, 0.3)' } },
        data: brands.map((b, idx) => ({
          name: b.brand,
          value: b.units,
          itemStyle: { color: WEB3_COLORS[idx % WEB3_COLORS.length] },
        })),
      },
    ],
  }
})

// ==================== Methods ====================
function formatNumber(val: number): string {
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
  return val.toLocaleString()
}

async function loadHeatmapData() {
  heatmapLoading.value = true
  countryLoading.value = true

  try {
    const res = await idcApi.getGeoData(
      heatmapMetric.value,
      50,
      hasActiveFilters.value ? filters.value : undefined
    )
    if (res.success && res.data) {
      // API returns { heatmap: [], globalRegions: [] }
      heatmapData.value = Array.isArray(res.data) ? res.data : (res.data as any).heatmap || []
    }
  } catch (e) {
    message.error('加载热力图数据失败')
  } finally {
    heatmapLoading.value = false
    countryLoading.value = false
  }
}

async function handleCountryClick(row: CountryRow) {
  selectedCountry.value = heatmapData.value.find((d) => d.code === row.code) || null
  showCountryDrawer.value = true

  countryDetailLoading.value = true
  try {
    const res = await idcApi.getCountryDetail(
      row.country_code,
      hasActiveFilters.value ? filters.value : undefined
    )
    if (res.success && res.data) {
      countryDetail.value = res.data
      // 生成模拟品类数据
      countryCategoryData.value = generateCategoryData(res.data.kpi.units)
    }
  } catch (e) {
    message.error('加载国家详情失败')
  } finally {
    countryDetailLoading.value = false
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

async function queryCompare() {
  if (compareCountries.value.length < 2) {
    message.warning('请至少选择 2 个国家或区域')
    return
  }

  compareLoading.value = true
  try {
    const res = await idcApi.compareGeo(
      compareCountries.value,
      hasActiveFilters.value ? filters.value : undefined
    )
    if (res.success && res.data) {
      compareResult.value = res.data.items
    }
  } catch (e) {
    message.error('加载对比数据失败')
  } finally {
    compareLoading.value = false
  }
}

function getCompareTrendOption(item: GeoCompareItem) {
  const trend = item.trend
  if (!trend) return {}

  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: trend.periods, axisLabel: { color: '#6b7280', rotate: 30 } },
    yAxis: { type: 'value', axisLabel: { color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: [{ name: '销量', type: 'bar', data: trend.units, itemStyle: { color: '#3B82F6' } }],
  }
}

// ==================== Lifecycle ====================
onMounted(async () => {
  await idcStore.loadFilterOptions()
  await loadHeatmapData()
})

watch(heatmapMetric, () => {
  loadHeatmapData()
})

// 监听品类切换
watch(selectedCategory, (newCategory) => {
  idcStore.setProductType(newCategory)
  loadHeatmapData()
})
</script>

<style scoped>
.idc-geography {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: transparent;
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
.page-actions :deep(.n-button-group .n-button) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}
.page-actions :deep(.n-button-group .n-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}
.page-actions :deep(.n-button-group .n-button--checked) {
  background: rgba(255, 255, 255, 0.35) !important;
  border-color: rgba(255, 255, 255, 0.6) !important;
  color: white !important;
}

.heatmap-container {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 20px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.02),
    0 4px 6px -1px rgba(15, 23, 42, 0.02);
}

.heatmap-controls {
  margin-bottom: 16px;
}

.heatmap-wrapper {
  min-height: 400px;
}

.rank-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}

.rank-title {
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
}

.country-table {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 20px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.02),
    0 4px 6px -1px rgba(15, 23, 42, 0.02);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
}

.compare-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #FAFBFC;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
}

.compare-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.compare-card {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 20px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.02),
    0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.compare-card:hover {
  border-color: rgba(102, 126, 234, 0.2);
  box-shadow:
    0 20px 25px -5px rgba(102, 126, 234, 0.06),
    0 8px 10px -6px rgba(118, 75, 162, 0.04);
}

.compare-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.compare-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.compare-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.compare-kpi {
  text-align: center;
}

.kpi-label {
  display: block;
  font-size: 11px;
  color: #6B7280;
  margin-bottom: 4px;
}

.kpi-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  font-family: 'JetBrains Mono', monospace;
}

.compare-chart {
  margin-bottom: 16px;
}

.compare-brand h4 {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.brand-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.brand-bar-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-bar-label {
  width: 80px;
  font-size: 12px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-bar-track {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.brand-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.brand-bar-value {
  width: 50px;
  text-align: right;
  font-size: 11px;
  color: #6B7280;
}

.detail-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

/* ====== 品类相关样式 ====== */
.category-tabs {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}

.category-share-section {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

.category-share-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.category-share-bar {
  display: flex;
  height: 28px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
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
  padding: 8px 12px;
  border-radius: 6px;
}

.category-kpi.laser {
  background: rgba(24, 144, 255, 0.08);
}

.category-kpi.inkjet {
  background: rgba(19, 194, 194, 0.08);
}

.category-kpi .label {
  font-size: 11px;
  color: #6B7280;
}

.category-kpi .value {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
</style>
