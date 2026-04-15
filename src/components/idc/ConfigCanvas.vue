// 拖拽配置画布组件 - 简化版
// 更新时间: 2026-04-10
<template>
  <div class="config-canvas">
    <!-- 配置区域标题 -->
    <div class="canvas-header">
      <h3 class="canvas-title">透视配置</h3>
      <n-button-group size="small">
        <n-button @click="handleReset">
          <template #icon>
            <RefreshIcon />
          </template>
          重置
        </n-button>
        <n-button type="primary" @click="handleApply">
          <template #icon>
            <PlayIcon />
          </template>
          应用
        </n-button>
      </n-button-group>
    </div>

    <!-- 拖拽配置区 -->
    <div class="canvas-body">
      <!-- 行维度配置 -->
      <div
        class="drop-zone row-zone"
        :class="{ 'drag-over': rowDragOver }"
        @dragover.prevent="handleDragOver($event, 'row')"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, 'row')"
      >
        <div class="zone-header">
          <span class="zone-title">行维度</span>
          <span class="zone-hint">拖拽字段到此处</span>
          <n-badge v-if="config.rowFields.length > 0" :value="config.rowFields.length" type="info" />
        </div>
        <div class="zone-content">
          <template v-if="config.rowFields.length > 0">
            <div v-for="(field, index) in config.rowFields" :key="field.value" class="field-chip">
              <span class="chip-index">{{ index + 1 }}</span>
              <span class="chip-label">{{ field.label }}</span>
              <n-button text size="tiny" @click="removeRowField(index)">
                <CloseIcon />
              </n-button>
            </div>
          </template>
          <div v-else class="zone-placeholder">
            <AddIcon class="placeholder-icon" />
            <span>拖拽字段到此处</span>
          </div>
        </div>
      </div>

      <!-- 列维度配置 -->
      <div
        class="drop-zone col-zone"
        :class="{ 'drag-over': colDragOver }"
        @dragover.prevent="handleDragOver($event, 'col')"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, 'col')"
      >
        <div class="zone-header">
          <span class="zone-title">列维度</span>
          <span class="zone-hint">可选</span>
        </div>
        <div class="zone-content">
          <template v-if="config.colField">
            <div class="field-chip single">
              <span class="chip-label">{{ config.colField.label }}</span>
              <n-button text size="tiny" @click="removeColField">
                <CloseIcon />
              </n-button>
            </div>
          </template>
          <div v-else class="zone-placeholder">
            <AddIcon class="placeholder-icon" />
            <span>拖拽字段到此处</span>
          </div>
        </div>
      </div>

      <!-- 值字段配置 -->
      <div
        class="drop-zone value-zone"
        :class="{ 'drag-over': valueDragOver }"
        @dragover.prevent="handleDragOver($event, 'value')"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, 'value')"
      >
        <div class="zone-header">
          <span class="zone-title">值字段</span>
          <span class="zone-hint">选择统计量</span>
        </div>
        <div class="zone-content value-content">
          <!-- 值字段选择 -->
          <div class="value-selector">
            <n-select
              v-model:value="selectedValueField"
              :options="valueFieldOptions"
              :loading="loadingAggs"
              placeholder="选择值字段"
              size="small"
              clearable
            />
          </div>

          <!-- 已选统计量 -->
          <div v-if="config.valueFields.length > 0" class="value-chips">
            <div v-for="(field, index) in config.valueFields" :key="field.aggregation" class="value-chip">
              <span class="chip-label">{{ field.label }}</span>
              <span class="chip-badge" :style="{ background: getValueColor(index) }">
                {{ field.format === 'percent' ? '%' : '' }}
              </span>
              <n-button text size="tiny" @click="removeValueField(index)">
                <CloseIcon />
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选抽屉 -->
    <IDCFiltersDrawer
      v-model:visible="showFilterDrawer"
      title="筛选条件"
      @confirm="handleFilterConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  NButton,
  NButtonGroup,
  NBadge,
  NSelect,
  NPopover,
  useMessage,
} from 'naive-ui'
import {
  Refresh as RefreshIcon,
  Play as PlayIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@vicons/ionicons5'
import { storeToRefs } from 'pinia'
import { useIDCStore } from '@/stores/idcStore'
import IDCFiltersDrawer from './IDCFiltersDrawer.vue'
import type { PivotDimension, ValueFieldConfig, AggregationType } from '@/api/idcApiTypes'
import { idcApi } from '@/api/idcApi'

// 字段定义
interface FieldDefinition {
  value: PivotDimension
  label: string
}

// Props定义
interface Props {
  config?: Partial<ConfigState>
}

interface ConfigState {
  rowFields: FieldDefinition[]
  colField: FieldDefinition | null
  valueFields: ValueFieldConfig[]
  sortField: string | null
  sortOrder: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({
    rowFields: [],
    colField: null,
    valueFields: [],
    sortField: null,
    sortOrder: 'desc',
  }),
})

// Emits定义
const emit = defineEmits<{
  (e: 'apply', config: ConfigState): void
  (e: 'reset'): void
}>()

const message = useMessage()
const idcStore = useIDCStore()

// 内部状态
const config = ref<ConfigState>({
  rowFields: props.config.rowFields || [],
  colField: props.config.colField || null,
  valueFields: props.config.valueFields || [],
  sortField: props.config.sortField || null,
  sortOrder: props.config.sortOrder || 'desc',
})

// 拖拽状态
const rowDragOver = ref(false)
const colDragOver = ref(false)
const valueDragOver = ref(false)

// 筛选抽屉
const showFilterDrawer = ref(false)

// 已选值字段
const selectedValueField = ref<AggregationType | null>(null)

// 值字段颜色
const valueColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

// 统计量选项（从API加载）
const valueFieldOptions = ref<{ label: string; value: string }[]>([])
const aggregationDefs = ref<{ id: string; sourceFields: string[]; name: string; format?: string; decimalPlaces?: number }[]>([])
const loadingAggs = ref(false)

// 加载统计量定义
async function loadAggregationDefinitions() {
  loadingAggs.value = true
  try {
    const res = await idcApi.getAggregationDefinitions()
    if (res.success && res.data) {
      // 后端返回的结构是 { id, name, sourceFields, format, decimalPlaces }
      aggregationDefs.value = (res.data as Array<Record<string, unknown>>).map(a => ({
        id: String(a.id || ''),
        sourceFields: (a.sourceFields as string[]) || [],
        name: String(a.name || ''),
        format: a.format as string | undefined,
        decimalPlaces: a.decimalPlaces as number | undefined,
      }))
      valueFieldOptions.value = (res.data as Array<Record<string, unknown>>).map((a: Record<string, unknown>) => ({
        label: String(a.label || a.name || ''),
        value: String(a.value || a.id || ''),
      }))
    }
  } catch (e) {
    console.error('Failed to load aggregation definitions:', e)
  } finally {
    loadingAggs.value = false
  }
}

// 获取值字段颜色
function getValueColor(index: number): string {
  return valueColors[index % valueColors.length]
}

// 拖拽处理
function handleDragOver(_event: DragEvent, zone: 'row' | 'col' | 'value') {
  if (zone === 'row') rowDragOver.value = true
  if (zone === 'col') colDragOver.value = true
  if (zone === 'value') valueDragOver.value = true
}

function handleDragLeave() {
  rowDragOver.value = false
  colDragOver.value = false
  valueDragOver.value = false
}

function handleDrop(event: DragEvent, zone: 'row' | 'col' | 'value') {
  event.preventDefault()
  handleDragLeave()

  const data = event.dataTransfer?.getData('application/json')
  if (!data) return

  try {
    const field = JSON.parse(data) as FieldDefinition

    if (zone === 'row') {
      if (!config.value.rowFields.some(f => f.value === field.value)) {
        config.value.rowFields.push(field)
      }
    } else if (zone === 'col') {
      config.value.colField = field
    }
  } catch (e) {
    console.error('Failed to parse drop data:', e)
  }
}

// 移除字段
function removeRowField(index: number) {
  config.value.rowFields.splice(index, 1)
}

function removeColField() {
  config.value.colField = null
}

function removeValueField(index: number) {
  config.value.valueFields.splice(index, 1)
}

// 监听选中的值字段变化
watch(selectedValueField, (newVal) => {
  if (newVal) {
    const aggDef = aggregationDefs.value.find(d => d.id === newVal)
    if (aggDef) {
      const newField: ValueFieldConfig = {
        aggregation: newVal,
        sourceField: aggDef.sourceFields[0] || 'units',
        label: aggDef.name,
        format: aggDef.format || 'number',
        decimalPlaces: aggDef.decimalPlaces || 0,
      }

      if (!config.value.valueFields.some(f => f.aggregation === newVal)) {
        config.value.valueFields.push(newField)
      }
      selectedValueField.value = null
    }
  }
})

// 应用配置
function handleApply() {
  emit('apply', { ...config.value })
}

function handleReset() {
  config.value = {
    rowFields: [],
    colField: null,
    valueFields: [],
    sortField: null,
    sortOrder: 'desc',
  }
  emit('reset')
}

function handleFilterConfirm() {
  showFilterDrawer.value = false
}

// 初始化
onMounted(() => {
  loadAggregationDefinitions()
})
</script>

<style scoped>
.config-canvas {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  padding: 16px;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.canvas-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.canvas-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drop-zone {
  background: rgba(255, 255, 255, 0.8);
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s;
}

.drop-zone.drag-over {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.zone-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.zone-title {
  font-weight: 600;
  font-size: 13px;
}

.zone-hint {
  font-size: 12px;
  color: #9ca3af;
}

.zone-content {
  min-height: 48px;
}

.zone-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  color: #9ca3af;
  font-size: 13px;
}

.placeholder-icon {
  font-size: 16px;
}

.field-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  margin: 2px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
}

.field-chip.single {
  padding: 6px 12px;
}

.chip-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #4f46e5;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 600;
}

.chip-label {
  flex: 1;
}

.value-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.value-selector {
  display: flex;
  gap: 8px;
}

.value-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.value-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.chip-badge {
  padding: 0 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}
</style>
