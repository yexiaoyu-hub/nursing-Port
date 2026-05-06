// 服务执行页面
<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import ServiceStartTab from "./ExecuteTabs/serviceStart.vue";
import ServiceSecondTab from "./ExecuteTabs/serviceSecond.vue";
import ServiceEndTab from "./ExecuteTabs/serviceEnd.vue";
import ServiceEvaluationTab from "./ExecuteTabs/serviceEvaluation.vue";
import { getServiceOrderWithProjectsAll } from "@/api/service/order.js";

// 页面参数
const orderId = ref("");
const agedId = ref("");
const agedName = ref("");

// 当前步骤
const currentStep = ref(1);

// 是否已恢复状态
const isStateRestored = ref(false);

// 监听 currentStep 变化
watch(currentStep, (newVal) => {
  // currentStep 已更新
});

// 服务时长（从第二步传递过来）
const serviceDuration = ref(0);
const plannedDuration = ref(40);

// 存储键名
const STORAGE_KEY = "serviceExecuteState";

// 页面加载获取参数
onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || currentPage.$route?.query || {};
  orderId.value = options.orderId || options.id || "";
  agedId.value = options.agedId || "";
  agedName.value = options.agedName || "";

  // 从服务端获取最新状态
  await fetchOrderStatus();
});

// 页面显示时刷新状态（处理从其他页面返回的情况）
onShow(async () => {
  if (orderId.value) {
    // 如果已经在服务结束页(第3步)或评价页(第4步)，保持当前步骤
    if (currentStep.value >= 3) {
      // 只更新数据，不改变步骤
      return;
    }
    await fetchOrderStatus();
  }
});

// 页面隐藏时保存状态
onHide(() => {
  saveState();
});

// 检查是否已进入评价流程（第4步）
const hasEnteredEvaluation = () => {
  const evaluationKey = `serviceEvaluation_${orderId.value}`;
  const evaluationState = uni.getStorageSync(evaluationKey);
  return !!(evaluationState && evaluationState.entered);
};

// 检查是否已进入服务结束页流程（第3步）
const hasEnteredServiceEnd = () => {
  const serviceEndKey = `serviceEnd_${orderId.value}`;
  const serviceEndState = uni.getStorageSync(serviceEndKey);
  return !!(serviceEndState && serviceEndState.entered);
};

// 从服务端获取工单状态
const fetchOrderStatus = async () => {
  if (!orderId.value) return;
  
  try {
    const res = await getServiceOrderWithProjectsAll(orderId.value);
    const orderData = res?.data || res;
    
    if (orderData) {
      // 优先根据本地存储的标记判断步骤（更精确）
      // 标记优先级：评价流程 > 服务结束流程 > 工单状态
      
      // 1. 检查是否已进入评价流程（第4步）
      if (hasEnteredEvaluation()) {
        currentStep.value = 4;
      } 
      // 2. 检查是否已进入服务结束页流程（第3步）
      else if (hasEnteredServiceEnd()) {
        currentStep.value = 3;
      }
      // 3. 根据工单状态判断
      else {
        const orderStatus = orderData.status;
        
        if (orderStatus === 3) {
          // 工单已完成，但未进入服务结束页流程，说明是异常情况
          // 默认进入第3步
          currentStep.value = 3;
        } else if (orderStatus === 2) {
          // 工单执行中，检查是否有开始签到
          const signs = orderData.signs || [];
          const hasStartSign = signs.some((s: any) => s.signType === 1);
          
          if (hasStartSign) {
            // 有开始签到，进入第2步（服务中）
            currentStep.value = 2;
          } else {
            // 没有签到记录，从第1步开始
            currentStep.value = 1;
          }
        } else if (orderStatus === 1) {
          // 工单待执行，从第1步开始
          currentStep.value = 1;
        } else {
          // 默认从第1步开始
          currentStep.value = 1;
        }
      }
      
      // 从本地存储恢复服务时长和计划时长（如果存在）
      const state = uni.getStorageSync(STORAGE_KEY);
      if (state && state.orderId == orderId.value) {
        serviceDuration.value = state.serviceDuration || 0;
        plannedDuration.value = state.plannedDuration || 40;
      }
      
      // 保存到本地
      saveState();
      
      // 等待 DOM 更新
      await nextTick();
      isStateRestored.value = true;
    }
  } catch (error) {
    console.error("获取工单状态失败:", error);
    // 如果服务端获取失败，尝试从本地恢复
    await restoreState();
  }
};

// 保存状态到本地
const saveState = () => {
  const state = {
    orderId: orderId.value,
    currentStep: currentStep.value,
    serviceDuration: serviceDuration.value,
    plannedDuration: plannedDuration.value,
  };
  uni.setStorageSync(STORAGE_KEY, state);
};

// 从本地恢复状态
const restoreState = async () => {
  try {
    const state = uni.getStorageSync(STORAGE_KEY);
    // 使用 == 进行松散比较，避免字符串和数字类型不匹配
    if (state && state.orderId == orderId.value) {
      // 只有订单ID匹配时才恢复状态
      currentStep.value = state.currentStep || 1;
      serviceDuration.value = state.serviceDuration || 0;
      plannedDuration.value = state.plannedDuration || 40;
      // 等待 DOM 更新
      await nextTick();
    } else {
      // 订单ID不匹配，清除旧状态
      clearState();
    }
  } catch (e) {
    console.error("恢复状态失败:", e);
  } finally {
    // 标记状态已恢复
    isStateRestored.value = true;
  }
};

// 清除状态
const clearState = () => {
  uni.removeStorageSync(STORAGE_KEY);
};

// 下一步
const nextStep = (duration?: number, planned?: number) => {
  // 保存计划时长
  if (planned !== undefined && planned !== null) {
    plannedDuration.value = planned;
  }

  // 保存服务时长（从第二步传递过来）
  if (duration !== undefined && duration !== null) {
    serviceDuration.value = duration;
  }

  if (currentStep.value < 4) {
    currentStep.value++;
  }
  // 保存状态
  saveState();
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
    <view class="content" v-if="isStateRestored">
      <ServiceStartTab
        v-if="currentStep === 1"
        :order-id="orderId"
        :aged-id="agedId"
        :aged-name="agedName"
        @next-step="nextStep"
      />
      <ServiceSecondTab
        v-if="currentStep === 2"
        :order-id="orderId"
        :aged-id="agedId"
        :aged-name="agedName"
        @next-step="nextStep"
      />
      <ServiceEndTab
        v-if="currentStep === 3"
        :order-id="orderId"
        :aged-id="agedId"
        :actual-duration="serviceDuration"
        :planned-duration="plannedDuration"
        @next-step="nextStep"
      />
      <ServiceEvaluationTab v-if="currentStep === 4" :order-id="orderId" />
    </view>

    <!-- 加载提示 -->
    <view v-if="!isStateRestored" class="loading-container">
      <text class="loading-text">加载中...</text>
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

  // 加载提示
  .loading-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;

    .loading-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
