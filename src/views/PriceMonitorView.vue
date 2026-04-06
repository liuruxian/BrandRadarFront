<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">
          价格监控
        </h2>
        <p class="page-subtitle">
          追踪价格波动 · 发现商机 · 实时情报
        </p>
      </div>
      <button
        class="btn btn-ghost"
        :disabled="loading"
        @click="doRefresh"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="square"
          :class="{'animate-spin':loading}"
        >
          <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        {{ loading ? '刷新中...' : '刷新' }}
      </button>
    </div>

    <div class="main-layout">
      <div class="main-content">
        <div
          class="card filter-bar"
          style="margin-bottom:16px"
        >
          <div class="filter-row">
            <div class="filter-item">
              <label class="filter-label">品牌</label>
              <select
                v-model="params.brand"
                class="select"
              >
                <option value="">
                  全部品牌
                </option>
                <option
                  v-for="b in brands"
                  :key="b"
                  :value="b"
                >
                  {{ b }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label class="filter-label">国家</label>
              <select
                v-model="params.country"
                class="select"
              >
                <option value="">
                  全部国家
                </option>
                <option
                  v-for="c in allCountries"
                  :key="c"
                  :value="c"
                >
                  {{ c }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label class="filter-label">关键词</label>
              <input
                v-model.trim="params.keyword"
                class="input"
                placeholder="输入内容"
              >
            </div>
            <div class="filter-item">
              <label class="filter-label">方向</label>
              <select
                v-model="params.direction"
                class="select"
              >
                <option value="all">
                  全部
                </option>
                <option value="up">
                  仅涨价
                </option>
                <option value="down">
                  仅降价
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label class="filter-label">条数</label>
              <select
                v-model.number="params.limit"
                class="select"
              >
                <option :value="50">
                  50 条
                </option>
                <option :value="100">
                  100 条
                </option>
                <option :value="200">
                  200 条
                </option>
                <option :value="500">
                  500 条
                </option>
              </select>
            </div>
            <div class="filter-actions">
              <button
                class="btn btn-primary"
                :disabled="loading"
                @click="doRefresh"
              >
                查询
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="!loading && filteredChanges.length"
          class="stats-row"
        >
          <div
            class="card stat-chip animate-fade-up"
            style="animation-delay:0ms"
          >
            <div class="filter-label">
              变动总数
            </div>
            <div class="stat-num font-mono">
              {{ filteredChanges.length }}
            </div>
          </div>
          <div
            class="card stat-chip animate-fade-up"
            style="animation-delay:40ms;border-color:rgba(255,107,107,.35);box-shadow:none"
          >
            <div class="filter-label">
              涨价
            </div>
            <div
              class="stat-num font-mono"
              style="color:var(--red)"
            >
              {{ upCount }}
            </div>
          </div>
          <div
            class="card stat-chip animate-fade-up"
            style="animation-delay:80ms;border-color:rgba(0,196,204,.35);box-shadow:none"
          >
            <div class="filter-label">
              降价
            </div>
            <div
              class="stat-num font-mono"
              style="color:var(--accent)"
            >
              {{ downCount }}
            </div>
          </div>
        </div>

        <div
          v-if="filteredChanges.length"
          class="card trend-card"
        >
          <div
            class="table-header"
            style="margin-bottom:6px"
          >
            <span class="filter-label">7天趋势（前端聚合）</span>
          </div>
          <div class="trend-grid">
            <div
              v-for="item in trendBuckets"
              :key="item.date"
              class="trend-col"
            >
              <div class="trend-bars">
                <div
                  class="trend-bar up"
                  :style="{ height: `${item.upHeight}%` }"
                  title="涨价"
                />
                <div
                  class="trend-bar down"
                  :style="{ height: `${item.downHeight}%` }"
                  title="降价"
                />
              </div>
              <div class="trend-date">
                {{ item.date.slice(5) }}
              </div>
              <div class="trend-count">
                {{ item.total }}
              </div>
            </div>
          </div>
        </div>

        <div
          class="card animate-fade-up"
          style="animation-delay:100ms"
        >
          <div class="table-header">
            <span class="filter-label">价格变动记录</span>
            <span
              class="font-mono"
              style="font-size:10px;color:var(--text-muted)"
            >{{ filteredChanges.length }} ENTRIES</span>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>品牌</th><th>型号</th><th>国家</th><th>最新价格</th><th>上一次价格</th><th>变动</th><th>操作</th>
                </tr>
              </thead>
              <tbody v-if="!loading">
                <tr
                  v-for="c in filteredChanges"
                  :key="c.time + c.product_id"
                  :class="c.change_pct > 0 ? 'row-up' : 'row-down'"
                  class="change-row"
                >
                  <td><span class="brand-chip">{{ c.brand }}</span></td>
                  <td><span class="model-text">{{ c.model }}</span></td>
                  <td><span class="region-chip">{{ c.country }}</span></td>
                  <td><span class="font-mono new-price">{{ c.new_price }}</span></td>
                  <td><span class="font-mono old-price">{{ c.old_price }}</span></td>
                  <td>
                    <div class="delta-cell">
                      <span
                        class="delta-badge"
                        :class="c.change_pct > 0 ? 'delta-up' : 'delta-down'"
                      >
                        <span class="arrow">{{ c.change_pct > 0 ? '↑' : '↓' }}</span>
                        {{ formatChangePct(c.change_pct) }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      class="btn-link"
                      @click="openHistory(c)"
                    >
                      历史价格
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredChanges.length === 0">
                  <td
                    colspan="7"
                    class="empty-row"
                  >
                    暂无价格变动记录
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr
                  v-for="i in 8"
                  :key="i"
                >
                  <td
                    v-for="j in 8"
                    :key="j"
                  >
                    <div
                      class="skeleton"
                      style="height:13px"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="sidebar">
        <div class="card alert-panel">
          <div class="panel-header">
            <span class="panel-title">待处理告警</span>
            <span
              v-if="pendingAlerts.length"
              class="badge badge-red"
            >{{ pendingAlerts.length }}</span>
          </div>
          <div class="alert-list">
            <div
              v-if="pendingAlerts.length === 0"
              class="empty-alert"
            >
              暂无告警
            </div>
            <div
              v-for="alert in pendingAlerts.slice(0, 10)"
              :key="alert.id"
              class="alert-item"
            >
              <div class="alert-brand">
                {{ alert.brand || '—' }}
              </div>
              <div class="alert-meta">
                <span class="alert-type">{{ alert.alert_type || 'Parser' }}</span>
                <span class="alert-time">{{ formatRelative(alert.last_seen_at || '') }}</span>
              </div>
              <div class="alert-count">
                {{ alert.trigger_count || 1 }}x
              </div>
              <div class="alert-actions">
                <button
                  class="tiny-btn tiny-approve"
                  :disabled="decidingAlertId === alert.id"
                  @click="decide(alert.id, 'approved')"
                >
                  通过
                </button>
                <button
                  class="tiny-btn tiny-reject"
                  :disabled="decidingAlertId === alert.id"
                  @click="decide(alert.id, 'rejected')"
                >
                  拒绝
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card alert-panel">
          <div class="panel-header">
            <span class="panel-title">Top价格波动榜</span>
          </div>
          <div class="alert-list">
            <div
              v-if="topVolatility.length === 0"
              class="empty-alert"
            >
              暂无数据
            </div>
            <div
              v-for="item in topVolatility"
              :key="item.time + item.product_id"
              class="alert-item top-item"
            >
              <div class="alert-brand">
                {{ item.model || item.product_id }}
              </div>
              <div class="alert-meta">
                <span>{{ item.brand }} · {{ item.country }}</span>
                <span :class="item.change_pct > 0 ? 'delta-up' : 'delta-down'">{{ formatChangePct(item.change_pct) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="drawerOpen"
      class="drawer-overlay"
      @click="closeDrawer"
    >
      <div
        class="drawer"
        @click.stop
      >
        <div class="drawer-header">
          <h3>{{ selectedChange?.model }} · 历史价格</h3>
          <button
            class="btn-close"
            @click="closeDrawer"
          >
            ✕
          </button>
        </div>
        <div class="drawer-body">
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">品牌</span><span class="info-value">{{ selectedChange?.brand }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">国家</span><span class="info-value">{{ selectedChange?.country }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">最新价格</span><span class="info-value new-price">{{ selectedChange?.new_price }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">上一次价格</span><span class="info-value old-price">{{ selectedChange?.old_price }}</span>
            </div>
          </div>
          <div class="info-section">
            <div class="section-title">
              价格变化趋势图
            </div>
            <div class="mini-chart">
              <div class="chart-line" />
              <div
                v-for="(p, idx) in historyPoints"
                :key="idx"
                class="chart-point"
                :style="{ left: p.x + '%', bottom: p.y + '%' }"
              >
                <span class="pt-label">{{ p.label }}</span>
              </div>
            </div>
            <p class="chart-tip">
              当前版本先展示“上一次价格 → 最新价格”的趋势，后续可在后端补充历史序列接口后切换为真实多点数据。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMonitorStore } from '@/stores/monitorStore'
import { useAuthStore } from '@/stores/authStore'
import { monitorApi } from '@/api/monitorApi'
import { productsApi } from '@/api/productsApi'
import { formatChangePct, formatRelative } from '@/utils/format'

const store = useMonitorStore()
const authStore = useAuthStore()
const changes = computed(() => store.changes)
const loading = computed(() => store.loading)
const pendingAlerts = computed(() => store.pendingAlerts)

const brands = ref<string[]>([])
const allCountries = ref<string[]>([])
const params = ref({ brand: '', country: '', keyword: '', direction: 'all' as 'all' | 'up' | 'down', limit: 100 })

const filteredChanges = computed(() => {
  return changes.value.filter((c) => {
    const byDirection = params.value.direction === 'all' ? true : params.value.direction === 'up' ? c.change_pct > 0 : c.change_pct < 0
    const kw = params.value.keyword.toLowerCase()
    const byKeyword = !kw || [c.product_id, c.model, c.brand, c.country].some((s) => String(s || '').toLowerCase().includes(kw))
    return byDirection && byKeyword
  })
})

const upCount = computed(() => filteredChanges.value.filter(c => c.change_pct > 0).length)
const downCount = computed(() => filteredChanges.value.filter(c => c.change_pct < 0).length)
const topVolatility = computed(() => [...filteredChanges.value].sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct)).slice(0, 6))

const trendBuckets = computed(() => {
  const days: string[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }

  const map = new Map(days.map((d) => [d, { date: d, up: 0, down: 0, total: 0, upHeight: 0, downHeight: 0 }]))
  for (const c of filteredChanges.value) {
    const key = c.time?.slice(0, 10)
    const row = map.get(key)
    if (!row) continue
    if (c.change_pct > 0) row.up += 1
    if (c.change_pct < 0) row.down += 1
    row.total += 1
  }
  const list = [...map.values()]
  const max = Math.max(1, ...list.map((x) => x.total))
  return list.map((x) => ({ ...x, upHeight: (x.up / max) * 100, downHeight: (x.down / max) * 100 }))
})

const drawerOpen = ref(false)
const selectedChange = ref<any>(null)
const historyPoints = ref<Array<{ x: number; y: number; label: string }>>([])
const decidingAlertId = ref<string | null>(null)

async function doRefresh() {
  const p: Record<string, unknown> = { limit: params.value.limit }
  if (params.value.brand) p.brand = params.value.brand
  if (params.value.country) p.country = params.value.country
  await store.fetchPriceChanges(p as Parameters<typeof store.fetchPriceChanges>[0])
}

watch(() => params.value.brand, async (brand) => {
  const res = await productsApi.getCountries(brand || undefined)
  if (res.success && res.data) allCountries.value = res.data
  if (brand && params.value.country && !allCountries.value.includes(params.value.country)) {
    params.value.country = ''
  }
})

function normalizePrice(v: unknown) {
  const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function buildHistoryPoints(change: any) {
  const prev = normalizePrice(change.old_price)
  const curr = normalizePrice(change.new_price)
  const max = Math.max(prev, curr, 1)
  return [
    { x: 8, y: (prev / max) * 78 + 8, label: `上一次: ${change.old_price}` },
    { x: 88, y: (curr / max) * 78 + 8, label: `最新: ${change.new_price}` },
  ]
}

function openHistory(change: any) {
  selectedChange.value = change
  historyPoints.value = buildHistoryPoints(change)
  drawerOpen.value = true
}

async function decide(alertId: string, decision: 'approved' | 'rejected') {
  const operator = authStore.me?.username || 'frontend'
  decidingAlertId.value = alertId
  try {
    const res = await monitorApi.decideAlert(alertId, { decision, operator })
    if (res.success) await store.fetchPendingAlerts()
  } finally {
    decidingAlertId.value = null
  }
}

function closeDrawer() {
  drawerOpen.value = false
  selectedChange.value = null
  historyPoints.value = []
}

onMounted(async () => {
  const [br, co] = await Promise.all([productsApi.getBrands(), productsApi.getCountries()])
  if (br.success && br.data) brands.value = br.data
  if (co.success && co.data) allCountries.value = co.data
  await store.fetchPriceChanges({ limit: 100 })
  await store.fetchPendingAlerts()
})
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 20px; }
.main-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
@media (max-width: 1200px) { .main-layout { grid-template-columns: 1fr; } }
.main-content { display: flex; flex-direction: column; gap: 16px; }
.sidebar { display: flex; flex-direction: column; gap: 16px; }

.filter-bar { padding: 14px 18px; }
.filter-row { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
.filter-item { display: flex; flex-direction: column; gap: 4px; min-width: 130px; flex: 1; }
.input { width: 100%; }
.filter-label { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; font-family: var(--font-mono); }
.filter-actions { display: flex; gap: 8px; align-items: flex-end; }

.stats-row { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.trend-card { padding: 12px 16px 14px; }
.trend-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; align-items: end; }
.trend-col { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.trend-bars { height: 54px; width: 20px; display: flex; align-items: end; gap: 3px; }
.trend-bar { width: 8px; border-radius: 4px 4px 0 0; min-height: 2px; }
.trend-bar.up { background: #FF6B6B; }
.trend-bar.down { background: #00C4CC; }
.trend-date { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }
.trend-count { font-size: 11px; color: var(--text-primary); font-weight: 700; }
.stat-chip { padding: 12px 18px; flex: 1; min-width: 120px; }
.stat-num { font-size: 32px; font-weight: 900; line-height: 1; margin-top: 4px; font-family: var(--font-hero); }

.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 18px; padding-top: 18px; }
.table-wrap { overflow-x: auto; }

.change-row { animation: slideInRight 0.3s var(--ease-elastic) both; }
@keyframes slideInRight { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }

.ts { font-size: 11px; color: var(--text-muted); }
.brand-chip { padding: 2px 7px; background: rgba(0,196,204,0.1); color: #00AAB1; border: 1px solid rgba(0,196,204,0.28); border-radius: 999px; font-size: 11px; font-weight: 700; font-family: var(--font-mono); }
.region-chip { padding: 2px 7px; background: rgba(138,127,255,.12); color: #8A7FFF; border: 1px solid rgba(138,127,255,.28); border-radius: 999px; font-size: 11px; font-family: var(--font-mono); }
.model-text { font-size: 12px; color: var(--text-secondary); max-width: 180px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.old-price { color: var(--text-muted); font-size: 12px; text-decoration: line-through; }
.new-price { color: var(--text-primary); font-size: 13px; font-weight: 700; }

.delta-cell { display: flex; align-items: center; gap: 8px; }
.delta-badge { font-family: var(--font-mono); font-size: 12px; font-weight: 700; min-width: 70px; padding: 2px 6px; border: 1px solid currentColor; border-radius: 8px; }
.delta-up { color: #FF6B6B; background: rgba(255,107,107,0.12); }
.delta-down { color: #00AAB1; background: rgba(0,196,204,0.12); }

.delta-bar { width: 50px; height: 3px; background: #EEF2F7; overflow: hidden; border-radius: 999px; }
.delta-fill { height: 100%; transition: width 0.4s var(--ease-out); }
.fill-up { background: linear-gradient(90deg,#FF9B9B,#FF6B6B); }
.fill-down { background: linear-gradient(90deg,#00C4CC,#8A7FFF); }

.btn-link { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 12px; font-weight: 600; padding: 0; }
.btn-link:hover { text-decoration: underline; }

.empty-row { text-align: center; padding: 48px; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; }

.alert-panel { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.panel-title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
.badge-red { background: rgba(255,107,107,0.2); color: #FF6B6B; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700; }

.alert-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
.empty-alert { text-align: center; padding: 20px; color: var(--text-muted); font-size: 12px; }
.alert-item { padding: 10px; background: rgba(255,107,107,0.05); border-left: 3px solid #FF6B6B; border-radius: 4px; }
.alert-brand { font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.alert-meta { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); }
.alert-type { background: rgba(138,127,255,0.1); color: #8A7FFF; padding: 1px 4px; border-radius: 2px; }
.alert-count { font-size: 11px; font-weight: 700; color: #FF6B6B; margin-top: 4px; }
.alert-actions { display: flex; gap: 6px; margin-top: 8px; }
.tiny-btn { border: 1px solid transparent; border-radius: 6px; font-size: 11px; padding: 3px 8px; cursor: pointer; font-weight: 700; }
.tiny-btn:disabled { opacity: .55; cursor: not-allowed; }
.tiny-approve { background: rgba(0,196,204,0.12); border-color: rgba(0,196,204,.3); color: #00AAB1; }
.tiny-reject { background: rgba(255,107,107,0.12); border-color: rgba(255,107,107,.3); color: #FF6B6B; }
.top-item { border-left-color: #8A7FFF; background: rgba(138,127,255,0.06); }

.drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: flex-end; z-index: 1000; }
.drawer { width: 100%; max-width: 420px; background: white; display: flex; flex-direction: column; box-shadow: -4px 0 16px rgba(0,0,0,0.1); }
.drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #E5E7EB; }
.drawer-header h3 { margin: 0; font-size: 16px; font-weight: 700; }
.btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted); }
.drawer-body { flex: 1; overflow-y: auto; padding: 20px; }

.info-section { margin-bottom: 24px; }
.section-title { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
.info-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }
.info-value { font-size: 13px; color: var(--text-primary); font-weight: 600; }

.specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.spec-item { padding: 10px; background: #F9FAFB; border-radius: 6px; }
.spec-key { display: block; font-size: 10px; color: var(--text-muted); font-weight: 700; margin-bottom: 4px; }
.spec-val { display: block; font-size: 12px; color: var(--text-primary); word-break: break-word; }

.mini-chart {
  position: relative;
  height: 180px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(0,196,204,.04), rgba(138,127,255,.04));
}
.chart-line {
  position: absolute;
  left: 8%;
  right: 12%;
  top: 18%;
  bottom: 18%;
  border-left: 1px dashed #CBD5E1;
  border-bottom: 1px dashed #CBD5E1;
}
.chart-point {
  position: absolute;
  transform: translate(-50%, 50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #00AAB1;
  box-shadow: 0 0 0 3px rgba(0,170,177,.15);
}
.chart-point:last-child {
  background: #FF6B6B;
  box-shadow: 0 0 0 3px rgba(255,107,107,.18);
}
.pt-label {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 11px;
  color: #475569;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 2px 6px;
}
.chart-tip {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-muted);
}

.skeleton { background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
@keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
