<template>
  <n-config-provider :theme="null" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-notification-provider>
        <router-view />
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor:         '#00C4CC',
    primaryColorHover:    '#00AAB1',
    primaryColorPressed:  '#008C93',
    primaryColorSuppl:    '#10B981',
    bodyColor:            '#FFFFFF',
    cardColor:            '#FFFFFF',
    modalColor:           '#FFFFFF',
    popoverColor:         '#FFFFFF',
    borderColor:          '#E5E7EB',
    dividerColor:         '#EEF2F7',
    textColorBase:        '#111827',
    textColor1:           '#111827',
    textColor2:           '#4B5563',
    textColor3:           '#6B7280',
    inputColor:           '#FFFFFF',
    tableColor:           '#FFFFFF',
    tableColorHover:      '#F9FAFB',
    tableHeaderColor:     '#F9FAFB',
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
    thColor:          '#F9FAFB',
    thTextColor:      '#6B7280',
    tdTextColor:      '#374151',
    borderColor:      '#E5E7EB',
  },
  Card: {
    color:            '#FFFFFF',
    borderColor:      '#E5E7EB',
    borderRadius:     '16px',
    boxShadow:        '0 8px 16px rgba(15, 23, 42, 0.06)',
  },
  Tag:  { borderRadius:'999px' },
  Select: { peers: { InternalSelection: { borderRadius: '12px' } } },
}
</script>
