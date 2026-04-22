<template>
  <div class="idc-export">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h1>数据导出</h1>
        <p class="page-desc">导出当前视图数据、原始数据或生成分析报告</p>
      </div>
    </div>

    <!-- 导出类型选择 -->
    <div class="export-types">
      <div
        v-for="type in exportTypes"
        :key="type.key"
        class="export-type-card"
        :class="{ active: activeType === type.key }"
        @click="activeType = type.key as 'current_view' | 'raw_data' | 'report'"
      >
        <div class="type-icon" v-html="type.icon" />
        <div class="type-info">
          <h3>{{ type.title }}</h3>
          <p>{{ type.desc }}</p>
        </div>
        <div class="type-badge">
          <n-tag :type="type.badgeType" size="small">{{ type.badge }}</n-tag>
        </div>
      </div>
    </div>

    <!-- 导出配置 -->
    <div class="export-config">
      <n-card title="导出配置">
        <!-- 当前视图导出 -->
        <template v-if="activeType === 'current_view'">
          <n-form label-placement="left" label-width="100">
            <n-form-item label="数据类型">
              <n-select
                v-model:value="currentViewConfig.dataType"
                :options="dataTypeOptions"
                placeholder="选择数据类型"
              />
            </n-form-item>
            <n-form-item label="导出格式">
              <n-radio-group v-model:value="currentViewConfig.format">
                <n-radio value="csv">CSV</n-radio>
                <n-radio value="excel">Excel</n-radio>
              </n-radio-group>
            </n-form-item>
          </n-form>
        </template>

        <!-- 原始数据导出 -->
        <template v-else-if="activeType === 'raw_data'">
          <n-alert type="warning" :bordered="false">
            原始数据导出需要 Analyst 及以上权限，请确保您有权限进行此操作。
          </n-alert>
          <n-form label-placement="left" label-width="100" style="margin-top: 16px">
            <n-form-item label="数据范围">
              <n-select
                v-model:value="rawDataConfig.range"
                :options="rangeOptions"
                placeholder="选择数据范围"
              />
            </n-form-item>
            <n-form-item label="导出格式">
              <n-radio-group v-model:value="rawDataConfig.format">
                <n-radio value="csv">CSV</n-radio>
                <n-radio value="excel">Excel</n-radio>
              </n-radio-group>
            </n-form-item>
          </n-form>
        </template>

        <!-- 报告导出 -->
        <template v-else-if="activeType === 'report'">
          <n-form label-placement="left" label-width="100">
            <n-form-item label="报告标题">
              <n-input v-model:value="reportConfig.title" placeholder="输入报告标题" />
            </n-form-item>
            <n-form-item label="报告内容">
              <n-checkbox-group v-model:value="reportConfig.sections">
                <n-space>
                  <n-checkbox value="kpi" label="KPI 看板" />
                  <n-checkbox value="trend" label="趋势图表" />
                  <n-checkbox value="brand" label="品牌结构" />
                  <n-checkbox value="region" label="区域结构" />
                  <n-checkbox value="model" label="型号对比" />
                  <n-checkbox value="summary" label="分析摘要" />
                </n-space>
              </n-checkbox-group>
            </n-form-item>
          </n-form>
        </template>

        <div class="export-actions">
          <n-button type="primary" size="large" :loading="exporting" @click="handleExport">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </template>
            确认导出
          </n-button>
        </div>
      </n-card>
    </div>

    <!-- 导出历史 -->
    <div class="export-history">
      <div class="history-header">
        <h3>导出历史</h3>
        <n-button text size="small" @click="loadHistory">刷新</n-button>
      </div>

      <n-data-table
        :columns="historyColumns"
        :data="exportHistory"
        :loading="historyLoading"
        :bordered="false"
        size="small"
      />
    </div>

    <!-- 导出结果弹窗 -->
    <n-modal
      v-model:show="showResultModal"
      preset="dialog"
      title="导出结果"
      style="width: 400px"
    >
      <div class="export-result">
        <n-result
          :status="exportResult.status"
          :title="exportResult.title"
          :description="exportResult.description"
        />
        <n-button v-if="exportResult.downloadUrl" type="primary" tag="a" :href="exportResult.downloadUrl" download>
          下载文件
        </n-button>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NCard,
  NForm,
  NFormItem,
  NSelect,
  NRadioGroup,
  NRadio,
  NInput,
  NCheckboxGroup,
  NCheckbox,
  NSpace,
  NAlert,
  NButton,
  NDataTable,
  NTag,
  NResult,
  NModal,
  useMessage,
  useDialog,
} from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useIDCStore } from '@/stores/idcStore'
import { idcApi } from '@/api/idcApi'

const message = useMessage()
const dialog = useDialog()
const idcStore = useIDCStore()
const { filters, hasActiveFilters } = storeToRefs(idcStore)

// ==================== State ====================
const activeType = ref<'current_view' | 'raw_data' | 'report'>('current_view')
const exporting = ref(false)
const historyLoading = ref(false)
const showResultModal = ref(false)

// Config
const currentViewConfig = ref({
  dataType: 'pivot',
  format: 'csv' as 'csv' | 'excel',
})

const rawDataConfig = ref({
  range: 'current',
  format: 'csv' as 'csv' | 'excel',
})

const reportConfig = ref({
  title: 'IDC 市场分析报告',
  sections: ['kpi', 'trend', 'brand'] as string[],
  format: 'pdf' as 'pdf' | 'excel',
})

// Export History
const exportHistory = ref<HistoryItem[]>([])

interface HistoryItem {
  id: string
  type: string
  format: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  download_url?: string
}

const exportResult = ref({
  status: 'success' as 'success' | 'error',
  title: '',
  description: '',
  downloadUrl: '',
})

// ==================== Options ====================
const exportTypes = [
  {
    key: 'current_view',
    title: '当前视图导出',
    desc: '导出当前筛选条件下的聚合结果',
    badge: '全部用户',
    badgeType: 'success' as const,
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
    </svg>`,
  },
  {
    key: 'raw_data',
    title: '原始数据导出',
    desc: '导出筛选条件下的原始明细数据',
    badge: 'Analyst+',
    badgeType: 'warning' as const,
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>`,
  },
  {
    key: 'report',
    title: '报告导出',
    desc: '生成包含图表和分析的 PDF 报告',
    badge: 'Analyst+',
    badgeType: 'warning' as const,
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>`,
  },
]

const dataTypeOptions = [
  { label: '透视表数据', value: 'pivot' },
  { label: '趋势图表数据', value: 'trend' },
  { label: '排行榜数据', value: 'ranking' },
]

const rangeOptions = [
  { label: '当前筛选条件', value: 'current' },
  { label: '全部数据', value: 'all' },
]

const historyColumns: DataTableColumn<HistoryItem>[] = [
  { title: '时间', key: 'created_at', width: 180 },
  { title: '类型', key: 'type', width: 120 },
  { title: '格式', key: 'format', width: 80 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const typeMap: Record<string, 'default' | 'info' | 'success' | 'error'> = {
        pending: 'default',
        processing: 'info',
        completed: 'success',
        failed: 'error',
      }
      return h(NTag, { type: typeMap[row.status], size: 'small' }, () => row.status)
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => {
      if (row.status === 'completed' && row.download_url) {
        return h(
          NButton,
          { size: 'small', text: true, type: 'primary' },
          {
            default: () => '下载',
            icon: () => h('a', { href: row.download_url, target: '_blank', download: true }),
          }
        )
      }
      return null
    },
  },
]

// ==================== Methods ====================
async function handleExport() {
  dialog.warning({
    title: '确认导出',
    content: '是否确认导出数据？',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      await performExport()
    },
  })
}

async function performExport() {
  exporting.value = true

  try {
    let res

    if (activeType.value === 'current_view') {
      res = await idcApi.exportCurrentView({
        filters: hasActiveFilters.value ? filters.value : undefined,
        export_type: 'pivot',
        format: currentViewConfig.value.format as 'excel',
      })
    } else if (activeType.value === 'raw_data') {
      res = await idcApi.exportRawData({
        filters: hasActiveFilters.value ? filters.value : undefined,
        format: rawDataConfig.value.format as 'csv',
      })
    } else {
      message.warning('报告导出功能正在开发中')
      exporting.value = false
      return
    }

    if (res.success && res.data) {
      exportResult.value = {
        status: 'success',
        title: '导出任务已创建',
        description: res.data.filename ? `文件: ${res.data.filename}，记录数: ${res.data.record_count}` : '导出任务已创建，请稍后刷新历史记录下载。',
        downloadUrl: res.data.download_url || '',
      }
      showResultModal.value = true
      await loadHistory()
    }
  } catch (e) {
    exportResult.value = {
      status: 'error',
      title: '导出失败',
      description: '导出过程中出现错误，请重试。',
      downloadUrl: '',
    }
    showResultModal.value = true
  } finally {
    exporting.value = false
  }
}

async function loadHistory() {
  historyLoading.value = true
  try {
    // TODO: 加载导出历史
    // const res = await idcApi.getExportHistory()
    // if (res.success && res.data) {
    //   exportHistory.value = res.data
    // }
  } catch (e) {
    console.error('Failed to load history:', e)
  } finally {
    historyLoading.value = false
  }
}

// ==================== Lifecycle ====================
onMounted(async () => {
  await loadHistory()
})
</script>

<style scoped>
.idc-export {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  border-radius: 16px;
  margin: 0;
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.25);
  overflow: hidden;
}

.page-title h1 {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.2;
}

.page-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin: 4px 0 0;
}

.export-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.export-type-card {
  background: rgba(0, 0, 0, 0.04);
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.export-type-card:hover {
  border-color: rgba(0, 0, 0, 0.15);
  background: rgba(0, 0, 0, 0.06);
}

.export-type-card.active {
  border-color: #3B82F6;
  background: rgba(59, 130, 246, 0.1);
}

.type-icon {
  color: #6B7280;
  flex-shrink: 0;
}

.export-type-card.active .type-icon {
  color: #3B82F6;
}

.type-info {
  flex: 1;
}

.type-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.type-info p {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
}

.type-badge {
  flex-shrink: 0;
}

.export-config {
  /* 继承 n-card 样式 */
}

.export-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: flex-end;
}

.export-history {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 16px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.history-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.export-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}

@media (max-width: 900px) {
  .export-types {
    grid-template-columns: 1fr;
  }
}
</style>
