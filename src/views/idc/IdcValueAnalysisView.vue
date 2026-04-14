<template>
  <div class="page-container idc-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">价格与价值分析</h2>
        <p class="page-subtitle">从 ASP、溢价、价量关系三个层面衡量市场的经营质量</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="block-head">
          <div class="chart-kicker">价值结构</div>
          <h3>ASP 与溢价水平</h3>
        </div>
        <v-chart :option="valueOption" autoresize style="height:320px" />
      </div>
      <div class="card">
        <div class="block-head">
          <div class="chart-kicker">分析要点</div>
          <h3>价值策略解读</h3>
        </div>
        <div class="value-cards">
          <div class="value-card" v-for="item in valueMix" :key="item.name">
            <span>{{ item.name }}</span>
            <strong>${{ item.asp }}</strong>
            <p>Premium {{ item.premium.toFixed(2) }}x · Value Share {{ item.valueShare.toFixed(1) }}%</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <div class="block-head">
        <div class="chart-kicker">策略问题</div>
        <h3>页面建议重点回答的问题</h3>
      </div>
      <ul class="value-question-list">
        <li>哪些市场是量大但 ASP 低，需要控制低价扩张？</li>
        <li>哪些品牌量不大但价值贡献高，适合高端化持续投入？</li>
        <li>A3 / 高速 Laser / 彩色 MFP 是否已形成稳定溢价带？</li>
        <li>不同渠道的 ASP 差异是结构差异还是折扣策略差异？</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { valueMix } from './idcMock'

use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

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

const valueOption = computed(() => ({
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
  grid: { left: 40, right: 20, top: 20, bottom: 40, containLabel: true },
  xAxis: { type: 'category', data: valueMix.map((item) => item.name), axisLine: { lineStyle: { color: '#e7e5e4' } }, axisLabel: { color: '#4b5563' } },
  yAxis: [
    { type: 'value', name: 'ASP', axisLine: { show: false }, axisLabel: { color: '#4b5563' }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } },
    { type: 'value', name: 'Premium', axisLine: { show: false }, axisLabel: { color: '#4b5563' }, splitLine: { show: false } },
  ],
  series: [
    { type: 'bar', name: 'ASP', data: valueMix.map((item, idx) => ({ value: item.asp, itemStyle: getGradientBarStyle(0) })) },
    {
      type: 'line', name: 'Premium', yAxisIndex: 1, data: valueMix.map((item) => item.premium),
      smooth: 0.4, symbolSize: 0,
      lineStyle: { width: 3, color: WEB3_COLORS[1] },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: WEB3_COLORS[1] + '33' }, { offset: 1, color: WEB3_COLORS[1] + '00' }] } },
      emphasis: { showSymbol: true, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#fff', borderColor: WEB3_COLORS[1], borderWidth: 2, shadowColor: WEB3_COLORS[1], shadowBlur: 8 } },
    },
  ],
}))
</script>

<style scoped>
.block-head { margin-bottom:12px; }
.block-head h3 { font-size:18px; font-weight:800; color:var(--text-primary); }
.chart-kicker { font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--text-muted); font-weight:700; margin-bottom:3px; }
.value-cards { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
.value-card { padding:15px; border:1px solid var(--border-light); border-radius:14px; background:#F9FAFB; }
.value-card span { font-size:12px; color:var(--text-secondary); }
.value-card strong { display:block; font-size:28px; color:var(--text-primary); margin:8px 0 4px; }
.value-card p { font-size:12px; color:var(--text-muted); }
.value-question-list { padding-left:20px; display:flex; flex-direction:column; gap:10px; color:var(--text-secondary); }
@media (max-width: 900px) { .value-cards { grid-template-columns:1fr; } }
</style>
