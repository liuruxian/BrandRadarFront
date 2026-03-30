<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">智能调度控制台</h2>
        <p class="page-subtitle">自动化采集调度 · 定向任务管理 · 实时状态监控</p>
      </div>
      <button class="btn btn-ghost" @click="doFetch" :disabled="loading">刷新状态</button>
    </div>

    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">{{ toast.msg }}</div>
    </transition>

    <div class="console-grid">
      <div class="col-left">
        <div class="card status-card animate-fade-up" v-if="status">
          <div class="status-header">
            <div class="status-live">
              <span class="breath-dot"/>
              <span class="status-live-text">自动调度运行中</span>
            </div>
            <button class="btn-config" @click="showConfig=true">配置</button>
          </div>
          <div class="status-metrics">
            <div class="metric"><span class="metric-label">采集频率</span><span class="metric-val"><b>{{ intervalDesc(status.interval_minutes) }}</b></span></div>
            <div class="metric"><span class="metric-label">允许采集时段</span><span class="metric-val" v-if="status.silent_hours.enabled">{{ status.silent_hours.start }} — {{ status.silent_hours.end }}</span><span class="metric-val" style="color:var(--text-muted)" v-else>全天不限</span></div>
            <div class="metric"><span class="metric-label">下次执行</span><span class="metric-val countdown">{{ countdownText }}</span></div>
            <div class="metric"><span class="metric-label">今日已运行</span><span class="metric-val"><b>{{ status.today_runs }}</b> / {{ status.max_daily_runs }} 次</span></div>
          </div>
          <div class="progress-bar" style="margin-top:14px">
            <div class="fill" :style="{width:(status.today_runs/status.max_daily_runs*100)+'%',background:'linear-gradient(90deg,#06B6D4,#6366F1)'}"/>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:5px">
            <span style="font-size:11px;color:var(--text-muted)">今日进度</span>
            <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">{{ status.today_runs }}/{{ status.max_daily_runs }}</span>
          </div>
        </div>
        <div class="card animate-fade-up" v-else-if="loading" style="padding:24px">
          <div class="skeleton" style="height:14px;width:40%;margin-bottom:16px"></div>
          <div class="skeleton" style="height:60px;margin-bottom:12px"></div>
          <div class="skeleton" style="height:8px"></div>
        </div>
        <div class="card empty-state animate-fade-up" v-else>
          <div style="color:var(--red);margin-bottom:12px">无法获取调度状态</div>
          <button class="btn btn-primary" @click="doFetch">重试</button>
        </div>

        <div class="card crawl-card animate-fade-up" style="animation-delay:80ms">
          <div class="crawl-header">
            <div><div class="crawl-title">⚡ 立即定向采集</div><div class="crawl-sub">插队任务，不影响自动调度计划</div></div>
            <button class="btn btn-primary" @click="openCrawlModal">开始采集</button>
          </div>
        </div>
      </div>

      <div class="col-right">
        <div class="card animate-fade-up" style="animation-delay:120ms">
          <div class="card-header" style="margin-bottom:14px">
            <span class="card-title">调度任务记录</span>
            <button class="btn btn-ghost" style="padding:5px 10px;font-size:12px" @click="loadTasks">刷新</button>
          </div>
          <div v-if="taskLoading"><div v-for="i in 3" :key="i" class="skeleton" :style="{height:'60px',marginBottom:'8px'}"></div></div>
          <div v-else-if="tasks.length===0" class="empty-state">暂无任务记录</div>
          <div v-else class="task-list">
            <div v-for="t in tasks" :key="t.task_id" class="task-item" :class="'task-'+t.status">
              <div class="task-icon" :class="'icon-'+t.status">
                <svg v-if="t.status==='running'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                <svg v-else-if="t.status==='done'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else-if="t.status==='failed'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="task-info">
                <div class="task-name">{{ t.brand||'全部品牌' }}<span v-if="t.country" class="task-country"> · {{ t.country }}</span></div>
                <div class="task-meta">{{ t.task_id.slice(0,14) }}... · {{ t.started_at ? formatTime(t.started_at) : '等待中' }}</div>
                <div class="task-stats" v-if="t.status==='done'&&t.product_count!==null">共 {{ t.product_count }} · 新增 {{ t.new_count }} · 更新 {{ t.updated_count }}</div>
              </div>
              <span class="task-badge" :class="'tbadge-'+t.status">{{ statusLabel(t.status) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 配置抽屉 -->
    <teleport to="body">
    <transition name="drawer">
      <div v-if="showConfig" class="drawer-overlay" @click.self="showConfig=false">
        <div class="drawer">
          <div class="drawer-header">
            <span class="drawer-title">调度配置</span>
            <button class="drawer-close" @click="showConfig=false">✕</button>
          </div>
          <div class="drawer-body">
            <!-- 采集频率 -->
            <div class="cfg-section">
              <div class="cfg-section-title">采集频率</div>
              <div class="preset-grid">
                <button v-for="p in freqPresets" :key="p.label"
                  class="preset-btn" :class="{active:cfgForm.interval_minutes===p.minutes}"
                  @click="cfgForm.interval_minutes=p.minutes">{{ p.label }}</button>
              </div>
              <div class="freq-desc">系统将每隔 <b>{{ freqDesc }}</b> 自动触发一次采集</div>
            </div>

            <!-- 采集时间窗口 -->
            <div class="cfg-section">
              <div class="silent-head">
                <div class="silent-head-left">
                  <span class="cfg-section-title">允许采集的时间段</span>
                  <span class="silent-head-sub">开启后仅在此时段内触发</span>
                </div>
                <div class="silent-toggle" @click="cfgForm.silent_enabled=!cfgForm.silent_enabled">
                  <div class="stoggle" :class="{on:cfgForm.silent_enabled}">
                    <div class="stoggle-thumb"/>
                  </div>
                  <span class="stoggle-label" style="white-space:nowrap">{{ cfgForm.silent_enabled?'已开启':'已关闭' }}</span>
                </div>
              </div>
              <div class="silent-body" :class="{muted:!cfgForm.silent_enabled}">
                <div class="time-row">
                  <div class="time-item">
                    <label class="cfg-label">开始时间</label>
                    <input class="input" type="time" v-model="cfgForm.silent_start" :disabled="!cfgForm.silent_enabled"/>
                  </div>
                  <div class="time-dash">→</div>
                  <div class="time-item">
                    <label class="cfg-label">结束时间</label>
                    <input class="input" type="time" v-model="cfgForm.silent_end" :disabled="!cfgForm.silent_enabled"/>
                  </div>
                </div>
                <div class="tl-wrap">
                  <div class="tl-track">
                    <template v-if="cfgForm.silent_enabled">
                      <div v-for="seg in silentSegments" :key="seg.left"
                        class="tl-fill" :style="{left:seg.left+'%',width:seg.width+'%'}"/>
                    </template>
                  </div>
                  <div class="tl-labels"><span>0时</span><span>6时</span><span>12时</span><span>18时</span><span>24时</span></div>
                </div>
                <div class="silent-hint">例：设置 09:00 → 18:00，系统只在工作时间内采集，其余时间不触发</div>
              </div>
            </div>
          </div>
          <div class="drawer-footer">
            <button class="btn btn-ghost" @click="showConfig=false">取消</button>
            <button class="btn btn-primary" @click="saveConfig" :disabled="saving">{{ saving?'保存中...':'保存配置' }}</button>
          </div>
        </div>
      </div>
    </transition>
    </teleport>

    <!-- 定向采集侧抽屉 -->
    <teleport to="body">
    <transition name="drawer">
      <div v-if="showCrawl" class="drawer-overlay" @click.self="showCrawl=false">
        <div class="drawer">
          <div class="drawer-header">
            <span class="drawer-title">⚡ 定向采集</span>
            <button class="drawer-close" @click="showCrawl=false">✕</button>
          </div>
          <div class="drawer-body">
            <div class="modal-note">插队任务，不影响自动调度计划，立即触发采集。</div>
            <div class="select-section">
              <div class="select-label">选择品牌</div>
              <div class="chip-list">
                <span v-for="b in allBrands" :key="b"
                  class="chip" :class="{selected:crawlForm.brands.includes(b)}"
                  @click="toggleBrand(b)">{{ b }}</span>
              </div>
              <div class="select-summary">已选：{{ crawlForm.brands.length===0?'全部品牌':crawlForm.brands.slice(0,3).join(', ')+(crawlForm.brands.length>3?' +'+(crawlForm.brands.length-3):'') }}</div>
            </div>
            <div class="select-section">
              <div class="select-label">
                选择国家
                <span class="quick-tags">
                  <span class="qtag" @click="selectRegion('na')">北美</span>
                  <span class="qtag" @click="selectRegion('eu')">欧盟</span>
                  <span class="qtag" @click="selectRegion('asia')">亚太</span>
                  <span class="qtag" @click="crawlForm.countries=[]">全部</span>
                </span>
              </div>
              <div class="chip-list">
                <span v-for="c in allCountries" :key="c"
                  class="chip" :class="{selected:crawlForm.countries.includes(c)}"
                  @click="toggleCountry(c)">{{ c }}</span>
              </div>
              <div class="select-summary">已选：{{ crawlForm.countries.length===0?'全部国家':crawlForm.countries.slice(0,3).join(', ')+(crawlForm.countries.length>3?' +'+(crawlForm.countries.length-3):'') }}</div>
            </div>
          </div>
          <div class="drawer-footer">
            <button class="btn btn-ghost" @click="showCrawl=false" :disabled="crawlLoading">取消</button>
            <button class="btn btn-primary" @click="startCrawl" :disabled="crawlLoading">
              <svg v-if="crawlLoading" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ crawlLoading?'提交中...':'确认采集' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
    </teleport>
  </div>
</template><script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useSchedulerStore } from '@/stores/schedulerStore'
import { useCrawlStore } from '@/stores/crawlStore'
import { productsApi } from '@/api/productsApi'
import { schedulerApi } from '@/api/schedulerApi'
import { formatCountdown, formatTime } from '@/utils/format'
import type { TaskStatus } from '@/api/types'

const store       = useSchedulerStore()
const crawlStore  = useCrawlStore()
const status      = computed(() => store.status)
const loading     = computed(() => store.loading)
const saving      = computed(() => store.saving)
const tasks       = computed(() => crawlStore.tasks)
const taskLoading = computed(() => crawlStore.loading)

const toast        = ref({ show:false, msg:'', type:'ok' })
const showConfig   = ref(false)
const showCrawl    = ref(false)
const crawlLoading = ref(false)
const remaining    = ref(0)
let countdownTimer: ReturnType<typeof setInterval>
const countdownText = computed(() => formatCountdown(remaining.value))

function lockScroll()   {
  document.body.style.overflow = 'hidden'
  const mc = document.querySelector('.main-content') as HTMLElement | null
  if (mc) mc.style.overflow = 'hidden'
}
function unlockScroll() {
  document.body.style.overflow = ''
  const mc = document.querySelector('.main-content') as HTMLElement | null
  if (mc) mc.style.overflow = ''
}

watch(showConfig, v => v ? lockScroll() : (showCrawl.value || unlockScroll()))
watch(showCrawl,  v => v ? lockScroll() : (showConfig.value || unlockScroll()))

const cfgForm = ref({ interval_minutes:1440, max_daily_runs:1, silent_enabled:false, silent_start:'23:00', silent_end:'07:00' })

const freqPresets = [
  { label:'每月一次', minutes:43200 },
  { label:'每周一次', minutes:10080 },
  { label:'每天一次', minutes:1440  },
]

function intervalDesc(minutes: number): string {
  const preset = freqPresets.find(p => p.minutes === minutes)
  if (preset) return preset.label
  if (minutes >= 1440) return `每 ${Math.round(minutes/1440)} 天一次`
  if (minutes >= 60)   return `每 ${Math.round(minutes/60)} 小时一次`
  return `每 ${minutes} 分钟一次`
}

const freqDesc = computed(() => {
  const m = cfgForm.value.interval_minutes
  if (m >= 43200 && m % 43200 === 0) return `${m/43200} 个月`
  if (m >= 10080 && m % 10080 === 0) return `${m/10080} 周`
  if (m >= 1440  && m % 1440  === 0) return `${m/1440} 天`
  if (m >= 60    && m % 60    === 0) return `${m/60} 小时`
  return `${m} 分钟`
})

const estimatedRuns = computed(() => Math.floor(1440 / cfgForm.value.interval_minutes))

const runsStatus = computed(() => {
  const diff = cfgForm.value.max_daily_runs - estimatedRuns.value
  if (diff < 0) return 'low'
  if (diff >= 0) return 'ok'
  return 'normal'
})

const runsHintClass = computed(() => ({
  'hint-low': runsStatus.value === 'low',
  'hint-ok':  runsStatus.value === 'ok',
}))

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

const silentSegments = computed(() => {
  const s = timeToMinutes(cfgForm.value.silent_start)
  const e = timeToMinutes(cfgForm.value.silent_end)
  const total = 1440
  if (s < e) return [{ left: s/total*100, width: (e-s)/total*100 }]
  // 跨日
  return [
    { left: 0, width: e/total*100 },
    { left: s/total*100, width: (total-s)/total*100 }
  ]
})

// 自动同步 max_daily_runs 为预计次数
watch(() => cfgForm.value.interval_minutes, (m) => {
  cfgForm.value.max_daily_runs = Math.floor(1440 / m)
})
const allBrands    = ref<string[]>([])
const allCountries = ref<string[]>([])
const crawlForm    = ref({ brands:[] as string[], countries:[] as string[] })

const REGIONS: Record<string,string[]> = {
  na:   ['US','CA','MX'],
  eu:   ['DE','FR','GB','IT','ES','NL','PL'],
  asia: ['CN','JP','KR','AU','IN','SG']
}

function toggleBrand(b:string)   { const i=crawlForm.value.brands.indexOf(b);    i>=0?crawlForm.value.brands.splice(i,1):crawlForm.value.brands.push(b) }
function toggleCountry(c:string) { const i=crawlForm.value.countries.indexOf(c); i>=0?crawlForm.value.countries.splice(i,1):crawlForm.value.countries.push(c) }
function selectRegion(r:string)  { crawlForm.value.countries = allCountries.value.filter(c => REGIONS[r]?.some(x => c.toUpperCase().includes(x))) }

function showToast(msg:string, type:'ok'|'err'='ok') {
  toast.value = { show:true, msg, type }
  setTimeout(() => { toast.value.show=false }, 3000)
}

function syncForm() {
  if (!status.value) return
  cfgForm.value.interval_minutes = status.value.interval_minutes
  cfgForm.value.max_daily_runs   = status.value.max_daily_runs
  cfgForm.value.silent_enabled   = status.value.silent_hours.enabled
  cfgForm.value.silent_start     = status.value.silent_hours.start ?? '23:00'
  cfgForm.value.silent_end       = status.value.silent_hours.end   ?? '07:00'
}
watch(status, syncForm)

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer)
  remaining.value = status.value?.next_run_in_seconds ?? 0
  countdownTimer = setInterval(() => { if (remaining.value>0) remaining.value-- }, 1000)
}

async function doFetch() { await store.fetchStatus(); startCountdown() }
async function loadTasks() { await crawlStore.fetchTasks() }

async function saveConfig() {
  const ok = await store.setSchedule({
    interval_minutes: cfgForm.value.interval_minutes,
    max_daily_runs:   cfgForm.value.max_daily_runs,
    silent_hours: { enabled:cfgForm.value.silent_enabled, start:cfgForm.value.silent_start, end:cfgForm.value.silent_end }
  })
  if (ok) { showConfig.value=false; startCountdown(); showToast('配置已热重载，下次执行时间已更新') }
  else showToast('保存失败', 'err')
}

async function openCrawlModal() {
  showCrawl.value = true
  if (allBrands.value.length===0) {
    const [br, co] = await Promise.all([productsApi.getBrands(), productsApi.getCountries()])
    if (br.success && br.data) { allBrands.value=br.data; crawlForm.value.brands=br.data.slice(0,3) }
    if (co.success && co.data) { allCountries.value=co.data; crawlForm.value.countries=co.data.slice(0,5) }
  }
}

async function startCrawl() {
  crawlLoading.value = true
  try {
    const body: Record<string,unknown> = {}
    if (crawlForm.value.brands.length)    body.brands    = crawlForm.value.brands
    if (crawlForm.value.countries.length) body.countries = crawlForm.value.countries
    const task = await crawlStore.trigger(body as { brand?:string; countries?:string[] })
    showCrawl.value = false
    if (task) showToast('定向采集已提交，任务正在队列中')
    else showToast(crawlStore.error ?? '提交失败，请稍后重试', 'err')
  } catch { showToast('提交失败，请稍后重试', 'err') }
  finally { crawlLoading.value=false }
}

function statusLabel(s:TaskStatus) {
  return ({ queued:'排队中', running:'运行中', done:'已完成', failed:'失败' } as Record<string,string>)[s] ?? s
}

onMounted(() => { doFetch(); loadTasks() })
onUnmounted(() => { clearInterval(countdownTimer); unlockScroll() })
</script>
<style scoped>
.console-grid { display:grid; grid-template-columns:360px 1fr; gap:20px; align-items:start; }
@media (max-width:900px) { .console-grid { grid-template-columns:1fr; } }
.col-left { display:flex; flex-direction:column; gap:16px; }

.status-card { padding:22px; }
.status-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
.status-live { display:flex; align-items:center; gap:9px; }
.breath-dot { width:10px; height:10px; border-radius:50%; background:#10B981; box-shadow:0 0 0 3px rgba(16,185,129,0.2); animation:breath 2s ease-in-out infinite; flex-shrink:0; }
@keyframes breath { 0%,100%{box-shadow:0 0 0 3px rgba(16,185,129,0.2)} 50%{box-shadow:0 0 0 7px rgba(16,185,129,0.08)} }
.status-live-text { font-size:14px; font-weight:700; color:var(--text-primary); }
.btn-config { display:flex; align-items:center; gap:5px; padding:5px 12px; background:var(--bg-elevated); border:1px solid var(--border); border-radius:8px; font-size:12px; font-weight:500; color:var(--text-secondary); cursor:pointer; transition:all .15s; }
.btn-config:hover { border-color:var(--accent); color:var(--accent); background:#EEF2FF; }

.status-metrics { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.metric { background:var(--bg-surface); border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:5px; }
.metric-label { font-size:11px; color:var(--text-muted); font-weight:500; }
.metric-val { font-size:15px; font-weight:700; color:var(--text-primary); line-height:1.2; }
.countdown { color:var(--accent); font-family:var(--font-mono); }

.crawl-card { padding:20px; }
.crawl-header { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.crawl-title { font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:3px; }
.crawl-sub { font-size:12px; color:var(--text-muted); }

.card-header { display:flex; align-items:center; justify-content:space-between; }
.card-title { font-size:14px; font-weight:700; color:var(--text-primary); }

.task-list { display:flex; flex-direction:column; gap:8px; }
.task-item { display:flex; align-items:center; gap:10px; padding:12px 14px; background:var(--bg-surface); border-radius:10px; border:1px solid var(--border); transition:all .15s; }
.task-item:hover { border-color:#D1D5DB; box-shadow:var(--shadow-sm); }
.task-running { border-color:rgba(245,158,11,0.3); background:#FFFBEB; }
.task-done    { border-color:rgba(16,185,129,0.2); }
.task-failed  { border-color:rgba(239,68,68,0.2); background:#FFF5F5; }
.task-icon { width:24px; height:24px; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.icon-queued  { background:#EFF6FF; color:var(--blue); }
.icon-running { background:#FFFBEB; color:var(--orange); }
.icon-done    { background:#D1FAE5; color:var(--green); }
.icon-failed  { background:#FEE2E2; color:var(--red); }
.task-info { flex:1; min-width:0; }
.task-name { font-size:13px; font-weight:600; color:var(--text-primary); }
.task-country { color:var(--accent-cyan); font-size:12px; }
.task-meta { font-size:11px; color:var(--text-muted); margin-top:2px; font-family:var(--font-mono); }
.task-stats { font-size:11px; color:var(--text-muted); margin-top:2px; }
.task-badge { padding:2px 8px; border-radius:6px; font-size:11px; font-weight:600; flex-shrink:0; }
.tbadge-queued  { background:#EFF6FF; color:var(--blue-text); }
.tbadge-running { background:#FEF3C7; color:var(--orange-text); }
.tbadge-done    { background:#D1FAE5; color:var(--green-text); }
.tbadge-failed  { background:#FEE2E2; color:var(--red-text); }

.empty-state { text-align:center; padding:32px; color:var(--text-muted); font-size:13px; }

/* 抽屉 */
.drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.3); z-index:100; display:flex; justify-content:flex-end; }
.drawer { width:360px; height:100vh; background:#fff; box-shadow:-8px 0 32px rgba(0,0,0,0.1); display:flex; flex-direction:column; overflow:hidden; }
.drawer-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid var(--border); flex-shrink:0; }
.drawer-title { font-size:16px; font-weight:700; color:var(--text-primary); }
.drawer-close { background:none; border:none; font-size:16px; color:var(--text-muted); cursor:pointer; padding:4px 8px; border-radius:6px; }
.drawer-close:hover { background:var(--bg-elevated); color:var(--text-primary); }
.drawer-body { flex:1; padding:24px; overflow-y:auto; display:flex; flex-direction:column; gap:16px; }
.drawer-footer { padding:16px 24px; border-top:1px solid var(--border); display:flex; gap:10px; justify-content:flex-end; flex-shrink:0; }
.cfg-row { display:flex; flex-direction:column; gap:6px; }
.cfg-label { font-size:12px; color:var(--text-muted); font-weight:500; }

/* 配置区块 */
.cfg-section { display:flex; flex-direction:column; gap:10px; padding:16px; background:var(--bg-surface); border-radius:10px; border:1px solid var(--border); }
.cfg-section-title { font-size:13px; font-weight:700; color:var(--text-primary); }

/* 频率预设 */
.preset-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
.preset-btn { padding:8px 4px; border:1px solid var(--border); border-radius:8px; background:#fff; font-size:12px; font-weight:500; color:var(--text-secondary); cursor:pointer; transition:all .15s; }
.preset-btn:hover { border-color:var(--accent); color:var(--accent); }
.preset-btn.active { background:var(--accent); color:#fff; border-color:var(--accent); }
.freq-desc { font-size:12px; color:var(--text-muted); text-align:center; padding:4px 0; }
.freq-desc b { color:var(--accent); }

/* 每日上限 */
.runs-row { display:flex; align-items:center; gap:12px; justify-content:center; }
.runs-btn { width:32px; height:32px; border-radius:8px; border:1px solid var(--border); background:#fff; font-size:18px; font-weight:300; color:var(--text-secondary); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.runs-btn:hover { border-color:var(--accent); color:var(--accent); }
.runs-display { display:flex; flex-direction:column; align-items:center; min-width:60px; }
.runs-num { font-size:28px; font-weight:800; color:var(--text-primary); font-family:var(--font-mono); line-height:1; }
.runs-unit { font-size:11px; color:var(--text-muted); margin-top:2px; }
.runs-hint { font-size:12px; padding:8px 10px; border-radius:6px; }
.hint-low { background:#FEF2F2; color:#DC2626; }
.hint-ok  { background:#F0FDF4; color:#16A34A; }

/* 静默期 */
.silent-card { transition:opacity .2s; }
.silent-card.disabled { opacity:.6; }
.silent-head { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.silent-head-left { display:flex; flex-direction:column; gap:2px; min-width:0; }
.silent-head-sub { font-size:11px; color:var(--text-muted); }
.silent-toggle { display:flex; align-items:center; gap:8px; cursor:pointer; }
.stoggle { width:40px; height:22px; border-radius:999px; background:#E5E7EB; position:relative; transition:background .2s; }
.stoggle.on { background:#06B6D4; }
.stoggle-thumb { position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,0.2); }
.stoggle.on .stoggle-thumb { transform:translateX(18px); }
.stoggle-label { font-size:12px; font-weight:600; color:var(--text-secondary); }
.silent-body { display:flex; flex-direction:column; gap:10px; transition:opacity .2s; }
.silent-body.muted { opacity:.4; pointer-events:none; }
.time-row { display:flex; align-items:flex-end; gap:8px; }
.time-item { display:flex; flex-direction:column; gap:4px; flex:1; }
.time-dash { font-size:16px; color:var(--text-muted); padding-bottom:8px; }
.tl-wrap { display:flex; flex-direction:column; gap:4px; }
.tl-track { height:6px; background:#F3F4F6; border-radius:999px; position:relative; overflow:hidden; }
.tl-fill { position:absolute; top:0; height:100%; background:#06B6D4; border-radius:999px; transition:left .3s,width .3s; }
.tl-labels { display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); }
.silent-hint { font-size:11px; color:var(--text-muted); font-style:italic; }

/* 模态框 */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:100; display:flex; align-items:flex-start; justify-content:center; padding-top:60px; padding-bottom:24px; overflow-y:auto; }
.modal { width:520px; max-width:95vw; background:#fff; border-radius:16px; box-shadow:0 24px 64px rgba(0,0,0,0.15); overflow:hidden; margin-bottom:auto; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid var(--border); }
.modal-title { font-size:16px; font-weight:700; color:var(--text-primary); }
.modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:20px; }
.modal-footer { padding:16px 24px; border-top:1px solid var(--border); display:flex; gap:10px; justify-content:flex-end; }
.modal-note { font-size:12px; color:var(--text-muted); background:var(--bg-surface); padding:10px 14px; border-radius:8px; border-left:3px solid var(--accent); }
.select-section { display:flex; flex-direction:column; gap:8px; }
.select-label { font-size:12px; font-weight:600; color:var(--text-secondary); display:flex; align-items:center; gap:8px; }
.quick-tags { display:flex; gap:5px; }
.qtag { padding:2px 8px; background:#EEF2FF; color:var(--accent); border-radius:999px; font-size:11px; font-weight:500; cursor:pointer; transition:all .15s; }
.qtag:hover { background:var(--accent); color:#fff; }
.chip-list { display:flex; flex-wrap:wrap; gap:6px; }
.chip { padding:4px 12px; border-radius:999px; border:1px solid var(--border); background:#fff; font-size:12px; color:var(--text-secondary); cursor:pointer; transition:all .15s; }
.chip:hover { border-color:var(--accent); color:var(--accent); }
.chip.selected { background:var(--accent); color:#fff; border-color:var(--accent); }
.select-summary { font-size:12px; color:var(--text-muted); }

/* 动画 */
.toast { position:fixed; top:20px; right:24px; z-index:200; padding:12px 20px; border-radius:10px; font-size:13px; font-weight:500; box-shadow:var(--shadow-md); }
.toast-ok  { background:#fff; border:1px solid #D1FAE5; color:var(--green-text); }
.toast-err { background:#fff; border:1px solid #FEE2E2; color:var(--red-text); }
.toast-enter-active,.toast-leave-active { transition:all .25s var(--ease-out); }
.toast-enter-from,.toast-leave-to { opacity:0; transform:translateX(16px); }
.drawer-enter-active,.drawer-leave-active { transition:all .25s var(--ease-out); }
.drawer-enter-from .drawer,.drawer-leave-to .drawer { transform:translateX(100%); }
.modal-enter-active,.modal-leave-active { transition:all .2s var(--ease-out); }
.modal-enter-from,.modal-leave-to { opacity:0; transform:scale(.95); }
</style>