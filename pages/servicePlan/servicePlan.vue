// 服务计划执行页面
<script setup lang="ts">
import { ref } from "vue";

// 老人信息
const elderlyInfo = ref({
  id: 1,
  name: "张三",
  gender: "男",
  age: 78,
  bedNo: "3F-301-01",
  status: "稳定",
  statusColor: "green",
  disability: "中度",
});

// 服务计划数据
const servicePlans = ref([
  {
    category: "生活照料",
    items: [
      {
        id: 1,
        name: "失禁照护",
        completed: 0,
        total: 2,
        frequency: "每周",
        duration: "20分钟",
        checked: true,
      },
      {
        id: 2,
        name: "失禁照护",
        completed: 1,
        total: 2,
        frequency: "日",
        duration: "20分钟",
        checked: true,
      },
      {
        id: 3,
        name: "失禁照护",
        completed: 0,
        total: 2,
        frequency: "每周",
        duration: "20分钟",
        checked: false,
      },
      {
        id: 4,
        name: "失禁照护",
        completed: 1,
        total: 2,
        frequency: "日",
        duration: "20分钟",
        checked: true,
      },
    ],
  },
  {
    category: "医疗护理",
    items: [
      {
        id: 5,
        name: "失禁照护",
        completed: 0,
        total: 1,
        frequency: "必要时",
        duration: "20分钟",
        checked: true,
      },
      {
        id: 6,
        name: "失禁照护",
        completed: 1,
        total: 2,
        frequency: "日",
        duration: "20分钟",
        checked: true,
      },
      {
        id: 7,
        name: "失禁照护",
        completed: 0,
        total: 1,
        frequency: "必要时",
        duration: "20分钟",
        checked: false,
      },
    ],
  },
]);

// 切换项目选中状态
const toggleItem = (categoryIndex: number, itemIndex: number) => {
  const item = servicePlans.value[categoryIndex].items[itemIndex];
  item.checked = !item.checked;
};

// 开始服务
const startService = () => {
  uni.navigateTo({
    url: "/pages/serviceExecute/index?id=" + elderlyInfo.value.id,
  });
};

// 查看历史记录
const viewHistory = () => {
  uni.navigateTo({
    url: "/pages/servicePlan/historicalRecord?id=" + elderlyInfo.value.id,
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};
</script>

<template>
  <view class="plan-execute-page">
    <!-- 老人卡片 -->
    <view class="elderly-card">
      <!-- 状态标签 -->
      <view class="status-tag top-right" :class="elderlyInfo.statusColor">
        {{ elderlyInfo.status }}
      </view>

      <!-- 卡片头部：头像、信息 -->
      <view class="card-header">
        <view class="avatar"></view>
        <view class="info-section">
          <view class="name-row">
            <text class="name">{{ elderlyInfo.name }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-text"
              >{{ elderlyInfo.gender }} · {{ elderlyInfo.age }}岁 · 床位
              {{ elderlyInfo.bedNo }}</text
            >
          </view>
          <view class="tag-row">
            <view class="tag disability-tag"
              >失能：{{ elderlyInfo.disability }}</view
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 服务计划列表 -->
    <view class="service-plan-card">
      <view
        v-for="(plan, categoryIndex) in servicePlans"
        :key="plan.category"
        class="plan-category"
      >
        <view class="category-title">{{ plan.category }}</view>
        <view class="divider"></view>

        <view
          v-for="(item, itemIndex) in plan.items"
          :key="item.id"
          class="plan-item"
          @click="toggleItem(categoryIndex, itemIndex)"
        >
          <view class="checkbox" :class="{ checked: item.checked }">
            <text v-if="item.checked" class="check-icon">✓</text>
          </view>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-progress"
              >已完成：{{ item.completed }}/{{ item.total }} 次 /
              {{ item.frequency }}</text
            >
          </view>
          <text class="item-duration">标准时长：{{ item.duration }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <view class="btn-primary" @click="startService">开始服务</view>
      <view class="btn-default" @click="viewHistory"
        >查看该老人历史服务记录</view
      >
    </view>
  </view>
</template>

<style lang="scss" scoped>
.plan-execute-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 40rpx;
  box-sizing: border-box;

  // 老人卡片样式
  .elderly-card {
    width: 100%;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
    position: relative;

    .status-tag {
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      font-size: 22rpx;

      &.top-right {
        position: absolute;
        top: 24rpx;
        right: 24rpx;
      }

      &.green {
        background-color: #d0f9d9;
        color: #52c41a;
        border: 1rpx solid #52c41a;
      }

      &.orange {
        background-color: #fff2e8;
        color: #fa8c16;
        border: 1rpx solid #fa8c16;
      }
    }

    .card-header {
      display: flex;

      .avatar {
        width: 120rpx;
        height: 120rpx;
        background: linear-gradient(135deg, #e6f2ff, #cce5ff);
        border-radius: 20rpx;
        margin-right: 24rpx;
        flex-shrink: 0;
      }

      .info-section {
        flex: 1;

        .name-row {
          display: flex;
          align-items: center;
          margin-bottom: 12rpx;

          .name {
            font-size: 36rpx;
            font-weight: 700;
            color: #333;
            margin-right: 16rpx;
          }
        }

        .detail-row {
          margin-bottom: 12rpx;

          .detail-text {
            font-size: 26rpx;
            color: #999;
          }
        }

        .tag-row {
          display: flex;
          gap: 12rpx;
          flex-wrap: wrap;

          .tag {
            padding: 6rpx 16rpx;
            border-radius: 20rpx;
            font-size: 22rpx;

            &.disability-tag {
              background-color: #f5f5f5;
              color: #666;
              border: 1rpx solid #ddd;
            }
          }
        }
      }
    }
  }

  // 服务计划卡片
  .service-plan-card {
    width: 100%;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    box-sizing: border-box;

    .plan-category {
      margin-bottom: 30rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .category-title {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 16rpx;
      }

      .divider {
        height: 1rpx;
        background-color: #eee;
        margin-bottom: 16rpx;
      }

      .plan-item {
        display: flex;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1rpx dashed #eee;

        &:last-child {
          border-bottom: none;
        }

        .checkbox {
          width: 36rpx;
          height: 36rpx;
          border: 2rpx solid #ccc;
          border-radius: 6rpx;
          margin-right: 16rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          &.checked {
            background-color: #1677ff;
            border-color: #1677ff;
          }

          .check-icon {
            color: #fff;
            font-size: 22rpx;
            font-weight: bold;
          }
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8rpx;

          .item-name {
            font-size: 28rpx;
            color: #333;
          }

          .item-progress {
            font-size: 24rpx;
            color: #666;
          }
        }

        .item-duration {
          font-size: 24rpx;
          color: #999;
          flex-shrink: 0;
        }
      }
    }
  }

  // 底部按钮
  .bottom-actions {
    margin-top: 30rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .btn-primary {
      width: 100%;
      height: 90rpx;
      background: #1677ff;
      color: #fff;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
      font-weight: 600;
    }

    .btn-default {
      width: 100%;
      height: 90rpx;
      background: #fff;
      color: #333;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      border: 1rpx solid #ddd;
    }
  }
}
</style>
