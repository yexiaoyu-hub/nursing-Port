// 待服务老人组件
<script setup lang="ts">
import { ref } from "vue";

// 核心看板数据
const dashboardData = ref({
  pendingElderly: 12,
  institutionElderly: 3,
  communityElderly: 4,
});

// 失能等级分布
const disabilityDistribution = ref([
  { name: "一级", count: 5, percentage: 42 },
  { name: "二级", count: 4, percentage: 33 },
  { name: "三级", count: 3, percentage: 25 },
]);

// 健康状况分布
const healthDistribution = ref([
  { name: "一级", count: 3, percentage: 25, color: "#ff4d4f" },
  { name: "二级", count: 4, percentage: 33, color: "#faad14" },
  { name: "三级", count: 5, percentage: 42, color: "#52c41a" },
]);

// 服务频次统计
const frequencyDistribution = ref([
  { name: "1-2 次", count: 6, percentage: 50 },
  { name: "3-4 次", count: 4, percentage: 33 },
  { name: "5 次及以上", count: 2, percentage: 17 },
]);
const weeklyTotal = ref(26);
</script>

<template>
  <view class="pending-elderly">
    <!-- 核心看板 -->
    <view class="dashboard-section">
      <text class="section-title">核心看板</text>
      <view class="dashboard-cards">
        <view class="dashboard-card">
          <text class="card-label">待服务老人</text>
          <text class="card-value">{{ dashboardData.pendingElderly }}</text>
        </view>
        <view class="dashboard-card">
          <text class="card-label">机构护理老人</text>
          <text class="card-value">{{ dashboardData.institutionElderly }}</text>
        </view>
        <view class="dashboard-card">
          <text class="card-label">社区/居家老人</text>
          <text class="card-value">{{ dashboardData.communityElderly }}</text>
        </view>
      </view>
    </view>

    <!-- 分布图表 -->
    <view class="chart-section">
      <text class="section-title">分布图表</text>

      <!-- 失能等级分布 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">失能等级分布</text>
          <text class="chart-total"
            >总数：{{ dashboardData.pendingElderly }}</text
          >
        </view>
        <view class="chart-list">
          <view
            v-for="(item, index) in disabilityDistribution"
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

      <!-- 健康状况分布 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">健康状况分布</text>
          <text class="chart-total">概览</text>
        </view>
        <view class="chart-list">
          <view
            v-for="(item, index) in healthDistribution"
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

      <!-- 服务频次统计 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">服务频次统计</text>
          <text class="chart-total">本周合计 {{ weeklyTotal }}</text>
        </view>
        <view class="chart-list">
          <view
            v-for="(item, index) in frequencyDistribution"
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
.pending-elderly {
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
