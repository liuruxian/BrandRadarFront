# 布局系统 (Layout System)

> 统一的页面骨架结构：Sidebar + Topbar + Content 三件套

---

## 系统定位

```
目标: 全系统统一布局结构，所有页面共享同一套骨架

布局风格: Aceternity Enterprise Light
- 玻璃白 Sidebar
- 玻璃白 Topbar
- 空间感背景（#F6F8FC + 光斑渐变）
```

---

## 布局结构

```
┌──────────────────────────────────────────────────────────────┐
│ AppTopbar (60px, glass, sticky, z-index: 100)                │
├─────────────┬────────────────────────────────────────────────┤
│             │                                                │
│  AppSidebar │           <router-view>                        │
│  (240px,    │           (页面内容区)                          │
│   glass,    │                                                │
│   sticky)   │                                                │
│             │                                                │
│             │                                                │
└─────────────┴────────────────────────────────────────────────┘
```

---

## 文件结构

```
src/components/layout/
 ├── AppLayout.vue          ← 主布局容器
 ├── AppSidebar.vue         ← 侧边栏
 ├── AppTopbar.vue          ← 顶栏
 ├── AppBreadcrumb.vue      ← 面包屑
 └── AppFooter.vue           ← 底栏（可选）
```

---

## AppLayout.vue — 主布局容器

### 设计规范

```
容器最大宽度: 1440px（可选，全宽时无 max-width）
Sidebar 宽度: 240px（可折叠为 64px）
Topbar 高度: 60px
内容区内边距: 24px
```

### 结构代码

```vue
<template>
  <div class="app-layout">
    <!-- Topbar -->
    <AppTopbar
      :collapsed="sidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
    />

    <div class="app-body">
      <!-- Sidebar -->
      <AppSidebar
        :collapsed="sidebarCollapsed"
        :menus="menus"
        :active-menu="currentRoute"
        @menu-click="handleMenuClick"
      />

      <!-- Content -->
      <main class="app-content">
        <div class="app-content-inner">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppTopbar from './AppTopbar.vue'
import AppSidebar from './AppSidebar.vue'

interface MenuItem {
  key: string
  label: string
  icon?: string
  children?: MenuItem[]
}

const props = defineProps<{
  menus: MenuItem[]
}>()

const sidebarCollapsed = ref(false)
const currentRoute = ref('')

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function handleMenuClick(key: string) {
  currentRoute.value = key
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--bg-base);
  background-image:
    radial-gradient(circle at 10% 20%, rgba(102,126,234,0.08), transparent 45%),
    radial-gradient(circle at 85% 30%, rgba(118,75,162,0.06), transparent 45%),
    radial-gradient(circle at 50% 90%, rgba(59,130,246,0.04), transparent 50%);
}

.app-body {
  display: flex;
  padding-top: var(--topbar-height);
}

.app-content {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
}

.app-content-inner {
  padding: var(--layout-padding);
  min-height: calc(100vh - var(--topbar-height));
}
</style>
```

---

## AppTopbar.vue — 顶栏

### 设计规范

```
高度: 60px
背景: rgba(255,255,255,0.72) + backdrop-filter: blur(12px)
边框底: 1px solid rgba(15,23,42,0.06)
定位: sticky top: 0
阴影: var(--shadow-sm)
```

### 视觉结构

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] BrandRadar          [Search]        [Bell] [Avatar] │
└──────────────────────────────────────────────────────────────────┘
```

### 结构代码

```vue
<template>
  <header class="app-topbar">
    <div class="topbar-left">
      <!-- Logo 区域 -->
      <div class="topbar-logo" @click="goHome">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#667EEA" />
                <stop offset="100%" stop-color="#764BA2" />
              </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="14" fill="url(#logoGrad)" />
            <path d="M10 16 L14 20 L22 12" stroke="white" stroke-width="2" fill="none" />
          </svg>
        </div>
        <span class="logo-text">BrandRadar</span>
      </div>

      <!-- 折叠按钮 -->
      <button class="collapse-btn" @click="$emit('toggle-sidebar')">
        <span class="collapse-icon" />
      </button>
    </div>

    <div class="topbar-center">
      <!-- 搜索框（可选） -->
      <div class="topbar-search">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
          <path d="M16 16L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input
          type="text"
          placeholder="搜索品牌、数据..."
          class="search-input"
        />
        <kbd class="search-kbd">⌘K</kbd>
      </div>
    </div>

    <div class="topbar-right">
      <!-- 通知 -->
      <button class="topbar-action">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" />
        </svg>
        <span class="action-badge">3</span>
      </button>

      <!-- 用户头像 -->
      <div class="topbar-avatar">
        <img src="/avatar.jpg" alt="User" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()

defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

function goHome() {
  // router.push('/')
}
</script>

<style scoped>
.app-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  padding: 0 var(--layout-padding);
  gap: var(--space-4);

  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  z-index: 100;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-width: 240px;
}

.topbar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  transition: opacity var(--transition);
}

.topbar-logo:hover {
  opacity: 0.8;
}

.logo-text {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition);
}

.collapse-btn:hover {
  background: var(--primary-soft);
}

.collapse-icon {
  width: 16px;
  height: 2px;
  background: var(--text-secondary);
  position: relative;
  transition: var(--transition);
}

.collapse-icon::before,
.collapse-icon::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 2px;
  background: var(--text-secondary);
  transition: var(--transition);
}

.collapse-icon::before { top: -5px; }
.collapse-icon::after { top: 5px; }

.topbar-center {
  flex: 1;
  max-width: 480px;
}

.topbar-search {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  height: 38px;
  padding: 0 60px 0 38px;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: var(--transition);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  outline: none;
  border-color: var(--border-primary);
  box-shadow: var(--glow-primary);
}

.search-kbd {
  position: absolute;
  right: 10px;
  padding: 2px 6px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: auto;
}

.topbar-action {
  position: relative;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.topbar-action:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.action-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--danger);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: var(--font-bold);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 2px solid var(--border);
  cursor: pointer;
  transition: var(--transition);
}

.topbar-avatar:hover {
  border-color: var(--primary);
}

.topbar-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
```

---

## AppSidebar.vue — 侧边栏

### 设计规范

```
宽度: 240px（展开）/ 64px（折叠）
背景: var(--bg-glass) + backdrop-filter: blur(12px)
边框右: 1px solid var(--border)
定位: sticky top: 60px
高度: calc(100vh - 60px)
```

### 结构代码

```vue
<template>
  <aside class="app-sidebar" :class="{ collapsed }">
    <nav class="sidebar-nav">
      <div
        v-for="menu in menus"
        :key="menu.key"
        class="nav-group"
      >
        <!-- 分组标题（展开时显示） -->
        <div v-if="menu.children && !collapsed" class="nav-group-title">
          {{ menu.label }}
        </div>

        <!-- 菜单项 -->
        <router-link
          v-if="!menu.children"
          :to="menu.key"
          class="nav-item"
          :class="{ active: activeMenu === menu.key }"
        >
          <span v-if="menu.icon" class="nav-icon" v-html="menu.icon" />
          <span v-if="!collapsed" class="nav-label">{{ menu.label }}</span>
        </router-link>

        <!-- 子菜单 -->
        <div v-else class="nav-item has-children" :class="{ active: isActive(menu) }">
          <span v-if="menu.icon" class="nav-icon" v-html="menu.icon" />
          <span v-if="!collapsed" class="nav-label">{{ menu.label }}</span>

          <!-- 子菜单列表 -->
          <div v-if="!collapsed && isActive(menu)" class="nav-children">
            <router-link
              v-for="child in menu.children"
              :key="child.key"
              :to="child.key"
              class="nav-child-item"
              :class="{ active: activeMenu === child.key }"
            >
              {{ child.label }}
            </router-link>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface MenuItem {
  key: string
  label: string
  icon?: string
  children?: MenuItem[]
}

const props = defineProps<{
  menus: MenuItem[]
  activeMenu: string
  collapsed?: boolean
}>()

function isActive(menu: MenuItem): boolean {
  if (!menu.children) return false
  return menu.children.some(child => child.key === props.activeMenu)
}
</script>

<style scoped>
.app-sidebar {
  position: sticky;
  top: var(--topbar-height);
  width: var(--sidebar-width);
  height: calc(100vh - var(--topbar-height));
  flex-shrink: 0;
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  overflow-x: hidden;
  transition: width var(--duration-slow) var(--ease);
  z-index: 50;
}

.app-sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-nav {
  padding: var(--space-4);
}

.nav-group {
  margin-bottom: var(--space-6);
}

.nav-group-title {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  padding: 0 var(--space-3);
  margin-bottom: var(--space-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: var(--transition);
  cursor: pointer;
  position: relative;
}

.nav-item:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.nav-item.active {
  background: var(--primary-soft);
  color: var(--primary);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--gradient);
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-children {
  margin-top: var(--space-2);
  margin-left: var(--space-4);
  border-left: 1px solid var(--border);
  padding-left: var(--space-3);
}

.nav-child-item {
  display: block;
  padding: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}

.nav-child-item:hover,
.nav-child-item.active {
  color: var(--primary);
  background: var(--primary-soft);
}

.collapsed .nav-label {
  display: none;
}

.collapsed .nav-group-title {
  display: none;
}

.collapsed .nav-item {
  justify-content: center;
  padding: var(--space-3);
}

.collapsed .nav-children {
  display: none;
}
</style>
```

---

## 布局配置清单

| 区域 | 令牌 | 默认值 |
|------|------|--------|
| Sidebar 宽度 | `--sidebar-width` | 240px |
| Sidebar 折叠宽度 | `--sidebar-collapsed-width` | 64px |
| Topbar 高度 | `--topbar-height` | 60px |
| 内容区内边距 | `--layout-padding` | 24px |
| 布局最大宽度 | — | 1440px |
| 栅格间距 | `--layout-gap` | 24px |

---

## 响应式断点

```css
/* 桌面（≥1024px） */
@media (min-width: 1024px) {
  .app-sidebar { display: flex; }
  .app-content-inner { padding: var(--layout-padding); }
}

/* 平板（768px - 1023px） */
@media (max-width: 1023px) {
  .app-sidebar { width: var(--sidebar-collapsed-width); }
  .app-content-inner { padding: var(--layout-padding-sm); }
}

/* 移动（< 768px） */
@media (max-width: 767px) {
  .app-sidebar { display: none; }
  .app-content-inner { padding: var(--layout-padding-sm); }
}
```

---

## 页面头部规范 (Page Header)

> 统一所有页面的页面头部样式，包括仪表盘、产品中心、IDC分析模块等

### 设计规范

```
布局风格: IDC 统一风格 (Purple Gradient)
背景: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
圆角: 16px
阴影: 0 4px 16px rgba(102, 126, 234, 0.25)
```

### 规范标准

#### 1. 容器样式 (.idc-header / .page-header)

| 属性 | 值 |
|------|-----|
| display | flex |
| align-items | center |
| justify-content | space-between |
| padding | 20px 24px |
| background | linear-gradient(135deg, #667eea 0%, #764ba2 100%) |
| border-radius | 16px |
| box-shadow | 0 4px 16px rgba(102, 126, 234, 0.25) |
| margin-bottom | 16px |

#### 2. 左侧区域 (.header-left)

| 属性 | 值 |
|------|-----|
| display | flex |
| align-items | center |
| gap | 16px |

#### 3. 图标容器 (.header-icon)

| 属性 | 值 |
|------|-----|
| width | 48px |
| height | 48px |
| display | flex |
| align-items | center |
| justify-content | center |
| background | rgba(255, 255, 255, 0.2) |
| border-radius | 12px |
| backdrop-filter | blur(10px) |
| color | white |

#### 4. 标题区域 (.header-title / .page-title)

| 属性 | 值 |
|------|-----|
| display | flex |
| flex-direction | column (可选) |
| gap | 4px (可选) |

#### 5. 标题文本 (h1)

| 属性 | 值 |
|------|-----|
| font-size | 22px |
| font-weight | 700 |
| color | white |
| margin | 0 |
| line-height | 1.2 |

#### 6. 描述文本 (.header-desc / .page-desc)

| 属性 | 值 |
|------|-----|
| font-size | 13px |
| color | rgba(255, 255, 255, 0.85) |
| margin | 4px 0 0 |

#### 7. 右侧按钮区域 (.header-right / .page-actions)

| 属性 | 值 |
|------|-----|
| display | flex |
| gap | 12px |
| align-items | center |

#### 8. 按钮样式 (.btn-idc / .header-btn)

| 属性 | 值 |
|------|-----|
| padding | 8px 16px |
| font-size | 13px |
| font-weight | 500 |
| background | rgba(255, 255, 255, 0.2) |
| border | 1px solid rgba(255, 255, 255, 0.3) |
| border-radius | 8px |
| backdrop-filter | blur(10px) |
| color | white |
| cursor | pointer |
| transition | all 0.2s ease |

#### 9. 按钮悬停状态

| 属性 | 值 |
|------|-----|
| background | rgba(255, 255, 255, 0.3) |
| border-color | rgba(255, 255, 255, 0.5) |

---

### 模板代码

```vue
<!-- 页面头部 -->
<div class="page-header idc-header">
  <!-- 左侧: 图标 + 标题 -->
  <div class="header-left">
    <div class="header-icon">
      <!-- SVG 图标 -->
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <!-- 图标路径 -->
      </svg>
    </div>
    <div class="header-title">
      <h1>页面标题</h1>
      <p class="header-desc">页面描述文字</p>
    </div>
  </div>
  <!-- 右侧: 操作按钮 -->
  <div class="header-right">
    <button class="btn-idc">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <!-- 图标路径 -->
      </svg>
      按钮文字
    </button>
  </div>
</div>
```

---

### 按钮变体

#### 主按钮 (.btn-idc-primary)

```css
.btn-idc-primary {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  background: #3B82F6;  /* 蓝色主色调 */
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}
```

#### 幽灵按钮 (.btn-idc-ghost)

```css
.btn-idc-ghost {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}
```

---

### 完整CSS代码

```css
/* ==================== 页面头部 (IDC统一风格) ==================== */
.page-header,
.idc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  color: white;
}

.header-title h1,
.page-title h1 {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.2;
}

.header-desc,
.page-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin: 4px 0 0;
}

.header-right,
.page-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-idc,
.header-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.btn-idc:hover,
.header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}
```
