import request from '@/utils/request.js'

/**
 * 获得全部字典数据列表
 * 一般用于管理后台缓存字典数据在本地
 */
export const getDictDataSimpleList = () => {
    return request({ url: '/system/dict-data/simple-list', method: 'get' })
}
