import { get, post, put, del } from './client'

export interface User {
  id: string
  username: string
  role: string
  status: 'active' | 'disabled'
  created_at: string
  last_login_at: string | null
}

export interface UsersData {
  users: User[]
}

export interface CreateUserBody {
  username: string
  password: string
  role: string
}

export interface UpdateUserBody {
  role?: string
  status?: 'active' | 'disabled'
}

export interface Role {
  name: string
  display_name: string
  is_builtin: boolean
  permissions: string[]
  menus?: string[]
}

export interface RolesData {
  roles: Role[]
}

export const userApi = {
  getUsers: () => get<UsersData>('/api/users'),
  createUser: (body: CreateUserBody) => post<User>('/api/users', body),
  updateUser: (id: string, body: UpdateUserBody) => put<User>(`/api/users/${id}`, body),
  deleteUser: (id: string) => del<void>(`/api/users/${id}`),
  resetPassword: (id: string, password: string) => put<void>(`/api/users/${id}/password`, { password }),

  getRoles: () => get<RolesData>('/api/roles'),
  createRole: (body: { name: string; display_name: string; permissions: string[]; menus: string[] }) =>
    post<Role>('/api/roles', body),
  updateRole: (name: string, body: { display_name?: string; permissions?: string[]; menus?: string[] }) =>
    put<Role>(`/api/roles/${name}`, body),
  deleteRole: (name: string) => del<void>(`/api/roles/${name}`),
}
