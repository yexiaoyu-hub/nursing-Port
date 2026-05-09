// 评估报告列表
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getPingguReportList } from "@/api/older/older.js";

// 老人ID
const agedId = ref<number | null>(null);

// 报告列表
const reportList = ref<any[]>([]);

// 加载状态
const loading = ref(false);

// 分页参数
const pageNo = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 是否还有更多数据
const hasMore = computed(() => {
  return reportList.value.length < total.value;
});

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

// 获取等级标签样式
const getLevelClass = (level: number | string) => {
  const levelText = getDisabilityLevelText(level);
  switch (levelText) {
    case "基本正常":
      return "level-normal";
    case "轻度失能":
      return "level-light";
    case "中度失能":
      return "level-medium";
    case "重度失能Ⅰ级":
    case "重度失能Ⅱ级":
    case "重度失能Ⅲ级":
      return "level-severe";
    default:
      return "level-normal";
  }
};

// 获取评估机构类型文本
const getOrgTypeText = (type: number): string => {
  return type === 1 ? "本院评估" : "第三方评估";
};

// 获取报告列表
const fetchReportList = async (isRefresh = false) => {
  if (!agedId.value) return;
  if (isRefresh) {
    pageNo.value = 1;
    reportList.value = [];
  }
  loading.value = true;
  try {
    const res = await getPingguReportList({
      agedId: agedId.value,
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    });
    const data = res?.data || res;
    if (data) {
      const list = data.list || [];
      total.value = data.total || 0;
      if (isRefresh) {
        reportList.value = list;
      } else {
        reportList.value.push(...list);
      }
    }
  } catch (error) {
    console.error("获取评估报告列表失败:", error);
    uni.showToast({
      title: "获取报告列表失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (loading.value || !hasMore.value) return;
  pageNo.value++;
  fetchReportList();
};

// 查看报告详情
const viewReportDetail = (item: any) => {
  uni.navigateTo({
    url: `/pages/assessment/assessmentDetail?id=${item.id}`,
  });
};

// 下载报告
const downloadReport = (item: any) => {
  if (!item.pgFile) {
    uni.showToast({
      title: "暂无报告文件",
      icon: "none",
    });
    return;
  }
  // H5 平台直接在新窗口打开文件
  window.open(item.pgFile, "_blank");
  uni.showToast({
    title: "正在下载",
    icon: "none",
  });

  // 小程序/App 平台使用 uni.downloadFile
  uni.showLoading({ title: "下载中..." });

  // 下载文件
  uni.downloadFile({
    url: item.pgFile,
    success: (res) => {
      if (res.statusCode === 200) {
        // 保存到本地
        uni.saveFile({
          tempFilePath: res.tempFilePath,
          success: (saveRes) => {
            uni.hideLoading();
            uni.showToast({
              title: "下载成功",
              icon: "success",
            });
            // 打开文件
            uni.openDocument({
              filePath: saveRes.savedFilePath,
              success: () => {
                console.log("打开文档成功");
              },
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
};

// 页面加载
onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || currentPage.$route?.query || {};
  agedId.value = Number(options.agedId) || null;
  if (agedId.value) {
    fetchReportList(true);
  }
});
</script>

<template>
  <view class="assessment-list-page">
    <!-- 报告列表 -->
    <scroll-view
      class="report-list"
      scroll-y
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="loading"
      @refresherrefresh="fetchReportList(true)"
    >
      <!-- 空状态 -->
      <view class="empty-state" v-if="reportList.length === 0 && !loading">
        <image
          class="empty-icon"
          src="/static/images/empty.png"
          mode="aspectFit"
        />
        <text class="empty-text">暂无评估报告</text>
      </view>

      <!-- 报告卡片列表 -->
      <view class="report-cards" v-else>
        <view
          class="report-card"
          v-for="(item, index) in reportList"
          :key="item.id"
        >
          <!-- 卡片头部 -->
          <view class="card-header">
            <view class="header-left">
              <text class="report-no">编号：{{ item.pgNo || "-" }}</text>
              <text class="report-date">{{ item.pgDate }}</text>
            </view>
            <view
              class="level-tag"
              :class="getLevelClass(item.pgChanghuEndLevel)"
            >
              {{ getDisabilityLevelText(item.pgChanghuEndLevel) }}
            </view>
          </view>

          <!-- 卡片内容 -->
          <view class="card-body">
            <view class="info-row">
              <text class="info-label">评估机构</text>
              <text class="info-value">{{ item.pgJigouName || "-" }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">机构类型</text>
              <text class="info-value">{{
                getOrgTypeText(item.pgJigouType)
              }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">评估人员</text>
              <text class="info-value">{{ item.pgRen || "-" }}</text>
            </view>
            <view class="info-row" v-if="item.pgNextDate">
              <text class="info-label">下次评估</text>
              <text class="info-value">{{ item.pgNextDate }}</text>
            </view>
          </view>

          <!-- 卡片底部操作 -->
          <view class="card-footer">
            <view class="btn-view" @click="viewReportDetail(item)">
              <text>查看详情</text>
            </view>
            <view class="btn-download" @click="downloadReport(item)">
              <text>下载报告</text>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore">
          <text v-if="loading">加载中...</text>
          <text v-else @click="loadMore">点击加载更多</text>
        </view>
        <view class="no-more" v-else-if="reportList.length > 0">
          <text>没有更多了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.assessment-list-page {
  min-height: 100vh;
  background-color: #f5f7fa;

  /* 报告列表 */
  .report-list {
    height: calc(100vh - 88rpx);
    padding: 24rpx;
    box-sizing: border-box;

    /* 空状态 */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 200rpx 0;

      .empty-icon {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 30rpx;
      }

      .empty-text {
        font-size: 28rpx;
        color: #999;
      }
    }

    /* 报告卡片 */
    .report-cards {
      .report-card {
        border: 1rpx solid #e5e5e5;
        width: 100%;
        background-color: #fff;
        border-radius: 16rpx;
        margin-bottom: 24rpx;
        overflow: hidden;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24rpx;
          background-color: #fff;
          border-bottom: 1rpx solid #f0f0f0;

          .header-left {
            display: flex;
            flex-direction: column;
            gap: 8rpx;

            .report-no {
              font-size: 24rpx;
              color: #999;
            }

            .report-date {
              font-size: 30rpx;
              font-weight: 600;
              color: #333;
            }
          }

          .level-tag {
            padding: 8rpx 16rpx;
            border-radius: 6rpx;
            font-size: 24rpx;
            font-weight: 500;

            &.level-normal {
              background-color: #e6f4ff;
              color: #1677ff;
            }

            &.level-light {
              background-color: #d0f9d9;
              color: #52c41a;
            }

            &.level-medium {
              background-color: #fff2e8;
              color: #fa8c16;
            }

            &.level-severe {
              background-color: #fff1f0;
              color: #ff4d4f;
            }
          }
        }

        .card-body {
          padding: 16rpx 24rpx;

          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14rpx 0;
            border-bottom: 1rpx solid #f5f5f5;

            &:last-child {
              border-bottom: none;
            }

            .info-label {
              font-size: 28rpx;
              color: #666;
            }

            .info-value {
              font-size: 28rpx;
              color: #333;
              font-weight: 500;
            }
          }
        }

        .card-footer {
          display: flex;
          padding: 0 24rpx;

          .btn-view,
          .btn-download {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20rpx 0;
            font-size: 28rpx;
            font-weight: 500;
            transition: all 0.3s ease;
            border-top: 1rpx solid #f0f0f0;

            &:active {
              opacity: 0.7;
            }
          }

          .btn-view {
            color: #1677ff;
            border-right: 1rpx solid #f0f0f0;
          }

          .btn-download {
            color: #52c41a;
          }
        }
      }

      /* 加载更多 */
      .load-more,
      .no-more {
        text-align: center;
        padding: 40rpx 0;
        font-size: 26rpx;
        color: #999;
      }
    }
  }
}
</style>
