<template>
  <div class="page-container">
    <div class="page-header idc-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="header-title">
          <h1>会话管理</h1>
          <p class="header-desc">查看当前在线会话并支持强制下线</p>
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-idc" :disabled="loading" @click="loadSessions">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
            <path d="M21 12a9 9 0 11-9-9"/>
            <path d="M21 3v6h-6"/>
          </svg>
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
      </div>
    </div>

    <div class="card animate-fade-up">
      <table
        v-if="sessions.length"
        class="data-table"
      >
        <thead>
          <tr>
            <th>用户名</th>
            <th>登录时间</th>
            <th>最后活跃</th>
            <th>Token</th>
            <th style="text-align:right">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in sessions"
            :key="s.token"
          >
            <td>{{ s.username }}</td>
            <td
              class="font-mono"
              style="font-size:12px"
            >
              {{ formatTime(s.login_at) }}
            </td>
            <td>{{ agoText(s.last_active_at) }}</td>
            <td
              class="font-mono"
              style="font-size:12px;color:var(--text-muted)"
            >
              {{ s.token.slice(0,10) }}...{{ s.token.slice(-6) }}
            </td>
            <td style="text-align:right">
              <button
                class="btn btn-danger"
                style="padding:4px 10px;font-size:12px"
                @click="kick(s.token)"
              >
                强制下线
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-else
        class="empty-state"
      >
        {{ loading ? '加载中...' : '暂无在线会话' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { adminApi, type Session } from '@/api/adminApi'

const sessions = ref<Session[]>([])
const loading = ref(false)

async function loadSessions() {
  loading.value = true
  try {
    const res = await adminApi.getSessions()
    if (res.success && res.data) sessions.value = res.data.sessions || []
  } finally {
    loading.value = false
  }
}

function formatTime(iso:string) {
  return new Date(iso).toLocaleString('zh-CN', { hour12:false })
}

function agoText(iso:string) {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (sec < 60) return `${sec}秒前`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}分钟前`
  const h = Math.floor(min / 60)
  return `${h}小时前`
}

async function kick(token:string) {
  if (!window.confirm('确认强制下线该会话？')) return
  await adminApi.kickSession(token)
  await loadSessions()
}

onMounted(loadSessions)
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 20px; padding: 0; }
.empty-state { text-align:center; padding:36px; color:#6b7280; font-size:13px; }

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
.header-right { display: flex; align-items: center; gap: 12px; }
.btn-idc {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}
.btn-idc:hover:not(:disabled) { background: rgba(255, 255, 255, 0.3); }
.btn-idc:disabled { opacity: 0.6; cursor: not-allowed; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
