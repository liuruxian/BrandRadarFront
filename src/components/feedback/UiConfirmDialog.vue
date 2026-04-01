<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="onOverlayClick">
      <div class="dialog-panel" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">{{ options?.title }}</h3>
          <button class="dialog-close" @click="handleCancel" :disabled="loading">×</button>
        </div>

        <p v-if="options?.description" class="dialog-desc">{{ options.description }}</p>

        <div v-if="options?.inputConfirm" class="dialog-input-wrap">
          <label class="dialog-input-label">请输入 <b>{{ options.inputConfirm }}</b> 以确认操作</label>
          <input class="dialog-input" v-model="inputValue" :placeholder="options.inputConfirm" :disabled="loading"/>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-ghost" @click="handleCancel" :disabled="loading">{{ options?.cancelText || '取消' }}</button>
          <button
            class="btn"
            :class="options?.danger ? 'btn-danger' : 'btn-primary'"
            @click="handleConfirm"
            :disabled="!canConfirm || loading"
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
  z-index: 990;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dialog-panel {
  width: min(480px, 100%);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.2);
  border: 1px solid #e5e7eb;
  padding: 16px;
}

.dialog-header { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.dialog-title { margin:0; font-size:16px; font-weight:700; color:#111827; }
.dialog-close { border:none; background:transparent; color:#9ca3af; font-size:20px; cursor:pointer; line-height:1; }
.dialog-close:hover { color:#6b7280; }

.dialog-desc { margin:10px 0 0; font-size:13px; color:#4b5563; line-height:1.6; }

.dialog-input-wrap { margin-top:12px; }
.dialog-input-label { display:block; margin-bottom:6px; font-size:12px; color:#6b7280; }
.dialog-input {
  width:100%;
  border:1px solid #d1d5db;
  border-radius:10px;
  padding:10px 12px;
  font-size:13px;
  outline:none;
}
.dialog-input:focus { border-color:#00c4cc; box-shadow:0 0 0 3px rgba(0,196,204,.12); }

.dialog-footer { margin-top:16px; display:flex; justify-content:flex-end; gap:8px; }

.dialog-fade-enter-active, .dialog-fade-leave-active { transition: all .2s ease; }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity:0; transform: scale(.98); }
</style>
