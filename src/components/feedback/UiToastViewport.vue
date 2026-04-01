<template>
  <div class="toast-viewport">
    <transition-group name="toast-list">
      <div v-for="t in toasts" :key="t.id" class="toast-item" :class="`toast-${t.type}`">
        <div class="toast-icon">
          <span v-if="t.type === 'success'" class="icon">✓</span>
          <span v-else-if="t.type === 'error'" class="icon">✕</span>
          <span v-else-if="t.type === 'warning'" class="icon">!</span>
          <span v-else-if="t.type === 'info'" class="icon">ⓘ</span>
          <span v-else-if="t.type === 'loading'" class="icon spin">⟳</span>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ t.title }}</div>
          <div v-if="t.description" class="toast-desc">{{ t.description }}</div>
        </div>
        <button v-if="t.closable" class="toast-close" @click="removeToast(t.id)">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useFeedbackStore } from '@/stores/feedbackStore'

const store = useFeedbackStore()
const toasts = computed(() => store.toasts)
const removeToast = (id: string) => store.removeToast(id)

import { computed } from 'vue'
</script>

<style scoped>
.toast-viewport {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 900;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  border-left: 3px solid;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  font-size: 13px;
  font-weight: 500;
  pointer-events: auto;
  animation: slideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-success { border-left-color: #16a34a; }
.toast-error { border-left-color: #dc2626; }
.toast-warning { border-left-color: #d97706; }
.toast-info { border-left-color: #2563eb; }
.toast-loading { border-left-color: #00c4cc; }

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  font-size: 12px;
}

.toast-success .toast-icon { background: rgba(22, 163, 74, 0.12); color: #16a34a; }
.toast-error .toast-icon { background: rgba(220, 38, 38, 0.12); color: #dc2626; }
.toast-warning .toast-icon { background: rgba(217, 119, 6, 0.12); color: #d97706; }
.toast-info .toast-icon { background: rgba(37, 99, 235, 0.12); color: #2563eb; }
.toast-loading .toast-icon { background: rgba(0, 196, 204, 0.12); color: #00c4cc; }

.toast-icon .spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast-content { flex: 1; }
.toast-title { color: #111827; margin-bottom: 2px; }
.toast-desc { color: #6b7280; font-size: 12px; margin-top: 4px; }

.toast-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  transition: color 0.2s;
}

.toast-close:hover { color: #6b7280; }

.toast-list-enter-active { animation: slideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-list-leave-active { animation: slideOut 0.18s cubic-bezier(0.4, 0, 0.2, 1); }

@keyframes slideIn {
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(400px); opacity: 0; }
}
</style>
