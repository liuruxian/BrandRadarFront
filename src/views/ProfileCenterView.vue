<template>
  <div class="page-container">
    <!-- 页面头部 - IDC风格 -->
    <div class="page-header idc-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="header-title">
          <h1>个人中心</h1>
          <p class="header-desc">查看账号信息并管理个人安全设置</p>
        </div>
      </div>
      <div class="header-right">
        <button
          class="btn btn-idc-primary"
          @click="saveProfile"
        >
          保存资料
        </button>
      </div>
    </div>

    <div
      class="grid-2"
      style="margin-bottom:20px"
    >
      <div class="card animate-fade-up">
        <div class="profile-head">
          <div class="avatar">
            {{ initials }}
          </div>
          <div>
            <div class="name">
              {{ form.nickname || auth.me?.username || '未命名用户' }}
            </div>
            <div class="meta">
              {{ auth.me?.username || '-' }} · {{ roleLabel }}
            </div>
          </div>
        </div>

        <div class="form-row">
          <label>昵称</label>
          <input
            v-model="form.nickname"
            class="input"
            placeholder="请输入昵称"
          >
        </div>
        <div class="form-row">
          <label>邮箱</label>
          <input
            v-model="form.email"
            class="input"
            placeholder="name@example.com"
          >
        </div>
        <div class="form-row">
          <label>手机号</label>
          <input
            v-model="form.phone"
            class="input"
            placeholder="13800000000"
          >
        </div>
      </div>

      <div
        class="card animate-fade-up"
        style="animation-delay:80ms"
      >
        <div class="card-title">
          安全设置
        </div>

        <div class="safe-row">
          <div>
            <div class="safe-title">
              登录密码
            </div>
            <div class="safe-desc">
              定期更新密码，保护账号安全
            </div>
          </div>
          <button
            class="btn btn-ghost"
            @click="showPwd=true"
          >
            修改
          </button>
        </div>

        <div class="safe-row">
          <div>
            <div class="safe-title">
              最近登录
            </div>
            <div class="safe-desc">
              {{ auth.me?.login_at ? fmt(auth.me.login_at) : '—' }}
            </div>
          </div>
          <span class="badge badge-green">正常</span>
        </div>

        <div class="safe-row">
          <div>
            <div class="safe-title">
              当前角色
            </div>
            <div class="safe-desc">
              {{ roleLabel }}
            </div>
          </div>
          <span class="badge badge-blue">已授权</span>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div
        v-if="showPwd"
        class="mask"
        @click.self="showPwd=false"
      >
        <div class="modal">
          <h3>修改密码</h3>
          <div class="form-row">
            <label>旧密码</label><input
              v-model="pwd.old_password"
              class="input"
              type="password"
            >
          </div>
          <div class="form-row">
            <label>新密码</label><input
              v-model="pwd.new_password"
              class="input"
              type="password"
            >
          </div>
          <div class="actions">
            <button
              class="btn btn-ghost"
              @click="showPwd=false"
            >
              取消
            </button>
            <button
              class="btn btn-primary"
              @click="changePassword"
            >
              确认修改
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/authApi'

const auth = useAuthStore()

const form = reactive({
  nickname: auth.me?.username || '',
  email: '',
  phone: ''
})

const roleLabel = computed(() => {
  // 后端返回 roles 数组，不是单个 role 字段
  const role = auth.me?.roles?.[0] || ''
  const map: Record<string, string> = {
    superadmin: '超级管理员',
    admin: '系统管理员',
    operator: '运营',
    viewer: '只读用户'
  }
  return map[role] || role || '未知角色'
})

const initials = computed(() => (form.nickname || auth.me?.username || 'U').slice(0, 2).toUpperCase())

const showPwd = ref(false)
const pwd = reactive({ old_password: '', new_password: '' })

function fmt(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', { hour12: false })
}

function saveProfile() {
  // TODO: 对接个人信息保存 API
  alert('个人资料已保存（演示）')
}

async function changePassword() {
  if (!pwd.old_password || !pwd.new_password) return
  await authApi.changePassword({ old_password: pwd.old_password, new_password: pwd.new_password })
  showPwd.value = false
  pwd.old_password = ''
  pwd.new_password = ''
  alert('密码修改成功')
}
</script>

<style scoped>
.profile-head { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
.avatar {
  width: 56px; height:56px; border-radius:16px;
  background: linear-gradient(135deg, #00C4CC, #8A7FFF);
  display:grid; place-items:center;
  font-size:18px; font-weight:800; color:#fff;
  box-shadow: 0 8px 24px rgba(99,102,241,0.25);
}
.name { font-size:18px; font-weight:800; color:var(--text-primary); }
.meta { font-size:12px; color:var(--text-muted); margin-top:2px; }

.form-row { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.form-row label { font-size:11px; color:var(--text-muted); font-weight:700; letter-spacing:.06em; text-transform:uppercase; }

.card-title { font-size:13px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:.06em; margin-bottom:8px; }
.safe-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 0; border-bottom:1px solid var(--border); }
.safe-row:last-child { border-bottom:0; }
.safe-title { font-size:14px; font-weight:700; color:var(--text-primary); }
.safe-desc { font-size:12px; color:var(--text-muted); margin-top:2px; }

.mask { position:fixed; inset:0; background:rgba(15,23,42,.45); backdrop-filter:blur(3px); display:grid; place-items:center; z-index:100; }
.modal {
  width:min(440px, 92vw);
  background: var(--bg-card);
  border:1px solid var(--border);
  border-radius:16px;
  padding:18px;
  box-shadow: var(--shadow-lg);
}
.modal h3 { margin:0 0 12px; font-size:16px; color:var(--text-primary); }
.actions { display:flex; justify-content:flex-end; gap:8px; margin-top:8px; }

/* ==================== IDC风格页面头部 ==================== */
.idc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.25);
}
.header-left { display: flex; align-items: center; gap: 16px; }
.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  color: white;
}
</style>
