<template>
  <div class="app-layout">
    <aside class="sidebar" :class="{collapsed:sidebarCollapsed}">
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
          <div v-if="!sidebarCollapsed" class="logo-text">
            <span class="logo-name">Brand<span class="logo-grad">Radar</span></span>
            <span class="logo-sub">Intelligence</span>
          </div>
        </transition>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label" v-if="!sidebarCollapsed">概览</div>
        <router-link to="/" class="nav-item" :class="{active:isActive('/')}">
          <span class="nav-icon" v-html="icons.dashboard"/>
          <transition name="label-fade"><span v-if="!sidebarCollapsed" class="nav-label">仪表盘</span></transition>
        </router-link>
        <div class="nav-section-label" v-if="!sidebarCollapsed" style="margin-top:16px">数据</div>
        <router-link to="/products" class="nav-item" :class="{active:isActive('/products')}">
          <span class="nav-icon" v-html="icons.products"/>
          <transition name="label-fade"><span v-if="!sidebarCollapsed" class="nav-label">产品中心</span></transition>
        </router-link>
        <router-link to="/monitor" class="nav-item" :class="{active:isActive('/monitor')}">
          <span class="nav-icon" v-html="icons.monitor"/>
          <transition name="label-fade"><span v-if="!sidebarCollapsed" class="nav-label">价格监控</span></transition>
        </router-link>
        <div class="nav-section-label" v-if="!sidebarCollapsed" style="margin-top:16px">系统</div>
        <router-link to="/scheduler" class="nav-item" :class="{active:isActive('/scheduler')}">
          <span class="nav-icon" v-html="icons.scheduler"/>
          <transition name="label-fade"><span v-if="!sidebarCollapsed" class="nav-label">调度管理</span></transition>
        </router-link>
      </nav>

      <transition name="label-fade">
        <div v-if="!sidebarCollapsed" class="sidebar-footer">
          <div class="status-pill" :class="'status-'+healthStatus">
            <span class="status-dot"/><span>{{ healthText }}</span>
          </div>
          <span class="sidebar-time font-mono">{{ currentTime }}</span>
        </div>
      </transition>

      <button class="collapse-btn" @click="sidebarCollapsed=!sidebarCollapsed">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
          :style="{transform:sidebarCollapsed?'rotate(180deg)':'none',transition:'transform .25s ease'}">
          <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </aside>

    <div class="main-wrapper">
      <header class="topbar">
        <div class="topbar-breadcrumb">
          <span class="breadcrumb-root">BrandRadar</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-cur">{{ currentTitle }}</span>
        </div>
        <div class="topbar-right">
          <div class="topbar-status" :class="'status-pill status-'+healthStatus">
            <span class="status-dot"/><span>{{ healthText }}</span>
          </div>
          <span class="topbar-time font-mono">{{ currentTime }}</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSystemStore } from '@/stores/systemStore'

const route = useRoute()
const systemStore = useSystemStore()
const sidebarCollapsed = ref(false)
const currentTime = ref('')
let timer: ReturnType<typeof setInterval>

const icons = {
  dashboard: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  products:  `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  monitor:   `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  tasks:     `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  scheduler: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`,
}

const titleMap: Record<string,string> = { '/':'仪表盘','/products':'产品中心','/monitor':'价格监控','/tasks':'采集任务','/scheduler':'调度管理' }
const currentTitle = computed(() => titleMap[route.path]||'BrandRadar')
const healthStatus = computed(() => {
  const s = systemStore.health?.status
  return s==='ok'?'ok':s==='degraded'?'warn':'err'
})
const healthText = computed(() => {
  const s = systemStore.health?.status
  if (s==='ok') return '系统正常'
  if (s==='degraded') return '服务降级'
  if (s==='error') return '服务异常'
  return '连接中...'
})
function isActive(p:string){return p==='/'?route.path==='/':route.path.startsWith(p)}
function updateTime(){currentTime.value=new Date().toLocaleTimeString('zh-CN',{hour12:false})}
onMounted(()=>{ systemStore.fetchHealth(); updateTime(); timer=setInterval(updateTime,1000) })
onUnmounted(()=> clearInterval(timer))
</script>
<style scoped>
.app-layout { display:flex; height:100vh; overflow:hidden; background:var(--bg-base); }

.sidebar { width:220px; flex-shrink:0; background:var(--bg-sidebar); display:flex; flex-direction:column; transition:width .28s var(--ease-out); position:relative; z-index:20; overflow:hidden; }
.sidebar.collapsed { width:60px; }

.sidebar-logo { display:flex; align-items:center; gap:11px; padding:18px 16px 16px; border-bottom:1px solid rgba(255,255,255,0.06); min-height:64px; overflow:hidden; flex-shrink:0; }
.logo-mark { flex-shrink:0; }
.logo-text { overflow:hidden; white-space:nowrap; }
.logo-name { display:block; font-size:15px; font-weight:800; color:#fff; letter-spacing:-.01em; line-height:1.1; }
.logo-grad { background:var(--gradient); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.logo-sub { display:block; font-size:9px; color:#4B5563; letter-spacing:.08em; text-transform:uppercase; margin-top:2px; }

.sidebar-nav { flex:1; padding:12px 8px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; overflow-x:hidden; }
.nav-section-label { font-size:9px; color:#4B5563; text-transform:uppercase; letter-spacing:.1em; font-weight:600; padding:0 8px; margin-bottom:4px; white-space:nowrap; }

.nav-item { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px; color:#9CA3AF; text-decoration:none; font-size:13px; font-weight:500; white-space:nowrap; transition:all .2s var(--ease-out); position:relative; overflow:hidden; }
.nav-item:hover { color:#E5E7EB; background:rgba(255,255,255,0.06); }
.nav-item.active { color:#fff; background:linear-gradient(135deg,rgba(6,182,212,0.15),rgba(99,102,241,0.15)); }
.nav-item.active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:60%; background:var(--gradient); border-radius:0 2px 2px 0; }
.nav-icon { flex-shrink:0; width:17px; height:17px; display:flex; align-items:center; justify-content:center; }
.nav-label { flex:1; }

.sidebar-footer { padding:12px 14px 14px; border-top:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between; gap:8px; }
.status-pill { display:flex; align-items:center; gap:5px; font-size:11px; padding:3px 8px; border-radius:999px; }
.status-ok   { background:rgba(16,185,129,0.15); color:#34D399; }
.status-warn { background:rgba(245,158,11,0.15); color:#FCD34D; }
.status-err  { background:rgba(239,68,68,0.15);  color:#FCA5A5; }
.status-dot { width:6px; height:6px; border-radius:50%; background:currentColor; animation:pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
.sidebar-time { font-size:10px; color:#4B5563; letter-spacing:.04em; }

.collapse-btn { margin:8px; padding:9px; background:transparent; border:1px solid rgba(255,255,255,0.08); border-radius:8px; color:#6B7280; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
.collapse-btn:hover { color:#9CA3AF; background:rgba(255,255,255,0.06); }

.main-wrapper { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

.topbar { height:52px; flex-shrink:0; background:var(--bg-card); border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 28px; box-shadow:var(--shadow-xs); }
.topbar-breadcrumb { display:flex; align-items:center; gap:8px; }
.breadcrumb-root { font-size:13px; color:var(--text-muted); font-weight:500; }
.breadcrumb-sep { color:var(--text-muted); font-size:14px; }
.breadcrumb-cur { font-size:13px; font-weight:600; color:var(--text-primary); }
.topbar-right { display:flex; align-items:center; gap:16px; }
.topbar-status { font-size:11px; }
.topbar-time { font-size:12px; color:var(--text-muted); letter-spacing:.04em; }

.main-content { flex:1; overflow-y:auto; overflow-x:hidden; background:var(--bg-base); }

.label-fade-enter-active,.label-fade-leave-active { transition:opacity .15s ease,transform .15s ease; }
.label-fade-enter-from,.label-fade-leave-to { opacity:0; transform:translateX(-6px); }
.page-enter-active { animation:fadeInUp .25s var(--ease-out); }
.page-leave-active { opacity:0; transition:opacity .1s ease; }
@keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
</style>
