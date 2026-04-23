<template>
  <div class="page-container">
    <!-- KPI 指标网格 -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon-blue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="kpi-body">
          <div class="kpi-label">总产品数</div>
          <div class="kpi-value">{{ summary ? summary.total_products.toLocaleString() : '—' }}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon-green">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="kpi-body">
          <div class="kpi-label">在售产品</div>
          <div class="kpi-value kpi-value-green">{{ summary?.total_on_sale.toLocaleString() ?? '—' }}</div>
          <div v-if="summary" class="kpi-sub">{{ ((summary.total_on_sale/summary.total_products)*100).toFixed(1) }}% 在售率</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon-gray">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="kpi-body">
          <div class="kpi-label">已下架</div>
          <div class="kpi-value kpi-value-muted">{{ summary?.total_discontinued.toLocaleString() ?? '—' }}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon-purple">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </div>
        <div class="kpi-body">
          <div class="kpi-label">监控品牌</div>
          <div class="kpi-value kpi-value-accent">{{ summary?.total_brands ?? '—' }}</div>
        </div>
      </div>
    </div>

    <!-- 品牌分布 + 品牌明细 -->
    <div class="detail-grid">
      <div class="card">
        <div class="card-head">
          <span class="card-title">品牌分布</span>
          <span class="card-sub">各品牌产品占比</span>
        </div>
        <div v-if="summary" style="height:200px">
          <v-chart :option="pieOption" autoresize style="height:100%" />
        </div>
        <div v-else class="chart-ph" />
      </div>
      <div class="card">
        <div class="card-head">
          <span class="card-title">品牌明细</span>
          <span class="card-sub">产品数量与在售率</span>
        </div>
        <table v-if="summary" class="data-table">
          <thead><tr><th>品牌</th><th>总计</th><th>在售</th><th>在售率</th></tr></thead>
          <tbody>
            <tr v-for="b in summary.by_brand" :key="b.brand">
              <td><span class="brand-tag">{{ b.brand }}</span></td>
              <td class="font-mono font-bold">{{ b.total.toLocaleString() }}</td>
              <td class="font-mono font-bold green">{{ b.on_sale.toLocaleString() }}</td>
              <td>
                <div class="rate-bar-wrap">
                  <div class="rate-track">
                    <div class="rate-fill" :style="{width:(b.on_sale/b.total*100).toFixed(1)+'%'}" />
                  </div>
                  <span class="rate-pct">{{ (b.on_sale/b.total*100).toFixed(0) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="loading" class="skeleton-list">
          <div v-for="i in 5" :key="i" class="skeleton skeleton-row" />
        </div>
      </div>
    </div>

    <!-- 系统状态 -->
    <div v-if="health" class="card sys-card">
      <div class="sys-row">
        <div class="sys-item">
          <span class="sys-label">服务状态</span>
          <span class="badge" :class="healthBadgeClass">{{ health.status?.toUpperCase() }}</span>
        </div>
        <div class="sys-item">
          <span class="sys-label">版本</span>
          <span class="sys-val font-mono">{{ health.version ?? '—' }}</span>
        </div>
        <div class="sys-item">
          <span class="sys-label">环境</span>
          <span class="sys-val">{{ health.env?.toUpperCase() ?? '—' }}</span>
        </div>
        <div class="sys-item">
          <span class="sys-label">运行时长</span>
          <span class="sys-val font-mono">{{ formatUptime(health.uptime_seconds) }}</span>
        </div>
        <div class="sys-item">
          <span class="sys-label">数据库</span>
          <span class="sys-val">{{ health.db_backend?.toUpperCase() ?? '—' }}</span>
        </div>
        <div v-if="summary" class="sys-item">
          <span class="sys-label">最后更新</span>
          <span class="sys-val font-mono">{{ formatTime(summary.last_updated) }}</span>
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

const COLORS = ['#004ac6','#2563eb','#06b6d4','#f59e0b','#34d399','#f87171']

const pieOption = computed(() => {
  const data = summary.value?.by_brand ?? []
  return {
    backgroundColor:'transparent',
    tooltip:{
      trigger:'item',
      backgroundColor:'#FFFFFF',
      borderColor:'#e2e8f0',
      borderWidth:1,
      textStyle:{color:'#374151',fontSize:12},
      shadowColor:'rgba(0, 74, 198, 0.06)',
      shadowBlur:6,
      formatter:(p: {name:string;value:number;percent:number;color:string}) =>
        `<b style="color:${p.color}">${p.name}</b><br/>${p.value.toLocaleString()} SKU (${p.percent}%)`
    },
    legend:{ bottom:0, textStyle:{color:'#6b7280',fontSize:11}, icon:'circle', itemWidth:8, itemHeight:8 },
    series:[{
      type:'pie',
      radius:['55%','80%'],
      center:['50%','45%'],
      data: data.map((b,i)=>({ name:b.brand, value:b.total,
        itemStyle:{ color:COLORS[i%COLORS.length], borderWidth:2, borderColor:'#ffffff' }
      })),
      label:{ show:false },
      emphasis:{ scale:true, scaleSize:6, itemStyle:{shadowBlur:16,shadowColor:'rgba(0, 74, 198, 0.15)'} }
    }]
  }
})

async function refresh() { await store.fetchAll() }
onMounted(() => store.fetchAll())
</script>

<style scoped>
/* inherits from global .page-container, .card */

/* ─── KPI 网格 ─── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--dt-space-3);
}
@media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px)  { .kpi-grid { grid-template-columns: 1fr; } }

/* KPI 卡片 - 顶部彩色强调条 + 图标右上角 */
.kpi-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e8eaed;
  border-radius: var(--dt-radius-md);
  padding: 16px 16px 16px 16px;
  overflow: hidden;
}
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.kpi-card:nth-child(1)::before { background: #2563eb; }
.kpi-card:nth-child(2)::before { background: #10b981; }
.kpi-card:nth-child(3)::before { background: #94a3b8; }
.kpi-card:nth-child(4)::before { background: #004ac6; }

.kpi-icon {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border-radius: var(--dt-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-icon-blue   { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
.kpi-icon-green  { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.kpi-icon-gray   { background: #f1f5f9; color: #94a3b8; }
.kpi-icon-purple { background: rgba(0, 74, 198, 0.1); color: #004ac6; }

.kpi-body { min-width: 0; }
.kpi-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  margin-bottom: 6px;
}
.kpi-value {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  font-family: var(--dt-font-mono);
  letter-spacing: -0.03em;
}
.kpi-value-green  { color: #10b981; }
.kpi-value-muted { color: #94a3b8; }
.kpi-value-accent { color: #004ac6; }
.kpi-sub { font-size: 11px; color: #94a3b8; margin-top: 4px; }

/* ─── 两栏布局 ─── */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dt-space-3);
}
@media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } }

/* ─── 品牌标签 ─── */
.brand-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  background: rgba(0, 74, 198, 0.06);
  color: #004ac6;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(0, 74, 198, 0.12);
}

/* ─── 进度条 ─── */
.rate-bar-wrap { display: flex; align-items: center; gap: var(--dt-space-2); }
.rate-track {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}
.rate-fill {
  height: 100%;
  background: linear-gradient(90deg, #004ac6, #2563eb);
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.rate-pct { font-size: 11px; font-weight: 600; color: #64748b; min-width: 32px; text-align: right; }

/* ─── 系统卡片 ─── */
.sys-card { padding: var(--dt-space-3) var(--dt-space-4); }
.sys-row { display: flex; flex-wrap: wrap; gap: var(--dt-space-5); }
.sys-item { display: flex; flex-direction: column; gap: var(--dt-space-1); }
.sys-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
.sys-val { font-size: var(--dt-text-sm); font-weight: 600; color: #0f172a; }

/* ─── 图表占位符 ─── */
.chart-ph {
  height: 180px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px dashed #e2e8f0;
  border-radius: var(--dt-radius-md);
}

/* ─── 骨架屏 ─── */
.skeleton-list { display: flex; flex-direction: column; gap: var(--dt-space-1); }
.skeleton-row { height: 36px; border-radius: var(--dt-radius-sm); }

/* ─── 字体辅助 ─── */
.font-mono { font-family: var(--dt-font-mono); }
.font-bold { font-weight: 700; }
.green { color: #10b981; }
</style>
