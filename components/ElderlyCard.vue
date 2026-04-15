//管辖老人卡片组件
<script setup lang="ts">
interface ElderlyItem {
  id: number;
  name: string;
  gender: string;
  age: number;
  bedNo: string;
  status: string;
  statusColor: string;
  disability: string;
  careLevel: string;
  bedStatus?: string;
}

const props = defineProps<{
  item: ElderlyItem;
}>();

const emit = defineEmits<{
  (e: "buttonClick", buttonText: string, elderlyName: string): void;
}>();

const handleButtonClick = (buttonText: string, elderlyName: string) => {
  emit("buttonClick", buttonText, elderlyName);
};
</script>

<template>
  <view class="elderly-card">
    <!-- 状态标签 -->
    <view class="status-tag top-right" :class="item.statusColor">
      {{ item.status }}
    </view>

    <!-- 卡片头部：头像、信息 -->
    <view class="card-header">
      <view class="avatar"></view>
      <view class="info-section">
        <view class="name-row">
          <text class="name">{{ item.name }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-text"
            >{{ item.gender }} · {{ item.age }}岁 · 床位 {{ item.bedNo }}</text
          >
        </view>
        <view class="tag-row">
          <view class="tag disability-tag">失能：{{ item.disability }}</view>
        </view>
      </view>
    </view>

    <!-- 分割线 -->
    <view class="divider"></view>

    <!-- 操作按钮 -->
    <view class="button-row">
      <view
        class="action-btn default"
        @click="handleButtonClick('一键拨号', item.name)"
      >
        一键拨号
      </view>
      <view
        class="action-btn primary"
        @click="handleButtonClick('服务计划', item.name)"
      >
        服务计划
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.elderly-card {
  width: 95%;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin: 0 auto 20rpx;
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
    margin-bottom: 24rpx;

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
        gap: 8rpx;
        flex-wrap: wrap;

        .tag {
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
          font-size: 20rpx;

          &.disability-tag {
            background-color: #f5f5f5;
            color: #999;
            border: 1rpx solid #ddd;
          }
        }
      }
    }
  }

  .divider {
    height: 1rpx;
    background-color: #eee;
    margin-bottom: 20rpx;
  }

  .button-row {
    display: flex;
    gap: 16rpx;

    .action-btn {
      flex: 1;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 15rpx;
      font-size: 26rpx;
      white-space: nowrap;

      &.default {
        background-color: #f5f5f5;
        color: #666;
        border: 1rpx solid #ddd;
      }

      &.primary {
        background: #1677ff;
        color: #fff;
      }
    }
  }
}
</style>
