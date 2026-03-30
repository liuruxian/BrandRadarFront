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
    primaryColor:         '#6366F1',
    primaryColorHover:    '#4F46E5',
    primaryColorPressed:  '#4338CA',
    primaryColorSuppl:    '#8B5CF6',
    bodyColor:            '#F0F2F5',
    cardColor:            '#FFFFFF',
    modalColor:           '#FFFFFF',
    popoverColor:         '#FFFFFF',
    borderColor:          '#E5E7EB',
    dividerColor:         '#F3F4F6',
    textColorBase:        '#111827',
    textColor1:           '#111827',
    textColor2:           '#374151',
    textColor3:           '#9CA3AF',
    inputColor:           '#FFFFFF',
    tableColor:           '#FFFFFF',
    tableColorHover:      '#F9FAFB',
    tableHeaderColor:     '#F8F9FA',
    fontFamily:           "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
    fontFamilyMono:       "'JetBrains Mono',monospace",
    borderRadius:         '10px',
    borderRadiusSmall:    '6px',
    successColor:         '#10B981',
    warningColor:         '#F59E0B',
    errorColor:           '#EF4444',
    infoColor:            '#06B6D4',
  },
  Button: { borderRadiusMedium:'10px', fontWeight:'600' },
  DataTable: {
    thColor:          '#F8F9FA',
    thTextColor:      '#9CA3AF',
    tdTextColor:      '#374151',
    borderColor:      '#F3F4F6',
  },
  Card: {
    color:            '#FFFFFF',
    borderColor:      '#E5E7EB',
    borderRadius:     '14px',
    boxShadow:        '0 2px 8px rgba(0,0,0,0.06)',
  },
  Tag:  { borderRadius:'999px' },
  Select: { peers: { InternalSelection: { borderRadius: '10px' } } },
}
</script>
