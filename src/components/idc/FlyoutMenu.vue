<!-- Flyout 浮层菜单组件 - 内联多选选择器
    更新时间: 2026-04-24
    规范：顶部对齐、滚动锚定、内置搜索、快捷分配按钮 -->
<template>
  <Teleport to="body">
    <Transition name="flyout-fade">
      <div
        v-if="visible && field"
        ref="menuRef"
        class="flyout-menu"
        :class="menuSizeClass"
        :style="menuStyle"
        @click.stop
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <!-- 头部 -->
        <div class="flyout-menu-header">
          <span class="flyout-title">{{ field.label }}</span>
          <button class="flyout-close" @click="handleClose" title="Close">
            <IconClose />
          </button>
        </div>

        <!-- 搜索框 -->
        <div class="flyout-menu-search">
          <IconSearch class="search-icon" />
          <input
            v-model="searchKeyword"
            ref="searchInputRef"
            placeholder="Search..."
            @click.stop
          />
          <button v-if="searchKeyword" class="search-clear" @click="searchKeyword = ''">
            <IconClear />
          </button>
        </div>

        <!-- 全选/清空操作 -->
        <div class="flyout-menu-actions">
          <button @click="selectAll">All</button>
          <span class="actions-sep">|</span>
          <button @click="clearAll">Clear</button>
        </div>

        <!-- 选项列表 -->
        <div ref="listRef" class="flyout-menu-list">
          <!-- 空状态 -->
          <div v-if="displayOptions.length === 0" class="flyout-menu-empty">
            No results found
          </div>

          <!-- 不限选项 -->
          <div
            v-if="!searchKeyword"
            class="flyout-menu-item is-all"
            :class="{ 'is-checked': selectedValues.length === 0 }"
            @click="toggleAll"
          >
            <span class="item-check">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <polyline points="1,5 4,8 9,2" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="item-label">No filter</span>
          </div>

          <!-- 筛选后的选项 -->
          <div
            v-for="opt in displayOptions"
            :key="opt.value"
            class="flyout-menu-item"
            :class="{ 'is-checked': selectedValues.includes(opt.value) }"
            @click="toggleOption(opt.value)"
          >
            <span class="item-check">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <polyline points="1,5 4,8 9,2" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="item-label">{{ opt.label }}</span>
          </div>
        </div>

        <!-- 底部快捷按钮 -->
        <div class="flyout-menu-footer">
          <span class="footer-info">
            {{ selectedValues.length > 0 ? `${selectedValues.length} selected` : 'No filter' }}
          </span>
          <div class="footer-actions">
            <button class="flyout-btn flyout-btn--clear" @click="handleClear">
              Clear
            </button>
            <button
              v-if="canAddToRows"
              class="flyout-btn flyout-btn--rows"
              @click="handleAddToRows"
            >
              + ROWS
            </button>
            <button
              v-if="canAddToCols"
              class="flyout-btn flyout-btn--cols"
              @click="handleAddToCols"
            >
              + COLS
            </button>
            <button
              v-if="canAddToFilter"
              class="flyout-btn flyout-btn--filter"
              @click="handleAddToFilter"
            >
              + FILTERS
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { CloseOutline as IconClose, SearchOutline as IconSearch, CloseCircleOutline as IconClear } from '@vicons/ionicons5'
import type { PivotDimension } from '@/api/idcApiTypes'

// ─── 类型定义 ───────────────────────────────────────────────────────────────

interface FieldDefinition {
  value: PivotDimension
  label: string
  category: string
}

interface Props {
  visible: boolean
  field: FieldDefinition | null
  triggerRect?: DOMRect | null
  selectedValues?: string[]
  options?: Array<{ value: string; label: string }>
  canAddToRows?: boolean
  canAddToCols?: boolean
  canAddToFilter?: boolean
  maxMenuHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  field: null,
  triggerRect: null,
  selectedValues: () => [],
  options: () => [],
  canAddToRows: false,
  canAddToCols: false,
  canAddToFilter: false,
  maxMenuHeight: 400,
})

const emit = defineEmits<{
  (e: 'update:selectedValues', values: string[]): void
  (e: 'add-to-rows'): void
  (e: 'add-to-cols'): void
  (e: 'add-to-filter'): void
  (e: 'close'): void
}>()

// ─── Refs ───────────────────────────────────────────────────────────────────

const menuRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

// ─── 状态 ───────────────────────────────────────────────────────────────────

const searchKeyword = ref('')
const localSelected = ref<string[]>([...props.selectedValues])
const menuStyle = ref<Record<string, string>>({})
const isHovered = ref(false)

// ─── 过滤选项 ──────────────────────────────────────────────────────────────

interface OptionItem {
  value: string
  label: string
}

const filteredOptions = computed((): OptionItem[] => {
  if (!searchKeyword.value.trim()) return props.options
  const kw = searchKeyword.value.toLowerCase()
  return props.options.filter(opt => opt.label.toLowerCase().includes(kw))
})

// FlyoutMenu 显示用的 options（用于 v-for）
const displayOptions = computed(() => {
  if (filteredOptions.value.length > 10) {
    return filteredOptions.value.slice(0, 20)
  }
  return filteredOptions.value
})

const menuSizeClass = computed(() => {
  return filteredOptions.value.length > 10 ? 'size-long' : 'size-short'
})

// ─── 监听 props 同步 ────────────────────────────────────────────────────────

watch(() => props.selectedValues, (val) => {
  localSelected.value = [...val]
})

watch(() => props.visible, (val) => {
  if (val) {
    searchKeyword.value = ''
    localSelected.value = [...props.selectedValues]
    nextTick(() => {
      searchInputRef.value?.focus()
      calculatePosition()
    })
  }
})

// ─── 位置计算：顶部对齐策略 ─────────────────────────────────────────────────

function calculatePosition() {
  if (!props.triggerRect) return

  const rect = props.triggerRect
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const menuWidth = 280
  const menuMaxH = props.maxMenuHeight

  // 菜单位于触发器右侧，顶部与字段池面板顶部对齐
  let top = rect.top
  let left = rect.right + 8
  let height: string | undefined

  // 如果右侧空间不够，反向左侧
  if (left + menuWidth > viewportWidth - 8) {
    left = rect.left - menuWidth - 8
  }

  // 长列表：顶部对齐 + 内部滚动
  if (filteredOptions.value.length > 10) {
    // 高度取可用空间或最大高度
    const availableBelow = viewportHeight - top - 8
    height = `${Math.min(menuMaxH, availableBelow)}px`

    // 如果放不下，尝试向上偏移
    if (availableBelow < menuMaxH && top > menuMaxH) {
      top = top + rect.height / 2 - menuMaxH / 2
    }
  } else {
    // 短列表：优先锚定在触发器位置（但顶部不超过视口）
    top = Math.max(8, top)
  }

  // 底部溢出检查
  const totalBottom = top + (parseInt(height || '0') || 0)
  if (totalBottom > viewportHeight - 8) {
    top = Math.max(8, viewportHeight - (parseInt(height || '0') || 300) - 8)
  }

  menuStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    ...(height ? { height } : {}),
  }
}

// ─── 选择操作 ───────────────────────────────────────────────────────────────

function toggleOption(value: string) {
  const label = getLabelByValue(value)
  const idx = localSelected.value.indexOf(value)
  if (idx >= 0) {
    localSelected.value.splice(idx, 1)
  } else {
    localSelected.value.push(value)
  }
  emit('update:selectedValues', [...localSelected.value])
}

function getLabelByValue(value: string): string {
  const found = props.options.find(o => o.value === value)
  return found ? found.label : value
}

function selectAll() {
  localSelected.value = filteredOptions.value.map(o => o.value)
  emit('update:selectedValues', [...localSelected.value])
}

function clearAll() {
  localSelected.value = []
  emit('update:selectedValues', [])
}

function toggleAll() {
  localSelected.value = []
  emit('update:selectedValues', [])
}

function handleClear() {
  localSelected.value = []
  emit('update:selectedValues', [])
  emit('close')
}

function handleClose() {
  emit('close')
}

function handleAddToRows() {
  emit('add-to-rows')
}

function handleAddToCols() {
  emit('add-to-cols')
}

function handleAddToFilter() {
  emit('add-to-filter')
}

// ─── 滚动锚定：触发器滚出视口自动关闭 ──────────────────────────────────────

function handleScroll() {
  if (!props.visible || isHovered.value) return
  if (!props.triggerRect) return

  const rect = props.triggerRect
  const viewportHeight = window.innerHeight

  // 触发元素完全滚出视口
  if (rect.bottom < 0 || rect.top > viewportHeight) {
    handleClose()
  }
}

function handleMouseEnter() {
  isHovered.value = true
}

function handleMouseLeave() {
  isHovered.value = false
}

// ─── 点击外部关闭 ───────────────────────────────────────────────────────────

function handleClickOutside(event: MouseEvent) {
  if (props.visible && menuRef.value && !menuRef.value.contains(event.target as Node)) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<style scoped>
/* 容器 */
.flyout-menu {
  position: fixed;
  z-index: 9999;
  width: 280px;
  background: #fff;
  border: 1px solid var(--dt-color-border);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--dt-font-sans);
}

/* 头部 */
.flyout-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--dt-color-border-light);
  background: var(--dt-color-bg-muted);
  flex-shrink: 0;
}

.flyout-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--dt-color-text-primary);
  letter-spacing: 0.02em;
}

.flyout-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--dt-color-text-muted);
  cursor: pointer;
  border-radius: 4px;
  padding: 0;
  transition: background 120ms ease, color 120ms ease;
}

.flyout-close:hover {
  background: var(--dt-color-bg-muted);
  color: var(--dt-color-text-primary);
}

.flyout-close :deep(svg) {
  font-size: 14px;
}

/* 搜索框 */
.flyout-menu-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--dt-color-border-light);
  background: #fff;
  flex-shrink: 0;
}

.flyout-menu-search .search-icon {
  font-size: 13px;
  color: var(--dt-color-text-muted);
  flex-shrink: 0;
}

.flyout-menu-search input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 12px;
  color: var(--dt-color-text-primary);
  background: transparent;
  font-family: var(--dt-font-sans);
}

.flyout-menu-search input::placeholder {
  color: var(--dt-color-text-muted);
}

.search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: none;
  background: var(--dt-color-text-muted);
  color: #fff;
  cursor: pointer;
  font-size: 8px;
  padding: 0;
  transition: background 120ms ease;
  flex-shrink: 0;
}

.search-clear:hover {
  background: var(--dt-color-text-secondary);
}

.search-clear :deep(svg) {
  font-size: 12px;
}

/* 操作栏 */
.flyout-menu-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--dt-color-border-light);
  background: #fff;
  flex-shrink: 0;
}

.flyout-menu-actions button {
  font-size: 11px;
  font-weight: 600;
  color: var(--dt-color-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: var(--dt-font-sans);
  transition: background 120ms ease;
}

.flyout-menu-actions button:hover {
  background: var(--dt-color-primary-light);
}

.actions-sep {
  color: var(--dt-color-border);
  font-size: 11px;
}

/* 选项列表 */
.flyout-menu-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.flyout-menu.size-long .flyout-menu-list {
  max-height: 320px;
}

.flyout-menu-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  font-size: 12px;
  color: var(--dt-color-text-muted);
}

/* 选项项 */
.flyout-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 80ms ease;
  font-size: 12px;
  color: var(--dt-color-text-primary);
}

.flyout-menu-item:hover {
  background: var(--dt-color-bg-hover);
}

.flyout-menu-item.is-all {
  color: var(--dt-color-text-secondary);
  font-weight: 500;
}

.item-check {
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--dt-gray-300);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 80ms ease, border-color 80ms ease;
}

.flyout-menu-item.is-checked .item-check {
  background: var(--dt-color-primary);
  border-color: var(--dt-color-primary);
}

.item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 底部 */
.flyout-menu-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-top: 1px solid var(--dt-color-border-light);
  background: var(--dt-color-bg-muted);
  flex-shrink: 0;
  gap: 6px;
}

.footer-info {
  font-size: 11px;
  font-weight: 600;
  color: var(--dt-color-text-muted);
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.flyout-btn {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 120ms ease;
  font-family: var(--dt-font-sans);
  letter-spacing: 0.02em;
}

.flyout-btn--clear {
  background: transparent;
  color: var(--dt-color-text-muted);
  border-color: var(--dt-color-border);
}

.flyout-btn--clear:hover {
  background: var(--dt-color-bg-muted);
  color: var(--dt-color-text-primary);
}

.flyout-btn--rows {
  background: #DBEAFE;
  color: #2563EB;
  border-color: #BFDBFE;
}

.flyout-btn--rows:hover {
  background: #BFDBFE;
}

.flyout-btn--cols {
  background: #F3E8FF;
  color: #9333EA;
  border-color: #E9D5FF;
}

.flyout-btn--cols:hover {
  background: #E9D5FF;
}

.flyout-btn--filter {
  background: #DCFCE7;
  color: #16A34A;
  border-color: #BBF7D0;
}

.flyout-btn--filter:hover {
  background: #BBF7D0;
}

/* 动画 */
.flyout-fade-enter-active,
.flyout-fade-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.flyout-fade-enter-from,
.flyout-fade-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}
</style>
