<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">调度管理</h2>
        <p class="page-subtitle">管理自动化定时采集任务的运行策略</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" @click="doFetch" :disabled="loading">刷新状态</button>
        <button class="btn btn-primary" @click="doReload" :disabled="reloading">
          <svg v-if="reloading" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          {{ reloading ? '重载中...' : '热重载配置' }}
        </button>
      </div>
    </div>

    <transition name="toast">
      <div v-if="reloadSuccess" class="success-bar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        调度配置已热重载成功
      </div>
    </transition>

    <div v-if="status" class="sched-layout">
      <div class="grid-3" style="margin-bottom:20px">
        <div class="card stat-card animate-fade-up" style="animation-delay:0ms">
          <div class="stat-label">运行模式</div>
          <div style="margin-top:10px">
            <span class="badge" :class="status.mode === 'auto' ? 'badge-green' : 'badge-gray'">
              {{ status.mode === 'auto' ? '自动模式' : '手动模式' }}
            </span>
          </div>
        </div>
        <div class="card stat-card animate-fade-up" style="animation-delay:60ms">
          <div class="stat-label">下次运行</div>
          <div class="countdown font-mono" :class="{ inactive: status.mode !== 'auto' }">
            {{ status.mode === 'auto' ? countdownText : '—' }}
          </div>
        </div>
        <div class="card stat-card animate-fade-up" style="animation-delay:120ms">
          <div class="stat-label">今日运行</div>
          <div class="today-runs">
            <span class="runs-num font-mono">{{ status.today_runs }}</span>
            <span class="runs-max"> / {{ status.max_daily_runs }} 次</span>
          </div>
          <div class="progress-bar" style="margin-top:10px">
            <div class="fill" :style="{ width: (status.today_runs / status.max_daily_runs * 100) + '%', background: 'linear-gradient(90deg, var(--accent), var(--green))' }" />
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card animate-fade-up" style="animation-delay:160ms">
          <div class="card-title" style="margin-bottom:18px">采集间隔配置</div>
          <div class="config-row">
            <span class="config-key">采集间隔</span>
            <span class="config-val font-mono">{{ status.interval_minutes }} 分钟</span>
          </div>
          <div class="config-row">
            <span class="config-key">每日上限</span>
            <span class="config-val font-mono">{{ status.max_daily_runs }} 次</span>
          </div>
          <div class="config-row">
            <span class="config-key">今日已运行</span>
            <span class="config-val font-mono" style="color:var(--accent)">{{ status.today_runs }} 次</span>
          </div>
        </div>
        <div class="card animate-fade-up" style="animation-delay:220ms">
          <div class="card-title" style="margin-bottom:18px">静默期配置</div>
          <div class="config-row">
            <span class="config-key">静默期状态</span>
            <span class="badge" :class="status.silent_hours.enabled ? 'badge-amber' : 'badge-gray'">
              {{ status.silent_hours.enabled ? '已启用' : '未启用' }}
            </span>
          </div>
          <template v-if="status.silent_hours.enabled">
            <div class="config-row">
              <span class="config-key">开始时间</span>
              <span class="config-val font-mono">{{ status.silent_hours.start }}</span>
            </div>
            <div class="config-row">
              <span class="config-key">结束时间</span>
              <span class="config-val font-mono">{{ status.silent_hours.end }}</span>
            </div>
          </template>
        </div>
      </div>

      <div class="card notice-card animate-fade-up" style="margin-top:20px;animation-delay:280ms">
        <div style="display:flex;gap:10px;align-items:flex-start">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" stroke-width="2" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <div style="font-weight:600;color:var(--amber);margin-bottom:6px">如何修改调度配置？</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">
              编辑后端项目中的 <code class="inline-code">scheduler/schedule_config.json</code> 文件，
              修改完成后点击右上角「热重载配置」按钮，即可在不重启服务的情况下立即生效。
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="grid-3" style="margin-bottom:20px">
      <div v-for="i in 3" :key="i" class="card" style="padding:20px">
        <div class="skeleton" style="height:12px;width:50%;margin-bottom:12px"></div>
        <div class="skeleton" style="height:28px;width:70%"></div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div style="font-size:36px;margin-bottom:12px">⚙️</div>
      <div style="color:var(--text-secondary)">无法获取调度器状态</div>
      <button class="btn btn-primary" style="margin-top:16px" @click="doFetch">重试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSchedulerStore } from '@/stores/schedulerStore'
import { formatCountdown } from '@/utils/format'

const store = useSchedulerStore()
const status = computed(() => store.status)
const loading = computed(() => store.loading)
const reloading = computed(() => store.reloading)
const reloadSuccess = ref(false)

const remaining = ref(0)
let countdownTimer: ReturnType<typeof setInterval>

const countdownText = computed(() => formatCountdown(remaining.value))

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer)
  remaining.value = status.value?.next_run_in_seconds ?? 0
  countdownTimer = setInterval(() => {
    if (remaining.value > 0) remaining.value--
  }, 1000)
}

async function doFetch() {
  await store.fetchStatus()
  startCountdown()
}

async function doReload() {
  const ok = await store.reload()
  if (ok) {
    reloadSuccess.value = true
    startCountdown()
    setTimeout(() => { reloadSuccess.value = false }, 3000)
  }
}

onMounted(() => doFetch())
onUnmounted(() => clearInterval(countdownTimer))
</script>

<style scoped>
.sched-layout { display: flex; flex-direction: column; gap: 0; }

.stat-card { padding: 20px; }
.stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500; }

.countdown {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
  margin-top: 10px;
  letter-spacing: 0.02em;
}
.countdown.inactive { color: var(--text-muted); }

.today-runs { display: flex; align-items: baseline; gap: 4px; margin-top: 10px; }
.runs-num { font-size: 28px; font-weight: 700; color: var(--text-primary); }
.runs-max { font-size: 13px; color: var(--text-muted); }

.card-title { font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }

.config-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.config-row:last-child { border-bottom: none; }
.config-key { font-size: 13px; color: var(--text-secondary); }
.config-val { font-size: 13px; color: var(--text-primary); font-weight: 600; }

.notice-card { background: rgba(255,184,0,0.04); border-color: rgba(255,184,0,0.2); padding: 16px 20px; }

.inline-code {
  background: var(--bg-elevated);
  color: var(--accent);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.success-bar {
  display: flex; align-items: center; gap: 8px;
  background: var(--green-glow);
  border: 1px solid rgba(0,255,136,0.3);
  color: var(--green);
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 300px;
  color: var(--text-secondary); font-size: 14px;
}

.toast-enter-active { animation: fadeInUp 0.3s var(--ease-out); }
.toast-leave-active { animation: fadeInUp 0.2s var(--ease-out) reverse; }
</style>
