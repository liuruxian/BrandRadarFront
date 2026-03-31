<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">服务控制台</h2>
        <p class="page-subtitle">远程控制采集运行状态与服务生命周期</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card animate-fade-up">
        <div class="card-title">采集控制</div>
        <div class="sc-row">
          <span>全局采集开关</span>
          <span class="badge" :class="paused ? 'badge-red' : 'badge-green'">{{ paused ? '已暂停' : '运行中' }}</span>
        </div>
        <div style="margin-top:12px">
          <button class="btn" :class="paused ? 'btn-primary' : 'btn-danger'" @click="togglePause">
            {{ paused ? '恢复采集' : '暂停采集' }}
          </button>
        </div>
      </div>

      <div class="card animate-fade-up">
        <div class="card-title">服务管理</div>
        <div class="sc-tip">重启将中断当前请求，PM2 会自动拉起服务。</div>
        <button class="btn btn-primary" style="margin-top:12px" @click="confirmRestart">重启服务</button>
      </div>
    </div>

    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">{{ toast.msg }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const paused = ref(false)
const toast = ref({ show: false, msg: '', type: 'ok' })

function showToast(msg: string, type: 'ok'|'err'='ok') {
  toast.value = { show: true, msg, type }
  setTimeout(() => toast.value.show = false, 2200)
}

function togglePause() {
  paused.value = !paused.value
  showToast(paused.value ? '已暂停采集' : '已恢复采集')
}

function confirmRestart() {
  if (!window.confirm('确认重启服务？服务将在 3 秒内重启。')) return
  showToast('重启命令已发送')
}
</script>

<style scoped>
.card-title { font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:12px; letter-spacing:.01em; }
.sc-row { display:flex; align-items:center; justify-content:space-between; font-size:13px; color:var(--text-secondary); }
.sc-tip { font-size:12px; color:var(--text-muted); line-height:1.6; }
.toast { position:fixed; bottom:28px; right:28px; z-index:999; padding:12px 20px; border-radius:var(--radius-md); font-size:13px; font-weight:500; box-shadow:var(--shadow-lg); }
.toast-ok { background:rgba(17,24,39,.9); color:#fff; border:1px solid rgba(255,255,255,.14); }
.toast-err { background:rgba(239,68,68,.22); color:#FEE2E2; border:1px solid rgba(239,68,68,.5); }
.toast-enter-active,.toast-leave-active { transition:all .25s var(--ease-out); }
.toast-enter-from,.toast-leave-to { opacity:0; transform:translateY(10px); }
</style>
