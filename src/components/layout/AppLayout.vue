<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="11" stroke="url(#g1)" stroke-width="1.5"/>
            <circle cx="13" cy="13" r="5.5" stroke="url(#g1)" stroke-width="1.5"/>
            <circle cx="13" cy="13" r="2" fill="url(#g1)"/>
            <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#06B6D4"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient></defs>
          </svg>
        </div>
        <transition name="label-fade">
          <div class="logo-text">
            <span class="logo-name">Brand<span class="logo-grad">Radar</span></span>
            <span class="logo-sub">Intelligence</span>
          </div>
        </transition>
      </div>

      <nav class="sidebar-nav" ref="sidebarNavRef">
        <div class="nav-section-label">概览</div>
        <router-link to="/" class="nav-item" :class="{active:isActive('/')}" :title="sidebarCollapsed ? '仪表盘' : ''">
          <span class="nav-icon" v-html="icons.dashboard"/>
          <transition name="label-fade"><span class="nav-label">仪表盘</span></transition>
        </router-link>

        <div class="nav-section-label" style="margin-top:16px">数据</div>
        <router-link v-if="canAccess('/products')" to="/products" class="nav-item" :class="{active:isActive('/products')}" :title="sidebarCollapsed ? '产品中心' : ''">
          <span class="nav-icon" v-html="icons.products"/>
          <transition name="label-fade"><span class="nav-label">产品中心</span></transition>
        </router-link>
        <router-link v-if="canAccess('/monitor')" to="/monitor" class="nav-item" :class="{active:isActive('/monitor')}" :title="sidebarCollapsed ? '价格监控' : ''">
          <span class="nav-icon" v-html="icons.monitor"/>
          <transition name="label-fade"><span class="nav-label">价格监控</span></transition>
        </router-link>
        <router-link v-if="canAccess('/scheduler')" to="/scheduler" class="nav-item" :class="{active:isActive('/scheduler')}" :title="sidebarCollapsed ? '调度管理' : ''">
          <span class="nav-icon" v-html="icons.scheduler"/>
          <transition name="label-fade"><span class="nav-label">调度管理</span></transition>
        </router-link>

        <div class="nav-section-label" style="margin-top:16px">业务</div>
        <router-link to="/biz/users" class="nav-item nav-child" :class="{active:isActive('/biz/users')}" title="用户管理">
          <span class="nav-icon" v-html="icons.adminUsers"/>
          <span class="nav-label">用户管理</span>
        </router-link>

        <div class="nav-section-label" style="margin-top:16px">运维</div>
        <router-link to="/admin/dashboard" class="nav-item nav-child" :class="{active:isActive('/admin/dashboard')}" title="系统监控">
          <span class="nav-icon" v-html="icons.adminDashboard"/><span class="nav-label">系统监控</span>
        </router-link>
        <router-link to="/admin/console" class="nav-item nav-child" :class="{active:isActive('/admin/console')}" title="服务控制台">
          <span class="nav-icon" v-html="icons.adminConsole"/><span class="nav-label">服务控制台</span>
        </router-link>
        <router-link to="/admin/logs" class="nav-item nav-child" :class="{active:isActive('/admin/logs')}" title="日志审计">
          <span class="nav-icon" v-html="icons.adminLogs"/><span class="nav-label">日志审计</span>
        </router-link>
        <router-link to="/admin/sessions" class="nav-item nav-child" :class="{active:isActive('/admin/sessions')}" title="会话管理">
          <span class="nav-icon" v-html="icons.adminSessions"/><span class="nav-label">会话管理</span>
        </router-link>
        <router-link to="/admin/backup" class="nav-item nav-child" :class="{active:isActive('/admin/backup')}" title="备份恢复">
          <span class="nav-icon" v-html="icons.adminBackup"/><span class="nav-label">备份恢复</span>
        </router-link>
        <router-link to="/admin/config" class="nav-item nav-child" :class="{active:isActive('/admin/config')}" title="配置中心">
          <span class="nav-icon" v-html="icons.adminConfig"/><span class="nav-label">配置中心</span>
        </router-link>
        <router-link to="/admin/announce" class="nav-item nav-child" :class="{active:isActive('/admin/announce')}" title="系统公告">
          <span class="nav-icon" v-html="icons.adminAnnounce"/><span class="nav-label">系统公告</span>
        </router-link>
      </nav>


    </aside>

    <div class="main-wrapper">
      <header class="topbar">
        <div class="topbar-breadcrumb">
          <span class="breadcrumb-root">BrandRadar</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-cur">{{ currentTitle }}</span>
        </div>
        <div class="topbar-right">
          <div class="user-menu-wrap">
            <button class="user-trigger" @click="showUserMenu=!showUserMenu">
              <span class="avatar-dot">AI</span>
              <span class="user-name">{{ currentUserName }}</span>
            </button>
            <div v-if="showUserMenu" class="user-menu">
              <button class="user-menu-item" @click="goQuick('/biz/users')">个人中心</button>
              <button class="user-menu-item" @click="goQuick('/admin/config')">设置</button>
              <button class="user-menu-item danger" @click="handleLogout">退出登录</button>
            </div>
          </div>
        </div>
      </header>
      <main class="main-content">
        <router-view v-slot="{Component}">
          <transition name="page" mode="out-in">
            <component :is="Component"/>
          </transition>
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
const sidebarCollapsed = ref(false)
const sidebarNavRef = ref<HTMLElement | null>(null)
const showUserMenu = ref(false)

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
}

const titleMap: Record<string,string> = {
  '/':'仪表盘',
  '/products':'产品中心',
  '/monitor':'价格监控',
  '/tasks':'采集任务',
  '/scheduler':'调度管理',
  '/biz/users':'用户管理',
  '/admin/dashboard':'系统监控',
  '/admin/console':'服务控制台',
  '/admin/logs':'日志审计',
  '/admin/sessions':'会话管理',
  '/admin/backup':'备份恢复',
  '/admin/config':'配置中心',
  '/admin/announce':'系统公告',
  '/admin/users':'用户管理',
}
const currentTitle = computed(() => titleMap[route.path]||'BrandRadar')
const currentUserName = computed(() => authStore.me?.username || 'Admin')

const hasBizMenu = computed(() => true)
const hasOpsMenu = computed(() => true)
function canAccess(_path: string) { return true }

function isActive(p:string){return p==='/'?route.path==='/':route.path.startsWith(p)}

function goQuick(path: string) {
  quickKeyword.value = ''
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
  activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

watch(() => route.path, () => {
  showUserMenu.value = false
  scrollToActiveNav()
}, { immediate: true })

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
  background:var(--bg-base);
  padding:10px 12px 12px;
  gap:12px;
}

.sidebar {
  width: 232px;
  flex-shrink: 0;
  background: rgba(10, 14, 24, 0.72);
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  transition: width .28s var(--ease-out), background .28s var(--ease-out);
  position: relative;
  z-index: 20;
  overflow: hidden;
}
.sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 60% at 0% 0%, rgba(99,102,241,.18), transparent 55%), radial-gradient(120% 80% at 100% 100%, rgba(6,182,212,.12), transparent 60%);
  pointer-events: none;
}
.sidebar > * { position: relative; z-index: 1; }
.sidebar.collapsed { width: 64px; }

.sidebar-logo { display:flex; align-items:center; gap:11px; padding:18px 16px 16px; border-bottom:1px solid rgba(255,255,255,0.06); min-height:64px; overflow:hidden; flex-shrink:0; }
.logo-mark { flex-shrink:0; }
.logo-text { overflow:hidden; white-space:nowrap; }
.logo-name { display:block; font-size:15px; font-weight:800; color:#fff; letter-spacing:-.01em; line-height:1.1; }
.logo-grad { background:var(--gradient); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.logo-sub { display:block; font-size:9px; color:#4B5563; letter-spacing:.08em; text-transform:uppercase; margin-top:2px; }

.sidebar-nav { flex:1; padding:14px 10px; display:flex; flex-direction:column; gap:6px; overflow-y:auto; overflow-x:hidden; }
.nav-section-label { font-size:11px; color:#8B93A7; text-transform:uppercase; letter-spacing:.12em; font-weight:700; padding:0 12px; margin-bottom:6px; white-space:nowrap; font-family: var(--font-sans); }

.nav-item {
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 12px;
  min-height:40px;
  border-radius:10px;
  color:#A9B2C6;
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
.nav-parent { width:100%; border:0; background:transparent; cursor:pointer; text-align:left; font-size:13px; color:#A9B2C6; }
.nav-arrow { margin-left:auto; font-size:11px; color:#7F8799; transition:transform .24s ease; }
.nav-arrow.open { transform:rotate(180deg); }
.submenu {
  display:flex;
  flex-direction:column;
  gap:4px;
  padding:8px 0 8px 16px;
  margin-left:8px;
  border-left:1px solid rgba(255,255,255,.08);
  background:rgba(24,24,24,.45);
  border-radius:12px;
  overflow:hidden;
}
.nav-sub { font-size:13px; font-weight:600; padding:9px 12px; color:#D7E0EE; opacity:1; }
.nav-child {
  margin-left: 18px;
  border-left: 1px solid rgba(255,255,255,.12);
  border-radius: 0 10px 10px 0;
  padding-left: 12px;
  background: rgba(255,255,255,.02);
}
.nav-child + .nav-child { margin-top: 2px; }
.nav-item:hover { color:#F8FAFC; background:rgba(30, 41, 59, .55); }
.nav-item:hover .nav-icon { color:#DBEAFE; filter: drop-shadow(0 0 6px rgba(59,130,246,.3)); }
.nav-item.active { color:#FFFFFF; background:linear-gradient(135deg,rgba(37,99,235,0.24),rgba(59,130,246,0.12)); }
.nav-item.active .nav-icon { color:#EFF6FF; filter: drop-shadow(0 0 8px rgba(59,130,246,.45)); }
.nav-item.active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:4px; height:74%; background:#3B82F6; border-radius:0 2px 2px 0; box-shadow:0 0 12px rgba(59,130,246,.65); }
.nav-icon { flex-shrink:0; width:17px; height:17px; display:flex; align-items:center; justify-content:center; transition:all .22s ease; }
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

.submenu-collapse-enter-active,
.submenu-collapse-leave-active {
  transition: all .24s ease;
  transform-origin: top;
}
.submenu-collapse-enter-from,
.submenu-collapse-leave-to {
  opacity: 0;
  transform: translateY(-6px) scaleY(0.98);
}
.submenu-collapse-enter-to,
.submenu-collapse-leave-from {
  opacity: 1;
  transform: translateY(0) scaleY(1);
}

.main-wrapper {
  flex:1;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  min-width:0;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 16px;
  background: rgba(12,16,24,.45);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
}

.topbar {
  height: 56px;
  flex-shrink: 0;
  background: rgba(16,18,24,.62);
  backdrop-filter: blur(14px) saturate(125%);
  -webkit-backdrop-filter: blur(14px) saturate(125%);
  border-bottom: 1px solid rgba(255,255,255,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  padding: 0 24px;
  box-shadow: 0 4px 18px rgba(0,0,0,.2);
}
.topbar::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,.32), transparent);
}
.topbar-breadcrumb { display:flex; align-items:center; gap:8px; min-width:190px; }
.breadcrumb-root { font-size:12px; color:#94A3B8; font-weight:600; letter-spacing:.04em; text-transform:uppercase; }
.breadcrumb-sep { color:#64748B; font-size:13px; }
.breadcrumb-cur { font-size:14px; font-weight:700; color:#F8FAFC; }
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
.topbar-right { display:flex; align-items:center; gap:10px; }
.topbar-action { padding:7px 12px; font-size:12px; }
.topbar-status { font-size:11px; border: 1px solid rgba(255,255,255,.16); }
.topbar-time { font-size:12px; color:#CBD5E1; letter-spacing:.04em; }
.user-menu-wrap { position:relative; }
.user-trigger {
  height:34px;
  padding:0 10px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.06);
  color:#E2E8F0;
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
  background:linear-gradient(135deg,#38BDF8,#6366F1);
  color:#fff;
}
.user-name { font-size:12px; font-weight:600; }
.user-menu {
  position:absolute;
  right:0;
  top:40px;
  min-width:140px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(18,22,30,.96);
  backdrop-filter:blur(12px);
  padding:6px;
  box-shadow:0 14px 30px rgba(0,0,0,.28);
}
.user-menu-item {
  width:100%;
  text-align:left;
  border:none;
  background:transparent;
  color:#CBD5E1;
  border-radius:8px;
  padding:8px 10px;
  cursor:pointer;
}
.user-menu-item:hover { background:rgba(59,130,246,.16); color:#F8FAFC; }
.user-menu-item.danger:hover { background:rgba(244,63,94,.16); color:#FCA5A5; }

.main-content {
  flex:1;
  overflow-y:auto;
  overflow-x:hidden;
  background:var(--bg-base);
  padding: 0 6px 8px;
}

.label-fade-enter-active,.label-fade-leave-active { transition:opacity .15s ease,transform .15s ease; }
.label-fade-enter-from,.label-fade-leave-to { opacity:0; transform:translateX(-6px); }
.page-enter-active {
  animation: pageSlideIn .34s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.page-leave-active {
  animation: pageFadeOut .18s ease both;
}
@keyframes pageSlideIn {
  from { opacity:0; transform:translateY(14px) scale(.992); filter: blur(2px); }
  to   { opacity:1; transform:translateY(0) scale(1); filter: blur(0); }
}
@keyframes pageFadeOut {
  from { opacity:1; transform:translateY(0) scale(1); }
  to   { opacity:0; transform:translateY(-6px) scale(.996); }
}

@media (max-width: 900px) {
  .app-layout { padding: 6px; gap: 8px; }
  .main-wrapper { border-radius: 12px; }
  .topbar { padding: 0 12px; }
  .main-content { padding: 0 2px 6px; }
}
</style>
