<template>
  <div class="page-container idc-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">渠道分析</h2>
        <p class="page-subtitle">从渠道结构、产品匹配、增速贡献三个角度看经营路径</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="block-head">
          <div class="chart-kicker">渠道结构</div>
          <h3>Channel Mix</h3>
        </div>
        <v-chart :option="channelOption" autoresize style="height:320px" />
      </div>
      <div class="card">
        <div class="block-head">
          <div class="chart-kicker">渠道 × 产品</div>
          <h3>典型渠道适配</h3>
        </div>
        <table class="data-table">
          <thead><tr><th>渠道</th><th>A4</th><th>A3</th><th>Laser</th><th>Inkjet</th></tr></thead>
          <tbody>
            <tr v-for="item in fitRows" :key="item.channel">
              <td>{{ item.channel }}</td>
              <td>{{ item.a4 }}%</td>
              <td>{{ item.a3 }}%</td>
              <td>{{ item.laser }}%</td>
              <td>{{ item.inkjet }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <div class="block-head">
        <div class="chart-kicker">经营建议</div>
        <h3>渠道分析输出要点</h3>
      </div>
      <div class="channel-notes">
        <div class="note-card">
          <strong>E-commerce</strong>
          <p>适合入门 A4 和家用喷墨，但 ASP 偏低，需避免价格战侵蚀。</p>
        </div>
        <div class="note-card">
          <strong>Dealer / Direct</strong>
          <p>A3、高速 Laser、MFP 等专业办公产品更多通过经销和直销完成转化。</p>
        </div>
        <div class="note-card">
          <strong>Distribution</strong>
          <p>适合作为规模放大器，但需要重点控制结构失衡与低毛利风险。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { channelMix, channelProductFit } from './idcMock'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const fitRows = channelProductFit

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

const channelOption = computed(() => ({
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
  yAxis: { type: 'category', data: channelMix.map((item) => item.name), inverse: true, axisLine: { lineStyle: { color: '#e7e5e4' } }, axisLabel: { color: '#4b5563' } },
  series: [
    { type: 'bar', data: channelMix.map((item, idx) => ({ value: item.share, itemStyle: getGradientBarStyle(idx) })), label: { show: true, position: 'right', formatter: '{c}%', color: '#4b5563', fontWeight: 600 } },
  ],
}))
</script>

<style scoped>
.block-head { margin-bottom:12px; }
.block-head h3 { font-size:18px; font-weight:800; color:var(--text-primary); }
.chart-kicker { font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--text-muted); font-weight:700; margin-bottom:3px; }
.channel-notes { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.note-card { padding:16px; border:1px solid var(--border-light); border-radius:16px; background:#F9FAFB; }
.note-card strong { display:block; font-size:16px; margin-bottom:6px; }
.note-card p { font-size:13px; color:var(--text-secondary); }
@media (max-width: 900px) { .channel-notes { grid-template-columns:1fr; } }
</style>
