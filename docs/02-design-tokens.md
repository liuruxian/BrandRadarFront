# 设计令牌 (Design Tokens)

> 所有颜色、间距、动效、阴影全部抽离为 CSS 变量，禁止硬编码。

---

## 文件结构

```
src/styles/tokens/
 ├── tokens.colors.css     ← 色彩令牌
 ├── tokens.typography.css ← 字体令牌
 ├── tokens.spacing.css    ← 间距令牌
 ├── tokens.motion.css     ← 动效令牌
 ├── tokens.shadow.css     ← 阴影令牌
 └── tokens.index.css      ← 统一导出
```

---

## 色彩令牌 (tokens.colors.css)

```css
:root {

  /* ================= 背景色 ================= */
  --bg-base: #F6F8FC;           /* 主背景 */
  --bg-soft: #FFFFFF;            /* 柔和背景 */
  --bg-glass: rgba(255,255,255,0.72);     /* 玻璃背景 */
  --bg-glass-hover: rgba(255,255,255,0.85); /* 玻璃悬停 */

  /* ================= 品牌色 ================= */
  --primary: #667EEA;           /* 品牌紫 */
  --primary-light: #818CF8;      /* 品牌紫亮 */
  --secondary: #764BA2;          /* 品牌蓝紫 */
  --accent: #A855F7;             /* 扩展紫 */
  --gradient: linear-gradient(135deg, #667EEA, #764BA2); /* 品牌渐变 */

  /* ================= 语义色 ================= */
  --success: #10B981;           /* 增长/正向 */
  --success-soft: rgba(16,185,129,0.10);
  --danger: #EF4444;            /* 下跌/负向 */
  --danger-soft: rgba(239,68,68,0.10);
  --warning: #F59E0B;           /* 波动/警示 */
  --warning-soft: rgba(245,158,11,0.10);
  --info: #3B82F6;             /* 信息/辅助 */
  --info-soft: rgba(59,130,246,0.10);

  /* ================= 文字色 ================= */
  --text-primary: #0F172A;       /* 主要文字 */
  --text-secondary: #475569;     /* 次要文字 */
  --text-muted: #94A3B8;        /* 弱化文字 */
  --text-inverse: #FFFFFF;       /* 反色文字 */

  /* ================= 边框色 ================= */
  --border: rgba(15,23,42,0.06);       /* 默认边框 */
  --border-strong: rgba(15,23,42,0.12);  /* 强调边框 */
  --border-subtle: rgba(15,23,42,0.04);  /* 淡化边框 */
  --border-primary: rgba(102,126,234,0.25); /* 品牌边框 */

  /* ================= 图表色板 ================= */
  --chart-1: #667EEA;   /* 核心色 */
  --chart-2: #22D3EE;   /* 辅助色 */
  --chart-3: #10B981;   /* 成功色 */
  --chart-4: #EF4444;   /* 危险色 */
  --chart-5: #F59E0B;   /* 警告色 */
  --chart-6: #A855F7;   /* 强调色 */
  --chart-7: #94A3B8;   /* 中性色 */
  --chart-8: #818CF8;   /* 品牌扩展 */

  --chart-9:  #6B7280;
  --chart-10: #34D399;
  --chart-11: #FCD34D;
  --chart-12: #FCA5A5;

  /* ================= 专用语义色 ================= */
  --primary-soft: rgba(102,126,234,0.10);
  --secondary-soft: rgba(34,211,238,0.10);
  --accent-soft: rgba(168,85,247,0.10);

}
```

---

## 字体令牌 (tokens.typography.css)

```css
:root {

  /* ================= 字体家族 ================= */
  --font-sans: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  /* ================= 字体大小 ================= */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.8125rem;   /* 13px */
  --text-base: 0.875rem;  /* 14px */
  --text-lg: 1rem;        /* 16px */
  --text-xl: 1.125rem;    /* 18px */
  --text-2xl: 1.25rem;    /* 20px */
  --text-3xl: 1.5rem;     /* 24px */
  --text-4xl: 1.875rem;   /* 30px */

  /* ================= 字体粗细 ================= */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ================= 行高 ================= */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* ================= 字间距 ================= */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;

}
```

---

## 间距令牌 (tokens.spacing.css)

```css
:root {

  /* ================= 基础间距 ================= */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* ================= 布局间距 ================= */
  --layout-padding: 24px;      /* 桌面内边距 */
  --layout-padding-sm: 16px;    /* 移动内边距 */
  --layout-gap: 24px;           /* 栅格间距 */
  --layout-gap-sm: 16px;         /* 紧凑间距 */

  /* ================= Sidebar ================= */
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 64px;

  /* ================= Topbar ================= */
  --topbar-height: 60px;

  /* ================= 卡片间距 ================= */
  --card-gap: 24px;
  --card-padding: 16px;
  --card-padding-lg: 24px;

}
```

---

## 动效令牌 (tokens.motion.css)

```css
:root {

  /* ================= 缓动函数 ================= */
  --ease: cubic-bezier(0.4, 0, 0.2, 1);           /* 标准缓动 */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);          /* 进入缓动 */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);         /* 退出缓动 */
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* 弹性缓动 */

  /* ================= 持续时间 ================= */
  --duration-fast: 100ms;       /* 快速（用于微交互） */
  --duration-normal: 200ms;     /* 标准（用于 hover/focus） */
  --duration-slow: 300ms;      /* 慢速（用于展开/收起） */
  --duration-chart: 800ms;      /* 图表动画（ECharts 专用） */

  /* ================= 统一过渡 ================= */
  --transition: all var(--duration-normal) var(--ease);

}
```

---

## 阴影令牌 (tokens.shadow.css)

```css
:root {

  /* ================= 基础阴影系统 ================= */
  --shadow-sm: 0 2px 8px rgba(15,23,42,0.04);
  --shadow-md: 0 8px 24px rgba(15,23,42,0.06);
  --shadow-lg: 0 16px 40px rgba(15,23,42,0.10);
  --shadow-xl: 0 24px 60px rgba(15,23,42,0.15);

  /* ================= Glow 系统（三层分级） ================= */
  /* Soft Glow — 背景呼吸（Base Layer） */
  --glow-soft: 0 0 20px rgba(102,126,234,0.10);

  /* Active Glow — hover 激活（Mid Layer） */
  --glow-active: 0 0 40px rgba(102,126,234,0.25);

  /* Core Glow — 选中/核心数据（Glow Layer） */
  --glow-core: 0 0 80px rgba(34,211,238,0.35);

  /* ================= 品牌 Glow ================= */
  --glow-primary: 0 0 20px rgba(102,126,234,0.18);
  --glow-primary-strong: 0 0 40px rgba(118,75,162,0.20);
  --glow-success: 0 0 20px rgba(16,185,129,0.18);
  --glow-danger: 0 0 20px rgba(239,68,68,0.18);
  --glow-warning: 0 0 20px rgba(245,158,11,0.18);

  /* ================= 卡片阴影 ================= */
  --card-shadow: 0 2px 8px rgba(15,23,42,0.04);
  --card-shadow-hover: 0 8px 24px rgba(15,23,42,0.08), 0 0 20px rgba(102,126,234,0.10);

  /* ================= 弹窗阴影 ================= */
  --modal-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 40px rgba(102,126,234,0.20);

}
```

---

## 圆角令牌 (tokens.radius.css)

```css
:root {

  /* ================= 圆角系统 ================= */
  --radius-sm: 6px;     /* 小圆角 */
  --radius-md: 10px;     /* 中圆角 */
  --radius-lg: 14px;    /* 大圆角 */
  --radius-xl: 20px;    /* 超大圆角 */
  --radius-full: 9999px; /* 全圆角 */

  /* ================= 组件专用 ================= */
  --radius-button: 10px;     /* 按钮 */
  --radius-input: 10px;       /* 输入框 */
  --radius-card: 14px;       /* 卡片 */
  --radius-badge: 999px;     /* 徽章/标签 */
  --radius-modal: 16px;      /* 弹窗 */
  --radius-chart: 6px;        /* 图表柱形 */

}
```

---

## 令牌命名规范

```
格式: --[category]-[variant]-[state]

层级:
1. category — 类别（bg/text/border/shadow 等）
2. variant — 变体（primary/secondary/success 等）
3. state — 状态（hover/active/disabled 等，可选）

示例:
--bg-base              ← 背景-基础
--bg-glass             ← 背景-玻璃
--card-hover           ← 卡片-悬停
--text-primary         ← 文字-主要
--border-strong        ← 边框-强
--glow-active          ← 光效-激活
--success-soft         ← 成功-柔和
```

---

## 使用方式

```vue
<template>
  <div class="card">
    <h3 class="card-title">{{ title }}</h3>
    <p class="card-desc">{{ description }}</p>
  </div>
</template>

<style scoped>
.card {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: var(--card-padding);
  box-shadow: var(--card-shadow);
  transition: var(--transition);
}

.card:hover {
  box-shadow: var(--card-shadow-hover);
  border-color: var(--border-primary);
  transform: translateY(-2px);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.card-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-normal);
}
</style>
```

---

## 图表示例

```vue
<script setup lang="ts">
import { CHART_COLORS, DataSemantic } from '@/const/chartSemantics'

// 使用语义色
const color = DataSemantic.success  // #10B981 — 增长
const color2 = DataSemantic.danger   // #EF4444 — 下跌
const color3 = DataSemantic.primary  // #667EEA — 核心

// 使用色板
const chartColor = CHART_COLORS[0]  // #667EEA
</script>
```

---

## 全局引入

在 `src/styles/main.css` 中引入所有令牌：

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
