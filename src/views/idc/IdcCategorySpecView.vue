<template>
  <div class="page-container idc-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">产品结构分析</h2>
        <p class="page-subtitle">围绕品类、规格、功能形态和色彩属性观察产品结构迁移</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="block-head">
          <div>
            <div class="chart-kicker">结构占比</div>
            <h3>产品结构全景</h3>
          </div>
        </div>
        <v-chart :option="mixOption" autoresize style="height:320px" />
      </div>
      <div class="card">
        <div class="block-head">
          <div>
            <div class="chart-kicker">对比摘要</div>
            <h3>四大维度对比</h3>
          </div>
        </div>
        <div class="comparison-grid">
          <div class="comparison-item">
            <span>Laser vs Inkjet</span>
            <strong>{{ primaryCategoryShare }} / {{ secondaryCategoryShare }}</strong>
            <small>品类结构优先从后端真实占比读取，当前接口不足部分使用前端兜底。</small>
          </div>
          <div class="comparison-item">
            <span>A3 vs A4</span>
            <strong>{{ formatShares[1].share }} / {{ formatShares[0].share }}</strong>
            <small>A3 虽体量小，但价值贡献和 ASP 明显更高。</small>
          </div>
          <div class="comparison-item">
            <span>功能形态：Printer vs MFP</span>
            <strong>{{ functionShares[1].share }} / {{ functionShares[0].share }}</strong>
            <small>MFP 持续蚕食单功能打印机市场，办公场景一体化增强。</small>
          </div>
          <div class="comparison-item">
            <span>Color vs Mono</span>
            <strong>{{ colorShares[0].share }} / {{ colorShares[1].share }}</strong>
            <small>彩色化渗透已成为多个区域的核心增长来源。</small>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <div class="block-head">
        <div>
          <div class="chart-kicker">结构迁移</div>
          <h3>重点专题拆解</h3>
        </div>
      </div>
      <div class="topics-grid">
        <article class="topic-card">
          <h4>A3/A4 专题</h4>
          <p>看规格升级、高端化与价值贡献的迁移关系。</p>
          <ul>
            <li>A3 Units / Value / ASP 趋势</li>
            <li>A3 国家偏好与渠道路径</li>
            <li>A3 品牌竞争格局</li>
          </ul>
        </article>
        <article class="topic-card">
          <h4>Laser / Inkjet 专题</h4>
          <p>看技术路线和区域偏好的变化，辅助产品路线选择。</p>
          <ul>
            <li>激光与喷墨长期演变</li>
            <li>彩色喷墨增长来源</li>
            <li>Business Inkjet 渗透</li>
          </ul>
        </article>
        <article class="topic-card">
          <h4>功能形态专题（Printer / MFP）</h4>
          <p>看单功能打印机与多功能一体机的迁移，支撑办公场景产品定义。</p>
          <ul>
            <li>MFP 渗透率</li>
            <li>MFP 在渠道与区域中的差异</li>
            <li>彩色 MFP 高价值市场</li>
          </ul>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useIdcStore } from '@/stores/idcStore'
import { categoryShares, colorShares, formatShares, functionShares } from './idcMock'

use([BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const idcStore = useIdcStore()
const { categories } = storeToRefs(idcStore)

const categoryRows = computed(() => categories.value.length ? categories.value.map((item) => ({
  name: String(item.name ?? item.category ?? 'Unknown'),
  share: Number(item.share ?? 0),
})) : categoryShares)

const primaryCategoryShare = computed(() => categoryRows.value[0]?.share ?? categoryShares[0].share)
const secondaryCategoryShare = computed(() => categoryRows.value[1]?.share ?? categoryShares[1].share)

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

const mixOption = computed(() => ({
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
  xAxis: { type: 'category', data: ['品类', '规格', '功能形态', '色彩属性'], axisLine: { lineStyle: { color: '#e7e5e4' } }, axisLabel: { color: '#4b5563' } },
  yAxis: { type: 'value', max: 100, name: 'Share %', axisLine: { show: false }, axisLabel: { color: '#4b5563' }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } } },
  series: [
    { type: 'bar', name: categoryRows.value[0]?.name ?? 'Primary', stack: 's', data: [primaryCategoryShare.value, formatShares[0].share, functionShares[0].share, colorShares[0].share], itemStyle: { color: WEB3_COLORS[0] } },
    { type: 'bar', name: categoryRows.value[1]?.name ?? 'Secondary', stack: 's', data: [secondaryCategoryShare.value, formatShares[1].share, functionShares[1].share, colorShares[1].share], itemStyle: { color: WEB3_COLORS[1] } },
    { type: 'bar', name: 'Others', stack: 's', data: [0, formatShares[2].share, 0, 0], itemStyle: { color: '#e7e5e4' } },
  ],
}))

onMounted(() => {
  if (!categories.value.length) {
    void idcStore.fetchCategories()
  }
})
</script>

<style scoped>
.block-head { margin-bottom:12px; }
.block-head h3 { font-size:18px; font-weight:800; color:var(--text-primary); }
.chart-kicker { font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--text-muted); font-weight:700; margin-bottom:3px; }
.comparison-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
.comparison-item { padding:14px; border:1px solid var(--border-light); border-radius:14px; background:#F9FAFB; display:flex; flex-direction:column; gap:6px; }
.comparison-item span { color:var(--text-secondary); font-size:12px; }
.comparison-item strong { font-size:24px; font-weight:800; color:var(--text-primary); }
.comparison-item small { color:var(--text-muted); font-size:12px; line-height:1.6; }
.topics-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.topic-card { border:1px solid var(--border-light); border-radius:16px; padding:18px; background:linear-gradient(180deg,#FFFFFF 0%,#F8FAFB 100%); }
.topic-card h4 { font-size:16px; font-weight:800; margin-bottom:6px; }
.topic-card p { color:var(--text-secondary); font-size:13px; margin-bottom:10px; }
.topic-card ul { padding-left:18px; color:var(--text-secondary); display:flex; flex-direction:column; gap:7px; font-size:13px; }
@media (max-width: 900px) { .comparison-grid, .topics-grid { grid-template-columns:1fr; } }
</style>
