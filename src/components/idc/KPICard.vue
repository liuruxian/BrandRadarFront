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
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.kpi-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.kpi-card.compact {
  padding: 16px;
}

.kpi-card--primary {
  border-left: 3px solid #3b82f6;
}

.kpi-card--success {
  border-left: 3px solid #10b981;
}

.kpi-card--warning {
  border-left: 3px solid #f59e0b;
}

.kpi-card--danger {
  border-left: 3px solid #ef4444;
}

.kpi-card--info {
  border-left: 3px solid #06b6d4;
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.kpi-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.kpi-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}

.kpi-change.positive {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.kpi-change.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.kpi-change.neutral {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.kpi-change-icon {
  font-size: 10px;
}

.kpi-change-value {
  font-size: 11px;
}

.kpi-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.kpi-number {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  font-family: 'JetBrains Mono', monospace;
}

.compact .kpi-number {
  font-size: 22px;
}

.kpi-suffix {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
}

.kpi-extra {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}
</style>
