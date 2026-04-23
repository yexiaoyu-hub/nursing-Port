import request from '@/utils/request.js'

// 根据租户名称获取租户ID
export const getTenantIdByNameService = (data) => {
  return request({ url: '/system/tenant/get-id-by-name', method: 'get', data })
}

// 账号密码登录
export const loginByPasswordService = (data, header = {}) => {
  return request({ url: '/system/auth/login', method: 'post', data, header })
}

// 退出登录
export const logoutService = () => {
  return request({ url: '/system/auth/logout', method: 'post' })
}

// 刷新令牌
export const refreshTokenService = (data) => {
  return request({ url: '/system/auth/refresh-token', method: 'post', data })
}

// 获取登录用户信息
export const getUserInfoService = () => {
  return request({ url: '/system/auth/get-permission-info', method: 'get' })
}

