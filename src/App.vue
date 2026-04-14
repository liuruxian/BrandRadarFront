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
    primaryColor:         '#ec4899',
    primaryColorHover:    '#db2777',
    primaryColorPressed:  '#be185d',
    primaryColorSuppl:    '#8b5cf6',
    bodyColor:            '#f8fafc',
    cardColor:            '#ffffff',
    modalColor:           '#ffffff',
    popoverColor:         '#ffffff',
    borderColor:          '#e2e8f0',
    dividerColor:         '#e2e8f0',
    textColorBase:        '#0f172a',
    textColor1:           '#0f172a',
    textColor2:           '#475569',
    textColor3:           '#94a3b8',
    inputColor:           '#ffffff',
    tableColor:           '#ffffff',
    tableColorHover:      '#fce7f3',
    tableHeaderColor:     '#f8fafc',
    fontFamily:           "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
    fontFamilyMono:       "'JetBrains Mono',monospace",
    borderRadius:         '12px',
    borderRadiusSmall:    '8px',
    successColor:         '#10b981',
    warningColor:         '#f59e0b',
    errorColor:           '#ef4444',
    infoColor:            '#06b6d4',
  },
  Button: { borderRadiusMedium:'12px', fontWeight:'700' },
  DataTable: {
    thColor:          '#f8fafc',
    thTextColor:      '#94a3b8',
    tdTextColor:      '#475569',
    borderColor:      '#e2e8f0',
  },
  Card: {
    color:            '#ffffff',
    borderColor:      '#e2e8f0',
    borderRadius:     '16px',
    boxShadow:        '0 1px 3px rgba(0,0,0,0.04)',
  },
  Tag:  { borderRadius:'999px' },
  Select: { peers: { InternalSelection: { borderRadius: '12px' } } },
}
</script>
