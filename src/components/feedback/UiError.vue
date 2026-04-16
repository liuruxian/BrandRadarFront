<!--
  UiError.vue - 错误状态组件
  支持多种错误类型和展示方式
  更新时间: 2026-04-16
-->
<template>
  <div class="ui-error" :class="[`ui-error-${type}`]">
    <!-- 图标 -->
    <div class="ui-error-icon">
      <!-- 加载失败 -->
      <svg v-if="type === 'load-failed'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" stroke="#F59E0B" stroke-width="2" />
        <path d="M32 18v18" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
        <circle cx="32" cy="44" r="2" fill="#F59E0B" />
      </svg>

      <!-- 网络错误 -->
      <svg v-else-if="type === 'network'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" stroke="#F59E0B" stroke-width="2" />
        <path d="M20 20l24 24M44 20L20 44" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" />
        <circle cx="32" cy="32" r="8" stroke="#F59E0B" stroke-width="2" />
      </svg>

      <!-- 服务异常 -->
      <svg v-else-if="type === 'server'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="12" y="20" width="40" height="28" rx="4" stroke="#F59E0B" stroke-width="2" />
        <path d="M24 20v-4a4 4 0 018 0v4" stroke="#F59E0B" stroke-width="2" />
        <circle cx="24" cy="34" r="3" fill="#F59E0B" />
        <circle cx="40" cy="34" r="3" fill="#F59E0B" />
        <path d="M22 42h20" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" />
      </svg>

      <!-- 权限不足 -->
      <svg v-else-if="type === 'permission'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" stroke="#F59E0B" stroke-width="2" />
        <rect x="24" y="28" width="16" height="14" rx="2" stroke="#F59E0B" stroke-width="2" />
        <path d="M28 28v-6a4 4 0 018 0v6" stroke="#F59E0B" stroke-width="2" />
      </svg>

      <!-- 自定义图标 -->
      <slot v-else name="icon" />
    </div>

    <!-- 标题 -->
    <h3 class="ui-error-title">{{ title }}</h3>

    <!-- 描述 -->
    <p v-if="description" class="ui-error-description">{{ description }}</p>

    <!-- 错误详情 (可折叠) -->
    <div v-if="errorCode || $slots.details" class="ui-error-details-wrap">
      <button
        class="ui-error-details-toggle"
        @click="showDetails = !showDetails"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          :class="{ rotated: showDetails }"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {{ showDetails ? '收起详情' : '查看详情' }}
      </button>
      <Transition name="details">
        <div v-if="showDetails" class="ui-error-details">
          <div v-if="errorCode" class="ui-error-code">
            <span class="error-code-label">错误码:</span>
            <code class="error-code-value">{{ errorCode }}</code>
          </div>
          <slot name="details" />
        </div>
      </Transition>
    </div>

    <!-- 操作按钮 -->
    <div class="ui-error-action">
      <slot name="action">
        <button
          v-if="showRetry"
          class="ui-error-btn ui-error-btn-primary"
          @click="$emit('retry')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-9-9" />
            <path d="M21 3v6h-6" />
          </svg>
          重试
        </button>
        <button
          v-if="showBack"
          class="ui-error-btn ui-error-btn-secondary"
          @click="$emit('back')"
        >
          返回
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  type?: 'load-failed' | 'network' | 'server' | 'permission' | 'custom'
  title?: string
  description?: string
  errorCode?: string
  showRetry?: boolean
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'load-failed',
  title: '数据加载失败',
  description: '请稍后重试，或联系管理员获取帮助',
  showRetry: true,
  showBack: false,
})

defineEmits<{
  'retry': []
  'back': []
}>()

const showDetails = ref(false)
</script>

<style scoped>
/* ==================== 容器 ==================== */
.ui-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 图标 ==================== */
.ui-error-icon {
  margin-bottom: 20px;
  color: #F59E0B;
  animation: icon-shake 0.5s ease-in-out;
}

@keyframes icon-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-5px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}

/* ==================== 标题 ==================== */
.ui-error-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

/* ==================== 描述 ==================== */
.ui-error-description {
  margin: 0 0 20px;
  font-size: 14px;
  color: #6B7280;
  max-width: 320px;
  line-height: 1.6;
}

/* ==================== 错误详情 ==================== */
.ui-error-details-wrap {
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
}

.ui-error-details-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: #9CA3AF;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;
}

.ui-error-details-toggle:hover {
  color: #6B7280;
}

.ui-error-details-toggle svg {
  transition: transform 0.2s;
}

.ui-error-details-toggle svg.rotated {
  transform: rotate(180deg);
}

.ui-error-details {
  margin-top: 12px;
  padding: 12px;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 8px;
  text-align: left;
  font-size: 12px;
  font-family: 'SF Mono', Consolas, monospace;
}

.ui-error-code {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-code-label {
  color: #92400E;
}

.error-code-value {
  background: #FDE68A;
  padding: 2px 6px;
  border-radius: 4px;
  color: #92400E;
}

/* ==================== 操作按钮 ==================== */
.ui-error-action {
  display: flex;
  gap: 12px;
  align-items: center;
}

.ui-error-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
}

.ui-error-btn:active {
  transform: scale(0.98);
}

.ui-error-btn-primary {
  background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%);
  color: #FFFFFF;
}

.ui-error-btn-primary:hover {
  filter: brightness(1.05);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
}

.ui-error-btn-secondary {
  background: #FFFFFF;
  color: #6B7280;
  border: 1px solid #E2E8F0;
}

.ui-error-btn-secondary:hover {
  background: #F9FAFB;
  border-color: #CBD5E1;
}

/* ==================== 动画 ==================== */
.details-enter-active,
.details-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.details-enter-from,
.details-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.details-enter-to,
.details-leave-from {
  max-height: 200px;
}
</style>
