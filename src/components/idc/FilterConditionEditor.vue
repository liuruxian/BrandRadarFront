// 筛选条件编辑器
// 支持: 数值型(>=, <=, >, <, =, BETWEEN), 枚举型(=, !=, IN, NOT IN), 文本型(CONTAINS, STARTS_WITH), 布尔型(=, !=)
<template>
  <n-modal
    :show="visible"
    :mask-closable="false"
    preset="card"
    title="配置筛选条件"
    style="width: 520px"
    :closable="false"
    @update:show="(val: boolean) => emit('update:visible', val)"
  >
    <template #header-extra>
      <n-button text @click="handleBack">
        <template #icon>
          <n-icon><arrow-back-outline /></n-icon>
        </template>
        返回筛选字段
      </n-button>
    </template>
    <div class="condition-editor">
      <!-- 字段信息 -->
      <div class="field-info">
        <span class="field-label">{{ field?.label || '未选择字段' }}</span>
        <span class="field-value">{{ field?.value }}</span>
      </div>

      <!-- 操作符选择 -->
      <div class="form-row">
        <label class="form-label">条件</label>
        <n-select
          v-model:value="operator"
          :options="operatorOptions"
          placeholder="选择操作符"
          style="width: 200px"
        />
      </div>

      <!-- 值输入 -->
      <div class="form-row">
        <label class="form-label">值</label>
        <div class="value-input">
          <!-- 布尔型 -->
          <n-radio-group v-if="fieldType === 'boolean'" v-model:value="boolValue">
            <n-space>
              <n-radio value="Y">是</n-radio>
              <n-radio value="N">否</n-radio>
            </n-space>
          </n-radio-group>

          <!-- 数值型 -->
          <template v-else-if="fieldType === 'number'">
            <n-input-number
              v-if="operator !== 'between'"
              v-model:value="numValue"
              placeholder="输入数值"
              style="width: 180px"
            />
            <n-space v-else>
              <n-input-number v-model:value="numMin" placeholder="最小值" style="width: 140px" />
              <span>~</span>
              <n-input-number v-model:value="numMax" placeholder="最大值" style="width: 140px" />
            </n-space>
          </template>

          <!-- 枚举型 - 多选 -->
          <template v-else-if="fieldType === 'enum' && (operator === 'in' || operator === 'not_in')">
            <n-select
              v-model:value="enumValues"
              :options="enumOptions"
              multiple
              placeholder="选择值"
              filterable
              style="width: 320px"
            />
          </template>

          <!-- 枚举型 - 单值 -->
          <template v-else-if="fieldType === 'enum'">
            <n-select
              v-model:value="enumValue"
              :options="enumOptions"
              placeholder="选择值"
              filterable
              style="width: 320px"
            />
          </template>

          <!-- 文本型 -->
          <template v-else>
            <n-input
              v-model:value="textValue"
              :placeholder="operator === 'contains' ? '输入包含的文本' : '输入文本'"
              clearable
              style="width: 320px"
            />
          </template>
        </div>
      </div>

      <!-- 预设值快捷选择 -->
      <div v-if="fieldType === 'enum' && enumOptions.length > 0" class="quick-values">
        <label class="form-label">快捷选择</label>
        <div class="quick-chips">
          <n-tag
            v-for="opt in enumOptions.slice(0, 8)"
            :key="opt.value"
            :checkable="true"
            :checked="isQuickSelected(opt.value)"
            @click="toggleQuickValue(opt.value)"
          >
            {{ opt.label }}
          </n-tag>
          <span v-if="enumOptions.length > 8" class="more-hint">+{{ enumOptions.length - 8 }} 更多</span>
        </div>
      </div>
    </div>

    <template #action>
      <n-button @click="handleClose">取消</n-button>
      <n-button type="primary" @click="handleConfirm">确定</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NModal,
  NButton,
  NSelect,
  NInput,
  NInputNumber,
  NRadioGroup,
  NRadio,
  NSpace,
  NTag,
  NIcon,
} from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { useIDCStore } from '@/stores/idcStore'

const idcStore = useIDCStore()

interface FieldOption {
  value: string
  label: string
  type: 'number' | 'text' | 'enum' | 'boolean'
}

interface ConditionResult {
  field: string
  fieldLabel: string
  operator: string
  value: string | number | string[]
}

// 操作符选项
const textOperators = [
  { label: '等于 (=)', value: '=' },
  { label: '不等于 (≠)', value: '!=' },
  { label: '包含', value: 'contains' },
  { label: '不包含', value: 'not_contains' },
  { label: '在列表中 (IN)', value: 'in' },
  { label: '不在列表中 (NOT IN)', value: 'not_in' },
]

const numberOperators = [
  { label: '等于 (=)', value: '=' },
  { label: '不等于 (≠)', value: '!=' },
  { label: '大于 (>)', value: '>' },
  { label: '小于 (<)', value: '<' },
  { label: '大于等于 (>=)', value: '>=' },
  { label: '小于等于 (<=)', value: '<=' },
  { label: '区间 (BETWEEN)', value: 'between' },
]

const enumOperators = [
  { label: '等于 (=)', value: '=' },
  { label: '不等于 (≠)', value: '!=' },
  { label: '在列表中 (IN)', value: 'in' },
  { label: '不在列表中 (NOT IN)', value: 'not_in' },
]

const boolOperators = [
  { label: '等于 (=)', value: '=' },
  { label: '不等于 (≠)', value: '!=' },
]

// Props
interface Props {
  visible: boolean
  field: FieldOption | null
  existingCondition?: ConditionResult | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'confirm', condition: ConditionResult): void
  (e: 'cancel'): void
  (e: 'back'): void
}>()

// 状态
const operator = ref('=')
const textValue = ref('')
const numValue = ref<number | null>(null)
const numMin = ref<number | null>(null)
const numMax = ref<number | null>(null)
const enumValue = ref<string | null>(null)
const enumValues = ref<string[]>([])
const boolValue = ref('Y')

// 枚举选项 - 从 store 获取
const enumOptions = computed(() => {
  if (!props.field) return []
  const fieldValue = props.field.value
  const options = idcStore.filterOptions

  // 根据字段名从 store 获取对应的选项
  const fieldMap: Record<string, keyof typeof options> = {
    brands: 'brands',
    companies: 'companies',
    countries: 'countries',
    regions: 'regions',
    global_regions: 'global_regions',
    vendors: 'vendors',
    product_categories: 'product_categories',
    products: 'products',
    formats: 'formats',
    channels: 'channels',
    channel_groups: 'channel_groups',
    ink_types: 'ink_types',
    speed_ranges_a4: 'speed_ranges_a4',
    speed_ranges_letter: 'speed_ranges_letter',
    adf_options: 'adf_options',
    duplex_options: 'duplex_options',
    network_options: 'network_options',
    wireless_options: 'wireless_options',
    oems: 'oems',
    production_classifications: 'production_classifications',
    business_inkjet_details: 'business_inkjet_details',
    laser_product_details: 'laser_product_details',
    inkjet_product_details: 'inkjet_product_details',
    toner_capacity_ranges: 'toner_capacity_ranges',
  }

  const storeKey = fieldMap[fieldValue]
  if (storeKey && options[storeKey]) {
    const arr = options[storeKey]
    if (Array.isArray(arr)) {
      return arr.map((item: string | { value: string; label: string }) => {
        if (typeof item === 'string') {
          return { label: item, value: item }
        }
        return item
      })
    }
  }

  return []
})

// 字段类型
const fieldType = computed((): 'number' | 'text' | 'enum' | 'boolean' => {
  return props.field?.type || 'text'
})

// 操作符选项
const operatorOptions = computed(() => {
  switch (fieldType.value) {
    case 'number':
      return numberOperators
    case 'enum':
      return enumOperators
    case 'boolean':
      return boolOperators
    default:
      return textOperators
  }
})

// 监听字段变化，重置操作符
watch(() => props.field, () => {
  if (fieldType.value === 'number') {
    operator.value = '>='
  } else if (fieldType.value === 'enum') {
    operator.value = 'in'
  } else if (fieldType.value === 'boolean') {
    operator.value = '='
    boolValue.value = 'Y'
  } else {
    operator.value = 'contains'
    textValue.value = ''
  }
  resetValues()
})

// 监听现有条件，加载值
watch(() => props.existingCondition, (cond) => {
  if (cond) {
    operator.value = cond.operator
    if (fieldType.value === 'number') {
      if (cond.operator === 'between' && Array.isArray(cond.value)) {
        numMin.value = Number(cond.value[0]) || null
        numMax.value = Number(cond.value[1]) || null
      } else {
        numValue.value = Number(cond.value) || null
      }
    } else if (fieldType.value === 'enum') {
      if (cond.operator === 'in' || cond.operator === 'not_in') {
        enumValues.value = Array.isArray(cond.value) ? cond.value : []
      } else {
        enumValue.value = String(cond.value)
      }
    } else if (fieldType.value === 'boolean') {
      boolValue.value = String(cond.value)
    } else {
      textValue.value = String(cond.value)
    }
  }
}, { immediate: true })

// 重置值
function resetValues() {
  textValue.value = ''
  numValue.value = null
  numMin.value = null
  numMax.value = null
  enumValue.value = null
  enumValues.value = []
  boolValue.value = 'Y'
}

// 快捷选择
function isQuickSelected(val: string): boolean {
  if (operator.value === 'in' || operator.value === 'not_in') {
    return enumValues.value.includes(val)
  }
  return enumValue.value === val
}

function toggleQuickValue(val: string) {
  if (operator.value === 'in' || operator.value === 'not_in') {
    const idx = enumValues.value.indexOf(val)
    if (idx > -1) {
      enumValues.value.splice(idx, 1)
    } else {
      enumValues.value.push(val)
    }
  } else {
    enumValue.value = val
  }
}

// 关闭
function handleClose() {
  emit('update:visible', false)
  emit('cancel')
}

// 返回筛选字段选择
function handleBack() {
  emit('back')
  emit('update:visible', false)
}

// 确认
function handleConfirm() {
  if (!props.field) return

  let value: string | number | string[] = ''

  switch (fieldType.value) {
    case 'number':
      if (operator.value === 'between') {
        if (numMin.value === null || numMax.value === null) {
          return
        }
        value = [String(numMin.value), String(numMax.value)]
      } else {
        if (numValue.value === null) return
        value = numValue.value
      }
      break
    case 'enum':
      if (operator.value === 'in' || operator.value === 'not_in') {
        if (enumValues.value.length === 0) return
        value = enumValues.value
      } else {
        if (!enumValue.value) return
        value = enumValue.value
      }
      break
    case 'boolean':
      value = boolValue.value
      break
    default:
      if (!textValue.value.trim()) return
      value = textValue.value.trim()
  }

  emit('confirm', {
    field: props.field.value,
    fieldLabel: props.field.label,
    operator: operator.value,
    value,
  })

  emit('update:visible', false)
}
</script>

<style scoped>
.condition-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

:deep(.n-card-header__extra) {
  margin-left: auto;
}

.field-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 8px;
}

.field-info .field-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.field-info .field-value {
  font-size: 12px;
  color: #6b7280;
  font-family: var(--dt-font-mono);
}

.form-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.form-label {
  width: 60px;
  padding-top: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.value-input {
  flex: 1;
}

.quick-values {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.more-hint {
  font-size: 12px;
  color: #9ca3af;
  padding: 4px 8px;
}
</style>
