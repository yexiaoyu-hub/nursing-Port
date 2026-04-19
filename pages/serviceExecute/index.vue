// 服务执行页面
<script setup lang="ts">
import { ref } from "vue";
import ServiceStartTab from "./ExecuteTabs/serviceStart.vue";
import ServiceSecondTab from "./ExecuteTabs/serviceSecond.vue";
import ServiceEndTab from "./ExecuteTabs/serviceEnd.vue";
import ServiceEvaluationTab from "./ExecuteTabs/serviceEvaluation.vue";

// 当前步骤
const currentStep = ref(1);

// 下一步
const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++;
  }
};

// 步骤列表
const steps = [
  { id: 1, title: "服务开始" },
  { id: 2, title: "服务中" },
  { id: 3, title: "服务结束" },
  { id: 4, title: "服务评价" },
];
</script>

<template>
  <view class="service-execute-page">
    <!-- 步骤指示器 -->
    <view class="step-indicator">
      <view
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-item"
        :class="{
          active: currentStep === step.id,
          completed: currentStep > step.id,
        }"
      >
        <view class="step-circle">{{ step.id }}</view>
        <text class="step-title">{{ step.title }}</text>
        <view v-if="index < steps.length - 1" class="step-line"></view>
      </view>
    </view>

    <!-- 内容区域 - 根据当前步骤显示不同标签页 -->
    <view class="content">
      <ServiceStartTab v-if="currentStep === 1" @next-step="nextStep" />
      <ServiceSecondTab v-if="currentStep === 2" @next-step="nextStep" />
      <ServiceEndTab v-if="currentStep === 3" @next-step="nextStep" />
      <ServiceEvaluationTab v-if="currentStep === 4" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.service-execute-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  // 步骤指示器
  .step-indicator {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 30rpx 20rpx;
    background-color: #fff;

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      flex: 1;

      .step-circle {
        width: 50rpx;
        height: 50rpx;
        border-radius: 50%;
        background-color: #e0e0e0;
        color: #999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        font-weight: 600;
        margin-bottom: 10rpx;
        position: relative;
        z-index: 1;
      }

      .step-title {
        font-size: 22rpx;
        color: #999;
      }

      .step-line {
        position: absolute;
        top: 25rpx;
        right: -50%;
        width: 100%;
        height: 2rpx;
        background-color: #e0e0e0;
        z-index: 0;
      }

      &.active {
        .step-circle {
          background-color: #1677ff;
          color: #fff;
        }
        .step-title {
          color: #1677ff;
          font-weight: 600;
        }
      }

      &.completed {
        .step-circle {
          background-color: #52c41a;
          color: #fff;
        }
        .step-title {
          color: #52c41a;
        }
        .step-line {
          background-color: #52c41a;
        }
      }
    }
  }

  // 内容区域
  .content {
    // 内容样式在子组件中定义
  }
}
</style>
