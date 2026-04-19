// 服务评价标签页组件
<script setup lang="ts">
import { ref, computed } from "vue";

// 评分（1-5星）
const rating = ref(0);

// 评价内容
const comment = ref("");

// 星级评分文字
const ratingText = computed(() => {
  const texts = ["非常不满意", "不满意", "一般", "满意", "非常满意"];
  return texts[rating.value - 1] || "";
});

// 设置评分
const setRating = (index: number) => {
  rating.value = index;
};

// 提交评价
const handleSubmit = () => {
  uni.showModal({
    title: "提交成功",
    content: "感谢您的评价！",
    showCancel: false,
    success: () => {
      // 返回首页或订单列表
      uni.navigateBack({
        delta: 2,
      });
    },
  });
};
</script>

<template>
  <view class="service-evaluation-tab">
    <!-- 评价卡片 -->
    <view class="evaluation-card">
      <!-- 标题 -->
      <view class="evaluation-header">
        <text class="title">请对本次服务进行评价</text>
        <text class="subtitle">您的评价将帮助我们提供更好的服务</text>
      </view>

      <!-- 星级评分 -->
      <view class="star-section">
        <view class="star-list">
          <view
            v-for="index in 5"
            :key="index"
            class="star-item"
            :class="{ active: index <= rating }"
            @click="setRating(index)"
          >
            <text class="star-icon">★</text>
          </view>
        </view>
        <text class="rating-text">{{ ratingText }}</text>
      </view>

      <!-- 评价内容 -->
      <view class="comment-section">
        <text class="comment-label">评价内容</text>
        <textarea
          v-model="comment"
          class="comment-textarea"
          placeholder="请输入您对本次服务的评价，包括服务态度、专业技能等..."
          maxlength="500"
        />
      </view>

      <!-- 提交按钮 -->
      <view class="btn-submit" @click="handleSubmit"> 提交评价 </view>
    </view>

    <!-- 底部安全区域 -->
    <view style="height: 40rpx"></view>
  </view>
</template>

<style lang="scss" scoped>
.service-evaluation-tab {
  padding: 20rpx;

  .evaluation-card {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 40rpx 30rpx;

    .evaluation-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40rpx;

      .title {
        font-size: 32rpx;
        color: #333;
        font-weight: 600;
        margin-bottom: 12rpx;
      }

      .subtitle {
        font-size: 26rpx;
        color: #999;
      }
    }

    .star-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40rpx;

      .star-list {
        display: flex;
        gap: 20rpx;
        margin-bottom: 20rpx;

        .star-item {
          width: 80rpx;
          height: 80rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2rpx solid #e0e0e0;
          border-radius: 12rpx;
          transition: all 0.2s ease;

          .star-icon {
            font-size: 40rpx;
            color: #e0e0e0;
          }

          &.active {
            border-color: #ff9500;
            background-color: #fff7e6;

            .star-icon {
              color: #ff9500;
            }
          }
        }
      }

      .rating-text {
        font-size: 30rpx;
        color: #ff9500;
        font-weight: 600;
      }
    }

    .comment-section {
      margin-bottom: 40rpx;

      .comment-label {
        display: block;
        font-size: 28rpx;
        color: #666;
        margin-bottom: 16rpx;
      }

      .comment-textarea {
        width: 100%;
        height: 200rpx;
        background-color: #fff;
        border: 2rpx solid #e0e0e0;
        border-radius: 12rpx;
        padding: 20rpx;
        font-size: 28rpx;
        color: #333;
        box-sizing: border-box;
      }
    }

    .btn-submit {
      width: 100%;
      height: 90rpx;
      background-color: #1677ff;
      color: #fff;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
      font-weight: 600;
    }
  }
}
</style>
