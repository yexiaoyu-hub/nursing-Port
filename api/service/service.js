import request from '@/utils/request.js'

// 创建服务签到记录（通用），生成轨迹
// signType: 1=开始, 2=服务中, 3=结束
export const createServiceSign = (data) => {
    return request({
        url: '/changhu/service-order-sign/create',
        method: 'post',
        data
    })
}

// 创建服务签到记录（开始），生成轨迹
export const createServiceSignStart = (data) => {
    return request({
        url: '/changhu/service-order-sign/create-start',
        method: 'post',
        data
    })
}

// 创建服务签到记录（进行中/服务中），生成轨迹
export const createServiceSignDoing = (data) => {
    return request({
        url: '/changhu/service-order-sign/create-doing',
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

// 创建服务健康采集记录
export const createServiceHealth = (data) => {
    return request({
        url: '/changhu/service-order-health/create',
        method: 'post',
        data
    })
}

// 创建服务评价
export const createServiceEvaluation = (data) => {
    return request({
        url: '/changhu/service-order-pingjia/create',
        method: 'post',
        data
    })
}

