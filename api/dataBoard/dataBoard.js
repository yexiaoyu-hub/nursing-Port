import request from '@/utils/request.js'

/**
 * 获得待服务订单统计
 * @param {Object} params - 查询参数
 * @param {string} params.beginDate - 开始日期 (可选)
 * @param {string} params.endDate - 结束日期 (可选)
 * @param {number} params.serviceCateId - 服务类型ID (可选)
 * @returns {Promise<{
 *   pendingOrderCount: number,
 *   expectedTotalServiceMinutes: number,
 *   serviceTypeDistribution: Array<{
 *     serviceTypeName: string,
 *     orderCount: number,
 *     ratio: number
 *   }>
 * }>}
 */
export const getPendingServiceOrderStatistics = (params) => {
    return request({
        url: '/changhu/statistics/pending-service-order/statistics',
        method: 'get',
        params
    })
}
