<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getPingguReportDetail } from "@/api/older/older.js";

// 报告ID
const reportId = ref<number | null>(null);

// 报告详情
const reportDetail = ref<any>({});

// 加载状态
const loading = ref(false);

// 获取失能等级文本
const getDisabilityLevelText = (level: number | string): string => {
  const levelMap: Record<string, string> = {
    "0": "基本正常",
    "1": "轻度失能",
    "2": "中度失能",
    "3": "重度失能Ⅰ级",
    "4": "重度失能Ⅱ级",
    "5": "重度失能Ⅲ级",
  };
  return levelMap[String(level)] || "-";
};

// 获取评估机构类型文本
const getOrgTypeText = (type: number): string => {
  return type === 1 ? "本院评估" : "第三方评估";
};

// 获取评估状态文本
const getStatusText = (status: number): string => {
  return status === 1 ? "未评估" : "已评估";
};

// 获取性别文本
const getSexText = (sex: number): string => {
  return sex === 0 ? "男" : "女";
};

// 获取报告详情
const fetchReportDetail = async () => {
  if (!reportId.value) return;
  loading.value = true;
  try {
    const res = await getPingguReportDetail(reportId.value);
    const data = res?.data || res;
    if (data) {
      reportDetail.value = data;
    }
  } catch (error) {
    console.error("获取评估报告详情失败:", error);
    uni.showToast({
      title: "获取报告详情失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
};

// 下载报告
const downloadReport = () => {
  if (!reportDetail.value.pgFile) {
    uni.showToast({
      title: "暂无报告文件",
      icon: "none",
    });
    return;
  }

  // #ifdef H5
  // H5 平台直接在新窗口打开文件
  window.open(reportDetail.value.pgFile, "_blank");
  uni.showToast({
    title: "正在下载",
    icon: "none",
  });
  // #endif

  // #ifndef H5
  // 小程序/App 平台使用 uni.downloadFile
  uni.showLoading({ title: "下载中..." });

  uni.downloadFile({
    url: reportDetail.value.pgFile,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveFile({
          tempFilePath: res.tempFilePath,
          success: (saveRes) => {
            uni.hideLoading();
            uni.showToast({
              title: "下载成功",
              icon: "success",
            });
            uni.openDocument({
              filePath: saveRes.savedFilePath,
            });
          },
          fail: () => {
            uni.hideLoading();
            uni.showToast({
              title: "保存失败",
              icon: "none",
            });
          },
        });
      } else {
        uni.hideLoading();
        uni.showToast({
          title: "下载失败",
          icon: "none",
        });
      }
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({
        title: "下载失败",
        icon: "none",
      });
    },
  });
  // #endif
};

// 页面加载
onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || currentPage.$route?.query || {};
  reportId.value = Number(options.id) || null;
  if (reportId.value) {
    fetchReportDetail();
  }
});
</script>

<template>
  <view class="assessment-detail-page">
    <!-- 加载中 -->
    <view class="loading-state" v-show="loading">
      <text>加载中...</text>
    </view>

    <!-- 报告详情内容 -->
    <scroll-view class="detail-content" scroll-y v-show="!loading">
      <!-- 基本信息 -->
      <view class="section">
        <view class="section-title">基本信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">评估编号</text>
            <text class="value">{{ reportDetail.pgNo || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">评估日期</text>
            <text class="value">{{ reportDetail.pgDate || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">评估标准</text>
            <text class="value">{{ reportDetail.pgArea || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">标准版本</text>
            <text class="value">{{ reportDetail.pgVersion || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">评估状态</text>
            <text class="value">{{
              getStatusText(reportDetail.pgStatus)
            }}</text>
          </view>
        </view>
      </view>

      <!-- 申请人信息 -->
      <view class="section">
        <view class="section-title">申请人信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">申请人姓名</text>
            <text class="value">{{ reportDetail.applyName || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">性别</text>
            <text class="value">{{ getSexText(reportDetail.applySex) }}</text>
          </view>
          <view class="info-item">
            <text class="label">年龄</text>
            <text class="value">{{ reportDetail.applyAge || "-" }}</text>
          </view>
        </view>
      </view>

      <!-- 评估机构信息 -->
      <view class="section">
        <view class="section-title">评估机构信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">评估机构</text>
            <text class="value">{{ reportDetail.pgJigouName || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">机构类型</text>
            <text class="value">{{
              getOrgTypeText(reportDetail.pgJigouType)
            }}</text>
          </view>
          <view class="info-item">
            <text class="label">评估人员</text>
            <text class="value">{{ reportDetail.pgRen || "-" }}</text>
          </view>
        </view>
      </view>

      <!-- 老人信息 -->
      <view class="section">
        <view class="section-title">老人信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">老人姓名</text>
            <text class="value">{{ reportDetail.agedName || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">性别</text>
            <text class="value">{{ getSexText(reportDetail.agedSex) }}</text>
          </view>
          <view class="info-item">
            <text class="label">身份证号</text>
            <text class="value">{{ reportDetail.agedIdno || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">出生日期</text>
            <text class="value">{{ reportDetail.agedBirthday || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">身高</text>
            <text class="value">{{
              reportDetail.agedHeight ? reportDetail.agedHeight + "cm" : "-"
            }}</text>
          </view>
          <view class="info-item">
            <text class="label">体重</text>
            <text class="value">{{
              reportDetail.agedWeight ? reportDetail.agedWeight + "kg" : "-"
            }}</text>
          </view>
          <view class="info-item">
            <text class="label">民族</text>
            <text class="value">{{ reportDetail.agedNation || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">宗教信仰</text>
            <text class="value">{{ reportDetail.agedZongjiao || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">文化程度</text>
            <text class="value">{{ reportDetail.agedwenhua || "-" }}</text>
          </view>
          <view class="info-item">
            <text class="label">居住情况</text>
            <text class="value">{{ reportDetail.agedJuzhu || "-" }}</text>
          </view>
        </view>
      </view>

      <!-- 评估结果 -->
      <view class="section">
        <view class="section-title">评估结果</view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">长护失能等级</text>
            <text class="value level">{{
              getDisabilityLevelText(reportDetail.pgChanghuEndLevel)
            }}</text>
          </view>
          <view class="info-item">
            <text class="label">老年人能力等级</text>
            <text class="value">{{
              getDisabilityLevelText(reportDetail.pgEndLevel)
            }}</text>
          </view>
          <view class="info-item">
            <text class="label">下次评估日期</text>
            <text class="value">{{ reportDetail.pgNextDate || "-" }}</text>
          </view>
        </view>
      </view>

      <!-- 评估建议 -->
      <view class="section" v-if="reportDetail.pgHulituijian">
        <view class="section-title">护理建议</view>
        <view class="suggestion-content">
          <text>{{ reportDetail.pgHulituijian }}</text>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-actions">
        <view class="btn-download" @click="downloadReport">
          <text>下载报告</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.assessment-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;

  /* 加载中 */
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
    font-size: 28rpx;
    color: #999;
  }

  /* 详情内容 */
  .detail-content {
    height: calc(100vh - 88rpx);
    padding: 24rpx;
    box-sizing: border-box;

    .section {
      background-color: #fff;
      border-radius: 16rpx;
      margin-bottom: 24rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

      .section-title {
        padding: 24rpx;
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
        border-bottom: 1rpx solid #f0f0f0;
      }

      .info-list {
        padding: 16rpx 24rpx;

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16rpx 0;
          border-bottom: 1rpx solid #f5f5f5;

          &:last-child {
            border-bottom: none;
          }

          .label {
            font-size: 28rpx;
            color: #666;
          }

          .value {
            font-size: 28rpx;
            color: #333;
            font-weight: 500;

            &.level {
              color: #1677ff;
            }
          }
        }
      }

      .suggestion-content {
        padding: 24rpx;
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
      }
    }

    /* 底部按钮 */
    .bottom-actions {
      padding: 24rpx;

      .btn-download {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24rpx 0;
        background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
        border-radius: 40rpx;
        color: #fff;
        font-size: 30rpx;
        font-weight: 500;
        box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.3);

        &:active {
          opacity: 0.9;
        }
      }
    }
  }
}
</style>
