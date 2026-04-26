import request from '@/utils/request.js'

export const getPendingServiceOrderStatistics = (params) => {
    return request({
        url: '/changhu/statistics/pending-service-order/statistics',
        method: 'get',
        params
    })
}
