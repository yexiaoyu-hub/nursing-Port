import request from '@/utils/request.js'

// 获取老人列表
export const getAgedPage = (params) => {
    return request({
        url: '/changhu/changhu-aged/page',
        method: 'get',
        params
    })
}

// 获取老人基础信息
export const getAgedDetail = (id) => {
    return request({
        url: `/changhu/changhu-aged/get-by-aged-id`,
        method: 'get',
        params: { agedId: id }
    })
}

// 获取老人健康信息
export const getAgedHealth = (id) => {
    return request({
        url: `/changhu/changhu-aged/get-health-by-aged-id`,
        method: 'get',
        params: { agedId: id }
    })
}

// 获取老人服务计划（按服务项目类型分组）
export const getServicePlanByAged = (agedId) => {
    return request({
        url: '/changhu/service-plan/get-grouped-by-aged',
        method: 'get',
        params: { agedId }
    })
}

// 获取服务计划项目变更日志列表
export const getServicePlanChangeLog = (params) => {
    return request({
        url: '/changhu/service-plan-item-logs/list',
        method: 'get',
        params
    })
}
