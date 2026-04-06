<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">
          仪表盘
        </h2>
        <p class="page-subtitle">
          实时监控品牌数据采集状态与核心指标
        </p>
      </div>
      <button
        class="btn btn-ghost"
        :disabled="loading"
        @click="refresh"
      >
        {{ loading ? '刷新中...' : '刷新数据' }}
      </button>
    </div>

    <div class="kpi-grid">
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-blue" />
        <div class="kpi-body">
          <div class="kpi-label">
            总产品数
          </div><div class="kpi-value">
            {{ summary ? summary.total_products.toLocaleString() : '—' }}
          </div>
        </div>
      </div>
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-green" />
        <div class="kpi-body">
          <div class="kpi-label">
            在售产品
          </div>
          <div
            class="kpi-value"
            style="color:var(--green)"
          >
            {{ summary?.total_on_sale.toLocaleString() ?? '—' }}
          </div>
          <div v-if="summary">
            <span
              class="badge badge-green"
              style="margin-top:4px"
            >{{ ((summary.total_on_sale/summary.total_products)*100).toFixed(1) }}% 在售率</span>
          </div>
        </div>
      </div>
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-gray" />
        <div class="kpi-body">
          <div class="kpi-label">
            已下架
          </div><div
            class="kpi-value"
            style="color:var(--text-muted)"
          >
            {{ summary?.total_discontinued.toLocaleString() ?? '—' }}
          </div>
        </div>
      </div>
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-purple" />
        <div class="kpi-body">
          <div class="kpi-label">
            监控品牌
          </div><div
            class="kpi-value"
            style="color:var(--accent)"
          >
            {{ summary?.total_brands ?? '—' }}
          </div>
        </div>
      </div>
    </div>

    <div
      class="grid-2"
      style="margin-top:20px"
    >
      <div class="card animate-fade-up">
        <div class="card-header">
          <span class="card-title">品牌分布</span><span class="card-sub">各品牌产品占比</span>
        </div>
        <div
          v-if="summary"
          style="height:240px"
        >
          <v-chart
            :option="pieOption"
            autoresize
            style="height:100%"
          />
        </div>
        <div
          v-else
          class="chart-ph"
        />
      </div>
      <div class="card animate-fade-up">
        <div class="card-header">
          <span class="card-title">品牌明细</span><span class="card-sub">产品数量与在售率</span>
        </div>
        <table
          v-if="summary"
          class="data-table"
        >
          <thead><tr><th>品牌</th><th>总计</th><th>在售</th><th>在售率</th></tr></thead>
          <tbody>
            <tr
              v-for="b in summary.by_brand"
              :key="b.brand"
            >
              <td><span class="brand-tag">{{ b.brand }}</span></td>
              <td
                class="font-mono"
                style="color:var(--text-primary);font-weight:600"
              >
                {{ b.total.toLocaleString() }}
              </td>
              <td
                class="font-mono"
                style="color:var(--green);font-weight:600"
              >
                {{ b.on_sale.toLocaleString() }}
              </td>
              <td>
                <div class="rate-bar-wrap">
                  <div class="rate-track">
                    <div
                      class="rate-fill"
                      :style="{width:(b.on_sale/b.total*100).toFixed(1)+'%'}"
                    >
                      <div class="rate-dot" />
                    </div>
                  </div>
                  <span class="rate-pct">{{ (b.on_sale/b.total*100).toFixed(0) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="loading">
          <div
            v-for="i in 5"
            :key="i"
            class="skeleton"
            :style="{height:'40px',marginBottom:'1px'}"
          />
        </div>
      </div>
    </div>

    <div
      v-if="health"
      class="card system-card animate-fade-up"
      style="margin-top:20px"
    >
      <div class="sys-row">
        <div class="sys-item">
          <span class="sys-label">服务状态</span><span
            class="badge"
            :class="healthBadgeClass"
          >{{ health.status?.toUpperCase() }}</span>
        </div>
        <div class="sys-item">
          <span class="sys-label">版本</span><span class="sys-val font-mono">{{ health.version ?? '—' }}</span>
        </div>
        <div class="sys-item">
          <span class="sys-label">环境</span><span class="sys-val">{{ health.env?.toUpperCase() ?? '—' }}</span>
        </div>
        <div class="sys-item">
          <span class="sys-label">运行时长</span><span class="sys-val font-mono">{{ health ? formatUptime(health.uptime_seconds) : '—' }}</span>
        </div>
        <div class="sys-item">
          <span class="sys-label">数据库</span><span class="sys-val">{{ health.db_backend?.toUpperCase() ?? '—' }}</span>
        </div>
        <div
          v-if="summary"
          class="sys-item"
        >
          <span class="sys-label">最后更新</span><span class="sys-val font-mono">{{ formatTime(summary.last_updated) }}</span>
        </div>
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

const COLORS = ['#00C4CC','#8A7FFF','#10B981','#F59E0B','#FF6B6B','#6366F1']

const pieOption = computed(() => {
  const data = summary.value?.by_brand ?? []
  return {
    backgroundColor:'transparent',
    tooltip:{ trigger:'item', backgroundColor:'#FFFFFF', borderColor:'#E5E7EB', borderWidth:1,
      textStyle:{color:'#374151',fontSize:12},
      formatter:(p: {name:string;value:number;percent:number;color:string}) =>
        `<b style="color:${p.color}">${p.name}</b><br/>${p.value.toLocaleString()} SKU (${p.percent}%)` },
    legend:{ bottom:0, textStyle:{color:'#6B7280',fontSize:11}, icon:'circle', itemWidth:8, itemHeight:8 },
    series:[{ type:'pie', radius:['42%','68%'], center:['50%','44%'],
      data:data.map((b,i)=>({ name:b.brand, value:b.total,
        itemStyle:{ color:COLORS[i%COLORS.length], borderWidth:2, borderColor:'#FFFFFF' } })),
      label:{show:false},
      emphasis:{itemStyle:{shadowBlur:10,shadowColor:'rgba(0,196,204,0.2)'}} }]
  }
})

async function refresh() { await store.fetchAll() }
onMounted(() => store.fetchAll())
</script>

<style scoped>
.kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
@media (max-width:1100px) { .kpi-grid { grid-template-columns:repeat(2,1fr); } }
@media (max-width:600px)  { .kpi-grid { grid-template-columns:1fr; } }

.kpi-card { display:flex; align-items:flex-start; gap:14px; padding:20px; background:#FFFFFF; border:1px solid #E5E7EB; }
.kpi-icon { width:42px; height:42px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; box-shadow:none; border:1px solid #E5E7EB; }
.kpi-icon-blue   { background:rgba(0,196,204,.08); color:#00AAB1; }
.kpi-icon-green  { background:rgba(16,185,129,.1); color:#10B981; }
.kpi-icon-gray   { background:#F3F4F6; color:#6B7280; }
.kpi-icon-purple { background:rgba(138,127,255,.12); color:#8A7FFF; }
.kpi-body { flex:1; min-width:0; }
.kpi-label { font-size:12px; color:var(--text-muted); font-weight:500; margin-bottom:4px; }
.kpi-value { font-size:28px; font-weight:800; color:var(--text-primary); line-height:1; font-family:var(--font-data); letter-spacing:-.02em; }

.card-header { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:16px; }
.card-title { font-size:14px; font-weight:700; color:var(--text-primary); }
.card-sub   { font-size:12px; color:var(--text-muted); }

.brand-tag { display:inline-block; padding:2px 8px; background:rgba(0,196,204,.1); color:#00AAB1; border-radius:999px; font-size:11px; font-weight:600; border:1px solid rgba(0,196,204,.28); }

.rate-bar-wrap { display:flex; align-items:center; gap:8px; }
.rate-track { flex:1; height:4px; background:#EEF2F7; border-radius:999px; position:relative; overflow:visible; }
.rate-fill  { height:100%; background:linear-gradient(90deg, #00C4CC, #8A7FFF); border-radius:999px; position:relative; transition:width .5s var(--ease-out); }
.rate-dot   { position:absolute; right:-4px; top:50%; transform:translateY(-50%); width:9px; height:9px; background:#00C4CC; border-radius:50%; border:2px solid #FFFFFF; box-shadow:none; }
.rate-pct   { font-size:11px; font-weight:600; color:var(--text-secondary); min-width:32px; text-align:right; font-family:var(--font-mono); }

.system-card { padding:16px 20px; background:#FFFFFF; border:1px solid #E5E7EB; }
.sys-row { display:flex; flex-wrap:wrap; gap:20px; }
.sys-item { display:flex; flex-direction:column; gap:4px; }
.sys-label { font-size:11px; color:var(--text-muted); font-weight:500; }
.sys-val { font-size:13px; font-weight:600; color:var(--text-primary); }

.chart-ph { height:200px; display:flex; flex-direction:column; justify-content:center; padding:20px; background:rgba(255,255,255,.03); border-radius:12px; border:1px dashed rgba(255,255,255,.12); }
</style>