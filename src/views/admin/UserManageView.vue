<template>
  <div class="page-container">
    <!-- Tab标签 -->
    <div class="tabs-container">
      <button class="tab" :class="{active:tab==='users'}" @click="tab='users'">
        用户
      </button>
      <button class="tab" :class="{active:tab==='roles'}" @click="tab='roles'">
        角色
      </button>
      <button class="tab" :class="{active:tab==='permissions'}" @click="tab='permissions'">
        权限
      </button>
    </div>

    <div
      v-if="tab==='users'"
      class="card"
    >
      <table
        v-if="users.length"
        class="data-table"
      >
        <thead>
          <tr>
            <th>用户名</th><th>角色</th><th>状态</th><th>最后登录</th><th style="text-align:right">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in users"
            :key="u.id"
          >
            <td>{{ u.username }}</td>
            <td>{{ roleName(u.role) }}</td>
            <td>
              <span
                class="badge"
                :class="u.status==='active'?'badge-green':'badge-red'"
              >{{ u.status==='active'?'正常':'禁用' }}</span>
            </td>
            <td class="font-mono">
              {{ u.last_login_at ? fmt(u.last_login_at) : '从未登录' }}
            </td>
            <td style="text-align:right">
              <div class="row-actions">
                <button
                  class="btn btn-ghost action-btn"
                  @click="openEditUser(u)"
                >
                  编辑
                </button>
                <button
                  class="btn btn-danger action-btn"
                  :disabled="u.username==='admin@system'"
                  @click="delUser(u)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="tab==='roles'"
      class="card"
    >
      <table class="data-table">
        <thead>
          <tr>
            <th>角色名</th><th>显示名</th><th>权限</th><th>菜单</th><th>类型</th><th style="text-align:right">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in roles"
            :key="r.name"
          >
            <td class="font-mono">
              {{ r.name }}
            </td>
            <td>{{ r.display_name }}</td>
            <td>{{ r.permissions.length }}</td>
            <td>{{ (r.menus || []).length }}</td>
            <td>
              <span
                class="badge"
                :class="r.is_builtin ? 'badge-gray':'badge-green'"
              >{{ r.is_builtin?'内置':'自定义' }}</span>
            </td>
            <td style="text-align:right">
              <div class="row-actions">
                <button
                  class="btn btn-ghost action-btn"
                  @click="openEditRole(r)"
                >
                  编辑
                </button>
                <button
                  class="btn btn-danger action-btn"
                  :disabled="r.is_builtin"
                  @click="delRole(r)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="tab==='permissions'"
      class="card"
    >
      <table class="data-table">
        <thead><tr><th>权限</th><th>说明</th></tr></thead>
        <tbody>
          <tr
            v-for="p in permissionDefs"
            :key="p.key"
          >
            <td class="font-mono">
              {{ p.key }}
            </td><td>{{ p.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <teleport to="body">
      <div
        v-if="showUser"
        class="mask"
        @click.self="showUser=false"
      >
        <div class="drawer">
          <h3>{{ editingUser ? '编辑用户' : '新增用户' }}</h3>
          <label>用户名</label><input
            v-model="userForm.username"
            class="input"
            :disabled="!!editingUser"
          >
          <label v-if="!editingUser">密码</label><input
            v-if="!editingUser"
            v-model="userForm.password"
            class="input"
            type="password"
          >
          <label>角色</label>
          <select
            v-model="userForm.role"
            class="select"
          >
            <option
              v-for="r in roles"
              :key="r.name"
              :value="r.name"
            >
              {{ r.display_name }}
            </option>
          </select>
          <div class="actions">
            <button
              class="btn btn-ghost"
              @click="showUser=false"
            >
              取消
            </button><button
              class="btn btn-primary"
              :disabled="saving"
              @click="saveUser"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div
        v-if="showRole"
        class="mask"
        @click.self="showRole=false"
      >
        <div class="drawer wide">
          <h3>{{ editingRole ? '编辑角色' : '新增角色' }}</h3>
          <label>角色标识</label><input
            v-model="roleForm.name"
            class="input"
            :disabled="!!editingRole"
          >
          <label>显示名</label><input
            v-model="roleForm.display_name"
            class="input"
          >

          <label>菜单访问（勾选）</label>
          <div class="checks">
            <label
              v-for="m in menuDefs"
              :key="m.path"
            ><input
              v-model="roleForm.menus"
              type="checkbox"
              :value="m.path"
            > {{ m.label }}</label>
          </div>

          <label>接口权限（勾选）</label>
          <div class="checks">
            <label
              v-for="p in permissionDefs"
              :key="p.key"
            ><input
              v-model="roleForm.permissions"
              type="checkbox"
              :value="p.key"
            > <span class="font-mono">{{ p.key }}</span></label>
          </div>

          <div class="actions">
            <button
              class="btn btn-ghost"
              @click="showRole=false"
            >
              取消
            </button><button
              class="btn btn-primary"
              :disabled="saving"
              @click="saveRole"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { userApi, type User, type Role } from '@/api/userApi'

const tab = ref<'users'|'roles'|'permissions'>('users')
const loadingUsers = ref(false)
const loadingRoles = ref(false)
const saving = ref(false)

const permissionDefs = [
  { key:'products:read', desc:'查看产品数据' },{ key:'products:write', desc:'写入产品数据（预留）' },{ key:'specs:read', desc:'查看规格' },
  { key:'crawl:read', desc:'查看采集任务' },{ key:'crawl:write', desc:'触发采集任务' },{ key:'scheduler:read', desc:'查看调度状态' },
  { key:'scheduler:write', desc:'控制调度' },{ key:'monitor:read', desc:'查看价格监控' },{ key:'system:read', desc:'查看系统汇总' },
  { key:'system:write', desc:'修改系统配置（预留）' },{ key:'users:read', desc:'查看用户列表' },{ key:'users:write', desc:'增删改用户' },
  { key:'roles:read', desc:'查看角色列表' },{ key:'roles:write', desc:'增删改角色' },{ key:'*', desc:'超级权限' },
]

const menuDefs = [
  { path:'/', label:'仪表盘' },{ path:'/products', label:'产品中心' },{ path:'/monitor', label:'价格监控' },{ path:'/scheduler', label:'调度管理' },
  { path:'/admin/dashboard', label:'系统监控' },{ path:'/admin/sessions', label:'会话管理' },
  { path:'/admin/config', label:'配置中心' },{ path:'/admin/announce', label:'系统公告' },{ path:'/biz/users', label:'用户管理' },
]

const roles = ref<Role[]>([])
const users = ref<User[]>([])

const showUser = ref(false)
const editingUser = ref<User | null>(null)
const userForm = ref({ username:'', password:'', role:'viewer' })

const showRole = ref(false)
const editingRole = ref<Role | null>(null)
const roleForm = ref({ name:'', display_name:'', permissions: [] as string[], menus: [] as string[] })

const roleName = (n: string) => roles.value.find(r => r.name===n)?.display_name || n
const fmt = (iso: string) => new Date(iso).toLocaleString('zh-CN', { hour12:false })

async function loadUsers() {
  loadingUsers.value = true
  try {
    const res = await userApi.getUsers()
    if (res.success && res.data) users.value = res.data.users || []
  } finally {
    loadingUsers.value = false
  }
}

async function loadRoles() {
  loadingRoles.value = true
  try {
    const res = await userApi.getRoles()
    if (res.success && res.data) roles.value = res.data.roles || []
  } finally {
    loadingRoles.value = false
  }
}

function openCreateUser(){ editingUser.value=null; userForm.value={ username:'', password:'', role: roles.value[0]?.name || 'viewer' }; showUser.value=true }
function openEditUser(u: User){ editingUser.value=u; userForm.value={ username:u.username, password:'', role:u.role }; showUser.value=true }

async function saveUser(){
  if (!userForm.value.username.trim()) return
  saving.value = true
  try {
    if (!editingUser.value) {
      if (!userForm.value.password) return
      await userApi.createUser({ username: userForm.value.username.trim(), password: userForm.value.password, role: userForm.value.role })
    } else {
      await userApi.updateUser(editingUser.value.id, { role: userForm.value.role })
    }
    showUser.value=false
    await loadUsers()
  } finally {
    saving.value = false
  }
}

async function delUser(u: User){
  if (!window.confirm(`确认删除用户 ${u.username} ？`)) return
  await userApi.deleteUser(u.id)
  await loadUsers()
}

function openCreateRole(){ editingRole.value=null; roleForm.value={ name:'', display_name:'', permissions:[], menus:[] }; showRole.value=true }
function openEditRole(r: Role){ editingRole.value=r; roleForm.value={ name:r.name, display_name:r.display_name, permissions:[...r.permissions], menus:[...(r.menus || [])] }; showRole.value=true }

async function saveRole(){
  if (!roleForm.value.name.trim() || !roleForm.value.display_name.trim()) return
  if (roleForm.value.permissions.includes('*')) roleForm.value.permissions=['*']
  saving.value = true
  try {
    if (!editingRole.value) {
      await userApi.createRole({
        name: roleForm.value.name.trim(),
        display_name: roleForm.value.display_name.trim(),
        permissions: [...roleForm.value.permissions],
        menus: [...roleForm.value.menus],
      })
    } else {
      await userApi.updateRole(editingRole.value.name, {
        display_name: roleForm.value.display_name.trim(),
        permissions: [...roleForm.value.permissions],
        menus: [...roleForm.value.menus],
      })
    }
    showRole.value=false
    await loadRoles()
    await loadUsers()
  } finally {
    saving.value = false
  }
}

async function delRole(r: Role){
  if (r.is_builtin) return
  if (!window.confirm(`确认删除角色 ${r.display_name} ？`)) return
  await userApi.deleteRole(r.name)
  await loadRoles()
}

onMounted(async () => {
  await Promise.all([loadRoles(), loadUsers()])
})
</script>

<style scoped>
/* inherits from global .page-container */
.tabs { display:flex; gap:10px; }
.tab {
  border:1px solid #DDE5EC;
  background:#F8FAFC;
  border-radius:10px;
  padding:8px 14px;
  cursor:pointer;
  color:#64748B;
  font-weight:600;
  transition:all .2s ease;
}
.tab:hover {
  background:#F1F5F9;
  border-color:#C8D6E5;
  color:#334155;
}
.tab.active {
  border-color: rgba(0,196,204,.48);
  color: #0E7490;
  background: rgba(0,196,204,.14);
  box-shadow: 0 0 0 1px rgba(0,196,204,.2) inset;
}

.mask {
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.38);
  backdrop-filter:blur(3px);
  display:flex;
  justify-content:flex-end;
  z-index:99;
}
.drawer {
  width:420px;
  height:100vh;
  background:#FFFFFF;
  border-left:1px solid #E5E7EB;
  padding:18px;
  overflow:auto;
  display:flex;
  flex-direction:column;
  gap:10px;
  color:var(--text-primary);
}
.drawer h3 { font-size:16px; margin-bottom:4px; }
.drawer.wide { width:620px; }
.checks {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:6px;
  font-size:12px;
  color:var(--text-secondary);
}
.row-actions {
  display:inline-flex;
  align-items:center;
  justify-content:flex-end;
  gap:8px;
}
.action-btn {
  padding:4px 12px;
  min-width:52px;
}
.actions { display:flex; justify-content:flex-end; gap:10px; margin-top:8px; }
@media (max-width:860px) {
  .drawer, .drawer.wide { width:100%; }
  .checks { grid-template-columns:1fr; }
}

/* Tab标签IDC风格 */
.tabs-container {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 12px;
  width: fit-content;
}
.tabs-container .tab {
  padding: 8px 20px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tabs-container .tab:hover {
  background: #ffffff;
  color: #374151;
}
.tabs-container .tab.active {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
