<!-- 分析编排器组件 - 三行四区 TARGET-FIRST 配置
    更新时间: 2026-04-25
    规范：ROWS(蓝)/COLUMNS(紫)/FILTERS(绿)/VALUES(琥珀) 四区激活态 -->
<template>
  <div class="config-zones">
    <!-- 第一行：轴向定义 ROWS + COLUMNS -->
    <div class="config-zones-row axis-row">
      <!-- ROWS 区域 -->
      <div
        class="config-zone zone-rows"
        :class="{
          'zone-active': activeZone === 'row',
        }"
        @click="handleZoneClick('row')"
      >
        <div class="zone-header">
          <IconRows class="zone-icon" />
          <span class="zone-title">ROWS</span>
        </div>
        <div class="zone-content">
          <div v-if="modelValue.rowFields.length === 0" class="zone-placeholder">
            <span>Drop fields here</span>
          </div>
          <template v-else>
            <div
              v-for="(field, idx) in modelValue.rowFields"
              :key="field.value"
              class="config-chip chip-rows"
              :ref="el => setChipRef('row', idx, el as HTMLElement | null)"
              @click.stop="handleChipClick('row', idx, $event)"
            >
              <span class="chip-level">{{ idx + 1 }}</span>
              <span class="chip-label">{{ field.label }}</span>
              <span v-if="getSelectedValueLabels(field.value)" class="chip-count">
                ({{ getSelectedValueLabels(field.value) }})
              </span>
              <button class="chip-remove" @click.stop="removeField('row', idx)" title="Remove">
                <IconClose />
              </button>
            </div>
          </template>
        </div>
      </div>

      <!-- COLUMNS 区域 -->
      <div
        class="config-zone zone-cols"
        :class="{
          'zone-active': activeZone === 'col',
        }"
        @click="handleZoneClick('col')"
      >
        <div class="zone-header">
          <IconColumns class="zone-icon" />
          <span class="zone-title">COLUMNS</span>
        </div>
        <div class="zone-content">
          <div v-if="modelValue.colFields.length === 0" class="zone-placeholder">
            <span>Drop fields here</span>
          </div>
          <template v-else>
            <div
              v-for="(field, idx) in modelValue.colFields"
              :key="field.value"
              class="config-chip chip-cols"
              :ref="el => setChipRef('col', idx, el as HTMLElement | null)"
              @click.stop="handleChipClick('col', idx, $event)"
            >
              <span class="chip-level">{{ idx + 1 }}</span>
              <span class="chip-label">{{ field.label }}</span>
              <span v-if="getSelectedValueLabels(field.value)" class="chip-count">
                ({{ getSelectedValueLabels(field.value) }})
              </span>
              <button class="chip-remove" @click.stop="removeField('col', idx)" title="Remove">
                <IconClose />
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 第二行：筛选器 FILTERS -->
    <div class="config-zones-row">
      <div
        class="config-zone zone-filters"
        :class="{
          'zone-active': activeZone === 'filter',
        }"
        @click="handleZoneClick('filter')"
      >
        <div class="zone-header">
          <IconFilter class="zone-icon" />
          <span class="zone-title">FILTER</span>
        </div>
        <div class="zone-content">
          <div v-if="modelValue.filterFields.length === 0" class="zone-placeholder">
            <span>Drop fields here to filter</span>
          </div>
          <template v-else>
            <div
              v-for="(field, idx) in modelValue.filterFields"
              :key="field.value"
              class="config-chip chip-filters"
              :ref="el => setChipRef('filter', idx, el as HTMLElement | null)"
              @click.stop="handleChipClick('filter', idx, $event)"
            >
              <span class="chip-level">{{ idx + 1 }}</span>
              <span class="chip-label">{{ field.label }}</span>
              <span v-if="getSelectedValueLabels(field.value)" class="chip-count">
                ({{ getSelectedValueLabels(field.value) }})
              </span>
              <button class="chip-remove" @click.stop="removeField('filter', idx)" title="Remove">
                <IconClose />
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 第三行：数据输出 VALUES -->
    <div class="config-zones-row values-row">
      <div
        class="config-zone zone-values"
        :class="{
          'zone-active': activeZone === 'val',
          'zone-values--empty': modelValue.valueFields.length === 0,
        }"
        @click="handleZoneClick('val')"
      >
        <div class="zone-header">
          <IconValues class="zone-icon" />
          <span class="zone-title">VALUES</span>
        </div>
        <div class="zone-content zone-values-content">

          <!-- 指标库快捷选择层（仅 VALUES 激活时显示） -->
          <div v-if="activeZone === 'val'" class="metric-library">
            <template v-for="(group, gi) in aggregationGrouped" :key="gi">
              <div class="metric-group">
                <div class="metric-group-label">{{ group.category }}</div>
                <div class="metric-tags">
                  <div
                    v-for="agg in group.items"
                    :key="agg.value"
                    class="metric-tag"
                    :class="{ 'metric-tag--active': isAggregationSelected(agg.value) }"
                    @click.stop="handleSelectAggregation(agg.value)"
                  >
                    <span class="metric-tag-check"></span>
                    <span class="metric-tag-label">{{ agg.label }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- 空状态占位 -->
          <div v-if="modelValue.valueFields.length === 0 && activeZone !== 'val'" class="zone-placeholder">
            <span>Select metrics from the library above</span>
          </div>

          <!-- 指标芯片列表 -->
          <div class="metric-chips-area" :class="{ 'metric-chips-area--active': activeZone === 'val' }">
            <div
              v-for="(field, idx) in modelValue.valueFields"
              :key="'val-' + idx"
              class="metric-chip"
            >
              <span class="metric-chip-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </span>
              <span class="metric-chip-label">{{ field.label }}</span>
              <button class="metric-chip-remove" @click.stop="removeField('val', idx)" title="Remove">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 保存模板按钮（固定右下角） -->
          <button class="save-template-btn" @click.stop="$emit('save-template')" title="Save as Template">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            保存模板
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CloseOutline as IconClose } from '@vicons/ionicons5'
import IconRows from './icons/IconRows.vue'
import IconColumns from './icons/IconColumns.vue'
import IconFilter from './icons/IconFilter.vue'
import IconValues from './icons/IconValues.vue'
import type { PivotDimension, AggregationType } from '@/api/idcApiTypes'
import type { ValueFieldConfig } from '@/api/idcApiTypes'

// ─── 类型定义 ───────────────────────────────────────────────────────────────

type ZoneId = 'row' | 'col' | 'val' | 'filter'

interface FieldDefinition {
  value: PivotDimension
  label: string
}

interface AggregationOption {
  value: AggregationType
  label: string
}

interface AggregationGroup {
  category: string
  items: AggregationOption[]
}

interface ConfigState {
  rowFields: FieldDefinition[]
  colFields: FieldDefinition[]
  filterFields: FieldDefinition[]
  valueFields: ValueFieldConfig[]
}

// ─── Props & Emits ───────────────────────────────────────────────────────────

interface Props {
  modelValue: ConfigState
  activeZone?: ZoneId | null
  fieldSelectionCounts?: Record<string, number>
  aggregationGrouped?: AggregationGroup[]
  selectedValues?: Record<string, string[]>
}

const props = withDefaults(defineProps<Props>(), {
  activeZone: null,
  fieldSelectionCounts: () => ({}),
  aggregationGrouped: () => [],
  selectedValues: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: ConfigState): void
  (e: 'zone-activate', zone: ZoneId): void
  (e: 'zone-deactivate'): void
  (e: 'add-aggregation', aggregation: AggregationType): void
  (e: 'remove-aggregation', aggregation: AggregationType): void
  (e: 'chip-click', field: FieldDefinition, triggerEl: HTMLElement): void
  (e: 'save-template'): void
}>()

// Chip DOM ref 映射
const chipRefs = ref<Record<string, HTMLElement | null>>({})

function setChipRef(zone: string, idx: number, el: HTMLElement | null) {
  const key = `${zone}-${idx}`
  chipRefs.value[key] = el
}

function handleChipClick(zone: ZoneId, idx: number, event: MouseEvent) {
  const key = `${zone}-${idx}`
  const el = chipRefs.value[key]
  const keyMap: Record<ZoneId, 'rowFields' | 'colFields' | 'filterFields' | 'valueFields'> = {
    row: 'rowFields', col: 'colFields', filter: 'filterFields', val: 'valueFields',
   }
  const arr = props.modelValue[keyMap[zone]]
  if (arr[idx]) {
    emit('chip-click', arr[idx] as FieldDefinition, el || event.currentTarget as HTMLElement)
  }
}

// ─── 字段操作 ───────────────────────────────────────────────────────────────

function getZoneArrayKey(zone: ZoneId): 'rowFields' | 'colFields' | 'filterFields' | 'valueFields' | null {
  if (zone === 'row') return 'rowFields'
  if (zone === 'col') return 'colFields'
  if (zone === 'filter') return 'filterFields'
  if (zone === 'val') return 'valueFields'
  return null
}

function addFieldToZone(zone: ZoneId, field: FieldDefinition) {
  const key = getZoneArrayKey(zone)
  if (!key) return

  const currentArr = props.modelValue[key] as FieldDefinition[]
  if (currentArr.some(f => f.value === field.value)) return

  const newArr = [...currentArr, field]
  emit('update:modelValue', { ...props.modelValue, [key]: newArr })
}

function removeField(zone: ZoneId, index: number) {
  const key = getZoneArrayKey(zone)
  if (!key) return

  const currentArr = [...(props.modelValue[key] as FieldDefinition[])]
  currentArr.splice(index, 1)
  emit('update:modelValue', { ...props.modelValue, [key]: currentArr })
}

function getFieldSelectionCount(fieldValue: string): number {
  return props.fieldSelectionCounts[fieldValue] || 0
}

function getSelectedValueLabels(fieldValue: string): string {
  const selected = props.selectedValues?.[fieldValue] || []
  if (selected.length === 0) return ''
  return selected.join(', ')
}

// ─── 统计量操作 ─────────────────────────────────────────────────────────────

function isAggregationSelected(value: AggregationType): boolean {
  return props.modelValue.valueFields.some(f => f.aggregation === value)
}

function handleSelectAggregation(value: AggregationType) {
  if (isAggregationSelected(value)) {
    emit('remove-aggregation', value)
  } else {
    emit('add-aggregation', value)
  }
}

// ─── 区域激活 ───────────────────────────────────────────────────────────────

function handleZoneClick(zone: ZoneId) {
  if (props.activeZone === zone) {
    emit('zone-deactivate')
  } else {
    emit('zone-activate', zone)
  }
}
</script>

<style scoped>
.config-zones {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
}

.config-zones-row {
  display: flex;
  gap: 6px;
}

.axis-row {
  gap: 6px;
}

/* ─── 区域通用 ─── */
.config-zone {
  border-radius: 6px;
  background: #fff;
  border: 2px dashed #cbd5e1;
  padding: 8px 10px;
  transition: border-color 0.15s, box-shadow 0.15s, border-style 0.15s;
  display: flex;
  flex-direction: column;
  min-height: 44px;
}

.zone-rows { flex: 1; }
.zone-cols { flex: 1; }
.zone-filters { flex: 1; }
.zone-values { flex: 1; }

/* 激活态 */
.zone-active.zone-rows {
  border-style: solid;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.zone-active.zone-cols {
  border-style: solid;
  border-color: #9333ea;
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.15);
}

.zone-active.zone-filters {
  border-style: solid;
  border-color: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.15);
}

.zone-active.zone-values {
  border-style: solid;
  border-color: #d97706;
  box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.15);
}

/* ─── 区域头部 ─── */
.zone-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
}

.zone-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.zone-rows .zone-icon { color: #2563eb; }
.zone-cols .zone-icon { color: #9333ea; }
.zone-filters .zone-icon { color: #16a34a; }
.zone-values .zone-icon { color: #d97706; }

.zone-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.zone-rows .zone-title { color: #2563eb; }
.zone-cols .zone-title { color: #9333ea; }
.zone-filters .zone-title { color: #16a34a; }
.zone-values .zone-title { color: #d97706; }

/* ─── 区域内容 ─── */
.zone-content {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: flex-start;
  flex: 1;
}

.zone-values-content {
  position: relative;
}

.zone-placeholder {
  font-size: 11px;
  color: #94a3b8;
  font-style: italic;
  line-height: 26px;
  width: 100%;
}

/* ─── Chips ─── */
.config-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: default;
  max-width: 100%;
  transition: box-shadow 0.12s;
  white-space: nowrap;
}

.config-chip:hover {
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chip-level {
  font-size: 9px;
  font-weight: 700;
  opacity: 0.6;
  flex-shrink: 0;
  min-width: 12px;
}

.chip-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-count {
  font-size: 10px;
  font-weight: 400;
  opacity: 0.7;
}

.chip-remove {
  width: 14px;
  height: 14px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0;
  transition: background 0.12s, color 0.12s;
  flex-shrink: 0;
}

.chip-remove:hover {
  background: rgba(0,0,0,0.08);
  color: #475569;
}

/* ROWS chips */
.chip-rows {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

/* COLS chips */
.chip-cols {
  background: #f3e8ff;
  color: #7e22ce;
  border-color: #e9d5ff;
}

/* FILTER chips */
.chip-filters {
  background: #dcfce7;
  color: #15803d;
  border-color: #bbf7d0;
}

/* VALUES 区域：琥珀色物理布局 */
.values-row {
  flex-direction: column;
}

/* VALUES 容器 - 常规态 */
.zone-values {
  flex: 1;
  background: rgba(217, 119, 6, 0.03);
  border-color: rgba(217, 119, 6, 0.25);
  padding: 10px 12px;
}

/* VALUES 空状态 */
.zone-values--empty:not(.zone-active) {
  border-style: dashed;
  border-color: rgba(217, 119, 6, 0.25);
  background: rgba(217, 119, 6, 0.02);
}

/* VALUES 激活态 */
.zone-active.zone-values {
  border-style: solid;
  border-color: #d97706;
  border-width: 2px;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12), 0 2px 8px rgba(217, 119, 6, 0.08);
  background: rgba(254, 243, 199, 0.25);
}

/* ─── 指标库快捷选择层 ─── */
.metric-library {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 0 8px;
  border-bottom: 1px solid rgba(217, 119, 6, 0.12);
  margin-bottom: 8px;
}

.metric-group {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.metric-group-label {
  font-size: 9px;
  font-weight: 700;
  color: #d97706;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  min-width: 36px;
  padding-top: 5px;
  flex-shrink: 0;
}

.metric-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.metric-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  background: #fff;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.12s;
  user-select: none;
}

.metric-tag:hover {
  border-color: #d97706;
  background: #fffbf0;
  color: #b45309;
}

.metric-tag--active {
  border-color: #d97706;
  background: #fef3c7;
  color: #b45309;
  font-weight: 600;
}

.metric-tag-check {
  width: 12px;
  height: 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 3px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
}

.metric-tag--active .metric-tag-check {
  background: #d97706;
  border-color: #d97706;
}

/* ─── 指标芯片区 ─── */
.metric-chips-area {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 28px;
  padding-right: 80px;
}

.metric-chips-area--active {
  padding-top: 4px;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 6px 0 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  cursor: grab;
  transition: box-shadow 0.12s, transform 0.12s;
  max-width: 160px;
}

.metric-chip:hover {
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.15);
  transform: translateY(-1px);
}

.metric-chip-icon {
  color: #d97706;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.metric-chip-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-chip-remove {
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: #d97706;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0;
  transition: background 0.12s, color 0.12s;
  flex-shrink: 0;
  opacity: 0.6;
}

.metric-chip-remove:hover {
  background: rgba(217, 119, 6, 0.15);
  color: #b45309;
  opacity: 1;
}

/* ─── 保存模板按钮 ─── */
.save-template-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  background: transparent;
  border: 1px solid #93c5fd;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s;
  z-index: 1;
}

.save-template-btn:hover {
  background: #eff6ff;
  border-color: #2563eb;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.15);
}
</style>
