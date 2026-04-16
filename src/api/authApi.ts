import { get, post } from './client'

export interface LoginBody {
  email: string
  password: string
}

export interface LoginData {
  access_token: string
  token_type: string
  expires_in: number
  user_id?: string
  email?: string
  user_type?: string
  roles?: string[]
  permissions?: string[]
}

// 注意：后端 /api/auth/me 返回 id，不是 user_id
export interface MeData {
  id?: string
  user_id?: string
  email: string
  username?: string
  nickname?: string
  phone?: string
  is_active?: boolean
  user_type?: string
  roles: string[]
  permissions?: string[]
  created_at?: string
}

export const authApi = {
  login: (body: LoginBody) => post<LoginData>('/api/auth/login', body),
  me: () => get<MeData>('/api/auth/me'),
  changePassword: (body: { old_password: string; new_password: string }) =>
    post<void>('/api/auth/password', body),
}
