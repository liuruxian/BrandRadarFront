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
  background: var(--dt-color-bg-surface);
  border: 1px solid var(--dt-gray-200);
  border-radius: var(--dt-radius-xl);
  padding: var(--dt-space-5);
  display: flex;
  flex-direction: column;
  transition: all var(--dt-duration-base) var(--dt-ease-smooth);
  box-shadow: var(--dt-shadow-sm);
}

.chart-card:hover {
  border-color: var(--dt-gray-300);
  box-shadow: var(--dt-shadow-md);
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
  gap: var(--dt-space-3);
  color: var(--dt-gray-500);
  font-size: var(--dt-text-sm);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--dt-space-4);
}

.chart-title {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  font-size: var(--dt-text-base);
  font-weight: var(--dt-weight-semibold);
  color: var(--dt-color-text-primary);
}

.chart-tooltip-icon {
  color: var(--dt-gray-400);
  cursor: help;
  display: flex;
  align-items: center;
}

.chart-header-extra {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
}

.chart-body {
  flex: 1;
  min-height: 0;
}

.chart-footer {
  margin-top: var(--dt-space-4);
  padding-top: var(--dt-space-4);
  border-top: 1px solid var(--dt-gray-100);
}
</style>
