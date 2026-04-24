import request from '@/utils/request.js'

// 基础URL
const baseURL = 'https://dev.zhengyishuzi.com/admin-api'

// 获取个人资料
export const getUserProfileService = () => {
    return request({ url: '/system/user/profile/get', method: 'get' })
}

// 更新个人资料
export const updateUserProfileService = (data) => {
    return request({ url: '/system/user/profile/update', method: 'put', data })
}

// 上传头像（使用 uni.uploadFile）
export const uploadAvatarService = (filePath) => {
    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: `${baseURL}/system/user/profile/update-avatar`,
            filePath: filePath,
            name: 'avatarFile',
            header: {
                'Authorization': `Bearer ${uni.getStorageSync('token')}`,
                'tenant-id': uni.getStorageSync('tenantId'),
            },
            success: (res) => {
                const data = JSON.parse(res.data)
                if (data.code === 0) {
                    resolve(data)
                } else {
                    reject(new Error(data.msg || '上传失败'))
                }
            },
            fail: (error) => {
                reject(error)
            }
        })
    })
}
