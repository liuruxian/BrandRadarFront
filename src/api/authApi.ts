import { get, post } from './client'

export interface LoginBody {
  email: string
  password: string
}

export interface LoginData {
  access_token: string
  token_type: string
  user_id: string
  email: string
  user_type: string
  roles: string[]
  permissions: string[]
}

export interface MeData {
  id: string
  username: string
  nickname: string
  email: string
  phone: string
  user_type: string
  is_active: boolean
  roles: string[]
  permissions: string[]
  created_at: string
  updated_at: string
}

export const authApi = {
  login: (body: LoginBody) => post<LoginData>('/api/auth/login', body),
  logout: () => post<void>('/api/auth/logout', {}),
  me: () => get<MeData>('/api/auth/me'),
  changePassword: (body: { old_password: string; new_password: string }) =>
    post<void>('/api/auth/password', body),
}
