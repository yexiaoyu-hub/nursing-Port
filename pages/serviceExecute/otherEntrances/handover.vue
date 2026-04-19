// 服务转交页面
<script setup lang="ts">
import { ref } from "vue";

// 表单数据
const formData = ref({
  workOrderId: "",
  workOrderNo: "5001",
  receiverId: "",
  receiverName: "",
  reason: "",
});

// 返回上一页
const handleBack = () => {
  uni.navigateBack();
};

// 选择工单
const handleSelectWorkOrder = () => {
  uni.showToast({
    title: "选择工单",
    icon: "none",
  });
};

// 选择接收人
const handleSelectReceiver = () => {
  uni.showToast({
    title: "选择接收人",
    icon: "none",
  });
};

// 提交表单
const handleSubmit = () => {
  if (!formData.value.workOrderId && !formData.value.workOrderNo) {
    uni.showToast({
      title: "请选择工单",
      icon: "none",
    });
    return;
  }
  if (!formData.value.receiverId) {
    uni.showToast({
      title: "请选择接收人",
      icon: "none",
    });
    return;
  }
  if (!formData.value.reason.trim()) {
    uni.showToast({
      title: "请填写转交原因",
      icon: "none",
    });
    return;
  }

  uni.showLoading({
    title: "提交中...",
  });

  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: "提交成功，等待审批",
      icon: "success",
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 1500);
};
</script>

<template>
  <view class="handover-page">
    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 提示信息 -->
      <view class="tips-text">
        申请将当前/未来服务任务转交其他同事（需组长审批）
      </view>

      <!-- 选择工单 -->
      <view class="form-item" @click="handleSelectWorkOrder">
        <text class="form-label">选择工单</text>
        <text class="form-value current"
          >（当前：{{ formData.workOrderNo }}）</text
        >
        <text class="arrow-icon">›</text>
      </view>

      <!-- 选择接收人 -->
      <view class="form-item" @click="handleSelectReceiver">
        <text class="form-label">选择接收人</text>
        <text class="form-value placeholder" v-if="!formData.receiverName">
          （占位）
        </text>
        <text class="form-value" v-else>{{ formData.receiverName }}</text>
        <text class="arrow-icon">›</text>
      </view>

      <!-- 转交原因 -->
      <view class="textarea-wrapper">
        <textarea
          class="reason-textarea"
          v-model="formData.reason"
          placeholder="转交原因"
          maxlength="500"
        />
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <view class="btn-submit" @click="handleSubmit">提交</view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area"></view>
  </view>
</template>

<style lang="scss" scoped>
.handover-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 10rpx;

  // 表单容器
  .form-container {
    padding: 20rpx;
    border: 1rpx solid #dddddd;
    border-radius: 16rpx;
    margin: 20rpx;
    background-color: #fff;

    .tips-text {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 20rpx;
      line-height: 1.5;
    }

    // 表单项
    .form-item {
      border: 1rpx solid #dddddd;
      border-radius: 16rpx;
      height: 88rpx;
      padding: 0 24rpx;
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .form-label {
        font-size: 28rpx;
        color: #333;
      }

      .form-value {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        margin-left: 8rpx;

        &.current {
          color: #666;
        }

        &.placeholder {
          color: #999;
        }
      }

      .arrow-icon {
        font-size: 32rpx;
        color: #999;
      }
    }

    // 文本域
    .textarea-wrapper {
      border: 1rpx solid #dddddd;
      border-radius: 16rpx;
      padding: 20rpx;

      .reason-textarea {
        width: 100%;
        height: 200rpx;
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;

        &::placeholder {
          color: #999;
        }
      }
    }
  }

  // 提交区域
  .submit-section {
    padding: 20rpx;
    margin-top: 40rpx;

    .btn-submit {
      width: 100%;
      height: 88rpx;
      background: #1677ff;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: #fff;
      font-weight: 500;
    }
  }

  // 底部安全区域
  .safe-area {
    height: 40rpx;
  }
}
</style>
