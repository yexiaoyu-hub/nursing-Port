// 服务定位选择器组件
<template>
  <view class="location-picker">
    <!-- 地图区域 -->
    <view class="location-map-container">
      <map
        v-if="locationInfo.latitude && locationInfo.longitude"
        class="location-map"
        :latitude="locationInfo.latitude"
        :longitude="locationInfo.longitude"
        :markers="mapMarkers"
        :scale="15"
        show-location
      />
      <view v-else class="location-map-placeholder">
        <text class="placeholder-text">获取位置</text>
      </view>
      <!-- 回到定位点按钮 -->
      <view
        v-if="locationInfo.latitude && locationInfo.longitude"
        class="btn-locate"
        @click="handleLocateToPosition"
      >
        <uni-icons type="location" size="24" color="#1677ff"></uni-icons>
      </view>
    </view>

    <!-- 位置信息行 -->
    <view class="location-info-row">
      <view class="location-address">
        <text v-if="!locationInfo.address" class="location-placeholder">
          点击按钮获取定位
        </text>
        <text v-else class="location-text">
          当前位置：{{ locationInfo.address }}
        </text>
      </view>
      <view
        class="btn-refresh-small"
        :class="{ loading: isRefreshing }"
        @click="refreshLocation"
      >
        <text v-if="!isRefreshing">重新获取位置</text>
        <view v-else class="loading-spinner">
          <view class="spinner"></view>
          <text class="loading-text">获取中...</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import request from "@/utils/request.js";

const locationInfo = ref({
  address: "",
  longitude: 0,
  latitude: 0,
});

const isRefreshing = ref(false);

// 地图标记点
const mapMarkers = computed(() => {
  if (!locationInfo.value.latitude || !locationInfo.value.longitude) {
    return [];
  }
  return [
    {
      id: 1,
      latitude: locationInfo.value.latitude,
      longitude: locationInfo.value.longitude,
      title: "当前位置",
    },
  ];
});

// 获取定位
const getLocation = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: "wgs84",
      success: async (res) => {
        if (
          !res.longitude ||
          !res.latitude ||
          res.longitude === 0 ||
          res.latitude === 0 ||
          isNaN(res.longitude) ||
          isNaN(res.latitude)
        ) {
          reject(new Error("定位失败，请重试"));
          return;
        }

        locationInfo.value.longitude = res.longitude;
        locationInfo.value.latitude = res.latitude;

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
          resolve(true);
        } catch (error) {
          resolve(true);
        }
      },
      fail: (err) => {
        reject(new Error("定位失败，请检查权限"));
      },
    });
  });
};

// 刷新位置
const refreshLocation = async (): Promise<boolean> => {
  if (isRefreshing.value) return false;

  isRefreshing.value = true;
  try {
    await getLocation();
    uni.showToast({
      title: "位置已更新",
      icon: "success",
    });
    return true;
  } catch (error: any) {
    uni.showToast({
      title: error.message || "刷新位置失败",
      icon: "none",
    });
    return false;
  } finally {
    isRefreshing.value = false;
  }
};

// 回到定位点
const handleLocateToPosition = () => {
  if (!locationInfo.value.latitude || !locationInfo.value.longitude) {
    uni.showToast({
      title: "请先获取定位",
      icon: "none",
    });
    return;
  }
  const temp = { ...locationInfo.value };
  locationInfo.value = { address: "", longitude: 0, latitude: 0 };
  setTimeout(() => {
    locationInfo.value = temp;
  }, 50);
};

// 暴露给父组件
defineExpose({
  refreshLocation,
  getLocation,
  locationInfo,
});
</script>

<style scoped lang="scss">
.location-picker {
  .location-map-container {
    position: relative;
    width: 100%;
    height: 300rpx;
    border-radius: 12rpx;
    overflow: hidden;
    margin-bottom: 20rpx;

    .location-map {
      width: 100%;
      height: 100%;
    }

    .location-map-placeholder {
      width: 100%;
      height: 100%;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;

      .placeholder-text {
        color: #999;
        font-size: 28rpx;
      }
    }

    .btn-locate {
      position: absolute;
      right: 20rpx;
      bottom: 20rpx;
      width: 80rpx;
      height: 80rpx;
      background-color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
      z-index: 10;

      &:active {
        opacity: 0.8;
      }
    }
  }

  .location-info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;

    .location-address {
      flex: 1;
      min-width: 0;

      .location-placeholder {
        color: #999;
        font-size: 26rpx;
      }

      .location-text {
        color: #333;
        font-size: 26rpx;
        word-break: break-all;
      }
    }

    .btn-refresh-small {
      padding: 12rpx 24rpx;
      background-color: #fff;
      color: #1677ff;
      border: 2rpx solid #1677ff;
      border-radius: 8rpx;
      font-size: 24rpx;
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;

      &.loading {
        opacity: 0.7;
        pointer-events: none;
      }

      .loading-spinner {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .spinner {
          width: 24rpx;
          height: 24rpx;
          border: 2rpx solid #1677ff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          font-size: 24rpx;
        }
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
