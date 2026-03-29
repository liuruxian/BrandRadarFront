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
          meta: { title: '产品数据中心' }
        },
        {
          path: '/monitor',
          name: 'PriceMonitor',
          component: () => import('@/views/PriceMonitorView.vue'),
          meta: { title: '价格监控' }
        },
        {
          path: '/tasks',
          name: 'TaskCenter',
          component: () => import('@/views/TaskCenterView.vue'),
          meta: { title: '采集任务' }
        },
        {
          path: '/scheduler',
          name: 'SchedulerConfig',
          component: () => import('@/views/SchedulerConfigView.vue'),
          meta: { title: '调度管理' }
        }
      ]
    }
  ]
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'BrandRadar'} — BrandRadar`
})

export default router
