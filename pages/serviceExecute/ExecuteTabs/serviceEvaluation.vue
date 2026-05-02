// 服务评价标签页组件
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { createServiceEvaluation } from "@/api/service/service";

// Props
const props = defineProps<{
  orderId?: string;
}>();

// 本地存储key
const getStorageKey = () => `serviceEvaluation_${props.orderId}`;

// 评分（1-5星）
const rating = ref(0);

// 评价内容
const comment = ref("");

// 是否已评价
const isEvaluated = ref(false);

// 页面加载时恢复状态
onMounted(() => {
  const storageKey = getStorageKey();
  const savedData = uni.getStorageSync(storageKey);
  if (savedData) {
    rating.value = savedData.rating || 0;
    comment.value = savedData.comment || "";
    isEvaluated.value = savedData.isEvaluated || false;
  }
});

// 保存状态到本地
const saveState = () => {
  const storageKey = getStorageKey();
  uni.setStorageSync(storageKey, {
    rating: rating.value,
    comment: comment.value,
    isEvaluated: isEvaluated.value,
  });
};

// 星级评分文字
const ratingText = computed(() => {
  const texts = ["非常不满意", "不满意", "一般", "满意", "非常满意"];
  return texts[rating.value - 1] || "";
});

// 设置评分
const setRating = (index: number) => {
  // 如果已评价，不允许修改
  if (isEvaluated.value) {
    return;
  }
  rating.value = index;
  saveState();
};

// 提交评价
const handleSubmit = async () => {
  // 如果已评价，不处理
  if (isEvaluated.value) {
    return;
  }

  // 检查评分
  if (rating.value === 0) {
    uni.showToast({
      title: "请选择评分",
      icon: "none",
    });
    return;
  }

  // 检查评价内容
  if (!comment.value.trim()) {
    uni.showToast({
      title: "请输入评价内容",
      icon: "none",
    });
    return;
  }

  uni.showLoading({ title: "提交中..." });

  try {
    const data = {
      orderId: parseInt(props.orderId || "0") || 0,
      star: rating.value,
      starTxt: comment.value.trim(),
      starTime: new Date().toISOString(),
    };

    await createServiceEvaluation(data);

    uni.hideLoading();

    // 标记已评价
    isEvaluated.value = true;

    // 保存状态
    saveState();

    uni.showToast({
      title: "评价成功",
      icon: "success",
    });
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({
      title: error?.msg || error?.message || "提交失败",
      icon: "none",
    });
  }
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
        <view class="star-list" :class="{ disabled: isEvaluated }">
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
          :disabled="isEvaluated"
          placeholder="请输入您对本次服务的评价，包括服务态度、专业技能等..."
          maxlength="500"
          @blur="saveState"
        />
      </view>

      <!-- 提交按钮 -->
      <view
        class="btn-submit"
        :class="{ disabled: isEvaluated }"
        @click="handleSubmit"
      >
        {{ isEvaluated ? "已评价" : "提交评价" }}
      </view>
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

        &.disabled {
          pointer-events: none;
          opacity: 0.7;
        }

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

      &.disabled {
        background-color: #93c5fd;
        pointer-events: none;
      }
    }
  }
}
</style>
