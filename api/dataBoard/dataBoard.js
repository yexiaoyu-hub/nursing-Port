import request from '@/utils/request.js'

// 获得待服务订单统计
export const getPendingServiceOrderStatistics = (params) => {
    return request({
        url: '/changhu/statistics/pending-service-order/statistics',
        method: 'get',
        params
    })
}

// 获得已服务订单统计
export const getServedOrderStatistics = (params) => {
    return request({
        url: '/changhu/statistics/served-order/statistics',
        method: 'get',
        params
    })
}

// 获得待服务老人统计
export const getPendingServiceElderlyStatistics = (params) => {
    return request({
        url: '/changhu/statistics/pending-service-aged/statistics',
        method: 'get',
        params
    })
}

// 获得待服务项目统计
export const getPendingServiceProjectStatistics = (params) => {
    return request({
        url: '/changhu/statistics/pending-service-aged/project/statistics',
        method: 'get',
        params
    })
}

// 获得累计时长看板
export const getDurationBoard = (params) => {
    return request({
        url: '/changhu/statistics/duration/board',
        method: 'get',
        params
    })
}
