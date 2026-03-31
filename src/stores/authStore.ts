import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/authApi'
import type { LoginBody, MeData } from '@/api/authApi'

export const useAuthStore = defineStore('auth', () => {
  const token    = ref<string | null>(localStorage.getItem('brand_radar_token'))
  const me       = ref<MeData | null>(null)
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => ['admin', 'superadmin'].includes(me.value?.role ?? ''))

  async function login(body: LoginBody) {
    loading.value = true
    error.value   = null
    try {
      const res = await authApi.login(body)
      if (res.success && res.data) {
        token.value = res.data.token
        localStorage.setItem('brand_radar_token', res.data.token)
        me.value = { username: res.data.username, role: res.data.role, login_at: new Date().toISOString(), menus: res.data.menus }
        if (res.data.menus) localStorage.setItem('brand_radar_role_menus', JSON.stringify(res.data.menus))
        return true
      }
      error.value = res.error?.message ?? '登录失败'
      return false
    } catch (e: unknown) {
      error.value = (e as Error).message
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await authApi.me()
      if (res.success && res.data) {
        me.value = res.data
        if (res.data.menus) localStorage.setItem('brand_radar_role_menus', JSON.stringify(res.data.menus))
      }
    } catch { /* ignore */ }
  }

  async function logout() {
    try { await authApi.logout() } catch { /* ignore */ }
    token.value = null
    me.value    = null
    localStorage.removeItem('brand_radar_token')
    localStorage.removeItem('brand_radar_role_menus')
  }

  return { token, me, loading, error, isLoggedIn, isAdmin, login, fetchMe, logout }
})
