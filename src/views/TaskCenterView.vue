<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">采集任务中心</h2>
        <p class="page-subtitle">触发爬虫采集、实时追踪任务进度</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" @click="loadTasks" :disabled="loading">刷新列表</button>
        <button class="btn btn-danger" @click="doCleanup">清理过期记录</button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="crawlStore.error" class="error-bar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ crawlStore.error }}
    </div>

    <div class="task-layout">
      <!-- 触发面板 -->
      <div class="card trigger-panel animate-fade-up" style="animation-delay:0ms">
        <div class="panel-title">触发新采集</div>
        <div class="form-group">
          <label class="form-label">品牌（留空=全部）</label>
          <select class="select" v-model="form.brand">
            <option value="">全部品牌</option>
            <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">国家（留空=全部）</label>
          <select class="select" v-model="form.country">
            <option value="">全部国家</option>
            <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="checkbox-row">
            <input type="checkbox" v-model="form.update_existing" />
            <span>更新已有产品数据</span>
          </label>
          <label class="checkbox-row" style="margin-top:8px">
            <input type="checkbox" v-model="form.force" />
            <span>强制新建（忽略同类运行中任务）</span>
          </label>
        </div>
        <button
          class="btn btn-primary"
          style="width:100%;justify-content:center;margin-top:12px"
          @click="doTrigger"
          :disabled="crawlStore.triggering"
        >
          <svg v-if="crawlStore.triggering" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {{ crawlStore.triggering ? '提交中...' : '立即采集' }}
        </button>
      </div>

      <!-- 任务列表 -->
      <div class="task-list-panel animate-fade-up" style="animation-delay:80ms">
        <div v-if="loading && tasks.length === 0">
          <div v-for="i in 3" :key="i" class="card task-card" style="margin-bottom:10px">
            <div class="skeleton" style="height:16px;width:40%;margin-bottom:8px"></div>
            <div class="skeleton" style="height:12px;width:60%"></div>
          </div>
        </div>
        <div v-else-if="tasks.length === 0" class="empty-tasks">
          <span>暂无任务记录</span>
        </div>
        <transition-group name="task-item" tag="div">
          <div
            v-for="task in tasks"
            :key="task.task_id"
            class="card task-card"
            :class="'task-' + task.status"
          >
            <div class="task-head">
              <div class="task-status-dot" :class="'dot-' + task.status">
                <svg v-if="task.status === 'running'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                <svg v-else-if="task.status === 'done'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else-if="task.status === 'failed'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="task-info">
                <div class="task-name">
                  {{ task.brand || '全部品牌' }}
                  <span v-if="task.country"> · {{ task.country }}</span>
                </div>
                <div class="task-id font-mono">{{ task.task_id.slice(0, 8) }}...</div>
              </div>
              <span class="badge" :class="statusBadge(task.status)">{{ statusLabel(task.status) }}</span>
            </div>
            <div class="task-progress" v-if="task.progress">
              <span class="font-mono" style="font-size:12px;color:var(--text-secondary)">{{ task.progress }}</span>
            </div>
            <div class="task-stats" v-if="task.status === 'done' && task.product_count !== null">
              <span>总计 <b>{{ task.product_count }}</b> 款</span>
              <span style="color:var(--green)">新增 <b>{{ task.new_count }}</b></span>
              <span style="color:var(--accent)">更新 <b>{{ task.updated_count }}</b></span>
            </div>
            <div class="task-error" v-if="task.error">{{ task.error }}</div>
            <div class="task-time" v-if="task.started_at">
              <span class="font-mono">开始：{{ formatTime(task.started_at) }}</span>
              <span v-if="task.finished_at" class="font-mono">完成：{{ formatTime(task.finished_at) }}</span>
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
const tasks = computed(() => crawlStore.tasks)
const loading = computed(() => crawlStore.loading)

const brands = ref<string[]>([])
const countries = ref<string[]>([])
const form = ref({ brand: '', country: '', update_existing: true, force: false })

function statusLabel(s: TaskStatus) {
  return { queued: '排队中', running: '运行中', done: '完成', failed: '失败' }[s] ?? s
}
function statusBadge(s: TaskStatus) {
  return { queued: 'badge-blue', running: 'badge-amber', done: 'badge-green', failed: 'badge-red' }[s] ?? ''
}

async function loadTasks() {
  await crawlStore.fetchTasks()
}

async function doTrigger() {
  const body: Record<string, unknown> = {
    update_existing: form.value.update_existing,
    force: form.value.force
  }
  if (form.value.brand) body.brand = form.value.brand
  if (form.value.country) body.country = form.value.country
  await crawlStore.trigger(body)
}

async function doCleanup() {
  const res = await crawlStore.cleanup()
  if (res) await loadTasks()
}

onMounted(async () => {
  const [br, co] = await Promise.all([productsApi.getBrands(), productsApi.getCountries()])
  if (br.success && br.data) brands.value = br.data
  if (co.success && co.data) countries.value = co.data
  await loadTasks()
})
</script>

<style scoped>
.task-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) { .task-layout { grid-template-columns: 1fr; } }

.trigger-panel { padding: 22px; }
.panel-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 18px; }

.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; margin-bottom: 5px; }

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}
.checkbox-row input[type="checkbox"] {
  width: 15px; height: 15px;
  accent-color: var(--accent);
  cursor: pointer;
}

.task-list-panel { display: flex; flex-direction: column; gap: 10px; }

.task-card {
  padding: 16px;
  transition: all var(--duration-base) var(--ease-out);
  animation: fadeInUp 0.3s var(--ease-out) both;
}
.task-running { border-color: rgba(255,184,0,0.3); animation: borderFlow 2s ease-in-out infinite; }
.task-done    { border-color: rgba(0,255,136,0.2); }
.task-failed  { border-color: rgba(255,68,102,0.2); }

.task-head { display: flex; align-items: center; gap: 12px; }
.task-status-dot {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.dot-queued  { background: rgba(0,212,255,0.1); color: var(--accent); }
.dot-running { background: rgba(255,184,0,0.1); color: var(--amber); }
.dot-done    { background: rgba(0,255,136,0.1); color: var(--green); }
.dot-failed  { background: rgba(255,68,102,0.1); color: var(--red); }

.task-info { flex: 1; min-width: 0; }
.task-name { font-size: 14px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.task-id   { font-size: 10px; color: var(--text-muted); margin-top: 1px; }

.task-progress { margin-top: 8px; padding: 6px 10px; background: var(--bg-elevated); border-radius: 6px; }
.task-stats { margin-top: 8px; display: flex; gap: 14px; font-size: 12px; color: var(--text-muted); }
.task-stats b { font-family: var(--font-mono); }
.task-error { margin-top: 8px; font-size: 12px; color: var(--red); padding: 6px 10px; background: var(--red-glow); border-radius: 6px; }
.task-time  { margin-top: 8px; display: flex; gap: 16px; font-size: 11px; color: var(--text-muted); flex-wrap: wrap; }

.error-bar {
  display: flex; align-items: center; gap: 8px;
  background: var(--red-glow);
  border: 1px solid rgba(255,68,102,0.3);
  color: var(--red);
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  margin-bottom: 16px;
}

.empty-tasks {
  text-align: center; padding: 60px; color: var(--text-muted); font-size: 14px;
}

.task-item-enter-active { animation: fadeInUp 0.3s var(--ease-out); }
.task-item-leave-active { animation: fadeInUp 0.15s var(--ease-out) reverse; }
</style>
