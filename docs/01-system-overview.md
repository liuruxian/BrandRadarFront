# BrandRadar UI v5 Design System

> **Aceternity Enterprise Light SaaS UI System v5**

---

## 系统定位

```
当前状态: 企业后台风格 + 零散 Aceternity 元素

改造目标: Aceternity Enterprise Light SaaS UI System v5

对标产品: Stripe Dashboard + Linear + Vercel Dashboard + Airtable UI
```

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        BrandRadar UI v5                          │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: 设计令牌层 (Design Tokens)              ← 底层锁定       │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: 布局系统层 (Layout System)              ← 骨架重构       │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: 基础组件层 (Base Components)            ← 全部重做       │
├─────────────────────────────────────────────────────────────────┤
│  Layer 4: 数据组件层 (Data Components)            ← 卡片/表格/KPI  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 5: 图表系统层 (Chart Engine v5)            ← 合成引擎       │
├─────────────────────────────────────────────────────────────────┤
│  Layer 6: 回退防护层 (Anti-Regression)             ← 长期保护       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 目录结构

```
BrandRadarFront/
 ├── docs/                          # 设计文档
 │    ├── 01-system-overview.md     # 系统概览
 │    ├── 02-design-tokens.md       # 设计令牌
 │    ├── 03-layout-system.md       # 布局系统
 │    ├── 04-base-components.md      # 基础组件
 │    ├── 05-data-components.md      # 数据组件
 │    ├── 06-chart-system-v5.md     # 图表系统 v5
 │    ├── 07-anti-regression.md      # 回退防护层
 │    └── 08-view-migration.md       # 视图改造指南
 │
 ├── src/
 │    ├── const/
 │    │    ├── chartSemantics.ts     # 数据语义系统
 │    │    └── chartTheme.ts         # 图表主题系统
 │    │
 │    ├── components/
 │    │    ├── base/                 # v5 基础组件库
 │    │    ├── layout/               # 布局组件
 │    │    └── idc/                 # 业务组件（v5）
 │    │
 │    ├── styles/
 │    │    ├── tokens/               # 设计令牌
 │    │    └── anti-regression/       # 回退防护
 │    │
 │    └── views/                     # 视图文件（改造目标）
 │
 └── public/
```

---

## 设计原则

### 核心原则

```
1. 这是企业数据系统，不是展示页
2. Aceternity 只负责"质感"，不负责"夸张"
3. 所有视觉必须服务数据可读性
4. 所有动效必须 ≤ 200ms
5. 所有 glow 必须"辅助强调"，不能装饰化
```

### 设计约束

```
透明度必须控制在 0.6 ~ 0.9
glow 只用于重点，不用于装饰
卡片必须"白为主"
gradient 只用于强调
motion ≤ 200ms
所有 UI 必须可读优先
```

---

## 关键升级点（v4 → v5）

| 维度 | v4 | v5 |
|------|----|----|
| 配色体系 | 硬编码颜色数组 | DataSemantic 语义映射 |
| 图表背景 | transparent | Light Field System 三层光场 |
| 图表交互 | hover 变色 | Focus System 全局分层 |
| Tooltip | glass tooltip | Floating Data Card |
| Glow | 无分层 | Soft / Active / Core 三层分级 |
| 组件体系 | 零散样式 | Base 组件库统一 |
| 布局系统 | 无统一 | AppLayout 玻璃骨架 |
| 防护机制 | 无 | Anti-Regression 自动覆盖 |

---

## 核心技术决策

| 决策点 | 方案 |
|--------|------|
| 组件架构 | 独立 Base 组件覆盖 Naive UI |
| 图表主题 | BaseChartV5 独立合成引擎 |
| CSS 方案 | CSS 令牌 + scoped |
| 深色模式 | 按需支持（theme prop） |
| 动效管理 | CSS 令牌统一管理 |
| 防护机制 | 全局 CSS 选择器覆盖 |

---

## 文档索引

| 文档 | 内容 |
|------|------|
| [设计令牌](./02-design-tokens.md) | 色彩/字体/间距/动效/阴影令牌 |
| [布局系统](./03-layout-system.md) | AppLayout + Sidebar + Topbar |
| [基础组件](./04-base-components.md) | BaseCard/Button/Input/Tag/Badge/Modal |
| [数据组件](./05-data-components.md) | BaseKPICard/BaseTable/BaseStatCard |
| [图表系统 v5](./06-chart-system-v5.md) | 合成引擎 + 语义色 + Focus System |
| [回退防护](./07-anti-regression.md) | 全局覆盖 + 违规检测 |
| [视图改造](./08-view-migration.md) | 各视图改造清单与验收标准 |
