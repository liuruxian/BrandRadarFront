<!--
  UiModal.vue - 统一数据弹窗组件
  支持 Modal / Drawer 两种模式
  更新时间: 2026-04-16
-->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="modal-overlay"
        :style="{ zIndex: zIndex }"
        @click.self="handleOverlayClick"
      >
        <!-- Drawer 模式 -->
        <Transition name="drawer">
          <div
            v-if="visible && mode === 'drawer'"
            class="modal-drawer"
            :class="[`modal-drawer-${placement}`]"
            :style="drawerStyle"
            @click.stop
          >
            <div class="modal-header">
              <div class="modal-title-wrap">
                <h2 v-if="title" class="modal-title">{{ title }}</h2>
                <slot name="title" />
              </div>
              <div class="modal-header-actions">
                <slot name="header-actions" />
                <button
                  v-if="showClose"
                  class="modal-close"
                  @click="handleClose"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
              <slot />
            </div>

            <div v-if="$slots.footer || showFooter" class="modal-footer">
              <slot name="footer">
                <div class="modal-footer-default">
                  <button
                    v-if="showCancel"
                    class="modal-btn modal-btn-secondary"
                    @click="handleCancel"
                  >
                    {{ cancelText }}
                  </button>
                  <button
                    class="modal-btn modal-btn-primary"
                    :class="{ 'modal-btn-gradient': !danger }"
                    :disabled="confirmLoading"
                    @click="handleConfirm"
                  >
                    <span v-if="confirmLoading" class="modal-btn-spinner" />
                    {{ confirmLoading ? confirmLoadingText : confirmText }}
                  </button>
                </div>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Modal 模式 -->
    <Transition name="modal-scale">
      <div
        v-if="visible && mode === 'modal'"
        class="modal-overlay"
        :style="{ zIndex: zIndex }"
        @click.self="handleOverlayClick"
      >
        <div
          class="modal-container"
          :class="[`modal-${size}`]"
          :style="containerStyle"
          @click.stop
        >
          <div class="modal-header">
            <div class="modal-title-wrap">
              <h2 v-if="title" class="modal-title">{{ title }}</h2>
              <slot name="title" />
            </div>
            <div class="modal-header-actions">
              <slot name="header-actions" />
              <button
                v-if="showClose"
                class="modal-close"
                @click="handleClose"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
            <slot />
          </div>

          <div v-if="$slots.footer || showFooter" class="modal-footer">
            <slot name="footer">
              <div class="modal-footer-default">
                <button
                  v-if="showCancel"
                  class="modal-btn modal-btn-secondary"
                  @click="handleCancel"
                >
                  {{ cancelText }}
                </button>
                <button
                  class="modal-btn modal-btn-primary"
                  :class="{ 'modal-btn-gradient': !danger, 'modal-btn-danger': danger }"
                  :disabled="confirmLoading"
                  @click="handleConfirm"
                >
                  <span v-if="confirmLoading" class="modal-btn-spinner" />
                  {{ confirmLoading ? confirmLoadingText : confirmText }}
                </button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  visible: boolean
  mode?: 'modal' | 'drawer'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  placement?: 'left' | 'right' | 'top' | 'bottom'
  title?: string
  width?: string
  height?: string
  zIndex?: number
  bodyMaxHeight?: string
  showClose?: boolean
  showFooter?: boolean
  showCancel?: boolean
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
  confirmText?: string
  cancelText?: string
  confirmLoading?: boolean
  confirmLoadingText?: string
  danger?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'modal',
  size: 'md',
  placement: 'right',
  zIndex: 1000,
  bodyMaxHeight: 'calc(85vh - 130px)',
  showClose: true,
  showFooter: true,
  showCancel: true,
  closeOnOverlay: true,
  closeOnEsc: true,
  confirmText: '确认',
  cancelText: '取消',
  confirmLoading: false,
  confirmLoadingText: '处理中...',
  danger: false,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'close': []
  'cancel': []
  'confirm': []
}>()

const drawerStyle = computed(() => ({
  width: props.width || (props.placement === 'left' || props.placement === 'right' ? '480px' : '100%'),
  height: props.height || (props.placement === 'top' || props.placement === 'bottom' ? '50vh' : '100%'),
}))

const containerStyle = computed(() => ({
  width: props.width || undefined,
  maxWidth: props.size === 'full' ? '95vw' : props.size === 'xl' ? '960px' : props.size === 'lg' ? '800px' : props.size === 'md' ? '640px' : '480px',
}))

function handleClose() {
  emit('update:visible', false)
  emit('close')
}

function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}

function handleConfirm() {
  emit('confirm')
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    handleClose()
  }
}

// ESC 键关闭
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible && props.closeOnEsc) {
    handleClose()
  }
}

// 阻止背景滚动
watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* ==================== 遮罩层 ==================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ==================== Modal 容器 ==================== */
.modal-container {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.08),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ==================== Drawer 容器 ==================== */
.modal-drawer {
  position: fixed;
  background: #FFFFFF;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.08),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-drawer-left {
  top: 0;
  left: 0;
  height: 100vh;
  border-radius: 0 16px 16px 0;
}

.modal-drawer-right {
  top: 0;
  right: 0;
  height: 100vh;
  border-radius: 16px 0 0 16px;
}

.modal-drawer-top {
  top: 0;
  left: 0;
  right: 0;
  border-radius: 0 0 16px 16px;
}

.modal-drawer-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 16px 16px 0 0;
}

/* ==================== Header ==================== */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
  flex-shrink: 0;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #94A3B8;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #FCE7F3;
  color: #EC4899;
}

.modal-close:active {
  transform: scale(0.95);
}

/* ==================== Body ==================== */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 自定义滚动条 */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #F1F5F9;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #EC4899;
}

/* ==================== Footer ==================== */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E2E8F0;
  flex-shrink: 0;
}

.modal-footer-default {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* ==================== 按钮 ==================== */
.modal-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid transparent;
}

.modal-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.modal-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.modal-btn-secondary {
  background: #FFFFFF;
  color: #64748B;
  border-color: #E2E8F0;
}

.modal-btn-secondary:hover:not(:disabled) {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

.modal-btn-primary {
  background: #FFFFFF;
  color: #EC4899;
  border-color: #FCE7F3;
}

.modal-btn-primary:hover:not(:disabled) {
  background: #FCE7F3;
}

.modal-btn-gradient {
  background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%);
  color: #FFFFFF;
  border: none;
}

.modal-btn-gradient:hover:not(:disabled) {
  filter: brightness(1.05);
  box-shadow: 0 4px 12px rgba(0, 74, 198, 0.2);
}

.modal-btn-danger {
  background: #FFFFFF;
  color: #EF4444;
  border-color: #FEE2E2;
}

.modal-btn-danger:hover:not(:disabled) {
  background: #FEF2F2;
  border-color: #FECACA;
}

.modal-btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.modal-btn-secondary .modal-btn-spinner,
.modal-btn-primary .modal-btn-spinner {
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: #64748B;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==================== Modal 动画 ==================== */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* ==================== Drawer 动画 ==================== */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.modal-drawer-left.drawer-enter-from,
.modal-drawer-left.drawer-leave-to {
  transform: translateX(-100%);
}

.modal-drawer-top.drawer-enter-from,
.modal-drawer-top.drawer-leave-to {
  transform: translateY(-100%);
}

.modal-drawer-bottom.drawer-enter-from,
.modal-drawer-bottom.drawer-leave-to {
  transform: translateY(100%);
}
</style>
