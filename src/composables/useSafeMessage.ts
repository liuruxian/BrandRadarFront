import { inject, type InjectionKey } from 'vue'

// naive-ui 内部定义的 injection key
const messageApiInjectionKey: InjectionKey<{
  info: (content: unknown, options?: unknown) => unknown
  success: (content: unknown, options?: unknown) => unknown
  warning: (content: unknown, options?: unknown) => unknown
  error: (content: unknown, options?: unknown) => unknown
  loading: (content: unknown, options?: unknown) => unknown
  create: (content: unknown, options?: unknown) => unknown
  destroyAll: () => void
}> = Symbol('n-message-api')

const noopMessage = {
  info: () => {},
  success: () => {},
  warning: () => {},
  error: () => {},
  loading: () => {},
  create: () => ({}),
  destroyAll: () => {},
}

/**
 * 安全地获取 naive-ui 的 message API。
 * 如果在 n-message-provider 上下文外调用，返回一个安全的 noop 实现，避免抛出错误。
 */
export function useSafeMessage() {
  try {
    const api = inject(messageApiInjectionKey, null)
    return api ?? noopMessage
  } catch {
    return noopMessage
  }
}
