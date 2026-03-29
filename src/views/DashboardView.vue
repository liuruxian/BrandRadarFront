<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">系统概览</h2>
        <p class="page-subtitle">实时监控品牌数据采集状态与核心指标</p>
      </div>
      <button class="btn btn-ghost" @click="refresh" :disabled="loading">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" :class="{ 'animate-spin': loading }">
          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        {{ loading ? '刷新中...' : '手动刷新' }}
      </button>
    </div>

    <!-- 服务状态行 -->
    <div class="grid-3" style="margin-bottom:20px">
      <template v-if="health">
        <div class="card animate-fade-up" style="animation-delay:0ms">
          <div class="stat-label">服务状态</div>
          <div class="stat-value" style="margin:8px 0">
            <span class="badge" :class="healthBadgeClass">
              <span class="dot-sm"></span>{{ health.status }}
            </span>
          </div>
          <div class="stat-sub">版本 {{ health.version }} · {{ health.env }}</div>
        </div>
        <div class="card animate-fade-up" style="animation-delay:60ms">
          <div class="stat-label">运行时长</div>
          <div class="stat-value font-mono" style="font-size:22px;color:var(--accent);margin:8px 0">
            {{ formatUptime(health.uptime_seconds) }}
          </div>
          <div class="stat-sub">存储后端：{{ health.db_backend }}</div>
        </div>
        <div class="card animate-fade-up" style="animation-delay:120ms">
          <div class="stat-label">最后更新</div>
          <div class="stat-value" style="font-size:15px;margin:8px 0">
            {{ summary ? formatTime(summary.last_updated) : '—' }}
          </div>
          <div class="stat-sub">品牌：{{ summary?.total_brands ?? '—' }} 个 · 国家：{{ summary?.total_countries ?? '—' }} 个</div>
        </div>
      </template>
      <template v-else-if="loading">
        <div v-for="i in 3" :key="i" class="card">
          <div class="skeleton" style="height:16px;width:60%;margin-bottom:12px"></div>
          <div class="skeleton" style="height:28px;width:80%"></div>
        </div>
      </template>
    </div>

    <!-- 核心指标 -->
    <div class="grid-4" style="margin-bottom:24px">
      <template v-if="summary">
        <div class="card metric-card animate-fade-up" style="animation-delay:80ms">
          <div class="metric-icon" style="color:var(--accent);background:var(--accent-glow)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div class="metric-num">{{ summary.total_products.toLocaleString() }}</div>
          <div class="metric-label">总产品数</div>
        </div>
        <div class="card metric-card animate-fade-up" style="animation-delay:140ms">
          <div class="metric-icon" style="color:var(--green);background:var(--green-glow)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
            </svg>
          </div>
          <div class="metric-num" style="color:var(--green)">{{ summary.total_on_sale.toLocaleString() }}</div>
          <div class="metric-label">在售产品</div>
        </div>
        <div class="card metric-card animate-fade-up" style="animation-delay:200ms">
          <div class="metric-icon" style="color:var(--text-muted);background:rgba(74,85,104,0.15)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="metric-num" style="color:var(--text-secondary)">{{ summary.total_discontinued.toLocaleString() }}</div>
          <div class="metric-label">已下架</div>
        </div>
        <div class="card metric-card animate-fade-up" style="animation-delay:260ms">
          <div class="metric-icon" style="color:var(--amber);background:rgba(255,184,0,0.1)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="metric-num" style="color:var(--amber)">{{ summary.total_brands }}</div>
          <div class="metric-label">品牌数</div>
        </div>
      </template>
      <template v-else-if="loading">
        <div v-for="i in 4" :key="i" class="card metric-card">
          <div class="skeleton" style="height:40px;width:40px;border-radius:10px;margin-bottom:12px"></div>
          <div class="skeleton" style="height:32px;width:70%;margin-bottom:8px"></div>
          <div class="skeleton" style="height:14px;width:50%"></div>
        </div>
      </template>
    </div>

    <!-- 品牌分布 -->
    <div v-if="summary" class="grid-2">
      <div class="card animate-fade-up" style="animation-delay:200ms">
        <div class="card-header"><span class="card-title">品牌产品分布</span></div>
        <div style="height:280px">
          <v-chart :option="pieOption" autoresize style="height:100%" />
        </div>
      </div>
      <div class="card animate-fade-up" style="animation-delay:260ms">
        <div class="card-header"><span class="card-title">品牌详情</span></div>
        <table class="data-table">
          <thead><tr>
            <th>品牌</th><th>总计</th><th>在售</th><th>下架</th><th>在售率</th>
          </tr></thead>
          <tbody>
            <tr v-for="b in summary.by_brand" :key="b.brand">
              <td><span class="brand-tag">{{ b.brand }}</span></td>
              <td class="font-mono">{{ b.total.toLocaleString() }}</td>
              <td class="font-mono" style="color:var(--green)">{{ b.on_sale.toLocaleString() }}</td>
              <td class="font-mono" style="color:var(--text-muted)">{{ b.discontinued.toLocaleString() }}</td>
              <td>
                <div class="mini-bar">
                  <div class="mini-bar-fill" :style="{ width: (b.on_sale / b.total * 100).toFixed(1) + '%' }" />
                </div>
                <span class="font-mono" style="font-size:11px;color:var(--text-secondary)">
                  {{ (b.on_sale / b.total * 100).toFixed(1) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !health" class="empty-state">
      <div style="font-size:40px;margin-bottom:12px">📡</div>
      <div style="color:var(--text-secondary)">无法连接到 BrandRadar 后端服务</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:4px">请确认后端服务已在 http://localhost:8000 启动</div>
      <button class="btn btn-primary" style="margin-top:16px" @click="refresh">重试连接</button>
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

const store = useSystemStore()
const health = computed(() => store.health)
const summary = computed(() => store.summary)
const loading = computed(() => store.loadingHealth || store.loadingSummary)

const healthBadgeClass = computed(() => {
  const s = health.value?.status
  if (s === 'ok') return 'badge-green'
  if (s === 'degraded') return 'badge-amber'
  return 'badge-red'
})

const COLORS = ['#00d4ff', '#00ff88', '#ffb800', '#ff4466', '#a78bfa', '#fb923c']

const pieOption = computed(() => {
  const data = summary.value?.by_brand ?? []
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0d1220',
      borderColor: 'rgba(0,212,255,0.2)',
      textStyle: { color: '#e8f0fe', fontSize: 12 },
      formatter: (p: { name: string; value: number; percent: number; color: string }) =>
        `<span style="color:${p.color}">●</span> ${p.name}<br/><b>${p.value.toLocaleString()}</b> 款 (${p.percent}%)`
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#8899bb', fontSize: 12 },
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      data: data.map((b, i) => ({
        name: b.brand,
        value: b.total,
        itemStyle: { color: COLORS[i % COLORS.length] }
      })),
      label: { show: false },
      emphasis: {
        itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,212,255,0.3)' }
      }
    }]
  }
})

async function refresh() {
  await store.fetchAll()
}

onMounted(() => store.fetchAll())
</script>

<style scoped>
.stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500; }
.stat-sub   { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

.metric-card { display: flex; flex-direction: column; gap: 10px; }
.metric-icon {
  width: 42px; height: 42px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.metric-num {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.03em;
}
.metric-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }

.card-header { margin-bottom: 16px; }
.card-title  { font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }

.brand-tag {
  display: inline-block;
  padding: 2px 8px;
  background: var(--accent-glow);
  color: var(--accent);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.mini-bar {
  width: 80px; height: 4px;
  background: var(--bg-elevated);
  border-radius: 999px;
  overflow: hidden;
  display: inline-block;
  margin-right: 6px;
  vertical-align: middle;
}
.mini-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--green), var(--accent));
  border-radius: 999px;
  transition: width 0.6s var(--ease-out);
}

.dot-sm {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  margin-right: 2px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
