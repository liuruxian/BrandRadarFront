// IDC 市场总览视图 - 严格按需求文档实现
// 更新时间: 2026-04-10
// 功能: 全品类市场概览仪表盘，激光/喷墨双品类KPI，趋势可视化，品牌分布
<template>
  <div class="idc-overview-view">
    <!-- 页面头部 -->
    <div class="page-header idc-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <div class="header-title">
          <h1>市场总览</h1>
          <p class="header-desc">全球打印设备市场全局分析 · 实时数据</p>
        </div>
      </div>
      <div class="header-right">
        <n-button @click="showFilterDrawer = true">
          <template #icon>
            <IconFilter />
          </template>
          筛选条件
          <n-badge v-if="hasActiveFilters" :value="activeFilterCount" type="warning" class="filter-badge" />
        </n-button>
        <n-button @click="handleRefresh">
          <template #icon>
            <IconRefresh />
          </template>
          刷新
        </n-button>
      </div>
    </div>

    <!-- 活跃筛选标签 -->
    <div v-if="hasActiveFilters" class="active-filters-bar">
      <div class="filter-tags">
        <n-tag
          v-for="(label, key) in activeFilterLabels"
          :key="key"
          closable
          size="small"
          @close="removeFilter(key)"
        >
          {{ label }}
        </n-tag>
      </div>
      <n-button text size="small" type="warning" @click="resetFilters">
        清除全部
      </n-button>
    </div>

    <!-- 品类结构概览 -->
    <div class="category-overview">
      <!-- 双品类KPI卡片 -->
      <div class="dual-category-kpi">
        <div class="kpi-header">
          <span class="kpi-title">品类结构</span>
          <div class="category-tabs-mini">
            <button
              v-for="cat in categoryOptions"
              :key="cat.value"
              class="cat-mini-tab"
              :class="{ active: currentCategory === cat.value }"
              @click="handleCategoryChange(cat.value)"
            >
              <span class="cat-dot" :style="{ background: cat.color }"></span>
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- 品类占比条 -->
        <div class="share-bar-container">
          <div class="share-bar" @click="handleCategoryChange('laser')">
            <div
              class="share-bar-fill laser"
              :style="{ width: `${dualKpiData?.laser_share.units_share || 0}%` }"
            >
              <span class="share-bar-label">
                激光 {{ (dualKpiData?.laser_share.units_share || 0).toFixed(1) }}%
              </span>
            </div>
            <div
              class="share-bar-fill inkjet"
              :style="{ width: `${dualKpiData?.inkjet_share.units_share || 0}%` }"
            >
              <span class="share-bar-label">
                喷墨 {{ (dualKpiData?.inkjet_share.units_share || 0).toFixed(1) }}%
              </span>
            </div>
          </div>
          <div class="share-bar-hint">点击切换品类视图</div>
        </div>

        <!-- 品类详情卡片 -->
        <div class="category-detail-grid">
          <!-- 激光卡片 -->
          <div
            class="category-detail-card laser"
            :class="{ active: currentCategory === 'laser' }"
            @click="handleCategoryChange('laser')"
          >
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="2" width="12" height="20" rx="2" />
                <line x1="9" y1="6" x2="15" y2="6" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="9" y1="14" x2="12" y2="14" />
              </svg>
            </div>
            <div class="card-content">
              <div class="card-title">激光打印机</div>
              <div class="card-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ formatNumber(dualKpiData?.laser.total_units || 0) }}</span>
                  <span class="stat-label">销量 (台)</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">${{ formatNumber(dualKpiData?.laser.total_value || 0) }}M</span>
                  <span class="stat-label">销售额</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">${{ dualKpiData?.laser.asp || 0 }}</span>
                  <span class="stat-label">ASP</span>
                </div>
              </div>
              <div class="card-change" :class="getChangeClass(dualKpiData?.laser.units_yoy || 0)">
                <span class="change-icon">{{ getChangeIcon(dualKpiData?.laser.units_yoy || 0) }}</span>
                {{ Math.abs(dualKpiData?.laser.units_yoy || 0).toFixed(1) }}% 同比
              </div>
            </div>
          </div>

          <!-- 喷墨卡片 -->
          <div
            class="category-detail-card inkjet"
            :class="{ active: currentCategory === 'inkjet' }"
            @click="handleCategoryChange('inkjet')"
          >
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="2" width="12" height="20" rx="2" />
                <circle cx="12" cy="8" r="2" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            </div>
            <div class="card-content">
              <div class="card-title">喷墨打印机</div>
              <div class="card-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ formatNumber(dualKpiData?.inkjet.total_units || 0) }}</span>
                  <span class="stat-label">销量 (台)</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">${{ formatNumber(dualKpiData?.inkjet.total_value || 0) }}M</span>
                  <span class="stat-label">销售额</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">${{ dualKpiData?.inkjet.asp || 0 }}</span>
                  <span class="stat-label">ASP</span>
                </div>
              </div>
              <div class="card-change" :class="getChangeClass(dualKpiData?.inkjet.units_yoy || 0)">
                <span class="change-icon">{{ getChangeIcon(dualKpiData?.inkjet.units_yoy || 0) }}</span>
                {{ Math.abs(dualKpiData?.inkjet.units_yoy || 0).toFixed(1) }}% 同比
              </div>
            </div>
          </div>

          <!-- 合并汇总 -->
          <div class="category-detail-card total" @click="handleCategoryChange('all')">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div class="card-content">
              <div class="card-title">市场总计</div>
              <div class="card-stats">
                <div class="stat-item highlight">
                  <span class="stat-value">{{ formatNumber(dualKpiData?.combined.total_units || 0) }}</span>
                  <span class="stat-label">总销量 (台)</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">${{ formatNumber(dualKpiData?.combined.total_value || 0) }}M</span>
                  <span class="stat-label">总销售额</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ dualKpiData?.combined.active_models || 0 }}</span>
                  <span class="stat-label">活跃型号</span>
                </div>
              </div>
              <div class="card-change" :class="getChangeClass(dualKpiData?.combined.units_yoy || 0)">
                <span class="change-icon">{{ getChangeIcon(dualKpiData?.combined.units_yoy || 0) }}</span>
                {{ Math.abs(dualKpiData?.combined.units_yoy || 0).toFixed(1) }}% 同比
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 全局KPI指标 -->
      <div class="global-kpi-strip">
        <div class="kpi-mini-card">
          <div class="kpi-mini-icon units">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div class="kpi-mini-content">
            <div class="kpi-mini-value">{{ formatNumber(kpiData?.total_units || 0) }}</div>
            <div class="kpi-mini-label">总销量</div>
          </div>
          <div class="kpi-mini-change" :class="getChangeClass(kpiData?.units_yoy || 0)">
            {{ getChangeIcon(kpiData?.units_yoy || 0) }}{{ Math.abs(Number(kpiData?.units_yoy || 0)).toFixed(1) }}%
          </div>
        </div>

        <div class="kpi-mini-card">
          <div class="kpi-mini-icon value">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div class="kpi-mini-content">
            <div class="kpi-mini-value">${{ formatNumber(kpiData?.total_value || 0) }}M</div>
            <div class="kpi-mini-label">总销售额</div>
          </div>
          <div class="kpi-mini-change" :class="getChangeClass(kpiData?.value_yoy || 0)">
            {{ getChangeIcon(kpiData?.value_yoy || 0) }}{{ Math.abs(Number(kpiData?.value_yoy || 0)).toFixed(1) }}%
          </div>
        </div>

        <div class="kpi-mini-card">
          <div class="kpi-mini-icon asp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </svg>
          </div>
          <div class="kpi-mini-content">
            <div class="kpi-mini-value">${{ kpiData?.asp || 0 }}</div>
            <div class="kpi-mini-label">平均单价</div>
          </div>
        </div>

        <div class="kpi-mini-card">
          <div class="kpi-mini-icon models">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div class="kpi-mini-content">
            <div class="kpi-mini-value">{{ kpiData?.active_models || 0 }}</div>
            <div class="kpi-mini-label">活跃型号</div>
          </div>
        </div>

        <div class="kpi-mini-card">
          <div class="kpi-mini-icon countries">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div class="kpi-mini-content">
            <div class="kpi-mini-value">{{ kpiData?.countries_covered || 0 }}</div>
            <div class="kpi-mini-label">覆盖国家</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 双品类趋势图 -->
      <div class="chart-card chart-large">
        <div class="chart-header">
          <div class="chart-title">
            <h3>销量趋势</h3>
            <n-tooltip>
              <template #trigger>
                <span class="chart-tip-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </span>
              </template>
              展示激光和喷墨打印机在半年度维度的销量变化趋势
            </n-tooltip>
          </div>
          <div class="chart-controls">
            <n-radio-group v-model:value="trendMetric" size="small">
              <n-radio-button value="units">销量</n-radio-button>
              <n-radio-button value="value">销售额</n-radio-button>
            </n-radio-group>
          </div>
        </div>
        <div class="chart-body">
          <BaseChart :option="dualTrendChartOption" style="height: 320px" />
        </div>
      </div>

      <!-- 区域堆叠图 -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <h3>区域市场分布</h3>
          </div>
          <div class="chart-controls">
            <n-button text size="small" @click="handleDrillRegion">
              区域下钻
              <template #icon>
                <IconChevronRight />
              </template>
            </n-button>
          </div>
        </div>
        <div class="chart-body">
          <BaseChart :option="regionStackedChartOption" style="height: 320px" />
        </div>
      </div>

      <!-- 品牌份额图 -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <h3>{{ currentCategory === 'inkjet' ? '喷墨' : currentCategory === 'laser' ? '激光' : '' }}品牌份额</h3>
          </div>
          <div class="chart-controls">
            <n-radio-group v-model:value="brandViewType" size="small">
              <n-radio-button value="pie">饼图</n-radio-button>
              <n-radio-button value="bar">柱图</n-radio-button>
            </n-radio-group>
          </div>
        </div>
        <div class="chart-body">
          <BaseChart :option="brandShareChartOption" style="height: 320px" />
        </div>
      </div>

      <!-- OEM制造分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <h3>OEM 制造分布</h3>
          </div>
        </div>
        <div class="chart-body">
          <BaseChart :option="oemChartOption" style="height: 320px" />
        </div>
      </div>
    </div>

    <!-- 品牌排行榜 -->
    <div class="brand-ranking-section">
      <div class="section-header">
        <h3>品牌排行榜</h3>
        <div class="section-tabs">
          <button
            v-for="tab in rankingTabs"
            :key="tab.value"
            class="section-tab"
            :class="{ active: rankingTab === tab.value }"
            @click="rankingTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      <div class="ranking-table">
        <n-data-table
          :columns="rankingColumns"
          :data="rankingData"
          :pagination="false"
          :bordered="false"
          size="small"
        />
      </div>
    </div>

    <!-- 筛选抽屉 -->
    <IDCFiltersDrawer
      v-model:visible="showFilterDrawer"
      title="筛选条件"
      @confirm="handleFilterConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, h, onMounted, watch } from 'vue'
import {
  NButton,
  NBadge,
  NTag,
  NRadioGroup,
  NRadioButton,
  NTooltip,
  NDataTable,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useIDCStore } from '@/stores/idcStore'
import { useIDCMarketStore } from '@/stores/idcMarketStore'
import { idcApi } from '@/api/idcApi'
import type { ProductType, KPIData, DualCategoryKPIData } from '@/api/idcApiTypes'
import BaseChart from '@/components/idc/BaseChart.vue'
import IDCFiltersDrawer from '@/components/idc/IDCFiltersDrawer.vue'

// 图标组件
const IconFilter = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' })
])
const IconRefresh = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '23 4 23 10 17 10' }),
  h('polyline', { points: '1 20 1 14 7 14' }),
  h('path', { d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' })
])
const IconChevronRight = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '9 18 15 12 9 6' })
])

const router = useRouter()
const message = useMessage()
const idcStore = useIDCStore()
const marketStore = useIDCMarketStore()
const { filters, hasActiveFilters } = storeToRefs(idcStore)

// ==================== 状态 ====================

// 排行榜Tab
const trendMetric = ref<'units' | 'value'>('units')
const brandViewType = ref<'pie' | 'bar'>('pie')
const rankingTab = ref<string>('units')

// 品类选项
const categoryOptions = [
  { value: 'all' as ProductType, label: '全品类', color: '#667eea' },
  { value: 'laser' as ProductType, label: '激光', color: '#1890ff' },
  { value: 'inkjet' as ProductType, label: '喷墨', color: '#13c2c2' },
]

// 时间周期选项
const periodOptions = [
  { label: '2025H1', value: '2025H1' },
  { label: '2024年', value: '2024' },
  { label: '2024H2', value: '2024H2' },
  { label: '2024H1', value: '2024H1' },
  { label: '2023年', value: '2023' },
]

// 排行榜Tab
const rankingTabs = [
  { value: 'units', label: '销量' },
  { value: 'value', label: '销售额' },
  { value: 'asp', label: 'ASP' },
]

// 数据
const kpiData = ref<KPIData | null>(null)
const dualKpiData = ref<DualCategoryKPIData | null>(null)
const dualTrendData = ref<{ periods: string[]; laser_units: number[]; inkjet_units: number[]; laser_value: number[]; inkjet_value: number[] } | null>(null)
const brandData = ref<{ brand: string; units: number; value: number; asp: number }[]>([])
const regionData = ref<{ region: string; units: number[] }[]>([])
const oemData = ref<{ oem: string; units: number }[]>([])

// 加载状态
const loading = ref(false)

// ==================== 计算属性 ====================

// 活跃筛选数量
const activeFilterCount = computed(() => {
  let count = 0
  Object.entries(filters.value).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0 && key !== 'product_type') {
      count += value.length
    }
  })
  return count
})

// 活跃筛选标签
const activeFilterLabels = computed(() => {
  const labels: Record<string, string> = {}
  if (filters.value.years?.length) {
    labels.years = `年份: ${filters.value.years.join(', ')}`
  }
  if (filters.value.half_years?.length) {
    labels.half_years = `半年度: ${filters.value.half_years.join(', ')}`
  }
  if (filters.value.global_regions?.length) {
    labels.global_regions = `区域: ${filters.value.global_regions.join(', ')}`
  }
  if (filters.value.brands?.length) {
    labels.brands = `品牌: ${filters.value.brands.join(', ')}`
  }
  return labels
})

// 排行榜数据
const rankingData = computed(() => {
  return [...brandData.value].sort((a, b) => {
    if (rankingTab.value === 'units') return b.units - a.units
    if (rankingTab.value === 'value') return b.value - a.value
    return b.asp - a.asp
  }).map((item, idx) => ({
    ...item,
    rank: idx + 1,
    share: ((item.units / brandData.value.reduce((sum, b) => sum + b.units, 0)) * 100).toFixed(1),
  }))
})

// 排行榜列
const rankingColumns = computed<DataTableColumns<Record<string, unknown>>>(() => [
  {
    title: '排名',
    key: 'rank',
    width: 60,
    render: (row) => {
      const rank = row.rank as number
      if (rank <= 3) {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32']
        return h('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, [
          h('span', { style: { 
            width: '20px', height: '20px', borderRadius: '50%', 
            background: colors[rank - 1], display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 'bold', color: 'white' 
          } }, rank)
        ])
      }
      return h('span', { style: { color: '#6b7280' } }, rank)
    }
  },
  {
    title: '品牌',
    key: 'brand',
    render: (row) => h('span', { style: { fontWeight: 600 } }, String(row.brand))
  },
  {
    title: '销量 (台)',
    key: 'units',
    align: 'right',
    render: (row) => formatNumber(row.units as number)
  },
  {
    title: '销售额 (USD M)',
    key: 'value',
    align: 'right',
    render: (row) => `$${formatNumber(row.value as number)}`
  },
  {
    title: 'ASP (USD)',
    key: 'asp',
    align: 'right',
    render: (row) => `$${row.asp}`
  },
  {
    title: '份额',
    key: 'share',
    align: 'right',
    render: (row) => `${row.share}%`
  },
])

// ==================== 图表配置 ====================

// 粉紫 Web3 风格颜色
const WEB3_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#34d399', '#f87171', '#f472b6', '#a78bfa']

// 双品类趋势图
const dualTrendChartOption = computed(() => {
  if (!dualTrendData.value) return {}

  const data = dualTrendData.value
  const metric = trendMetric.value

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
      shadowColor: 'rgba(236, 72, 153, 0.1)',
      shadowBlur: 10,
    },
    legend: {
      data: ['激光', '喷墨'],
      bottom: 0,
      textStyle: { color: '#4b5563', fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.periods,
      axisLine: { lineStyle: { color: '#e7e5e4' } },
      axisLabel: { color: '#4b5563', fontSize: 12 },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: '激光',
        position: 'left',
        axisLine: { show: false },
        axisLabel: {
          color: '#ec4899',
          formatter: (val: number) => metric === 'units' ? formatNumber(val) : `$${formatNumber(val)}`
        },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      },
      {
        type: 'value',
        name: '喷墨',
        position: 'right',
        axisLine: { show: false },
        axisLabel: {
          color: '#8b5cf6',
          formatter: (val: number) => metric === 'units' ? formatNumber(val) : `$${formatNumber(val)}`
        },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '激光',
        type: 'bar',
        yAxisIndex: 0,
        data: metric === 'units' ? data.laser_units : data.laser_value,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#ec4899' },
              { offset: 1, color: '#f472b6' },
            ],
          },
          shadowColor: 'rgba(236, 72, 153, 0.25)',
          shadowBlur: 8,
        },
        barWidth: '30%',
        barCategoryGap: '30%',
      },
      {
        name: '喷墨',
        type: 'bar',
        yAxisIndex: 1,
        data: metric === 'units' ? data.inkjet_units : data.inkjet_value,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#8b5cf6' },
              { offset: 1, color: '#a78bfa' },
            ],
          },
          shadowColor: 'rgba(139, 92, 246, 0.25)',
          shadowBlur: 8,
        },
        barWidth: '30%',
        barCategoryGap: '30%',
      },
    ],
  }
})

// 区域堆叠图
const regionStackedChartOption = computed(() => {
  if (!regionData.value.length) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
      shadowColor: 'rgba(236, 72, 153, 0.1)',
      shadowBlur: 10,
    },
    legend: {
      data: regionData.value.map(r => r.region),
      bottom: 0,
      textStyle: { color: '#4b5563', fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dualTrendData.value?.periods || [],
      axisLine: { lineStyle: { color: '#e7e5e4' } },
      axisLabel: { color: '#4b5563', fontSize: 12 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#4b5563', fontSize: 12, formatter: (val: number) => formatNumber(val) },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
    },
    series: regionData.value.map((r, idx) => ({
      name: r.region,
      type: 'bar',
      stack: 'total',
      data: r.units,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: WEB3_COLORS[idx % WEB3_COLORS.length] },
            { offset: 1, color: WEB3_COLORS[idx % WEB3_COLORS.length] + 'aa' },
          ],
        },
        borderRadius: 0,
        shadowColor: 'transparent',
        shadowBlur: 0,
      },
      emphasis: { focus: 'series' },
    })),
  }
})

// 品牌份额图
const brandShareChartOption = computed(() => {
  if (!brandData.value.length) return {}

  const topBrands = brandData.value.slice(0, 8)

  if (brandViewType.value === 'pie') {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: (params: { name: string; value: number; percent: number }) =>
          `${params.name}: ${formatNumber(params.value)} 台 (${params.percent}%)`,
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
      },
      series: [{
        type: 'pie',
        radius: ['65%', '85%'],
        center: ['35%', '50%'],
        data: topBrands.map((b, i) => ({
          name: b.brand,
          value: b.units,
          itemStyle: {
            color: WEB3_COLORS[i % WEB3_COLORS.length],
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        })),
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 8,
          label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#1c1917' },
          itemStyle: { shadowBlur: 20, shadowColor: 'rgba(236, 72, 153, 0.3)' },
        },
      }],
    }
  }

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
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: topBrands.map(b => b.brand),
      axisLine: { lineStyle: { color: '#e7e5e4' } },
      axisLabel: { color: '#4b5563', fontSize: 12, rotate: 30 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#4b5563', fontSize: 12, formatter: (val: number) => formatNumber(val) },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
    },
    series: [{
      type: 'bar',
      data: topBrands.map((b, i) => ({
        value: b.units,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: WEB3_COLORS[i % WEB3_COLORS.length] },
              { offset: 1, color: WEB3_COLORS[i % WEB3_COLORS.length] + 'aa' },
            ],
          },
          shadowColor: 'rgba(236, 72, 153, 0.2)',
          shadowBlur: 6,
        },
      })),
      barWidth: '50%',
    }],
  }
})

// OEM分布图
const oemChartOption = computed(() => {
  if (!oemData.value.length) return {}

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
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: oemData.value.map(o => o.oem),
      axisLine: { lineStyle: { color: '#e7e5e4' } },
      axisLabel: { color: '#4b5563', fontSize: 12, rotate: 30 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#4b5563', fontSize: 12, formatter: (val: number) => formatNumber(val) },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
    },
    series: [{
      type: 'bar',
      data: oemData.value.map((o, i) => ({
        value: o.units,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: WEB3_COLORS[i % WEB3_COLORS.length] },
              { offset: 1, color: WEB3_COLORS[i % WEB3_COLORS.length] + 'aa' },
            ],
          },
          shadowColor: 'rgba(236, 72, 153, 0.2)',
          shadowBlur: 6,
        },
      })),
      barWidth: '50%',
    }],
  }
})

// ==================== 方法 ====================

/**
 * 格式化数字
 */
function formatNumber(val: number | string | undefined | null): string {
  const num = Number(val)
  if (isNaN(num)) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toLocaleString()
}

/**
 * 获取变化图标
 */
function getChangeIcon(val: number | string | undefined): string {
  const num = Number(val)
  if (num > 0) return '↑'
  if (num < 0) return '↓'
  return '→'
}

/**
 * 获取变化类名
 */
function getChangeClass(val: number | string | undefined): string {
  const num = Number(val)
  if (num > 0) return 'positive'
  if (num < 0) return 'negative'
  return 'neutral'
}

/**
 * 品类切换
 */
function handleCategoryChange(category: ProductType) {
  currentCategory.value = category
  idcStore.setProductType(category)
  loadData()
}

/**
 * 移除筛选
 */
function removeFilter(key: string) {
  idcStore.updateFilter(key as keyof typeof filters.value, [])
}

/**
 * 重置筛选
 */
function resetFilters() {
  idcStore.resetFilters()
}

/**
 * 刷新数据
 */
async function handleRefresh() {
  await loadData()
  message.success('数据已刷新')
}

/**
 * 筛选确认
 */
function handleFilterConfirm() {
  loadData()
}

/**
 * 区域下钻
 */
function handleDrillRegion() {
  router.push('/idc/geography')
}

/**
 * 加载数据
 */
async function loadData() {
  loading.value = true
  try {
    const [kpiRes, dualKpiRes, dualTrendRes, brandRes, regionRes, oemRes] = await Promise.all([
      idcApi.getOverviewKPI(),
      idcApi.getDualCategoryKPI(),
      idcApi.getDualCategoryTrend('dual_axis'),
      idcApi.getBrandDistribution('top_n'),
      idcApi.getOverviewTrend('region_stacked'),
      idcApi.getBrandDistribution('oem'),
    ])

    if (kpiRes.success && kpiRes.data) {
      kpiData.value = kpiRes.data
    }

    if (dualKpiRes.success && dualKpiRes.data) {
      dualKpiData.value = dualKpiRes.data
    }

    if (dualTrendRes.success && dualTrendRes.data) {
      dualTrendData.value = dualTrendRes.data
    }

    if (brandRes.success && brandRes.data && brandRes.data.type === 'top_n') {
      brandData.value = brandRes.data.brands
    }

    if (regionRes.success && regionRes.data) {
      regionData.value = regionRes.data.series.map(s => ({
        region: s.name,
        units: s.data,
      }))
    }

    if (oemRes.success && oemRes.data && oemRes.data.type === 'oem') {
      oemData.value = oemRes.data.oems
    }
  } catch (e) {
    console.error('Failed to load data:', e)
    message.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// ==================== 生命周期 ====================

onMounted(async () => {
  await idcStore.loadFilterOptions()
  await loadData()
})

// 监听筛选变化
watch(hasActiveFilters, () => {
  loadData()
})
</script>

<style scoped>
.idc-overview-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
  background: transparent;
  width: 100%;
  max-width: 100%;
}

.idc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.25);
  margin: 0;
}

.idc-header .header-left { display: flex; align-items: center; gap: 16px; }
.idc-header .header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  color: white;
}
.idc-header .header-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.idc-header .header-title h1 {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.2;
}
.idc-header .header-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}
.idc-header .header-right { display: flex; gap: 10px; align-items: center; }
.idc-header .header-right :deep(.n-button) {
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
.idc-header .header-right :deep(.n-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 活跃筛选栏 */
.active-filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.06));
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 品类概览 */
.category-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 双品类KPI */
.dual-category-kpi {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.02),
    0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.dual-category-kpi:hover {
  border-color: rgba(102, 126, 234, 0.15);
  box-shadow:
    0 20px 25px -5px rgba(102, 126, 234, 0.06),
    0 8px 10px -6px rgba(118, 75, 162, 0.04);
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.kpi-title {
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
}

.category-tabs-mini {
  display: flex;
  gap: 10px;
}

.cat-mini-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 24px;
  cursor: pointer;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.cat-mini-tab:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.06), rgba(118, 75, 162, 0.04));
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px) scale(1.02);
}
.cat-mini-tab.active {
  background: linear-gradient(135deg, #667EEA, #764BA2);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.cat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* 品类占比条 */
.share-bar-container {
  margin-bottom: 24px;
}

.share-bar {
  display: flex;
  height: 44px;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.share-bar-fill {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 60px;
}

.share-bar-fill:hover {
  filter: brightness(1.1);
  transform: scaleY(1.05);
}

.share-bar-fill.laser {
  background: linear-gradient(135deg, #667EEA, #764BA2);
}

.share-bar-fill.inkjet {
  background: linear-gradient(135deg, #0891B2, #06B6D4);
}

.share-bar-label {
  font-size: 13px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.share-bar-hint {
  text-align: center;
  margin-top: 10px;
  font-size: 13px;
  color: #94A3B8;
}

/* 品类详情卡片 */
.category-detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.category-detail-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.category-detail-card.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.category-detail-card.laser .card-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1890ff;
}

.category-detail-card.inkjet .card-icon {
  background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
  color: #13c2c2;
}

.category-detail-card.total .card-icon {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #6366f1;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.card-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-item.highlight .stat-value {
  color: #3b82f6;
  font-size: 18px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 10px;
  color: #9ca3af;
}

.card-change {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.card-change.positive {
  background: #dcfce7;
  color: #16a34a;
}

.card-change.negative {
  background: #fee2e2;
  color: #dc2626;
}

.card-change.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.change-icon {
  font-size: 10px;
}

/* 全局KPI条 */
.global-kpi-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.kpi-mini-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.kpi-mini-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.kpi-mini-icon.units {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.kpi-mini-icon.value {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
}

.kpi-mini-icon.asp {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.kpi-mini-icon.models {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #9333ea;
}

.kpi-mini-icon.countries {
  background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
  color: #0d9488;
}

.kpi-mini-content {
  flex: 1;
  min-width: 0;
}

.kpi-mini-value {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.kpi-mini-label {
  font-size: 11px;
  color: #6b7280;
}

.kpi-mini-change {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  white-space: nowrap;
}

.kpi-mini-change.positive {
  background: #dcfce7;
  color: #16a34a;
}

.kpi-mini-change.negative {
  background: #fee2e2;
  color: #dc2626;
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.chart-card.chart-large {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-title h3 {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.chart-tip-icon {
  color: #9ca3af;
  cursor: help;
  display: flex;
  align-items: center;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.chart-body {
  min-height: 0;
}

/* 品牌排行榜 */
.brand-ranking-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.section-tabs {
  display: flex;
  gap: 4px;
}

.section-tab {
  padding: 6px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  color: #6b7280;
  transition: all 0.2s;
}

.section-tab:hover {
  background: #e5e7eb;
}

.section-tab.active {
  background: #3b82f6;
  color: white;
}

/* 响应式 */
@media (max-width: 1400px) {
  .category-detail-grid {
    grid-template-columns: 1fr;
  }

  .global-kpi-strip {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1000px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .global-kpi-strip {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
