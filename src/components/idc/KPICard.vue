<template>
  <div class="kpi-card" :class="[`kpi-card--${color}`, { compact }]">
    <div class="kpi-header">
      <span class="kpi-label">{{ label }}</span>
      <div v-if="change !== undefined" class="kpi-change" :class="changeClass">
        <span class="kpi-change-icon">{{ changeIcon }}</span>
        <span class="kpi-change-value">{{ formatChange(change) }}</span>
      </div>
    </div>
    <div class="kpi-value">
      <span class="kpi-number">{{ formattedValue }}</span>
      <span v-if="suffix" class="kpi-suffix">{{ suffix }}</span>
    </div>
    <div v-if="$slots.default" class="kpi-extra">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: number | string
  suffix?: string
  change?: number
  changeLabel?: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  compact?: boolean
  format?: 'number' | 'percent' | 'currency' | 'raw'
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  value: 0,
  suffix: '',
  change: undefined,
  changeLabel: '',
  color: 'primary',
  compact: false,
  format: 'number',
  decimals: 0,
})

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value

  switch (props.format) {
    case 'percent':
      return `${props.value.toFixed(props.decimals)}%`
    case 'currency':
      if (props.value >= 1000000) {
        return `${(props.value / 1000000).toFixed(2)}M`
      } else if (props.value >= 1000) {
        return `${(props.value / 1000).toFixed(1)}K`
      }
      return props.value.toFixed(props.decimals)
    case 'number':
    default:
      if (props.value >= 1000000) {
        return `${(props.value / 1000000).toFixed(2)}M`
      } else if (props.value >= 1000) {
        return `${(props.value / 1000).toFixed(1)}K`
      }
      return props.value.toLocaleString('en-US', {
        maximumFractionDigits: props.decimals,
      })
  }
})

const changeClass = computed(() => {
  if (props.change === undefined) return ''
  if (props.change > 0) return 'positive'
  if (props.change < 0) return 'negative'
  return 'neutral'
})

const changeIcon = computed(() => {
  if (props.change === undefined) return ''
  if (props.change > 0) return '↑'
  if (props.change < 0) return '↓'
  return '→'
})

function formatChange(val: number): string {
  const absVal = Math.abs(val)
  return `${absVal.toFixed(1)}%`
}
</script>

<style scoped>
.kpi-card {
  background: var(--dt-color-bg-surface);
  border: 1px solid var(--dt-gray-200);
  border-radius: var(--dt-radius-xl);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  transition: all var(--dt-duration-base) var(--dt-ease-smooth);
  box-shadow: var(--dt-shadow-sm);
}

.kpi-card:hover {
  border-color: var(--dt-gray-300);
  box-shadow: var(--dt-shadow-md);
  transform: translateY(-1px);
}

.kpi-card.compact {
  padding: var(--dt-space-4);
}

.kpi-card--primary {
  border-left: 3px solid var(--dt-color-primary);
}

.kpi-card--success {
  border-left: 3px solid var(--dt-color-success);
}

.kpi-card--warning {
  border-left: 3px solid var(--dt-color-warning);
}

.kpi-card--danger {
  border-left: 3px solid var(--dt-color-danger);
}

.kpi-card--info {
  border-left: 3px solid var(--dt-color-info);
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
}

.kpi-label {
  font-size: var(--dt-text-sm);
  color: var(--dt-gray-500);
  font-weight: var(--dt-weight-medium);
}

.kpi-change {
  display: flex;
  align-items: center;
  gap: var(--dt-space-1);
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-weight-semibold);
  padding: 2px 8px;
  border-radius: var(--dt-radius-full);
}

.kpi-change.positive {
  background: rgba(16, 185, 129, 0.1);
  color: var(--dt-color-success-text);
}

.kpi-change.negative {
  background: rgba(239, 68, 68, 0.1);
  color: var(--dt-color-danger);
}

.kpi-change.neutral {
  background: rgba(107, 114, 128, 0.1);
  color: var(--dt-gray-500);
}

.kpi-change-icon {
  font-size: 10px;
}

.kpi-change-value {
  font-size: var(--dt-text-2xs, 11px);
}

.kpi-value {
  display: flex;
  align-items: baseline;
  gap: var(--dt-space-1);
}

.kpi-number {
  font-size: var(--dt-text-4xl);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-color-text-primary);
  line-height: var(--dt-leading-snug);
  font-family: var(--dt-font-mono);
}

.compact .kpi-number {
  font-size: var(--dt-text-2xl);
}

.kpi-suffix {
  font-size: var(--dt-text-base);
  color: var(--dt-gray-400);
  font-weight: var(--dt-weight-medium);
}

.kpi-extra {
  margin-top: var(--dt-space-2);
  font-size: var(--dt-text-xs);
  color: var(--dt-gray-500);
}
</style>
