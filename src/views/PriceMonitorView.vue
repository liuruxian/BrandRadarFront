<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">价格监控</h2>
        <p class="page-subtitle">追踪价格波动，发现商机</p>
      </div>
      <button class="btn btn-ghost" @click="doRefresh" :disabled="loading">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'animate-spin': loading }">
          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        刷新
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="card filter-bar" style="margin-bottom:20px">
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
          <label class="filter-label">条数上限</label>
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
    <div class="grid-3" style="margin-bottom:20px" v-if="!loading && changes.length">
      <div class="card stat-mini animate-fade-up"  style="animation-delay:0ms">
        <div class="stat-label">变动总数</div>
        <div class="stat-big font-mono">{{ changes.length }}</div>
      </div>
      <div class="card stat-mini animate-fade-up" style="animation-delay:60ms">
        <div class="stat-label">涨价次数</div>
        <div class="stat-big font-mono" style="color:var(--red)">{{ upCount }}</div>
      </div>
      <div class="card stat-mini animate-fade-up" style="animation-delay:120ms">
        <div class="stat-label">降价次数</div>
        <div class="stat-big font-mono" style="color:var(--green)">{{ downCount }}</div>
      </div>
    </div>

    <!-- 变动记录表 -->
    <div class="card animate-fade-up" style="animation-delay:80ms">
      <div class="card-header"><span class="card-title">价格变动记录</span></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>时间</th><th>品牌</th><th>型号</th><th>国家</th><th>旧价格</th><th>新价格</th><th>变动幅度</th>
          </tr></thead>
          <tbody v-if="!loading">
            <tr
              v-for="c in changes" :key="c.time + c.product_id"
              :class="c.direction === '涨价' ? 'row-up' : 'row-down'"
            >
              <td><span class="font-mono" style="font-size:11px;color:var(--text-muted)">{{ formatTime(c.time) }}</span></td>
              <td><span class="brand-tag">{{ c.brand }}</span></td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ c.model }}</td>
              <td><span class="country-tag">{{ c.country }}</span></td>
              <td><span class="font-mono price-old">{{ c.old_price }}</span></td>
              <td><span class="font-mono price-new">{{ c.new_price }}</span></td>
              <td>
                <div class="change-cell">
                  <span class="change-pct" :class="c.change_pct > 0 ? 'up' : 'down'">
                    {{ formatChangePct(c.change_pct) }}
                  </span>
                  <div class="pct-bar">
                    <div class="pct-fill" :class="c.change_pct > 0 ? 'fill-up' : 'fill-down'"
                      :style="{ width: Math.min(Math.abs(c.change_pct), 50) * 2 + '%' }" />
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="changes.length === 0">
              <td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">暂无价格变动记录</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-for="i in 6" :key="i">
              <td v-for="j in 7" :key="j"><div class="skeleton" style="height:14px"></div></td>
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

const upCount = computed(() => changes.value.filter(c => c.change_pct > 0).length)
const downCount = computed(() => changes.value.filter(c => c.change_pct < 0).length)

async function doRefresh() {
  const p: Record<string, unknown> = { limit: params.value.limit }
  if (params.value.brand) p.brand = params.value.brand
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
.filter-bar { padding: 16px 20px; }
.filter-row { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.filter-item { display: flex; flex-direction: column; gap: 5px; min-width: 130px; flex: 1; }
.filter-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; }
.filter-actions { display: flex; gap: 8px; align-items: flex-end; }

.stat-mini { padding: 16px 20px; }
.stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; margin-bottom: 6px; }
.stat-big { font-size: 28px; font-weight: 700; line-height: 1; color: var(--text-primary); }

.card-header { margin-bottom: 16px; }
.card-title { font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
.table-wrap { overflow-x: auto; }

.brand-tag { padding: 2px 8px; background: var(--accent-glow); color: var(--accent); border-radius: 4px; font-size: 11px; font-weight: 700; font-family: var(--font-mono); }
.country-tag { padding: 2px 7px; background: rgba(167,139,250,0.1); color: #a78bfa; border-radius: 4px; font-size: 11px; font-family: var(--font-mono); }
.price-old { color: var(--text-muted); font-size: 13px; text-decoration: line-through; }
.price-new { color: var(--text-primary); font-size: 13px; }

.change-cell { display: flex; align-items: center; gap: 8px; }
.change-pct { font-family: var(--font-mono); font-size: 13px; font-weight: 700; min-width: 60px; }
.change-pct.up   { color: var(--red); }
.change-pct.down { color: var(--green); }

.pct-bar { width: 60px; height: 4px; background: var(--bg-elevated); border-radius: 999px; overflow: hidden; }
.pct-fill { height: 100%; border-radius: 999px; transition: width 0.5s var(--ease-out); }
.fill-up   { background: var(--red); }
.fill-down { background: var(--green); }
</style>
