<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">用户管理</h2>
        <p class="page-subtitle">用户、角色、权限管理</p>
      </div>
      <button v-if="tab==='users'" class="btn btn-primary" @click="openCreateUser">+ 新增用户</button>
      <button v-if="tab==='roles'" class="btn btn-primary" @click="openCreateRole">+ 新增角色</button>
    </div>

    <div class="card" style="padding:10px;margin-bottom:14px">
      <div class="tabs">
        <button class="tab" :class="{active:tab==='users'}" @click="tab='users'">用户</button>
        <button class="tab" :class="{active:tab==='roles'}" @click="tab='roles'">角色</button>
        <button class="tab" :class="{active:tab==='permissions'}" @click="tab='permissions'">权限</button>
      </div>
    </div>

    <div v-if="tab==='users'" class="card">
      <table class="data-table" v-if="users.length">
        <thead><tr><th>用户名</th><th>角色</th><th>状态</th><th>最后登录</th><th style="text-align:right">操作</th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.username }}</td>
            <td>{{ roleName(u.role) }}</td>
            <td><span class="badge" :class="u.status==='active'?'badge-green':'badge-red'">{{ u.status==='active'?'正常':'禁用' }}</span></td>
            <td class="font-mono">{{ u.last_login_at ? fmt(u.last_login_at) : '从未登录' }}</td>
            <td style="text-align:right">
              <button class="btn btn-ghost" style="padding:4px 10px" @click="openEditUser(u)">编辑</button>
              <button class="btn btn-danger" style="padding:4px 10px" :disabled="u.username==='admin@system'" @click="delUser(u)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="tab==='roles'" class="card">
      <table class="data-table">
        <thead><tr><th>角色名</th><th>显示名</th><th>权限</th><th>菜单</th><th>类型</th><th style="text-align:right">操作</th></tr></thead>
        <tbody>
          <tr v-for="r in roles" :key="r.name">
            <td class="font-mono">{{ r.name }}</td>
            <td>{{ r.display_name }}</td>
            <td>{{ r.permissions.length }}</td>
            <td>{{ r.menus.length }}</td>
            <td><span class="badge" :class="r.is_builtin ? 'badge-gray':'badge-green'">{{ r.is_builtin?'内置':'自定义' }}</span></td>
            <td style="text-align:right">
              <button class="btn btn-ghost" style="padding:4px 10px" @click="openEditRole(r)">编辑</button>
              <button class="btn btn-danger" style="padding:4px 10px" :disabled="r.is_builtin" @click="delRole(r)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="tab==='permissions'" class="card">
      <table class="data-table">
        <thead><tr><th>权限</th><th>说明</th></tr></thead>
        <tbody><tr v-for="p in permissionDefs" :key="p.key"><td class="font-mono">{{ p.key }}</td><td>{{ p.desc }}</td></tr></tbody>
      </table>
    </div>

    <teleport to="body">
      <div v-if="showUser" class="mask" @click.self="showUser=false">
        <div class="drawer">
          <h3>{{ editingUser ? '编辑用户' : '新增用户' }}</h3>
          <label>用户名</label><input class="input" v-model="userForm.username" :disabled="!!editingUser"/>
          <label v-if="!editingUser">密码</label><input v-if="!editingUser" class="input" type="password" v-model="userForm.password"/>
          <label>角色</label>
          <select class="select" v-model="userForm.role"><option v-for="r in roles" :key="r.name" :value="r.name">{{ r.display_name }}</option></select>
          <div class="actions"><button class="btn btn-ghost" @click="showUser=false">取消</button><button class="btn btn-primary" @click="saveUser">保存</button></div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showRole" class="mask" @click.self="showRole=false">
        <div class="drawer wide">
          <h3>{{ editingRole ? '编辑角色' : '新增角色' }}</h3>
          <label>角色标识</label><input class="input" v-model="roleForm.name" :disabled="!!editingRole"/>
          <label>显示名</label><input class="input" v-model="roleForm.display_name"/>

          <label>菜单访问（勾选）</label>
          <div class="checks"><label v-for="m in menuDefs" :key="m.path"><input type="checkbox" :value="m.path" v-model="roleForm.menus"/> {{ m.label }}</label></div>

          <label>接口权限（勾选）</label>
          <div class="checks"><label v-for="p in permissionDefs" :key="p.key"><input type="checkbox" :value="p.key" v-model="roleForm.permissions"/> <span class="font-mono">{{ p.key }}</span></label></div>

          <div class="actions"><button class="btn btn-ghost" @click="showRole=false">取消</button><button class="btn btn-primary" @click="saveRole">保存</button></div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type User = { id: string; username: string; role: string; status: 'active'|'disabled'; last_login_at: string | null }
type Role = { name: string; display_name: string; is_builtin: boolean; permissions: string[]; menus: string[] }

const tab = ref<'users'|'roles'|'permissions'>('users')

const permissionDefs = [
  { key:'products:read', desc:'查看产品数据' },{ key:'products:write', desc:'写入产品数据（预留）' },{ key:'specs:read', desc:'查看规格' },
  { key:'crawl:read', desc:'查看采集任务' },{ key:'crawl:write', desc:'触发采集任务' },{ key:'scheduler:read', desc:'查看调度状态' },
  { key:'scheduler:write', desc:'控制调度' },{ key:'monitor:read', desc:'查看价格监控' },{ key:'system:read', desc:'查看系统汇总' },
  { key:'system:write', desc:'修改系统配置（预留）' },{ key:'users:read', desc:'查看用户列表' },{ key:'users:write', desc:'增删改用户' },
  { key:'roles:read', desc:'查看角色列表' },{ key:'roles:write', desc:'增删改角色' },{ key:'*', desc:'超级权限' },
]

const menuDefs = [
  { path:'/', label:'仪表盘' },{ path:'/products', label:'产品中心' },{ path:'/monitor', label:'价格监控' },{ path:'/scheduler', label:'调度管理' },
  { path:'/admin/dashboard', label:'系统监控' },{ path:'/admin/console', label:'服务控制台' },{ path:'/admin/logs', label:'日志审计' },{ path:'/admin/sessions', label:'会话管理' },
  { path:'/admin/backup', label:'备份恢复' },{ path:'/admin/config', label:'配置中心' },{ path:'/admin/announce', label:'系统公告' },{ path:'/biz/users', label:'用户管理' },
]

const roles = ref<Role[]>([
  { name:'superadmin', display_name:'超级管理员', is_builtin:true, permissions:['*'], menus:menuDefs.map(x=>x.path) },
  { name:'admin', display_name:'系统管理员', is_builtin:true, permissions:['products:read','specs:read','crawl:read','crawl:write','scheduler:read','scheduler:write','monitor:read','users:read','users:write','roles:read','roles:write'], menus:menuDefs.map(x=>x.path) },
  { name:'operator', display_name:'采集/运营', is_builtin:true, permissions:['products:read','specs:read','crawl:read','crawl:write','scheduler:read','scheduler:write','monitor:read'], menus:['/','/products','/monitor','/scheduler'] },
  { name:'viewer', display_name:'只读用户', is_builtin:true, permissions:['products:read','specs:read','scheduler:read','monitor:read'], menus:['/','/products','/monitor','/scheduler'] },
  { name:'frontend', display_name:'前端用户', is_builtin:true, permissions:['products:read','specs:read','monitor:read'], menus:['/','/products','/monitor'] },
])

const users = ref<User[]>([{ id:'1', username:'admin@system', role:'superadmin', status:'active', last_login_at:new Date().toISOString() }])

const showUser = ref(false)
const editingUser = ref<User | null>(null)
const userForm = ref({ username:'', password:'', role:'viewer' })

const showRole = ref(false)
const editingRole = ref<Role | null>(null)
const roleForm = ref({ name:'', display_name:'', permissions: [] as string[], menus: [] as string[] })

const roleName = (n: string) => roles.value.find(r => r.name===n)?.display_name || n
const fmt = (iso: string) => new Date(iso).toLocaleString('zh-CN', { hour12:false })

function openCreateUser(){ editingUser.value=null; userForm.value={ username:'', password:'', role:'viewer' }; showUser.value=true }
function openEditUser(u: User){ editingUser.value=u; userForm.value={ username:u.username, password:'', role:u.role }; showUser.value=true }
function saveUser(){ if (!userForm.value.username.trim()) return; if (!editingUser.value) users.value.push({ id:String(Date.now()), username:userForm.value.username.trim(), role:userForm.value.role, status:'active', last_login_at:null }); else editingUser.value.role=userForm.value.role; showUser.value=false }
function delUser(u: User){ users.value = users.value.filter(x => x.id!==u.id) }

function openCreateRole(){ editingRole.value=null; roleForm.value={ name:'', display_name:'', permissions:[], menus:[] }; showRole.value=true }
function openEditRole(r: Role){ editingRole.value=r; roleForm.value={ name:r.name, display_name:r.display_name, permissions:[...r.permissions], menus:[...r.menus] }; showRole.value=true }
function saveRole(){ if (!roleForm.value.name.trim() || !roleForm.value.display_name.trim()) return; if (roleForm.value.permissions.includes('*')) roleForm.value.permissions=['*']; if (!editingRole.value) roles.value.push({ name:roleForm.value.name.trim(), display_name:roleForm.value.display_name.trim(), is_builtin:false, permissions:[...roleForm.value.permissions], menus:[...roleForm.value.menus] }); else { editingRole.value.display_name=roleForm.value.display_name.trim(); editingRole.value.permissions=[...roleForm.value.permissions]; editingRole.value.menus=[...roleForm.value.menus] } showRole.value=false }
function delRole(r: Role){ if (r.is_builtin) return; roles.value = roles.value.filter(x => x.name!==r.name); users.value = users.value.map(u => u.role===r.name ? { ...u, role:'viewer' } : u) }
</script>

<style scoped>
.tabs { display:flex; gap:8px; }
.tab {
  border:1px solid #E5E7EB;
  background:#FFFFFF;
  border-radius:10px;
  padding:7px 14px;
  cursor:pointer;
  color:#6B7280;
  font-size:13px;
  font-weight:600;
  font-family:var(--font-sans);
  transition:all .18s ease;
}
.tab:hover { background:#F9FAFB; color:#374151; border-color:#D1D5DB; }
.tab.active {
  border-color:#00C4CC;
  color:#00AAB1;
  background:rgba(0,196,204,.08);
}

.mask {
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.22);
  backdrop-filter:blur(2px);
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
.drawer h3 { font-size:16px; margin-bottom:4px; color:var(--text-primary); }
.drawer.wide { width:620px; }
.checks {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:6px;
  font-size:12px;
  color:var(--text-secondary);
}
.checks input[type='checkbox'] { accent-color:#00C4CC; }
.actions { display:flex; justify-content:flex-end; gap:10px; margin-top:8px; }
@media (max-width:860px) {
  .drawer, .drawer.wide { width:100%; }
  .checks { grid-template-columns:1fr; }
}
</style>
