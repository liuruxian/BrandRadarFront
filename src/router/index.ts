import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

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
          path: '/monitor',
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
          path: '/admin/console',
          name: 'ServiceConsole',
          component: () => import('@/views/admin/ServiceConsoleView.vue'),
          meta: { title: '服务控制台' }
        },
        {
          path: '/admin/logs',
          name: 'LogAudit',
          component: () => import('@/views/admin/LogAuditView.vue'),
          meta: { title: '日志审计' }
        },
        {
          path: '/admin/sessions',
          name: 'SessionManager',
          component: () => import('@/views/admin/SessionManagerView.vue'),
          meta: { title: '会话管理' }
        },
        {
          path: '/admin/backup',
          name: 'BackupRestore',
          component: () => import('@/views/admin/BackupRestoreView.vue'),
          meta: { title: '备份恢复' }
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
          path: '/biz/users',
          name: 'BizUserManage',
          component: () => import('@/views/admin/UserManageView.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: '/admin/users',
          redirect: '/biz/users'
        }
      ]
    }
  ]
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'BrandRadar'} — BrandRadar`
})

export default router
