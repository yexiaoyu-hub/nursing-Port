import request from '@/utils/request.js'

// 获得服务工单
export const getServiceOrderService = (params) => {
    return request({ url: '/changhu/changhu-service-order/getCurrentOrderByUser', method: 'get', params })
}