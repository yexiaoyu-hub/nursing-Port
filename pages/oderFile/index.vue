// 老人档案页面
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import OverviewTab from "@/pages/oderFile/ProfileTabs/OverviewTab.vue";
import AssessmentTab from "@/pages/oderFile/ProfileTabs/AssessmentTab.vue";
import HealthTab from "@/pages/oderFile/ProfileTabs/HealthTab.vue";
import PlanTab from "@/pages/oderFile/ProfileTabs/PlanTab.vue";
import { getAgedDetail } from "@/api/older/older.js";

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

// 老人ID
const elderlyId = ref<number | null>(null);

// 老人基础信息
const elderlyInfo = ref({
  agedId: "",
  name: "",
  gender: "",
  age: 0,
  disabilityLevel: "",
  bedNo: "",
  changhuStatus: 0,
  nursingMode: "",
  photo: "",
  // 健康页需要的额外字段
  birthDate: "",
  idCard: "",
  phone: "",
  emergencyContact: "",
});

// 加载状态
const loading = ref(false);

// 获取老人详情
const fetchElderlyDetail = async (id: number) => {
  loading.value = true;
  try {
    const res = await getAgedDetail(id);
    const data = res?.data || res;
    if (data && data.agedId) {
      // 映射接口数据到页面数据
      elderlyInfo.value = {
        agedId: data.agedId?.toString() || "",
        name: data.agedName || "",
        gender: data.sex === "1" ? "男" : data.sex === "2" ? "女" : "",
        age: data.age || 0,
        disabilityLevel: getDisabilityText(data.shinengLevelid),
        bedNo: data.juzhuAddress || "-",
        changhuStatus: data.changhuStatus || 0,
        nursingMode:
          data.huiliType === "1"
            ? "居家护理"
            : data.huiliType === "2"
            ? "机构护理"
            : data.huiliType === "3"
            ? "社区护理"
            : "",
        photo: data.photo || "",
        // 健康页字段
        birthDate: data.birthday || "",
        idCard: data.idno || "",
        phone: data.tel || "",
        emergencyContact: data.changhuDaili
          ? `${data.changhuDaili}（${data.changhuGuanxi || "亲属"}）${
              data.changhuTel || ""
            }`
          : "",
      };
    }
  } catch (error) {
    console.error("获取老人详情失败:", error);
    uni.showToast({
      title: "获取数据失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
};

// 从本地存储获取字典数据
const getDictData = () => {
  const dictData = uni.getStorageSync("dictData");
  return dictData || {};
};

// 根据失能等级获取显示文本
const getDisabilityText = (level: string | number) => {
  const dictData = getDictData();
  return dictData["changhu_sndj"]?.[String(level)] || level || "-";
};

// 处理一键拨号
const handleDial = (phone: string) => {
  uni.makePhoneCall({
    phoneNumber: phone || elderlyInfo.value.phone || "10086",
  });
};

// 处理历史记录
const handleHistory = () => {
  uni.navigateTo({
    url: "/pages/servicePlan/historicalRecord?id=" + elderlyInfo.value.agedId,
  });
};

// 处理查看今日任务
const handleTodayTask = () => {
  uni.switchTab({
    url: "/pages/index/index",
  });
};

// 页面加载
onLoad((options) => {
  if (options?.id) {
    elderlyId.value = Number(options.id);
    fetchElderlyDetail(elderlyId.value);
  }
});
</script>

<template>
  <view class="elderly-profile-page">
    <!-- 顶部老人卡片 -->
    <view class="header-card">
      <view class="avatar-section">
        <image
          v-if="elderlyInfo.photo"
          :src="elderlyInfo.photo"
          class="avatar"
          mode="aspectFill"
        />
        <view v-else class="avatar"></view>
      </view>
      <view class="info-section">
        <text class="name">{{ elderlyInfo.name || "--" }}</text>
        <text class="detail">{{ elderlyInfo.disabilityLevel }} </text>
      </view>
      <view class="nursing-mode-tag">
        <text class="tag-text">{{ elderlyInfo.nursingMode }}</text>
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
      />
      <AssessmentTab v-if="activeTab === 1" :elderlyId="elderlyId" />
      <HealthTab
        v-if="activeTab === 2"
        :elderlyId="elderlyId"
        :basicInfo="elderlyInfo"
      />
      <PlanTab v-if="activeTab === 3" :agedId="elderlyInfo.agedId" />
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
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .nursing-mode-tag {
      padding: 8rpx 20rpx;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 24rpx;
      border: 1rpx solid rgba(255, 255, 255, 0.3);

      .tag-text {
        font-size: 24rpx;
        color: #fff;
        font-weight: 500;
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
