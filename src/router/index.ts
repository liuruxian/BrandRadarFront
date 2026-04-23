import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
// IDC 模块使用静态导入，避免动态 chunk 在缓存/HMR 下错配导致「点 A 页却渲染 B 页」
import IDCOvOverviewView from '@/views/idc/IDCOvOverviewView.vue'
import IDCMarketExploreView from '@/views/idc/IDCMarketExploreView.vue'
import IDCGeographyView from '@/views/idc/IDCGeographyView.vue'
import IDCProductCompareView from '@/views/idc/IDCProductCompareView.vue'
import IDCChannelPriceView from '@/views/idc/IDCChannelPriceView.vue'
import IDCTechSegmentView from '@/views/idc/IDCTechSegmentView.vue'
// IDCExportView 已隐藏，暂不导入
// import IDCExportView from '@/views/idc/IDCExportView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: '仪表盘' }
        },
        {
          path: '/products',
          name: 'ProductList',
          component: () => import('@/views/ProductListView.vue'),
          meta: { title: '产品中心' }
        },
        {
          path: '/products/monitor',
          name: 'PriceMonitor',
          component: () => import('@/views/PriceMonitorView.vue'),
          meta: { title: '价格监控' }
        },
        {
          path: '/scheduler',
          name: 'SchedulerConfig',
          component: () => import('@/views/SchedulerConfigView.vue'),
          meta: { title: '调度管理' }
        },
        {
          path: '/admin/dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/SystemDashboardView.vue'),
          meta: { title: '系统监控' }
        },
        {
          path: '/admin/sessions',
          name: 'SessionManager',
          component: () => import('@/views/admin/SessionManagerView.vue'),
          meta: { title: '会话管理' }
        },
        {
          path: '/admin/config',
          name: 'SystemConfig',
          component: () => import('@/views/admin/SystemConfigView.vue'),
          meta: { title: '配置中心' }
        },
        {
          path: '/admin/announce',
          name: 'Announcement',
          component: () => import('@/views/admin/AnnouncementView.vue'),
          meta: { title: '系统公告' }
        },
        {
          path: '/admin/users',
          name: 'OpsUserManage',
          component: () => import('@/views/admin/UserManageView.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: '/biz/users',
          redirect: '/admin/users'
        },
        {
          path: '/profile',
          name: 'ProfileCenter',
          component: () => import('@/views/ProfileCenterView.vue'),
          meta: { title: '个人中心' }
        },
        {
          path: '/tasks',
          name: 'TaskCenter',
          component: () => import('@/views/TaskCenterView.vue'),
          meta: { title: '采集任务' }
        },

        // ==================== IDC 市场分析模块 ====================
        {
          path: '/idc/overview',
          name: 'IDCOvOverview',
          component: IDCOvOverviewView,
          meta: { title: '市场总览', icon: 'dashboard' }
        },
        {
          path: '/idc/explore',
          name: 'IDCMarketExplore',
          component: IDCMarketExploreView,
          meta: { title: '市场探索', icon: 'explore' }
        },
        {
          path: '/idc/geography',
          name: 'IDCGeography',
          component: IDCGeographyView,
          meta: { title: '地理分析', icon: 'globe' }
        },
        {
          path: '/idc/product',
          name: 'IDCProductCompare',
          component: IDCProductCompareView,
          meta: { title: '型号对标', icon: 'compare' }
        },
        {
          path: '/idc/channel',
          name: 'IDCChannelPrice',
          component: IDCChannelPriceView,
          meta: { title: '渠道与价格', icon: 'chart' }
        },
        {
          path: '/idc/tech',
          name: 'IDCTechSegment',
          component: IDCTechSegmentView,
          meta: { title: '技术与细分', icon: 'tech' }
        },
        // 数据导出路由已隐藏
        // {
        //   path: '/idc/export',
        //   name: 'IDCExport',
        //   component: IDCExportView,
        //   meta: { title: '数据导出', icon: 'export' }
        // }
      ]
    }
  ]
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'BrandRadar'} — BrandRadar`
})

function isChunkLoadError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError/i.test(msg)
}

function buildReloadPath(to: RouteLocationNormalized) {
  const resolved = to.fullPath || '/'
  const stamp = `reload=${Date.now()}`
  return resolved.includes('?') ? `${resolved}&${stamp}` : `${resolved}?${stamp}`
}

router.onError((err, to) => {
  if (!isChunkLoadError(err)) return

  const key = `route-reload-once:${to.fullPath}`
  if (sessionStorage.getItem(key)) return

  sessionStorage.setItem(key, '1')
  window.location.assign(buildReloadPath(to))
})

export default router
