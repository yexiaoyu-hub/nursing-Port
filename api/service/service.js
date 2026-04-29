import request from '@/utils/request.js'

// 创建服务签到记录（开始），生成轨迹
export const createServiceSignStart = (data) => {
    return request({
        url: '/changhu/service-order-sign/create-start',
        method: 'post',
        data
    })
}

// 创建服务签到记录（进行中），生成轨迹
export const createServiceSignProgress = (data) => {
    return request({
        url: '/changhu/service-order-sign/create-progress',
        method: 'post',
        data
    })
}

// 创建服务签到记录（结束），生成轨迹
export const createServiceSignEnd = (data) => {
    return request({
        url: '/changhu/service-order-sign/create-end',
        method: 'post',
        data
    })
}
