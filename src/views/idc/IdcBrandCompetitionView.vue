<template>
  <div class="page-container idc-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">品牌竞争分析</h2>
        <p class="page-subtitle">追踪品牌份额、价值能力、增速变化和竞争集中度</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="block-head">
          <div class="chart-kicker">品牌份额</div>
          <h3>Top 品牌结构</h3>
        </div>
        <v-chart :option="brandOption" autoresize style="height:340px" />
      </div>
      <div class="card">
        <div class="block-head">
          <div class="chart-kicker">品牌画像</div>
          <h3>品牌竞争矩阵</h3>
        </div>
        <div class="brand-pulse-list">
          <div class="brand-pulse-item" v-for="item in brandRows" :key="item.name">
            <div>
              <strong>{{ item.name }}</strong>
              <p>份额 {{ item.share.toFixed(1) }}% · 销量 {{ item.units.toFixed(2) }}M</p>
            </div>
            <span class="badge" :class="item.yoy > 8 ? 'badge-green' : item.yoy > 0 ? 'badge-blue' : 'badge-red'">
              {{ item.yoy.toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <div class="block-head">
        <div class="chart-kicker">核心指标</div>
        <h3>竞争监测维度</h3>
      </div>
      <div class="competition-grid">
        <div class="competition-card">
          <span class="competition-label">CR3</span>
          <strong>{{ cr3.toFixed(1) }}%</strong>
          <p>前三品牌合计份额高，市场呈中度集中。</p>
        </div>
        <div class="competition-card">
          <span class="competition-label">CR5</span>
          <strong>{{ cr5.toFixed(1) }}%</strong>
          <p>头部品牌仍然牢牢控制主流办公打印市场。</p>
        </div>
        <div class="competition-card">
          <span class="competition-label">HHI</span>
          <strong>{{ hhi.toLocaleString() }}</strong>
          <p>用份额平方和衡量竞争强度，数值越高说明集中度越强。</p>
        </div>
        <div class="competition-card">
          <span class="competition-label">Top Gainer</span>
          <strong>{{ topGainer.name }}</strong>
          <p>{{ topGainer.name }} 当前同比 {{ topGainer.yoy.toFixed(1) }}%，是现阶段增速最高的重点品牌。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useIdcStore } from '@/stores/idcStore'
import { topBrands } from './idcMock'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const idcStore = useIdcStore()
const { brands } = storeToRefs(idcStore)

const brandRows = computed(() => (brands.value.length ? brands.value.map((item) => ({
  name: String(item.name ?? item.brand ?? 'Unknown'),
  share: Number(item.share ?? 0),
  units: Number(item.units ?? 0),
  yoy: Number(item.yoy ?? 0),
})) : topBrands.map((item) => ({
  name: item.name,
  share: Number(item.share ?? 0),
  units: Number(item.units ?? 0),
  yoy: Number(item.yoy ?? 0),
}))).slice(0, 5))

// 粉紫 Web3 风格颜色
const WEB3_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#34d399', '#f87171', '#f472b6', '#a78bfa']

// 渐变柱状图 itemStyle
function getGradientBarStyle(colorIndex: number) {
  const color = WEB3_COLORS[colorIndex % WEB3_COLORS.length]
  return {
    color: {
      type: 'linear',
      x: 0, y: 0, x2: 1, y2: 0,
      colorStops: [
        { offset: 0, color: color },
        { offset: 1, color: color + 'cc' },
      ],
    },
    borderRadius: [0, 6, 6, 0],
  }
}

const brandOption = computed(() => ({
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
  grid: { left: 40, right: 40, top: 20, bottom: 32, containLabel: true },
  xAxis: { type: 'value', name: 'Share %', axisLine: { show: false }, axisLabel: { color: '#4b5563' }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } },
  yAxis: { type: 'category', data: brandRows.value.map((item) => item.name), inverse: true, axisLine: { lineStyle: { color: '#e7e5e4' } }, axisLabel: { color: '#4b5563' } },
  series: [
    {
      type: 'bar',
      data: brandRows.value.map((item, index) => ({
        value: item.share,
        itemStyle: getGradientBarStyle(index),
      })),
      barWidth: 18,
      label: { show: true, position: 'right', formatter: '{c}%', color: '#4b5563', fontWeight: 600 },
    },
  ],
}))

const cr3 = computed(() => brandRows.value.slice(0, 3).reduce((sum, item) => sum + item.share, 0))
const cr5 = computed(() => brandRows.value.slice(0, 5).reduce((sum, item) => sum + item.share, 0))
const hhi = computed(() => Math.round(brandRows.value.reduce((sum, item) => sum + item.share * item.share, 0)))
const topGainer = computed(() => [...brandRows.value].sort((a, b) => b.yoy - a.yoy)[0] ?? { name: 'N/A', yoy: 0 })

onMounted(() => {
  if (!brands.value.length) {
    void idcStore.fetchBrands()
  }
})
</script>

<style scoped>
.block-head { margin-bottom:12px; }
.block-head h3 { font-size:18px; font-weight:800; color:var(--text-primary); }
.chart-kicker { font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--text-muted); font-weight:700; margin-bottom:3px; }
.brand-pulse-list { display:flex; flex-direction:column; gap:12px; }
.brand-pulse-item { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 14px; border:1px solid var(--border-light); border-radius:14px; background:#F9FAFB; }
.brand-pulse-item strong { font-size:16px; color:var(--text-primary); }
.brand-pulse-item p { font-size:12px; color:var(--text-secondary); margin-top:3px; }
.competition-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.competition-card { padding:16px; border:1px solid var(--border-light); border-radius:16px; background:linear-gradient(180deg,#FFFFFF 0%,#F8FBFC 100%); }
.competition-label { font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--text-muted); font-weight:700; }
.competition-card strong { display:block; font-size:30px; margin:10px 0 6px; font-weight:800; color:var(--text-primary); }
.competition-card p { font-size:13px; color:var(--text-secondary); }
@media (max-width: 900px) { .competition-grid { grid-template-columns:1fr; } }
</style>
