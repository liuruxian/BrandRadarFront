<template>
  <div class="page-container idc-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">功能与技术分析</h2>
        <p class="page-subtitle">关注 Wireless、Duplex、ADF、Network、Speed 等配置的演进趋势</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="block-head">
          <div class="chart-kicker">功能渗透</div>
          <h3>市场 / A3 / A4 对比</h3>
        </div>
        <v-chart :option="featureOption" autoresize style="height:320px" />
      </div>
      <div class="card">
        <div class="block-head">
          <div class="chart-kicker">速度结构</div>
          <h3>速度段迁移</h3>
        </div>
        <table class="data-table">
          <thead><tr><th>Speed Segment</th><th>A4</th><th>A3</th></tr></thead>
          <tbody>
            <tr v-for="item in speedSegments" :key="item.segment">
              <td>{{ item.segment }}</td>
              <td>{{ item.a4 }}%</td>
              <td>{{ item.a3 }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <div class="block-head">
        <div class="chart-kicker">产品规划</div>
        <h3>建议输出的规划判断</h3>
      </div>
      <div class="planning-grid">
        <div class="planning-card">
          <h4>基础配置升级</h4>
          <p>Wireless、Duplex 在 A4 中的普及加速，正在从卖点变成入门标配。</p>
        </div>
        <div class="planning-card">
          <h4>A3 专业化配置</h4>
          <p>A3 在 ADF、Network、高速段的渗透显著更高，适合专业办公与行业场景。</p>
        </div>
        <div class="planning-card">
          <h4>高价值组合</h4>
          <p>高速 + ADF + Network 的组合更容易形成高 ASP，应重点观察品牌与区域分布。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { featurePenetration, speedSegments } from './idcMock'

use([BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

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

const featureOption = computed(() => ({
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
  grid: { left: 40, right: 20, top: 20, bottom: 40, containLabel: true },
  xAxis: { type: 'category', data: featurePenetration.map((item) => item.name), axisLine: { lineStyle: { color: '#e7e5e4' } }, axisLabel: { color: '#4b5563' } },
  yAxis: { type: 'value', max: 100, name: 'Penetration %', axisLine: { show: false }, axisLabel: { color: '#4b5563' }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } },
  series: [
    { type: 'bar', name: 'Market', data: featurePenetration.map((item, idx) => ({ value: item.market, itemStyle: getGradientBarStyle(2) })) },
    { type: 'bar', name: 'A3', data: featurePenetration.map((item, idx) => ({ value: item.a3, itemStyle: getGradientBarStyle(1) })) },
    { type: 'bar', name: 'A4', data: featurePenetration.map((item, idx) => ({ value: item.a4, itemStyle: getGradientBarStyle(0) })) },
  ],
}))
</script>

<style scoped>
.block-head { margin-bottom:12px; }
.block-head h3 { font-size:18px; font-weight:800; color:var(--text-primary); }
.chart-kicker { font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--text-muted); font-weight:700; margin-bottom:3px; }
.planning-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.planning-card { padding:16px; border:1px solid var(--border-light); border-radius:16px; background:#F9FAFB; }
.planning-card h4 { font-size:16px; font-weight:800; margin-bottom:6px; }
.planning-card p { font-size:13px; color:var(--text-secondary); }
@media (max-width: 900px) { .planning-grid { grid-template-columns:1fr; } }
</style>
