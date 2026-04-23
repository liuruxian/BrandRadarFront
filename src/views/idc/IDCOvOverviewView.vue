// IDC 市场总览视图 - 基于 /api/idc/overview 统一 API
// 更新时间: 2026-04-22
<template>
  <div class="page-container idc-overview-view">
    <!-- 品类结构概览 -->
    <div class="category-overview">
      <!-- 加载骨架屏 -->
      <template v-if="loading && !overviewData">
        <div class="dual-category-kpi skeleton-card">
          <div class="kpi-header">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-tabs"></div>
          </div>
          <div class="skeleton skeleton-bar"></div>
          <div class="category-detail-grid">
            <div v-for="i in 3" :key="i" class="category-detail-card skeleton-card-inner">
              <div class="skeleton skeleton-icon"></div>
              <div class="card-content">
                <div class="skeleton skeleton-text w-60"></div>
                <div class="card-stats">
                  <div class="skeleton skeleton-text w-40"></div>
                  <div class="skeleton skeleton-text w-40"></div>
                  <div class="skeleton skeleton-text w-40"></div>
                </div>
                <div class="skeleton skeleton-text w-30"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="global-kpi-strip">
          <div v-for="i in 5" :key="i" class="kpi-mini-card skeleton-kpi"></div>
        </div>
      </template>

      <!-- 真实数据 -->
      <template v-else-if="overviewData">
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
                :style="{ width: `${laserShare}%` }"
              >
                <span class="share-bar-label">
                  激光 {{ laserShare.toFixed(1) }}%
                </span>
              </div>
              <div
                class="share-bar-fill inkjet"
                :style="{ width: `${inkjetShare}%` }"
              >
                <span class="share-bar-label">
                  喷墨 {{ inkjetShare.toFixed(1) }}%
                </span>
              </div>
            </div>
            <div class="share-bar-hint">点击切换品类视图</div>
          </div>

          <!-- 品类详情卡片 -->
          <div class="category-detail-grid">
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
                    <span class="stat-value">{{ formatNumber(overviewData.category?.laser?.units || 0) }}</span>
                    <span class="stat-label">销量 (台)</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">${{ formatNumber(overviewData.category?.laser?.value || 0) }}M</span>
                    <span class="stat-label">销售额</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">${{ laserAsp }}</span>
                    <span class="stat-label">ASP</span>
                  </div>
                </div>
                <div class="card-change" :class="getChangeClass(overviewData.category?.laser?.unitsYoY || 0)">
                  <span class="change-icon">{{ getChangeIcon(overviewData.category?.laser?.unitsYoY || 0) }}</span>
                  {{ Math.abs(overviewData.category?.laser?.unitsYoY || 0).toFixed(1) }}% 同比
                </div>
              </div>
            </div>

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
                    <span class="stat-value">{{ formatNumber(overviewData.category?.inkjet?.units || 0) }}</span>
                    <span class="stat-label">销量 (台)</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">${{ formatNumber(overviewData.category?.inkjet?.value || 0) }}M</span>
                    <span class="stat-label">销售额</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">${{ inkjetAsp }}</span>
                    <span class="stat-label">ASP</span>
                  </div>
                </div>
                <div class="card-change" :class="getChangeClass(overviewData.category?.inkjet?.unitsYoY || 0)">
                  <span class="change-icon">{{ getChangeIcon(overviewData.category?.inkjet?.unitsYoY || 0) }}</span>
                  {{ Math.abs(overviewData.category?.inkjet?.unitsYoY || 0).toFixed(1) }}% 同比
                </div>
              </div>
            </div>

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
                    <span class="stat-value">{{ formatNumber(overviewData.kpi?.totalUnits || 0) }}</span>
                    <span class="stat-label">总销量 (台)</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">${{ formatNumber(overviewData.kpi?.totalValue || 0) }}M</span>
                    <span class="stat-label">总销售额</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ overviewData.kpi?.activeModels || 0 }}</span>
                    <span class="stat-label">活跃型号</span>
                  </div>
                </div>
                <div class="card-change" :class="getChangeClass(overviewData.kpi?.unitsYoY || 0)">
                  <span class="change-icon">{{ getChangeIcon(overviewData.kpi?.unitsYoY || 0) }}</span>
                  {{ Math.abs(overviewData.kpi?.unitsYoY || 0).toFixed(1) }}% 同比
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
              <div class="kpi-mini-value">{{ formatNumber(overviewData.kpi?.totalUnits || 0) }}</div>
              <div class="kpi-mini-label">总销量</div>
            </div>
            <div class="kpi-mini-change" :class="getChangeClass(overviewData.kpi?.unitsYoY || 0)">
              {{ getChangeIcon(overviewData.kpi?.unitsYoY || 0) }}{{ Math.abs(overviewData.kpi?.unitsYoY || 0).toFixed(1) }}%
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
              <div class="kpi-mini-value">${{ formatNumber(overviewData.kpi?.totalValue || 0) }}M</div>
              <div class="kpi-mini-label">总销售额</div>
            </div>
            <div class="kpi-mini-change" :class="getChangeClass(overviewData.kpi?.valueYoY || 0)">
              {{ getChangeIcon(overviewData.kpi?.valueYoY || 0) }}{{ Math.abs(overviewData.kpi?.valueYoY || 0).toFixed(1) }}%
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
              <div class="kpi-mini-value">${{ overviewData.kpi?.asp || 0 }}</div>
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
              <div class="kpi-mini-value">{{ overviewData.kpi?.activeModels || 0 }}</div>
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
              <div class="kpi-mini-value">{{ overviewData.kpi?.countriesCovered || 0 }}</div>
              <div class="kpi-mini-label">覆盖国家</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <template v-if="loading && !overviewData">
        <div class="chart-card chart-large">
          <div class="chart-header">
            <div class="skeleton skeleton-text w-40"></div>
          </div>
          <div class="chart-body">
            <div class="skeleton skeleton-chart"></div>
          </div>
        </div>
        <div v-for="i in 3" :key="i" class="chart-card">
          <div class="chart-header">
            <div class="skeleton skeleton-text w-50"></div>
          </div>
          <div class="chart-body">
            <div class="skeleton skeleton-chart"></div>
          </div>
        </div>
      </template>

      <template v-else-if="overviewData">
        <!-- 销量趋势 -->
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
            <BaseChart :option="trendChartOption" style="height: 320px" />
          </div>
        </div>

        <!-- 区域市场分布 -->
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
            <BaseChart :option="regionChartOption" style="height: 320px" />
          </div>
        </div>

        <!-- 品牌份额图 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <h3>品牌份额</h3>
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

        <!-- 产品形态分布 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <h3>产品形态分布</h3>
            </div>
          </div>
          <div class="chart-body">
            <BaseChart :option="formChartOption" style="height: 320px" />
          </div>
        </div>
      </template>
    </div>

    <!-- 品牌排行榜 + 国家TOP10 -->
    <div class="bottom-grid">
      <div class="brand-ranking-section">
        <template v-if="loading && !overviewData">
          <div class="section-header">
            <div class="skeleton skeleton-text w-40"></div>
            <div class="skeleton skeleton-tabs"></div>
          </div>
          <div class="ranking-table">
            <div class="skeleton skeleton-table"></div>
          </div>
        </template>
        <template v-else-if="overviewData">
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
        </template>
      </div>

      <div class="brand-ranking-section">
        <template v-if="loading && !overviewData">
          <div class="section-header">
            <div class="skeleton skeleton-text w-40"></div>
          </div>
          <div class="ranking-table">
            <div class="skeleton skeleton-table"></div>
          </div>
        </template>
        <template v-else-if="overviewData">
          <div class="section-header">
            <h3>国家 TOP 10</h3>
          </div>
          <div class="ranking-table">
            <n-data-table
              :columns="countryColumns"
              :data="countryData"
              :pagination="false"
              :bordered="false"
              size="small"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- 渠道结构 -->
    <div class="channel-section">
      <template v-if="loading && !overviewData">
        <div class="section-header">
          <div class="skeleton skeleton-text w-40"></div>
        </div>
        <div class="channel-bar">
          <div class="skeleton skeleton-chart"></div>
        </div>
      </template>
      <template v-else-if="overviewData">
        <div class="section-header">
          <h3>渠道结构</h3>
        </div>
        <div class="channel-bar">
          <div class="channel-bar-item direct">
            <div class="channel-bar-fill"
              :style="{ width: `${directShare}%` }"
            ></div>
            <span class="channel-bar-label">直销 {{ directShare.toFixed(1) }}%</span>
          </div>
          <div class="channel-bar-item indirect">
            <div class="channel-bar-fill"
              :style="{ width: `${indirectShare}%` }"
            ></div>
            <span class="channel-bar-label">分销 {{ indirectShare.toFixed(1) }}%</span>
          </div>
        </div>
      </template>
    </div>

    <!-- 筛选抽屉 -->
    <IDCFiltersDrawer
      v-model:visible="showFilterDrawer"
      title="筛选条件"
      @confirm="handleFilterConfirm"
    />

    <!-- 错误提示 -->
    <Transition name="fade">
      <div v-if="error" class="error-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ error }}</span>
        <n-button size="small" @click="loadData">重试</n-button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted, watch } from 'vue'
import {
  NButton,
  NBadge,
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
import { idcApi } from '@/api/idcApi'
import type { ProductType, OverviewData, OverviewParams } from '@/api/idcApiTypes'
import BaseChart from '@/components/idc/BaseChart.vue'
import IDCFiltersDrawer from '@/components/idc/IDCFiltersDrawer.vue'

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
const { filters, hasActiveFilters } = storeToRefs(idcStore)

// ==================== 状态 ====================
const overviewData = ref<OverviewData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showFilterDrawer = ref(false)

const currentCategory = ref<ProductType>('all')
const trendMetric = ref<'units' | 'value'>('units')
const brandViewType = ref<'pie' | 'bar'>('pie')
const rankingTab = ref<string>('units')

const categoryOptions = [
  { value: 'all' as ProductType, label: '全品类', color: '#2563eb' },
  { value: 'laser' as ProductType, label: '激光', color: '#1890ff' },
  { value: 'inkjet' as ProductType, label: '喷墨', color: '#13c2c2' },
]

const rankingTabs = [
  { value: 'units', label: '销量' },
  { value: 'value', label: '销售额' },
  { value: 'asp', label: 'ASP' },
]

// ==================== 计算属性 ====================
const activeFilterCount = computed(() => {
  let count = 0
  Object.entries(filters.value).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0 && key !== 'product_type') {
      count += value.length
    }
  })
  return count
})

const laserShare = computed(() => {
  const laser = overviewData.value?.category?.laser?.share || 0
  return laser * 100
})

const inkjetShare = computed(() => {
  const inkjet = overviewData.value?.category?.inkjet?.share || 0
  return inkjet * 100
})

const laserAsp = computed(() => {
  const laser = overviewData.value?.category?.laser
  if (!laser || !laser.units) return 0
  return Math.round((laser.value * 1000000) / laser.units)
})

const inkjetAsp = computed(() => {
  const inkjet = overviewData.value?.category?.inkjet
  if (!inkjet || !inkjet.units) return 0
  return Math.round((inkjet.value * 1000000) / inkjet.units)
})

const directShare = computed(() => {
  const ch = overviewData.value?.channel
  if (!ch) return 0
  const total = (ch.direct?.units || 0) + (ch.indirect?.units || 0)
  if (!total) return 0
  return ((ch.direct?.units || 0) / total) * 100
})

const indirectShare = computed(() => {
  const ch = overviewData.value?.channel
  if (!ch) return 0
  const total = (ch.direct?.units || 0) + (ch.indirect?.units || 0)
  if (!total) return 0
  return ((ch.indirect?.units || 0) / total) * 100
})

// ==================== 排行榜数据 ====================
const rankingData = computed(() => {
  const brands = overviewData.value?.brands || []
  return [...brands].sort((a, b) => {
    if (rankingTab.value === 'units') return b.units - a.units
    if (rankingTab.value === 'value') return b.value - a.value
    return b.asp - a.asp
  }).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }))
})

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
          h('span', {
            style: {
              width: '20px', height: '20px', borderRadius: '50%',
              background: colors[rank - 1], display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 'bold', color: 'white'
            }
          }, rank)
        ])
      }
      return h('span', { style: { color: '#6b7280' } }, rank)
    }
  },
  {
    title: '品牌',
    key: 'name',
    render: (row) => h('span', { style: { fontWeight: 600 } }, String(row.name))
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
    render: (row) => `${((row.share as number) * 100).toFixed(1)}%`
  },
])

const countryData = computed(() => {
  return overviewData.value?.countries || []
})

const countryColumns = computed<DataTableColumns<Record<string, unknown>>>(() => [
  {
    title: '排名',
    key: 'rank',
    width: 60,
    render: (row) => {
      const rank = row.rank as number
      if (rank <= 3) {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32']
        return h('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, [
          h('span', {
            style: {
              width: '20px', height: '20px', borderRadius: '50%',
              background: colors[rank - 1], display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 'bold', color: 'white'
            }
          }, rank)
        ])
      }
      return h('span', { style: { color: '#6b7280' } }, rank)
    }
  },
  {
    title: '国家',
    key: 'name',
    render: (row) => h('span', { style: { fontWeight: 600 } }, String(row.name))
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
    title: '份额',
    key: 'share',
    align: 'right',
    render: (row) => `${((row.share as number) * 100).toFixed(1)}%`
  },
])

// ==================== 图表配置 ====================
const WEB3_COLORS = ['#004ac6', '#2563eb', '#06b6d4', '#f59e0b', '#34d399', '#f87171', '#1d4ed8', '#60a5fa']

const trendChartOption = computed(() => {
  const trend = overviewData.value?.trend
  if (!trend) return {}

  const periods = trend.periods || []
  const laserSeries = trend.series?.find(s => /laser/i.test(s.name))
  const inkjetSeries = trend.series?.find(s => /inkjet/i.test(s.name))

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
      shadowColor: 'rgba(0, 74, 198, 0.08)',
      shadowBlur: 10,
    },
    legend: {
      data: ['激光', '喷墨'],
      bottom: 0,
      textStyle: { color: '#4b5563', fontSize: 12 },
    },
    grid: {
      left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: periods,
      axisLine: { lineStyle: { color: '#e7e5e4' } },
      axisLabel: { color: '#4b5563', fontSize: 12 },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: 'value', name: '激光', position: 'left',
        axisLine: { show: false },
        axisLabel: {
          color: '#004ac6',
          formatter: (val: number) => trendMetric.value === 'units' ? formatNumber(val) : `$${formatNumber(val)}`
        },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      },
      {
        type: 'value', name: '喷墨', position: 'right',
        axisLine: { show: false },
        axisLabel: {
          color: '#2563eb',
          formatter: (val: number) => trendMetric.value === 'units' ? formatNumber(val) : `$${formatNumber(val)}`
        },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '激光', type: 'bar', yAxisIndex: 0,
        data: trendMetric.value === 'units' ? laserSeries?.data : laserSeries?.data,
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
            { offset: 0, color: '#004ac6' },
            { offset: 1, color: '#2563eb' },
          ] },
          shadowColor: 'rgba(0, 74, 198, 0.2)', shadowBlur: 8,
        },
        barWidth: '30%', barCategoryGap: '30%',
      },
      {
        name: '喷墨', type: 'bar', yAxisIndex: 1,
        data: trendMetric.value === 'units' ? inkjetSeries?.data : inkjetSeries?.data,
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
            { offset: 0, color: '#2563eb' },
            { offset: 1, color: '#60a5fa' },
          ] },
          shadowColor: 'rgba(37, 99, 235, 0.2)', shadowBlur: 8,
        },
        barWidth: '30%', barCategoryGap: '30%',
      },
    ],
  }
})

const regionChartOption = computed(() => {
  const trend = overviewData.value?.trend
  if (!trend) return {}

  const regions = trend.series?.filter(s => !/laser/i.test(s.name) && !/inkjet/i.test(s.name)) || []

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
    },
    legend: {
      data: regions.map(r => r.name),
      bottom: 0,
      textStyle: { color: '#4b5563', fontSize: 12 },
    },
    grid: {
      left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: trend.periods || [],
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
    series: regions.map((r, idx) => ({
      name: r.name,
      type: 'bar',
      stack: 'total',
      data: r.data,
      itemStyle: {
        color: WEB3_COLORS[idx % WEB3_COLORS.length],
        borderRadius: 0,
      },
      emphasis: { focus: 'series' },
    })),
  }
})

const brandShareChartOption = computed(() => {
  const brands = overviewData.value?.brands || []
  if (!brands.length) return {}

  const topBrands = brands.slice(0, 8)

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
      },
      legend: {
        orient: 'vertical', right: 10, top: 'center',
        textStyle: { color: '#4b5563', fontSize: 12 },
      },
      series: [{
        type: 'pie',
        radius: ['65%', '85%'],
        center: ['35%', '50%'],
        data: topBrands.map((b, i) => ({
          name: b.name,
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
          itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 74, 198, 0.2)' },
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
    },
    grid: {
      left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: topBrands.map(b => b.name),
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
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: WEB3_COLORS[i % WEB3_COLORS.length] },
              { offset: 1, color: WEB3_COLORS[i % WEB3_COLORS.length] + 'aa' },
            ],
          },
          shadowColor: 'rgba(0, 74, 198, 0.15)', shadowBlur: 6,
        },
      })),
      barWidth: '50%',
    }],
  }
})

const formChartOption = computed(() => {
  const form = overviewData.value?.form
  if (!form) return {}

  const items = [
    { name: 'MFP', units: form.mfp?.units || 0, share: form.mfp?.share || 0 },
    { name: 'Printer', units: form.printer?.units || 0, share: form.printer?.share || 0 },
  ]

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#44403c', fontSize: 12 },
    },
    grid: {
      left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: items.map(i => i.name),
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
    series: [{
      type: 'bar',
      data: items.map((item, i) => ({
        value: item.units,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: WEB3_COLORS[i] },
              { offset: 1, color: WEB3_COLORS[i] + 'aa' },
            ],
          },
        },
      })),
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        formatter: (params: { value: number }) => `${((params.value / (items.reduce((s, i) => s + i.units, 0) || 1)) * 100).toFixed(1)}%`,
        color: '#4b5563', fontSize: 12,
      },
    }],
  }
})

// ==================== 方法 ====================
function formatNumber(val: number | string | undefined | null): string {
  const num = Number(val)
  if (isNaN(num)) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toLocaleString()
}

function getChangeIcon(val: number | string | undefined): string {
  const num = Number(val)
  if (num > 0) return '↑'
  if (num < 0) return '↓'
  return '→'
}

function getChangeClass(val: number | string | undefined): string {
  const num = Number(val)
  if (num > 0) return 'positive'
  if (num < 0) return 'negative'
  return 'neutral'
}

function handleCategoryChange(category: ProductType) {
  currentCategory.value = category
  idcStore.setProductType(category)
  loadData()
}

function handleFilterConfirm() {
  loadData()
}

function handleDrillRegion() {
  router.push('/idc/geography')
}

async function handleRefresh() {
  await loadData()
  message.success('数据已刷新')
}

function removeFilter(key: string) {
  idcStore.updateFilter(key as keyof typeof filters.value, [])
}

function resetFilters() {
  idcStore.resetFilters()
}

function buildApiParams(): OverviewParams {
  const params: OverviewParams = {}
  const f = filters.value

  if (f.half_years?.length === 1) {
    params.half_year = f.half_years[0]
  } else if (f.years?.length === 1) {
    params.year = f.years[0]
  }

  params.product_type = currentCategory.value
  params.top_n_brands = 10
  params.top_n_countries = 10
  params.trend_periods = 6

  return params
}

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const res = await idcApi.getOverview(buildApiParams())
    if (res.success && res.data) {
      overviewData.value = res.data
    } else {
      error.value = res.error?.message || '加载数据失败'
    }
  } catch (e) {
    console.error('加载数据失败:', e)
    error.value = (e as Error).message
    message.error('加载数据失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await idcStore.loadFilterOptions()
  await loadData()
})

watch(hasActiveFilters, () => {
  loadData()
})
</script>

<style scoped>
.idc-overview-view {
  /* layout handled by .page-container */
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
  border-color: rgba(37, 99, 235, 0.12);
  box-shadow:
    0 20px 25px -5px rgba(37, 99, 235, 0.05),
    0 8px 10px -6px rgba(37, 99, 235, 0.03);
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
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(37, 99, 235, 0.03));
  border-color: rgba(37, 99, 235, 0.25);
  transform: translateY(-2px) scale(1.02);
}
.cat-mini-tab.active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.cat-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
}

/* 品类占比条 */
.share-bar-container { margin-bottom: 24px; }

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
.share-bar-fill.laser { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
.share-bar-fill.inkjet { background: linear-gradient(135deg, #0891B2, #06B6D4); }

.share-bar-label {
  font-size: 13px; font-weight: 600;
  color: white; white-space: nowrap;
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
  width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px; flex-shrink: 0;
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
  flex: 1; min-width: 0;
}
.card-title {
  font-size: 13px; font-weight: 600;
  color: #6b7280; margin-bottom: 8px;
}
.card-stats {
  display: flex; gap: 16px; margin-bottom: 8px;
}
.stat-item {
  display: flex; flex-direction: column;
}
.stat-item.highlight .stat-value {
  color: #3b82f6; font-size: 18px;
}
.stat-value {
  font-size: 16px; font-weight: 700; color: #111827;
}
.stat-label {
  font-size: 10px; color: #9ca3af;
}
.card-change {
  display: inline-flex; align-items: center; gap: 2px;
  font-size: 12px; font-weight: 600;
  padding: 2px 8px; border-radius: 12px;
}
.card-change.positive { background: #dcfce7; color: #16a34a; }
.card-change.negative { background: #fee2e2; color: #dc2626; }
.card-change.neutral { background: #f3f4f6; color: #6b7280; }
.change-icon { font-size: 10px; }

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
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px; flex-shrink: 0;
}
.kpi-mini-icon.units { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #3b82f6; }
.kpi-mini-icon.value { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #16a34a; }
.kpi-mini-icon.asp { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #d97706; }
.kpi-mini-icon.models { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); color: #9333ea; }
.kpi-mini-icon.countries { background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%); color: #0d9488; }

.kpi-mini-content { flex: 1; min-width: 0; }
.kpi-mini-value { font-size: 16px; font-weight: 700; color: #111827; }
.kpi-mini-label { font-size: 11px; color: #6b7280; }

.kpi-mini-change {
  font-size: 12px; font-weight: 600;
  padding: 4px 8px; border-radius: 8px; white-space: nowrap;
}
.kpi-mini-change.positive { background: #dcfce7; color: #16a34a; }
.kpi-mini-change.negative { background: #fee2e2; color: #dc2626; }

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
.chart-card.chart-large { grid-column: 1 / -1; }

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.chart-title {
  display: flex; align-items: center; gap: 8px;
}
.chart-title h3 {
  font-size: 15px; font-weight: 600;
  color: #111827; margin: 0;
}
.chart-tip-icon {
  color: #9ca3af; cursor: help; display: flex; align-items: center;
}
.chart-controls { display: flex; gap: 8px; }
.chart-body { min-height: 0; }

/* 底部网格 */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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
  font-size: 16px; font-weight: 600;
  color: #111827; margin: 0;
}
.section-tabs { display: flex; gap: 4px; }
.section-tab {
  padding: 6px 16px;
  background: #f3f4f6; border: none;
  border-radius: 20px; cursor: pointer;
  font-size: 13px; color: #6b7280;
  transition: all 0.2s;
}
.section-tab:hover { background: #e5e7eb; }
.section-tab.active { background: #3b82f6; color: white; }

/* 渠道结构 */
.channel-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}
.channel-bar { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.channel-bar-item {
  display: flex; align-items: center; gap: 12px;
}
.channel-bar-fill {
  height: 32px; border-radius: 8px;
  min-width: 40px;
  display: flex; align-items: center; justify-content: center;
  transition: width 0.6s ease;
}
.channel-bar-item.direct .channel-bar-fill { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
.channel-bar-item.indirect .channel-bar-fill { background: linear-gradient(135deg, #0891B2, #06B6D4); }
.channel-bar-label { font-size: 13px; font-weight: 600; color: #475569; }

/* 骨架屏 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skeleton-text { height: 16px; margin-bottom: 8px; }
.skeleton-text.w-30 { width: 30%; }
.skeleton-text.w-40 { width: 40%; }
.skeleton-text.w-50 { width: 50%; }
.skeleton-text.w-60 { width: 60%; }
.skeleton-title { width: 120px; height: 24px; }
.skeleton-tabs { width: 160px; height: 32px; border-radius: 16px; }
.skeleton-bar { width: 100%; height: 44px; margin-bottom: 16px; border-radius: 14px; }
.skeleton-icon { width: 48px; height: 48px; border-radius: 12px; }
.skeleton-card {
  background: white; border-radius: 20px;
  padding: 24px; border: 1px solid #e5e7eb;
}
.skeleton-card-inner {
  background: #f9fafb; border-radius: 12px;
  padding: 20px; display: flex; gap: 16px;
}
.skeleton-kpi {
  height: 72px; border-radius: 12px;
  background: white; border: 1px solid #e5e7eb;
}
.skeleton-chart { width: 100%; height: 320px; border-radius: 12px; }
.skeleton-table { width: 100%; height: 300px; border-radius: 12px; }

/* 错误提示 */
.error-banner {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.06));
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px; color: #dc2626; font-size: 13px;
}
.error-banner svg { flex-shrink: 0; }
.error-banner span { flex: 1; }
.error-banner .n-button { flex-shrink: 0; }

/* 过渡动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 响应式 */
@media (max-width: 1400px) {
  .category-detail-grid { grid-template-columns: 1fr; }
  .global-kpi-strip { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1000px) {
  .charts-grid { grid-template-columns: 1fr; }
  .bottom-grid { grid-template-columns: 1fr; }
  .global-kpi-strip { grid-template-columns: repeat(2, 1fr); }
}
</style>
