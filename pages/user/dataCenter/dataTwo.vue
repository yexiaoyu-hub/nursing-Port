// 已服务订单组件
<script setup lang="ts">
import { ref } from "vue";

// 核心看板数据
const dashboardData = ref({
  completedOrders: 18,
  onTimeRate: 89,
  abnormalOrders: 2,
});

// 质量概览
const qualityOverview = ref({
  onTimeRate: 89,
  abnormalCount: 2,
});

// 服务时长分布
const durationDistribution = ref([
  { name: "≤30 分钟", count: 5, percentage: 28 },
  { name: "31-60 分钟", count: 10, percentage: 56 },
  { name: ">60 分钟", count: 3, percentage: 16 },
]);
const avgDuration = ref(42);

// 满意度分布
const satisfactionDistribution = ref([
  { name: "5 分", count: 12, percentage: 67, color: "#52c41a" },
  { name: "4 分", count: 5, percentage: 28, color: "#faad14" },
  { name: "≤3 分", count: 1, percentage: 5, color: "#ff4d4f" },
]);
const avgSatisfaction = ref(4.6);

// 异常订单列表
const abnormalOrders = ref([
  {
    type: "超时未开始",
    date: "2026-01-24",
    name: "赵强",
    service: "洗澡",
    level: "严重",
  },
]);
</script>

<template>
  <view class="completed-orders">
    <!-- 核心看板 -->
    <view class="dashboard-section">
      <text class="section-title">核心看板</text>
      <view class="dashboard-cards">
        <view class="dashboard-card">
          <text class="card-label">已服务订单数</text>
          <text class="card-value">{{ dashboardData.completedOrders }}</text>
        </view>
        <view class="dashboard-card">
          <text class="card-label">按时完成率</text>
          <text class="card-value">{{ dashboardData.onTimeRate }}%</text>
        </view>
        <view class="dashboard-card">
          <text class="card-label">异常订单</text>
          <text class="card-value">{{ dashboardData.abnormalOrders }}</text>
        </view>
      </view>
    </view>

    <!-- 质量概览 -->
    <view class="quality-section">
      <text class="section-title">质量概览</text>
      <view class="quality-card">
        <view class="quality-header">
          <text class="quality-title">按时完成率</text>
          <text class="quality-rate">{{ qualityOverview.onTimeRate }}%</text>
        </view>
        <view class="quality-progress">
          <view
            class="progress-bar"
            :style="{ width: qualityOverview.onTimeRate + '%' }"
          ></view>
        </view>
        <text class="quality-desc"
          >本周期内有 {{ qualityOverview.abnormalCount }} 单存在异常。</text
        >
      </view>
    </view>

    <!-- 服务时长分布 -->
    <view class="chart-section">
      <view class="chart-header-row">
        <text class="section-title">服务时长分布</text>
        <text class="chart-avg">均值 {{ avgDuration }} 分钟</text>
      </view>
      <view class="chart-card">
        <view class="chart-list">
          <view
            v-for="(item, index) in durationDistribution"
            :key="index"
            class="chart-item"
          >
            <view class="item-info">
              <view class="item-dot"></view>
              <text class="item-name">{{ item.name }}</text>
            </view>
            <view class="item-bar">
              <view
                class="item-progress"
                :style="{ width: item.percentage + '%' }"
              ></view>
            </view>
            <view class="item-stats">
              <text class="item-count">{{ item.count }}</text>
              <text class="item-percentage">· {{ item.percentage }}%</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 满意度分布 -->
    <view class="chart-section">
      <view class="chart-header-row">
        <text class="section-title">满意度分布</text>
        <text class="chart-avg">平均 {{ avgSatisfaction }}</text>
      </view>
      <view class="chart-card">
        <view class="chart-list">
          <view
            v-for="(item, index) in satisfactionDistribution"
            :key="index"
            class="chart-item"
          >
            <view class="item-info">
              <view
                class="item-dot"
                :style="{ backgroundColor: item.color }"
              ></view>
              <text class="item-name">{{ item.name }}</text>
            </view>
            <view class="item-bar">
              <view
                class="item-progress"
                :style="{
                  width: item.percentage + '%',
                  backgroundColor: item.color,
                }"
              ></view>
            </view>
            <view class="item-stats">
              <text class="item-count">{{ item.count }}</text>
              <text class="item-percentage">· {{ item.percentage }}%</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 异常订单 -->
    <view class="abnormal-section">
      <text class="section-title">异常订单</text>
      <view class="abnormal-list">
        <view
          v-for="(item, index) in abnormalOrders"
          :key="index"
          class="abnormal-card"
        >
          <view class="abnormal-header">
            <text class="abnormal-type">{{ item.type }}</text>
            <view
              class="abnormal-tag"
              :class="{ serious: item.level === '严重' }"
            >
              {{ item.level }}
            </view>
          </view>
          <text class="abnormal-info"
            >{{ item.date }} · {{ item.name }} · {{ item.service }}</text
          >
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.completed-orders {
  // 核心看板
  .dashboard-section {
    margin: 20rpx;

    .section-title {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .dashboard-cards {
      display: flex;
      gap: 20rpx;

      .dashboard-card {
        flex: 1;
        background-color: #fff;
        border: 1rpx solid #e5e5e5;
        border-radius: 16rpx;
        padding: 24rpx;
        display: flex;
        flex-direction: column;

        .card-label {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 12rpx;
        }

        .card-value {
          font-size: 48rpx;
          font-weight: 700;
          color: #333;
        }
      }
    }
  }

  // 质量概览
  .quality-section {
    margin: 20rpx;

    .section-title {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .quality-card {
      background-color: #fff;
      border: 1rpx solid #e5e5e5;
      border-radius: 16rpx;
      padding: 24rpx;

      .quality-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;

        .quality-title {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }

        .quality-rate {
          font-size: 28rpx;
          color: #666;
          background-color: #f5f5f5;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
        }
      }

      .quality-progress {
        height: 16rpx;
        background-color: #f0f0f0;
        border-radius: 8rpx;
        margin-bottom: 16rpx;
        overflow: hidden;

        .progress-bar {
          height: 100%;
          background-color: #52c41a;
          border-radius: 8rpx;
        }
      }

      .quality-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  // 图表区域
  .chart-section {
    margin: 20rpx;

    .chart-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .section-title {
        font-size: 24rpx;
        color: #999;
      }

      .chart-avg {
        font-size: 24rpx;
        color: #999;
      }
    }

    .chart-card {
      background-color: #fff;
      border: 1rpx solid #e5e5e5;
      border-radius: 16rpx;
      padding: 24rpx;

      .chart-list {
        .chart-item {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;

          &:last-child {
            margin-bottom: 0;
          }

          .item-info {
            width: 140rpx;
            display: flex;
            align-items: center;

            .item-dot {
              width: 12rpx;
              height: 12rpx;
              border-radius: 50%;
              margin-right: 12rpx;
              background-color: #1677ff;
            }

            .item-name {
              font-size: 24rpx;
              color: #333;
            }
          }

          .item-bar {
            flex: 1;
            height: 16rpx;
            background-color: #f0f0f0;
            border-radius: 8rpx;
            margin: 0 20rpx;
            overflow: hidden;

            .item-progress {
              height: 100%;
              border-radius: 8rpx;
              background-color: #1677ff;
            }
          }

          .item-stats {
            width: 120rpx;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .item-count {
              font-size: 24rpx;
              color: #666;
            }

            .item-percentage {
              font-size: 24rpx;
              color: #999;
              margin-left: 8rpx;
            }
          }
        }
      }
    }
  }

  // 异常订单
  .abnormal-section {
    margin: 20rpx;

    .section-title {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .abnormal-list {
      .abnormal-card {
        background-color: #fff;
        border: 1rpx solid #e5e5e5;
        border-radius: 20rpx;
        padding: 24rpx;
        margin-bottom: 20rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .abnormal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12rpx;

          .abnormal-type {
            font-size: 30rpx;
            font-weight: 500;
            color: #333;
          }

          .abnormal-tag {
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            font-size: 22rpx;
            background-color: #fff2f0;
            color: #ff4d4f;
            border: 1rpx solid #ff4d4f;

            &.serious {
              background-color: #fff2f0;
              color: #ff4d4f;
              border: 1rpx solid #ff4d4f;
            }
          }
        }

        .abnormal-info {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}
</style>
