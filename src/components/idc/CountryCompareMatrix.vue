// 国家规格对比矩阵组件 - 匹配设计稿
// 功能：多国对比矩阵 (最多3国)、市场份额圆环、ASP/Units指标、AI洞察
<template>
  <div class="country-compare-matrix">
    <!-- 标题栏 -->
    <div class="matrix-header">
      <h3 class="matrix-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        规格参数对比矩阵
      </h3>
      <div class="matrix-country-chips">
        <span
          v-for="c in selectedCountries"
          :key="c.code"
          class="country-chip"
          :style="{ borderColor: countryColorMap[c.code] }"
        >
          <span class="chip-dot" :style="{ background: countryColorMap[c.code] }" />
          {{ c.name }}
          <button class="chip-remove" @click="removeCountry(c.code)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </span>
        <span v-if="selectedCountries.length === 0" class="no-country-hint">
          从下方列表中选择国家进行对比
        </span>
      </div>
    </div>

    <!-- 国家选择器 -->
    <div class="country-selector">
      <span class="selector-label">对比国家</span>
      <div class="selector-chips">
        <button
          v-for="country in availableCountries"
          :key="country.code"
          class="selector-chip"
          :class="{
            'selector-chip--selected': isSelected(country.code),
            'selector-chip--disabled': !isSelected(country.code) && selectedCountries.length >= 3
          }"
          :style="isSelected(country.code) ? { borderColor: countryColorMap[country.code], background: countryColorMap[country.code] + '18' } : {}"
          @click="toggleCountry(country)"
        >
          <span v-if="isSelected(country.code)" class="selector-check">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          {{ country.name }}
        </button>
      </div>
      <span class="selector-count">{{ selectedCountries.length }}/3</span>
    </div>

    <!-- 对比矩阵表格 -->
    <div class="matrix-table-wrapper" v-if="selectedCountries.length > 0">
      <table class="matrix-table">
        <thead>
          <tr class="matrix-thead-row">
            <th class="th-row-header" style="width: 120px">指标</th>
            <th
              v-for="country in selectedCountries"
              :key="country.code"
              class="th-country"
              :style="{ color: countryColorMap[country.code], width: '160px' }"
            >
              <div class="th-country-inner">
                <span class="th-country-flag">{{ countryFlagEmoji(country.code) }}</span>
                <span class="th-country-name">{{ country.name }}</span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- Share 行 -->
          <tr class="matrix-data-row matrix-row-share">
            <td class="td-row-label">Share</td>
            <td
              v-for="country in selectedCountries"
              :key="country.code"
              class="td-value td-value--center"
            >
              <span class="share-cell">
                <svg class="share-ring" width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" stroke-width="4" />
                  <circle
                    cx="18" cy="18" r="14"
                    fill="none"
                    :stroke="countryColorMap[country.code]"
                    stroke-width="4"
                    stroke-linecap="round"
                    :stroke-dasharray="`${getCountrySharePct(country.code) * 0.88} 88`"
                    transform="rotate(-90 18 18)"
                  />
                  <text x="18" y="18" text-anchor="middle" dominant-baseline="central" class="share-text">
                    {{ getCountryShare(country.code) }}%
                  </text>
                </svg>
              </span>
            </td>
          </tr>

          <!-- ASP 行 -->
          <tr class="matrix-data-row">
            <td class="td-row-label">ASP</td>
            <td
              v-for="country in selectedCountries"
              :key="country.code"
              class="td-value td-value--center"
            >
              <span class="cell-currency">{{ formatCurrency(getMarketASP(country.code)) }}</span>
            </td>
          </tr>

          <!-- Units 行 -->
          <tr class="matrix-data-row">
            <td class="td-row-label">Units</td>
            <td
              v-for="country in selectedCountries"
              :key="country.code"
              class="td-value td-value--center"
            >
              <span class="cell-number">{{ formatUnits(getMarketUnits(country.code)) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- AI Perspective -->
    <div class="ai-perspective" v-if="selectedCountries.length > 0">
      <div class="ai-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        AI Perspective
      </div>
      <div class="ai-body">
        <p class="ai-text">
          {{ aiPerspectiveText }}
        </p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="selectedCountries.length === 0" class="matrix-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
      <p>从下方列表中选择国家进行对比</p>
      <span>最多支持同时对比 3 个国家</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CountryKPI {
  units: number
  value: number
  asp: number
  active_models: number
}

interface CompareCountry {
  code: string
  name: string
  kpi: CountryKPI
  spec_data?: Record<string, any>
  trend?: { periods: string[]; units: number[] }
}

interface Props {
  countries: CompareCountry[]
  availableCountries: Array<{ code: string; name: string; units: number; value: number; asp: number }>
  selectedCountries?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedCountries: () => [],
})

const emit = defineEmits<{
  (e: 'update:selectedCountries', codes: string[]): void
}>()

// ─── Country Selection ───────────────────────────────────────────────────────

const COUNTRY_COLORS = ['#2563eb', '#9333ea', '#d97706']
const countryColorMap: Record<string, string> = {}

function assignCountryColors() {
  props.availableCountries.forEach((c, i) => {
    countryColorMap[c.code] = COUNTRY_COLORS[i % COUNTRY_COLORS.length]
  })
}
assignCountryColors()
watch(() => props.availableCountries, assignCountryColors, { deep: true })

// 内部选中状态：初始从 prop 同步
const selectedCodes = ref<string[]>([...props.selectedCountries])

// 外部 prop 变化时同步内部状态
watch(
  () => props.selectedCountries,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(selectedCodes.value)) {
      selectedCodes.value = [...newVal]
    }
  }
)

const selectedCountries = computed(() =>
  props.countries.filter(c => selectedCodes.value.includes(c.code))
)

function isSelected(code: string) {
  return selectedCodes.value.includes(code)
}

function toggleCountry(country: { code: string; name: string }) {
  const exists = selectedCodes.value.includes(country.code)
  if (exists) {
    selectedCodes.value = selectedCodes.value.filter(c => c !== country.code)
  } else {
    if (selectedCodes.value.length >= 3) return
    selectedCodes.value = [...selectedCodes.value, country.code]
  }
  emit('update:selectedCountries', selectedCodes.value)
}

function removeCountry(code: string) {
  selectedCodes.value = selectedCodes.value.filter(c => c !== code)
  emit('update:selectedCountries', selectedCodes.value)
}

function getCountryShare(code: string): string {
  const country = props.availableCountries.find(c => c.code === code)
  if (!country) return '0.0'
  const totalUnits = props.availableCountries.reduce((sum, c) => sum + c.units, 0)
  if (totalUnits === 0) return '0.0'
  return ((country.units / totalUnits) * 100).toFixed(1)
}

function getCountrySharePct(code: string): number {
  const country = props.availableCountries.find(c => c.code === code)
  if (!country) return 0
  const totalUnits = props.availableCountries.reduce((sum, c) => sum + c.units, 0)
  if (totalUnits === 0) return 0
  return (country.units / totalUnits) * 100
}

// ─── Market Data Access ──────────────────────────────────────────────────────

function getMarketASP(code: string): number {
  return props.countries.find(c => c.code === code)?.kpi?.asp ?? 0
}

function getMarketUnits(code: string): number {
  return props.countries.find(c => c.code === code)?.kpi?.units ?? 0
}

// ─── Formatting ─────────────────────────────────────────────────────────────

function formatCurrency(val: number): string {
  if (!val) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)
}

function formatUnits(val: number): string {
  if (!val) return '—'
  return val.toLocaleString('en-US')
}

// ─── AI Perspective ─────────────────────────────────────────────────────────

const aiPerspectiveText = computed(() => {
  if (selectedCountries.value.length === 0) return ''
  if (selectedCountries.value.length === 1) {
    const c = selectedCountries.value[0]
    return `${c.name} 市场以 ASP $${getMarketASP(c.code).toFixed(0)} 领先，${getCountryShare(c.code)}% 市场份额。`
  }

  const sorted = [...selectedCountries.value].sort((a, b) => b.kpi.units - a.kpi.units)
  const top = sorted[0]
  const others = sorted.slice(1)

  const insights: string[] = []
  insights.push(`${top.name} 以 ${getCountryShare(top.code)}% 市场份额领先市场。`)

  const topASP = getMarketASP(top.code)
  for (const c of others) {
    const asp = getMarketASP(c.code)
    if (asp > topASP) {
      insights.push(`${c.name} ASP 较高 ($${asp.toFixed(0)})，定位高端市场。`)
    } else if (topASP / asp > 1.2) {
      insights.push(`${c.name} ASP 较低 ($ ${asp.toFixed(0)})，主打性价比。`)
    }
  }

  return insights.join(' ')
})

// ─── Country Flag Emoji ─────────────────────────────────────────────────────

const FLAG_MAP: Record<string, string> = {
  USA: 'US', CHN: 'CN', DEU: 'DE', GBR: 'GB', JPN: 'JP',
  FRA: 'FR', BRA: 'BR', IND: 'IN', CAN: 'CA', AUS: 'AU',
  KOR: 'KR', ITA: 'IT', MEX: 'MX', RUS: 'RU', ESP: 'ES',
  NLD: 'NL', POL: 'PL', TUR: 'TR', IDN: 'ID', SWE: 'SE',
  BEL: 'BE', SGP: 'SG', CHE: 'CH', AUT: 'AT', THA: 'TH',
  SAU: 'SA', ARG: 'AR', NOR: 'NO', ARE: 'AE', ZAF: 'ZA',
  MYS: 'MY', DNK: 'DK', COL: 'CO', PHL: 'PH', VNM: 'VN',
  FIN: 'FI', IRL: 'IE', CZE: 'CZ', PRT: 'PT', EGY: 'EG',
  NZL: 'NZ', IRN: 'IR', ISR: 'IL', GRC: 'GR', PAK: 'PK',
  CHL: 'CL', NGA: 'NG', KAZ: 'KZ', PER: 'PE', UKR: 'UA',
  ROU: 'RO', HUN: 'HU', BGD: 'BD', ECU: 'EC', SVN: 'SI',
  SVK: 'SK', HRV: 'HR', KEN: 'KE', MAR: 'MA', QAT: 'QA',
}

function countryFlagEmoji(code: string): string {
  const cc = FLAG_MAP[code] || code.slice(0, 2).toUpperCase()
  return cc.replace(/./g, c =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  )
}
</script>

<style scoped>
.country-compare-matrix {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Header ── */
.matrix-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(37, 99, 235, 0.04);
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid var(--dt-color-border-light);
}

.matrix-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--dt-text-sm);
  font-weight: 700;
  color: var(--dt-color-text-primary);
  margin: 0;
  white-space: nowrap;
}

.matrix-country-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  flex-wrap: wrap;
}

.country-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 6px;
  border-radius: 20px;
  border: 1.5px solid;
  font-size: var(--dt-text-xs);
  font-weight: 600;
  background: #fff;
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  padding: 0;
  border-radius: 50%;
  transition: opacity 0.1s;
}
.chip-remove:hover { opacity: 1; }

.no-country-hint {
  font-size: var(--dt-text-xs);
  color: var(--dt-color-text-muted);
  font-style: italic;
}

/* ── Country Selector ── */
.country-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--dt-color-bg-surface);
  border-bottom: 1px solid var(--dt-color-border-light);
}

.selector-label {
  font-size: var(--dt-text-xs);
  font-weight: 600;
  color: var(--dt-color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.selector-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.selector-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1.5px solid var(--dt-color-border);
  background: transparent;
  font-size: var(--dt-text-xs);
  font-weight: 500;
  color: var(--dt-color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.selector-chip:hover:not(.selector-chip--disabled) {
  border-color: var(--dt-color-primary);
  color: var(--dt-color-primary);
}

.selector-chip--selected {
  font-weight: 600;
  border-width: 1.5px;
}

.selector-chip--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.selector-check {
  display: flex;
  align-items: center;
}

.selector-count {
  font-size: var(--dt-text-xs);
  font-weight: 600;
  color: var(--dt-color-text-muted);
  white-space: nowrap;
}

/* ── Matrix Table ── */
.matrix-table-wrapper {
  overflow-x: auto;
  background: var(--dt-color-bg-surface);
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--dt-text-xs);
  table-layout: fixed;
}

.matrix-table thead th {
  background: var(--dt-color-bg-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 10px 16px;
  border-bottom: 1px solid var(--dt-color-border);
  border-right: 1px solid var(--dt-color-border-light);
  white-space: nowrap;
}

.th-row-header {
  text-align: left !important;
  color: var(--dt-color-text-secondary) !important;
  border-right: none !important;
}

.th-country {
  text-align: center !important;
}

.th-country-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.th-country-flag {
  font-size: 20px;
  line-height: 1;
}

.th-country-name {
  font-size: 12px;
  font-weight: 700;
}

/* Data rows */
.matrix-data-row {
  transition: background 0.1s;
}
.matrix-data-row:hover {
  background: rgba(0, 0, 0, 0.01);
}

.matrix-row-share {
  background: rgba(37, 99, 235, 0.02);
}

.td-row-label {
  padding: 12px 16px;
  color: var(--dt-color-text-secondary);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--dt-color-border-light);
  border-right: none;
}

.td-value {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--dt-color-border-light);
  border-right: 1px solid var(--dt-color-border-light);
  vertical-align: middle;
}

.td-value--center {
  text-align: center;
}

/* Share ring */
.share-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.share-ring {
  display: block;
}

.share-text {
  font-size: 8px;
  font-weight: 700;
  fill: var(--dt-color-text-primary);
  font-family: var(--dt-font-sans, inherit);
}

/* Cell value styles */
.cell-currency {
  font-weight: 700;
  color: var(--dt-color-text-primary);
  font-variant-numeric: tabular-nums;
}

.cell-number {
  font-weight: 600;
  color: var(--dt-color-text-primary);
  font-variant-numeric: tabular-nums;
}

/* ── AI Perspective ── */
.ai-perspective {
  background: var(--dt-color-bg-surface);
  border-top: 1px solid var(--dt-color-border);
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(37, 99, 235, 0.06);
  border-bottom: 1px solid var(--dt-color-border-light);
  font-size: var(--dt-text-xs);
  font-weight: 700;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ai-body {
  padding: 14px 16px;
}

.ai-text {
  margin: 0;
  font-size: var(--dt-text-xs);
  color: var(--dt-color-text-secondary);
  line-height: 1.7;
}

/* ── Empty State ── */
.matrix-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 12px;
  background: var(--dt-color-bg-surface);
}

.matrix-empty p {
  font-size: var(--dt-text-sm);
  color: var(--dt-color-text-secondary);
  margin: 0;
}

.matrix-empty span {
  font-size: var(--dt-text-xs);
  color: var(--dt-color-text-muted);
}
</style>
