<template>
  <div class="app-layout">
    <!-- 侧边栏：深色主题，参考 image.png -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-text">
          <span class="logo-name">BrandRadar</span>
          <span class="logo-sub">Enterprise Intelligence</span>
        </div>
      </div>

      <!-- 导航 -->
      <nav ref="sidebarNavRef" class="sidebar-nav">
        <!-- 产品中心 -->
        <router-link to="/products" class="nav-item" :class="{active:isProductCenterActive}">
          <span class="nav-icon" v-html="icons.products" />
          <span class="nav-label">产品中心</span>
        </router-link>

        <!-- IDC 市场数据分析 -->
        <router-link to="/idc/overview" class="nav-item" :class="{active:isIDCActive}">
          <span class="nav-icon" v-html="icons.idcOverview" />
          <span class="nav-label">IDC市场数据分析</span>
        </router-link>

        <!-- 运维管理 -->
        <router-link to="/admin/dashboard" class="nav-item" :class="{active:isAdminActive}">
          <span class="nav-icon" v-html="icons.adminDashboard" />
          <span class="nav-label">运维管理</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="main-wrapper">
      <!-- 顶栏 -->
      <header class="topbar">
        <!-- 左侧：页面标题 -->
        <div class="topbar-left">
          <h1 class="topbar-title">{{ currentTitle }}</h1>
        </div>

        <!-- 中间：二级菜单标签栏（仅显示当前一级菜单的子项） -->
        <nav class="topbar-tabs" v-if="currentTopbarTabs.length">
          <div class="topbar-tab-list">
            <template v-for="group in currentTopbarTabs" :key="group.label">
              <router-link
                v-for="tab in group.tabs"
                :key="tab.path"
                :to="tab.path"
                class="topbar-tab"
                :class="{active:isActive(tab.path)}"
              >{{ tab.name }}</router-link>
            </template>
          </div>
        </nav>

        <!-- 右侧：操作按钮 + 用户菜单 -->
        <div class="topbar-right">
          <!-- 刷新按钮（由子页面控制显隐） -->
          <slot name="topbar-actions" />
          <div class="user-menu-wrap">
            <button class="user-trigger" @click="showUserMenu=!showUserMenu">
              <span class="avatar-dot">AI</span>
              <span class="user-name">{{ currentUserName }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div v-if="showUserMenu" class="user-menu" @click.stop>
              <button class="user-menu-item" @click="goQuick('/admin/users')">个人中心</button>
              <button class="user-menu-item" @click="goQuick('/admin/config')">设置</button>
              <button class="user-menu-item danger" @click="handleLogout">退出登录</button>
            </div>
          </div>
        </div>
      </header>

      <!-- 面包屑导航 -->
      <div class="breadcrumb-bar">
        <div class="breadcrumb-left">
          <nav class="breadcrumb" aria-label="面包屑导航">
            <router-link to="/" class="breadcrumb-item">{{ currentSectionName }}</router-link>
            <span class="breadcrumb-sep">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
            <router-link
              v-if="route.path !== '/'"
              :to="route.path"
              class="breadcrumb-item current"
            >{{ currentTitle }}</router-link>
            <span v-else class="breadcrumb-item current">{{ currentTitle }}</span>
          </nav>
        </div>
      </div>

      <!-- 主内容区 -->
      <main class="main-content" ref="mainContentRef" @click="showUserMenu = false">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sidebarNavRef = ref<HTMLElement | null>(null)
const mainContentRef = ref<HTMLElement | null>(null)
const showUserMenu = ref(false)

const isAdminActive = computed(() =>
  route.path.startsWith('/admin/') || route.path.startsWith('/scheduler')
)
const isIDCActive = computed(() =>
  route.path.startsWith('/idc/')
)
const isProductCenterActive = computed(() =>
  route.path === '/' || route.path.startsWith('/products')
)

const productTabs = [
  { name: '产品中心', path: '/' },
  { name: '产品列表', path: '/products' },
  { name: '价格监控', path: '/products/monitor' },
]

const idcTabs = [
  { name: '市场总览', path: '/idc/overview' },
  { name: '市场探索', path: '/idc/explore' },
  { name: '地理分析', path: '/idc/geography' },
  { name: '型号对标', path: '/idc/product' },
  { name: '渠道与价格', path: '/idc/channel' },
  { name: '技术与细分', path: '/idc/tech' },
]
const adminTabs = [
  { name: '系统监控', path: '/admin/dashboard' },
  { name: '调度管理', path: '/scheduler' },
  { name: '用户管理', path: '/admin/users' },
  { name: '会话管理', path: '/admin/sessions' },
  { name: '配置中心', path: '/admin/config' },
  { name: '系统公告', path: '/admin/announce' },
]

const currentTopbarTabs = computed(() => {
  if (route.path === '/' || route.path.startsWith('/products')) return [{ label: '产品中心', tabs: productTabs }]
  if (route.path.startsWith('/idc/')) return [{ label: 'IDC分析', tabs: idcTabs }]
  if (route.path.startsWith('/admin/') || route.path.startsWith('/scheduler')) return [{ label: '运维', tabs: adminTabs }]
  return []
})

watch(() => route.path, () => {
  showUserMenu.value = false
  nextTick(() => scrollToActiveNav())
  if (mainContentRef.value) {
    mainContentRef.value.scrollTop = 0
  }
})

const icons = {
  dashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  products:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  monitor:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  scheduler: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`,
  adminDashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h8V3H3v10zm10 8h8v-6h-8v6zm0-18v8h8V3h-8zM3 21h8v-6H3v6z"/></svg>`,
  adminSessions: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  adminBackup: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  adminConfig: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  adminAnnounce: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  adminUsers: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>`,
  idcOverview: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  idcExplore: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  idcGeo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  idcProduct: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  idcChannel: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  idcTech: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  idcExport: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
}

const parentMenuMap: Record<string, string> = {
  '/': '产品中心',
  '/products': '产品中心',
  '/products/monitor': '产品中心',
  '/idc/': 'IDC市场数据分析',
  '/scheduler': '运维管理',
  '/admin/': '运维管理',
}
const parentMenuName = computed(() => {
  for (const [prefix, name] of Object.entries(parentMenuMap)) {
    if (prefix !== '/' && route.path.startsWith(prefix)) return name
  }
  return parentMenuMap['/'] || ''
})
const currentTitle = computed(() => {
  // 优先从当前激活的标签页中取个体名称
  for (const group of currentTopbarTabs.value) {
    for (const tab of group.tabs) {
      if (isActive(tab.path)) return tab.name
    }
  }
  return parentMenuName.value || 'BrandRadar'
})
const currentSectionName = computed(() => {
  for (const group of currentTopbarTabs.value) {
    for (const tab of group.tabs) {
      if (isActive(tab.path)) return group.label
    }
  }
  return 'BrandRadar'
})
const currentUserName = computed(() => authStore.me?.username || 'Admin')

function canAccess(_path?: string) { return true }

function isActive(p: string) {
  if (p === '/') return route.path === '/'
  if (p === '/products') return route.path === '/products'
  if (p === '/products/monitor') return route.path === '/products/monitor'
  return route.path.startsWith(p)
}

function goQuick(path: string) {
  router.push(path)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
  showUserMenu.value = false
}

async function scrollToActiveNav() {
  await nextTick()
  const container = sidebarNavRef.value
  if (!container) return
  const activeEl = container.querySelector('.nav-item.active') as HTMLElement | null
  if (!activeEl) return
  const containerRect = container.getBoundingClientRect()
  const activeRect = activeEl.getBoundingClientRect()
  const outOfView = activeRect.top < containerRect.top || activeRect.bottom > containerRect.bottom
  if (outOfView) {
    activeEl.scrollIntoView({ behavior: 'auto', block: 'nearest' })
  }
}

onMounted(() => {
  scrollToActiveNav()
})
onUnmounted(() => undefined)
</script>

<style scoped>
/* ══════════════════════════════════════════════════════
   整体布局
   侧边栏: #f8fafc
   主内容区: #f8fafc
   顶栏: #ffffff（与侧边栏同色）
   ══════════════════════════════════════════════════════ */
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--dt-color-bg-base);
  padding: 0;
  gap: 0;
}

/* ─── 侧边栏 ─── */
.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: var(--dt-color-bg-sidebar);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 20;
  overflow: hidden;
  border-right: 1px solid var(--dt-sidebar-border-color);
}

/* Logo 区 */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  padding: 24px 12px 14px 16px;
  flex-shrink: 0;
}
.logo-mark { flex-shrink: 0; }
.logo-text { overflow: hidden; white-space: nowrap; display: flex; flex-direction: column; gap: 2px; }
.logo-name {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: var(--dt-color-text-primary);
  letter-spacing: 0.01em;
  line-height: 1.1;
  font-family: var(--dt-font-sans);
}
.logo-sub {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: var(--dt-color-text-secondary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: var(--dt-font-sans);
}

/* 导航 */
.sidebar-nav {
  flex: 1;
  padding: 22px 10px 11px;
  display: flex;
  flex-direction: column;
  gap: var(--dt-sidebar-nav-gap);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 菜单项 */
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 var(--dt-space-3);
  height: var(--dt-sidebar-item-height);
  border-radius: var(--dt-radius-sm);
  color: var(--dt-sidebar-item-text-default);
  text-decoration: none;
  font-size: var(--dt-text-sm);
  line-height: 1;
  font-weight: var(--dt-weight-medium);
  font-family: var(--dt-font-sans);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all var(--dt-sidebar-transition);
  position: relative;
  cursor: pointer;
  background: transparent;
}
.nav-item:hover {
  color: var(--dt-sidebar-item-text-hover);
  background: var(--dt-sidebar-item-bg-hover);
}
.nav-item.active {
  color: var(--dt-sidebar-item-text-active);
  background: var(--dt-sidebar-item-bg-active);
  font-weight: var(--dt-weight-semibold);
}
.nav-item.active::before {
  display: none;
}
.nav-item.active::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--dt-sidebar-item-border-active);
}
.nav-item.active .nav-icon { color: inherit; }
.nav-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--dt-sidebar-transition);
  color: inherit;
}
.nav-label { flex: 1; }

/* ─── 顶栏 ─── */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  height: 100%;
}

.topbar {
  height: 48px;
  flex-shrink: 0;
  position: relative;
  z-index: 60;
  background: var(--dt-color-bg-surface);
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 24px;
}

.topbar-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.topbar-title {
  font-size: var(--dt-text-lg);
  font-weight: var(--dt-weight-bold);
  color: var(--dt-color-text-primary);
  margin: 0;
  line-height: 1;
  white-space: nowrap;
}

/* ─── topbar 水平标签栏 ─── */
.topbar-tabs {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  overflow: hidden;
  margin-right: auto;
}
.topbar-tab-list {
  display: flex;
  align-items: center;
  gap: 2px;
}
.topbar-tab {
  padding: 4px 10px;
  border-radius: var(--dt-radius-2xl);
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-weight-medium);
  color: var(--dt-color-text-secondary);
  text-decoration: none;
  white-space: nowrap;
  transition: all var(--dt-duration-fast) var(--dt-ease-smooth);
  background: transparent;
}
.topbar-tab:hover {
  color: var(--dt-color-text-primary);
  background: var(--dt-color-bg-muted);
}
.topbar-tab.active {
  color: var(--dt-color-primary);
  background: var(--dt-color-bg-active);
  font-weight: var(--dt-weight-semibold);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 80;
  margin-left: auto;
  flex-shrink: 0;
}

/* ─── 面包屑导航栏 ─── */
.breadcrumb-bar {
  flex-shrink: 0;
  background: var(--dt-color-bg-surface);
  display: flex;
  align-items: center;
  padding: 0 24px;
  min-height: 36px;
  max-height: 40px;
  border-top: 1px solid var(--dt-sidebar-border-color);
  border-bottom: 1px solid var(--dt-sidebar-border-color);
}

.breadcrumb-left {
  display: flex;
  align-items: center;
  width: 100%;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--dt-space-1);
}

.breadcrumb-item {
  font-size: var(--dt-text-sm);
  font-weight: var(--dt-weight-medium);
  color: var(--dt-sidebar-item-text-default);
  text-decoration: none;
  transition: color var(--dt-duration-fast) var(--dt-ease-smooth);
}
.breadcrumb-item:hover { color: var(--dt-sidebar-item-text-hover); }
.breadcrumb-item.current {
  color: var(--dt-on-surface);
  font-weight: var(--dt-weight-semibold);
  pointer-events: none;
}

.breadcrumb-sep {
  display: flex;
  align-items: center;
  color: var(--dt-gray-300);
}

/* 用户菜单触发器 */
.user-menu-wrap { position: relative; }
.user-trigger {
  height: 32px;
  padding: 0 10px;
  border-radius: var(--dt-radius-sm);
  border: 1px solid var(--dt-sidebar-border-color);
  background: var(--dt-color-bg-muted);
  color: var(--dt-color-text-secondary);
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  transition: border-color var(--dt-duration-fast) var(--dt-ease-smooth),
              background-color var(--dt-duration-fast) var(--dt-ease-smooth);
  font-family: var(--dt-font-sans);
}
.user-trigger:hover {
  background: var(--dt-color-bg-surface);
  border-color: var(--dt-color-primary);
  color: var(--dt-color-text-primary);
}
.avatar-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  background: var(--dt-gradient-primary);
  color: #fff;
  flex-shrink: 0;
}
.user-name { font-size: var(--dt-text-xs); font-weight: var(--dt-weight-semibold); }

/* 用户下拉菜单 */
.user-menu {
  position: absolute;
  right: 0;
  top: 38px;
  z-index: 9999;
  min-width: 140px;
  border-radius: var(--dt-radius-md);
  border: 1px solid var(--dt-color-border);
  background: var(--dt-color-bg-surface);
  padding: 4px;
  box-shadow: var(--dt-shadow-lg);
}
.user-menu-item {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  color: var(--dt-gray-700);
  border-radius: 5px;
  height: 32px;
  padding: 0 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: var(--dt-text-xs);
  font-weight: var(--dt-weight-medium);
  font-family: var(--dt-font-sans);
  transition: all var(--dt-duration-fast) var(--dt-ease-smooth);
}
.user-menu-item:hover { background: var(--dt-color-bg-muted); color: var(--dt-color-text-primary); }
.user-menu-item.danger:hover { background: var(--dt-color-danger-bg); color: var(--dt-color-danger); }

/* ─── 主内容区 ─── */
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--dt-color-bg-base);
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .app-layout { padding: 0; }
  .sidebar { width: 200px; }
  .main-content { padding: 0; }
}
</style>
