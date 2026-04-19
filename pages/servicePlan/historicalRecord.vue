<script setup lang="ts">
import { ref, computed } from "vue";

// 老人信息
const elderlyInfo = ref({
  name: "张三",
  gender: "男",
  age: 78,
  avatar: "",
  disabilityLevel: "中度",
  bedNo: "3F-301-01",
  status: "机构护理",
  statusColor: "green",
});

// 日期范围筛选
const startDate = ref("");
const endDate = ref("");

// 筛选后的服务记录
const filteredRecords = computed(() => {
  if (!startDate.value && !endDate.value) {
    return serviceRecords.value;
  }

  return serviceRecords.value.filter((record) => {
    const recordDate = new Date(record.date);
    const start = startDate.value ? new Date(startDate.value) : null;
    const end = endDate.value ? new Date(endDate.value) : null;

    if (start && end) {
      return recordDate >= start && recordDate <= end;
    } else if (start) {
      return recordDate >= start;
    } else if (end) {
      return recordDate <= end;
    }
    return true;
  });
});

const onStartDateChange = (e: any) => {
  startDate.value = e.detail.value;
};

const onEndDateChange = (e: any) => {
  endDate.value = e.detail.value;
};

const clearDateFilter = () => {
  startDate.value = "";
  endDate.value = "";
};

// 服务记录列表
const serviceRecords = ref([
  {
    id: 1,
    date: "2026-01-23",
    serviceName: "翻身护理",
    duration: "38分钟",
    orderNo: "4988",
    status: "已完成",
    statusClass: "completed",
    nurseName: "李四",
    projects: ["项目1", "项目2", "项目3"],
  },
  {
    id: 2,
    date: "2026-01-22",
    serviceName: "喂食照料",
    duration: "30分钟",
    orderNo: "4971",
    status: "执行中",
    statusClass: "in-progress",
    nurseName: "王五",
    projects: ["喂食", "口腔护理"],
  },
  {
    id: 3,
    date: "2026-01-21",
    serviceName: "洗浴护理",
    duration: "45分钟",
    orderNo: "4965",
    status: "待执行",
    statusClass: "pending",
    nurseName: "李四",
    projects: ["全身洗浴", "更衣"],
  },
]);
</script>

<template>
  <view class="historical-record-page">
    <!-- 老人信息卡片 -->
    <view class="elderly-card">
      <!-- 状态标签 -->
      <view class="status-tag top-right" :class="elderlyInfo.statusColor">
        {{ elderlyInfo.status }}
      </view>

      <!-- 卡片头部：头像、信息 -->
      <view class="card-header">
        <view class="avatar"></view>
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
              >失能：{{ elderlyInfo.disabilityLevel }}</view
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 日期范围筛选 -->
    <view class="date-filter">
      <view class="filter-header">
        <view class="filter-label">记录</view>
        <view class="date-range-wrapper">
          <view class="date-range">
            <picker
              mode="date"
              :value="startDate"
              :end="endDate || ''"
              @change="onStartDateChange"
              class="date-picker"
            >
              <view class="date-input">
                <text class="date-text" :class="{ active: startDate }">{{
                  startDate || "开始日期"
                }}</text>
              </view>
            </picker>
            <text class="date-separator">至</text>
            <picker
              mode="date"
              :value="endDate"
              :start="startDate || ''"
              @change="onEndDateChange"
              class="date-picker"
            >
              <view class="date-input">
                <text class="date-text" :class="{ active: endDate }">{{
                  endDate || "结束日期"
                }}</text>
              </view>
            </picker>
          </view>
          <view
            v-if="startDate || endDate"
            class="clear-btn"
            @click="clearDateFilter"
          >
            <text class="clear-icon">×</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 服务记录列表 -->
    <view class="record-list">
      <view
        class="record-item"
        v-for="record in filteredRecords"
        :key="record.id"
      >
        <view class="record-header">
          <view class="record-title">
            <text class="record-date">{{ record.date }}</text>
            <text class="record-dot">·</text>
            <text class="record-service">{{ record.serviceName }}</text>
          </view>
          <view class="record-status" :class="record.statusClass">{{
            record.status
          }}</view>
        </view>
        <view class="record-info">
          <text class="info-item">用时：{{ record.duration }}</text>
          <text class="info-item">任务单：{{ record.orderNo }}</text>
        </view>
        <view class="record-projects">
          <view
            class="project-tag"
            v-for="(project, index) in record.projects"
            :key="index"
          >
            {{ project }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.historical-record-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;

  // 老人信息卡片
  .elderly-card {
    background-color: #fff;
    margin-bottom: 20rpx;
    border-radius: 20rpx;
    padding: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
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

  // 日期筛选
  .date-filter {
    border-radius: 16rpx;
    padding: 10rpx 24rpx;

    .filter-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .filter-label {
      font-size: 28rpx;
      color: #64748b;
      font-weight: 500;
    }

    .date-range-wrapper {
      display: flex;
      align-items: center;
      gap: 12rpx;
    }

    .date-range {
      display: flex;
      align-items: center;
      border: 2rpx solid #e0e0e0;
      border-radius: 20rpx;
      padding: 5rpx 16rpx;
      gap: 8rpx;

      .date-picker {
        flex: 1;
        min-width: 140rpx;
      }

      .date-input {
        padding: 10rpx 8rpx;
        border-radius: 8rpx;
        text-align: center;

        .date-text {
          font-size: 24rpx;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;

          &.active {
            color: #1890ff;
          }
        }
      }

      .date-separator {
        font-size: 24rpx;
        color: #999;
        flex-shrink: 0;
      }
    }

    .clear-btn {
      width: 40rpx;
      height: 40rpx;
      background-color: #dfdfdf;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .clear-icon {
        font-size: 28rpx;
        color: #999;
        line-height: 1;
      }
    }
  }

  // 记录列表
  .record-list {
    .record-item {
      background-color: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 20rpx;

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        .record-title {
          display: flex;
          align-items: center;
          gap: 8rpx;

          .record-date {
            font-size: 30rpx;
            color: #333;
            font-weight: 600;
          }

          .record-dot {
            font-size: 30rpx;
            color: #999;
          }

          .record-service {
            font-size: 30rpx;
            color: #333;
            font-weight: 600;
          }
        }

        .record-status {
          padding: 6rpx 16rpx;
          border-radius: 20rpx;
          font-size: 22rpx;
          font-weight: 500;

          &.pending {
            background-color: #fff7e6;
            color: #fa8c16;
            border: 2rpx solid #ffd591;
          }

          &.in-progress {
            background-color: #e6f7ff;
            color: #1890ff;
            border: 2rpx solid #91d5ff;
          }

          &.completed {
            background-color: #f6ffed;
            color: #52c41a;
            border: 2rpx solid #b7eb8f;
          }
        }
      }

      .record-info {
        display: flex;
        gap: 24rpx;
        margin-bottom: 16rpx;

        .info-item {
          font-size: 24rpx;
          color: #999;
        }
      }

      .record-projects {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;

        .project-tag {
          padding: 8rpx 20rpx;
          background-color: #fff;
          border: 2rpx solid #e0e0e0;
          border-radius: 8rpx;
          font-size: 24rpx;
          color: #333;
        }
      }
    }
  }
}
</style>
