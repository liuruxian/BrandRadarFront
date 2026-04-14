<template>
  <div class="idc-product">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h1>型号对标分析</h1>
        <p class="page-desc">机型级参数对比与市场表现分析</p>
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

    <!-- 型号搜索与选择 -->
    <div class="search-section">
      <!-- 品类筛选 -->
      <div class="category-filter">
        <n-radio-group v-model:value="searchCategory">
          <n-radio-button value="all">全部</n-radio-button>
          <n-radio-button value="laser">激光打印机</n-radio-button>
          <n-radio-button value="inkjet">喷墨打印机</n-radio-button>
        </n-radio-group>
      </div>

      <n-input-group>
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索型号名称或产品品牌..."
          clearable
          @keyup.enter="handleSearch"
        />
        <n-button type="primary" :loading="searchLoading" @click="handleSearch">
          搜索
        </n-button>
      </n-input-group>

      <!-- 搜索过滤器 -->
      <div class="search-filters">
        <n-select
          v-model:value="searchFilters.brand"
          :options="brandOptions"
          placeholder="品牌"
          clearable
          filterable
          style="width: 150px"
        />
        <n-select
          v-model:value="searchFilters.product"
          :options="productOptions"
          placeholder="产品类型"
          clearable
          style="width: 150px"
        />
        <n-select
          v-model:value="searchFilters.format"
          :options="formatOptions"
          placeholder="格式"
          clearable
          style="width: 120px"
        />
        <n-select
          v-model:value="searchFilters.product_category"
          :options="categoryOptions"
          placeholder="产品类别"
          clearable
          style="width: 150px"
        />
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div class="results-header">
        <span>找到 {{ searchResults.length }} 个型号</span>
        <n-button text size="small" @click="searchResults = []">清除</n-button>
      </div>
      <div class="results-list">
        <div
          v-for="item in searchResults"
          :key="item.model_key"
          class="result-item"
          :class="{ selected: selectedModels.includes(item.model_key) }"
          @click="toggleModel(item.model_key)"
        >
          <div class="result-checkbox">
            <n-checkbox :checked="selectedModels.includes(item.model_key)" />
          </div>
          <div class="result-info">
            <div class="result-brand">{{ item.brand }}</div>
            <div class="result-model">{{ item.model_name }}</div>
            <div class="result-meta">
              <n-tag size="small" :type="getCategoryTagType(item.product)">
                {{ getCategoryLabel(item.product) }}
              </n-tag>
              <n-tag size="small">{{ item.product_category }}</n-tag>
              <n-tag size="small">{{ item.format }}</n-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 已选择的型号 -->
    <div v-if="selectedModels.length > 0" class="selected-section">
      <div class="selected-header">
        <span>已选择 {{ selectedModels.length }} 个型号</span>
        <n-button size="small" @click="selectedModels = []">清除全部</n-button>
      </div>
      <div class="selected-chips">
        <n-tag
          v-for="key in selectedModels"
          :key="key"
          closable
          @close="removeModel(key)"
        >
          {{ key.split('_')[0] }} - {{ key.split('_')[1] }}
        </n-tag>
      </div>
      <n-button
        type="primary"
        :disabled="selectedModels.length < 2 || selectedModels.length > 4"
        :loading="compareLoading"
        @click="handleCompare"
      >
        开始对比
      </n-button>
    </div>

    <!-- 对比结果 -->
    <div v-if="compareResult" class="compare-results">
      <!-- 标签页 -->
      <n-tabs v-model:value="activeTab" type="line">
        <n-tab-pane name="spec" tab="参数对比">
          <div class="spec-compare">
            <!-- 基础信息 -->
            <div class="spec-section">
              <h4>基础信息</h4>
              <n-table :columns="specColumns.basic_info" :data="specData.basic_info" :bordered="false" size="small" />
            </div>

            <!-- 速度规格 -->
            <div class="spec-section">
              <h4>速度规格</h4>
              <n-table :columns="specColumns.speed_specs" :data="specData.speed_specs" :bordered="false" size="small" />
            </div>

            <!-- 功能配置 -->
            <div class="spec-section">
              <h4>功能配置</h4>
              <n-table :columns="specColumns.function_specs" :data="specData.function_specs" :bordered="false" size="small" />
            </div>

            <!-- 耗材参数 -->
            <div class="spec-section">
              <h4>耗材参数</h4>
              <n-table :columns="specColumns.consumable_specs" :data="specData.consumable_specs" :bordered="false" size="small" />
            </div>

            <!-- 物理规格 -->
            <div class="spec-section">
              <h4>物理规格</h4>
              <n-table :columns="specColumns.physical_specs" :data="specData.physical_specs" :bordered="false" size="small" />
            </div>

            <!-- 生产级别 -->
            <div class="spec-section">
              <h4>生产级别</h4>
              <n-table :columns="specColumns.production_specs" :data="specData.production_specs" :bordered="false" size="small" />
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="market" tab="市场表现">
          <div class="market-compare">
            <div class="market-chart">
              <BaseChart :option="marketCompareOption" style="height: 300px" />
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="region" tab="区域分布">
          <div class="region-compare">
            <BaseChart :option="regionDistributionOption" style="height: 400px" />
          </div>
        </n-tab-pane>

        <n-tab-pane name="channel" tab="渠道结构">
          <div class="channel-compare">
            <BaseChart :option="channelDistributionOption" style="height: 400px" />
          </div>
        </n-tab-pane>

        <n-tab-pane name="trend" tab="时间趋势">
          <div class="trend-compare">
            <BaseChart :option="trendDistributionOption" style="height: 400px" />
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- 空状态 -->
    <div v-if="!compareResult && selectedModels.length === 0" class="empty-state">
      <n-empty description="请搜索并选择 2-4 个型号进行对比">
        <template #icon>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </template>
      </n-empty>
    </div>

    <!-- 筛选抽屉 -->
    <IDCFiltersDrawer
      v-model:visible="showFilterDrawer"
      title="筛选条件"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NButton,
  NInput,
  NInputGroup,
  NSelect,
  NCheckbox,
  NTag,
  NTabs,
  NTabPane,
  NTable,
  NEmpty,
  useMessage,
} from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useIDCStore } from '@/stores/idcStore'
import { idcMockApi as idcApi } from '@/api/idcMockApi'
import type {
  ProductSearchItem,
  ProductCompareData,
} from '@/api/idcApiTypes'
import BaseChart from '@/components/idc/BaseChart.vue'
import IDCFiltersDrawer from '@/components/idc/IDCFiltersDrawer.vue'

const message = useMessage()
const idcStore = useIDCStore()
const { filterOptions } = storeToRefs(idcStore)

// ==================== State ====================
const showFilterDrawer = ref(false)
const searchKeyword = ref('')
const searchLoading = ref(false)
const searchResults = ref<ProductSearchItem[]>([])
const selectedModels = ref<string[]>([])
const compareLoading = ref(false)
const compareResult = ref<ProductCompareData | null>(null)
const activeTab = ref('spec')

const searchFilters = ref({
  brand: null as string | null,
  product: null as string | null,
  format: null as string | null,
  product_category: null as string | null,
})

// 品类筛选状态
const searchCategory = ref<'all' | 'laser' | 'inkjet'>('all')

// ==================== Options ====================
const brandOptions = computed(() => {
  const brands = filterOptions.value.brands || []
  return brands.map((b) => ({ label: b.label, value: b.value }))
})

const productOptions = computed(() => {
  const products = filterOptions.value.products || []
  return products.map((p) => ({ label: p.label, value: p.value }))
})

const formatOptions = computed(() => {
  const formats = filterOptions.value.formats || []
  return formats.map((f) => ({ label: f.label, value: f.value }))
})

const categoryOptions = computed(() => {
  const categories = filterOptions.value.product_categories || []
  return categories.map((c) => ({ label: c.label, value: c.value }))
})

// ==================== Spec Columns ====================
const specColumns = computed(() => {
  const models = selectedModels.value.map((k) => k.split('_')[1])
  const columns = [{ title: '参数项', key: 'param' }].concat(
    models.map((m) => ({ title: m, key: m }))
  )
  return {
    basic_info: columns,
    speed_specs: columns,
    function_specs: columns,
    consumable_specs: columns,
    physical_specs: columns,
    production_specs: columns,
  }
})

// ==================== Spec Data ====================
const specData = computed(() => {
  if (!compareResult.value?.spec_matrix) {
    return {
      basic_info: [],
      speed_specs: [],
      function_specs: [],
      consumable_specs: [],
      physical_specs: [],
      production_specs: [],
    }
  }

  const matrix = compareResult.value.spec_matrix
  return {
    basic_info: matrix.basic_info || [],
    speed_specs: matrix.speed_specs || [],
    function_specs: matrix.function_specs || [],
    consumable_specs: matrix.consumable_specs || [],
    physical_specs: matrix.physical_specs || [],
    production_specs: matrix.production_specs || [],
  }
})

// ==================== Charts ====================
const marketCompareOption = computed(() => {
  if (!compareResult.value?.market_compare) return {}

  const mc = compareResult.value.market_compare
  const models = selectedModels.value.map((k) => k.split('_')[1])

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['销量 (Units)', '销售额 (USD M)', 'ASP (USD/台)'], bottom: 0, textStyle: { color: '#374151' } },
    grid: { left: '3%', right: '10%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: models,
      axisLabel: { color: '#6b7280', rotate: 30 },
    },
    yAxis: [
      {
        type: 'value',
        name: '销量',
        position: 'left',
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      {
        type: 'value',
        name: 'ASP',
        position: 'right',
        axisLabel: { color: '#6b7280', formatter: (v: number) => `$${v}` },
        splitLine: { show: false },
        min: 0,
      },
    ],
    series: [
      {
        name: '销量 (Units)',
        type: 'bar',
        data: mc.units,
        itemStyle: { color: '#3B82F6' },
        tooltip: { valueFormatter: (v: number) => `${v.toLocaleString()} 台` },
      },
      {
        name: 'ASP (USD/台)',
        type: 'line',
        yAxisIndex: 1,
        data: mc.asp,
        smooth: true,
        itemStyle: { color: '#F59E0B' },
        showSymbol: true,
        tooltip: { valueFormatter: (v: number) => `$${v}/台` },
      },
    ],
  }
})

const regionDistributionOption = computed(() => {
  const data = compareResult.value?.region_distribution
  if (!data) return {}

  const regions = [...new Set(data.map((d: unknown[]) => d[0]))]

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: selectedModels.value.map((k) => k.split('_')[1]), bottom: 0, textStyle: { color: '#6b7280' } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: regions, axisLabel: { color: '#6b7280', rotate: 30 } },
    yAxis: { type: 'value', axisLabel: { color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: selectedModels.value.map((k, idx) => ({
      name: k.split('_')[1],
      type: 'bar',
      stack: 'total',
      data: data.filter((d: unknown[]) => d[0] === regions[idx]).map((d: unknown[]) => d[1]),
    })),
  }
})

const channelDistributionOption = computed(() => {
  const data = compareResult.value?.channel_distribution
  if (!data) return {}

  const channels = [...new Set(data.map((d: unknown[]) => d[0]))]

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: selectedModels.value.map((k) => k.split('_')[1]), bottom: 0, textStyle: { color: '#6b7280' } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: channels, axisLabel: { color: '#6b7280', rotate: 30 } },
    yAxis: { type: 'value', axisLabel: { color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: selectedModels.value.map((k) => ({
      name: k.split('_')[1],
      type: 'bar',
      data: data.filter((d: unknown[]) => d[0] === k.split('_')[1]).map((d: unknown[]) => d[1]),
    })),
  }
})

const trendDistributionOption = computed(() => {
  const trend = compareResult.value?.time_trend
  if (!trend) return {}

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: trend.series.map((s) => s.name), bottom: 0, textStyle: { color: '#6b7280' } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: trend.periods, axisLabel: { color: '#6b7280' } },
    yAxis: { type: 'value', axisLabel: { color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: trend.series.map((s, idx) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      showSymbol: false,
    })),
  }
})

// ==================== Methods ====================

/**
 * 获取品类标签类型
 */
function getCategoryTagType(product: string): 'info' | 'success' {
  if (product.toLowerCase().includes('laser')) return 'info'
  return 'success'
}

/**
 * 获取品类标签文本
 */
function getCategoryLabel(product: string): string {
  if (product.toLowerCase().includes('laser')) return '激光'
  if (product.toLowerCase().includes('inkjet')) return '喷墨'
  return '未知'
}

async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    message.warning('请输入搜索关键词')
    return
  }

  searchLoading.value = true
  try {
    const res = await idcApi.searchProducts({
      keyword: searchKeyword.value,
      brand: searchFilters.value.brand || undefined,
      product: searchFilters.value.product || undefined,
      format: searchFilters.value.format || undefined,
      product_category: searchFilters.value.product_category || undefined,
    })

    if (res.success && res.data) {
      searchResults.value = res.data
      message.success(`找到 ${res.data.length} 个型号`)
    }
  } catch (e) {
    message.error('搜索失败')
  } finally {
    searchLoading.value = false
  }
}

function toggleModel(modelKey: string) {
  const idx = selectedModels.value.indexOf(modelKey)
  if (idx === -1) {
    if (selectedModels.value.length >= 4) {
      message.warning('最多只能选择 4 个型号')
      return
    }
    selectedModels.value.push(modelKey)
  } else {
    selectedModels.value.splice(idx, 1)
  }
}

function removeModel(modelKey: string) {
  const idx = selectedModels.value.indexOf(modelKey)
  if (idx !== -1) {
    selectedModels.value.splice(idx, 1)
  }
}

async function handleCompare() {
  if (selectedModels.value.length < 2) {
    message.warning('请至少选择 2 个型号')
    return
  }

  compareLoading.value = true
  compareResult.value = null
  try {
    const res = await idcApi.compareProducts(selectedModels.value, 'spec', undefined)
    if (res.success && res.data) {
      compareResult.value = res.data
    }
  } catch (e) {
    message.error('对比分析失败')
  } finally {
    compareLoading.value = false
  }
}

// ==================== Lifecycle ====================
onMounted(async () => {
  await idcStore.loadFilterOptions()
})
</script>

<style scoped>
.idc-product {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: transparent;
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

.search-section {
  padding: 20px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.02),
    0 4px 6px -1px rgba(15, 23, 42, 0.02);
}

.category-filter {
  margin-bottom: 14px;
}

.search-filters {
  display: flex;
  gap: 14px;
  margin-top: 14px;
}

.search-results {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 20px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.02),
    0 4px 6px -1px rgba(15, 23, 42, 0.02);
}

.results-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  font-size: 14px;
  color: #64748B;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  background: #FAFBFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.result-item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.result-item.selected {
  border-color: #3B82F6;
  background: rgba(59, 130, 246, 0.1);
}

.result-checkbox {
  padding-top: 2px;
}

.result-info {
  flex: 1;
}

.result-brand {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
}

.result-model {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.result-meta {
  display: flex;
  gap: 6px;
}

.selected-section {
  padding: 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  color: #111827;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.compare-results {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 16px;
}

.spec-compare {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.spec-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.market-compare,
.region-compare,
.channel-compare,
.trend-compare {
  padding: 16px 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
}
</style>
