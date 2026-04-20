// 累计时长组件
<script setup lang="ts">
import { ref } from "vue";

// 核心看板数据
const dashboardData = ref({
  monthlyDuration: 32,
  yearlyDuration: 286,
  monthlyCount: 84,
  dailyAvgDuration: 1.1,
});

// 月度时长统计
const monthlyStats = ref([
  { date: "01-19", duration: 7.0 },
  { date: "01-20", duration: 6.0 },
  { date: "01-21", duration: 8.0 },
  { date: "01-22", duration: 5.0 },
  { date: "01-23", duration: 4.0 },
  { date: "01-24", duration: 2.0 },
  { date: "01-25", duration: 0 },
]);
const monthlyTotal = ref(32);

// 计算最大时长用于进度条比例
const maxDuration = Math.max(
  ...monthlyStats.value.map((item) => item.duration)
);
</script>

<template>
  <view class="cumulative-duration">
    <!-- 核心看板 -->
    <view class="dashboard-section">
      <text class="section-title">核心看板</text>
      <view class="dashboard-grid">
        <view class="dashboard-card">
          <text class="card-label">本月累计时长</text>
          <view class="card-value-row">
            <text class="card-value">{{ dashboardData.monthlyDuration }}</text>
            <text class="unit">小时</text>
          </view>
        </view>
        <view class="dashboard-card">
          <text class="card-label">本年累计时长</text>
          <view class="card-value-row">
            <text class="card-value">{{ dashboardData.yearlyDuration }}</text>
            <text class="unit">小时</text>
          </view>
        </view>
        <view class="dashboard-card">
          <text class="card-label">本月服务次数</text>
          <text class="card-value">{{ dashboardData.monthlyCount }}</text>
        </view>
        <view class="dashboard-card">
          <text class="card-label">日均服务时长</text>
          <view class="card-value-row">
            <text class="card-value">{{ dashboardData.dailyAvgDuration }}</text>
            <text class="unit">小时</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 月度时长统计 -->
    <view class="chart-section">
      <text class="section-title">月度时长统计</text>
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">本月累计</text>
          <text class="chart-total">总计：{{ monthlyTotal }} 小时</text>
        </view>
        <view class="chart-list">
          <view
            v-for="(item, index) in monthlyStats"
            :key="index"
            class="chart-item"
          >
            <view class="item-info">
              <view class="item-dot"></view>
              <text class="item-name">{{ item.date }}</text>
            </view>
            <view class="item-bar">
              <view
                class="item-progress"
                :style="{ width: (item.duration / maxDuration) * 100 + '%' }"
              ></view>
            </view>
            <view class="item-stats">
              <text class="item-duration">{{ item.duration }}h</text>
            </view>
          </view>
        </view>
        <text class="chart-footer">按天汇总统计（2026-01）。</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.cumulative-duration {
  // 核心看板
  .dashboard-section {
    margin: 20rpx;

    .section-title {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20rpx;

      .dashboard-card {
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

        .card-value-row {
          display: flex;
          align-items: baseline;

          .card-value {
            font-size: 48rpx;
            font-weight: 700;
            color: #333;
          }

          .unit {
            font-size: 30rpx;
            color: #999;
            margin-left: 8rpx;
          }
        }

        .card-value {
          font-size: 48rpx;
          font-weight: 700;
          color: #333;
        }
      }
    }
  }

  // 月度时长统计
  .chart-section {
    margin: 20rpx;

    .section-title {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
      display: block;
    }

    .chart-card {
      background-color: #fff;
      border: 1rpx solid #e5e5e5;
      border-radius: 16rpx;
      padding: 24rpx;

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24rpx;

        .chart-title {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }

        .chart-total {
          font-size: 24rpx;
          color: #999;
        }
      }

      .chart-list {
        .chart-item {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;

          &:last-child {
            margin-bottom: 0;
          }

          .item-info {
            width: 100rpx;
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
            width: 80rpx;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .item-duration {
              font-size: 24rpx;
              color: #666;
            }
          }
        }
      }

      .chart-footer {
        font-size: 22rpx;
        color: #999;
        margin-top: 24rpx;
        display: block;
      }
    }
  }
}
</style>
