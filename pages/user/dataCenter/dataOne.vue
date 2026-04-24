// 待服务订单组件
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { getPendingServiceOrderStatistics } from "@/api/dataBoard/dataBoard.js";

// 定义 props 接收日期范围
const props = defineProps<{
  dateRange?: {
    beginDate: string;
    endDate: string;
  };
}>();

// 加载状态
const loading = ref(false);

// 服务类型筛选
const serviceType = ref("all");
const serviceTypeOptions = [
  { value: "all", label: "全部" },
  { value: "1", label: "翻身护理" },
  { value: "2", label: "喂食照料" },
  { value: "3", label: "洗澡" },
  { value: "4", label: "基础护理" },
];

// 核心看板数据
const dashboardData = ref({
  pendingOrders: 0,
  totalDuration: 0,
});

// 服务类型分布数据
const serviceTypeDistribution = ref<
  Array<{ name: string; count: number; percentage: number }>
>([]);

// 获取待服务订单统计数据
const fetchStatistics = async () => {
  loading.value = true;
  try {
    const params: Record<string, any> = {};

    // 添加日期范围参数
    if (props.dateRange?.beginDate) {
      params.beginDate = props.dateRange.beginDate;
    }
    if (props.dateRange?.endDate) {
      params.endDate = props.dateRange.endDate;
    }

    // 如果选择了具体服务类型，传递 serviceCateId
    if (serviceType.value !== "all") {
      params.serviceCateId = parseInt(serviceType.value);
    }

    const res = await getPendingServiceOrderStatistics(params);

    // 更新核心看板数据
    dashboardData.value = {
      pendingOrders: res.pendingOrderCount || 0,
      totalDuration: res.expectedTotalServiceMinutes || 0,
    };

    // 更新服务类型分布数据
    if (res.serviceTypeDistribution && res.serviceTypeDistribution.length > 0) {
      serviceTypeDistribution.value = res.serviceTypeDistribution.map(
        (item: any) => ({
          name: item.serviceTypeName,
          count: item.orderCount,
          percentage: Math.round((item.ratio || 0) * 100),
        })
      );
    } else {
      serviceTypeDistribution.value = [];
    }
  } catch (error) {
    console.error("获取待服务订单统计失败:", error);
  } finally {
    loading.value = false;
  }
};

// 选择服务类型
const selectServiceType = () => {
  const itemList = serviceTypeOptions.map((item) => item.label);
  uni.showActionSheet({
    itemList,
    success: (res) => {
      serviceType.value = serviceTypeOptions[res.tapIndex].value;
    },
  });
};

// 监听服务类型变化，重新获取数据
watch(serviceType, () => {
  fetchStatistics();
});

// 监听日期范围变化，重新获取数据
watch(
  () => props.dateRange,
  () => {
    fetchStatistics();
  },
  { deep: true }
);

// 页面加载时获取数据
onMounted(() => {
  fetchStatistics();
});
</script>

<template>
  <view class="pending-orders">
    <!-- 服务类型筛选 -->
    <view class="filter-section">
      <view class="filter-row">
        <text class="filter-label">筛选条件</text>
      </view>
      <view class="filter-options">
        <view class="filter-select" @click="selectServiceType">
          <text class="select-label">服务类型</text>
          <view class="select-value">
            <text>{{
              serviceTypeOptions.find((item) => item.value === serviceType)
                ?.label
            }}</text>
            <text class="arrow-icon">▼</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 核心看板 -->
    <view class="dashboard-section">
      <text class="section-title">核心看板</text>
      <view class="dashboard-cards">
        <view class="dashboard-card">
          <text class="card-label">待服务订单数</text>
          <view class="card-value-row">
            <text class="card-value">{{ dashboardData.pendingOrders }}</text>
          </view>
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
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">按服务类型分布</text>
          <text class="chart-total"
            >Top {{ serviceTypeDistribution.length }}</text
          >
        </view>
        <view class="chart-list" v-if="serviceTypeDistribution.length > 0">
          <view
            v-for="(item, index) in serviceTypeDistribution"
            :key="index"
            class="chart-item"
          >
            <view class="item-info">
              <view class="item-dot" :class="`dot-${index}`"></view>
              <text class="item-name">{{ item.name }}</text>
            </view>
            <view class="item-bar">
              <view
                class="item-progress"
                :style="{ width: item.percentage + '%' }"
                :class="`progress-${index}`"
              ></view>
            </view>
            <view class="item-stats">
              <text class="item-count">{{ item.count }}</text>
              <text class="item-percentage">· {{ item.percentage }}%</text>
            </view>
          </view>
        </view>
        <view class="empty-chart" v-else>
          <text class="empty-text">暂无数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.pending-orders {
  // 筛选区域
  .filter-section {
    background-color: #fff;
    margin: 20rpx;
    border: 1rpx solid #e5e5e5;
    border-radius: 16rpx;
    padding: 24rpx;

    .filter-row {
      margin-bottom: 16rpx;

      .filter-label {
        font-size: 24rpx;
        color: #999;
      }
    }

    .filter-options {
      .filter-select {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 72rpx;
        border: 1rpx solid #e5e5e5;
        border-radius: 8rpx;
        padding: 0 20rpx;

        .select-label {
          font-size: 26rpx;
          color: #666;
        }

        .select-value {
          display: flex;
          align-items: center;

          text {
            font-size: 26rpx;
            color: #333;
          }

          .arrow-icon {
            margin-left: 8rpx;
            font-size: 20rpx;
            color: #999;
          }
        }
      }
    }
  }

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
              font-size: 26rpx;
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

      .empty-chart {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 60rpx 0;

        .empty-text {
          font-size: 28rpx;
          color: #999;
        }
      }
    }
  }
}
</style>
