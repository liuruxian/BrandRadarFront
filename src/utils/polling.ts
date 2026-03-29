import { onUnmounted } from 'vue'

export function usePolling(fn: () => Promise<void> | void, intervalMs: number) {
  let timer: ReturnType<typeof setInterval> | null = null

  function start() {
    if (timer) return
    fn()
    timer = setInterval(fn, intervalMs)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onUnmounted(stop)

  return { start, stop }
}
