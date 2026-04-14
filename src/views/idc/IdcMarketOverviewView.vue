<template>
  <div class="page-container idc-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">市场总览</h2>
        <p class="page-subtitle">用统一口径查看市场规模、结构变化和经营摘要</p>
      </div>
      <button class="btn btn-ghost">导出当前视图</button>
    </div>

    <div class="grid-4">
      <div class="card metric-card" v-for="item in summaryCards" :key="item.label">
        <div class="metric-kicker">{{ item.label }}</div>
        <div class="metric-value">{{ item.value }}</div>
        <div class="metric-foot" :class="item.delta > 0 ? 'up' : 'down'">
          {{ item.delta > 0 ? '↑' : '↓' }} {{ Math.abs(item.delta).toFixed(1) }}% vs 上年同期
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-top:20px;">
      <div class="card chart-card">
        <div class="chart-header">
          <div>
            <div class="chart-kicker">趋势</div>
            <h3>规模与价值</h3>
          </div>
          <span class="badge badge-blue">{{ trendRange }}</span>
        </div>
        <v-chart :option="trendOption" autoresize style="height:320px" />
      </div>
      <div class="card chart-card">
        <div class="chart-header">
          <div>
            <div class="chart-kicker">结构</div>
            <h3>品类与规格拆解</h3>
          </div>
        </div>
        <v-chart :option="structureOption" autoresize style="height:320px" />
      </div>
    </div>

    <div class="grid-2" style="margin-top:20px;">
      <div class="card">
        <div class="chart-header">
          <div>
            <div class="chart-kicker">重点洞察</div>
            <h3>管理摘要</h3>
          </div>
        </div>
        <div class="insight-list">
          <div class="insight-item" v-for="(insight, index) in insightTexts" :key="`${index}-${insight}`">
            <span class="insight-index">0{{ index + 1 }}</span>
            <p>{{ insight }}</p>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="chart-header">
          <div>
            <div class="chart-kicker">竞争</div>
            <h3>品牌 Top 5 份额</h3>
          </div>
        </div>
        <table class="data-table">
          <thead><tr><th>品牌</th><th>份额</th><th>Units</th><th>YoY</th></tr></thead>
          <tbody>
            <tr v-for="brand in topFive" :key="brand.name">
              <td>{{ brand.name }}</td>
              <td>{{ brand.share.toFixed(1) }}%</td>
              <td>{{ brand.units.toFixed(2) }}M</td>
              <td :class="brand.yoy > 0 ? 'text-green' : 'text-red'">{{ Number(brand.yoy).toFixed(1) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { use } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useIdcStore } from '@/stores/idcStore'
import { categoryShares, executiveInsights, formatShares, marketTrend, topBrands } from './idcMock'

use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const idcStore = useIdcStore()
const { home, insights, brands, categories, trend } = storeToRefs(idcStore)

const trendRows = computed(() => trend.value.length ? trend.value.map((item) => ({
  period: String(item.period ?? item.label ?? ''),
  units: Number(item.units ?? 0),
  value: Number(item.value ?? 0),
  asp: Number(item.asp ?? 0),
  yoy: Number(item.yoy ?? 0),
})) : marketTrend)

const brandRows = computed(() => brands.value.length ? brands.value.map((item) => ({
  name: String(item.name ?? item.brand ?? 'Unknown'),
  share: Number(item.share ?? 0),
  units: Number(item.units ?? 0),
  yoy: Number(item.yoy ?? 0),
})) : topBrands)

const categoryRows = computed(() => categories.value.length ? categories.value.map((item) => ({
  name: String(item.name ?? item.category ?? 'Unknown'),
  share: Number(item.share ?? 0),
})) : categoryShares)

const summaryCards = computed(() => {
  const latest = trendRows.value[trendRows.value.length - 1]
  return [
    { label: '市场出货量', value: `${Number(home.value?.units ?? latest.units).toFixed(1)}M`, delta: Number(home.value?.yoy ?? latest.yoy ?? 0) },
    { label: '市场销售额', value: `$${Number(home.value?.value ?? latest.value).toFixed(2)}B`, delta: 6.2 },
    { label: '平均单价 ASP', value: `$${Math.round(Number(home.value?.asp ?? latest.asp ?? 0))}`, delta: 2.5 },
    { label: '彩色产品占比', value: '59%', delta: 4.1 },
  ]
})

const trendRange = computed(() => {
  const rows = trendRows.value
  if (!rows.length) return '—'
  return `${rows[0].period} - ${rows[rows.length - 1].period}`
})

// 粉紫 Web3 风格颜色
const WEB3_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#34d399', '#f87171', '#f472b6', '#a78bfa']

// 渐变柱状图 itemStyle
function getGradientBarStyle(colorIndex: number, borderRight: boolean = false) {
  const color = WEB3_COLORS[colorIndex % WEB3_COLORS.length]
  return {
    color: {
      type: 'linear',
      x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [
        { offset: 0, color: color },
        { offset: 1, color: color + 'aa' },
      ],
    },
    borderRadius: [6, 6, 0, 0],
  }
}

const trendOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    textStyle: { color: '#44403c', fontSize: 12 },
    shadowColor: 'rgba(236, 72, 153, 0.1)',
    shadowBlur: 10,
  },
  legend: { bottom: 0, textStyle: { color: '#4b5563', fontSize: 12 } },
  grid: { left: 40, right: 20, top: 24, bottom: 40, containLabel: true },
  xAxis: {
    type: 'category',
    data: trendRows.value.map((item) => item.period),
    axisLine: { lineStyle: { color: '#e7e5e4' } },
    axisLabel: { color: '#4b5563', fontSize: 12 },
  },
  yAxis: [
    { type: 'value', name: 'Units (M)', axisLine: { show: false }, axisLabel: { color: '#4b5563' }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } },
    { type: 'value', name: 'ASP', axisLine: { show: false }, axisLabel: { color: '#4b5563' }, splitLine: { show: false } },
  ],
  series: [
    { type: 'bar', name: 'Units', data: trendRows.value.map((item) => item.units), itemStyle: getGradientBarStyle(0) },
    {
      type: 'line', name: 'ASP', yAxisIndex: 1, data: trendRows.value.map((item) => item.asp),
      smooth: 0.4, symbolSize: 0,
      lineStyle: { width: 3, color: WEB3_COLORS[1] },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: WEB3_COLORS[1] + '33' }, { offset: 1, color: WEB3_COLORS[1] + '00' }] } },
      emphasis: { showSymbol: true, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#fff', borderColor: WEB3_COLORS[1], borderWidth: 2, shadowColor: WEB3_COLORS[1], shadowBlur: 8 } },
    },
  ],
}))

const structureOption = computed(() => ({
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
  legend: { bottom: 0, textStyle: { color: '#4b5563', fontSize: 12 } },
  grid: { left: 40, right: 20, top: 24, bottom: 40, containLabel: true },
  xAxis: { type: 'category', data: ['Laser/Inkjet', 'A3/A4'], axisLine: { lineStyle: { color: '#e7e5e4' } }, axisLabel: { color: '#4b5563' } },
  yAxis: { type: 'value', name: 'Share %', max: 100, axisLine: { show: false }, axisLabel: { color: '#4b5563' }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } },
  series: [
    { type: 'bar', name: categoryRows.value[0]?.name ?? categoryShares[0].name, stack: 'cat', data: [categoryRows.value[0]?.share ?? categoryShares[0].share, formatShares[0].share], itemStyle: getGradientBarStyle(0) },
    { type: 'bar', name: categoryRows.value[1]?.name ?? categoryShares[1].name, stack: 'cat', data: [categoryRows.value[1]?.share ?? categoryShares[1].share, formatShares[1].share], itemStyle: getGradientBarStyle(1) },
    { type: 'bar', name: 'Others', stack: 'cat', data: [0, formatShares[2].share], itemStyle: { color: '#e7e5e4' } },
  ],
}))

const insightTexts = computed(() => insights.value.length
  ? insights.value.slice(0, 4).map((item) => String(item.summary ?? item.content ?? item.text ?? item.title ?? ''))
  : executiveInsights)

const topFive = computed(() => brandRows.value.slice(0, 5).map((item) => ({
  name: item.name,
  share: Number(item.share ?? 0),
  units: Number(item.units ?? 0),
  yoy: Number(item.yoy ?? 0),
})))

onMounted(() => {
  if (!trend.value.length || !brands.value.length || !insights.value.length || !categories.value.length) {
    void idcStore.fetchDashboard()
  }
})
</script>

<style scoped>
.metric-card { display:flex; flex-direction:column; gap:8px; min-height:138px; }
.metric-kicker { font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--text-muted); font-weight:700; }
.metric-value { font-size:34px; line-height:1; font-weight:800; color:var(--text-primary); }
.metric-foot { font-size:12px; font-weight:600; }
.metric-foot.up { color:var(--green); }
.metric-foot.down { color:var(--red); }
.chart-card h3, .chart-header h3 { font-size:18px; font-weight:800; color:var(--text-primary); }
.chart-header { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:8px; }
.chart-kicker { font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--text-muted); font-weight:700; margin-bottom:3px; }
.insight-list { display:flex; flex-direction:column; gap:12px; }
.insight-item { display:flex; gap:12px; align-items:flex-start; padding:12px 14px; border-radius:12px; background:#F9FAFB; border:1px solid var(--border-light); }
.insight-index { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:var(--gradient-soft); color:var(--accent); font-weight:800; flex-shrink:0; }
.insight-item p { color:var(--text-secondary); font-size:13px; }
</style>
