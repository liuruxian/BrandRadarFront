<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-notification-provider>
        <router-view />
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#00d4ff',
    primaryColorHover: '#00eaff',
    primaryColorPressed: '#0099cc',
    primaryColorSuppl: '#00d4ff',
    bodyColor: '#080c14',
    cardColor: '#111827',
    modalColor: '#0d1220',
    popoverColor: '#111827',
    borderColor: 'rgba(0, 212, 255, 0.15)',
    dividerColor: 'rgba(0, 212, 255, 0.1)',
    textColorBase: '#e8f0fe',
    textColor1: '#e8f0fe',
    textColor2: '#8899bb',
    textColor3: '#4a5568',
    inputColor: '#1a2438',
    tableColor: '#111827',
    tableColorHover: 'rgba(0, 212, 255, 0.05)',
    tableHeaderColor: '#0d1220',
    fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
    fontFamilyMono: "'JetBrains Mono', monospace",
    borderRadius: '10px',
    borderRadiusSmall: '6px',
    successColor: '#00ff88',
    warningColor: '#ffb800',
    errorColor: '#ff4466',
    infoColor: '#00d4ff',
  },
  Button: {
    borderRadiusMedium: '10px',
    fontWeight: '600',
  },
  Select: {
    peers: { InternalSelection: { borderRadius: '10px' } }
  },
  DataTable: {
    thColor: '#0d1220',
    thTextColor: '#4a5568',
    tdTextColor: '#e8f0fe',
    borderColor: 'rgba(0, 212, 255, 0.08)',
  },
  Card: {
    color: '#111827',
    borderColor: 'rgba(0, 212, 255, 0.12)',
    borderRadius: '16px',
  },
  Tag: {
    borderRadius: '999px',
  }
}
</script>
