import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做点什么
    // 保留原始响应对象
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '操作失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  (error) => {
    // 对响应错误做点什么
    ElMessage.error(error.message || 'Request Error')
    return Promise.reject(error)
  }
)

// 添加 WebSocket 创建函数
export function createWebSocket(url: string): WebSocket {
  return new WebSocket(url)
}

// 保持默认导出
export default request
