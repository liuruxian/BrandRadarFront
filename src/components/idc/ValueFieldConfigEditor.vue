// 值字段配置编辑器
// 支持: 聚合方式选择(SUM/AVG/COUNT/MAX/MIN), 显示格式设置
<template>
  <n-modal
    :show="visible"
    preset="card"
    title="配置统计量"
    style="width: 480px"
    @update:show="(val: boolean) => emit('update:visible', val)"
  >
    <div class="value-config-editor">
      <!-- 统计量信息 -->
      <div class="field-info">
        <span class="field-icon">📊</span>
        <span class="field-label">{{ config?.aggregationLabel || '统计量' }}</span>
      </div>

      <!-- 聚合方式 -->
      <div class="form-section">
        <label class="section-label">聚合方式</label>
        <n-radio-group v-model:value="aggregation" class="agg-options">
          <n-space vertical>
            <n-radio value="sum" class="agg-option">
              <div class="agg-content">
                <span class="agg-name">求和 (SUM)</span>
                <span class="agg-desc">计算所有值的总和</span>
              </div>
            </n-radio>
            <n-radio value="avg" class="agg-option">
              <div class="agg-content">
                <span class="agg-name">平均值 (AVG)</span>
                <span class="agg-desc">计算所有值的平均</span>
              </div>
            </n-radio>
            <n-radio value="count" class="agg-option">
              <div class="agg-content">
                <span class="agg-name">计数 (COUNT)</span>
                <span class="agg-desc">统计记录数量</span>
              </div>
            </n-radio>
            <n-radio value="max" class="agg-option" v-if="!isCountOnly">
              <div class="agg-content">
                <span class="agg-name">最大值 (MAX)</span>
                <span class="agg-desc">取最大值</span>
              </div>
            </n-radio>
            <n-radio value="min" class="agg-option" v-if="!isCountOnly">
              <div class="agg-content">
                <span class="agg-name">最小值 (MIN)</span>
                <span class="agg-desc">取最小值</span>
              </div>
            </n-radio>
          </n-space>
        </n-radio-group>
      </div>

      <!-- 显示格式 -->
      <div class="form-section" v-if="!isCountOnly">
        <label class="section-label">显示格式</label>
        <div class="format-options">
          <!-- 销量/计数类 -->
          <template v-if="showNumberFormat">
            <n-radio-group v-model:value="numberFormat" class="format-group">
              <n-space vertical>
                <n-radio value="thousand" class="format-option">
                  <div class="format-content">
                    <span class="format-name">千位分隔</span>
                    <span class="format-example">1,234</span>
                  </div>
                </n-radio>
                <n-radio value="short" class="format-option">
                  <div class="format-content">
                    <span class="format-name">简写</span>
                    <span class="format-example">1.2K / 12.5K</span>
                  </div>
                </n-radio>
                <n-radio value="full" class="format-option">
                  <div class="format-content">
                    <span class="format-name">完整数字</span>
                    <span class="format-example">1234</span>
                  </div>
                </n-radio>
              </n-space>
            </n-radio-group>
          </template>

          <!-- 销售额类 -->
          <template v-else-if="showCurrencyFormat">
            <n-radio-group v-model:value="currencyFormat" class="format-group">
              <n-space vertical>
                <n-radio value="million" class="format-option">
                  <div class="format-content">
                    <span class="format-name">百万美元</span>
                    <span class="format-example">$12.5M</span>
                  </div>
                </n-radio>
                <n-radio value="thousand" class="format-option">
                  <div class="format-content">
                    <span class="format-name">千美元</span>
                    <span class="format-example">$12,500K</span>
                  </div>
                </n-radio>
                <n-radio value="full" class="format-option">
                  <div class="format-content">
                    <span class="format-name">完整美元</span>
                    <span class="format-example">$12,500,000</span>
                  </div>
                </n-radio>
              </n-space>
            </n-radio-group>
          </template>

          <!-- ASP/均价类 -->
          <template v-else-if="showAspFormat">
            <n-radio-group v-model:value="aspFormat" class="format-group">
              <n-space vertical>
                <n-radio value="dollar" class="format-option">
                  <div class="format-content">
                    <span class="format-name">美元</span>
                    <span class="format-example">$299.00</span>
                  </div>
                </n-radio>
                <n-radio value="yuan" class="format-option">
                  <div class="format-content">
                    <span class="format-name">人民币</span>
                    <span class="format-example">¥2,100.00</span>
                  </div>
                </n-radio>
              </n-space>
            </n-radio-group>
          </template>

          <!-- 百分比类 -->
          <template v-else-if="showPercentFormat">
            <n-radio-group v-model:value="percentFormat" class="format-group">
              <n-space vertical>
                <n-radio value="percent" class="format-option">
                  <div class="format-content">
                    <span class="format-name">百分比</span>
                    <span class="format-example">12.5%</span>
                  </div>
                </n-radio>
                <n-radio value="percent1d" class="format-option">
                  <div class="format-content">
                    <span class="format-name">百分比 (1位小数)</span>
                    <span class="format-example">12.50%</span>
                  </div>
                </n-radio>
                <n-radio value="percent2d" class="format-option">
                  <div class="format-content">
                    <span class="format-name">百分比 (2位小数)</span>
                    <span class="format-example">12.500%</span>
                  </div>
                </n-radio>
              </n-space>
            </n-radio-group>
          </template>

          <!-- 默认数值 -->
          <template v-else>
            <n-radio-group v-model:value="numberFormat" class="format-group">
              <n-space vertical>
                <n-radio value="full" class="format-option">
                  <div class="format-content">
                    <span class="format-name">完整数字</span>
                    <span class="format-example">1234</span>
                  </div>
                </n-radio>
                <n-radio value="short" class="format-option">
                  <div class="format-content">
                    <span class="format-name">简写</span>
                    <span class="format-example">1.2K</span>
                  </div>
                </n-radio>
              </n-space>
            </n-radio-group>
          </template>
        </div>
      </div>

      <!-- 小数位数 -->
      <div class="form-section" v-if="showDecimalPlaces">
        <label class="section-label">小数位数</label>
        <n-radio-group v-model:value="decimalPlaces">
          <n-space>
            <n-radio value="0">0位</n-radio>
            <n-radio value="1">1位</n-radio>
            <n-radio value="2">2位</n-radio>
          </n-space>
        </n-radio-group>
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
  NRadioGroup,
  NRadio,
  NSpace,
} from 'naive-ui'

interface ValueConfigResult {
  aggregation: string
  aggregationLabel: string
  format: string
  decimalPlaces: number
}

// Props
interface Props {
  visible: boolean
  config: {
    aggregation: string
    aggregationLabel: string
    format?: string
    decimalPlaces?: number
  } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'confirm', config: ValueConfigResult): void
}>()

// 状态
const aggregation = ref('sum')
const numberFormat = ref('thousand')
const currencyFormat = ref('million')
const aspFormat = ref('dollar')
const percentFormat = ref('percent')
const decimalPlaces = ref('0')

// 聚合类型判断
const isCountOnly = computed(() => {
  return props.config?.aggregation?.includes('count')
})

// 格式类型判断
const showNumberFormat = computed(() => {
  const agg = props.config?.aggregation || ''
  return agg.includes('units') || agg.includes('models')
})

const showCurrencyFormat = computed(() => {
  const agg = props.config?.aggregation || ''
  return agg.includes('value') && !agg.includes('share')
})

const showAspFormat = computed(() => {
  const agg = props.config?.aggregation || ''
  return agg.includes('asp')
})

const showPercentFormat = computed(() => {
  const agg = props.config?.aggregation || ''
  return (
    agg.includes('share') ||
    agg.includes('pct') ||
    agg.includes('penetration') ||
    agg.includes('growth') ||
    agg.includes('concentration')
  )
})

const showDecimalPlaces = computed(() => {
  return showPercentFormat.value || showAspFormat.value
})

// 监听配置变化，加载现有配置
watch(() => props.config, (config) => {
  if (config) {
    // 解析聚合方式
    if (config.aggregation.includes('_')) {
      const parts = config.aggregation.split('_')
      aggregation.value = parts[0] === 'count' ? 'count' : (parts[1] || 'sum')
    } else {
      aggregation.value = 'sum'
    }

    // 解析格式
    if (config.format === 'percent' || config.format === 'percent1d' || config.format === 'percent2d') {
      percentFormat.value = config.format
    } else if (config.format?.includes('currency')) {
      currencyFormat.value = 'million'
    } else {
      numberFormat.value = config.format || 'thousand'
    }

    // 小数位数
    decimalPlaces.value = String(config.decimalPlaces || 0)
  }
}, { immediate: true })

// 关闭
function handleClose() {
  emit('update:visible', false)
}

// 确认
function handleConfirm() {
  let format = 'thousand'
  let aggValue = aggregation.value

  if (showNumberFormat.value) {
    format = numberFormat.value
  } else if (showCurrencyFormat.value) {
    format = currencyFormat.value
  } else if (showAspFormat.value) {
    format = aspFormat.value
  } else if (showPercentFormat.value) {
    format = percentFormat.value
  }

  // 构建聚合标识
  let aggKey = aggregation.value
  if (props.config?.aggregation?.includes('_')) {
    const parts = props.config.aggregation.split('_')
    if (parts[0] !== 'count') {
      aggKey = `${parts[0]}_${aggregation.value}`
    }
  } else {
    aggKey = aggregation.value
  }

  const labels: Record<string, string> = {
    sum: '求和',
    avg: '平均值',
    count: '计数',
    max: '最大值',
    min: '最小值',
  }

  emit('confirm', {
    aggregation: aggKey,
    aggregationLabel: `${labels[aggregation.value] || '求和'}(${props.config?.aggregationLabel || ''})`,
    format,
    decimalPlaces: parseInt(decimalPlaces.value) || 0,
  })

  emit('update:visible', false)
}
</script>

<style scoped>
.value-config-editor {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.field-info .field-icon {
  font-size: 20px;
}

.field-info .field-label {
  font-size: 14px;
  font-weight: 600;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.agg-options,
.format-options {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.agg-option,
.format-option {
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.agg-option:hover,
.format-option:hover {
  background: #e5e7eb;
}

.agg-content,
.format-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agg-name,
.format-name {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  min-width: 120px;
}

.agg-desc,
.format-example {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}
</style>
