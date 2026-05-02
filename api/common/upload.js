import request from '@/utils/request.js'

// 基础URL
const baseURL = 'https://dev.zhengyishuzi.com/admin-api'

/**
 * 通用文件上传（支持文件路径或Blob URL）
 * @param {string|File} filePath - 文件路径或File对象
 * @param {string} name - 表单字段名，默认 'file'
 * @param {string} directory - 文件目录，默认 'service/record'
 * @returns {Promise}
 */
export const uploadFileService = (filePath, name = 'file', directory = 'service/record') => {
    return new Promise((resolve, reject) => {
        // 如果是 File 对象（H5环境），使用 XMLHttpRequest
        if (filePath instanceof File) {
            const formData = new FormData();
            formData.append(name, filePath);
            formData.append('directory', directory);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${baseURL}/infra/file/upload`);
            xhr.setRequestHeader('Authorization', `Bearer ${uni.getStorageSync('token')}`);
            xhr.setRequestHeader('tenant-id', uni.getStorageSync('tenantId'));

            xhr.onload = function () {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.code === 0 || data.code === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(data.msg || '上传失败'));
                    }
                } catch (e) {
                    reject(new Error('解析响应失败'));
                }
            };

            xhr.onerror = () => reject(new Error('上传请求失败'));
            xhr.send(formData);
            return;
        }

        // 文件路径（小程序环境）
        uni.uploadFile({
            url: `${baseURL}/infra/file/upload`,
            filePath: filePath,
            name: name,
            formData: {
                directory: directory
            },
            header: {
                'Authorization': `Bearer ${uni.getStorageSync('token')}`,
                'tenant-id': uni.getStorageSync('tenantId'),
            },
            success: (res) => {
                try {
                    const data = JSON.parse(res.data)
                    if (data.code === 0 || data.code === 200) {
                        resolve(data)
                    } else {
                        reject(new Error(data.msg || '上传失败'))
                    }
                } catch (e) {
                    reject(new Error('解析响应失败'))
                }
            },
            fail: (error) => {
                reject(error)
            }
        })
    })
}

/**
 * 将 Blob URL 转换为 File 对象
 * @param {string} blobUrl - Blob URL
 * @param {string} fileName - 文件名
 * @returns {Promise<File>}
 */
export const blobUrlToFile = async (blobUrl, fileName = 'file') => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
}
