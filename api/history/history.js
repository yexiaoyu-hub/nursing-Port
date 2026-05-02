import request from '@/utils/request.js'

// 获取历史服务记录列表 、获得任务列表
export const getServiceHistoryList = (params) => {
    return request({
        url: '/changhu/service-order/page-with-project',
        method: 'get',
        params
    })
}

// 获取服务记录详情 、获得任务详情
export const getServiceHistoryDetail = (id) => {
    return request({
        url: `/changhu/service-order/get-with-projects`,
        method: 'get',
        params: { id }
    })
}
