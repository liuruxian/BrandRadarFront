<template>
  <div class="page-container">
    <!-- 页面头部 - 参照IDC模块风格 -->
    <div class="page-header idc-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div class="header-title">
          <h1>仪表盘</h1>
          <p class="header-desc">实时监控品牌数据采集状态与核心指标</p>
        </div>
      </div>
      <div class="header-right">
        <button
          class="btn btn-idc"
          :disabled="loading"
          @click="refresh"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
            <path d="M21 12a9 9 0 11-9-9"/>
            <path d="M21 3v6h-6"/>
          </svg>
          {{ loading ? '刷新中...' : '刷新数据' }}
        </button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-blue">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="kpi-body">
          <div class="kpi-label">总产品数</div>
          <div class="kpi-value">{{ summary ? summary.total_products.toLocaleString() : '—' }}</div>
        </div>
      </div>
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-green">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="kpi-body">
          <div class="kpi-label">在售产品</div>
          <div class="kpi-value kpi-value-green">{{ summary?.total_on_sale.toLocaleString() ?? '—' }}</div>
          <div v-if="summary">
            <span class="badge badge-green" style="margin-top:4px">{{ ((summary.total_on_sale/summary.total_products)*100).toFixed(1) }}% 在售率</span>
          </div>
        </div>
      </div>
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-gray">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-icon kpi-icon-purple">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

const WEB3_COLORS = ['#ec4899','#8b5cf6','#06b6d4','#f59e0b','#34d399','#f87171']

const pieOption = computed(() => {
  const data = summary.value?.by_brand ?? []
  return {
    backgroundColor:'transparent',
    tooltip:{ trigger:'item',
      backgroundColor:'#FFFFFF',
      borderColor:'#e2e8f0',
      borderWidth:1,
      textStyle:{color:'#44403c',fontSize:12},
      shadowColor:'rgba(236, 72, 153, 0.1)',
      shadowBlur:8,
      formatter:(p: {name:string;value:number;percent:number;color:string}) =>
        `<b style="color:${p.color}">${p.name}</b><br/>${p.value.toLocaleString()} SKU (${p.percent}%)` },
    legend:{ bottom:0, textStyle:{color:'#4b5563',fontSize:11}, icon:'circle', itemWidth:10, itemHeight:10 },
    series:[{ type:'pie', radius:['65%','85%'], center:['50%','44%'],
      data:data.map((b,i)=>({ name:b.brand, value:b.total,
        itemStyle:{
          color:WEB3_COLORS[i%WEB3_COLORS.length],
          borderWidth:2,
          borderColor:'#FFFFFF'
        } })),
      label:{show:false},
      emphasis:{
        scale:true,
        scaleSize:8,
        itemStyle:{shadowBlur:20,shadowColor:'rgba(236, 72, 153, 0.3)'}
      } }]
  }
})

async function refresh() { await store.fetchAll() }
onMounted(() => store.fetchAll())
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 20px; padding: 0; }
/* ─── 页面头部 (IDC统一风格) ─── */
.idc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.25);
}

.header-left { display: flex; align-items: center; gap: 16px; }
.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  color: white;
}
.header-title h1 { font-size: 22px; font-weight: 700; color: white; margin: 0; line-height: 1.2; }
.header-desc { font-size: 13px; color: rgba(255, 255, 255, 0.85); margin: 4px 0 0; }
.header-right { display: flex; align-items: center; gap: 12px; }

/* ─── 按钮 (IDC统一风格) ─── */
.btn-idc {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}
.btn-idc:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}
.btn-idc:active { transform: translateY(0) scale(0.98); }
.btn-idc:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-idc:disabled:hover { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.3); }
.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── KPI 网格 (增强悬浮) ─── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
@media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px)  { .kpi-grid { grid-template-columns: 1fr; } }

/* KPI 卡片 - 高级感 */
.kpi-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 22px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.02),
    0 4px 6px -1px rgba(15, 23, 42, 0.02),
    0 0 0 1px rgba(15, 23, 42, 0.02) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--icon-color, linear-gradient(180deg, #667EEA, #764BA2));
  border-radius: 20px 0 0 20px;
  opacity: 0.8;
  transition: all 0.3s ease;
}
.kpi-card:hover {
  transform: translateY(-6px) scale(1.01);
  border-color: rgba(102, 126, 234, 0.25);
  box-shadow:
    0 20px 25px -5px rgba(102, 126, 234, 0.08),
    0 8px 10px -6px rgba(118, 75, 162, 0.04),
    0 0 0 1px rgba(102, 126, 234, 0.1);
}
.kpi-card:hover::before {
  width: 5px;
  opacity: 1;
}

/* KPI 图标 - 渐变背景 */
.kpi-icon {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.kpi-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0.12;
  transition: opacity 0.3s ease;
}
.kpi-card:hover .kpi-icon {
  transform: scale(1.08) rotate(-3deg);
}
.kpi-icon-blue   { background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1)); color: #3B82F6; }
.kpi-icon-green  { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08)); color: #10B981; }
.kpi-icon-gray   { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); color: #64748B; }
.kpi-icon-purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.08)); color: #8B5CF6; }

.kpi-body {
  position: relative;
  flex: 1;
  min-width: 0;
}
.kpi-label {
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
  margin-bottom: 8px;
  letter-spacing: 0.01em;
}
.kpi-value {
  font-size: 30px;
  font-weight: 800;
  color: #0F172A;
  line-height: 1;
  font-family: var(--font-mono);
  letter-spacing: -0.03em;
  transition: all 0.3s ease;
}
.kpi-card:hover .kpi-value {
  letter-spacing: -0.02em;
}
.kpi-value-green  { color: #059669; }
.kpi-value-muted { color: #64748B; }
.kpi-value-accent { color: #7C3AED; }

/* ─── 卡片头部 ─── */
.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.card-title { font-size: 15px; font-weight: 700; color: #0F172A; letter-spacing: -0.01em; }
.card-sub   { font-size: 13px; color: #94A3B8; }

/* ─── 品牌标签 (胶囊渐变) ─── */
.brand-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.08));
  color: #667EEA;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.2s ease;
}
.brand-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.12));
}

/* ─── 进度条 ─── */
.rate-bar-wrap { display: flex; align-items: center; gap: 10px; }
.rate-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 999px; position: relative; overflow: visible; }
.rate-fill  {
  height: 100%;
  background: linear-gradient(90deg, #667EEA, #764BA2);
  border-radius: 999px;
  position: relative;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.rate-fill::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #667EEA, #764BA2);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}
.kpi-card:hover .rate-fill::after {
  width: 14px;
  height: 14px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}
.rate-pct   { font-size: 12px; font-weight: 600; color: #64748B; min-width: 36px; text-align: right; font-family: var(--font-mono); }

/* ─── 系统卡片 ─── */
.system-card {
  padding: 20px 24px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  transition: all 0.3s ease;
}
.system-card:hover {
  border-color: rgba(102, 126, 234, 0.2);
  box-shadow: 0 10px 20px -5px rgba(102, 126, 234, 0.06);
}
.sys-row { display: flex; flex-wrap: wrap; gap: 24px; }
.sys-item { display: flex; flex-direction: column; gap: 6px; }
.sys-label { font-size: 12px; color: #94A3B8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
.sys-val { font-size: 14px; font-weight: 600; color: #0F172A; }

/* ─── 图表占位符 ─── */
.chart-ph {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  border: 1px dashed #e2e8f0;
}

/* ─── 表格行悬浮 ─── */
:deep(.data-table tbody tr:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.04), rgba(118, 75, 162, 0.02));
}
</style>