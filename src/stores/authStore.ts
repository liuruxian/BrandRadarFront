import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/authApi'
import type { LoginBody } from '@/api/authApi'

export interface MeData {
  user_id: string
  email: string
  nickname?: string
  phone?: string
  is_active?: boolean
  user_type?: string
  roles: string[]
  created_at?: string
  username?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token    = ref<string | null>(localStorage.getItem('brand_radar_token'))
  const me       = ref<MeData | null>(null)
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => me.value?.roles?.includes('superadmin') || me.value?.roles?.includes('admin'))

  async function login(body: LoginBody) {
    loading.value = true
    error.value   = null
    try {
      const res = await authApi.login(body)
      if (res.success && res.data) {
        // 后端返回 data.access_token
        token.value = res.data.access_token
        localStorage.setItem('brand_radar_token', res.data.access_token)
        // 后端返回的是 user_id/email/roles，不是 username/role
        me.value = {
          user_id: ((res.data as unknown as { id?: string }).id ?? '') as string,
          email: res.data.email ?? body.email,
          user_type: res.data.user_type,
          roles: res.data.roles ?? [],
        }
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
        // 后端返回 id，不是 user_id
        me.value = { ...res.data, user_id: res.data.user_id ?? res.data.id ?? '' }
      }
    } catch { /* ignore */ }
  }

  async function logout() {
    token.value = null
    me.value    = null
    localStorage.removeItem('brand_radar_token')
    localStorage.removeItem('brand_radar_role_menus')
  }

  return { token, me, loading, error, isLoggedIn, isAdmin, login, fetchMe, logout }
})
