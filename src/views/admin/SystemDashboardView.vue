<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">系统监控</h2>
        <p class="page-subtitle">实时查看系统健康状态、资源占用与运行统计</p>
      </div>
      <button class="btn btn-ghost" @click="refresh" :disabled="loading">{{ loading ? '刷新中...' : '刷新' }}</button>
    </div>

    <transition name="alert">
      <div v-if="heartbeatDead" class="alert-bar">⚠ 后端服务异常，最后心跳：{{ heartbeatAgo }}</div>
    </transition>

    <div class="grid-4">
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-label">CPU 使用率</div>
        <div class="kpi-value" :class="cpuClass">{{ metrics.cpu_percent.toFixed(1) }}%</div>
        <div class="progress-bar"><div class="fill" :style="{ width: metrics.cpu_percent + '%', background: 'linear-gradient(90deg,#06B6D4,#6366F1)' }"/></div>
      </div>
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-label">内存占用</div>
        <div class="kpi-value">{{ metrics.memory_rss_mb.toFixed(0) }} MB</div>
        <div class="kpi-sub">RSS 常驻内存</div>
      </div>
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-label">磁盘剩余</div>
        <div class="kpi-value" :class="diskClass">{{ metrics.disk_free_gb.toFixed(1) }} GB</div>
        <div class="kpi-sub">已用 {{ metrics.disk_percent.toFixed(1) }}%</div>
      </div>
      <div class="card kpi-card animate-fade-up">
        <div class="kpi-label">服务运行时长</div>
        <div class="kpi-value">{{ uptimeText }}</div>
        <div class="kpi-sub">持续健康运行</div>
      </div>
    </div>

    <div class="grid-2" style="margin-top:20px">
      <div class="card animate-fade-up">
        <div class="card-title">今日统计</div>
        <div class="stat-line">任务总数：<b>{{ metrics.today_tasks }}</b></div>
        <div class="stat-line">成功任务：<b style="color:var(--green)">{{ metrics.today_success }}</b></div>
        <div class="stat-line">失败任务：<b style="color:var(--red)">{{ metrics.today_failed }}</b></div>
      </div>
      <div class="card animate-fade-up">
        <div class="card-title">系统状态</div>
        <div class="state-row"><span>心跳：</span><span class="font-mono">{{ formatTime(state.last_heartbeat) }}</span></div>
        <div class="state-row"><span>采集开关：</span><span class="badge" :class="state.pause_crawling ? 'badge-red' : 'badge-green'">{{ state.pause_crawling ? '已暂停' : '运行中' }}</span></div>
        <div class="state-row"><span>磁盘占用：</span><span>{{ state.disk_usage.toFixed(1) }}%</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const loading = ref(false)
const state = ref({
  last_heartbeat: new Date().toISOString(),
  pause_crawling: false,
  disk_usage: 82.2,
})
const metrics = ref({
  cpu_percent: 42.1,
  memory_rss_mb: 256,
  disk_free_gb: 15.3,
  disk_total_gb: 200,
  disk_percent: 84.7,
  uptime_seconds: 302400,
  today_tasks: 48,
  today_success: 45,
  today_failed: 3,
})

let timer: ReturnType<typeof setInterval>

const heartbeatDead = computed(() => Date.now() - new Date(state.value.last_heartbeat).getTime() > 60_000)
const heartbeatAgo = computed(() => {
  const sec = Math.floor((Date.now() - new Date(state.value.last_heartbeat).getTime()) / 1000)
  if (sec < 60) return `${sec} 秒前`
  const min = Math.floor(sec / 60)
  return `${min} 分钟前`
})
const cpuClass  = computed(() => metrics.value.cpu_percent >= 90 ? 'text-red' : metrics.value.cpu_percent >= 80 ? 'text-orange' : '')
const diskClass = computed(() => metrics.value.disk_percent >= 90 ? 'text-red' : metrics.value.disk_percent >= 80 ? 'text-orange' : '')
const uptimeText = computed(() => {
  const s = metrics.value.uptime_seconds
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  return `${d}天${h}小时`
})

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', { hour12: false })
}

async function refresh() {
  loading.value = true
  await new Promise(r => setTimeout(r, 400))
  state.value.last_heartbeat = new Date().toISOString()
  metrics.value.cpu_percent = +(35 + Math.random() * 30).toFixed(1)
  metrics.value.memory_rss_mb = +(220 + Math.random() * 80).toFixed(0)
  loading.value = false
}

onMounted(() => {
  timer = setInterval(() => {
    state.value.last_heartbeat = new Date().toISOString()
  }, 5000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.alert-bar { margin-bottom:16px; padding:10px 14px; border-radius:10px; background:rgba(244,63,94,.15); color:#FCA5A5; border:1px solid rgba(244,63,94,.3); font-weight:600; }
.kpi-card { display:flex; flex-direction:column; gap:8px; }
.kpi-label { font-size:12px; color:var(--text-muted); }
.kpi-value { font-size:26px; font-weight:800; color:var(--text-primary); }
.kpi-sub { font-size:12px; color:var(--text-muted); }
.card-title { font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:12px; letter-spacing:.01em; }
.stat-line { font-size:13px; color:var(--text-secondary); margin-bottom:8px; }
.state-row { display:flex; align-items:center; justify-content:space-between; font-size:13px; padding:6px 0; color:var(--text-secondary); }
.alert-enter-active,.alert-leave-active { transition:all .2s var(--ease-out); }
.alert-enter-from,.alert-leave-to { opacity:0; transform:translateY(-8px); }
</style>
