// 服务打卡页面
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
  createServiceSignStart,
  createServiceSignEnd,
} from "@/api/service/service.js";
import request from "@/utils/request.js";

// 页面参数
const orderId = ref("");
const agedId = ref("");
const agedName = ref("");
const nurseName = ref(""); // 当前护理员姓名

// 当前日期
const currentDate = ref("");

// 定位信息
const locationInfo = ref({
  address: "",
  longitude: 0,
  latitude: 0,
});

// 是否已获取到有效定位
const hasValidLocation = ref(false);

// 服务状态
const serviceStatus = ref<"notStarted" | "inProgress" | "ended">("notStarted");
const serviceDuration = ref(0); // 服务进行时长（分钟）
const checkInCount = ref(0); // 打卡次数
const timer = ref<any>(null);

// 页面加载
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || currentPage.$route?.query || {};

  // 兼容多种参数名
  orderId.value = options.orderId || options.id || options.order_id || "";
  agedId.value = options.agedId || options.aged_id || "";
  agedName.value = options.agedName || options.aged_name || "";
  nurseName.value = options.nurseName || options.nurse_name || "当前护理员";


  // 设置当前日期
  const now = new Date();
  currentDate.value = `${now.getFullYear()}年${
    now.getMonth() + 1
  }月${now.getDate()}日`;

  // 获取定位
  getLocation();
});

// 页面卸载
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});

// 获取定位
const getLocation = () => {
  uni.getLocation({
    type: "gcj02",
    accuracy: "high",
    success: async (res) => {
      // 验证经纬度有效性
      if (
        !res.longitude ||
        !res.latitude ||
        res.longitude === 0 ||
        res.latitude === 0 ||
        isNaN(res.longitude) ||
        isNaN(res.latitude)
      ) {
        console.error("定位返回无效坐标:", res);
        uni.showToast({
          title: "定位失败，请重试",
          icon: "none",
        });
        return;
      }

      locationInfo.value.longitude = res.longitude;
      locationInfo.value.latitude = res.latitude;
      hasValidLocation.value = true;

      // 调用逆地理编码接口
      try {
        const addressRes: any = await request({
          url: `/infra/tencent-map/reverse-geocode`,
          method: "get",
          params: {
            lat: res.latitude,
            lng: res.longitude,
          },
        });

        if (addressRes && addressRes.address) {
          locationInfo.value.address = addressRes.address;
        }
      } catch (error) {
        console.error("获取地址失败:", error);
      }
    },
    fail: (err) => {
      console.error("定位失败:", err);
      uni.showToast({
        title: "定位失败，请检查权限",
        icon: "none",
      });
    },
  });
};

// 服务中签到
const handleCheckIn = async () => {
  // 验证定位信息
  if (!hasValidLocation.value || !locationInfo.value.address) {
    uni.showToast({
      title: "定位信息不完整，请刷新位置",
      icon: "none",
    });
    return;
  }

  if (serviceStatus.value === "notStarted") {
    // 开始服务签到
    try {
      uni.showLoading({ title: "签到中..." });
      const signData = {
        orderId: orderId.value,
        signLong: locationInfo.value.longitude,
        signLat: locationInfo.value.latitude,
        signAddressName: locationInfo.value.address,
        signAddress: locationInfo.value.address,
      };
      const res = await createServiceSignStart(signData);
      uni.hideLoading();

      if (res.code === 0) {
        serviceStatus.value = "inProgress";
        checkInCount.value++;
        // 开始计时
        startTimer();
        uni.showToast({
          title: "签到成功",
          icon: "success",
        });
      } else {
        uni.showToast({
          title: res.msg || "签到失败",
          icon: "none",
        });
      }
    } catch (error) {
      uni.hideLoading();
      console.error("签到失败:", error);
      uni.showToast({
        title: error?.message || error?.msg || "签到失败，请检查网络",
        icon: "none",
      });
    }
  } else if (serviceStatus.value === "inProgress") {
    // 进行中签到
    try {
      uni.showLoading({ title: "签到中..." });
      const res = await createServiceSignStart({
        orderId: orderId.value,
        signLong: locationInfo.value.longitude,
        signLat: locationInfo.value.latitude,
        signAddressName: locationInfo.value.address,
        signAddress: locationInfo.value.address,
      });
      uni.hideLoading();

      if (res.code === 0) {
        checkInCount.value++;
        uni.showToast({
          title: "签到成功",
          icon: "success",
        });
      } else {
        uni.showToast({
          title: res.msg || "签到失败",
          icon: "none",
        });
      }
    } catch (error) {
      uni.hideLoading();
      console.error("签到失败:", error);
      uni.showToast({
        title: error?.message || error?.msg || "签到失败，请检查网络",
        icon: "none",
      });
    }
  }
};

// 服务签退
const handleCheckOut = async () => {
  // 验证定位信息
  if (!hasValidLocation.value || !locationInfo.value.address) {
    uni.showToast({
      title: "定位信息不完整，请刷新位置",
      icon: "none",
    });
    return;
  }

  try {
    uni.showLoading({ title: "签退中..." });
    const res = await createServiceSignEnd({
      orderId: orderId.value,
      signLong: locationInfo.value.longitude,
      signLat: locationInfo.value.latitude,
      signAddressName: locationInfo.value.address,
      signAddress: locationInfo.value.address,
    });
    uni.hideLoading();

    if (res.code === 0) {
      serviceStatus.value = "ended";
      if (timer.value) {
        clearInterval(timer.value);
      }
      uni.showToast({
        title: "签退成功",
        icon: "success",
      });
      // 返回上一页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showToast({
        title: res.msg || "签退失败",
        icon: "none",
      });
    }
  } catch (error) {
    uni.hideLoading();
    console.error("签退失败:", error);
    uni.showToast({
      title: error?.message || error?.msg || "签退失败，请检查网络",
      icon: "none",
    });
  }
};

// 开始计时
const startTimer = () => {
  timer.value = setInterval(() => {
    serviceDuration.value++;
  }, 60000); // 每分钟更新一次
};

// 刷新定位
const refreshLocation = () => {
  getLocation();
  uni.showToast({
    title: "定位刷新中...",
    icon: "loading",
  });
};
</script>

<template>
  <view class="check-in-page">
    <!-- 日期 -->
    <view class="date-section">
      <uni-icons type="calendar" size="20"></uni-icons>
      <text class="date-text">{{ currentDate }}</text>
      <el-button class="nav-icon" @click="refreshLocation" type="primary"
        >刷新位置</el-button
      >
    </view>

    <!-- 地址信息 -->
    <view class="address-section">
      <uni-icons type="map-pin-ellipse" size="20"></uni-icons>
      <text class="address-text">{{
        locationInfo.address || "定位中..."
      }}</text>
    </view>

    <!-- 地图区域 -->
    <view class="map-container">
      <map
        v-if="hasValidLocation"
        class="map"
        :longitude="locationInfo.longitude"
        :latitude="locationInfo.latitude"
        :scale="16"
        :markers="[
          {
            id: 1,
            longitude: locationInfo.longitude,
            latitude: locationInfo.latitude,
            title: '当前位置',
            width: 32,
            height: 32,
          },
        ]"
        :show-location="true"
      ></map>
      <view v-else class="map-loading">地图加载中...</view>
      <view class="map-logo">腾讯地图</view>
    </view>

    <!-- 当前护理老人 -->
    <view class="service-target">
      <text class="target-label">当前护理老人:</text>
      <text class="target-name">{{ agedName }}</text>
    </view>

    <!-- 服务状态 -->
    <view class="service-status">
      <text class="status-text">
        服务已经进行{{ serviceDuration }}分钟，打卡{{ checkInCount }}次
      </text>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <view
        class="btn-check-in"
        :class="{ disabled: serviceStatus === 'ended' }"
        @click="handleCheckIn"
      >
        {{ serviceStatus === "notStarted" ? "服务中签到" : "服务中签到" }}
      </view>
      <view
        class="btn-check-out"
        :class="{ disabled: serviceStatus === 'notStarted' }"
        @click="handleCheckOut"
      >
        服务签退
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.check-in-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  // 日期
  .date-section {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    background-color: #fff;

    .date-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
    }

    .date-text {
      font-size: 28rpx;
      color: #333;
    }
    .nav-icon {
      width: auto;
      font-size: 26rpx;
      padding: 5rpx 10rpx;
      border: 1rpx solid #52c41a;
      border-radius: 5rpx;
      color: #52c41a;
      margin-left: 330rpx;
    }
  }

  // 地址
  .address-section {
    display: flex;
    align-items: center;
    padding: 0 30rpx 20rpx;
    background-color: #fff;

    .address-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
      color: #ff6b6b;
    }

    .address-text {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      line-height: 1.4;
    }
  }

  // 地图
  .map-container {
    position: relative;
    width: 100%;
    height: 400rpx;
    margin-bottom: 20rpx;

    .map {
      width: 100%;
      height: 100%;
    }

    .map-logo {
      position: absolute;
      right: 20rpx;
      bottom: 20rpx;
      font-size: 20rpx;
      color: #999;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 4rpx 12rpx;
      border-radius: 4rpx;
    }

    .map-loading {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      color: #999;
      font-size: 28rpx;
    }
  }

  // 服务对象
  .service-target {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    background-color: #fff;
    margin-bottom: 2rpx;

    .target-label {
      font-size: 28rpx;
      color: #666;
    }

    .target-name {
      font-size: 28rpx;
      color: #1677ff;
      margin-left: 8rpx;
    }
  }

  // 服务状态
  .service-status {
    padding: 20rpx 30rpx;
    background-color: #fff;
    margin-bottom: 20rpx;

    .status-text {
      font-size: 28rpx;
      color: #333;
    }
  }

  // 操作按钮
  .action-buttons {
    padding: 0 30rpx;

    .btn-check-in {
      width: 100%;
      height: 90rpx;
      background-color: #52c41a;
      color: #fff;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      margin-bottom: 20rpx;

      &.disabled {
        background-color: #ccc;
      }
    }

    .btn-check-out {
      width: 100%;
      height: 90rpx;
      background-color: #ff4d4f;
      color: #fff;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;

      &.disabled {
        background-color: #ccc;
      }
    }
  }
}
</style>
