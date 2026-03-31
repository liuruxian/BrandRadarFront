<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">会话管理</h2>
        <p class="page-subtitle">查看当前在线会话并支持强制下线</p>
      </div>
    </div>

    <div class="card animate-fade-up">
      <table class="data-table" v-if="sessions.length">
        <thead>
          <tr>
            <th>用户名</th>
            <th>登录时间</th>
            <th>最后活跃</th>
            <th>Token</th>
            <th style="text-align:right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in sessions" :key="s.token">
            <td>{{ s.username }}</td>
            <td class="font-mono" style="font-size:12px">{{ formatTime(s.login_at) }}</td>
            <td>{{ agoText(s.last_active_at) }}</td>
            <td class="font-mono" style="font-size:12px;color:var(--text-muted)">{{ s.token.slice(0,10) }}...{{ s.token.slice(-6) }}</td>
            <td style="text-align:right">
              <button class="btn btn-danger" style="padding:4px 10px;font-size:12px" @click="kick(s.token)">强制下线</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">暂无在线会话</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Session {
  token: string
  username: string
  login_at: string
  last_active_at: string
}

const sessions = ref<Session[]>([
  { token:'tok_admin_1234567890abcdef', username:'admin', login_at:new Date(Date.now()-1000*60*60*3).toISOString(), last_active_at:new Date(Date.now()-1000*60*2).toISOString() },
  { token:'tok_viewer_1234567890abcdef', username:'viewer1', login_at:new Date(Date.now()-1000*60*60*15).toISOString(), last_active_at:new Date(Date.now()-1000*60*40).toISOString() },
])

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

function kick(token:string) {
  if (!window.confirm('确认强制下线该会话？')) return
  sessions.value = sessions.value.filter(s => s.token !== token)
}
</script>

<style scoped>
.empty-state { text-align:center; padding:36px; color:var(--text-muted); font-size:13px; }
</style>
