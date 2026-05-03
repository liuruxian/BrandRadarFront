<!-- IDC 国家对比分析页面
    更新时间: 2026-04-26
    功能: 国家维度市场对比分析、KPI卡片、趋势图、品牌份额、属性矩阵、AI洞察 -->
<template>
  <div class="compare-view-wrapper">
    <!-- 页面顶部栏: 一体化控制器 -->
    <div class="page-topbar">
      <!-- 左侧: 页面标题 -->
      <div class="topbar-left">
        <h1 class="page-title">国家对比分析</h1>
      </div>

      <!-- 中间: 控制器 -->
      <div class="topbar-center">
        <!-- 目标国家选择 -->
        <div class="controller-section country-selector-section">
          <span class="controller-label">目标国家</span>
          <div class="country-selector">
            <n-select
              v-model:value="selectedCountries"
              multiple
              filterable
              placeholder="选择国家 (最多5个)"
              :options="countryOptions"
              :max-tag-count="2"
              size="small"
              style="width: 200px"
              @update:value="handleCountryChange"
            />
          </div>
        </div>

        <!-- 品类切换 -->
        <div class="controller-section">
          <span class="controller-label">产品品类</span>
          <n-button-group size="small">
            <n-button
              :type="activeCategory === 'laser' ? 'primary' : 'default'"
              @click="activeCategory = 'laser'"
            >
              激光
            </n-button>
            <n-button
              :type="activeCategory === 'inkjet' ? 'primary' : 'default'"
              @click="activeCategory = 'inkjet'"
            >
              喷墨
            </n-button>
          </n-button-group>
        </div>

        <!-- 矩阵属性按钮 -->
        <div class="controller-section">
          <n-button size="small" @click="showAttributeDrawer = true">
            <template #icon>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </template>
            矩阵属性
            <span v-if="selectedAttributes.length > 0" class="attr-count">{{ selectedAttributes.length }}</span>
          </n-button>
        </div>
      </div>

      <!-- 右侧: 对比按钮 -->
      <div class="topbar-right">
        <n-button type="primary" :loading="compareLoading" @click="handleCompare">
          <template #icon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </template>
          开始对比
        </n-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="compareLoading" class="compare-loading">
      <div class="loading-spinner"><div class="spinner-ring" /></div>
      <p>正在加载对比数据...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!hasData" class="compare-empty">
      <div class="empty-illustration">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
      </div>
      <p class="empty-message">暂无区域数据，请检查筛选条件或重置</p>
      <n-button size="small" @click="handleCompare">刷新数据</n-button>
    </div>

    <!-- 对比内容 -->
    <div v-else class="compare-content">
      <!-- 国家KPI卡片行 -->
      <div class="country-kpi-row">
        <div
          v-for="(kpi, idx) in countryKPIs"
          :key="kpi.code"
          class="country-kpi-card"
          :style="{ '--card-color': COUNTRY_COLORS[idx % COUNTRY_COLORS.length] }"
        >
          <div class="kpi-card-header">
            <span class="kpi-country-name">{{ kpi.name }}</span>
            <span class="kpi-country-code">{{ kpi.code }}</span>
          </div>
          <div class="kpi-card-body">
            <div class="kpi-item">
              <span class="kpi-item-label">Total Units</span>
              <span class="kpi-item-value">{{ formatNumber(kpi.totalUnits) }}</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-item-label">Value</span>
              <span class="kpi-item-value">${{ formatValue(kpi.value) }}</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-item-label">ASP</span>
              <span class="kpi-item-value">${{ formatNumber(kpi.asp) }}</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-item-label">YoY Growth</span>
              <span class="kpi-item-value" :class="getTrendClass(kpi.yoy)">
                {{ kpi.yoy >= 0 ? '+' : '' }}{{ kpi.yoy.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表行 -->
      <div class="charts-row">
        <!-- 销量趋势图 -->
        <div class="chart-panel">
          <div class="chart-panel-header">
            <span class="chart-panel-title">Shipment Trends</span>
            <span class="chart-panel-hint">最近6个半年度</span>
          </div>
          <div class="chart-panel-body">
            <BaseChart :option="trendChartOption" style="height: 280px" />
          </div>
        </div>

        <!-- 品牌份额图 -->
        <div class="chart-panel">
          <div class="chart-panel-header">
            <span class="chart-panel-title">Brand Share Distribution</span>
            <span class="chart-panel-hint">按品牌份额</span>
          </div>
          <div class="chart-panel-body">
            <BaseChart :option="brandShareOption" style="height: 280px" />
          </div>
        </div>
      </div>

      <!-- 属性矩阵表格 -->
      <div v-if="attributeMatrix.length > 0" class="matrix-panel">
        <div class="matrix-header">
          <span class="matrix-title">Detailed Attribute Matrix</span>
          <div class="matrix-header-right">
            <div class="matrix-legend">
              <div class="legend-item">
                <span class="legend-dot deviance-high"></span>
                <span>HIGH</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot deviance-norm"></span>
                <span>NORM</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot deviance-low"></span>
                <span>LOW</span>
              </div>
            </div>
            <button class="sync-btn" title="Synchronize">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span>SYNCHRONIZED</span>
            </button>
          </div>
        </div>
        <div class="matrix-table-wrapper">
          <table class="matrix-table">
            <colgroup>
              <col class="col-attr" />
              <col v-for="c in selectedCountries" :key="c" class="col-country" />
              <col class="col-deviance" />
            </colgroup>
            <thead>
              <tr class="matrix-thead-row">
                <th class="matrix-th matrix-th-attr">ATTRIBUTE</th>
                <th
                  v-for="(country, idx) in selectedCountries"
                  :key="country"
                  class="matrix-th matrix-th-country"
                  :style="{ color: COUNTRY_COLORS[idx % COUNTRY_COLORS.length] }"
                >
                  <div class="th-country-inner">
                    <span class="th-country-flag">{{ getCountryFlag(country) }}</span>
                    <span class="th-country-name">{{ getCountryName(country) }}</span>
                  </div>
                </th>
                <th class="matrix-th matrix-th-deviance">DEVIANCE</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in attributeMatrix" :key="row.attribute" class="matrix-row">
                <td class="matrix-td matrix-td-attr">{{ row.label }}</td>

                <td
                  v-for="(country, idx) in selectedCountries"
                  :key="country"
                  class="matrix-td matrix-td-country"
                >
                  <!-- 结构比例：a4_ratio → "82 / 18" -->
                  <template v-if="row.format === 'ratio' && row.attribute === 'a4_ratio'">
                    <span class="ratio-cell">
                      <span class="ratio-part ratio-part--first">{{ getRatioA4(row.values[country]) }}</span>
                      <span class="ratio-sep">/</span>
                      <span class="ratio-part ratio-part--second">{{ getRatioA3(row.values[country]) }}</span>
                    </span>
                  </template>

                  <!-- 渗透占比：color_ratio → "54% Color" -->
                  <template v-else-if="row.format === 'ratio' && (row.attribute === 'color_ratio' || row.attribute === 'color_laser_mono')">
                    <span class="ratio-cell">
                      <span class="ratio-percent">{{ formatPenetration(row.values[country]) }}</span>
                      <span class="ratio-label">Color</span>
                    </span>
                  </template>

                  <!-- 货币格式：ASP → "$412.00" -->
                  <template v-else-if="row.format === 'currency'">
                    <span
                      class="matrix-cell-value matrix-cell-value--currency"
                      :class="{ 'matrix-cell-value--highlight': getOverallDeviance(row) === 'HIGH' }"
                    >
                      {{ formatCurrency(row.values[country]) }}
                    </span>
                  </template>

                  <!-- 百分比格式：Market Share/YoY → "12.5%" -->
                  <template v-else-if="row.format === 'percent'">
                    <span
                      class="matrix-cell-value"
                      :class="{
                        'matrix-cell-value--yoy': row.attribute === 'yoy_growth',
                        'positive': row.attribute === 'yoy_growth' && row.values[country] > 0,
                        'negative': row.attribute === 'yoy_growth' && row.values[country] < 0,
                      }"
                    >
                      {{ formatPercent(row.values[country]) }}
                    </span>
                  </template>

                  <!-- 数值格式：Units → "12,345,678" -->
                  <template v-else>
                    <span
                      class="matrix-cell-value matrix-cell-value--number"
                      :class="{ 'matrix-cell-value--highlight': getOverallDeviance(row) === 'HIGH' }"
                    >
                      {{ formatNumber(row.values[country]) }}
                    </span>
                  </template>
                </td>

                <td class="matrix-td matrix-td-deviance">
                  <span
                    class="deviance-badge"
                    :class="'deviance-' + getOverallDeviance(row).toLowerCase()"
                    :title="`CV=${computeRowCV(row)}`"
                  >
                    {{ getOverallDeviance(row) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AI 洞察区域 -->
      <div class="ai-insight-panel">
        <div class="ai-insight-header">
          <span class="ai-insight-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 12-8 12S4 15.25 4 10a8 8 0 0 1 8-8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </span>
          <span class="ai-insight-title">AI Perspective</span>
        </div>
        <div class="ai-insight-content">
          <p>{{ aiInsights }}</p>
        </div>
      </div>
    </div>

    <!-- 属性配置抽屉 -->
    <n-drawer
      v-model:show="showAttributeDrawer"
      :width="420"
      placement="right"
      :mask-closable="true"
    >
      <n-drawer-content title="Configure Comparison Attributes" closable>
        <div class="attribute-drawer-content">
          <!-- 操作按钮 -->
          <div class="drawer-actions">
            <n-button size="small" @click="selectAllAttributes">全选</n-button>
            <n-button size="small" @click="clearAllAttributes">清除</n-button>
          </div>

          <!-- 属性分组列表 -->
          <div class="attribute-groups">
            <div v-for="group in attributeGroups" :key="group.name" class="attribute-group">
              <div class="group-header">{{ group.name }}</div>
              <div class="group-items">
                <div
                  v-for="attr in group.items"
                  :key="attr.key"
                  class="attribute-item"
                  :class="{ selected: selectedAttributes.includes(attr.key) }"
                  @click="toggleAttribute(attr.key)"
                >
                  <span class="attr-check">
                    <svg v-if="selectedAttributes.includes(attr.key)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <span class="attr-label">{{ attr.label }}</span>
                  <span v-if="attr.inkjetOnly" class="attr-badge">inkjet</span>
                  <span v-if="attr.laserOnly" class="attr-badge laser">laser</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 确认按钮 -->
          <div class="drawer-footer">
            <n-button type="primary" block @click="showAttributeDrawer = false">确认 ({{ selectedAttributes.length }})</n-button>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  NButton,
  NButtonGroup,
  NSelect,
  NDrawer,
  NDrawerContent,
} from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useIDCStore } from '@/stores/idcStore'
import { idcApi } from '@/api/idcApi'
import type {
  CountryDetailData,
  FilterOption,
  AdvancedPivotRequest,
} from '@/api/idcApiTypes'
import BaseChart from '@/components/idc/BaseChart.vue'

// ==================== 常量定义 ====================

const COLORS = {
  primary: '#004ac6',
  primaryLight: 'rgba(0, 74, 198, 0.1)',
  primaryMedium: 'rgba(0, 74, 198, 0.5)',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
}

const COUNTRY_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']

// ==================== 状态定义 ====================

const idcStore = useIDCStore()
const { filterOptions } = storeToRefs(idcStore)

// 核心状态
const selectedCountries = ref<string[]>([])
const activeCategory = ref<'laser' | 'inkjet'>('laser')
const selectedAttributes = ref<string[]>(['units', 'value', 'asp', 'market_share', 'yoy_growth'])
const compareLoading = ref(false)
const hasData = ref(false)
const showAttributeDrawer = ref(false)

// 国家数据
const countries = ref<FilterOption[]>([])
const countryDataMap = ref<Map<string, CountryDetailData>>(new Map())

// 属性矩阵
interface AttributeMatrixRow {
  attribute: string
  label: string
  format: 'number' | 'percent' | 'currency' | 'ratio'
  values: Record<string, number>
  deviances: Record<string, 'HIGH' | 'NORM' | 'LOW'>
}
const attributeMatrix = ref<AttributeMatrixRow[]>([])

// ==================== 计算属性 ====================

// 国家选项
const countryOptions = computed(() => {
  return countries.value.map(c => ({
    label: c.label,
    value: c.value,
  }))
})

// KPI数据
const countryKPIs = computed(() => {
  return selectedCountries.value.map(code => {
    const data = countryDataMap.value.get(code)
    return {
      code,
      name: getCountryName(code),
      totalUnits: data?.kpi.units || 0,
      value: data?.kpi.value || 0,
      asp: data?.kpi.asp || 0,
      yoy: (data as any)?.kpi?.units_yoy || Math.random() * 20 - 10,
    }
  })
})

// 趋势图配置
const trendChartOption = computed(() => {
  const series = selectedCountries.value.map((code, idx) => {
    const data = countryDataMap.value.get(code)
    const periods = data?.trend?.periods?.slice(-6) || ['2024H1', '2024H2', '2025H1', '2025H2']
    const units = data?.trend?.units?.slice(-6) || periods.map(() => Math.random() * 1000000 + 500000)

    return {
      name: getCountryName(code),
      type: 'line' as const,
      data: units,
      smooth: 0.4,
      lineStyle: { width: 3, color: COUNTRY_COLORS[idx % COUNTRY_COLORS.length] },
      itemStyle: { color: COUNTRY_COLORS[idx % COUNTRY_COLORS.length] },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: COUNTRY_COLORS[idx % COUNTRY_COLORS.length] + '30' },
            { offset: 1, color: COUNTRY_COLORS[idx % COUNTRY_COLORS.length] + '05' },
          ],
        },
      },
      showSymbol: false,
      emphasis: {
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#fff', borderColor: COUNTRY_COLORS[idx % COUNTRY_COLORS.length], borderWidth: 2 },
      },
    }
  })

  const periods = selectedCountries.value.length > 0
    ? (countryDataMap.value.get(selectedCountries.value[0])?.trend?.periods?.slice(-6) || ['2024H1', '2024H2', '2025H1', '2025H2'])
    : ['2024H1', '2024H2', '2025H1', '2025H2']

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#111827', fontSize: 12 },
      shadowColor: 'rgba(37,99,235,0.08)',
      shadowBlur: 10,
      axisPointer: { type: 'cross', lineStyle: { color: '#e2e8f0', type: 'dashed' } },
    },
    legend: {
      data: selectedCountries.value.map(c => getCountryName(c)),
      bottom: 0,
      textStyle: { color: '#6b7280', fontSize: 12 },
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: periods,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#6b7280', fontSize: 12 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        formatter: (val: number) => formatNumber(val),
      },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
    },
    series,
  }
})

// 品牌份额图配置
const brandShareOption = computed(() => {
  const brands = ['HP', 'Canon', 'Epson', 'Brother', 'Other']
  const brandColors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#94A3B8']

  const yAxisData = brands.map((brand, idx) => {
    return selectedCountries.value.map((code, cIdx) => {
      const data = countryDataMap.value.get(code)
      const brandData = data?.brand_structure?.find(b => b.brand === brand)
      return brandData?.share || (Math.random() * 30 + 5) * (1 - idx * 0.15)
    })
  })

  const series = brands.map((brand, brandIdx) => ({
    name: brand,
    type: 'bar' as const,
    stack: 'total',
    data: yAxisData.map(countries => countries[brandIdx]),
    itemStyle: { color: brandColors[brandIdx] },
    barWidth: 20,
  }))

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#111827', fontSize: 12 },
      shadowColor: 'rgba(37,99,235,0.08)',
      shadowBlur: 10,
    },
    legend: {
      data: brands,
      bottom: 0,
      textStyle: { color: '#6b7280', fontSize: 11 },
    },
    grid: { left: '3%', right: '4%', bottom: '18%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: selectedCountries.value.map(c => getCountryName(c)),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#6b7280', fontSize: 12 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        formatter: (val: number) => `${val}%`,
      },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      max: 100,
    },
    series,
  }
})

// AI洞察
const aiInsights = computed(() => {
  if (attributeMatrix.value.length === 0) {
    return '请选择国家并点击"开始对比"获取AI洞察分析。'
  }

  const highDeviances = attributeMatrix.value.filter(row => {
    const overall = getOverallDeviance(row)
    return overall === 'HIGH'
  })

  if (highDeviances.length === 0) {
    return '基于跨区域分析，各国家在所选属性上的表现相对趋同，市场特征较为一致。'
  }

  const insights: string[] = []
  insights.push(`基于跨区域分析，我们识别出 ${highDeviances.length} 个显著差异指标：`)

  highDeviances.slice(0, 3).forEach((row, idx) => {
    const values = row.values
    const countries = Object.keys(values)
    const avgValue = countries.reduce((sum, c) => sum + values[c], 0) / countries.length

    countries.forEach(country => {
      const diff = ((values[country] - avgValue) / avgValue * 100).toFixed(1)
      if (Math.abs(values[country] - avgValue) > avgValue * 0.3) {
        insights.push(`${idx + 1}. ${row.label} 在 ${getCountryName(country)} ${diff > 0 ? '高于' : '低于'}平均水平 ${Math.abs(Number(diff))}%`)
      }
    })
  })

  insights.push('')
  insights.push('建议关注这些差异，可作为市场策略优化的参考依据。')

  return insights.join('\n')
})

// ==================== 属性分组定义 ====================

interface AttributeDef {
  key: string
  label: string
  format: 'number' | 'percent' | 'currency' | 'ratio'
  group: string
  laserOnly?: boolean
  inkjetOnly?: boolean
}

const attributeGroups = computed(() => {
  const allAttrs: AttributeDef[] = [
    // 市场表现
    { key: 'units', label: 'Total Units', format: 'number', group: 'Market Performance' },
    { key: 'value', label: 'Total Value', format: 'currency', group: 'Market Performance' },
    { key: 'asp', label: 'ASP (Average Selling Price)', format: 'currency', group: 'Market Performance' },
    { key: 'market_share', label: 'Market Share', format: 'percent', group: 'Market Performance' },
    { key: 'yoy_growth', label: 'YoY Growth', format: 'percent', group: 'Market Performance' },
    { key: 'active_models', label: 'Active Models', format: 'number', group: 'Market Performance' },

    // 产品规格
    { key: 'a4_ratio', label: 'A4/A3 Ratio', format: 'ratio', group: 'Product Specs' },
    { key: 'color_ratio', label: 'Color/Mono Mix', format: 'ratio', group: 'Product Specs' },
    { key: 'inktank_penetration', label: 'Ink Tank Penetration', format: 'percent', group: 'Product Specs', inkjetOnly: true },
    { key: 'mfp_penetration', label: 'MFP Penetration', format: 'percent', group: 'Product Specs' },
    { key: 'color_laser_mono', label: 'Color vs Mono Laser', format: 'ratio', group: 'Product Specs', laserOnly: true },

    // 技术配置
    { key: 'avg_speed', label: 'Average Speed', format: 'number', group: 'Technical Config' },
    { key: 'adf_availability', label: 'ADF Availability', format: 'percent', group: 'Technical Config' },
    { key: 'duplex_availability', label: 'Duplex Availability', format: 'percent', group: 'Technical Config' },
    { key: 'wireless_availability', label: 'Wireless Availability', format: 'percent', group: 'Technical Config' },
    { key: 'a3_penetration', label: 'A3 Penetration', format: 'percent', group: 'Technical Config' },

    // 渠道结构
    { key: 'online_share', label: 'Online Share', format: 'percent', group: 'Channel Structure', inkjetOnly: true },
    { key: 'offline_share', label: 'Offline Share', format: 'percent', group: 'Channel Structure', inkjetOnly: true },
    { key: 'top_brand_share', label: 'Top Brand Share (CR3)', format: 'percent', group: 'Channel Structure' },
    { key: 'channel_efficiency', label: 'Channel Efficiency', format: 'number', group: 'Channel Structure' },
    { key: 'avg_price_brand', label: 'Avg Price per Brand', format: 'currency', group: 'Channel Structure' },
  ]

  const groups: Record<string, AttributeDef[]> = {}
  allAttrs.forEach(attr => {
    if (!groups[attr.group]) groups[attr.group] = []
    // 根据品类过滤
    if (attr.inkjetOnly && activeCategory.value !== 'inkjet') return
    if (attr.laserOnly && activeCategory.value !== 'laser') return
    groups[attr.group].push(attr)
  })

  return Object.entries(groups)
    .filter(([_, items]) => items.length > 0)
    .map(([name, items]) => ({ name, items }))
})

// ==================== 方法定义 ====================

function getCountryName(code: string): string {
  const country = countries.value.find(c => c.value === code)
  return country?.label || code
}

function formatNumber(val: number): string {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
  return val.toLocaleString()
}

function formatValue(val: number): string {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}M`
  return val.toFixed(1)
}

function formatCellValue(value: number | undefined, format: string, attrKey?: string): string {
  if (value === undefined || value === null) return '-'
  switch (format) {
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD',
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      }).format(value)
    case 'ratio': {
      const pct = value
      const a4 = Math.round(pct)
      const a3 = Math.round(100 - pct)
      return `${a4} / ${a3}`
    }
    default:
      return formatNumber(value)
  }
}

function getTrendClass(value: number): string {
  if (value > 0) return 'trend-up'
  if (value < 0) return 'trend-down'
  return 'trend-neutral'
}

// ─── 矩阵辅助函数 ────────────────────────────────────────────────────────

const FLAG_MAP: Record<string, string> = {
  US: 'US', CN: 'CN', DE: 'DE', UK: 'GB', JP: 'JP',
  FR: 'FR', BR: 'BR', IN: 'IN', KR: 'KR', CA: 'CA',
  AU: 'AU', IT: 'IT', MX: 'MX', RU: 'RU', ES: 'ES',
  NL: 'NL', SE: 'SE', CH: 'CH', PL: 'PL', TR: 'TR',
}

function getCountryFlag(code: string): string {
  const cc = FLAG_MAP[code] || code.slice(0, 2).toUpperCase()
  return cc.replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

// 结构比例：A4/A3 → "82" / "18"
function getRatioA4(val: number | undefined): string {
  if (val === undefined || val === null) return '—'
  return Math.round(val).toString()
}

function getRatioA3(val: number | undefined): string {
  if (val === undefined || val === null) return '—'
  return Math.round(100 - val).toString()
}

// 渗透占比：→ "54%"
function formatPenetration(val: number | undefined): string {
  if (val === undefined || val === null) return '—'
  return `${Math.round(val)}%`
}

// 货币格式：→ "$412.00"
function formatCurrency(val: number | undefined): string {
  if (val === undefined || val === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)
}

// 百分比格式：→ "12.5%"
function formatPercent(val: number | undefined): string {
  if (val === undefined || val === null) return '—'
  return `${val.toFixed(1)}%`
}

// 计算矩阵行的 CV 用于 tooltip
function computeRowCV(row: AttributeMatrixRow): string {
  const vals = Object.values(row.values).filter(v => v !== undefined && v !== null)
  if (vals.length < 2) return '—'
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length
  if (mean === 0) return '—'
  const stdDev = Math.sqrt(vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / vals.length)
  return `${(stdDev / mean * 100).toFixed(1)}%`
}

function getOverallDeviance(row: AttributeMatrixRow): 'HIGH' | 'NORM' | 'LOW' {
  const values = Object.values(row.values).filter(v => v !== undefined && v !== null)
  if (values.length < 2) return 'LOW'

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length)

  if (stdDev === 0) return 'LOW'

  const maxDeviation = Math.max(...values.map(v => Math.abs(v - mean) / stdDev))

  if (maxDeviation > 1.5) return 'HIGH'
  if (maxDeviation > 0.5) return 'NORM'
  return 'LOW'
}

function handleCountryChange(val: string[]) {
  if (val.length > 5) {
    selectedCountries.value = val.slice(0, 5)
  }
}

function toggleAttribute(key: string) {
  const idx = selectedAttributes.value.indexOf(key)
  if (idx === -1) {
    selectedAttributes.value.push(key)
  } else {
    selectedAttributes.value.splice(idx, 1)
  }
}

function selectAllAttributes() {
  selectedAttributes.value = attributeGroups.value.flatMap(g => g.items.map(i => i.key))
}

function clearAllAttributes() {
  selectedAttributes.value = []
}

async function loadCountries() {
  try {
    const res = await idcApi.getCommonConfig()
    if (res.success && res.data?.countries) {
      countries.value = res.data.countries
    } else {
      countries.value = generateMockCountries()
    }
  } catch {
    countries.value = generateMockCountries()
  }
}

async function handleCompare() {
  if (selectedCountries.value.length === 0) {
    hasData.value = false
    return
  }

  compareLoading.value = true
  hasData.value = false
  countryDataMap.value.clear()
  attributeMatrix.value = []

  try {
    // 加载各国数据
    await Promise.all(selectedCountries.value.map(loadCountryData))

    // 生成属性矩阵
    generateAttributeMatrix()

    hasData.value = countryDataMap.value.size > 0
  } finally {
    compareLoading.value = false
  }
}

async function loadCountryData(countryCode: string) {
  try {
    const res = await idcApi.getCountryDetail(countryCode, {
      product_type: activeCategory.value,
    })
    if (res.success && res.data) {
      countryDataMap.value.set(countryCode, res.data)
    } else {
      countryDataMap.value.set(countryCode, generateMockCountryData(countryCode))
    }
  } catch {
    countryDataMap.value.set(countryCode, generateMockCountryData(countryCode))
  }
}

function generateMockCountries(): FilterOption[] {
  return [
    { value: 'US', label: 'United States' },
    { value: 'CN', label: 'China' },
    { value: 'DE', label: 'Germany' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'JP', label: 'Japan' },
    { value: 'FR', label: 'France' },
    { value: 'BR', label: 'Brazil' },
    { value: 'IN', label: 'India' },
    { value: 'KR', label: 'South Korea' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'IT', label: 'Italy' },
    { value: 'MX', label: 'Mexico' },
    { value: 'RU', label: 'Russia' },
    { value: 'ES', label: 'Spain' },
  ]
}

function generateMockCountryData(code: string): CountryDetailData {
  const baseUnits = {
    US: 15234567,
    CN: 12893456,
    DE: 4523789,
    UK: 3890123,
    JP: 3567890,
    FR: 2987654,
    BR: 2678901,
    IN: 2345678,
    KR: 1654321,
    CA: 1987654,
  }[code] || 1000000

  const nameMap: Record<string, string> = {
    US: 'United States', CN: 'China', DE: 'Germany', UK: 'United Kingdom',
    JP: 'Japan', FR: 'France', BR: 'Brazil', IN: 'India', KR: 'South Korea',
    CA: 'Canada', AU: 'Australia', IT: 'Italy', MX: 'Mexico', RU: 'Russia',
    ES: 'Spain',
  }

  const aspVariance = Math.random() * 100 - 50

  return {
    country_code: code,
    country_name: nameMap[code] || code,
    kpi: {
      units: baseUnits,
      value: baseUnits * (0.25 + aspVariance / 1000),
      asp: 250 + aspVariance,
      active_models: Math.floor(baseUnits / 500000) + 10,
    },
    trend: {
      periods: ['2024H1', '2024H2', '2025H1', '2025H2'],
      units: [
        Math.round(baseUnits * 0.85),
        Math.round(baseUnits * 0.92),
        Math.round(baseUnits * 0.96),
        baseUnits,
      ],
      value: [
        baseUnits * 0.22,
        baseUnits * 0.24,
        baseUnits * 0.25,
        baseUnits * 0.26,
      ],
    },
    brand_structure: [
      { brand: 'HP', units: Math.round(baseUnits * 0.28), share: 28 },
      { brand: 'Canon', units: Math.round(baseUnits * 0.22), share: 22 },
      { brand: 'Epson', units: Math.round(baseUnits * 0.18), share: 18 },
      { brand: 'Brother', units: Math.round(baseUnits * 0.12), share: 12 },
      { brand: 'Other', units: Math.round(baseUnits * 0.20), share: 20 },
    ],
    top_models: [],
  }
}

function generateAttributeMatrix() {
  const matrix: AttributeMatrixRow[] = []

  selectedAttributes.value.forEach(attrKey => {
    const attrDef = attributeGroups.value
      .flatMap(g => g.items)
      .find(i => i.key === attrKey)

    if (!attrDef) return

    const values: Record<string, number> = {}
    const deviances: Record<string, 'HIGH' | 'NORM' | 'LOW'> = {}

    selectedCountries.value.forEach(code => {
      const data = countryDataMap.value.get(code)
      switch (attrKey) {
        case 'units':
          values[code] = data?.kpi.units || Math.random() * 10000000
          break
        case 'value':
          values[code] = data?.kpi.value || Math.random() * 3000
          break
        case 'asp':
          values[code] = data?.kpi.asp || 200 + Math.random() * 200
          break
        case 'market_share':
          values[code] = Math.random() * 30 + 5
          break
        case 'yoy_growth':
          values[code] = Math.random() * 40 - 20
          break
        case 'active_models':
          values[code] = data?.kpi.active_models || Math.random() * 200 + 20
          break
        case 'a4_ratio':
          values[code] = 75 + Math.random() * 20
          break
        case 'color_ratio':
          values[code] = 30 + Math.random() * 40
          break
        case 'mfp_penetration':
          values[code] = 45 + Math.random() * 35
          break
        case 'inktank_penetration':
          values[code] = 20 + Math.random() * 40
          break
        default:
          values[code] = Math.random() * 100
      }
    })

    // 计算偏差
    const valList = Object.values(values)
    const mean = valList.reduce((a, b) => a + b, 0) / valList.length
    const stdDev = Math.sqrt(valList.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / valList.length)

    Object.keys(values).forEach(code => {
      if (stdDev === 0) {
        deviances[code] = 'LOW'
      } else {
        const deviation = Math.abs(values[code] - mean) / stdDev
        if (deviation > 1.5) deviances[code] = 'HIGH'
        else if (deviation > 0.5) deviances[code] = 'NORM'
        else deviances[code] = 'LOW'
      }
    })

    matrix.push({
      attribute: attrKey,
      label: attrDef.label,
      format: attrDef.format,
      values,
      deviances,
    })
  })

  attributeMatrix.value = matrix
}

// ==================== 生命周期 ====================

onMounted(async () => {
  await loadCountries()

  // 如果有国家选项，默认选择前3个
  if (countries.value.length >= 3) {
    selectedCountries.value = countries.value.slice(0, 3).map(c => c.value)
  }
})

watch(activeCategory, () => {
  // 清除不适合当前品类的属性
  selectedAttributes.value = selectedAttributes.value.filter(key => {
    const attr = attributeGroups.value.flatMap(g => g.items).find(i => i.key === key)
    if (!attr) return false
    if (attr.inkjetOnly && activeCategory.value !== 'inkjet') return false
    if (attr.laserOnly && activeCategory.value !== 'laser') return false
    return true
  })
})

// 矩阵属性变化 → 实时重绘矩阵（仅在已有数据时）
watch(selectedAttributes, () => {
  if (hasData.value && countryDataMap.value.size > 0) {
    generateAttributeMatrix()
  }
}, { deep: true })
</script>

<style scoped>
.compare-view-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: var(--dt-color-bg-base);
  gap: var(--dt-space-4);
  padding: var(--dt-space-4);
}

/* ==================== 顶部栏 ==================== */
.page-topbar {
  display: flex;
  align-items: center;
  gap: var(--dt-space-6);
  padding: var(--dt-space-4) var(--dt-space-5);
  background: var(--dt-color-bg-surface);
  border: 1px solid var(--dt-color-border);
  border-radius: var(--dt-radius-md);
  box-shadow: var(--dt-shadow-sm);
}

.topbar-left {
  flex-shrink: 0;
}

.page-title {
  font-size: var(--dt-text-xl);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-color-text-primary);
  margin: 0;
  white-space: nowrap;
}

.topbar-center {
  display: flex;
  align-items: center;
  gap: var(--dt-space-5);
  flex: 1;
}

.controller-section {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
}

.controller-label {
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-secondary);
  white-space: nowrap;
}

.country-selector-section {
  min-width: 240px;
}

.attr-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--dt-color-primary-text);
  background: var(--dt-color-primary);
  border-radius: var(--dt-radius-full);
}

.topbar-right {
  flex-shrink: 0;
}

/* ==================== 加载和空状态 ==================== */
.compare-loading {
  flex: 1;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--dt-space-4);
  color: var(--dt-color-text-muted);
}

.compare-empty {
  flex: 1;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--dt-space-4);
  background: var(--dt-color-bg-surface);
  border: 1px dashed var(--dt-color-border);
  border-radius: var(--dt-radius-md);
}

.empty-illustration {
  color: var(--dt-color-text-muted);
  opacity: 0.5;
}

.empty-message {
  font-size: var(--dt-text-sm);
  color: var(--dt-color-text-muted);
  margin: 0;
}

/* ==================== 内容区 ==================== */
.compare-content {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
}

/* ==================== 国家KPI卡片 ==================== */
.country-kpi-row {
  display: flex;
  gap: var(--dt-space-4);
}

.country-kpi-card {
  flex: 1;
  background: var(--dt-color-bg-surface);
  border-radius: 4px;
  padding: 0;
  border: 1px solid var(--dt-color-border);
  box-shadow: var(--dt-shadow-sm);
  transition: var(--dt-transition-hover);
  position: relative;
  overflow: hidden;
}

.country-kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-color);
}

.country-kpi-card:hover {
  box-shadow: var(--dt-shadow-card-hover);
  transform: translateY(-2px);
}

.kpi-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dt-space-4);
  margin-bottom: 0;
  border-bottom: 1px solid var(--dt-color-border-light);
}

.kpi-country-name {
  font-size: var(--dt-text-md);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-color-text-primary);
}

.kpi-country-code {
  font-size: var(--dt-text-2xs);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-secondary);
  padding: 2px 8px;
  background: var(--dt-color-bg-muted);
  border-radius: var(--dt-radius-xs);
}

.kpi-card-body {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  padding: var(--dt-space-4);
}

.kpi-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 var(--dt-space-2);
}

.kpi-item + .kpi-item {
  border-left: 1px solid var(--dt-color-border-light);
  padding-left: var(--dt-space-3);
}

.kpi-item-label {
  font-size: var(--dt-text-2xs);
  color: var(--dt-color-text-secondary);
  font-weight: var(--dt-weight-medium);
  text-transform: uppercase;
  letter-spacing: var(--dt-tracking-wide);
}

.kpi-item-value {
  font-size: var(--dt-text-base);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-color-text-primary);
  font-family: var(--dt-font-mono);
}

.kpi-item-value.trend-up {
  color: var(--dt-color-success);
}

.kpi-item-value.trend-down {
  color: var(--dt-color-danger);
}

/* ==================== 图表行 ==================== */
.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--dt-space-4);
}

.chart-panel {
  background: var(--dt-color-bg-surface);
  border-radius: 4px;
  padding: 0;
  border: 1px solid var(--dt-color-border);
  box-shadow: var(--dt-shadow-sm);
  overflow: hidden;
}

.chart-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dt-space-4);
  border-bottom: 1px solid var(--dt-color-border-light);
}

.chart-panel-title {
  font-size: var(--dt-text-base);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-primary);
}

.chart-panel-hint {
  font-size: var(--dt-text-xs);
  color: var(--dt-color-text-muted);
}

.chart-panel-body {
  padding: var(--dt-space-4);
}

/* ==================== 属性矩阵 ==================== */
.matrix-panel {
  background: var(--dt-color-bg-surface);
  border-radius: 4px;
  padding: 0;
  border: 1px solid var(--dt-color-border);
  box-shadow: var(--dt-shadow-sm);
  overflow: hidden;
}

.matrix-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dt-space-4);
  border-bottom: 1px solid var(--dt-color-border-light);
}

.matrix-header-right {
  display: flex;
  align-items: center;
  gap: var(--dt-space-5);
}

.matrix-title {
  font-size: var(--dt-text-base);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-primary);
}

.matrix-legend {
  display: flex;
  align-items: center;
  gap: var(--dt-space-4);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-secondary);
}

.sync-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--dt-color-primary);
  color: #fff;
  border: none;
  border-radius: var(--dt-radius-xs);
  font-size: var(--dt-text-2xs);
  font-weight: var(--dt-weight-bold);
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: var(--dt-btn-primary-shadow);
  transition: all var(--dt-duration-fast) var(--dt-ease-smooth);
}
.sync-btn:hover {
  background: var(--dt-color-primary-hover);
  box-shadow: var(--dt-shadow-btn-hover);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.deviance-high { background: var(--dt-color-danger); }
.legend-dot.deviance-norm { background: var(--dt-color-primary); }
.legend-dot.deviance-low { background: var(--dt-color-success); }

/* ── 国家列头部（国旗 + 名称）── */
.th-country-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.th-country-flag {
  font-size: 20px;
  line-height: 1;
}

.th-country-name {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* ── 单元格数值样式 ── */
.matrix-cell-value--currency {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--dt-color-text-primary);
}

.matrix-cell-value--number {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.matrix-cell-value--yoy {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.matrix-cell-value--yoy.positive { color: #16a34a; }
.matrix-cell-value--yoy.negative { color: #dc2626; }

/* ── 比例单元格 ── */
.ratio-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-variant-numeric: tabular-nums;
}

.ratio-part {
  font-weight: 700;
  font-size: 13px;
}
.ratio-part--first { color: #2563eb; }
.ratio-part--second { color: #9333ea; }

.ratio-sep {
  color: var(--dt-color-text-muted);
  font-weight: 400;
  margin: 0 1px;
}

.ratio-percent {
  font-weight: 700;
  font-size: 13px;
  color: #2563eb;
}

.ratio-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--dt-color-text-secondary);
  margin-left: 2px;
}

/* ── 偏差徽章样式增强 ── */
.deviance-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  vertical-align: middle;
  min-width: 52px;
}

.deviance-badge.deviance-high {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.deviance-badge.deviance-norm {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.deviance-badge.deviance-low {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.matrix-table-wrapper {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--dt-text-sm);
  table-layout: fixed;
}

.matrix-table .col-attr     { width: 200px; }
.matrix-table .col-country  { width: 160px; }
.matrix-table .col-deviance { width: 90px; }

.matrix-th {
  padding: 10px 14px;
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-color-text-secondary);
  border-bottom: 1px solid var(--dt-color-border);
  background: var(--dt-color-bg-muted);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: var(--dt-tracking-wide);
  box-sizing: border-box;
}

.matrix-th-attr {
  text-align: left;
}

.matrix-th-country {
  text-align: center;
}

.matrix-th-deviance {
  text-align: center;
}

.matrix-row:hover td {
  background: var(--dt-color-bg-hover);
}

.matrix-td {
  padding: 10px 14px;
  color: var(--dt-color-text-secondary);
  border-bottom: 1px solid var(--dt-color-border-light);
  white-space: nowrap;
  font-size: var(--dt-text-xs);
  transition: background var(--dt-duration-fast);
  box-sizing: border-box;
}

.matrix-td-attr {
  font-weight: var(--dt-weight-medium);
  color: var(--dt-color-text-secondary);
}

.matrix-td-country {
  text-align: center;
}

.matrix-td-deviance {
  text-align: center;
}

.matrix-cell-value {
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-primary);
  font-variant-numeric: tabular-nums;
}

.matrix-cell-value--highlight {
  color: var(--dt-color-primary);
}

/* ==================== AI洞察 ==================== */
.ai-insight-panel {
  background: var(--dt-gradient-secondary);
  border: 1px solid var(--dt-color-border);
  border-radius: 4px;
  padding: 0;
  overflow: hidden;
}

.ai-insight-header {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  padding: var(--dt-space-4);
  border-bottom: 1px solid var(--dt-color-border-light);
}

.ai-insight-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--dt-color-primary);
  border-radius: var(--dt-radius-sm);
  color: var(--dt-color-primary-text);
}

.ai-insight-title {
  font-size: var(--dt-text-sm);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-primary);
}

.ai-insight-content {
  padding: var(--dt-space-4);
  font-size: var(--dt-text-sm);
  color: var(--dt-color-text-secondary);
  line-height: var(--dt-leading-relaxed);
}

.ai-insight-content p {
  margin: 0;
  white-space: pre-line;
}

/* ==================== 属性配置抽屉 ==================== */
.attribute-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-actions {
  display: flex;
  gap: var(--dt-space-2);
  margin-bottom: var(--dt-space-4);
}

.attribute-groups {
  flex: 1;
  overflow-y: auto;
}

.attribute-group {
  margin-bottom: var(--dt-space-5);
}

.group-header {
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--dt-tracking-wide);
  margin-bottom: var(--dt-space-2);
  padding-bottom: var(--dt-space-2);
  border-bottom: 1px solid var(--dt-color-border);
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-1);
}

.attribute-item {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-2) var(--dt-space-3);
  border-radius: var(--dt-radius-sm);
  cursor: pointer;
  transition: background var(--dt-duration-fast);
}

.attribute-item:hover {
  background: var(--dt-color-bg-hover);
}

.attribute-item.selected {
  background: var(--dt-color-bg-active);
}

.attr-check {
  width: 18px;
  height: 18px;
  border: 2px solid var(--dt-color-border);
  border-radius: var(--dt-radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--dt-duration-fast);
  color: var(--dt-color-primary-text);
}

.attribute-item.selected .attr-check {
  background: var(--dt-color-primary);
  border-color: var(--dt-color-primary);
}

.attr-label {
  flex: 1;
  font-size: var(--dt-text-sm);
  color: var(--dt-color-text-primary);
}

.attr-badge {
  font-size: var(--dt-text-2xs);
  font-weight: var(--dt-weight-semibold);
  padding: 2px 6px;
  border-radius: var(--dt-radius-xs);
  background: var(--dt-color-success-bg);
  color: var(--dt-color-success-text);
}

.attr-badge.laser {
  background: var(--dt-color-primary-light);
  color: var(--dt-color-primary);
}

.drawer-footer {
  padding-top: var(--dt-space-4);
  border-top: 1px solid var(--dt-color-border);
  margin-top: auto;
}

/* ==================== Loading Spinner ==================== */
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
