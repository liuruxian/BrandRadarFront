import { get, post } from './client'

export interface LoginBody {
  username: string
  password: string
}

export interface LoginData {
  token: string
  username: string
  role: string
  expires_at: string
  menus?: string[]
}

export interface MeData {
  username: string
  role: string
  login_at: string
  menus?: string[]
}

export const authApi = {
  login: (body: LoginBody) => post<LoginData>('/api/auth/login', body),
  logout: () => post<void>('/api/auth/logout', {}),
  me: () => get<MeData>('/api/auth/me'),
  changePassword: (body: { old_password: string; new_password: string }) =>
    post<void>('/api/auth/password', body),
}
