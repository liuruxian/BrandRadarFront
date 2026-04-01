<template>
  <n-config-provider :theme="null" :theme-overrides="themeOverrides">
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
    bodyColor:            '#1B1D22',
    cardColor:            'rgba(255,255,255,0.06)',
    modalColor:           'rgba(26,28,34,0.95)',
    popoverColor:         'rgba(26,28,34,0.96)',
    borderColor:          'rgba(255,255,255,0.12)',
    dividerColor:         'rgba(255,255,255,0.08)',
    textColorBase:        '#F8FAFC',
    textColor1:           '#F8FAFC',
    textColor2:           '#CBD5E1',
    textColor3:           '#94A3B8',
    inputColor:           'rgba(255,255,255,0.06)',
    tableColor:           'transparent',
    tableColorHover:      'rgba(255,255,255,0.04)',
    tableHeaderColor:     'rgba(255,255,255,0.03)',
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
    thColor:          'rgba(255,255,255,0.03)',
    thTextColor:      '#9AA4B8',
    tdTextColor:      '#D4DCEB',
    borderColor:      'rgba(255,255,255,0.08)',
  },
  Card: {
    color:            'rgba(255,255,255,0.06)',
    borderColor:      'rgba(255,255,255,0.12)',
    borderRadius:     '16px',
    boxShadow:        '0 10px 24px rgba(0,0,0,.25)',
  },
  Tag:  { borderRadius:'999px' },
  Select: { peers: { InternalSelection: { borderRadius: '12px' } } },
}
</script>
