<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">仪表盘</h2>
        <p class="page-subtitle">实时监控品牌数据采集状态与核心指标</p>
      </div>
      <button class="btn btn-ghost" @click="refresh" :disabled="loading">
        {{ loading ? '刷新中...' : '刷新数据' }}
      </button>
    </div>

    <div class="kpi-grid">
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-blue"></div>
        <div class="kpi-body"><div class="kpi-label">总产品数</div><div class="kpi-value">{{ summary ? summary.total_products.toLocaleString() : '—' }}</div></div>
      </div>
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-green"></div>
        <div class="kpi-body">
          <div class="kpi-label">在售产品</div>
          <div class="kpi-value" style="color:var(--green)">{{ summary?.total_on_sale.toLocaleString() ?? '—' }}</div>
          <div v-if="summary"><span class="badge badge-green" style="margin-top:4px">{{ ((summary.total_on_sale/summary.total_products)*100).toFixed(1) }}% 在售率</span></div>
        </div>
      </div>
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-gray"></div>
        <div class="kpi-body"><div class="kpi-label">已下架</div><div class="kpi-value" style="color:var(--text-muted)">{{ summary?.total_discontinued.toLocaleString() ?? '—' }}</div></div>
      </div>
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-purple"></div>
        <div class="kpi-body"><div class="kpi-label">监控品牌</div><div class="kpi-value" style="color:var(--accent)">{{ summary?.total_brands ?? '—' }}</div></div>
      </div>
    </div>

    <div class="grid-2" style="margin-top:20px">
      <div class="card animate-fade-up">
        <div class="card-header"><span class="card-title">品牌分布</span><span class="card-sub">各品牌产品占比</span></div>
        <div style="height:240px" v-if="summary"><v-chart :option="pieOption" autoresize style="height:100%"/></div>
        <div v-else class="chart-ph"></div>
      </div>
      <div class="card animate-fade-up">
        <div class="card-header"><span class="card-title">品牌明细</span><span class="card-sub">产品数量与在售率</span></div>
        <table class="data-table" v-if="summary">
          <thead><tr><th>品牌</th><th>总计</th><th>在售</th><th>在售率</th></tr></thead>
          <tbody>
            <tr v-for="b in summary.by_brand" :key="b.brand">
              <td><span class="brand-tag">{{ b.brand }}</span></td>
              <td class="font-mono" style="color:var(--text-primary);font-weight:600">{{ b.total.toLocaleString() }}</td>
              <td class="font-mono" style="color:var(--green);font-weight:600">{{ b.on_sale.toLocaleString() }}</td>
              <td>
                <div class="rate-bar-wrap">
                  <div class="rate-track"><div class="rate-fill" :style="{width:(b.on_sale/b.total*100).toFixed(1)+'%'}"><div class="rate-dot"/></div></div>
                  <span class="rate-pct">{{ (b.on_sale/b.total*100).toFixed(0) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="loading"><div v-for="i in 5" :key="i" class="skeleton" :style="{height:'40px',marginBottom:'1px'}"/></div>
      </div>
    </div>

    <div class="card system-card animate-fade-up" style="margin-top:20px" v-if="health">
      <div class="sys-row">
        <div class="sys-item"><span class="sys-label">服务状态</span><span class="badge" :class="healthBadgeClass">{{ health.status?.toUpperCase() }}</span></div>
        <div class="sys-item"><span class="sys-label">版本</span><span class="sys-val font-mono">{{ health.version ?? '—' }}</span></div>
        <div class="sys-item"><span class="sys-label">环境</span><span class="sys-val">{{ health.env?.toUpperCase() ?? '—' }}</span></div>
        <div class="sys-item"><span class="sys-label">运行时长</span><span class="sys-val font-mono">{{ health ? formatUptime(health.uptime_seconds) : '—' }}</span></div>
        <div class="sys-item"><span class="sys-label">数据库</span><span class="sys-val">{{ health.db_backend?.toUpperCase() ?? '—' }}</span></div>
        <div class="sys-item" v-if="summary"><span class="sys-label">最后更新</span><span class="sys-val font-mono">{{ formatTime(summary.last_updated) }}</span></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useSystemStore } from '@/stores/systemStore'
import { formatUptime, formatTime } from '@/utils/format'

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const store   = useSystemStore()
const health  = computed(() => store.health)
const summary = computed(() => store.summary)
const loading = computed(() => store.loadingHealth || store.loadingSummary)

const healthBadgeClass = computed(() => {
  const s = health.value?.status
  return s==='ok'?'badge-green':s==='degraded'?'badge-amber':'badge-red'
})

const COLORS = ['#38BDF8','#6366F1','#10B981','#F59E0B','#F97316','#A78BFA']

const pieOption = computed(() => {
  const data = summary.value?.by_brand ?? []
  return {
    backgroundColor:'transparent',
    tooltip:{ trigger:'item', backgroundColor:'rgba(24,28,36,.95)', borderColor:'rgba(255,255,255,.12)', borderWidth:1,
      textStyle:{color:'#E2E8F0',fontSize:12},
      formatter:(p: {name:string;value:number;percent:number;color:string}) =>
        `<b style="color:${p.color}">${p.name}</b><br/>${p.value.toLocaleString()} SKU (${p.percent}%)` },
    legend:{ bottom:0, textStyle:{color:'#94A3B8',fontSize:11}, icon:'circle', itemWidth:8, itemHeight:8 },
    series:[{ type:'pie', radius:['42%','68%'], center:['50%','44%'],
      data:data.map((b,i)=>({ name:b.brand, value:b.total,
        itemStyle:{ color:COLORS[i%COLORS.length], borderWidth:2, borderColor:'rgba(13,17,23,.75)' } })),
      label:{show:false},
      emphasis:{itemStyle:{shadowBlur:16,shadowColor:'rgba(99,102,241,0.2)'}} }]
  }
})

async function refresh() { await store.fetchAll() }
onMounted(() => store.fetchAll())
</script>

<style scoped>
.kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
@media (max-width:1100px) { .kpi-grid { grid-template-columns:repeat(2,1fr); } }
@media (max-width:600px)  { .kpi-grid { grid-template-columns:1fr; } }

.kpi-card { display:flex; align-items:flex-start; gap:14px; padding:20px; background:linear-gradient(135deg, rgba(255,255,255,.07), rgba(255,255,255,.04)); }
.kpi-icon { width:42px; height:42px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; box-shadow: inset 0 0 0 1px rgba(255,255,255,.12); }
.kpi-icon-blue   { background:linear-gradient(135deg, rgba(56,189,248,.25), rgba(59,130,246,.12)); color:#7DD3FC; }
.kpi-icon-green  { background:linear-gradient(135deg, rgba(16,185,129,.26), rgba(6,95,70,.12)); color:#6EE7B7; }
.kpi-icon-gray   { background:linear-gradient(135deg, rgba(148,163,184,.22), rgba(71,85,105,.12)); color:#CBD5E1; }
.kpi-icon-purple { background:linear-gradient(135deg, rgba(129,140,248,.26), rgba(99,102,241,.12)); color:#C4B5FD; }
.kpi-body { flex:1; min-width:0; }
.kpi-label { font-size:12px; color:var(--text-muted); font-weight:500; margin-bottom:4px; }
.kpi-value { font-size:28px; font-weight:800; color:var(--text-primary); line-height:1; font-family:var(--font-data); letter-spacing:-.02em; }

.card-header { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:16px; }
.card-title { font-size:14px; font-weight:700; color:var(--text-primary); }
.card-sub   { font-size:12px; color:var(--text-muted); }

.brand-tag { display:inline-block; padding:2px 8px; background:rgba(59,130,246,.2); color:#BFDBFE; border-radius:999px; font-size:11px; font-weight:600; border:1px solid rgba(59,130,246,.35); }

.rate-bar-wrap { display:flex; align-items:center; gap:8px; }
.rate-track { flex:1; height:4px; background:rgba(255,255,255,.08); border-radius:999px; position:relative; overflow:visible; }
.rate-fill  { height:100%; background:linear-gradient(90deg, #38BDF8, #3B82F6, #6366F1); border-radius:999px; position:relative; transition:width .5s var(--ease-out); }
.rate-dot   { position:absolute; right:-4px; top:50%; transform:translateY(-50%); width:9px; height:9px; background:#60A5FA; border-radius:50%; border:2px solid #0F172A; box-shadow:0 0 10px rgba(59,130,246,0.65); }
.rate-pct   { font-size:11px; font-weight:600; color:var(--text-secondary); min-width:32px; text-align:right; font-family:var(--font-mono); }

.system-card { padding:16px 20px; }
.sys-row { display:flex; flex-wrap:wrap; gap:20px; }
.sys-item { display:flex; flex-direction:column; gap:4px; }
.sys-label { font-size:11px; color:var(--text-muted); font-weight:500; }
.sys-val { font-size:13px; font-weight:600; color:var(--text-primary); }

.chart-ph { height:200px; display:flex; flex-direction:column; justify-content:center; padding:20px; background:rgba(255,255,255,.03); border-radius:12px; border:1px dashed rgba(255,255,255,.12); }
</style>