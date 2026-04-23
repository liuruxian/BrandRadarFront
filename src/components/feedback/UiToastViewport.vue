<template>
  <div class="toast-viewport">
    <transition-group name="toast-list">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast-item"
        :class="`toast-${t.type}`"
      >
        <div class="toast-icon">
          <span
            v-if="t.type === 'success'"
            class="icon"
          >✓</span>
          <span
            v-else-if="t.type === 'error'"
            class="icon"
          >✕</span>
          <span
            v-else-if="t.type === 'warning'"
            class="icon"
          >!</span>
          <span
            v-else-if="t.type === 'info'"
            class="icon"
          >ⓘ</span>
          <span
            v-else-if="t.type === 'loading'"
            class="icon spin"
          >⟳</span>
        </div>
        <div class="toast-content">
          <div class="toast-title">
            {{ t.title }}
          </div>
          <div
            v-if="t.description"
            class="toast-desc"
          >
            {{ t.description }}
          </div>
        </div>
        <button
          v-if="t.closable"
          class="toast-close"
          @click="removeToast(t.id)"
        >
          ×
        </button>
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
  z-index: var(--dt-toast-z);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--dt-toast-radius);
  background: var(--dt-toast-bg);
  border-left: 3px solid;
  box-shadow: var(--dt-toast-shadow);
  font-size: var(--dt-text-sm);
  font-weight: var(--dt-weight-medium);
  pointer-events: auto;
  animation: slideIn var(--dt-duration-base) var(--dt-ease-out);
}

.toast-success { border-left-color: var(--dt-color-success); }
.toast-error   { border-left-color: var(--dt-color-danger); }
.toast-warning { border-left-color: var(--dt-color-warning); }
.toast-info    { border-left-color: var(--dt-color-primary); }
.toast-loading { border-left-color: var(--dt-color-loading); }

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: var(--dt-weight-bold);
  font-size: 12px;
}

.toast-success .toast-icon { background: rgba(16, 185, 129, 0.12); color: var(--dt-color-success); }
.toast-error   .toast-icon { background: rgba(239, 68, 68, 0.12);  color: var(--dt-color-danger); }
.toast-warning .toast-icon { background: rgba(217, 119, 6, 0.12);   color: var(--dt-color-warning); }
.toast-info    .toast-icon { background: rgba(37, 99, 235, 0.12);  color: var(--dt-color-primary); }
.toast-loading .toast-icon { background: rgba(0, 196, 204, 0.12);   color: var(--dt-color-loading); }

.toast-icon .spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast-content { flex: 1; }
.toast-title { color: var(--dt-toast-title-color); margin-bottom: 2px; }
.toast-desc  { color: var(--dt-toast-desc-color);  font-size: var(--dt-text-xs); margin-top: 4px; }

.toast-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--dt-toast-close-color);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  transition: color var(--dt-duration-fast) var(--dt-ease-smooth);
}

.toast-close:hover { color: var(--dt-toast-close-hover); }

.toast-list-enter-active { animation: slideIn  var(--dt-duration-base) var(--dt-ease-out); }
.toast-list-leave-active { animation: slideOut var(--dt-duration-fast) var(--dt-ease-in); }

@keyframes slideIn {
  from { transform: translateX(400px); opacity: 0; }
  to   { transform: translateX(0);      opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0);      opacity: 1; }
  to   { transform: translateX(400px); opacity: 0; }
}
</style>
