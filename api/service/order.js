import request from '@/utils/request.js'

// 创建服务工单
export const createServiceOrder = (data) => {
    return request({
        url: '/changhu/service-order/create',
        method: 'post',
        data
    })
}

// 开始工单
export const startServiceOrder = (orderId) => {
    return request({
        url: `/changhu/service-order/start/${orderId}`,
        method: 'put'
    })
}

// 结束工单
export const endServiceOrder = (orderId) => {
    return request({
        url: `/changhu/service-order/end/${orderId}`,
        method: 'put'
    })
}

// 获得服务工单（含项目列表）
export const getServiceOrder = (orderId) => {
    return request({
        url: `/changhu/service-order/get/${orderId}`,
        method: 'get'
    })
}

// 获得服务工单单个（含项目/评价/健康/投诉/签到/录音/留痕设置）
export const getServiceOrderDetail = (orderId) => {
    return request({
        url: `/changhu/service-order/get-detail/${orderId}`,
        method: 'get'
    })
}
