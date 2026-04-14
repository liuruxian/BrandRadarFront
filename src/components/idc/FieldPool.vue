// 字段池组件 - 左侧字段选择区域
// 更新时间: 2026-04-10
<template>
  <div class="field-pool">
    <!-- 搜索框 -->
    <div class="search-box">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索字段..."
        clearable
        size="small"
      >
        <template #prefix>
          <SearchIcon />
        </template>
      </n-input>
    </div>

    <!-- 字段分类树 -->
    <div class="field-categories">
      <n-collapse :default-expanded-names="defaultExpanded" accordion @update:expanded-names="handleExpand">
        <n-collapse-item
          v-for="category in filteredCategories"
          :key="category.key"
          :title="category.label"
          :name="category.key"
        >
          <template #header>
            <div class="category-header">
              <component :is="category.icon" class="category-icon" />
              <span class="category-label">{{ category.label }}</span>
              <n-badge
                :value="category.fields.length"
                :max="99"
                type="info"
                class="category-badge"
              />
            </div>
          </template>

          <!-- 字段列表 -->
          <div class="field-list">
            <div
              v-for="field in category.fields"
              :key="field.value"
              class="field-item"
              draggable="true"
              @dragstart="handleDragStart($event, field)"
              @dragend="handleDragEnd"
              @click="handleFieldClick(field)"
            >
              <DragIcon class="drag-handle" />
              <span class="field-label">{{ field.label }}</span>
              <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                  <InfoIcon class="field-info" />
                </template>
                <div class="field-tooltip">
                  <div class="tooltip-title">{{ field.label }}</div>
                  <div class="tooltip-desc">{{ field.description }}</div>
                  <div v-if="field.example" class="tooltip-example">
                    <span>示例:</span> {{ field.example }}
                  </div>
                </div>
              </n-tooltip>
            </div>
          </div>
        </n-collapse-item>
      </n-collapse>
    </div>

    <!-- 已选字段列表 -->
    <div v-if="selectedFields.length > 0" class="selected-fields">
      <div class="selected-header">
        <span>已选字段</span>
        <n-button text size="tiny" @click="clearAll">清空</n-button>
      </div>
      <div class="selected-list">
        <n-tag
          v-for="field in selectedFields"
          :key="field.value"
          closable
          size="small"
          @close="removeField(field)"
        >
          {{ field.label }}
        </n-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NInput,
  NCollapse,
  NCollapseItem,
  NBadge,
  NTag,
  NButton,
  NTooltip,
} from 'naive-ui'
import {
  Search as SearchIcon,
  InformationCircleOutline as InfoIcon,
  ReorderTwoOutline as DragIcon,
  TimeOutline as TimeIcon,
  GlobeOutline as GlobeIcon,
  BusinessOutline as BusinessIcon,
  CubeOutline as ProductIcon,
  SpeedometerOutline as SpeedIcon,
  SettingsOutline as ConfigIcon,
  ColorPaletteOutline as InkIcon,
  GitBranchOutline as ChannelIcon,
  StarOutline as BusinessLevelIcon,
} from '@vicons/ionicons5'
import type { PivotDimension } from '@/api/idcApiTypes'

// 字段定义
interface FieldDefinition {
  value: PivotDimension
  label: string
  category: string
  description: string
  example?: string
}

// Props定义
interface Props {
  selectedFields?: PivotDimension[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedFields: () => [],
})

// Emits定义
const emit = defineEmits<{
  (e: 'field-select', field: FieldDefinition): void
  (e: 'field-remove', field: FieldDefinition): void
  (e: 'drag-start', event: DragEvent, field: FieldDefinition): void
  (e: 'drag-end'): void
  (e: 'clear-all'): void
}>()

// 搜索关键字
const searchKeyword = ref('')

// 默认展开的分类
const defaultExpanded = ['time', 'geo', 'brand']

// 字段分类定义
const fieldCategories = [
  {
    key: 'time',
    label: '时间维度',
    icon: TimeIcon,
    fields: [
      { value: 'Year' as PivotDimension, label: '年份 (Year)', category: 'time', description: '数据所属年份', example: '2024' },
      { value: 'Half Year' as PivotDimension, label: '半年度 (Half Year)', category: 'time', description: '半年周期', example: '2024H1' },
    ],
  },
  {
    key: 'geo',
    label: '地理维度',
    icon: GlobeIcon,
    fields: [
      { value: 'Global Region' as PivotDimension, label: '全球区域', category: 'geo', description: '美洲/EMEA/亚太', example: 'Americas' },
      { value: 'Region' as PivotDimension, label: '区域 (Region)', category: 'geo', description: '细分区域', example: 'Western Europe' },
      { value: 'Country' as PivotDimension, label: '国家 (Country)', category: 'geo', description: '国家代码', example: 'US' },
    ],
  },
  {
    key: 'brand',
    label: '厂商维度',
    icon: BusinessIcon,
    fields: [
      { value: 'Company' as PivotDimension, label: '公司 (Company)', category: 'brand', description: '公司全称', example: 'HP Inc' },
      { value: 'Vendor' as PivotDimension, label: '厂商 (Vendor)', category: 'brand', description: '品牌厂商', example: 'HP' },
      { value: 'Brand' as PivotDimension, label: '品牌 (Brand)', category: 'brand', description: '产品品牌', example: 'HP' },
      { value: 'OEM' as PivotDimension, label: 'OEM 制造商', category: 'brand', description: '原始设备制造商', example: 'Canon' },
    ],
  },
  {
    key: 'product',
    label: '产品维度',
    icon: ProductIcon,
    fields: [
      { value: 'Product Category' as PivotDimension, label: '产品类别', category: 'product', description: 'Laser/Inkjet/MFP', example: 'Laser' },
      { value: 'Product' as PivotDimension, label: '产品类型', category: 'product', description: '具体产品类型', example: 'Laser Printer' },
      { value: 'Format' as PivotDimension, label: '幅面 (Format)', category: 'product', description: '纸张幅面', example: 'A4' },
    ],
  },
  {
    key: 'speed',
    label: '速度维度',
    icon: SpeedIcon,
    fields: [
      { value: 'Speed Range A4' as PivotDimension, label: '速度段 A4', category: 'speed', description: 'A4速度分类', example: '20-40 ppm' },
      { value: 'Speed Range Letter' as PivotDimension, label: '速度段 Letter', category: 'speed', description: 'Letter速度分类', example: '20-40 ppm' },
    ],
  },
  {
    key: 'function',
    label: '功能维度',
    icon: ConfigIcon,
    fields: [
      { value: 'ADF' as PivotDimension, label: '自动输稿器 (ADF)', category: 'function', description: '是否支持ADF', example: 'Y' },
      { value: 'Duplex' as PivotDimension, label: '双面打印 (Duplex)', category: 'function', description: '是否支持自动双面', example: 'Y' },
      { value: 'Wireless' as PivotDimension, label: '无线功能 (Wireless)', category: 'function', description: '是否支持无线', example: 'Y' },
    ],
  },
  {
    key: 'consumable',
    label: '耗材维度',
    icon: InkIcon,
    fields: [
      { value: 'Ink Tank/ Ink Cartridge' as PivotDimension, label: '墨仓/墨盒', category: 'consumable', description: '耗材类型', example: 'Ink Tank' },
    ],
  },
  {
    key: 'channel',
    label: '渠道维度',
    icon: ChannelIcon,
    fields: [
      { value: 'Channel' as PivotDimension, label: '渠道 (Channel)', category: 'channel', description: '销售渠道', example: 'Dealer/VAR/SI' },
      { value: 'Channel Group' as PivotDimension, label: '渠道组', category: 'channel', description: '渠道分组', example: 'Offline' },
    ],
  },
  {
    key: 'business',
    label: '业务维度',
    icon: BusinessLevelIcon,
    fields: [
      { value: 'Production Classification' as PivotDimension, label: '生产级别', category: 'business', description: '生产级分类', example: 'New' },
      { value: 'Business Inkjet Detail' as PivotDimension, label: '商用喷墨级别', category: 'business', description: '商用喷墨细分', example: '03: High-end' },
    ],
  },
]

// 过滤后的分类
const filteredCategories = computed(() => {
  if (!searchKeyword.value.trim()) {
    return fieldCategories
  }

  const keyword = searchKeyword.value.toLowerCase()
  return fieldCategories
    .map((cat) => ({
      ...cat,
      fields: cat.fields.filter(
        (f) =>
          f.label.toLowerCase().includes(keyword) ||
          f.value.toLowerCase().includes(keyword) ||
          f.description.toLowerCase().includes(keyword)
      ),
    }))
    .filter((cat) => cat.fields.length > 0)
})

// 已选字段列表
const selectedFields = computed(() => {
  return fieldCategories
    .flatMap((cat) => cat.fields)
    .filter((f) => props.selectedFields.includes(f.value))
})

// 展开/折叠处理
function handleExpand(names: string[]) {
  // 单选展开模式
}

// 拖拽开始
function handleDragStart(event: DragEvent, field: FieldDefinition) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/json', JSON.stringify(field))
    event.dataTransfer.setData('text/plain', field.value)
  }
  emit('drag-start', event, field)
}

// 拖拽结束
function handleDragEnd(event: DragEvent) {
  emit('drag-end')
}

// 字段点击
function handleFieldClick(field: FieldDefinition) {
  emit('field-select', field)
}

// 移除字段
function removeField(field: FieldDefinition) {
  emit('field-remove', field)
}

// 清空所有
function clearAll() {
  emit('clear-all')
}
</script>

<style scoped>
.field-pool {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 12px;
}

.search-box {
  margin-bottom: 12px;
}

.field-categories {
  flex: 1;
  overflow-y: auto;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.category-icon {
  font-size: 16px;
  color: #6366f1;
}

.category-label {
  flex: 1;
  font-weight: 500;
  font-size: 13px;
}

.category-badge {
  margin-right: 8px;
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.5);
}

.field-item:hover {
  background: rgba(99, 102, 241, 0.1);
}

.field-item:active {
  cursor: grabbing;
}

.drag-handle {
  font-size: 14px;
  color: #9ca3af;
  cursor: grab;
}

.field-label {
  flex: 1;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-info {
  font-size: 14px;
  color: #9ca3af;
  opacity: 0;
  transition: opacity 0.2s;
}

.field-item:hover .field-info {
  opacity: 1;
}

.field-tooltip {
  max-width: 250px;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-desc {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.tooltip-example {
  font-size: 12px;
  color: #6366f1;
}

.selected-fields {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #6b7280;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
