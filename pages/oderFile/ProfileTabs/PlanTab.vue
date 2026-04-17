// 计划标签页组件
<script setup lang="ts">
import { ref, computed } from "vue";

// 日常护理计划
const dailyPlans = ref([
  {
    id: 1,
    category: "生活照料",
    name: "晨间清洁",
    frequency: "1次/日",
    duration: "20分钟",
    note: "皮肤观察",
  },
  {
    id: 2,
    category: "医疗护理",
    name: "血压测量",
    frequency: "2次/日",
    duration: "10分钟",
    note: "早晚各一次",
  },
  {
    id: 3,
    category: "康复训练",
    name: "关节活动",
    frequency: "1次/日",
    duration: "30分钟",
    note: "耐受调整",
  },
]);

// 今日完成进度
const todayProgress = ref({
  completed: 5,
  total: 6,
});

const progressPercent = computed(() => {
  return Math.round(
    (todayProgress.value.completed / todayProgress.value.total) * 100
  );
});

// 计划调整
const planAdjustments = ref([
  {
    id: 1,
    date: "2026-01-19",
    title: "调整监测频次",
    content: "血压监测由每日1次调整为每日2次。",
    type: "计划变更",
  },
  {
    id: 2,
    date: "2025-12-28",
    title: "调整训练时长",
    content: "关节活动训练由20分钟调整为30分钟。",
    type: "计划删除",
  },
]);

// 计划执行记录（无顺延状态，统一展示完成，去掉最后一个）
const executionRecords = ref([
  {
    id: 1,
    name: "血压测量",
    time: "2026-01-26 08:10",
    executor: "护工-陈",
    status: "完成",
  },
  {
    id: 2,
    name: "晨间清洁",
    time: "2026-01-26 07:40",
    executor: "护工-陈",
    status: "完成",
  },
  {
    id: 3,
    name: "关节活动训练",
    time: "2026-01-25 16:20",
    executor: "康复师-周",
    status: "完成",
  },
]);

// 获取调整类型样式
const getAdjustmentTypeClass = (type: string) => {
  switch (type) {
    case "计划变更":
      return "type-change";
    case "计划删除":
      return "type-delete";
    default:
      return "type-change";
  }
};
</script>

<template>
  <view class="plan-tab">
    <!-- 日常护理计划 -->
    <view class="section">
      <view class="section-title">日常护理计划</view>
      <view class="plan-list">
        <view class="plan-card" v-for="item in dailyPlans" :key="item.id">
          <view class="plan-header">
            <view class="plan-title-row">
              <text class="plan-category">{{ item.category }}：</text>
              <text class="plan-name">{{ item.name }}</text>
            </view>
            <text class="plan-tag">{{ item.category }}</text>
          </view>
          <view class="plan-detail">
            <text class="detail-text">
              频次 {{ item.frequency }} · 时长 {{ item.duration }} · 注意事项
              {{ item.note }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 今日完成 -->
    <view class="section">
      <view class="progress-header">
        <text class="section-title">今日完成</text>
        <text class="progress-text">
          {{ todayProgress.completed }}/{{ todayProgress.total }} ({{
            progressPercent
          }}%)
        </text>
      </view>
      <view class="progress-bar">
        <view
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></view>
      </view>
    </view>

    <!-- 计划调整 -->
    <view class="section timeline-section">
      <view class="section-title">计划调整</view>
      <view class="timeline">
        <view
          class="timeline-item"
          v-for="(item, index) in planAdjustments"
          :key="item.id"
        >
          <view class="timeline-line">
            <view class="timeline-dot"></view>
            <view
              class="timeline-connector"
              v-if="index < planAdjustments.length - 1"
            ></view>
          </view>
          <view class="timeline-content">
            <text class="timeline-date">{{ item.date }}</text>
            <view class="timeline-card">
              <view class="card-header">
                <text class="card-title">{{ item.title }}</text>
                <text
                  class="card-type"
                  :class="getAdjustmentTypeClass(item.type)"
                >
                  {{ item.type }}
                </text>
              </view>
              <text class="card-content">{{ item.content }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 计划执行记录 -->
    <view class="section">
      <view class="section-title">计划执行记录</view>
      <view class="record-list">
        <view
          class="record-card"
          v-for="item in executionRecords"
          :key="item.id"
        >
          <view class="record-header">
            <text class="record-name">{{ item.name }}</text>
            <text class="record-status">{{ item.status }}</text>
          </view>
          <view class="record-info">
            <text class="info-text">
              执行时间 {{ item.time }} · 执行人员 {{ item.executor }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.plan-tab {
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

  .plan-list {
    .plan-card {
      background-color: #fff;
      border: 2rpx solid #eaeaea;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;
      box-shadow: 2rpx 5rpx 15rpx rgba(0, 0, 0, 0.06);

      &:last-child {
        margin-bottom: 0;
      }

      .plan-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        .plan-title-row {
          display: flex;
          align-items: center;

          .plan-category {
            font-size: 30rpx;
            font-weight: 600;
            color: #333;
          }

          .plan-name {
            font-size: 30rpx;
            font-weight: 600;
            color: #333;
          }
        }

        .plan-tag {
          font-size: 24rpx;
          color: #999;
          background-color: #f5f5f5;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
        }
      }

      .plan-detail {
        .detail-text {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .section-title {
      margin-bottom: 0;
    }

    .progress-text {
      font-size: 28rpx;
      color: #666;
    }
  }

  .progress-bar {
    width: 100%;
    height: 15rpx;
    background-color: #e8e8e8;
    border-radius: 6rpx;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: #1677ff;
      border-radius: 6rpx;
      transition: width 0.3s ease;
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
            margin-bottom: 12rpx;

            .card-title {
              font-size: 30rpx;
              font-weight: 600;
              color: #333;
            }

            .card-type {
              font-size: 24rpx;
              padding: 4rpx 12rpx;
              border-radius: 8rpx;

              &.type-change {
                background-color: #f5f5f5;
                color: #666;
              }

              &.type-delete {
                background-color: #fff1f0;
                color: #ff4d4f;
              }
            }
          }

          .card-content {
            font-size: 26rpx;
            color: #666;
            line-height: 1.5;
          }
        }
      }
    }
  }

  .record-list {
    .record-card {
      background-color: #fff;
      border: 2rpx solid #eaeaea;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;
      box-shadow: 2rpx 5rpx 15rpx rgba(0, 0, 0, 0.06);

      &:last-child {
        margin-bottom: 0;
      }

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10rpx;

        .record-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
        }

        .record-status {
          font-size: 24rpx;
          color: #52c41a;
          background-color: #d0f9d9;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
        }
      }

      .record-info {
        .info-text {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}
</style>
