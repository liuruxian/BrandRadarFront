<template>
  <transition name="dialog-fade">
    <div
      v-if="visible"
      class="dialog-overlay"
      @click="onOverlayClick"
    >
      <div
        class="dialog-panel"
        @click.stop
      >
        <div class="dialog-header">
          <h3 class="dialog-title">
            {{ options?.title }}
          </h3>
          <button
            class="dialog-close"
            :disabled="loading"
            @click="handleCancel"
          >
            ×
          </button>
        </div>

        <p
          v-if="options?.description"
          class="dialog-desc"
        >
          {{ options.description }}
        </p>

        <div
          v-if="options?.inputConfirm"
          class="dialog-input-wrap"
        >
          <label class="dialog-input-label">请输入 <b>{{ options.inputConfirm }}</b> 以确认操作</label>
          <input
            v-model="inputValue"
            class="dialog-input"
            :placeholder="options.inputConfirm"
            :disabled="loading"
          >
        </div>

        <div class="dialog-footer">
          <button
            class="btn btn-ghost"
            :disabled="loading"
            @click="handleCancel"
          >
            {{ options?.cancelText || '取消' }}
          </button>
          <button
            class="btn"
            :class="options?.danger ? 'btn-danger' : 'btn-primary'"
            :disabled="!canConfirm || loading"
            @click="handleConfirm"
          >
            {{ loading ? '处理中...' : (options?.confirmText || '确认') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFeedbackStore } from '@/stores/feedbackStore'

const store = useFeedbackStore()

const visible = computed(() => store.dialogVisible)
const options = computed(() => store.dialogOptions)
const loading = computed(() => store.dialogLoading)

const inputValue = computed({
  get: () => store.dialogInputValue,
  set: (v: string) => { store.dialogInputValue = v }
})

const canConfirm = computed(() => {
  if (!options.value?.inputConfirm) return true
  return inputValue.value.trim() === options.value.inputConfirm
})

function handleCancel() {
  options.value?.onCancel?.()
}

function handleConfirm() {
  options.value?.onConfirm?.()
}

function onOverlayClick() {
  if (options.value?.danger) return
  handleCancel()
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--dt-dialog-z);
  background: var(--dt-dialog-overlay-bg);
  backdrop-filter: blur(var(--dt-dialog-overlay-blur));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dialog-panel {
  width: min(480px, 100%);
  border-radius: var(--dt-dialog-radius);
  background: var(--dt-dialog-bg);
  box-shadow: var(--dt-dialog-shadow);
  border: 1px solid var(--dt-dialog-border);
  padding: var(--dt-space-4);
}

.dialog-header { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.dialog-title { margin:0; font-size:var(--dt-dialog-title-size); font-weight:var(--dt-dialog-title-weight); color:var(--dt-dialog-title-color); }
.dialog-close { border:none; background:transparent; color:var(--dt-dialog-close-color); font-size:20px; cursor:pointer; line-height:1; }
.dialog-close:hover { color:var(--dt-dialog-close-hover); }

.dialog-desc { margin:10px 0 0; font-size:var(--dt-dialog-desc-size); color:var(--dt-dialog-desc-color); line-height:var(--dt-leading-relaxed); }

.dialog-input-wrap { margin-top:12px; }
.dialog-input-label { display:block; margin-bottom:6px; font-size:var(--dt-text-xs); color:var(--dt-dialog-desc-color); }
.dialog-input {
  width:100%;
  border:1px solid var(--dt-gray-300);
  border-radius:var(--dt-radius-sm);
  padding:10px 12px;
  font-size:var(--dt-text-sm);
  outline:none;
}
.dialog-input:focus { border-color:var(--dt-color-primary); box-shadow:var(--dt-shadow-focus); }

.dialog-footer { margin-top:16px; display:flex; justify-content:flex-end; gap:8px; }

.dialog-fade-enter-active, .dialog-fade-leave-active { transition: all var(--dt-duration-base) var(--dt-ease-smooth); }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity:0; transform: scale(.98); }
</style>
