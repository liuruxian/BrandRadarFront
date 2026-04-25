<template>
  <div class="field-pool" :class="{ collapsed }">
    <!-- Collapse bar with toggle arrow -->
    <div class="fp-collapse-bar">
      <svg
        class="fp-collapse-arrow"
        :class="{ collapsed: collapsed }"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        @click="$emit('toggle-collapse')"
      >
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </div>

    <!-- Content area -->
    <div v-if="!collapsed" class="fp-content">
      <!-- Targeting bar -->
      <div v-if="activeZone" class="fp-targeting-bar" :class="'fp-targeting-bar--' + activeZone">
        <span class="fp-targeting-label">TARGETING:</span>
        <span class="fp-targeting-zone">{{ activeZone.toUpperCase() }}</span>
        <span class="fp-targeting-hint">
          {{ activeZone === 'val' ? 'Use metric library →' : 'Click field to add' }}
        </span>
      </div>

      <!-- Search input -->
      <div class="fp-search">
        <svg class="fp-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchKeyword"
          class="fp-search-input"
          placeholder="Search fields..."
        />
        <button v-if="searchKeyword" class="fp-search-clear" @click.stop="searchKeyword = ''">×</button>
      </div>

      <!-- Grouped field list with ref for scrollIntoView -->
      <div class="fp-list" ref="listRef">
        <template v-for="(group, gi) in groupedFields" :key="gi">
          <!-- Collapsible category header -->
          <div
            class="fp-category-block"
            :class="{ 'fp-category-block--collapsed': !isCategoryExpanded(group.label) }"
            @click="toggleCategory(group.label)"
          >
            <svg
              class="fp-cat-arrow"
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <svg
              class="fp-cat-icon"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
            {{ group.label }}
            <span class="fp-cat-count">{{ group.fields.length }}</span>
          </div>

          <!-- Field rows -->
          <template v-if="isCategoryExpanded(group.label)">
            <template v-for="field in group.fields" :key="field.value">
              <div
                class="fp-field"
                :class="{
                  'fp-field--active': isFieldActive(field.value),
                  'fp-field--locked': isFieldLocked(field.value),
                  'fp-field--expanded': expandedField === field.value,
                  'fp-field--disabled-values': activeZone === 'val',
                }"
                :data-field-value="field.value"
                @click="handleFieldClick(field)"
              >
                <!-- Left colored border for active state -->
                <div
                  v-if="isFieldActive(field.value)"
                  class="fp-active-border"
                  :class="'fp-active-border--' + getFieldZone(field.value)"
                ></div>

                <!-- Expand arrow icon -->
                <svg
                  v-if="field.values && field.values.length > 0"
                  class="fp-field-arrow"
                  :class="{ 'fp-field-arrow--up': expandedField === field.value }"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>

                <!-- Field label -->
                <span
                  class="fp-field-label"
                  :class="{ 'fp-field-label--active': isFieldActive(field.value) }"
                >
                  {{ field.label }}
                </span>

                <!-- Selected count badge (blue rounded pill) -->
                <span
                  v-if="getSelectedCount(field.value) > 0"
                  class="fp-field-count"
                >
                  {{ getSelectedCount(field.value) }}
                </span>

                <!-- Active state: zone tag + colored dot -->
                <template v-if="isFieldActive(field.value)">
                  <span class="fp-zone-tag" :class="'fp-zone-tag--' + getFieldZone(field.value)">
                    in {{ getFieldZone(field.value).toUpperCase() }}
                  </span>
                  <span class="fp-zone-dot" :class="'fp-zone-dot--' + getFieldZone(field.value)"></span>
                </template>

                <!-- Locked state: In Use tag -->
                <template v-else-if="isFieldLocked(field.value)">
                  <span class="fp-locked-tag">
                    In Use ({{ getOtherZoneLabel(field.value) }})
                  </span>
                </template>
              </div>

              <!-- Inline expansion panel -->
              <div
                v-if="expandedField === field.value && field.values && field.values.length > 0"
                class="fp-panel"
                @click.stop
              >
                <!-- Only Country field has a search box in the header -->
                <div v-if="field.value === 'Country'" class="fp-panel-header">
                  <svg class="fp-panel-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    v-model="panelSearch[field.value]"
                    class="fp-panel-search"
                    placeholder="Search options..."
                    @mousedown.stop
                    @click.stop
                    @keydown.stop
                  />
                </div>
                <div class="fp-panel-values">
                  <!-- Select All / Clear buttons -->
                  <div class="fp-panel-bulk">
                    <button class="fp-panel-bulk-btn" @click.stop="selectAll(field)">Select All</button>
                    <button class="fp-panel-bulk-btn" @click.stop="clearAll(field)">Clear</button>
                  </div>
                  <!-- Scrollable checkbox list -->
                  <div
                    v-for="val in getPanelFilteredValues(field)"
                    :key="val.value"
                    class="fp-panel-value"
                    :class="{ 'fp-panel-value--selected': isValueSelected(field.value, val.value) }"
                    @click.stop="handleValueClick(field, val.value)"
                  >
                    <span class="fp-panel-value-check">
                      <svg v-if="isValueSelected(field.value, val.value)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span class="fp-panel-value-label">{{ val.label }}</span>
                  </div>
                  <div v-if="getPanelFilteredValues(field).length === 0" class="fp-panel-empty">
                    No matching options
                  </div>
                </div>
              </div>
            </template>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import type { PivotDimension } from '@/api/idcApiTypes'
import { FIELD_DEFINITIONS, FIELD_GROUP_ORDER } from '@/data/fieldPoolData'

type ZoneId = 'row' | 'col' | 'val' | 'filter'

interface FieldValue {
  value: string
  label: string
}

interface FieldDefinition {
  value: PivotDimension
  label: string
  category: string
  group: string
  values?: FieldValue[]
}

interface Props {
  collapsed?: boolean
  assignedFields?: Record<string, ZoneId>
  activeZone?: ZoneId | null
  selectedValues?: Record<string, string[]>
  focusField?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  assignedFields: () => ({}),
  activeZone: null,
  selectedValues: () => ({}),
  focusField: null,
})

const emit = defineEmits<{
  (e: 'toggle-collapse'): void
  (e: 'field-click', field: FieldDefinition): void
  (e: 'value-click', field: FieldDefinition, value: string): void
  (e: 'select-all', field: FieldDefinition): void
  (e: 'clear-all', field: FieldDefinition): void
}>()

// List container ref for scrollIntoView
const listRef = ref<HTMLElement | null>(null)

// Search keyword for filtering fields
const searchKeyword = ref('')

// Currently expanded field
const expandedField = ref<string | null>(null)

// Panel search state per field
const panelSearch = ref<Record<string, string>>({})

// Category expanded state (true = expanded, initialized all true)
const categoryExpanded = ref<Record<string, boolean>>(
  FIELD_GROUP_ORDER.reduce((acc, group) => {
    acc[group] = true
    return acc
  }, {} as Record<string, boolean>)
)

const allFields = FIELD_DEFINITIONS

// Grouped fields with optional search filtering
const groupedFields = computed(() => {
  const kw = searchKeyword.value.toLowerCase()
  const groups: Array<{ label: string; fields: FieldDefinition[] }> = []

  for (const groupName of FIELD_GROUP_ORDER) {
    const fields = allFields.filter(f => f.group === groupName)
    const filtered = kw
      ? fields.filter(f =>
          f.label.toLowerCase().includes(kw) ||
          f.values?.some(v => v.label.toLowerCase().includes(kw))
        )
      : fields

    if (filtered.length > 0) {
      groups.push({ label: groupName, fields: filtered })
    }
  }

  return groups
})

function isCategoryExpanded(label: string): boolean {
  return categoryExpanded.value[label] ?? true
}

function toggleCategory(label: string) {
  categoryExpanded.value = {
    ...categoryExpanded.value,
    [label]: !categoryExpanded.value[label],
  }
}

function isFieldActive(fieldValue: string): boolean {
  return !!props.assignedFields?.[fieldValue]
}

function isFieldLocked(fieldValue: string): boolean {
  if (!props.activeZone) return false
  const currentZone = props.assignedFields?.[fieldValue]
  return !!currentZone && currentZone !== props.activeZone
}

function getOtherZoneLabel(fieldValue: string): string {
  const zone = props.assignedFields?.[fieldValue]
  if (!zone) return ''
  return zone.toUpperCase()
}

function getFieldZone(fieldValue: string): ZoneId {
  return props.assignedFields?.[fieldValue] || 'row'
}

function getSelectedCount(fieldValue: string): number {
  return (props.selectedValues?.[fieldValue] || []).length
}

function isValueSelected(fieldValue: string, val: string): boolean {
  return (props.selectedValues?.[fieldValue] || []).includes(val)
}

function handleFieldClick(field: FieldDefinition) {
  emit('field-click', field)

  // Toggle expanded state (exclusive expand: one at a time)
  expandedField.value = expandedField.value === field.value ? null : field.value

  // Ensure parent category is expanded
  if (!isCategoryExpanded(field.group)) {
    toggleCategory(field.group)
  }

  // Scroll to field if expanding
  if (expandedField.value === field.value) {
    scrollToField(field.value)
  }
}

function scrollToField(fieldValue: string) {
  nextTick(() => {
    const el = listRef.value?.querySelector(`[data-field-value="${fieldValue}"]`) as HTMLElement | null
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })
}

// Watch focusField for external scroll-to-expand
watch(() => props.focusField, (newField) => {
  if (newField) {
    // Find the field's group and expand it if needed
    const field = allFields.find(f => f.value === newField)
    if (field && !isCategoryExpanded(field.group)) {
      toggleCategory(field.group)
    }

    expandedField.value = newField
    scrollToField(newField)
  }
})

function getPanelFilteredValues(field: FieldDefinition): FieldValue[] {
  const kw = (panelSearch.value[field.value] || '').toLowerCase()
  const vals = field.values || []
  if (!kw) return vals
  return vals.filter(v => v.label.toLowerCase().includes(kw))
}

function handleValueClick(field: FieldDefinition, value: string) {
  emit('value-click', field, value)
}

function selectAll(field: FieldDefinition) {
  emit('select-all', field)
}

function clearAll(field: FieldDefinition) {
  emit('clear-all', field)
}
</script>

<style scoped>
.field-pool {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e2e8f0;
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
}
.field-pool.collapsed {
  width: 32px;
  min-width: 32px;
}

.fp-collapse-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  color: #94a3b8;
  flex-shrink: 0;
}
.fp-collapse-bar:hover {
  background: #f1f5f9;
}
.fp-collapse-arrow {
  transition: transform 0.2s;
}
.fp-collapse-arrow.collapsed {
  transform: rotate(180deg);
}

.fp-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fp-targeting-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.fp-targeting-bar--row {
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}
.fp-targeting-bar--col {
  background: rgba(147, 51, 234, 0.08);
  color: #9333ea;
}
.fp-targeting-bar--filter {
  background: rgba(22, 163, 74, 0.08);
  color: #16a34a;
}
.fp-targeting-bar--val {
  background: rgba(217, 119, 6, 0.08);
  color: #d97706;
}
.fp-targeting-label {
  opacity: 0.6;
}
.fp-targeting-hint {
  margin-left: auto;
  opacity: 0.6;
  font-weight: 400;
}

.fp-search {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-bottom: 1px solid #e2e8f0;
}
.fp-search-icon {
  color: #94a3b8;
  flex-shrink: 0;
}
.fp-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #0f172a;
  max-width: 160px;
}
.fp-search-input::placeholder {
  color: #94a3b8;
}
.fp-search-clear {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: none;
  background: #c0c8d4;
  color: #fff;
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: auto;
}

.fp-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* Category header block */
.fp-category-block {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px 4px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: #1e293b;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  position: sticky;
  top: 0;
  z-index: 2;
  cursor: pointer;
  user-select: none;
}
.fp-category-block:hover {
  background: #334155;
}
.fp-category-block--collapsed {
  background: #334155;
}
.fp-cat-arrow {
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  transition: transform 0.2s;
}
.fp-cat-icon {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}
.fp-cat-count {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 0 5px;
  font-size: 9px;
}

/* Field row: fixed 36px height */
.fp-field {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px 0 14px;
  height: 36px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.1s;
  position: relative;
  overflow: hidden;
}
.fp-field:hover {
  background: #f1f5f9;
}

/* Active state: light blue background + left border */
.fp-field--active {
  background: #eff6ff;
}
.fp-field--active:hover {
  background: #dbeafe;
}
.fp-field--expanded {
  background: #dbeafe;
}
.fp-field--expanded:hover {
  background: #bfdbfe;
}

.fp-active-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}
.fp-active-border--row {
  background: #2563eb;
}
.fp-active-border--col {
  background: #9333ea;
}
.fp-active-border--filter {
  background: #16a34a;
}
.fp-active-border--val {
  background: #d97706;
}

/* Disabled state when VALUES zone is active */
.fp-field--disabled-values {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

/* Locked state: 50% opacity */
.fp-field--locked {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
.fp-field--locked:hover {
  background: transparent;
}

/* Expand arrow */
.fp-field-arrow {
  color: #94a3b8;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.fp-field-arrow--up {
  transform: rotate(180deg);
}

/* Field label */
.fp-field-label {
  font-size: 12px;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fp-field-label--active {
  font-weight: 600;
  color: #1e40af;
}

/* Selected count badge: blue rounded pill */
.fp-field-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #2563eb;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 10px;
  padding: 0 6px;
  min-width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* in ROW zone tag */
.fp-zone-tag {
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}
.fp-zone-tag--row {
  color: #2563eb;
}
.fp-zone-tag--col {
  color: #9333ea;
}
.fp-zone-tag--filter {
  color: #16a34a;
}
.fp-zone-tag--val {
  color: #d97706;
}

/* Colored dot */
.fp-zone-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
  margin-left: 4px;
}
.fp-zone-dot--row {
  background: #2563eb;
}
.fp-zone-dot--col {
  background: #9333ea;
}
.fp-zone-dot--filter {
  background: #16a34a;
}
.fp-zone-dot--val {
  background: #d97706;
}

/* In Use locked tag */
.fp-locked-tag {
  font-size: 10px;
  font-weight: 500;
  color: #64748b;
  flex-shrink: 0;
  margin-left: 8px;
}

/* Inline expansion panel */
.fp-panel {
  background: var(--dt-color-bg-surface);
  border-bottom: 1px solid var(--dt-color-border);
}

.fp-panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 28px;
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
  background: #dbeafe;
}
.fp-panel-search-icon {
  color: #93c5fd;
  flex-shrink: 0;
}
.fp-panel-search {
  border: none;
  outline: none;
  background: transparent;
  font-size: 11px;
  color: #1e40af;
  width: 120px;
}
.fp-panel-search::placeholder {
  color: #93c5fd;
}

.fp-panel-values {
  max-height: 220px;
  overflow-y: auto;
  background: var(--dt-color-bg-surface);
}

.fp-panel-bulk {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--dt-color-bg-surface);
  border-bottom: 1px solid var(--dt-color-border-light);
}
.fp-panel-bulk-btn {
  font-size: var(--dt-text-2xs);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-primary);
  background: transparent;
  border: 1px solid var(--dt-color-primary-300);
  border-radius: var(--dt-radius-xs);
  padding: 2px 8px;
  cursor: pointer;
  transition: var(--dt-transition-colors);
}
.fp-panel-bulk-btn:hover {
  background: var(--dt-color-primary-light);
  border-color: var(--dt-color-primary);
}

.fp-panel-value {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  cursor: pointer;
  transition: background var(--dt-duration-fast) var(--dt-ease-smooth);
}
.fp-panel-value:hover {
  background: var(--dt-color-bg-hover);
}
.fp-panel-value--selected {
  background: var(--dt-color-bg-active);
}
.fp-panel-value-check {
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--dt-color-border-strong);
  border-radius: var(--dt-radius-xs);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dt-color-bg-surface);
  transition: all var(--dt-duration-fast) var(--dt-ease-smooth);
}
.fp-panel-value--selected .fp-panel-value-check {
  background: var(--dt-color-primary);
  border-color: var(--dt-color-primary);
  color: var(--dt-color-primary-text);
}
.fp-panel-value-label {
  font-size: var(--dt-text-2xs);
  color: var(--dt-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fp-panel-empty {
  padding: 8px 12px;
  font-size: var(--dt-text-2xs);
  color: var(--dt-color-text-muted);
  text-align: center;
}
</style>
