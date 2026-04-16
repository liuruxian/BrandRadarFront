<!--
  UiButtonLoading.vue - 按钮加载组件
  提供带加载状态的按钮包装器
  更新时间: 2026-04-16
-->
<template>
  <div class="ui-button-loading" :class="{ 'is-loading': loading }">
    <!-- 加载状态 -->
    <Transition name="loading-switch">
      <div v-if="loading" class="loading-content">
        <div class="loading-spinner">
          <svg viewBox="0 0 16 16" class="spinner-svg">
            <defs>
              <linearGradient id="button-spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1" />
              </linearGradient>
            </defs>
            <circle
              cx="8"
              cy="8"
              r="6"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              stroke-width="2"
            />
            <circle
              cx="8"
              cy="8"
              r="6"
              fill="none"
              stroke="url(#button-spinner-gradient)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-dasharray="20 18"
            />
          </svg>
        </div>
        <span v-if="loadingText" class="loading-text">{{ loadingText }}</span>
        <span v-else class="loading-placeholder">{{ originalText }}</span>
      </div>
    </Transition>

    <!-- 正常状态 -->
    <Transition name="loading-switch">
      <div v-if="!loading" class="button-content" @click="handleClick">
        <slot>
          <span class="button-text">{{ text }}</span>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  loading: boolean
  text?: string
  loadingText?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '提交',
  loadingText: '',
  disabled: false,
})

const emit = defineEmits<{
  'click': [event: MouseEvent]
}>()

const originalText = computed(() => props.text)

function handleClick(e: MouseEvent) {
  if (props.loading || props.disabled) return
  emit('click', e)
}
</script>

<style scoped>
/* ==================== 容器 ==================== */
.ui-button-loading {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.ui-button-loading.is-loading {
  cursor: not-allowed;
}

/* ==================== 正常状态内容 ==================== */
.button-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: inherit;
  transition: all 0.2s;
}

.button-content:hover {
  filter: brightness(1.05);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
}

.button-content:active {
  transform: scale(0.98);
}

/* ==================== 加载状态内容 ==================== */
.loading-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  border-radius: inherit;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.spinner-svg {
  width: 100%;
  height: 100%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text,
.loading-placeholder {
  white-space: nowrap;
}

/* ==================== 禁用状态 ==================== */
.ui-button-loading.is-disabled,
.ui-button-loading[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.ui-button-loading.is-disabled .button-content,
.ui-button-loading[disabled] .button-content {
  pointer-events: none;
}

/* ==================== 切换动画 ==================== */
.loading-switch-enter-active,
.loading-switch-leave-active {
  transition: all 0.15s ease;
}

.loading-switch-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.loading-switch-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
