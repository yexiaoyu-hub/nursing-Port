// 评估标签页组件
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  getPingguReportList,
  getPingguReportDetail,
} from "@/api/older/older.js";

const props = defineProps<{
  elderlyId: number | null;
}>();

// 失能评估信息（最新数据）
const assessmentInfo = ref({
  time: "",
  organization: "",
  evaluator: "",
  conclusion: "",
  pgNextDate: "",
});

// 评估报告记录
const assessmentRecords = ref<any[]>([]);

// 获取评估报告数据
const fetchAssessmentData = async () => {
  if (!props.elderlyId) return;
  try {
    // 先获取评估报告列表
    const listRes = await getPingguReportList({
      agedId: props.elderlyId,
      pageNo: 1,
      pageSize: 10,
    });
    const listData = listRes?.data || listRes;
    const records = listData?.list || [];

    if (records.length > 0) {
      // 获取最新一条评估报告的详情
      const latestReport = records[0];
      const detailRes = await getPingguReportDetail(latestReport.id);
      const data = detailRes?.data || detailRes;

      if (data) {
        // 更新最新评估信息
        assessmentInfo.value = {
          time: data.pgDate || "",
          organization: data.pgJigouName || "",
          evaluator: data.pgRen || "",
          conclusion: getDisabilityLevelText(data.pgChanghuEndLevel),
          pgNextDate: data.pgNextDate || "",
        };
        // 更新评估记录列表
        assessmentRecords.value = records.map((item: any) => ({
          id: item.id,
          date: item.pgDate,
          title: "失能评估",
          description: item.pgHulituijian || "",
          level: getDisabilityLevelText(item.pgChanghuEndLevel),
        }));
      }
    }
  } catch (error) {
    console.error("获取评估报告失败:", error);
  }
};

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

// 按评估时间排序（最新的在前）
const sortedRecords = computed(() => {
  return [...assessmentRecords.value].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

// 显示的评估记录（最多3条）
const displayRecords = computed(() => {
  return sortedRecords.value.slice(0, 3);
});

// 查看更多报告
const viewMoreReports = () => {
  if (!props.elderlyId) return;
  uni.navigateTo({
    url: `/pages/assessment/assessmentList?agedId=${props.elderlyId}`,
  });
};

// 评估提醒
const reminderEnabled = ref(false);

// 切换提醒
const toggleReminder = () => {
  reminderEnabled.value = !reminderEnabled.value;
};

// 查看评估报告详情
const viewReportDetail = (item: any) => {
  uni.navigateTo({
    url: `/pages/assessment/assessmentDetail?id=${item.id}`,
  });
};

// 获取等级标签样式
const getLevelClass = (level: string) => {
  switch (level) {
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

// 监听elderlyId变化，获取评估数据
watch(
  () => props.elderlyId,
  (newId) => {
    if (newId) {
      fetchAssessmentData();
    }
  },
  { immediate: true }
);
</script>

<template>
  <view class="assessment-tab">
    <!-- 失能评估信息（最新数据） -->
    <view class="section">
      <view class="section-header">
        <view class="section-title">失能评估信息</view>
      </view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">评估日期</text>
          <text class="value">{{ assessmentInfo.time }}</text>
        </view>
        <view class="info-item">
          <text class="label">评估机构</text>
          <text class="value">{{ assessmentInfo.organization }}</text>
        </view>
        <view class="info-item">
          <text class="label">评估人员</text>
          <text class="value">{{ assessmentInfo.evaluator }}</text>
        </view>
        <view class="info-item">
          <text class="label">评估结论</text>
          <text class="value">{{ assessmentInfo.conclusion }}</text>
        </view>
        <view class="info-item">
          <text class="label">下次评估日期</text>
          <text class="value">{{ assessmentInfo.pgNextDate }}</text>
        </view>
      </view>
    </view>

    <!-- 评估报告记录 -->
    <view class="section timeline-section">
      <view class="section-title">评估报告记录</view>
      <view class="timeline">
        <view
          class="timeline-item"
          v-for="(item, index) in displayRecords"
          :key="item.id"
        >
          <view class="timeline-line">
            <view class="timeline-dot"></view>
            <view
              class="timeline-connector"
              v-if="index < displayRecords.length - 1"
            ></view>
          </view>
          <view class="timeline-content">
            <text class="timeline-date">{{ item.date }}</text>
            <view class="timeline-card">
              <view class="card-header">
                <view class="card-title-row">
                  <text class="card-title">{{ item.title }}</text>
                  <view class="btn-view-small" @click="viewReportDetail(item)"
                    >查看</view
                  >
                </view>
                <text class="card-level" :class="getLevelClass(item.level)">
                  {{ item.level }}
                </text>
              </view>
              <text class="card-desc">{{ item.description }}</text>
            </view>
          </view>
        </view>
      </view>
      <!-- 查看更多报告按钮 -->
      <view class="view-more-btn" @click="viewMoreReports">
        <text>查看更多报告</text>
      </view>
    </view>

    <!-- 评估提醒 -->
    <view class="section">
      <view class="section-title">评估提醒</view>
      <view class="reminder-list">
        <view class="reminder-item switch-item">
          <text class="label">提醒通知</text>
          <switch
            :checked="reminderEnabled"
            @change="toggleReminder"
            color="#1677ff"
          />
        </view>
        <view class="reminder-tip">
          <text>开启后将在下次评估前进行系统通知提醒。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.assessment-tab {
  padding: 20rpx 30rpx;

  .section {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    border: 1rpx solid #0f172a14;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .section-title {
        font-size: 26rpx;
        color: #999;
        margin-bottom: 0;
      }
    }

    .section-title {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 20rpx;
    }
  }

  .info-list {
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
      }
    }
  }

  .button-row {
    display: flex;
    gap: 20rpx;

    .btn {
      flex: 1;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20rpx;
      font-size: 28rpx;

      &.primary {
        background: #1677ff;
        color: #fff;
      }

      &.default {
        background-color: #fff;
        color: #333;
        border: 2rpx solid #eaeaea;
      }
    }
  }

  .timeline-section {
    padding-left: 20rpx;

    .view-more-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20rpx 40rpx;
      margin: 30rpx auto 10rpx;
      background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
      border-radius: 20rpx;
      color: #fff;
      font-size: 28rpx;
      font-weight: 500;
      box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.3);
      transition: all 0.3s ease;
      width: fit-content;
      min-width: 280rpx;

      &:active {
        transform: scale(0.98);
        box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.2);
      }

      &:hover {
        .arrow {
          transform: translateX(4rpx);
        }
      }
    }
  }

  .timeline {
    .timeline-item {
      display: flex;
      align-items: flex-start;

      .timeline-line {
        width: 32rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        flex-shrink: 0;

        .timeline-dot {
          width: 20rpx;
          height: 20rpx;
          background-color: #1677ff;
          border-radius: 50%;
          margin-top: 4rpx;
          flex-shrink: 0;
        }

        .timeline-connector {
          width: 3rpx;
          flex: 1;
          min-height: 120rpx;
          background-color: #e8e8e8;
          margin: 8rpx 0;
        }
      }

      .timeline-content {
        flex: 1;
        padding-bottom: 30rpx;
        padding-left: 20rpx;

        .timeline-date {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 12rpx;
          display: block;
        }

        .timeline-card {
          background-color: #fff;
          border: 2rpx solid #eaeaea;
          border-radius: 16rpx;
          padding: 24rpx;
          box-shadow: 2rpx 5rpx 15rpx rgba(0, 0, 0, 0.1);

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8rpx;

            .card-title-row {
              display: flex;
              align-items: center;
              gap: 16rpx;

              .card-title {
                font-size: 30rpx;
                font-weight: 600;
                color: #333;
              }

              .btn-view-small {
                width: 60rpx;
                height: 40rpx;
                line-height: 40rpx;
                text-align: center;
                padding: 5rpx 16rpx;
                background-color: #1677ff;
                color: #fff;
                font-size: 24rpx;
                border-radius: 6rpx;
              }
            }

            .card-level {
              font-size: 24rpx;
              padding: 4rpx 12rpx;
              border-radius: 8rpx;
              flex-shrink: 0;

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

          .card-desc {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
  }

  .reminder-list {
    .reminder-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      &.switch-item {
        padding: 20rpx 0;
      }

      .label {
        font-size: 28rpx;
        color: #666;
      }

      .value {
        font-size: 28rpx;
        color: #333;
      }
    }

    .reminder-tip {
      margin-top: 16rpx;
      padding-top: 16rpx;
      border-top: 1rpx solid #f5f5f5;

      text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}
</style>
