// 待服务项目组件
<script setup lang="ts">
import { ref } from "vue";

// 核心看板数据
const dashboardData = ref({
  totalProjects: 9,
  totalDuration: 540,
});

// 项目类型分布
const projectTypeDistribution = ref([
  { name: "基础护理", count: 4, percentage: 44 },
  { name: "康复训练", count: 3, percentage: 33 },
  { name: "心理疏导", count: 2, percentage: 22 },
]);

// 预计时长分布
const durationDistribution = ref([
  { name: "≤30 分钟", count: 2, percentage: 22 },
  { name: "31-60 分钟", count: 5, percentage: 56 },
  { name: ">60 分钟", count: 2, percentage: 22 },
]);
const avgDuration = ref(60);
</script>

<template>
  <view class="pending-service">
    <!-- 核心看板 -->
    <view class="dashboard-section">
      <text class="section-title">核心看板</text>
      <view class="dashboard-cards">
        <view class="dashboard-card">
          <text class="card-label">待服务项目总数</text>
          <text class="card-value">{{ dashboardData.totalProjects }}</text>
        </view>
        <view class="dashboard-card">
          <text class="card-label">预计总时长</text>
          <view class="card-value-row">
            <text class="card-value">{{ dashboardData.totalDuration }}</text>
            <text class="unit">min</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 分布图表 -->
    <view class="chart-section">
      <text class="section-title">分布图表</text>

      <!-- 按项目类型分布 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">按项目类型分布</text>
          <text class="chart-total"
            >总数：{{ dashboardData.totalProjects }}</text
          >
        </view>
        <view class="chart-list">
          <view
            v-for="(item, index) in projectTypeDistribution"
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

      <!-- 按预计时长分布 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">按预计时长分布</text>
          <text class="chart-total">平均 {{ avgDuration }} 分钟</text>
        </view>
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
  </view>
</template>

<style lang="scss" scoped>
.pending-service {
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

        .unit {
          font-size: 30rpx;
          color: #999;
          margin-left: 8rpx;
        }
      }
    }
  }

  // 分布图表
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
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }

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
          background-color: #f5f5f5;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
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
}
</style>
