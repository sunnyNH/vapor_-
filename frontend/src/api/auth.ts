import request from '@/utils/request'
import type { ApiResponse, UserInfo } from '@/types'

// 登录参数类型
interface LoginParams {
  phone: string
  password: string
}

// 登录
export const login = (params: LoginParams): Promise<ApiResponse<string>> => {
  return request({
    url: '/signin',
    method: 'POST',
    data: params
  })
}

// 退出登录
export const logout = (): Promise<ApiResponse<string>> => {
  return request({
    url: '/signout',
    method: 'POST'
  })
}

// 获取用户信息
export const getUserProfile = (): Promise<ApiResponse<UserInfo>> => {
  return request({
    url: '/user/profile',
    method: 'GET'
  })
}
