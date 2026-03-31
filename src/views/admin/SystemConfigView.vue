<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">配置中心</h2>
        <p class="page-subtitle">在线调整系统参数（暂为前端预置草稿）</p>
      </div>
      <button class="btn btn-primary" @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存配置' }}</button>
    </div>

    <div class="card animate-fade-up">
      <div class="cfg-grid">
        <div class="cfg-row">
          <label class="cfg-label">request_interval_ms</label>
          <input class="input" type="number" v-model.number="form.request_interval_ms" min="0"/>
          <div class="cfg-help">爬虫请求间隔（ms），建议 ≥ 500</div>
        </div>

        <div class="cfg-row">
          <label class="cfg-label">request_timeout_ms</label>
          <input class="input" type="number" v-model.number="form.request_timeout_ms" min="1000"/>
          <div class="cfg-help">请求超时时间（ms）</div>
        </div>

        <div class="cfg-row">
          <label class="cfg-label">log_retention_days</label>
          <input class="input" type="number" v-model.number="form.log_retention_days" min="1" max="365"/>
          <div class="cfg-help">日志保留天数（1-365）</div>
        </div>

        <div class="cfg-row">
          <label class="cfg-label">proxy_enabled</label>
          <div class="switch-row" @click="form.proxy_enabled = !form.proxy_enabled">
            <div class="stoggle" :class="{ on: form.proxy_enabled }"><div class="stoggle-thumb"/></div>
            <span>{{ form.proxy_enabled ? '已启用' : '未启用' }}</span>
          </div>
        </div>

        <div class="cfg-row" v-if="form.proxy_enabled">
          <label class="cfg-label">proxy_url</label>
          <input class="input" v-model="form.proxy_url" placeholder="http://127.0.0.1:7890"/>
          <div class="cfg-help">代理地址</div>
        </div>
      </div>

      <div v-if="warn" class="warn-box">⚠ {{ warn }}</div>
    </div>

    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast-'+toast.type">{{ toast.msg }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const saving = ref(false)
const toast = ref({ show:false, msg:'', type:'ok' })
const form = ref({
  request_interval_ms: 2000,
  request_timeout_ms: 30000,
  log_retention_days: 30,
  proxy_enabled: false,
  proxy_url: '',
})

const warn = computed(() => {
  if (form.value.request_interval_ms < 500) return '间隔过短可能导致封禁'
  if (form.value.log_retention_days < 1 || form.value.log_retention_days > 365) return '日志保留天数应在 1~365 之间'
  if (form.value.proxy_enabled && !form.value.proxy_url.trim()) return '启用代理后请填写代理地址'
  return ''
})

function showToast(msg: string, type: 'ok'|'err'='ok') {
  toast.value = { show:true, msg, type }
  setTimeout(() => toast.value.show = false, 2200)
}

async function save() {
  if (warn.value) { showToast('请先修正表单校验项', 'err'); return }
  saving.value = true
  await new Promise(r => setTimeout(r, 500))
  saving.value = false
  showToast('配置已保存（演示模式）')
}
</script>

<style scoped>
.cfg-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
@media (max-width:900px){ .cfg-grid { grid-template-columns:1fr; } }
.cfg-row { display:flex; flex-direction:column; gap:6px; }
.cfg-label { font-size:12px; color:var(--text-muted); font-weight:600; }
.cfg-help { font-size:12px; color:var(--text-muted); }
.warn-box { margin-top:14px; padding:10px 12px; border-radius:8px; background:rgba(245,158,11,.14); color:#FCD34D; border:1px solid rgba(245,158,11,.3); font-size:12px; }
.switch-row { display:flex; align-items:center; gap:10px; cursor:pointer; user-select:none; color:var(--text-secondary); font-size:13px; }
.stoggle { width:44px; height:24px; border-radius:999px; background:rgba(148,163,184,.45); position:relative; transition:all .2s; }
.stoggle-thumb { width:18px; height:18px; border-radius:50%; background:rgba(18,22,30,.9); position:absolute; top:3px; left:3px; transition:left .2s; box-shadow:0 1px 3px rgba(0,0,0,0.15); }
.stoggle.on { background:linear-gradient(135deg,#06B6D4,#6366F1); }
.stoggle.on .stoggle-thumb { left:23px; }
.toast { position:fixed; bottom:28px; right:28px; z-index:999; padding:12px 20px; border-radius:var(--radius-md); font-size:13px; font-weight:500; box-shadow:var(--shadow-lg); }
.toast-ok { background:#111827; color:#fff; }
.toast-err { background:var(--red); color:#fff; }
.toast-enter-active,.toast-leave-active { transition:all .25s var(--ease-out); }
.toast-enter-from,.toast-leave-to { opacity:0; transform:translateY(10px); }
</style>
