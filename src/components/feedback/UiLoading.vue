<!--
  UiLoading.vue - 全局加载页组件
  支持全屏加载和内联加载两种模式
  更新时间: 2026-04-16
-->
<template>
  <!-- 全屏加载 -->
  <Teleport v-if="fullscreen" to="body">
    <Transition name="loading-fade">
      <div v-if="visible" class="loading-fullscreen">
        <div class="loading-content">
          <!-- 双色旋转圆环 -->
          <div class="loading-spinner">
            <div class="spinner-outer">
              <svg viewBox="0 0 48 48" class="spinner-svg">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#E2E8F0"
                  stroke-width="4"
                />
              </svg>
            </div>
            <div class="spinner-inner">
              <svg viewBox="0 0 48 48" class="spinner-svg">
                <defs>
                  <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#004ac6" />
                    <stop offset="100%" stop-color="#2563eb" />
                  </linearGradient>
                </defs>
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="url(#spinner-gradient)"
                  stroke-width="4"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="dashOffset"
                />
              </svg>
            </div>
          </div>

          <!-- 提示文字 -->
          <p v-if="text" class="loading-text">{{ text }}</p>

          <!-- Logo -->
          <div v-if="showLogo" class="loading-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2" opacity="0.6" />
              <circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="2" opacity="0.4" />
              <circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.8" />
            </svg>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 内联加载 -->
  <Transition v-else name="loading-fade">
    <div v-if="visible" class="loading-inline" :class="[`loading-${size}`]">
      <div class="loading-spinner-inline">
        <svg viewBox="0 0 24 24" class="spinner-svg-inline">
          <defs>
            <linearGradient id="spinner-gradient-inline" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#004ac6" />
              <stop offset="100%" stop-color="#2563eb" />
            </linearGradient>
          </defs>
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="#E2E8F0"
            stroke-width="2"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="url(#spinner-gradient-inline)"
            stroke-width="2"
            stroke-linecap="round"
            :stroke-dasharray="circumferenceInline"
            :stroke-dashoffset="dashOffsetInline"
          />
        </svg>
      </div>
      <span v-if="text" class="loading-inline-text">{{ text }}</span>
    </div>
  </Transition>

  <!-- 加载遮罩 (用于表格/卡片) -->
  <Teleport v-if="overlay" to="body">
    <Transition name="loading-fade">
      <div v-if="visible" class="loading-overlay" @click.stop>
        <div class="loading-overlay-content">
          <div class="loading-spinner-overlay">
            <svg viewBox="0 0 32 32" class="spinner-svg-overlay">
              <defs>
                <linearGradient id="spinner-gradient-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#004ac6" />
                  <stop offset="100%" stop-color="#2563eb" />
                </linearGradient>
              </defs>
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="#E2E8F0"
                stroke-width="2"
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="url(#spinner-gradient-overlay)"
                stroke-width="2"
                stroke-linecap="round"
                :stroke-dasharray="circumferenceOverlay"
                :stroke-dashoffset="dashOffsetOverlay"
              />
            </svg>
          </div>
          <span v-if="text" class="loading-overlay-text">{{ text }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  visible: boolean
  fullscreen?: boolean
  overlay?: boolean
  text?: string
  size?: 'sm' | 'md' | 'lg'
  showLogo?: boolean
  spinning?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fullscreen: false,
  overlay: false,
  text: '正在加载...',
  size: 'md',
  showLogo: true,
  spinning: true,
})

// 旋转动画
const rotation = ref(0)
let animationFrame: number | null = null

function animate() {
  if (props.spinning) {
    rotation.value = (rotation.value + 1) % 360
    animationFrame = requestAnimationFrame(animate)
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    animate()
  } else if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
})

onMounted(() => {
  if (props.visible) {
    animate()
  }
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})

// 圆环计算
const circumference = computed(() => 2 * Math.PI * 20)
const circumferenceInline = computed(() => 2 * Math.PI * 10)
const circumferenceOverlay = computed(() => 2 * Math.PI * 12)

const dashOffset = computed(() => {
  if (!props.spinning) return circumference.value
  return circumference.value * 0.75 // 显示 75% 的弧度
})

const dashOffsetInline = computed(() => {
  if (!props.spinning) return circumferenceInline.value
  return circumferenceInline.value * 0.75
})

const dashOffsetOverlay = computed(() => {
  if (!props.spinning) return circumferenceOverlay.value
  return circumferenceOverlay.value * 0.75
})
</script>

<style scoped>
/* ==================== 全屏加载 ==================== */
.loading-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* ==================== 旋转圆环 ==================== */
.loading-spinner {
  position: relative;
  width: 64px;
  height: 64px;
}

.spinner-outer,
.spinner-inner {
  position: absolute;
  inset: 0;
}

.spinner-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

/* 外圈静止，内圈旋转 */
.spinner-inner {
  animation: spin-outer 3s linear infinite reverse;
}

.spinner-inner .spinner-svg {
  animation: spin-inner 1s linear infinite;
}

@keyframes spin-outer {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-inner {
  from { transform: rotate(-90deg); }
  to { transform: rotate(270deg); }
}

/* ==================== 提示文字 ==================== */
.loading-text {
  font-size: 14px;
  font-weight: 500;
  color: #64748B;
  margin: 0;
  text-align: center;
}

/* ==================== Logo ==================== */
.loading-logo {
  color: #94A3B8;
  opacity: 0.6;
  animation: pulse-logo 2s ease-in-out infinite;
}

@keyframes pulse-logo {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

/* ==================== 内联加载 ==================== */
.loading-inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.loading-sm {
  font-size: 12px;
}

.loading-md {
  font-size: 14px;
}

.loading-lg {
  font-size: 16px;
}

.loading-spinner-inline {
  width: 20px;
  height: 20px;
}

.spinner-svg-inline {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.loading-inline-text {
  color: #64748B;
}

/* ==================== 加载遮罩 ==================== */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: inherit;
}

.loading-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-spinner-overlay {
  width: 32px;
  height: 32px;
}

.spinner-svg-overlay {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  animation: spin-overlay 0.8s linear infinite;
}

@keyframes spin-overlay {
  from { transform: rotate(-90deg); }
  to { transform: rotate(270deg); }
}

.loading-overlay-text {
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}

/* ==================== 动画 ==================== */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.2s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
