<template>
  <n-config-provider
    :theme="null"
    :theme-overrides="themeOverrides"
  >
    <n-message-provider>
      <n-notification-provider>
        <router-view />
        <UiToastViewport />
        <UiConfirmDialog />
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'
import UiToastViewport from '@/components/feedback/UiToastViewport.vue'
import UiConfirmDialog from '@/components/feedback/UiConfirmDialog.vue'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor:         '#3B82F6',
    primaryColorHover:    '#2563EB',
    primaryColorPressed:  '#1D4ED8',
    primaryColorSuppl:    '#6366F1',
    bodyColor:            '#FFFFFF',
    cardColor:            'rgba(255,255,255,0.06)',
    modalColor:           '#FFFFFF',
    popoverColor:         '#FFFFFF',
    borderColor:          '#E5E7EB',
    dividerColor:         '#E5E7EB',
    textColorBase:        '#111827',
    textColor1:           '#111827',
    textColor2:           '#374151',
    textColor3:           '#6B7280',
    inputColor:           '#FFFFFF',
    tableColor:           '#FFFFFF',
    tableColorHover:      '#F9FAFB',
    tableHeaderColor:     '#F3F4F6',
    fontFamily:           "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
    fontFamilyMono:       "'JetBrains Mono',monospace",
    borderRadius:         '12px',
    borderRadiusSmall:    '8px',
    successColor:         '#10B981',
    warningColor:         '#F59E0B',
    errorColor:           '#EF4444',
    infoColor:            '#06B6D4',
  },
  Button: { borderRadiusMedium:'12px', fontWeight:'700' },
  DataTable: {
    thColor:          '#F3F4F6',
    thTextColor:      '#374151',
    tdTextColor:      '#111827',
    borderColor:      '#E5E7EB',
  },
  Card: {
    color:            '#FFFFFF',
    borderColor:      '#E5E7EB',
    borderRadius:     '16px',
    boxShadow:        '0 1px 3px rgba(0,0,0,0.08)',
  },
  Tag:  { borderRadius:'999px' },
  Select: { peers: { InternalSelection: { borderRadius: '12px' } } },
}
</script>
