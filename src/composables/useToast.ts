import { useFeedbackStore, type ToastType, type DialogOptions } from '@/stores/feedbackStore'

export function useToast() {
  const store = useFeedbackStore()

  return {
    success: (title: string, description?: string) =>
      store.addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      store.addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) =>
      store.addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) =>
      store.addToast({ type: 'info', title, description }),
    loading: (title: string, description?: string) =>
      store.addToast({ type: 'loading', title, description, duration: 0 }),
    custom: (type: ToastType, title: string, description?: string, duration?: number) =>
      store.addToast({ type, title, description, duration }),
    clear: () => store.clearAllToasts(),
  }
}

export function useDialog() {
  const store = useFeedbackStore()

  return {
    confirm: (options: DialogOptions) => store.showDialog(options),
    danger: (options: DialogOptions) => store.showDialog({ ...options, danger: true }),
    close: () => store.closeDialog(),
  }
}
