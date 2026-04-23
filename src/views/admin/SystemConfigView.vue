<template>
  <div class="page-container">
    <div class="cfg-grid">
      <div class="cfg-block">
        <div class="cfg-block-title">
          数据库备份配置
        </div>
        <section class="card cfg-card">
          <div class="triple-row two-col-row">
            <div class="cfg-row">
              <label class="cfg-label">最大份数</label>
              <input
                v-model.number="form.db.max_local_backup_files"
                class="input"
                type="number"
                min="1"
              >
            </div>
            <div class="cfg-row">
              <label class="cfg-label">保留天数</label>
              <input
                v-model.number="form.db.retention_days"
                class="input"
                type="number"
                min="1"
              >
            </div>
          </div>
          <div class="cfg-row cfg-action single-action">
            <button
              class="btn btn-primary"
              :disabled="savingDb || loading"
              @click="saveDbConfig"
            >
              {{ savingDb ? '保存中...' : '保存配置' }}
            </button>
          </div>
        </section>
      </div>

      <div class="cfg-block">
        <div class="cfg-block-title">
          日志备份配置
        </div>
        <section class="card cfg-card">
          <div class="triple-row two-col-row">
            <div class="cfg-row">
              <label class="cfg-label">最大份数</label>
              <input
                v-model.number="form.logs.max_local_backup_files"
                class="input"
                type="number"
                min="1"
              >
            </div>
            <div class="cfg-row">
              <label class="cfg-label">保留天数</label>
              <input
                v-model.number="form.logs.retention_days"
                class="input"
                type="number"
                min="1"
              >
            </div>
          </div>
          <div class="cfg-row cfg-action single-action">
            <button
              class="btn btn-primary"
              :disabled="savingLogs || loading"
              @click="saveLogsConfig"
            >
              {{ savingLogs ? '保存中...' : '保存配置' }}
            </button>
          </div>
        </section>
      </div>

      <div class="cfg-block">
        <div class="cfg-block-title">
          采集任务调度配置
        </div>
        <section class="card cfg-card">
          <div class="triple-row two-col-row">
            <div class="cfg-row">
              <label class="cfg-label">调度类型</label>
              <select
                v-model="form.scheduler.mode"
                class="select"
              >
                <option value="daily">
                  每日
                </option>
                <option value="weekly">
                  每周
                </option>
                <option value="monthly">
                  每月
                </option>
              </select>
            </div>
            <div class="cfg-row">
              <label class="cfg-label">具体时间</label>
              <input
                v-model="form.scheduler.time"
                class="input"
                type="time"
              >
            </div>
          </div>

          <div
            v-if="form.scheduler.mode === 'weekly'"
            class="triple-row"
          >
            <div class="cfg-row">
              <label class="cfg-label">每周执行日</label>
              <select
                v-model.number="form.scheduler.weekly_day"
                class="select"
              >
                <option :value="1">
                  周一
                </option>
                <option :value="2">
                  周二
                </option>
                <option :value="3">
                  周三
                </option>
                <option :value="4">
                  周四
                </option>
                <option :value="5">
                  周五
                </option>
                <option :value="6">
                  周六
                </option>
                <option :value="0">
                  周日
                </option>
              </select>
            </div>
          </div>

          <div
            v-if="form.scheduler.mode === 'monthly'"
            class="triple-row"
          >
            <div class="cfg-row">
              <label class="cfg-label">每月日期</label>
              <input
                v-model.number="form.scheduler.monthly_day"
                class="input"
                type="number"
                min="1"
                max="28"
              >
            </div>
          </div>

          <div
            class="cfg-row cfg-action single-action"
            style="margin-bottom: 10px;"
          >
            <button
              class="btn btn-primary"
              :disabled="savingScheduler || loading"
              @click="saveSchedulerConfig"
            >
              {{ savingScheduler ? '保存中...' : '保存配置' }}
            </button>
          </div>

          <div class="triple-row immediate-row two-col-row">
            <div class="cfg-row">
              <label class="cfg-label">立即采集品牌</label>
              <select
                v-model="immediate.brand"
                class="select"
              >
                <option value="">
                  全部品牌
                </option>
                <option
                  v-for="b in brands"
                  :key="b"
                  :value="b"
                >
                  {{ b }}
                </option>
              </select>
            </div>
            <div class="cfg-row">
              <label class="cfg-label">立即采集国家</label>
              <select
                v-model="immediate.country"
                class="select"
              >
                <option value="">
                  全部国家
                </option>
                <option
                  v-for="c in countries"
                  :key="c"
                  :value="c"
                >
                  {{ c }}
                </option>
              </select>
            </div>
          </div>
          <div class="cfg-row cfg-action single-action">
            <button
              class="btn btn-primary"
              :disabled="crawling"
              @click="triggerImmediateCrawl"
            >
              {{ crawling ? '提交中...' : '立即采集' }}
            </button>
          </div>
        </section>
      </div>
    </div>

    <transition name="toast">
      <div
        v-if="toast.show"
        class="toast"
        :class="`toast-${toast.type}`"
      >
        {{ toast.msg }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { adminApi, type SystemConfig } from '@/api/adminApi'
import { schedulerApi } from '@/api/schedulerApi'
import { productsApi } from '@/api/productsApi'

const loading = ref(false)
const savingDb = ref(false)
const savingLogs = ref(false)
const savingScheduler = ref(false)
const crawling = ref(false)
const toast = ref({ show: false, msg: '', type: 'ok' as 'ok' | 'err' })
const baseConfig = ref<SystemConfig | null>(null)

const form = ref({
  db: { retention_days: 14, max_local_backup_files: 30 },
  logs: { retention_days: 14, max_local_backup_files: 30 },
  scheduler: { mode: 'daily' as 'daily' | 'weekly' | 'monthly', time: '02:00', weekly_day: 1, monthly_day: 1 }
})

const brands = ref<string[]>([])
const countries = ref<string[]>([])
const immediate = ref({ brand: '', country: '' })

function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
  toast.value = { show: true, msg, type }
  window.setTimeout(() => (toast.value.show = false), 2200)
}

function parseScheduler(status: { interval_minutes: number }) {
  if (status.interval_minutes === 10080) form.value.scheduler.mode = 'weekly'
  else if (status.interval_minutes >= 43200) form.value.scheduler.mode = 'monthly'
  else form.value.scheduler.mode = 'daily'
}

function cronExpression() {
  const [h, m] = form.value.scheduler.time.split(':')
  if (form.value.scheduler.mode === 'weekly') return `${Number(m)} ${Number(h)} * * ${form.value.scheduler.weekly_day}`
  if (form.value.scheduler.mode === 'monthly') return `${Number(m)} ${Number(h)} ${form.value.scheduler.monthly_day} * *`
  return `${Number(m)} ${Number(h)} * * *`
}

async function loadAll() {
  loading.value = true
  try {
    const [backupRes, schedulerRes, brandsRes, countriesRes] = await Promise.all([
      adminApi.getConfig(),
      schedulerApi.getStatus(),
      productsApi.getBrands(),
      productsApi.getCountries(),
    ])

    if (backupRes.success && backupRes.data) {
      baseConfig.value = backupRes.data
      form.value.db.retention_days = backupRes.data.database?.retention_days ?? 14
      form.value.db.max_local_backup_files = backupRes.data.database?.max_local_backup_files ?? 30
      form.value.logs.retention_days = backupRes.data.logs?.retention_days ?? 14
      form.value.logs.max_local_backup_files = backupRes.data.logs?.max_local_backup_files ?? 30
    }

    if (schedulerRes.success && schedulerRes.data) parseScheduler(schedulerRes.data)
    if (brandsRes.success && brandsRes.data) brands.value = brandsRes.data
    if (countriesRes.success && countriesRes.data) countries.value = countriesRes.data
  } catch {
    showToast('读取配置失败', 'err')
  } finally {
    loading.value = false
  }
}

async function saveDbConfig() {
  if (form.value.db.retention_days < 1 || form.value.db.max_local_backup_files < 1) return showToast('数据库配置不合法', 'err')
  savingDb.value = true
  try {
    const res = await adminApi.updateConfig({
      database: {
        enabled: baseConfig.value?.database?.enabled ?? true,
        backup_dir: baseConfig.value?.database?.backup_dir ?? 'backup/postgres',
        retention_days: form.value.db.retention_days,
        max_local_backup_files: form.value.db.max_local_backup_files,
      }
    })
    if (!res.success) return showToast('数据库配置保存失败', 'err')
    showToast('数据库配置已保存')
  } finally {
    savingDb.value = false
  }
}

async function saveLogsConfig() {
  if (form.value.logs.retention_days < 1 || form.value.logs.max_local_backup_files < 1) return showToast('日志配置不合法', 'err')
  savingLogs.value = true
  try {
    const res = await adminApi.updateConfig({
      logs: {
        enabled: baseConfig.value?.logs?.enabled ?? true,
        backup_dir: baseConfig.value?.logs?.backup_dir ?? 'backup/logs',
        since_hours: baseConfig.value?.logs?.since_hours ?? 24,
        retention_days: form.value.logs.retention_days,
        max_local_backup_files: form.value.logs.max_local_backup_files,
      }
    })
    if (!res.success) return showToast('日志配置保存失败', 'err')
    showToast('日志配置已保存')
  } finally {
    savingLogs.value = false
  }
}

async function saveSchedulerConfig() {
  savingScheduler.value = true
  try {
    const res = await schedulerApi.setSchedule({
      schedule_type: 'cron',
      cron_expression: cronExpression(),
      max_daily_runs: 1,
    })
    if (!res.success) return showToast('调度配置保存失败', 'err')
    showToast('调度配置已保存')
  } finally {
    savingScheduler.value = false
  }
}

async function triggerImmediateCrawl() {
  crawling.value = true
  try {
    const payload: { brand?: string; countries?: string[] } = {}
    if (immediate.value.brand) payload.brand = immediate.value.brand
    if (immediate.value.country) payload.countries = [immediate.value.country]
    const res = await schedulerApi.schedulerCrawl(payload)
    if (!res.success) return showToast('立即采集提交失败', 'err')
    showToast('立即采集任务已提交')
  } finally {
    crawling.value = false
  }
}

watch(() => immediate.value.brand, async (brand) => {
  const res = await productsApi.getCountries(brand || undefined)
  if (res.success && res.data) countries.value = res.data
  if (immediate.value.country && !countries.value.includes(immediate.value.country)) immediate.value.country = ''
})

onMounted(loadAll)
</script>

<style scoped>
/* inherits from global .page-container */
.cfg-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}
@media (max-width: 1200px) {
  .cfg-grid { grid-template-columns: 1fr; }
}

.cfg-block { display: flex; flex-direction: column; gap: 8px; }
.cfg-block-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: .02em;
  padding-left: 2px;
}

.cfg-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.triple-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 8px;
}
.two-col-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.immediate-row {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed rgba(148,163,184,.35);
}

.cfg-row { display: flex; flex-direction: column; gap: 6px; }
.cfg-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: .04em;
}
.cfg-action.single-action {
  margin-top: 4px;
  align-items: flex-end;
  margin-bottom: 0;
}
.cfg-action .btn {
  width: 136px;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 12px;
  font-size: 13px;
}
.cfg-card > .cfg-action.single-action:last-child { margin-top: auto; padding-top: 4px; }

.toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 999;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 12px 24px rgba(15, 23, 42, .12);
}
.toast-ok { background: #111827; color: #fff; }
.toast-err { background: #FF6B6B; color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all .2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }

:deep(.input), :deep(.select) {
  min-height: 38px;
  border-radius: 10px;
}

@media (max-width: 1200px) {
  .cfg-action .btn { width: 124px; }
}

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
</style>
