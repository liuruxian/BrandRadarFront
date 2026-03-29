import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from './types'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const apiKey = import.meta.env.VITE_API_KEY || ''

const client: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// ─── Request 拦截器 ──────────────────────────────────────────
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response 拦截器 ─────────────────────────────────────────
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status
    const code = error.response?.data?.error?.error_code

    if (status === 401 || code === 'AUTHENTICATION_FAILED') {
      console.error('[BrandRadar] 认证失败：请检查 API Key 配置')
    } else if (status === 429 || code === 'RATE_LIMIT_EXCEEDED') {
      console.error('[BrandRadar] 请求频率超限，请稍后再试')
    } else if (status === 409 || code === 'TASK_ALREADY_RUNNING') {
      // 业务层自行处理，不弹全局错误
    } else if (status >= 500) {
      console.error('[BrandRadar] 服务器内部错误')
    }

    return Promise.reject(error)
  }
)

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  const res = await client.get<ApiResponse<T>>(url, { params })
  return res.data
}

export async function post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  const res = await client.post<ApiResponse<T>>(url, data)
  return res.data
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
  const res = await client.delete<ApiResponse<T>>(url)
  return res.data
}

export default client
