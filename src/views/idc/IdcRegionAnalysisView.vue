<template>
  <div class="page-container idc-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">区域国家分析</h2>
        <p class="page-subtitle">观察区域规模、结构偏好和机会国家，支持全球资源配置</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="block-head">
          <div class="chart-kicker">区域分布</div>
          <h3>区域份额与规模</h3>
        </div>
        <v-chart :option="regionOption" autoresize style="height:320px" />
      </div>
      <div class="card">
        <div class="block-head">
          <div class="chart-kicker">国家机会</div>
          <h3>机会国家排序</h3>
        </div>
        <table class="data-table">
          <thead><tr><th>国家</th><th>机会分</th><th>增速</th><th>A3 渗透</th><th>ASP</th></tr></thead>
          <tbody>
            <tr v-for="item in countryRows" :key="item.name">
              <td>{{ item.name }}</td>
              <td>{{ item.score }}</td>
              <td class="text-green">{{ item.growth.toFixed(1) }}%</td>
              <td>{{ item.penetration }}%</td>
              <td>${{ item.asp }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <div class="block-head">
        <div class="chart-kicker">区域洞察</div>
        <h3>国家 / 区域可重点关注的分析视角</h3>
      </div>
      <div class="region-card-grid">
        <div class="region-card">
          <h4>中国 vs 全球</h4>
          <p>用于观察中国市场在喷墨、高速 A4、A3 办公段是否与全球趋势存在显著偏差。</p>
        </div>
        <div class="region-card">
          <h4>机会国家池</h4>
          <p>结合规模、增速、ASP 和当前渗透率，对国家进行可进入性排序。</p>
        </div>
        <div class="region-card">
          <h4>品牌区域依赖度</h4>
          <p>识别品牌对单一区域依赖过高的风险，辅助全球经营布局。</p>
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
import { regionalMix, regionalOpportunities } from './idcMock'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const idcStore = useIdcStore()
const { countries } = storeToRefs(idcStore)

const countryRows = computed(() => (countries.value.length
  ? countries.value.map((item) => ({
      name: String(item.name ?? item.country ?? 'Unknown'),
      share: Number(item.share ?? 0),
      growth: Number(item.growth ?? item.yoy ?? 0),
      penetration: Number(item.penetration ?? 0),
      asp: Number(item.asp ?? 0),
      score: Number(item.score ?? 0),
    }))
  : regionalOpportunities.map((item) => ({
      name: item.name,
      share: 0,
      growth: Number(item.growth ?? 0),
      penetration: Number(item.penetration ?? 0),
      asp: Number(item.asp ?? 0),
      score: Number(item.score ?? 0),
    }))).slice(0, 5))

const regionRows = computed(() => {
  if (!countryRows.value.length || countries.value.length === 0) return regionalMix
  return countryRows.value.map((item) => ({ name: item.name, share: item.share || item.score }))
})

// 粉紫 Web3 风格颜色
const WEB3_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#34d399', '#f87171', '#f472b6', '#a78bfa']

// 渐变柱状图 itemStyle
function getGradientBarStyle(colorIndex: number) {
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

const regionOption = computed(() => ({
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
  grid: { left: 40, right: 40, top: 20, bottom: 40, containLabel: true },
  xAxis: { type: 'category', data: regionRows.value.map((item) => item.name), axisLine: { lineStyle: { color: '#e7e5e4' } }, axisLabel: { color: '#4b5563', rotate: 30 } },
  yAxis: { type: 'value', name: countries.value.length ? 'Score / Share' : 'Share %', axisLine: { show: false }, axisLabel: { color: '#4b5563' }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } },
  series: [
    { type: 'bar', data: regionRows.value.map((item, idx) => ({ value: item.share, itemStyle: getGradientBarStyle(idx) })), label: { show: true, position: 'top', formatter: '{c}', color: '#4b5563', fontWeight: 600 } },
  ],
}))

onMounted(() => {
  if (!countries.value.length) {
    void idcStore.fetchCountries()
  }
})
</script>

<style scoped>
.block-head { margin-bottom:12px; }
.block-head h3 { font-size:18px; font-weight:800; color:var(--text-primary); }
.chart-kicker { font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--text-muted); font-weight:700; margin-bottom:3px; }
.region-card-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.region-card { padding:16px; border:1px solid var(--border-light); border-radius:16px; background:#F9FAFB; }
.region-card h4 { font-size:16px; font-weight:800; margin-bottom:6px; }
.region-card p { font-size:13px; color:var(--text-secondary); }
@media (max-width: 900px) { .region-card-grid { grid-template-columns:1fr; } }
</style>
