// 评估标签页组件
<script setup lang="ts">
import { ref } from "vue";

// 失能评估信息
const assessmentInfo = ref({
  time: "2026-01-10 09:30",
  organization: "正一养老评估中心",
  evaluator: "王评估师",
  conclusion: "失能：中度",
});

// 评估历史记录
const historyRecords = ref([
  {
    id: 1,
    date: "2026-01-10",
    title: "失能评估",
    description: "结论稳定，建议 6 个月复评",
    level: "中度",
  },
  {
    id: 2,
    date: "2025-07-08",
    title: "失能评估",
    description: "ADL 轻微下降，持续观察",
    level: "中度",
  },
  {
    id: 3,
    date: "2024-12-20",
    title: "失能评估",
    description: "入院初评",
    level: "轻度",
  },
]);

// 评估提醒
const reminderEnabled = ref(false);
const nextAssessmentDate = ref("2026-07-10");

// 切换提醒
const toggleReminder = () => {
  reminderEnabled.value = !reminderEnabled.value;
};

// 查看评估报告
const viewReport = () => {
  uni.showToast({
    title: "查看评估报告",
    icon: "none",
  });
};

// 查看评估历史记录
const viewHistory = () => {
  uni.showToast({
    title: "查看评估历史记录",
    icon: "none",
  });
};

// 获取等级标签样式
const getLevelClass = (level: string) => {
  switch (level) {
    case "轻度":
      return "level-light";
    case "中度":
      return "level-medium";
    case "重度":
      return "level-severe";
    default:
      return "level-light";
  }
};
</script>

<template>
  <view class="assessment-tab">
    <!-- 失能评估信息 -->
    <view class="section">
      <view class="section-title">失能评估信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">评估时间</text>
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
      </view>
    </view>

    <!-- 评估报告查看 -->
    <view class="section">
      <view class="section-title">评估报告查看</view>
      <view class="button-row">
        <view class="btn default" @click="viewReport">查看评估报告</view>
        <view class="btn primary" @click="viewHistory">评估历史记录</view>
      </view>
    </view>

    <!-- 评估历史记录时间轴 -->
    <view class="section timeline-section">
      <view class="section-title">评估历史记录</view>
      <view class="timeline">
        <view
          class="timeline-item"
          v-for="(item, index) in historyRecords"
          :key="item.id"
        >
          <view class="timeline-line">
            <view class="timeline-dot"></view>
            <view
              class="timeline-connector"
              v-if="index < historyRecords.length - 1"
            ></view>
          </view>
          <view class="timeline-content">
            <text class="timeline-date">{{ item.date }}</text>
            <view class="timeline-card">
              <view class="card-header">
                <text class="card-title">{{ item.title }}</text>
                <text class="card-level" :class="getLevelClass(item.level)">
                  {{ item.level }}
                </text>
              </view>
              <text class="card-desc">{{ item.description }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 评估提醒 -->
    <view class="section">
      <view class="section-title">评估提醒</view>
      <view class="reminder-list">
        <view class="reminder-item">
          <text class="label">下次评估时间</text>
          <text class="value">{{ nextAssessmentDate }}</text>
        </view>
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

            .card-title {
              font-size: 30rpx;
              font-weight: 600;
              color: #333;
            }

            .card-level {
              font-size: 24rpx;
              padding: 4rpx 12rpx;
              border-radius: 8rpx;

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
