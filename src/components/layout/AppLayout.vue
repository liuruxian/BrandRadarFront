<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#00d4ff" stroke-width="1.5" opacity="0.3"/>
            <circle cx="14" cy="14" r="7" stroke="#00d4ff" stroke-width="1.5" opacity="0.6"/>
            <circle cx="14" cy="14" r="2.5" fill="#00d4ff"/>
            <line x1="14" y1="2" x2="14" y2="6" stroke="#00d4ff" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="14" y1="22" x2="14" y2="26" stroke="#00d4ff" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="2" y1="14" x2="6" y2="14" stroke="#00d4ff" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="22" y1="14" x2="26" y2="14" stroke="#00d4ff" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <transition name="label-fade">
          <div v-if="!sidebarCollapsed" class="logo-text">
            <span class="logo-title">BrandRadar</span>
            <span class="logo-sub">品牌雷达系统</span>
          </div>
        </transition>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <span class="nav-icon" v-html="item.icon" />
          <transition name="label-fade">
            <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          </transition>
        </router-link>
      </nav>

      <!-- 折叠按钮 -->
      <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
          :style="{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }">
          <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </aside>

    <!-- 主内容区 -->
    <div class="main-wrapper">
      <!-- 顶部栏 -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="topbar-title">{{ currentTitle }}</h1>
        </div>
        <div class="topbar-right">
          <div class="status-indicator" :class="statusClass">
            <span class="dot" />
            <span class="status-text">{{ statusText }}</span>
          </div>
          <div class="topbar-time">{{ currentTime }}</div>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
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
let timeTimer: ReturnType<typeof setInterval>

const navItems = [
  {
    path: '/',
    label: '仪表盘',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`
  },
  {
    path: '/products',
    label: '产品数据中心',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`
  },
  {
    path: '/monitor',
    label: '价格监控',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`
  },
  {
    path: '/tasks',
    label: '采集任务',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
  },
  {
    path: '/scheduler',
    label: '调度管理',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`
  }
]

const currentTitle = computed(() => {
  const map: Record<string, string> = {
    '/': '仪表盘',
    '/products': '产品数据中心',
    '/monitor': '价格监控',
    '/tasks': '采集任务中心',
    '/scheduler': '调度管理'
  }
  return map[route.path] || 'BrandRadar'
})

const statusClass = computed(() => {
  const s = systemStore.health?.status
  if (s === 'ok') return 'status-ok'
  if (s === 'degraded') return 'status-warn'
  return 'status-error'
})

const statusText = computed(() => {
  const s = systemStore.health?.status
  if (s === 'ok') return '系统正常'
  if (s === 'degraded') return '服务降级'
  if (s === 'error') return '服务异常'
  return '连接中...'
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

onMounted(() => {
  systemStore.fetchHealth()
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
})

onUnmounted(() => clearInterval(timeTimer))
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-base);
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s var(--ease-out);
  position: relative;
  z-index: 10;
  overflow: hidden;
}
.sidebar.collapsed { width: 68px; }

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 18px 20px;
  border-bottom: 1px solid var(--border);
  min-height: 70px;
  overflow: hidden;
}
.logo-icon {
  flex-shrink: 0;
  animation: pulse-glow 3s ease-in-out infinite;
  color: var(--accent);
}
.logo-text { overflow: hidden; white-space: nowrap; }
.logo-title {
  display: block;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
.logo-sub {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  margin-top: 1px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: all var(--duration-base) var(--ease-out);
  position: relative;
  overflow: hidden;
}
.nav-item::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px; height: 60%;
  background: var(--accent);
  border-radius: 0 2px 2px 0;
  transition: transform var(--duration-base) var(--ease-out);
}
.nav-item:hover { color: var(--text-primary); background: var(--accent-glow2); }
.nav-item.active { color: var(--accent); background: var(--accent-glow); font-weight: 600; }
.nav-item.active::before { transform: translateY(-50%) scaleY(1); }

.nav-icon {
  flex-shrink: 0;
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
}
.nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

.collapse-btn {
  margin: 12px;
  padding: 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-base);
}
.collapse-btn:hover { color: var(--accent); border-color: var(--border-bright); background: var(--accent-glow2); }

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 56px;
  flex-shrink: 0;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  gap: 16px;
}
.topbar-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}
.topbar-right { display: flex; align-items: center; gap: 20px; }

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}
.dot { width: 7px; height: 7px; border-radius: 50%; }
.status-ok .dot    { background: var(--green); box-shadow: 0 0 6px var(--green); animation: pulse-glow 2s infinite; color: var(--green); }
.status-warn .dot  { background: var(--amber); box-shadow: 0 0 6px var(--amber); animation: pulse-glow 1.5s infinite; }
.status-error .dot { background: var(--red); box-shadow: 0 0 6px var(--red); animation: pulse-glow 1s infinite; }
.status-ok .status-text   { color: var(--green); }
.status-warn .status-text { color: var(--amber); }
.status-error .status-text { color: var(--red); }

.topbar-time {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ─── Transitions ─────────────────────────────────────── */
.label-fade-enter-active,
.label-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.label-fade-enter-from   { opacity: 0; transform: translateX(-8px); }
.label-fade-leave-to     { opacity: 0; transform: translateX(-8px); }

.page-enter-active { animation: fadeInUp 0.3s var(--ease-out); }
.page-leave-active { animation: fadeInUp 0.15s var(--ease-out) reverse; }
</style>
