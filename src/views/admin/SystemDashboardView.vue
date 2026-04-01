<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">系统监控总览（运维看板）</h2>
        <p class="page-subtitle">综合运维看板 · 仅监控展示（不含运维操作）</p>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <span class="conn-dot" :class="monitorStore.sseConnected ? 'ok' : 'bad'">{{ monitorStore.sseConnected ? 'SSE 已连接' : 'SSE 断开' }}</span>
        <button class="btn btn-ghost" @click="refresh" :disabled="monitorStore.loading" title="手动刷新一次“系统监控总览（运维看板）”快照，不会重连SSE">刷新系统监控总览</button>
      </div>
    </div>

    <section class="section-wrap">
      <div class="section-title">系统健康状态</div>
      <div class="grid-2">
        <div class="card status-hero">
          <div class="status-head"><div class="status-name">API 主服务</div><span class="badge" :class="boolBadge(ov.health.api_alive)">{{ boolText(ov.health.api_alive) }}</span></div>
          <div class="status-sub">CPU {{ fmtPct(ov.host.cpu_percent) }} · 内存 {{ fmtPct(ov.host.memory_percent) }}</div>
          <div class="status-sub">运行时长：{{ fmtUptime(ov.host.service_uptime_seconds) }}</div>
        </div>
        <div class="card status-hero">
          <div class="status-head"><div class="status-name">备份调度后台</div><span class="badge" :class="boolBadge(ov.health.backup_alive)">{{ boolText(ov.health.backup_alive) }}</span></div>
          <div class="status-sub">备份服务器心跳状态：{{ boolText(ov.backupHeartbeat.health) }}</div>
          <div class="status-sub">连续失败次数：{{ ov.backupHeartbeat.consecutive_failures ?? 0 }}</div>
        </div>
      </div>
      <div class="grid-4" style="margin-top:12px;">
        <div class="card kpi-card"><div class="kpi-label">CPU 使用率（%）</div><div class="kpi-value" :class="percentClass(ov.host.cpu_percent)">{{ fmtPct(ov.host.cpu_percent) }}</div></div>
        <div class="card kpi-card"><div class="kpi-label">内存使用率（%）</div><div class="kpi-value" :class="percentClass(ov.host.memory_percent)">{{ fmtPct(ov.host.memory_percent) }}</div><div class="kpi-sub">{{ fmtBytes(ov.host.memory_used_bytes) }} / {{ fmtBytes(ov.host.memory_total_bytes) }}</div></div>
        <div class="card kpi-card"><div class="kpi-label">磁盘使用率（%）</div><div class="kpi-value" :class="percentClass(ov.host.disk_used_percent)">{{ fmtPct(ov.host.disk_used_percent) }}</div><div class="kpi-sub">剩余 {{ fmtBytes(ov.host.disk_free_bytes) }}</div></div>
        <div class="card kpi-card"><div class="kpi-label">调度器 / 看门狗</div><div class="kpi-sub">采集调度后台：{{ boolText(ov.health.scheduler_alive) }}</div><div class="kpi-sub">服务看门狗后台：{{ boolText(ov.health.watchdog_alive) }}</div></div>
      </div>
    </section>

    <section class="section-wrap" style="margin-top:16px;">
      <div class="section-title">采集任务与数据预警</div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-title">采集任务统计与预警统计</div>
        <div class="grid-2">
          <div class="state-row"><span>排队中的采集任务数</span><span class="font-mono">{{ ov.crawlStats.queued ?? 0 }}</span></div>
          <div class="state-row"><span>运行中的采集任务数</span><span class="font-mono">{{ ov.crawlStats.running ?? 0 }}</span></div>
          <div class="state-row"><span>已完成采集任务数</span><span class="font-mono">{{ ov.crawlStats.done ?? 0 }}</span></div>
          <div class="state-row"><span>失败采集任务数</span><span class="font-mono">{{ ov.crawlStats.failed ?? 0 }}</span></div>
          <div class="state-row"><span>待处理预警数</span><span class="font-mono">{{ ov.alertStats.pending ?? 0 }}</span></div>
          <div class="state-row"><span>已批准预警数 / 已拒绝预警数</span><span class="font-mono">{{ ov.alertStats.approved ?? 0 }} / {{ ov.alertStats.rejected ?? 0 }}</span></div>
        </div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-head">
          <div class="card-title">查询预警列表</div>
          <div class="alert-filter-wrap">
            <label class="alert-filter-label">处理状态</label>
            <select class="select alert-select" v-model="alertFilter" @change="refreshAlerts">
              <option value="pending">待处理</option>
              <option value="approved">已批准</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
        </div>
        <div class="table-wrap"><table class="data-table compact"><thead><tr><th>预警 ID</th><th>品牌</th><th>国家代码</th><th>预警类型</th><th>状态</th><th>最后错误信息</th></tr></thead><tbody>
          <tr v-for="a in alertRows" :key="a.id"><td class="font-mono">{{ a.id.slice(0, 8) }}...</td><td>{{ a.brand || '-' }}</td><td>{{ a.country || '-' }}</td><td>{{ a.alert_type || '-' }}</td><td><span class="badge" :class="alertBadge(a.status)">{{ a.status }}</span></td><td class="err">{{ a.last_error || '-' }}</td></tr>
          <tr v-if="alertRows.length === 0"><td colspan="6" class="empty-row">暂无预警</td></tr>
        </tbody></table></div>
      </div>
      <div class="card">
        <div class="card-title">查询采集任务列表</div>
        <div class="table-wrap"><table class="data-table compact"><thead><tr><th>任务唯一 ID</th><th>品牌（可为空）</th><th>国家代码（可为空）</th><th>任务状态</th><th>进度描述</th><th>失败错误信息</th></tr></thead><tbody>
          <tr v-for="t in crawlTasks" :key="t.task_id"><td class="font-mono">{{ t.task_id.slice(0, 12) }}...</td><td>{{ t.brand || '-' }}</td><td>{{ t.country || '-' }}</td><td><span class="badge" :class="taskBadge(t.status)">{{ t.status }}</span></td><td>{{ t.progress || '-' }}</td><td class="err">{{ t.error || '-' }}</td></tr>
          <tr v-if="crawlTasks.length === 0"><td colspan="6" class="empty-row">暂无任务</td></tr>
        </tbody></table></div>
      </div>
    </section>

    <section class="section-wrap" style="margin-top:16px;">
      <div class="section-title">备份调度与日志监控</div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title">备份任务指标</div>
          <div class="state-row"><span>最近备份任务状态</span><span class="font-mono">{{ ov.backupMetrics.last_status || '-' }}</span></div>
          <div class="state-row"><span>最近备份完成时间</span><span class="font-mono">{{ fmtTime(ov.backupMetrics.last_finished_at) }}</span></div>
          <div class="state-row"><span>最近 DB 备份</span><span class="font-mono">{{ ov.backupMetrics.last_db_backup_file || '-' }}</span></div>
          <div class="state-row"><span>最近日志备份</span><span class="font-mono">{{ ov.backupMetrics.last_logs_backup_file || '-' }}</span></div>
          <div class="state-row"><span>近7天成功率（0~1）</span><span class="font-mono">{{ fmtPct(ov.backupMetrics.seven_day_success_rate) }}</span></div>
          <div class="state-row"><span>近7天成功次数 / 近7天失败次数</span><span class="font-mono">{{ ov.backupMetrics.seven_day_done ?? 0 }} / {{ ov.backupMetrics.seven_day_failed ?? 0 }}</span></div>
          <div class="state-row"><span>最近错误</span><span class="err">{{ ov.backupMetrics.last_error || '-' }}</span></div>
        </div>
        <div class="card">
          <div class="card-title">日志监控指标</div>
          <div class="state-row"><span>每分钟 ERROR 数</span><span class="font-mono">{{ ov.logs.error_per_minute ?? 0 }}</span></div>
          <div class="state-row"><span>每分钟 WARN 数</span><span class="font-mono">{{ ov.logs.warn_per_minute ?? 0 }}</span></div>
          <div class="state-row"><span>最近1分钟日志增长字节数</span><span class="font-mono">{{ fmtBytes(ov.logs.log_growth_bytes_last_minute) }}</span></div>
          <div class="card-subtitle" style="margin-top:8px;">最近关键异常（去重）</div>
          <ul class="exc-list"><li v-for="(x, i) in (ov.logs.recent_exceptions || []).slice(0, 6)" :key="i">{{ x }}</li><li v-if="!ov.logs.recent_exceptions?.length" class="empty-row" style="list-style:none">暂无异常</li></ul>
        </div>
      </div>
      <div class="card" style="margin-top:12px;">
        <div class="card-title">查询备份任务列表</div>
        <div class="table-wrap"><table class="data-table compact"><thead><tr><th>任务 ID</th><th>目标</th><th>状态</th><th>开始时间</th><th>结束时间</th><th>错误信息</th></tr></thead><tbody>
          <tr v-for="b in backupTasks" :key="b.task_id"><td class="font-mono">{{ b.task_id.slice(0, 12) }}...</td><td>{{ b.target }}</td><td><span class="badge" :class="taskBadge(b.status)">{{ b.status }}</span></td><td>{{ fmtTime(b.started_at) }}</td><td>{{ fmtTime(b.finished_at) }}</td><td class="err">{{ b.error || '-' }}</td></tr>
          <tr v-if="backupTasks.length === 0"><td colspan="6" class="empty-row">暂无备份任务</td></tr>
        </tbody></table></div>
      </div>
    </section>

    <div class="sync-tip">最后同步：{{ lastSync }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMonitorStore } from '@/stores/monitorStore'
import { useToast } from '@/composables/useToast'

const monitorStore = useMonitorStore()
const toast = useToast()
const alertFilter = ref<'pending' | 'approved' | 'rejected'>('pending')

const overview = computed(() => monitorStore.overview)
const ov = computed(() => {
  const d: any = overview.value || {}
  return {
    health: d.system_health ?? d.health ?? {},
    host: d.host_metrics ?? d.host ?? {},
    scheduler: d.scheduler_status ?? d.scheduler ?? {},
    backup: d.backup_status ?? d.backup ?? {},
    backupHeartbeat: d.backup_heartbeat_status ?? d.backup_heartbeat ?? {},
    watchdog: d.service_watchdog_status ?? d.watchdog ?? {},
    crawlStats: d.crawl_task_stats ?? d.crawl_tasks ?? {},
    alertStats: d.alert_stats ?? d.alerts ?? {},
    backupMetrics: d.backup_task_metrics ?? d.backup_metrics ?? {},
    logs: d.log_metrics ?? d.logs ?? {},
    titles: d.display_titles ?? {},
  }
})
const crawlTasks = computed(() => monitorStore.crawlTaskList.slice(0, 10))
const backupTasks = computed(() => monitorStore.backupTaskList.slice(0, 10))
const alertRows = computed(() => monitorStore.alertList.filter((a) => a.status === alertFilter.value).slice(0, 10))
const lastSync = computed(() => monitorStore.lastSyncAt ? new Date(monitorStore.lastSyncAt).toLocaleString('zh-CN', { hour12: false }) : '-')

const fmtPct = (v?: number) => (typeof v === 'number' ? `${v.toFixed(1)}%` : '-')
function fmtBytes(v?: number) { if (v === undefined || v === null) return '-'; const gb = v / 1024 / 1024 / 1024; if (gb >= 1) return `${gb.toFixed(2)} GB`; return `${(v / 1024 / 1024).toFixed(0)} MB` }
const fmtTime = (v?: string | null) => (v ? new Date(v).toLocaleString('zh-CN', { hour12: false }) : '-')
function fmtUptime(s?: number) { if (!s && s !== 0) return '-'; const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); return `${d}天${h}小时` }
const percentClass = (v?: number) => ((v ?? 0) >= 90 ? 'text-red' : (v ?? 0) >= 80 ? 'text-orange' : '')
const boolText = (v?: boolean) => (v ? '运行中' : '异常')
const boolBadge = (v?: boolean) => (v ? 'badge-green' : 'badge-red')
const taskBadge = (s: string) => (s === 'done' ? 'badge-green' : s === 'failed' ? 'badge-red' : s === 'running' ? 'badge-amber' : s === 'skipped' ? 'badge-gray' : 'badge-blue')
const alertBadge = (s: string) => (s === 'approved' ? 'badge-green' : s === 'rejected' ? 'badge-red' : 'badge-amber')

async function refresh() {
  try {
    await monitorStore.fetchInitial()
    toast.success('监控快照已刷新')
  } catch {
    toast.error('监控快照刷新失败')
  }
}
async function refreshAlerts() {
  try {
    await monitorStore.fetchAlerts({ status: alertFilter.value })
    toast.info('预警列表已刷新')
  } catch {
    toast.error('预警列表刷新失败')
  }
}

onMounted(async () => {
  try {
    await monitorStore.fetchInitial()
    monitorStore.connectSse()
  } catch {
    toast.error('系统监控初始化失败')
  }
})
onUnmounted(() => { monitorStore.disconnectSse() })
</script>

<style scoped>
.section-title { font-size:15px; font-weight:800; color:var(--text-primary); margin-bottom:10px; }
.status-hero { border-left:4px solid #00C4CC; }
.status-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.status-name { font-size:14px; font-weight:700; color:var(--text-primary); }
.status-sub { font-size:12px; color:var(--text-muted); margin-top:4px; }
.conn-dot { font-size:12px; padding:3px 8px; border-radius:999px; }
.conn-dot.ok { background:rgba(16,185,129,.12); color:#047857; border:1px solid rgba(16,185,129,.24); }
.conn-dot.bad { background:rgba(244,63,94,.12); color:#B42318; border:1px solid rgba(244,63,94,.24); }
.kpi-card { display:flex; flex-direction:column; gap:6px; }
.kpi-label { font-size:12px; color:var(--text-muted); }
.kpi-value { font-size:24px; font-weight:800; color:var(--text-primary); }
.kpi-sub, .card-subtitle { font-size:12px; color:var(--text-muted); }
.card-title { font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:12px; }
.card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:16px; }
.alert-filter-wrap { display:flex; align-items:center; gap:10px; }
.alert-filter-label { font-size:12px; color:var(--text-muted); white-space:nowrap; }
.alert-select {
  min-width: 168px;
  height: 34px;
  padding: 0 34px 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 196, 204, 0.32);
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfd 100%);
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255,255,255,0.8);
  appearance: none;
  -webkit-appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #06b6d4 50%),
    linear-gradient(135deg, #06b6d4 50%, transparent 50%),
    linear-gradient(180deg, #ffffff 0%, #f7fbfd 100%);
  background-position:
    calc(100% - 17px) 14px,
    calc(100% - 11px) 14px,
    0 0;
  background-size: 6px 6px, 6px 6px, 100% 100%;
  background-repeat: no-repeat;
}
.alert-select:hover {
  border-color: rgba(0, 196, 204, 0.55);
}
.alert-select:focus {
  border-color: #00c4cc;
  box-shadow: 0 0 0 3px rgba(0,196,204,0.18), 0 2px 6px rgba(15, 23, 42, 0.08);
}
@media (max-width: 900px) {
  .card-head { flex-direction: column; align-items: flex-start; }
  .alert-filter-wrap { width: 100%; }
  .alert-select { width: 100%; }
}

.state-row { display:flex; align-items:center; justify-content:space-between; font-size:13px; color:var(--text-secondary); padding:5px 0; gap:8px; }
.table-wrap { overflow-x:auto; }
.data-table.compact th, .data-table.compact td { padding:8px 10px; font-size:12px; }
.err { max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#B42318; }
.exc-list { margin:0; padding-left:16px; display:flex; flex-direction:column; gap:6px; color:var(--text-secondary); font-size:12px; }
.sync-tip { margin-top:12px; font-size:12px; color:var(--text-muted); text-align:right; }
.badge-gray { background: rgba(100,116,139,.12); color: #475569; border: 1px solid rgba(100,116,139,.25); }
</style>
