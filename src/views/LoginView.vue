<template>
  <div class="login-page">
    <div class="login-bg" />

    <div class="login-card animate-fade-up">
      <div class="brand-row">
        <div class="brand-mark">
          <svg
            width="28"
            height="28"
            viewBox="0 0 26 26"
            fill="none"
          >
            <circle
              cx="13"
              cy="13"
              r="11"
              stroke="url(#lg)"
              stroke-width="1.5"
            />
            <circle
              cx="13"
              cy="13"
              r="5.5"
              stroke="url(#lg)"
              stroke-width="1.5"
            />
            <circle
              cx="13"
              cy="13"
              r="2"
              fill="url(#lg)"
            />
            <defs>
              <linearGradient
                id="lg"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop
                  offset="0%"
                  stop-color="#00C4CC"
                />
                <stop
                  offset="100%"
                  stop-color="#10B981"
                />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <div class="brand-title">
            品牌雷达
          </div>
          <div class="brand-sub">
            Brand Intelligence Platform
          </div>
        </div>
      </div>

      <h1 class="login-title">
        欢迎登录
      </h1>
      <p class="login-desc">
        全球品牌监控与智能分析平台
      </p>

      <form
        class="login-form"
        @submit.prevent="onSubmit"
      >
        <div class="field">
          <label>账号</label>
          <input
            v-model="form.username"
            class="input"
            placeholder="admin@system"
            autocomplete="username"
          >
        </div>
        <div class="field">
          <label>密码</label>
          <input
            v-model="form.password"
            class="input"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          >
        </div>

        <div
          v-if="auth.error"
          class="error-text"
        >
          {{ auth.error }}
        </div>

        <button
          class="login-btn"
          :disabled="auth.loading"
        >
          <svg
            v-if="auth.loading"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="animate-spin"
          ><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
          {{ auth.loading ? '登录中...' : '立即登录' }}
        </button>
      </form>

      <div class="demo-hint">
        <span>演示账号：admin@system / admin123</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({
  username: 'admin@system',
  password: 'admin123'
})

async function onSubmit() {
  if (!form.username.trim() || !form.password.trim()) return
  const ok = await auth.login({ username: form.username.trim(), password: form.password })
  if (!ok) return
  await auth.fetchMe()
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.replace(redirect)
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  background: #FFFFFF;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(700px 480px at 8% 10%, rgba(0,196,204,0.16), transparent 55%),
    radial-gradient(640px 420px at 92% 12%, rgba(16,185,129,0.12), transparent 58%),
    radial-gradient(860px 560px at 50% 110%, rgba(0,196,204,0.08), transparent 62%),
    linear-gradient(145deg, #FFFFFF 0%, #F7FEFF 52%, #F0FDFA 100%);
  pointer-events: none;
}

.login-card {
  position: relative;
  width: min(460px, 96vw);
  padding: 36px;
  border-radius: 24px;
  background: rgba(255,255,255,0.96);
  border: 1px solid #DFF6F7;
  box-shadow: 0 18px 46px rgba(0,170,177,0.12);
  color: var(--text-primary);
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(0,196,204,0.16), rgba(16,185,129,0.12));
  border: 1px solid rgba(0,196,204,0.25);
  box-shadow: 0 8px 24px rgba(0,196,204,0.14);
}

.brand-title {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #00AAB1;
}

.brand-sub {
  font-size: 11px;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

.login-title {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.04em;
  margin-bottom: 8px;
  color: #111827;
}

.login-desc {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6B7280;
}

.input {
  height: 44px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  color: #111827;
  padding: 0 14px;
  font-size: 13px;
  outline: none;
  transition: all 0.2s var(--ease-out);
  font-family: var(--dt-font-sans);
}

.input::placeholder {
  color: #9CA3AF;
}

.input:hover {
  border-color: #BEECEF;
  background: #FCFFFF;
}

.input:focus {
  border-color: #00C4CC;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(0,196,204,0.14);
}

.error-text {
  padding: 10px 14px;
  border-radius: 12px;
  background: #FFF1F2;
  border: 1px solid #FFE4E6;
  color: #E11D48;
  font-size: 12px;
  line-height: 1.5;
}

.login-btn {
  margin-top: 6px;
  height: 48px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #00C4CC, #10B981);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 10px 26px rgba(0,170,177,0.28);
  transition: all 0.2s var(--ease-out);
  font-family: var(--dt-font-sans);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(0,170,177,0.34);
}

.login-btn:active:not(:disabled) {
  transform: scale(0.985);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.demo-hint {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
  text-align: center;
  font-size: 11px;
  color: #6B7280;
  letter-spacing: 0.04em;
}
</style>

