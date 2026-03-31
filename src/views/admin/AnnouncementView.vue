<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">系统公告</h2>
        <p class="page-subtitle">发布系统级通知，首页将同步展示最新公告</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card animate-fade-up">
        <div class="card-title">当前公告</div>
        <div class="an-content">{{ current.content || '暂无公告' }}</div>
        <div class="an-time">发布时间：{{ current.updated_at ? formatTime(current.updated_at) : '—' }}</div>
      </div>

      <div class="card animate-fade-up">
        <div class="card-title">发布新公告</div>
        <textarea class="input" style="min-height:120px;resize:vertical" v-model="draft" placeholder="请输入公告内容..."/>
        <div style="display:flex;justify-content:flex-end;margin-top:12px">
          <button class="btn btn-primary" @click="publish">发布公告</button>
        </div>
      </div>
    </div>

    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">{{ toast.msg }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const current = ref({
  content: '系统今晚 22:00 进行维护，请提前保存数据。',
  updated_at: new Date().toISOString(),
})
const draft = ref('')
const toast = ref({ show:false, msg:'', type:'ok' })

function showToast(msg:string, type:'ok'|'err'='ok'){
  toast.value = { show:true, msg, type }
  setTimeout(() => toast.value.show=false, 2200)
}

function formatTime(iso:string) {
  return new Date(iso).toLocaleString('zh-CN', { hour12:false })
}

function publish(){
  if (!draft.value.trim()) { showToast('请输入公告内容', 'err'); return }
  current.value = { content: draft.value.trim(), updated_at: new Date().toISOString() }
  draft.value = ''
  showToast('公告已发布')
}
</script>

<style scoped>
.card-title { font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:12px; letter-spacing:.01em; }
.an-content { font-size:14px; color:var(--text-secondary); line-height:1.7; min-height:80px; }
.an-time { margin-top:10px; font-size:12px; color:var(--text-muted); }
.toast { position:fixed; bottom:28px; right:28px; z-index:999; padding:12px 20px; border-radius:var(--radius-md); font-size:13px; font-weight:500; box-shadow:var(--shadow-lg); }
.toast-ok { background:rgba(17,24,39,.9); color:#fff; border:1px solid rgba(255,255,255,.14); }
.toast-err { background:rgba(239,68,68,.22); color:#FEE2E2; border:1px solid rgba(239,68,68,.5); }
.toast-enter-active,.toast-leave-active { transition:all .25s var(--ease-out); }
.toast-enter-from,.toast-leave-to { opacity:0; transform:translateY(10px); }
</style>
