// 服务计划执行页面
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getAgedDetail, getServicePlanByAged } from "@/api/older/older.js";

// 页面加载状态
const loading = ref(false);

// 老人信息
const elderlyInfo = ref({
  id: "",
  name: "",
  gender: "",
  age: 0,
  bedNo: "",
  statusColor: "green",
  nursingMode: "",
  disability: "",
  avatar: "",
});

// 服务计划数据
const servicePlans = ref([]);

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

// 获取老人信息
const fetchElderlyInfo = async (agedId: string) => {
  try {
    const res = await getAgedDetail(agedId);
    // 处理接口返回的数据结构
    const data = res?.data || res;
    if (data) {
      const nursingMode =
        data.huiliType === "1"
          ? "居家护理"
          : data.huiliType === "2"
          ? "机构护理"
          : data.huiliType === "3"
          ? "社区护理"
          : "";
      elderlyInfo.value = {
        id: data.agedId || "",
        name: data.agedName || "",
        gender: data.sex === "1" ? "男" : data.sex === "2" ? "女" : "",
        age: data.age || 0,
        bedNo: data.juzhuAddress || "-",
        nursingMode: nursingMode,
        statusColor:
          data.huiliType === "2"
            ? "green"
            : data.huiliType === "1"
            ? "blue"
            : "orange",
        disability: getDisabilityText(data.shinengLevelid),
        avatar: data.photo || "",
      };
    }
  } catch (error) {
    console.error("获取老人信息失败:", error);
    uni.showToast({
      title: "获取老人信息失败",
      icon: "none",
    });
  }
};

// 获取服务计划
const fetchServicePlan = async (agedId: string) => {
  try {
    loading.value = true;
    const res = await getServicePlanByAged(agedId);
    // 处理接口返回的数据结构
    const data = res?.data || res;
    if (data && Array.isArray(data)) {
      servicePlans.value = data.map((group: any) => ({
        category: group.cateName,
        items: (group.projects || []).map((item: any) => ({
          id: item.projectId,
          name: item.projectName || "",
          completed: item.completedCount || 0,
          total: item.projectPinlvNum || 1,
          frequency: item.projectPinlvLabel || item.projectPinlv || "",
          duration: item.projectTime ? `${item.projectTime}分钟` : "20分钟",
          checked: true,
        })),
      }));
    }
  } catch (error) {
    console.error("获取服务计划失败:", error);
    uni.showToast({
      title: "获取服务计划失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
};

// 切换项目选中状态
const toggleItem = (categoryIndex: number, itemIndex: number) => {
  const item = servicePlans.value[categoryIndex].items[itemIndex];
  item.checked = !item.checked;
};

// 开始服务
const startService = () => {
  // 直接跳转到服务执行页面
  uni.navigateTo({
    url: `/pages/serviceExecute/index?agedId=${elderlyInfo.value.id}&agedName=${elderlyInfo.value.name}`,
  });
};

// 查看历史记录
const viewHistory = () => {
  uni.navigateTo({
    url: "/pages/servicePlan/historicalRecord?agedId=" + elderlyInfo.value.id,
  });
};

// 页面加载
onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || currentPage.$route?.query || {};
  const agedId = options.agedId || options.id;

  if (agedId) {
    fetchElderlyInfo(agedId);
    fetchServicePlan(agedId);
  } else {
    uni.showToast({
      title: "缺少老人ID参数",
      icon: "none",
    });
  }
});
</script>

<template>
  <view class="plan-execute-page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <template v-else>
      <!-- 老人卡片 -->
      <view class="elderly-card">
        <!-- 状态标签 -->
        <view class="status-tag top-right" :class="elderlyInfo.statusColor">
          {{ elderlyInfo.nursingMode }}
        </view>

        <!-- 卡片头部：头像、信息 -->
        <view class="card-header">
          <image
            class="avatar"
            :src="elderlyInfo.avatar"
            mode="aspectFill"
          ></image>
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

        <!-- 空状态 -->
        <view v-if="servicePlans.length === 0" class="empty-state">
          <text class="empty-text">暂无服务计划</text>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-actions">
        <view class="btn-primary" @click="startService">开始服务</view>
        <view class="btn-default" @click="viewHistory"
          >查看该老人历史服务记录</view
        >
      </view>
    </template>
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

      &.blue {
        background-color: #e6f7ff;
        color: #1890ff;
        border: 1rpx solid #1890ff;
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

  // 加载状态
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;

    .loading-spinner {
      width: 60rpx;
      height: 60rpx;
      border: 4rpx solid #f3f3f3;
      border-top: 4rpx solid #1677ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      margin-top: 20rpx;
      font-size: 28rpx;
      color: #999;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  // 空状态
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
