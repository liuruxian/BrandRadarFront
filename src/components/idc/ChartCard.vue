<template>
  <div class="chart-card" :class="{ loading: loading }">
    <div v-if="loading" class="chart-loading">
      <n-spin size="large" />
      <span>加载中...</span>
    </div>

    <template v-else>
      <div v-if="title || $slots.header" class="chart-header">
        <div class="chart-title">
          <span>{{ title }}</span>
          <n-tooltip v-if="tooltip" trigger="hover">
            <template #trigger>
              <span class="chart-tooltip-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </span>
            </template>
            {{ tooltip }}
          </n-tooltip>
        </div>
        <div v-if="$slots.header" class="chart-header-extra">
          <slot name="header" />
        </div>
      </div>

      <div class="chart-body">
        <slot />
      </div>

      <div v-if="$slots.footer" class="chart-footer">
        <slot name="footer" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { NSpin, NTooltip } from 'naive-ui'

interface Props {
  title?: string
  tooltip?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  tooltip: '',
  loading: false,
})
</script>

<style scoped>
.chart-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.chart-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.chart-card.loading {
  min-height: 200px;
  justify-content: center;
  align-items: center;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 13px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.chart-tooltip-icon {
  color: #9ca3af;
  cursor: help;
  display: flex;
  align-items: center;
}

.chart-header-extra {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-body {
  flex: 1;
  min-height: 0;
}

.chart-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
</style>
