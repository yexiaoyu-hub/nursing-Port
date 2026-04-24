import request from '@/utils/request.js'

/**
 * 获取老人列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNo - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.keyword - 搜索关键字（老人姓名），可选
 * @returns {Promise<{
 *   records: Array<{
 *     id: number,
 *     name: string,
 *     gender: string,
 *     age: number,
 *     bedNo: string,
 *     status: string,
 *     statusColor: string,
 *     disability: string,
 *     careLevel: string,
 *     bedStatus: string
 *   }>,
 *   total: number,
 *   size: number,
 *   current: number,
 *   pages: number
 * }>}
 */
export const getAgedPage = (params) => {
    return request({
        url: '/changhu/changhu-aged/page',
        method: 'get',
        params
    })
}
