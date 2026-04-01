<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">配置中心</h2>
        <p class="page-subtitle">数据库备份、日志备份、采集任务调度配置</p>
      </div>
      <button class="btn btn-primary" @click="saveAll" :disabled="saving || loading">
        {{ saving ? '保存中...' : '保存配置' }}
      </button>
    </div>

    <div class="cfg-grid">
      <!-- 1) 数据库备份时间配置项 -->
      <section class="card cfg-card">
        <div class="cfg-title">1）数据库备份配置</div>

        <div class="cfg-row">
          <label class="cfg-label">备份触发时间</label>
          <input class="input" type="time" v-model="form.db.time_of_day" />
        </div>

        <div class="cfg-row">
          <label class="cfg-label">DB 备份保留天数</label>
          <input class="input" type="number" min="1" v-model.number="form.db.retention_days" />
        </div>

        <div class="cfg-row">
          <label class="cfg-label">本地最大备份数量</label>
          <input class="input" type="number" min="1" v-model.number="form.db.max_local_backup_files" />
        </div>

        <div class="cfg-row">
          <label class="cfg-label">清理时间窗口（例如 02:00-04:00）</label>
          <input class="input" v-model="form.db.cleanup_window" placeholder="02:00-04:00" />
        </div>
      </section>

      <!-- 2) 日志备份时间配置项 -->
      <section class="card cfg-card">
        <div class="cfg-title">2）日志备份配置</div>

        <div class="cfg-row">
          <label class="cfg-label">日志备份保留天数</label>
          <input class="input" type="number" min="1" v-model.number="form.logs.retention_days" />
        </div>

        <div class="cfg-row">
          <label class="cfg-label">本地最大备份数量</label>
          <input class="input" type="number" min="1" v-model.number="form.logs.max_local_backup_files" />
        </div>

        <div class="cfg-row">
          <label class="cfg-label">清理时间窗口（可与 DB 共用或独立）</label>
          <input class="input" v-model="form.logs.cleanup_window" placeholder="02:00-04:00" />
        </div>
      </section>

      <!-- 3) 采集任务时间配置项 -->
      <section class="card cfg-card">
        <div class="cfg-title">3）采集任务调度配置</div>

        <div class="cfg-row">
          <label class="cfg-label">调度间隔（分钟）</label>
          <input class="input" type="number" min="1" v-model.number="form.scheduler.interval_minutes" />
        </div>

        <div class="cfg-row">
          <label class="cfg-label">每日最大运行次数</label>
          <input class="input" type="number" min="1" v-model.number="form.scheduler.max_daily_runs" />
        </div>

        <div class="cfg-row cfg-switch-row">
          <label class="cfg-label">启用静默时段</label>
          <div class="switch-row" @click="form.scheduler.silent_enabled = !form.scheduler.silent_enabled">
            <div class="stoggle" :class="{ on: form.scheduler.silent_enabled }"><div class="stoggle-thumb" /></div>
            <span>{{ form.scheduler.silent_enabled ? '已启用' : '未启用' }}</span>
          </div>
        </div>

        <div class="cfg-row cfg-inline" :class="{ disabled: !form.scheduler.silent_enabled }">
          <div>
            <label class="cfg-label">静默开始</label>
            <input class="input" type="time" v-model="form.scheduler.silent_start" :disabled="!form.scheduler.silent_enabled" />
          </div>
          <div>
            <label class="cfg-label">静默结束</label>
            <input class="input" type="time" v-model="form.scheduler.silent_end" :disabled="!form.scheduler.silent_enabled" />
          </div>
        </div>
      </section>
    </div>

    <div v-if="warn" class="warn-box">⚠ {{ warn }}</div>

    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">{{ toast.msg }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { adminApi, type SystemConfig } from '@/api/adminApi'
import { schedulerApi } from '@/api/schedulerApi'

const loading = ref(false)
const saving = ref(false)
const toast = ref({ show: false, msg: '', type: 'ok' as 'ok' | 'err' })

const form = ref({
  db: {
    time_of_day: '02:30',
    retention_days: 14,
    max_local_backup_files: 30,
    cleanup_window: '02:00-04:00',
  },
  logs: {
    retention_days: 14,
    max_local_backup_files: 30,
    cleanup_window: '02:00-04:00',
  },
  scheduler: {
    interval_minutes: 1440,
    max_daily_runs: 1,
    silent_enabled: false,
    silent_start: '23:00',
    silent_end: '07:00',
  },
})

const warn = computed(() => {
  if (form.value.db.retention_days < 1 || form.value.logs.retention_days < 1) return '保留天数必须大于 0'
  if (form.value.db.max_local_backup_files < 1 || form.value.logs.max_local_backup_files < 1) return '本地最大备份数量必须大于 0'
  if (form.value.scheduler.interval_minutes < 1) return '调度间隔必须大于 0'
  if (form.value.scheduler.max_daily_runs < 1) return '每日最大运行次数必须大于 0'
  return ''
})

function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
  toast.value = { show: true, msg, type }
  window.setTimeout(() => (toast.value.show = false), 2200)
}

function applyBackupConfig(cfg: SystemConfig) {
  form.value.db.time_of_day = cfg.schedule?.time_of_day ?? '02:30'
  form.value.db.retention_days = cfg.database?.retention_days ?? 14
  form.value.db.max_local_backup_files = cfg.database?.max_local_backup_files ?? 30
  form.value.db.cleanup_window = cfg.database?.cleanup_window ?? '02:00-04:00'

  form.value.logs.retention_days = cfg.logs?.retention_days ?? 14
  form.value.logs.max_local_backup_files = cfg.logs?.max_local_backup_files ?? form.value.db.max_local_backup_files
  form.value.logs.cleanup_window = cfg.logs?.cleanup_window ?? form.value.db.cleanup_window
}

async function loadAll() {
  loading.value = true
  try {
    const [backupRes, schedulerRes] = await Promise.all([
      adminApi.getConfig(),
      schedulerApi.getStatus(),
    ])

    if (backupRes.success && backupRes.data) {
      applyBackupConfig(backupRes.data)
    }

    if (schedulerRes.success && schedulerRes.data) {
      form.value.scheduler.interval_minutes = schedulerRes.data.interval_minutes
      form.value.scheduler.max_daily_runs = schedulerRes.data.max_daily_runs
      form.value.scheduler.silent_enabled = schedulerRes.data.silent_hours.enabled
      form.value.scheduler.silent_start = schedulerRes.data.silent_hours.start || '23:00'
      form.value.scheduler.silent_end = schedulerRes.data.silent_hours.end || '07:00'
    }
  } catch {
    showToast('读取配置失败', 'err')
  } finally {
    loading.value = false
  }
}

async function saveAll() {
  if (warn.value) {
    showToast('请先修正配置项', 'err')
    return
  }

  saving.value = true
  try {
    const backupPayload: Partial<SystemConfig> = {
      schedule: {
        schedule_type: 'daily',
        interval_minutes: 1440,
        time_of_day: form.value.db.time_of_day,
        weekly_days: [],
        timezone: 'Asia/Shanghai',
      },
      database: {
        enabled: true,
        retention_days: form.value.db.retention_days,
        backup_dir: 'backup/postgres',
        max_local_backup_files: form.value.db.max_local_backup_files,
        cleanup_window: form.value.db.cleanup_window,
      },
      logs: {
        enabled: true,
        retention_days: form.value.logs.retention_days,
        backup_dir: 'backup/logs',
        since_hours: 24,
        max_local_backup_files: form.value.logs.max_local_backup_files,
        cleanup_window: form.value.logs.cleanup_window,
      },
    }

    const [backupSaveRes, schedulerSaveRes] = await Promise.all([
      adminApi.updateConfig(backupPayload),
      schedulerApi.setSchedule({
        interval_minutes: form.value.scheduler.interval_minutes,
        max_daily_runs: form.value.scheduler.max_daily_runs,
        silent_hours: {
          enabled: form.value.scheduler.silent_enabled,
          start: form.value.scheduler.silent_start,
          end: form.value.scheduler.silent_end,
        },
      }),
    ])

    if (!backupSaveRes.success || !schedulerSaveRes.success) {
      showToast('部分配置保存失败，请重试', 'err')
      return
    }

    showToast('配置保存成功')
  } catch {
    showToast('配置保存失败', 'err')
  } finally {
    saving.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
.cfg-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.cfg-card { min-height: 100%; }
.cfg-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; }
.cfg-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.cfg-row:last-child { margin-bottom: 0; }
.cfg-label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
.cfg-inline { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cfg-inline.disabled { opacity: .6; }
.cfg-switch-row { margin-top: 2px; }

.switch-row { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; color: var(--text-secondary); font-size: 13px; }
.stoggle { width: 44px; height: 24px; border-radius: 999px; background: #D1D5DB; position: relative; transition: all .2s; }
.stoggle-thumb { width: 18px; height: 18px; border-radius: 50%; background: #FFFFFF; position: absolute; top: 3px; left: 3px; transition: left .2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
.stoggle.on { background: #00C4CC; }
.stoggle.on .stoggle-thumb { left: 23px; }

.warn-box { margin-top: 14px; padding: 10px 12px; border-radius: 8px; background: rgba(245,158,11,.14); color: #B45309; border: 1px solid rgba(245,158,11,.3); font-size: 12px; }
.toast { position: fixed; bottom: 28px; right: 28px; z-index: 999; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 500; box-shadow: 0 12px 24px rgba(15, 23, 42, .12); }
.toast-ok { background: #111827; color: #fff; }
.toast-err { background: #FF6B6B; color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all .2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
