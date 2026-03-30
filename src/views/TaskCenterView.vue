<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">采集任务</h2>
        <p class="page-subtitle">触发爬虫采集 · 实时追踪任务进度</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" @click="loadTasks" :disabled="loading">刷新</button>
        <button class="btn btn-danger" @click="doCleanup">清理过期</button>
      </div>
    </div>

    <div v-if="crawlStore.error" class="error-bar font-mono">
      <span style="color:var(--red)">[错误]</span> {{ crawlStore.error }}
    </div>

    <div class="task-layout">
      <div class="card trigger-panel animate-fade-up">
        <div class="panel-title">触发新采集</div>
        <div class="form-group">
          <label class="form-label">品牌（可选）</label>
          <select class="select" v-model="form.brand">
            <option value="">全部品牌</option>
            <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">国家（可选）</label>
          <select class="select" v-model="form.country">
            <option value="">全部国家</option>
            <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="toggle-row">
            <div class="cyber-toggle" :class="{active:form.update_existing}" @click="form.update_existing=!form.update_existing">
              <div class="toggle-track"><div class="toggle-thumb"></div></div>
            </div>
            <span class="toggle-label">更新已有数据</span>
          </label>
          <label class="toggle-row" style="margin-top:10px">
            <div class="cyber-toggle" :class="{active:form.force}" @click="form.force=!form.force">
              <div class="toggle-track"><div class="toggle-thumb"></div></div>
            </div>
            <span class="toggle-label">强制执行</span>
          </label>
        </div>
        <button class="btn btn-primary launch-btn" @click="doTrigger" :disabled="crawlStore.triggering">
          <svg v-if="crawlStore.triggering" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {{ crawlStore.triggering ? '提交中...' : '立即采集' }}
        </button>
      </div>

      <div class="task-list-panel animate-fade-up" style="animation-delay:60ms">
        <div v-if="loading&&tasks.length===0">
          <div v-for="i in 3" :key="i" class="card task-card" style="margin-bottom:10px">
            <div class="skeleton" style="height:14px;width:40%;margin-bottom:8px"></div>
            <div class="skeleton" style="height:11px;width:60%"></div>
          </div>
        </div>
        <div v-else-if="tasks.length===0" class="empty-tasks">暂无任务记录</div>
        <transition-group name="task-item" tag="div" class="tasks-stack">
          <div v-for="task in tasks" :key="task.task_id" class="card task-card" :class="'task-'+task.status">
            <div class="task-head">
              <div class="task-status-icon" :class="'icon-'+task.status">
                <svg v-if="task.status==='running'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                <svg v-else-if="task.status==='done'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else-if="task.status==='failed'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="task-info">
                <div class="task-name">{{ task.brand||'全部品牌' }}<span v-if="task.country" class="task-country"> · {{ task.country }}</span></div>
                <div class="task-id font-mono">{{ task.task_id.slice(0,16) }}...</div>
              </div>
              <span class="badge" :class="statusBadge(task.status)">{{ statusLabel(task.status) }}</span>
            </div>
            <div class="task-progress" v-if="task.progress">{{ task.progress }}</div>
            <div class="task-stats" v-if="task.status==='done'&&task.product_count!==null">
              <span>共 <b>{{ task.product_count }}</b> 条</span>
              <span style="color:var(--green)">新增 <b>{{ task.new_count }}</b></span>
              <span style="color:var(--cyan)">更新 <b>{{ task.updated_count }}</b></span>
            </div>
            <div class="task-error" v-if="task.error">{{ task.error }}</div>
            <div class="task-time" v-if="task.started_at">
              <span>开始：{{ formatTime(task.started_at) }}</span>
              <span v-if="task.finished_at">结束：{{ formatTime(task.finished_at) }}</span>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCrawlStore } from '@/stores/crawlStore'
import { productsApi } from '@/api/productsApi'
import { formatTime } from '@/utils/format'
import type { TaskStatus } from '@/api/types'

const crawlStore = useCrawlStore()
const tasks   = computed(() => crawlStore.tasks)
const loading = computed(() => crawlStore.loading)
const brands    = ref<string[]>([])
const countries = ref<string[]>([])
const form = ref({ brand: '', country: '', update_existing: true, force: false })

function statusLabel(s: TaskStatus) {
  const map: Record<string,string> = { queued:'排队中', running:'运行中', done:'已完成', failed:'失败' }
  return map[s] ?? s
}
function statusBadge(s: TaskStatus) {
  const map: Record<string,string> = { queued:'badge-blue', running:'badge-amber', done:'badge-green', failed:'badge-red' }
  return map[s] ?? ''
}
async function loadTasks() { await crawlStore.fetchTasks() }
async function doTrigger() {
  const body: Record<string,unknown> = { update_existing: form.value.update_existing, force: form.value.force }
  if (form.value.brand)   body.brand   = form.value.brand
  if (form.value.country) body.country = form.value.country
  await crawlStore.trigger(body)
}
async function doCleanup() {
  const res = await crawlStore.cleanup()
  if (res) await loadTasks()
}
onMounted(async () => {
  const [br, co] = await Promise.all([productsApi.getBrands(), productsApi.getCountries()])
  if (br.success && br.data) brands.value   = br.data
  if (co.success && co.data) countries.value = co.data
  await loadTasks()
})
</script>
<style scoped>
.task-layout { display:grid; grid-template-columns:280px 1fr; gap:16px; align-items:start; }
@media (max-width:900px) { .task-layout { grid-template-columns:1fr; } }
.trigger-panel { padding:20px; }
.panel-title { font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:18px; padding-bottom:10px; border-bottom:1px solid var(--border); }
.form-group { margin-bottom:14px; }
.form-label { display:block; font-size:11px; color:var(--text-muted); font-weight:500; margin-bottom:6px; }
.toggle-row { display:flex; align-items:center; gap:10px; cursor:pointer; }
.toggle-track { width:38px; height:20px; background:var(--bg-elevated); border:1px solid var(--border); border-radius:4px; position:relative; transition:all .2s; }
.cyber-toggle.active .toggle-track { background:rgba(255,45,120,0.1); border-color:var(--accent); box-shadow:0 0 8px rgba(255,45,120,0.2); }
.toggle-thumb { position:absolute; top:3px; left:3px; width:12px; height:12px; background:var(--text-muted); border-radius:2px; transition:transform .2s var(--ease-elastic),background .2s; }
.cyber-toggle.active .toggle-thumb { transform:translateX(18px); background:var(--accent); }
.toggle-label { font-size:12px; color:var(--text-secondary); }
.launch-btn { width:100%; justify-content:center; margin-top:8px; padding:11px 18px; }
.tasks-stack { display:flex; flex-direction:column; gap:10px; }
.task-card { padding:14px 16px; }
.task-running { border-color:rgba(255,140,0,0.35); animation:borderFlow 2s ease-in-out infinite; }
.task-done    { border-color:rgba(0,255,159,0.25); }
.task-failed  { border-color:rgba(255,68,68,0.25); }
@keyframes borderFlow { 0%,100%{border-color:rgba(255,140,0,0.2)} 50%{border-color:rgba(255,140,0,0.5)} }
.task-head { display:flex; align-items:center; gap:10px; }
.task-status-icon { width:26px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:6px; flex-shrink:0; }
.icon-queued  { background:rgba(0,212,255,0.08); color:var(--cyan); }
.icon-running { background:rgba(255,140,0,0.08); color:var(--orange); }
.icon-done    { background:rgba(0,255,159,0.08); color:var(--green); }
.icon-failed  { background:rgba(255,68,68,0.08); color:var(--red); }
.task-info { flex:1; min-width:0; }
.task-name { font-size:13px; font-weight:600; color:var(--text-primary); }
.task-country { color:var(--cyan); font-size:12px; }
.task-id { font-size:10px; color:var(--text-muted); margin-top:2px; font-family:var(--font-mono); }
.task-progress { margin-top:8px; padding:6px 10px; background:var(--bg-elevated); font-size:11px; color:var(--text-secondary); border-left:2px solid var(--accent); border-radius:0 4px 4px 0; font-family:var(--font-mono); }
.task-stats { margin-top:8px; display:flex; gap:16px; font-size:12px; color:var(--text-muted); }
.task-stats b { color:var(--text-primary); font-family:var(--font-mono); }
.task-error { margin-top:8px; font-size:11px; color:var(--red); padding:6px 10px; background:rgba(255,68,68,0.05); border-left:2px solid var(--red); border-radius:0 4px 4px 0; }
.task-time { margin-top:8px; display:flex; gap:14px; font-size:11px; color:var(--text-muted); flex-wrap:wrap; }
.error-bar { display:flex; align-items:center; gap:8px; background:rgba(255,68,68,0.05); border:1px solid rgba(255,68,68,0.2); color:var(--text-secondary); padding:10px 14px; font-size:12px; margin-bottom:14px; border-radius:var(--radius-md); }
.empty-tasks { text-align:center; padding:48px; color:var(--text-muted); font-size:13px; }
.task-item-enter-active { animation:slideIn .3s var(--ease-elastic); }
.task-item-leave-active { animation:slideIn .15s var(--ease-out) reverse; }
@keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
</style>