// 创建 uni.request 实例
const service = {
    baseURL: 'https://dev.zhengyishuzi.com/admin-api',
    timeout: 5000
}

// 是否正在刷新令牌
let isRefreshing = false
// 等待刷新令牌的请求队列
let refreshQueue = []

// 刷新令牌
const refreshToken = () => {
    return new Promise((resolve, reject) => {
        const refreshToken = uni.getStorageSync('refreshToken')
        if (!refreshToken) {
            reject(new Error('没有刷新令牌'))
            return
        }

        uni.request({
            url: `${service.baseURL}/system/auth/refresh-token`,
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            data: { refreshToken },
            success: (res) => {
                if (res.statusCode === 200 && res.data && res.data.code === 0) {
                    const { accessToken, refreshToken: newRefreshToken } = res.data.data || {}
                    if (accessToken) {
                        uni.setStorageSync('token', accessToken)
                        if (newRefreshToken) {
                            uni.setStorageSync('refreshToken', newRefreshToken)
                        }
                        resolve(accessToken)
                    } else {
                        reject(new Error('刷新令牌失败'))
                    }
                } else {
                    reject(new Error('刷新令牌失败'))
                }
            },
            fail: (error) => {
                reject(error)
            }
        })
    })
}

// 跳转到登录页
const goToLogin = () => {
    uni.showToast({ title: '登录过期，请重新登录', icon: 'none' })
    uni.removeStorageSync('token')
    uni.removeStorageSync('refreshToken')
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('tenantId')
    setTimeout(() => {
        uni.reLaunch({ url: '/pages/login/login' })
    }, 1500)
}

// 请求拦截器（统一加 token、请求头）
const requestInterceptor = (config) => {
    // 添加基础URL
    if (!config.url.startsWith('http')) {
        config.url = `${service.baseURL}${config.url}`
    }

    // 处理 GET 请求参数
    const method = (config.method || 'GET').toLowerCase()
    if (method === 'get' && config.params) {
        const queryString = Object.keys(config.params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(config.params[key])}`)
            .join('&')
        if (queryString) {
            config.url += (config.url.includes('?') ? '&' : '?') + queryString
        }
    }

    // 设置默认 header
    config.header = {
        'Content-Type': 'application/json',
        ...config.header
    }

    // 从本地存储获取 token 并添加到 header
    const token = uni.getStorageSync('token')
    if (token) {
        config.header['Authorization'] = `Bearer ${token}`
    }

    // 从本地存储获取 tenantId 并添加到 header
    const tenantId = uni.getStorageSync('tenantId')
    if (tenantId) {
        config.header['tenant-id'] = tenantId
    }

    return config
}

// 处理 401 统一逻辑
const handleUnauthorized = (config) => {
    if (!isRefreshing) {
        isRefreshing = true
        return refreshToken().then((newToken) => {
            refreshQueue.forEach(cb => cb(newToken))
            refreshQueue = []
            isRefreshing = false
            return request({
                ...config,
                header: {
                    ...config.header,
                    'Authorization': `Bearer ${newToken}`
                }
            })
        }).catch(() => {
            isRefreshing = false
            refreshQueue = []
            goToLogin()
            return Promise.reject(new Error('登录过期'))
        })
    } else {
        return new Promise((resolve) => {
            refreshQueue.push((newToken) => {
                resolve(request({
                    ...config,
                    header: {
                        ...config.header,
                        'Authorization': `Bearer ${newToken}`
                    }
                }))
            })
        })
    }
}

// 响应拦截器（统一处理返回结果、错误）
const responseInterceptor = (response, config) => {
    const { statusCode, data } = response

    // 请求成功
    if (statusCode === 200) {
        // 处理业务状态码 401（登录过期）
        if (data.code === 401) {
            return handleUnauthorized(config)
        }
        // 处理成功响应
        if (data.code === 200 || data.code === 0 || data.code === undefined) {
            // 返回业务数据 (data.data)
            return data.data !== undefined ? data.data : data
        }
        // 处理业务错误
        uni.showToast({ title: data.msg || data.message || '请求失败', icon: 'none' })
        return Promise.reject(data)
    }

    // 处理 HTTP 错误状态码
    if (statusCode === 401) {
        return handleUnauthorized(config)
    }

    uni.showToast({ title: data.msg || data.message || `请求失败: ${statusCode}`, icon: 'none' })
    return Promise.reject(new Error(data.msg || data.message || `请求失败: ${statusCode}`))
}

// 通用请求方法
const request = (config) => {
    return new Promise((resolve, reject) => {
        // 应用请求拦截器
        const originalConfig = { ...config }
        config = requestInterceptor(config)

        uni.request({
            ...config,
            success: (response) => {
                try {
                    const result = responseInterceptor(response, originalConfig)
                    resolve(result)
                } catch (error) {
                    reject(error)
                }
            },
            fail: (error) => {
                console.error('请求失败:', error)
                uni.showToast({ title: '无法连接到服务器，请检查网络', icon: 'none', duration: 3000 })
                reject(new Error('网络请求失败: ' + (error.errMsg || '未知错误')))
            }
        })
    })
}

export default request
