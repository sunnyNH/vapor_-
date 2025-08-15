import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? '' : '', // 开发环境使用代理，生产环境使用相对路径
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    
    // 直接返回响应数据
    return data
  },
  (error) => {
    console.error('响应拦截器错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          ElMessage.error('登录已过期，请重新登录')
          // 使用延迟避免路由循环
          setTimeout(() => {
            window.location.href = '/login'
          }, 1000)
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.error || data?.reason || '请求失败')
      }
      
      return Promise.reject(error.response.data)
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
      return Promise.reject({ error: '网络错误' })
    } else {
      ElMessage.error('请求配置错误')
      return Promise.reject({ error: '请求配置错误' })
    }
  }
)

export default request
