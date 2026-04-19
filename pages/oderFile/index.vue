// 老人档案页面
<script setup lang="ts">
import { ref } from "vue";
import OverviewTab from "@/pages/oderFile/ProfileTabs/OverviewTab.vue";
import AssessmentTab from "@/pages/oderFile/ProfileTabs/AssessmentTab.vue";
import HealthTab from "@/pages/oderFile/ProfileTabs/HealthTab.vue";
import PlanTab from "@/pages/oderFile/ProfileTabs/PlanTab.vue";

// 当前激活的标签页
const activeTab = ref(0);

// 标签页列表
const tabs = [
  { id: 0, name: "概览" },
  { id: 1, name: "评估" },
  { id: 2, name: "健康" },
  { id: 3, name: "计划" },
];

// 切换标签页
const switchTab = (index: number) => {
  activeTab.value = index;
};

// 老人基础信息
const elderlyInfo = ref({
  id: "GXZY-3F-301-01-0001",
  name: "张三",
  gender: "男",
  age: 77,
  disabilityLevel: "中度",
  bedNo: "3F-301-01",
  bedStatus: "在床",
  healthStatus: "稳定",
});

// 处理一键拨号
const handleDial = (phone: string) => {
  uni.makePhoneCall({
    phoneNumber: phone || "10086",
  });
};

// 处理历史记录
const handleHistory = () => {
  uni.navigateTo({
    url: "/pages/servicePlan/historicalRecord?id=" + elderlyInfo.value.id,
  });
};

// 处理查看今日任务
const handleTodayTask = () => {
  uni.switchTab({
    url: "/pages/task/taskDetails?id=" + elderlyInfo.value.id,
  });
};

// 处理快捷签到
const handleQuickSign = () => {
  uni.showToast({
    title: "签到成功",
    icon: "success",
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};
</script>

<template>
  <view class="elderly-profile-page">
    <!-- 顶部老人卡片 -->
    <view class="header-card">
      <view class="avatar-section">
        <view class="avatar"></view>
      </view>
      <view class="info-section">
        <text class="name">{{ elderlyInfo.name }}</text>
        <text class="detail">
          床位 {{ elderlyInfo.bedNo }} · 失能
          {{ elderlyInfo.disabilityLevel }}
        </text>
      </view>
    </view>

    <!-- 标签页导航 -->
    <view class="tab-nav">
      <view
        class="tab-item"
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="switchTab(tab.id)"
      >
        <text class="tab-text">{{ tab.name }}</text>
      </view>
    </view>

    <!-- 标签页内容 -->
    <scroll-view
      class="tab-content"
      scroll-y
      :style="{ paddingBottom: 'calc(40rpx + env(safe-area-inset-bottom))' }"
    >
      <OverviewTab
        v-if="activeTab === 0"
        :info="elderlyInfo"
        @dial="handleDial"
        @history="handleHistory"
        @todayTask="handleTodayTask"
        @quickSign="handleQuickSign"
      />
      <AssessmentTab v-if="activeTab === 1" />
      <HealthTab v-if="activeTab === 2" />
      <PlanTab v-if="activeTab === 3" />
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.elderly-profile-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;

  .header-card {
    width: 100%;
    height: 150rpx;
    background: linear-gradient(120deg, #549bff, #144cd8);
    display: flex;
    align-items: center;
    padding: 10rpx 30rpx 10rpx 30rpx;
    box-sizing: border-box;
    border-radius: 0 0 30rpx 30rpx;

    .avatar-section {
      .avatar {
        width: 100rpx;
        height: 100rpx;
        background: linear-gradient(135deg, #8ab7fc, #549bff);
        border-radius: 24rpx;
        margin-right: 24rpx;
      }
    }

    .info-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .name {
        font-size: 40rpx;
        font-weight: 700;
        color: #fff;
        margin-bottom: 12rpx;
      }

      .detail {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .tab-nav {
    display: flex;
    background-color: #fff;
    padding: 30rpx 30rpx;
    gap: 16rpx;

    .tab-item {
      flex: 1;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20rpx;
      background-color: #ffffff;
      border: 1rpx solid #cfdbeb;
      transition: all 0.3s ease;

      .tab-text {
        font-size: 28rpx;
        color: #666;
        font-weight: 500;
      }

      &.active {
        background: #1677ff;

        .tab-text {
          color: #fff;
        }
      }
    }
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
