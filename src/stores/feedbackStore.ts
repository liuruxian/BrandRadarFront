import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  closable?: boolean
}

export interface DialogOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  inputConfirm?: string
  onConfirm?: () => Promise<void> | void
  onCancel?: () => void
}

export const useFeedbackStore = defineStore('feedback', () => {
  const toasts = ref<Toast[]>([])
  const dialogVisible = ref(false)
  const dialogOptions = ref<DialogOptions | null>(null)
  const dialogLoading = ref(false)
  const dialogInputValue = ref('')

  const MAX_TOASTS = 3
  const TOAST_DEDUP_TIME = 1000
  const lastToastMessages = ref<Record<string, number>>({})

  function addToast(toast: Omit<Toast, 'id'>) {
    const key = `${toast.type}:${toast.title}`
    const now = Date.now()
    const lastTime = lastToastMessages.value[key] ?? 0

    if (now - lastTime < TOAST_DEDUP_TIME) return

    lastToastMessages.value[key] = now

    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 2200,
      closable: toast.closable ?? true,
    }

    toasts.value.push(newToast)

    if (toasts.value.length > MAX_TOASTS) {
      const removed = toasts.value.shift()
      if (removed?.id) clearTimeout(toastTimers.value[removed.id])
    }

    if (newToast.duration && newToast.duration > 0) {
      const timer = setTimeout(() => removeToast(id), newToast.duration)
      toastTimers.value[id] = timer as any
    }
  }

  const toastTimers = ref<Record<string, any>>({})

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
    if (toastTimers.value[id]) clearTimeout(toastTimers.value[id])
    delete toastTimers.value[id]
  }

  function clearAllToasts() {
    Object.values(toastTimers.value).forEach((timer) => clearTimeout(timer))
    toastTimers.value = {}
    toasts.value = []
  }

  async function showDialog(options: DialogOptions) {
    return new Promise<boolean>((resolve) => {
      dialogOptions.value = {
        confirmText: '确认',
        cancelText: '取消',
        ...options,
      }
      dialogVisible.value = true
      dialogInputValue.value = ''
      dialogLoading.value = false

      const originalOnConfirm = options.onConfirm
      const originalOnCancel = options.onCancel

      dialogOptions.value.onConfirm = async () => {
        dialogLoading.value = true
        try {
          if (originalOnConfirm) await originalOnConfirm()
          resolve(true)
        } finally {
          dialogLoading.value = false
          closeDialog()
        }
      }

      dialogOptions.value.onCancel = () => {
        if (originalOnCancel) originalOnCancel()
        resolve(false)
        closeDialog()
      }
    })
  }

  function closeDialog() {
    dialogVisible.value = false
    dialogOptions.value = null
    dialogInputValue.value = ''
    dialogLoading.value = false
  }

  return {
    toasts,
    dialogVisible,
    dialogOptions,
    dialogLoading,
    dialogInputValue,
    addToast,
    removeToast,
    clearAllToasts,
    showDialog,
    closeDialog,
  }
})
