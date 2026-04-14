<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <circle
              cx="13"
              cy="13"
              r="11"
              stroke="url(#g1)"
              stroke-width="1.5"
            />
            <circle
              cx="13"
              cy="13"
              r="5.5"
              stroke="url(#g1)"
              stroke-width="1.5"
            />
            <circle
              cx="13"
              cy="13"
              r="2"
              fill="url(#g1)"
            />
            <defs><linearGradient
              id="g1"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            ><stop
              offset="0%"
              stop-color="#06B6D4"
            /><stop
              offset="100%"
              stop-color="#8B5CF6"
            /></linearGradient></defs>
          </svg>
        </div>
        <transition name="label-fade">
          <div class="logo-text">
            <span class="logo-name">Brand<span class="logo-grad">Radar</span></span>
            <span class="logo-sub">Intelligence</span>
          </div>
        </transition>
      </div>

      <nav
        ref="sidebarNavRef"
        class="sidebar-nav"
      >
        <!-- 概览 -->
        <router-link
          to="/"
          class="nav-item"
          :class="{active:isActive('/')}"
        >
          <span class="nav-icon" v-html="icons.dashboard" />
          <span class="nav-label">概览</span>
        </router-link>

        <!-- 数据 -->
        <router-link
          v-if="canAccess('/products')"
          to="/products"
          class="nav-item"
          :class="{active:isActive('/products')}"
        >
          <span class="nav-icon" v-html="icons.products" />
          <span class="nav-label">数据</span>
        </router-link>
        <router-link
          v-if="canAccess('/monitor')"
          to="/monitor"
          class="nav-item"
          :class="{active:isActive('/monitor')}"
        >
          <span class="nav-icon" v-html="icons.monitor" />
          <span class="nav-label">价格监控</span>
        </router-link>

        <!-- IDC 市场数据分析（可展开子菜单） -->
        <div class="nav-section-gap"></div>
        <div class="nav-submenu-group">
          <div
            class="nav-item nav-submenu-toggle"
            :class="{ active: isIDCActive }"
            @click="toggleIDCMenu()"
          >
            <span class="nav-icon" v-html="icons.idcOverview" />
            <span class="nav-label">IDC市场数据分析</span>
            <span class="nav-submenu-arrow" :class="{ open: idcSubmenuOpen }">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          </div>
          <div v-if="idcSubmenuOpen" class="nav-submenu-items">
            <router-link to="/idc/overview" class="nav-item nav-submenu-item" :class="{active:isActive('/idc/overview')}">
              <span class="nav-icon" v-html="icons.idcOverview" /><span class="nav-label">市场总览</span>
            </router-link>
            <router-link to="/idc/explore" class="nav-item nav-submenu-item" :class="{active:isActive('/idc/explore')}">
              <span class="nav-icon" v-html="icons.idcExplore" /><span class="nav-label">市场探索</span>
            </router-link>
            <router-link to="/idc/geography" class="nav-item nav-submenu-item" :class="{active:isActive('/idc/geography')}">
              <span class="nav-icon" v-html="icons.idcGeo" /><span class="nav-label">地理分析</span>
            </router-link>
            <router-link to="/idc/product" class="nav-item nav-submenu-item" :class="{active:isActive('/idc/product')}">
              <span class="nav-icon" v-html="icons.idcProduct" /><span class="nav-label">型号对标</span>
            </router-link>
            <router-link to="/idc/channel" class="nav-item nav-submenu-item" :class="{active:isActive('/idc/channel')}">
              <span class="nav-icon" v-html="icons.idcChannel" /><span class="nav-label">渠道与价格</span>
            </router-link>
            <router-link to="/idc/tech" class="nav-item nav-submenu-item" :class="{active:isActive('/idc/tech')}">
              <span class="nav-icon" v-html="icons.idcTech" /><span class="nav-label">技术与细分</span>
            </router-link>
          </div>
        </div>

        <!-- 运维（收起子菜单） -->
        <div class="nav-section-gap"></div>
        <div class="nav-submenu-group">
          <div
            class="nav-item nav-submenu-toggle"
            :class="{ active: isAdminActive }"
            @click="toggleAdminMenu()"
          >
            <span class="nav-icon" v-html="icons.adminDashboard" />
            <span class="nav-label">运维管理</span>
            <span class="nav-submenu-arrow" :class="{ open: adminSubmenuOpen }">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          </div>
          <div v-if="adminSubmenuOpen" class="nav-submenu-items">
            <router-link to="/admin/dashboard" class="nav-item nav-submenu-item" :class="{active:isActive('/admin/dashboard')}">
              <span class="nav-icon" v-html="icons.adminDashboard" /><span class="nav-label">系统监控</span>
            </router-link>
            <router-link v-if="canAccess('/scheduler')" to="/scheduler" class="nav-item nav-submenu-item" :class="{active:isActive('/scheduler')}">
              <span class="nav-icon" v-html="icons.scheduler" /><span class="nav-label">调度管理</span>
            </router-link>
            <router-link to="/admin/users" class="nav-item nav-submenu-item" :class="{active:isActive('/admin/users') || isActive('/biz/users')}">
              <span class="nav-icon" v-html="icons.adminUsers" /><span class="nav-label">用户管理</span>
            </router-link>
            <router-link to="/admin/sessions" class="nav-item nav-submenu-item" :class="{active:isActive('/admin/sessions')}">
              <span class="nav-icon" v-html="icons.adminSessions" /><span class="nav-label">会话管理</span>
            </router-link>
            <router-link to="/admin/config" class="nav-item nav-submenu-item" :class="{active:isActive('/admin/config')}">
              <span class="nav-icon" v-html="icons.adminConfig" /><span class="nav-label">配置中心</span>
            </router-link>
            <router-link to="/admin/announce" class="nav-item nav-submenu-item" :class="{active:isActive('/admin/announce')}">
              <span class="nav-icon" v-html="icons.adminAnnounce" /><span class="nav-label">系统公告</span>
            </router-link>
          </div>
        </div>
      </nav>
    </aside>

    <div class="main-wrapper">
      <header class="topbar">
        <div class="topbar-breadcrumb">
          <span class="breadcrumb-cur">{{ currentTitle }}</span>
        </div>
        <div class="topbar-right">
          <div class="user-menu-wrap">
            <button
              class="user-trigger"
              @click="showUserMenu=!showUserMenu"
            >
              <span class="avatar-dot">AI</span>
              <span class="user-name">{{ currentUserName }}</span>
            </button>
            <div
              v-if="showUserMenu"
              class="user-menu"
            >
              <button
                class="user-menu-item"
                @click="goQuick('/admin/users')"
              >
                个人中心
              </button>
              <button
                class="user-menu-item"
                @click="goQuick('/admin/config')"
              >
                设置
              </button>
              <button
                class="user-menu-item danger"
                @click="handleLogout"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>
      <main class="main-content" ref="mainContentRef">
        <!-- 内层再包一层 MessageProvider，保证嵌套路由页内 useMessage() 一定能注入成功，避免白屏 -->
        <n-message-provider>
          <router-view v-slot="{ Component, route: currentRoute }">
            <component
              :is="Component"
              :key="`${String(currentRoute.name)}:${currentRoute.fullPath}`"
            />
          </router-view>
        </n-message-provider>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NMessageProvider } from 'naive-ui'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sidebarCollapsed = ref(false)
const sidebarNavRef = ref<HTMLElement | null>(null)
const mainContentRef = ref<HTMLElement | null>(null)
const showUserMenu = ref(false)
const adminSubmenuOpen = ref(false)
const idcSubmenuOpen = ref(false)

const isAdminActive = computed(() =>
  route.path.startsWith('/admin/') || route.path.startsWith('/scheduler')
)
const isIDCActive = computed(() =>
  route.path.startsWith('/idc/')
)

function toggleIDCMenu() {
  if (idcSubmenuOpen.value) {
    idcSubmenuOpen.value = false
  } else {
    idcSubmenuOpen.value = true
    adminSubmenuOpen.value = false
  }
}

function toggleAdminMenu() {
  if (adminSubmenuOpen.value) {
    adminSubmenuOpen.value = false
  } else {
    adminSubmenuOpen.value = true
    idcSubmenuOpen.value = false
  }
}

watch(() => route.path, () => {
  showUserMenu.value = false
  scrollToActiveNav()
  if (mainContentRef.value) {
    mainContentRef.value.scrollTop = 0
  }
  // 路由切换时自动收起另一个子菜单
  if (!isIDCActive.value) idcSubmenuOpen.value = false
  if (!isAdminActive.value) adminSubmenuOpen.value = false
}, { immediate: true })

const icons = {
  dashboard: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  products:  `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  monitor:   `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  tasks:     `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  scheduler: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`,
  biz: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h18"/><path d="M5 7V5a2 2 0 0 1 2-2h2"/><path d="M19 7V5a2 2 0 0 0-2-2h-2"/><rect x="3" y="7" width="18" height="13" rx="2"/></svg>`,
  adminDashboard: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h8V3H3v10zm10 8h8v-6h-8v6zm0-18v8h8V3h-8zM3 21h8v-6H3v6z"/></svg>`,
  adminConsole: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 8l3 3-3 3"/><path d="M13 14h4"/></svg>`,
  adminLogs: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  adminSessions: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  adminBackup: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  adminConfig: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  adminAnnounce: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  adminUsers: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>`,
  // IDC Market Analysis icons
  idcOverview: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  idcExplore: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  idcGeo: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  idcProduct: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  idcChannel: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  idcTech: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  idcExport: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
}

const titleMap: Record<string,string> = {
  '/':'概览',
  '/products':'数据',
  '/monitor':'价格监控',
  '/scheduler':'调度管理',
  '/admin/dashboard':'系统监控',
  '/admin/sessions':'会话管理',
  '/admin/config':'配置中心',
  '/admin/announce':'系统公告',
  '/admin/users':'用户管理',
  '/biz/users':'用户管理',
  '/idc/overview':'IDC市场数据分析 · 市场总览',
  '/idc/explore':'IDC市场数据分析 · 市场探索',
  '/idc/geography':'IDC市场数据分析 · 地理分析',
  '/idc/product':'IDC市场数据分析 · 型号对标',
  '/idc/channel':'IDC市场数据分析 · 渠道与价格',
  '/idc/tech':'IDC市场数据分析 · 技术与细分',
}
const currentTitle = computed(() => titleMap[route.path]||'BrandRadar')
const currentUserName = computed(() => authStore.me?.username || 'Admin')

function canAccess(_path?: string) { return true }

function isActive(p:string){return p==='/'?route.path==='/':route.path.startsWith(p)}

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
.app-layout {
  display:flex;
  height:100vh;
  overflow:hidden;
  background:#FFFFFF;
  padding:0;
  gap:0;
}

.sidebar {
  width: 232px;
  flex-shrink: 0;
  background: #FFFFFF;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 20;
  overflow: hidden;
}
.sidebar::before { display:none; }
.sidebar > * { position: relative; z-index: 1; }
.sidebar.collapsed { width: 64px; }

.sidebar-logo { display:flex; align-items:center; gap:11px; padding:18px 16px 16px; border-bottom:1px solid #E5E7EB; min-height:64px; overflow:hidden; flex-shrink:0; }
.logo-mark { flex-shrink:0; }
.logo-text { overflow:hidden; white-space:nowrap; }
.logo-name { display:block; font-size:15px; font-weight:800; color:#111827; letter-spacing:-.01em; line-height:1.1; }
.logo-grad { background:linear-gradient(135deg,#00C4CC,#8A7FFF); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.logo-sub { display:block; font-size:10px; color:#6B7280; letter-spacing:.08em; text-transform:uppercase; margin-top:2px; }

.sidebar-nav { flex:1; padding:14px 10px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; overflow-x:hidden; }
.nav-section-label { font-size:11px; color:#9CA3AF; text-transform:uppercase; letter-spacing:.12em; font-weight:700; padding:0 12px; margin-bottom:6px; white-space:nowrap; font-family: var(--font-sans); }

.nav-item {
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 12px;
  min-height:40px;
  border-radius:8px;
  color:#374151;
  text-decoration:none;
  font-size:13px;
  line-height:1;
  font-weight:600;
  font-family: var(--font-sans);
  white-space:nowrap;
  transition:all .22s var(--ease-out);
  position:relative;
  overflow:hidden;
}
.nav-item :deep(.n-tag) {
  margin-left: auto;
}
.nav-item:hover { color:#00C4CC; background:rgba(0,196,204,.08); }
.nav-item:hover .nav-icon { color:#00C4CC; filter:none; }
.nav-item.active { color:#00C4CC; background:rgba(0,196,204,.12); }
.nav-item.active .nav-icon { color:#00C4CC; filter:none; }
.nav-item.active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:70%; background:#00C4CC; border-radius:0 2px 2px 0; box-shadow:none; }

/* 分组间距 */
.nav-section-gap { height: 8px; }

/* 子菜单 */
.nav-submenu-group { display: flex; flex-direction: column; }
.nav-submenu-toggle { cursor: pointer; }
.nav-submenu-arrow { margin-left: auto; transition: transform .2s ease; display: flex; align-items: center; }
.nav-submenu-arrow.open { transform: rotate(180deg); }
.nav-submenu-items { display: flex; flex-direction: column; padding-left: 8px; gap: 2px; }
.nav-submenu-item {
  padding: 8px 12px;
  min-height: 36px;
  font-size: 12px;
  color: #6B7280;
  border-radius: 6px;
  transition: all .22s var(--ease-out);
  display: flex;
  align-items: center;
  gap: 10px;
}
.nav-submenu-item:hover { color:#00C4CC; background:rgba(0,196,204,.08); }
.nav-submenu-item.active { color:#00C4CC; background:rgba(0,196,204,.12); }

.nav-icon { flex-shrink:0; width:17px; height:17px; display:flex; align-items:center; justify-content:center; transition:all .22s ease; color:#6B7280; }
.nav-label { flex:1; }

.sidebar-footer { padding:12px 14px 14px; border-top:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between; gap:8px; }
.status-pill { display:flex; align-items:center; gap:5px; font-size:11px; padding:3px 8px; border-radius:999px; }
.status-ok   { background:rgba(16,185,129,0.15); color:#34D399; }
.status-warn { background:rgba(245,158,11,0.15); color:#FCD34D; }
.status-err  { background:rgba(239,68,68,0.15);  color:#FCA5A5; }
.status-dot { width:6px; height:6px; border-radius:50%; background:currentColor; animation:pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
.sidebar-time { font-size:10px; color:#4B5563; letter-spacing:.04em; }

.collapse-btn {
  margin: 10px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 10px;
  color: #A5B4FC;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all .22s;
}
.collapse-text { font-size: 12px; color: #C7D2FE; font-weight: 600; }
.collapse-btn:hover { color:#EEF2FF; background:rgba(30, 41, 59, 0.75); border-color: rgba(99,102,241,.45); }

.main-wrapper {
  flex:1;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  min-width:0;
  background:#FFFFFF;
  height:100%;
}

.topbar {
  height: 56px;
  flex-shrink: 0;
  position: relative;
  z-index: 60;
  overflow: visible;
  background:#FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}
.topbar::after { display:none; }
.topbar-breadcrumb { display:flex; align-items:center; gap:8px; min-width:190px; }
.breadcrumb-cur { font-size:14px; font-weight:700; color:#111827; }
.topbar-center { flex:1; display:flex; justify-content:center; padding:0 18px; }
.global-search { position:relative; width:min(520px, 100%); }
.search-input {
  width:100%;
  height:36px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.05);
  color:#E2E8F0;
  padding:0 12px;
  outline:none;
  transition:all .2s ease;
}
.search-input:focus {
  border-color:rgba(56,189,248,.45);
  box-shadow:0 0 0 3px rgba(56,189,248,.16);
  background:rgba(255,255,255,.08);
}
.search-results {
  position:absolute;
  top:42px;
  left:0;
  right:0;
  z-index:30;
  border:1px solid rgba(255,255,255,.12);
  border-radius:12px;
  background:rgba(18,22,30,.96);
  backdrop-filter:blur(14px);
  padding:6px;
  box-shadow:0 14px 34px rgba(0,0,0,.3);
}
.search-item {
  width:100%;
  text-align:left;
  border:none;
  background:transparent;
  color:#CBD5E1;
  padding:9px 10px;
  border-radius:8px;
  cursor:pointer;
}
.search-item:hover { background:rgba(59,130,246,.15); color:#F8FAFC; }
.topbar-right { display:flex; align-items:center; gap:10px; position:relative; z-index:80; }
.topbar-action { padding:7px 12px; font-size:12px; }
.topbar-status { font-size:11px; border: 1px solid rgba(255,255,255,.16); }
.topbar-time { font-size:12px; color:#CBD5E1; letter-spacing:.04em; }
.user-menu-wrap { position:relative; }
.user-trigger {
  height:34px;
  padding:0 10px;
  border-radius:8px;
  border:1px solid #E5E7EB;
  background:#FFFFFF;
  color:#374151;
  display:flex;
  align-items:center;
  gap:8px;
  cursor:pointer;
}
.avatar-dot {
  width:22px;
  height:22px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:10px;
  font-weight:700;
  background:linear-gradient(135deg,#00C4CC,#8A7FFF);
  color:#fff;
}
.user-name { font-size:12px; font-weight:600; }
.user-menu {
  position:absolute;
  right:0;
  top:40px;
  z-index:9999;
  min-width:140px;
  border-radius:12px;
  border:1px solid #E5E7EB;
  background:#FFFFFF;
  padding:6px;
  box-shadow:0 8px 20px rgba(15,23,42,.08);
}
.user-menu-item {
  width:100%;
  text-align:left;
  border:none;
  background:transparent;
  color:#374151;
  border-radius:8px;
  padding:8px 10px;
  cursor:pointer;
}
.user-menu-item:hover { background:rgba(0,196,204,.1); color:#00AAB1; }
.user-menu-item.danger:hover { background:rgba(255,107,107,.12); color:#FF6B6B; }

.main-content {
  flex:1;
  overflow-y: auto;
  overflow-x:hidden;
  background:#FFFFFF;
  padding:24px;
  min-height:0;
}

.label-fade-enter-active,.label-fade-leave-active { transition:opacity .15s ease,transform .15s ease; }
.label-fade-enter-from,.label-fade-leave-to { opacity:0; transform:translateX(-6px); }

.route-loading-wrap {
  min-height: 220px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #64748B;
}
.route-loading-spinner {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 3px solid rgba(0,196,204,.2);
  border-top-color: #00C4CC;
  animation: spin .8s linear infinite;
}
.route-loading-text {
  font-size: 12px;
  font-weight: 600;
  color: #64748B;
}

@media (max-width: 900px) {
  .app-layout { padding: 6px; gap: 8px; }
  .main-wrapper { border-radius: 12px; }
  .topbar { padding: 0 12px; }
  .main-content { padding: 0 2px 6px; }
}
</style>
