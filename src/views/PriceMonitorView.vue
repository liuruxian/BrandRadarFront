<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">价格监控</h2>
        <p class="page-subtitle">> 追踪价格波动 · 发现商机 · 实时情报</p>
      </div>
      <button class="btn btn-ghost" @click="doRefresh" :disabled="loading">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" :class="{'animate-spin':loading}">
          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        {{ loading ? '刷新中...' : '刷新' }}
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="card filter-bar" style="margin-bottom:16px">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">品牌</label>
          <select class="select" v-model="params.brand">
            <option value="">全部品牌</option>
            <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">国家</label>
          <select class="select" v-model="params.country">
            <option value="">全部国家</option>
            <option v-for="c in allCountries" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">条数</label>
          <select class="select" v-model.number="params.limit">
            <option :value="50">50 条</option>
            <option :value="100">100 条</option>
            <option :value="200">200 条</option>
            <option :value="500">500 条</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn btn-primary" @click="doRefresh" :disabled="loading">查询</button>
        </div>
      </div>
    </div>

    <!-- 统计摘要 -->
    <div class="stats-row" v-if="!loading && changes.length">
      <div class="card stat-chip animate-fade-up" style="animation-delay:0ms">
        <div class="filter-label">变动总数</div>
        <div class="stat-num font-mono">{{ changes.length }}</div>
      </div>
      <div class="card stat-chip animate-fade-up" style="animation-delay:40ms;border-color:rgba(255,23,68,0.4);box-shadow:4px 4px 0 rgba(255,23,68,0.2)">
        <div class="filter-label">涨价</div>
        <div class="stat-num font-mono" style="color:var(--red)">{{ upCount }}</div>
      </div>
      <div class="card stat-chip animate-fade-up" style="animation-delay:80ms;border-color:rgba(184,255,0,0.4);box-shadow:4px 4px 0 var(--accent-dark)">
        <div class="filter-label">降价</div>
        <div class="stat-num font-mono" style="color:var(--accent)">{{ downCount }}</div>
      </div>
    </div>

    <!-- 变动记录 -->
    <div class="card animate-fade-up" style="animation-delay:100ms">
      <div class="table-header">
        <span class="filter-label">价格变动记录</span>
        <span class="font-mono" style="font-size:10px;color:var(--text-muted)">{{ changes.length }} ENTRIES</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>时间</th><th>品牌</th><th>型号</th><th>国家</th><th>原价</th><th>新价</th><th>变动</th>
          </tr></thead>
          <tbody v-if="!loading">
            <tr
              v-for="c in changes" :key="c.time + c.product_id"
              :class="c.change_pct > 0 ? 'row-up' : 'row-down'"
              class="change-row"
            >
              <td><span class="font-mono ts">{{ formatTime(c.time) }}</span></td>
              <td><span class="brand-chip">{{ c.brand }}</span></td>
              <td><span class="model-text">{{ c.model }}</span></td>
              <td><span class="region-chip">{{ c.country }}</span></td>
              <td><span class="font-mono old-price">{{ c.old_price }}</span></td>
              <td><span class="font-mono new-price">{{ c.new_price }}</span></td>
              <td>
                <div class="delta-cell">
                  <span class="delta-badge" :class="c.change_pct > 0 ? 'delta-up' : 'delta-down'">
                    {{ c.change_pct > 0 ? '▲' : '▼' }} {{ formatChangePct(c.change_pct) }}
                  </span>
                  <div class="delta-bar">
                    <div class="delta-fill"
                      :class="c.change_pct > 0 ? 'fill-up' : 'fill-down'"
                      :style="{ width: Math.min(Math.abs(c.change_pct), 50)*2+'%' }" />
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="changes.length === 0">
              <td colspan="7" class="empty-row">暂无价格变动记录</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-for="i in 8" :key="i">
              <td v-for="j in 7" :key="j"><div class="skeleton" style="height:13px"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMonitorStore } from '@/stores/monitorStore'
import { productsApi } from '@/api/productsApi'
import { formatTime, formatChangePct } from '@/utils/format'

const store = useMonitorStore()
const changes = computed(() => store.changes)
const loading = computed(() => store.loading)

const brands = ref<string[]>([])
const allCountries = ref<string[]>([])
const params = ref({ brand: '', country: '', limit: 100 })

const upCount   = computed(() => changes.value.filter(c => c.change_pct > 0).length)
const downCount = computed(() => changes.value.filter(c => c.change_pct < 0).length)

async function doRefresh() {
  const p: Record<string, unknown> = { limit: params.value.limit }
  if (params.value.brand)   p.brand   = params.value.brand
  if (params.value.country) p.country = params.value.country
  await store.fetchChanges(p as Parameters<typeof store.fetchChanges>[0])
}

onMounted(async () => {
  const [br, co] = await Promise.all([productsApi.getBrands(), productsApi.getCountries()])
  if (br.success && br.data) brands.value = br.data
  if (co.success && co.data) allCountries.value = co.data
  await store.fetchChanges({ limit: 100 })
})
</script>

<style scoped>
.filter-bar { padding: 14px 18px; }
.filter-row { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
.filter-item { display: flex; flex-direction: column; gap: 4px; min-width: 130px; flex: 1; }
.filter-label { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; font-family: var(--font-mono); }
.filter-actions { display: flex; gap: 8px; align-items: flex-end; }

.stats-row { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.stat-chip { padding: 12px 18px; flex: 1; min-width: 120px; }
.stat-num { font-size: 32px; font-weight: 900; line-height: 1; margin-top: 4px; font-family: var(--font-hero); }

.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.table-wrap { overflow-x: auto; }

.change-row { animation: slideInRight 0.3s var(--ease-elastic) both; }
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

.ts { font-size: 11px; color: var(--text-muted); }
.brand-chip {
  padding: 2px 7px;
  background: rgba(59,130,246,0.2);
  color: #BFDBFE;
  border: 1px solid rgba(59,130,246,0.35);
  border-radius: 999px;
  font-size: 11px; font-weight: 700;
  font-family: var(--font-mono);
}
.region-chip {
  padding: 2px 7px;
  background: var(--cyan-glow);
  color: var(--cyan);
  border: 1px solid rgba(34,211,238,0.28);
  border-radius: 999px;
  font-size: 11px;
  font-family: var(--font-mono);
}
.model-text { font-size: 12px; color: var(--text-secondary); max-width: 180px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.old-price { color: var(--text-muted); font-size: 12px; text-decoration: line-through; }
.new-price { color: var(--text-primary); font-size: 13px; font-weight: 700; }

.delta-cell { display: flex; align-items: center; gap: 8px; }
.delta-badge { font-family: var(--font-mono); font-size: 12px; font-weight: 700; min-width: 70px; padding: 2px 6px; border: 1px solid currentColor; border-radius: 8px; }
.delta-up   { color: #FB7185; background: rgba(244,63,94,0.12); }
.delta-down { color: #60A5FA; background: rgba(59,130,246,0.12); }

.delta-bar  { width: 50px; height: 3px; background: rgba(255,255,255,.08); overflow: hidden; border-radius: 999px; }
.delta-fill { height: 100%; transition: width 0.4s var(--ease-out); }
.fill-up    { background: linear-gradient(90deg,#FB7185,#F43F5E); }
.fill-down  { background: linear-gradient(90deg,#38BDF8,#3B82F6); }

.empty-row { text-align: center; padding: 48px; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; }
</style>
