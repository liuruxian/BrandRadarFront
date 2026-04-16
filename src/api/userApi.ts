import { get, post, put, del } from './client'

// 用户类型
export interface User {
  user_id: string
  email: string
  username: string
  nickname: string
  phone: string
  user_type: 'system' | 'frontend'
  is_active: boolean
  roles: string[]
  created_at: string
  updated_at?: string
}

export interface UsersData {
  users: User[]
  total?: number
  page?: number
  page_size?: number
}

export interface CreateUserBody {
  email: string
  password: string
  user_type?: 'system' | 'frontend'
  roles?: string[]
  username?: string
  nickname?: string
  phone?: string
}

export interface UpdateUserBody {
  is_active?: boolean
  roles?: string[]
  password?: string
  username?: string
  nickname?: string
  phone?: string
}

// 角色类型
export interface Role {
  role_id: string
  name: string
  label: string
  description?: string
  is_builtin: boolean
  permissions: string[]
}

export interface RolesData {
  roles: Role[]
}

export interface CreateRoleBody {
  name: string
  label: string
  description?: string
  permissions: string[]
}

export interface UpdateRoleBody {
  label?: string
  description?: string
  permissions?: string[]
}

export interface Session {
  session_id: string
  user_id: string
  username: string
  login_at: string
  last_active_at: string
  user_agent?: string
  ip_address?: string
  is_active: boolean
}

export interface SessionsData {
  sessions: Session[]
}

export interface TerminateSessionBody {
  reason?: string
}

// 公告类型
export interface Announcement {
  announcement_id: string
  title: string
  content: string
  level: 'info' | 'warning' | 'error'
  is_published: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface AnnouncementsData {
  announcements: Announcement[]
}

export interface CreateAnnouncementBody {
  title: string
  content: string
  level?: 'info' | 'warning' | 'error'
  is_published?: boolean
}

export interface UpdateAnnouncementBody {
  title?: string
  content?: string
  level?: 'info' | 'warning' | 'error'
  is_published?: boolean
}

export const userApi = {
  // 用户管理
  getUsers: (params?: { user_type?: 'system' | 'frontend'; page?: number; page_size?: number }) =>
    get<UsersData>('/api/users', params as Record<string, unknown>),

  getUser: (userId: string) => get<User>(`/api/users/${userId}`),

  createUser: (body: CreateUserBody) => post<User>('/api/users', body),

  updateUser: (userId: string, body: UpdateUserBody) => put<User>(`/api/users/${userId}`, body),

  deleteUser: (userId: string) => del<void>(`/api/users/${userId}`),

  getCurrentUser: () => get<User>('/api/users/me'),

  updateCurrentUser: (body: { nickname?: string; email?: string; phone?: string }) =>
    put<User>('/api/users/me', body),

  // 角色管理
  getRoles: () => get<RolesData>('/api/roles'),

  getRole: (roleId: string) => get<Role>(`/api/roles/${roleId}`),

  createRole: (body: CreateRoleBody) => post<Role>('/api/roles', body),

  updateRole: (roleId: string, body: UpdateRoleBody) => put<Role>(`/api/roles/${roleId}`, body),

  deleteRole: (roleId: string) => del<void>(`/api/roles/${roleId}`),

  // 会话管理
  getSessions: (params?: { user_type?: 'system' | 'frontend'; page?: number; page_size?: number }) =>
    get<SessionsData>('/api/sessions', params as Record<string, unknown>),

  terminateSession: (sessionId: string, body?: TerminateSessionBody) =>
    post<void>(`/api/sessions/${sessionId}/terminate`, body ?? {}),

  // 公告管理
  getAnnouncements: (params?: { include_unpublished?: boolean }) =>
    get<AnnouncementsData>('/api/announcements', params as Record<string, unknown>),

  createAnnouncement: (body: CreateAnnouncementBody) => post<Announcement>('/api/announcements', body),

  updateAnnouncement: (announcementId: string, body: UpdateAnnouncementBody) =>
    put<Announcement>(`/api/announcements/${announcementId}`, body),

  deleteAnnouncement: (announcementId: string) => del<void>(`/api/announcements/${announcementId}`),
}
