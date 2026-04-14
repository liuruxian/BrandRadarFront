# 回退防护层 (Anti-Regression)

> 自动覆盖违规样式，确保新 UI 标准不被破坏

---

## 系统定位

```
目标: 防止页面中新写的样式破坏 v5 设计系统

原理: 使用更高优先级的全局 CSS 选择器，覆盖违规样式

适用场景:
- 临时快速开发时的样式兜底
- 第三方组件库的样式覆盖
- 历史遗留代码的渐进式改造
- 确保新增代码不会破坏系统标准
```

---

## 文件结构

```
src/styles/anti-regression/
 ├── anti-base.css      ← 基础背景反制
 ├── anti-card.css      ← 卡片风格反制
 ├── anti-table.css     ← 表格风格反制
 ├── anti-button.css    ← 按钮风格反制
 ├── anti-naive.css     ← Naive UI 覆盖
 ├── anti-chart.css     ← ECharts 覆盖
 └── anti-index.css     ← 统一导出
```

---

## anti-base.css — 基础背景反制

```css
/**
 * 基础背景反制规则
 * 防止页面中出现纯白背景、错误背景色
 */

/* 全局背景 */
html,
body,
#app,
.app-layout,
.page-container,
.view-container {
  background: var(--bg-base) !important;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(102,126,234,0.08), transparent 45%),
    radial-gradient(circle at 85% 30%, rgba(118,75,162,0.06), transparent 45%),
    radial-gradient(circle at 50% 90%, rgba(59,130,246,0.04), transparent 50%) !important;
}

/* 禁止纯白背景 */
.page-container,
.view-wrapper,
.content-wrapper,
.card-body,
.panel-body {
  background: var(--bg-glass) !important;
}

/* 禁止深色/错误背景 */
.main-content,
.sidebar-content,
.topbar-content {
  background: var(--bg-glass) !important;
}
```

---

## anti-card.css — 卡片风格反制

```css
/**
 * 卡片风格反制规则
 * 确保所有卡片使用玻璃设计标准
 */

/* 通用卡片 */
.card,
.ui-card,
.g-card,
.panel-card,
.data-card,
.kpi-card,
.stat-card {
  background: var(--bg-glass) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--card-shadow) !important;
  transition: var(--transition) !important;
}

/* 卡片 hover */
.card:hover,
.ui-card:hover,
.g-card:hover,
.panel-card:hover,
.data-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: var(--card-shadow-hover) !important;
  border-color: var(--border-primary) !important;
}

/* 禁止非玻璃卡片 */
.plain-card,
.solid-card,
.white-card {
  background: var(--bg-glass) !important;
}

/* 禁止粗边框卡片 */
.card-thick-border,
.card-solid-border {
  border: 1px solid var(--border) !important;
}

/* 禁止无圆角卡片 */
.card-no-radius {
  border-radius: var(--radius-lg) !important;
}
```

---

## anti-table.css — 表格风格反制

```css
/**
 * 表格风格反制规则
 * 确保所有表格使用 v5 设计标准
 */

/* 表格容器 */
.table-container,
.table-wrapper,
.data-table-container {
  background: var(--bg-glass) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-lg) !important;
  overflow: hidden !important;
}

/* 表格基础 */
table,
.data-table,
.ui-table {
  width: 100% !important;
  border-collapse: collapse !important;
}

/* 表头 */
table thead th,
.data-table th,
.ui-table th {
  background: #FAFBFF !important;
  color: var(--text-muted) !important;
  font-size: var(--text-xs) !important;
  font-weight: var(--font-semibold) !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid var(--border) !important;
  text-align: left !important;
}

/* 单元格 */
table td,
.data-table td,
.ui-table td {
  padding: 12px 16px !important;
  font-size: var(--text-sm) !important;
  color: var(--text-secondary) !important;
  border-bottom: 1px solid var(--border-subtle) !important;
}

/* 行 hover */
table tbody tr:hover,
.data-table tbody tr:hover,
.ui-table tbody tr:hover {
  background: rgba(102, 126, 234, 0.04) !important;
}

/* 禁止斑马纹表格 */
.table-striped tbody tr:nth-child(even) {
  background: transparent !important;
}

/* 禁止粗边框表格 */
.table-bordered {
  border: 1px solid var(--border) !important;
}

.table-bordered td,
.table-bordered th {
  border: none !important;
}

/* 表格 hover 样式统一 */
table tbody tr {
  transition: background var(--transition) !important;
  cursor: pointer !important;
}

/* 空状态 */
.table-empty,
.data-empty {
  text-align: center !important;
  padding: 48px !important;
  color: var(--text-muted) !important;
}
```

---

## anti-button.css — 按钮风格反制

```css
/**
 * 按钮风格反制规则
 * 确保所有按钮使用 v5 设计标准
 */

/* 主按钮 */
.btn-primary,
.btn-main,
.button-primary,
.ui-btn-primary {
  background: var(--gradient) !important;
  color: white !important;
  border-radius: var(--radius-button) !important;
  box-shadow: 0 8px 20px rgba(102,126,234,0.25) !important;
  transition: var(--transition) !important;
  font-family: var(--font-sans) !important;
  font-weight: var(--font-semibold) !important;
}

.btn-primary:hover,
.button-primary:hover,
.ui-btn-primary:hover {
  transform: translateY(-2px) scale(1.01) !important;
  box-shadow: 0 14px 30px rgba(102,126,234,0.30) !important;
}

/* 次按钮 */
.btn-secondary,
.btn-outline,
.button-secondary {
  background: var(--bg-glass) !important;
  border: 1px solid var(--border-primary) !important;
  color: var(--primary) !important;
  border-radius: var(--radius-button) !important;
  transition: var(--transition) !important;
}

.btn-secondary:hover,
.button-secondary:hover {
  background: var(--primary-soft) !important;
}

/* Ghost 按钮 */
.btn-ghost,
.btn-text {
  background: transparent !important;
  border: 1px solid var(--border) !important;
  color: var(--text-secondary) !important;
  border-radius: var(--radius-button) !important;
  transition: var(--transition) !important;
}

.btn-ghost:hover,
.btn-text:hover {
  background: var(--primary-soft) !important;
  border-color: var(--border-primary) !important;
  color: var(--primary) !important;
}

/* 禁止无圆角按钮 */
.btn-no-radius {
  border-radius: var(--radius-button) !important;
}

/* 禁止硬边框按钮 */
.btn-solid-border {
  border: 1px solid var(--border) !important;
}

/* 禁止默认按钮样式 */
button,
input[type="button"],
input[type="submit"],
.btn {
  font-family: var(--font-sans) !important;
}
```

---

## anti-naive.css — Naive UI 覆盖

```css
/**
 * Naive UI 组件风格覆盖
 * 将 Naive UI 组件统一为 v5 设计标准
 */

/* ─── N-Button 覆盖 ─── */

.n-button {
  border-radius: var(--radius-button) !important;
  font-family: var(--font-sans) !important;
  transition: var(--transition) !important;
}

.n-button--primary-type {
  background: var(--gradient) !important;
  box-shadow: 0 8px 20px rgba(102,126,234,0.25) !important;
}

.n-button--primary-type:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 14px 30px rgba(102,126,234,0.30) !important;
}

.n-button--default-type {
  background: var(--bg-glass) !important;
  border: 1px solid var(--border) !important;
  backdrop-filter: blur(12px) !important;
}

.n-button--default-type:hover {
  border-color: var(--border-primary) !important;
  background: var(--primary-soft) !important;
}

/* ─── N-Card 覆盖 ─── */

.n-card {
  background: var(--bg-glass) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--card-shadow) !important;
  transition: var(--transition) !important;
}

.n-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: var(--card-shadow-hover) !important;
}

.n-card-header {
  border-bottom: 1px solid var(--border) !important;
}

/* ─── N-DataTable 覆盖 ─── */

.n-data-table {
  background: var(--bg-glass) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-lg) !important;
  overflow: hidden !important;
}

.n-data-table-th {
  background: #FAFBFF !important;
  color: var(--text-muted) !important;
  font-size: var(--text-xs) !important;
}

.n-data-table-td {
  color: var(--text-secondary) !important;
  border-bottom: 1px solid var(--border-subtle) !important;
}

.n-data-table-tr:hover {
  background: rgba(102, 126, 234, 0.04) !important;
}

/* ─── N-Input 覆盖 ─── */

.n-input {
  border-radius: var(--radius-input) !important;
  background: var(--bg-base) !important;
  border: 1px solid var(--border) !important;
  transition: var(--transition) !important;
}

.n-input:hover {
  border-color: var(--border-strong) !important;
}

.n-input:focus {
  border-color: var(--primary) !important;
  box-shadow: var(--glow-primary) !important;
}

/* ─── N-Modal 覆盖 ─── */

.n-modal-mask {
  background: rgba(15, 23, 42, 0.3) !important;
  backdrop-filter: blur(6px) !important;
}

.n-modal {
  background: var(--bg-soft) !important;
  border-radius: var(--radius-modal) !important;
  box-shadow: var(--modal-shadow) !important;
}

/* ─── N-Tag 覆盖 ─── */

.n-tag {
  border-radius: var(--radius-badge) !important;
  font-size: var(--text-xs) !important;
  font-weight: var(--font-medium) !important;
}

/* ─── N-Select 覆盖 ─── */

.n-base-selection {
  border-radius: var(--radius-input) !important;
  background: var(--bg-base) !important;
  border: 1px solid var(--border) !important;
  transition: var(--transition) !important;
}

.n-base-selection:hover {
  border-color: var(--border-strong) !important;
}

/* ─── N-Tooltip 覆盖 ─── */

.n-tooltip {
  background: rgba(255, 255, 255, 0.88) !important;
  backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(102, 126, 234, 0.25) !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 40px rgba(102, 126, 234, 0.2) !important;
}
```

---

## anti-chart.css — ECharts 覆盖

```css
/**
 * ECharts 图表风格覆盖
 * 确保所有图表使用 v5 设计标准
 */

/* ─── 图表容器 ─── */

.echarts-container,
.chart-container,
[data-chart-type] {
  background: transparent !important;
}

/* ─── Tooltip 覆盖 ─── */

.echarts-tooltip,
div[style*="echarts"] {
  background: rgba(255, 255, 255, 0.88) !important;
  backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(102, 126, 234, 0.25) !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 40px rgba(102, 126, 234, 0.2) !important;
}

/* ─── Legend 覆盖 ─── */

.echarts-legend {
  font-family: var(--font-sans) !important;
  font-size: 12px !important;
  color: var(--text-secondary) !important;
}

/* ─── 禁止默认背景 ─── */

.echarts,
canvas {
  background: transparent !important;
}
```

---

## anti-index.css — 统一导出

```css
/**
 * BrandRadar UI v5 — Anti-Regression 层
 * 统一引入所有反制规则
 */

/* 引入顺序很重要：基础 → 组件 → 第三方 */

@import './anti-base.css';
@import './anti-card.css';
@import './anti-table.css';
@import './anti-button.css';
@import './anti-chart.css';
@import './anti-naive.css';
```

---

## 使用方式

在 `src/styles/main.css` 中引入：

```css
/* Design Tokens */
@import './styles/tokens/tokens.colors.css';
@import './styles/tokens/tokens.typography.css';
@import './styles/tokens/tokens.spacing.css';
@import './styles/tokens/tokens.motion.css';
@import './styles/tokens/tokens.shadow.css';
@import './styles/tokens/tokens.radius.css';

/* Anti-Regression */
@import './styles/anti-regression/anti-index.css';
```

---

## 防护规则清单

| 规则 ID | 检测目标 | 反制动作 | 优先级 |
|---------|---------|---------|--------|
| AR-001 | `background: #FFFFFF` | 强制覆盖为 `--bg-base` | 高 |
| AR-002 | `box-shadow: 0 1px 3px...` | 强制覆盖为玻璃阴影 | 高 |
| AR-003 | 无 `transition` | 强制补充 200ms 动效 | 中 |
| AR-004 | 无 `border-radius` | 强制补充标准圆角 | 中 |
| AR-005 | `n-data-table` 白底 | 覆盖为玻璃底 | 高 |
| AR-006 | Naive Button 默认色 | 覆盖为品牌渐变 | 中 |
| AR-007 | ECharts 默认 tooltip | 覆盖为玻璃卡片 | 中 |
| AR-008 | 表格斑马纹 | 禁用斑马纹 | 低 |

---

## 注意事项

```
1. Anti-Regression 层使用 !important 确保优先级
2. 仅作为兜底方案，不应依赖它编写正确样式
3. 新增组件应直接使用 Base 组件和令牌变量
4. 第三方组件库样式通过 anti-naive.css 统一覆盖
5. 随着系统成熟，可以逐步移除不必要的反制规则
```
