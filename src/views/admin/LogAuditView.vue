<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">日志审计</h2>
        <p class="page-subtitle">支持按级别、模块、关键词与时间范围筛选</p>
      </div>
      <button class="btn btn-danger" @click="clearAll">清空所有日志</button>
    </div>

    <div class="card animate-fade-up" style="margin-bottom:16px">
      <div class="filters">
        <select class="select" v-model="filters.level">
          <option value="">全部级别</option>
          <option value="ERROR">ERROR</option>
          <option value="WARN">WARN</option>
          <option value="INFO">INFO</option>
        </select>
        <select class="select" v-model="filters.module">
          <option value="">全部模块</option>
          <option value="Crawler">Crawler</option>
          <option value="System">System</option>
          <option value="User">User</option>
        </select>
        <input class="input" v-model="filters.keyword" placeholder="关键词搜索"/>
        <input class="input" type="date" v-model="filters.start"/>
        <input class="input" type="date" v-model="filters.end"/>
      </div>
    </div>

    <div class="card animate-fade-up">
      <div v-if="viewLogs.length===0" class="empty-state">暂无匹配日志</div>
      <div v-else class="log-list">
        <div v-for="l in viewLogs" :key="l.id" class="log-item" @click="toggle(l.id)">
          <div class="log-main">
            <span class="badge" :class="l.level==='ERROR'?'badge-red':l.level==='WARN'?'badge-amber':'badge-blue'">{{ l.level }}</span>
            <span class="font-mono log-time">{{ formatTime(l.timestamp) }}</span>
            <span class="log-module">{{ l.module }}</span>
            <span class="log-msg">{{ l.message }}</span>
            <span class="log-expand">{{ expandIds.has(l.id) ? '收起' : '展开' }}</span>
          </div>
          <pre v-if="expandIds.has(l.id)" class="log-detail">{{ l.detail || '无详细堆栈信息' }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Level = 'ERROR'|'WARN'|'INFO'
type Module = 'Crawler'|'System'|'User'

interface Log {
  id: string
  level: Level
  module: Module
  message: string
  detail?: string
  timestamp: string
}

const logs = ref<Log[]>([
  { id:'1', level:'ERROR', module:'Crawler', message:'请求超时: https://...', detail:'Traceback ... TimeoutError', timestamp:new Date(Date.now()-1000*60*2).toISOString() },
  { id:'2', level:'WARN', module:'System', message:'磁盘使用率超过 80%', detail:'Disk warning: /data usage 82%', timestamp:new Date(Date.now()-1000*60*6).toISOString() },
  { id:'3', level:'INFO', module:'User', message:'admin 登录成功', detail:'IP: 10.2.3.4', timestamp:new Date(Date.now()-1000*60*8).toISOString() },
])

const filters = ref({ level:'', module:'', keyword:'', start:'', end:'' })
const expandIds = ref(new Set<string>())

const viewLogs = computed(() => logs.value.filter(l => {
  if (filters.value.level && l.level !== filters.value.level) return false
  if (filters.value.module && l.module !== filters.value.module) return false
  if (filters.value.keyword && !(`${l.message} ${l.detail||''}`.toLowerCase().includes(filters.value.keyword.toLowerCase()))) return false
  if (filters.value.start && new Date(l.timestamp) < new Date(filters.value.start)) return false
  if (filters.value.end && new Date(l.timestamp) > new Date(filters.value.end + 'T23:59:59')) return false
  return true
}))

function formatTime(iso:string) {
  return new Date(iso).toLocaleString('zh-CN', { hour12:false })
}

function toggle(id:string){
  const n = new Set(expandIds.value)
  if (n.has(id)) n.delete(id)
  else n.add(id)
  expandIds.value = n
}

function clearAll(){
  if (!window.confirm('确认清空所有日志？此操作不可恢复。')) return
  logs.value = []
}
</script>

<style scoped>
.filters { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:10px; }
@media (max-width:1200px){ .filters { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media (max-width:900px){ .filters { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:640px){ .filters { grid-template-columns:1fr; } }
.log-list { display:flex; flex-direction:column; gap:8px; }
.log-item { border:1px solid var(--border); border-radius:10px; padding:10px 12px; cursor:pointer; background:rgba(255,255,255,.05); }
.log-item:hover { background:rgba(255,255,255,.08); }
.log-main { display:flex; align-items:center; gap:8px; min-width:0; }
.log-time { font-size:12px; color:var(--text-muted); flex-shrink:0; }
.log-module { font-size:12px; color:var(--accent); flex-shrink:0; }
.log-msg { font-size:13px; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.log-expand { margin-left:auto; font-size:12px; color:var(--text-muted); }
.log-detail { margin-top:8px; padding:10px; border-radius:8px; background:#111827; color:#E5E7EB; font-size:12px; white-space:pre-wrap; }
.empty-state { text-align:center; padding:36px; color:var(--text-muted); font-size:13px; }
</style>
