// 异常信息页面
<script setup lang="ts">
import { ref } from "vue";

// 搜索关键词
const searchKeyword = ref("");

// 异常列表数据
const exceptionList = ref([
  {
    id: 1,
    name: "李红",
    level: "危急",
    levelColor: "#ff4d4f",
    type: "健康指标异常",
    orderNo: "#5002",
    time: "昨日 14:30",
    status: "待处理",
    statusColor: "#faad14",
  },
  {
    id: 2,
    name: "张三",
    level: "一般",
    levelColor: "#999",
    type: "到场异常（无人/拒开门）",
    orderNo: "#5001",
    time: "2天前 09:15",
    status: "已处理",
    statusColor: "#52c41a",
  },
]);

// 搜索
const handleSearch = () => {
  uni.showToast({ title: "搜索: " + searchKeyword.value, icon: "none" });
};

// 查看异常详情
const viewDetail = (item: any) => {
  uni.navigateTo({
    url: "/pages/user/ExceptionalInfo/detailedinfo?id=" + item.id,
  });
};
</script>

<template>
  <view class="exception-info-page">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-input" @click="handleSearch">
        <text class="search-placeholder">关键词搜索</text>
      </view>
    </view>

    <!-- 异常列表 -->
    <view class="exception-list">
      <view
        v-for="item in exceptionList"
        :key="item.id"
        class="exception-card"
        @click="viewDetail(item)"
      >
        <view class="card-header">
          <text class="name">{{ item.name }}</text>
          <view
            class="status-tag"
            :style="{ color: item.statusColor, borderColor: item.statusColor }"
          >
            {{ item.status }}
          </view>
        </view>
        <view class="card-body">
          <view class="type-row">
            <view
              class="level-tag"
              :style="{
                color: item.levelColor,
                backgroundColor: item.levelColor + '20',
              }"
            >
              {{ item.level }}
            </view>
            <text class="type">{{ item.type }}</text>
          </view>
          <text class="info"
            >关联工单：{{ item.orderNo }} · 时间：{{ item.time }}</text
          >
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.exception-info-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  // 搜索栏
  .search-section {
    background-color: #fff;
    padding: 20rpx;

    .search-input {
      height: 72rpx;
      background-color: #f5f5f5;
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;

      .search-placeholder {
        font-size: 28rpx;
        color: #999;
      }
    }
  }

  // 异常列表
  .exception-list {
    padding: 20rpx;

    .exception-card {
      background-color: #fff;
      border: 1rpx solid #e5e5e5;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;

        .name {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
        }

        .status-tag {
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          font-size: 24rpx;
          border: 1rpx solid;
        }
      }

      .card-body {
        .type-row {
          display: flex;
          align-items: center;
          margin-bottom: 12rpx;

          .level-tag {
            padding: 4rpx 12rpx;
            border-radius: 8rpx;
            font-size: 22rpx;
            margin-right: 12rpx;
          }

          .type {
            font-size: 28rpx;
            color: #333;
          }
        }

        .info {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}
</style>
