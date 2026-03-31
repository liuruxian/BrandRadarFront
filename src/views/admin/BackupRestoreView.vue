<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">备份恢复</h2>
        <p class="page-subtitle">支持立即备份与一键还原（演示数据）</p>
      </div>
      <button class="btn btn-primary" @click="createBackup">立即备份</button>
    </div>

    <div class="card animate-fade-up">
      <div class="card-title" style="margin-bottom:12px">备份列表</div>
      <table class="data-table" v-if="backups.length">
        <thead><tr><th>文件名</th><th>大小</th><th>创建时间</th><th style="text-align:right">操作</th></tr></thead>
        <tbody>
          <tr v-for="b in backups" :key="b.filename">
            <td class="font-mono" style="font-size:12px">{{ b.filename }}</td>
            <td>{{ formatBytes(b.size_bytes) }}</td>
            <td>{{ formatTime(b.created_at) }}</td>
            <td style="text-align:right"><button class="btn btn-danger" style="padding:4px 10px;font-size:12px" @click="restore(b.filename)">还原</button></td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">暂无备份文件</div>
    </div>

    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">{{ toast.msg }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Backup {
  filename: string
  size_bytes: number
  created_at: string
}

const backups = ref<Backup[]>([
  { filename:'backup_20260330_142201.zip', size_bytes: 2_300_000, created_at: new Date(Date.now()-1000*60*60*3).toISOString() },
  { filename:'backup_20260329_080000.zip', size_bytes: 2_100_000, created_at: new Date(Date.now()-1000*60*60*30).toISOString() },
])

const toast = ref({ show:false, msg:'', type:'ok' })
function showToast(msg:string, type:'ok'|'err'='ok'){
  toast.value = { show:true, msg, type }
  setTimeout(() => toast.value.show=false, 2200)
}

function formatTime(iso:string) {
  return new Date(iso).toLocaleString('zh-CN', { hour12:false })
}
function formatBytes(b:number) {
  if (b < 1024) return `${b} B`
  const kb = b / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb/1024).toFixed(1)} MB`
}

function createBackup(){
  const now = new Date()
  const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`
  backups.value.unshift({ filename:`backup_${ts}.zip`, size_bytes: 2_000_000 + Math.round(Math.random()*800_000), created_at:new Date().toISOString() })
  showToast('备份已创建')
}

function restore(filename:string){
  if (!window.confirm(`此操作将覆盖当前所有数据，确认还原 ${filename}？`)) return
  showToast('还原任务已提交')
}
</script>

<style scoped>
.card-title { font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:12px; letter-spacing:.01em; }
.empty-state { text-align:center; padding:36px; color:var(--text-muted); font-size:13px; }
.toast { position:fixed; bottom:28px; right:28px; z-index:999; padding:12px 20px; border-radius:var(--radius-md); font-size:13px; font-weight:500; box-shadow:var(--shadow-lg); }
.toast-ok { background:rgba(17,24,39,.9); color:#fff; border:1px solid rgba(255,255,255,.14); }
.toast-err { background:rgba(239,68,68,.22); color:#FEE2E2; border:1px solid rgba(239,68,68,.5); }
.toast-enter-active,.toast-leave-active { transition:all .25s var(--ease-out); }
.toast-enter-from,.toast-leave-to { opacity:0; transform:translateY(10px); }
</style>
