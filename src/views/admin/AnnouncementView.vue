<template>
  <div class="page-container">
    <div class="page-header idc-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="header-title">
          <h1>系统公告</h1>
          <p class="header-desc">发布系统级通知，首页将同步展示最新公告</p>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card animate-fade-up">
        <div class="card-title">
          当前公告
        </div>
        <div class="an-content">
          {{ current.content || '暂无公告' }}
        </div>
        <div class="an-time">
          发布时间：{{ current.updated_at ? formatTime(current.updated_at) : '—' }}
        </div>
      </div>

      <div class="card animate-fade-up">
        <div class="card-title">
          发布新公告
        </div>
        <textarea
          v-model="draft"
          class="input"
          style="min-height:120px;resize:vertical"
          placeholder="请输入公告内容..."
        />
        <div style="display:flex;justify-content:flex-end;margin-top:12px">
          <button
            class="btn btn-primary"
            @click="publish"
          >
            发布公告
          </button>
        </div>
      </div>
    </div>

    <transition name="toast">
      <div
        v-if="toast.show"
        class="toast"
        :class="'toast-'+toast.type"
      >
        {{ toast.msg }}
      </div>
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
.page-container { display: flex; flex-direction: column; gap: 20px; padding: 0; }
.card-title { font-size:14px; font-weight:700; color:#111827; margin-bottom:12px; letter-spacing:.01em; }
.an-content { font-size:14px; color:#374151; line-height:1.7; min-height:80px; }
.an-time { margin-top:10px; font-size:12px; color:#6b7280; }
.toast { position:fixed; bottom:28px; right:28px; z-index:999; padding:12px 20px; border-radius:10px; font-size:13px; font-weight:500; box-shadow:0 4px 16px rgba(0,0,0,0.15); }
.toast-ok { background:#ffffff; color:#111827; border:1px solid #e5e7eb; }
.toast-err { background:rgba(239,68,68,.1); color:#DC2626; border:1px solid rgba(239,68,68,.3); }
.toast-enter-active,.toast-leave-active { transition:all .25s ease; }
.toast-enter-from,.toast-leave-to { opacity:0; transform:translateY(10px); }

/* ==================== IDC风格页面头部 ==================== */
.idc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
}
.header-left { display: flex; align-items: center; gap: 16px; }
.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  color: white;
}
.header-title h1 { font-size: 22px; font-weight: 700; color: white; margin: 0; line-height: 1.2; }
.header-desc { font-size: 13px; color: rgba(255, 255, 255, 0.85); margin: 4px 0 0; }
</style>
