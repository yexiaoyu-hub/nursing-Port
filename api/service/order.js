import request from '@/utils/request.js'

// 获得服务工单详情（含项目/评价/健康/投诉/签到/录音）
export const getServiceOrderWithProjectsAll = (orderId) => {
    return request({
        url: `/changhu/service-order/get-with-projects-all`,
        method: 'get',
        params: { id: orderId }
    })
}

// 获取服务项目列表（分页）
export const getServiceProjectPage = (params) => {
    return request({
        url: '/changhu/changhu-service-project/page',
        method: 'get',
        params
    })
}

// 创建服务工单
export const createServiceOrder = (data) => {
    return request({
        url: '/changhu/service-order/create',
        method: 'post',
        data
    })
}