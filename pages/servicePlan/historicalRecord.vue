// 历史服务记录
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getServiceHistoryList } from "@/api/history/history.js";
import { getAgedDetail } from "@/api/older/older.js";
import DateRangePicker from "@/components/DateRangePicker.vue";

// 老人信息
const elderlyInfo = ref<ElderlyInfo>({
  name: "",
  gender: "",
  age: 0,
  avatar: "",
  disabilityLevel: "",
  bedNo: "",
  statusColor: "green",
  nursingMode: "",
});

// 日期范围筛选
const dateRange = ref({
  startDate: "",
  endDate: "",
});
const showDateFilter = ref(false);

// 是否有日期筛选
const hasDateFilter = computed(() => {
  return dateRange.value.startDate && dateRange.value.endDate;
});

// 服务记录列表
const serviceRecords = ref<ServiceRecord[]>([]);

// 从本地存储获取订单状态字典
const getOrderStatusText = (status: number) => {
  const dictData = getDictData();
  return dictData["changhu_order_status"]?.[String(status)] || "";
};

// 状态映射（根据字典 changhu_order_status）
const getStatusInfo = (workStatus: number) => {
  const statusText = getOrderStatusText(workStatus);
  const statusMap: Record<number, { text: string; class: string }> = {
    0: { text: "未派单", class: "pending" },
    1: { text: "待执行", class: "pending" },
    2: { text: "执行中", class: "in-progress" },
    3: { text: "已完成", class: "completed" },
    4: { text: "已取消", class: "cancelled" },
  };
  return statusMap[workStatus] || { text: "已作废", class: "cancelled" };
};

// 格式化服务时长（分钟转为小时分钟格式）
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
};

// 格式化日期（YYYY-MM-DD）
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 筛选后的服务记录
const filteredRecords = computed(() => {
  if (!dateRange.value.startDate && !dateRange.value.endDate) {
    return serviceRecords.value;
  }

  return serviceRecords.value.filter((record) => {
    const recordDate = new Date(record.serviceDate);
    const start = dateRange.value.startDate
      ? new Date(dateRange.value.startDate)
      : null;
    const end = dateRange.value.endDate
      ? new Date(dateRange.value.endDate)
      : null;

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

// 当前老人ID
const currentAgedId = ref("");

// 打开日期筛选
const openDateFilter = () => {
  showDateFilter.value = true;
};

// 确认日期筛选
const onDateConfirm = (beginDate: string, endDate: string) => {
  dateRange.value.startDate = beginDate;
  dateRange.value.endDate = endDate;
  if (currentAgedId.value) {
    fetchServiceRecords(currentAgedId.value);
  }
};

// 清空日期筛选
const onDateClear = () => {
  dateRange.value.startDate = "";
  dateRange.value.endDate = "";
  if (currentAgedId.value) {
    fetchServiceRecords(currentAgedId.value);
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

// 获取老人详情
const fetchElderlyDetail = async (agedId: string) => {
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
        name: data.agedName || "",
        gender: data.sex === "1" ? "男" : data.sex === "2" ? "女" : "",
        age: data.age || 0,
        avatar: data.photo || "",
        disabilityLevel: getDisabilityText(data.shinengLevelid),
        bedNo: data.juzhuAddress || "-",
        statusColor:
          data.huiliType === "2"
            ? "green"
            : data.huiliType === "1"
            ? "blue"
            : "orange",
        nursingMode: nursingMode,
      };
    }
  } catch (error) {
    console.error("获取老人详情失败:", error);
  }
};

// 获取服务历史记录列表
const fetchServiceRecords = async (agedId: string) => {
  try {
    const params: any = {
      agedId: agedId,
      pageNo: 1,
      pageSize: 100,
    };
    if (dateRange.value.startDate) {
      params.startDate = dateRange.value.startDate;
    }
    if (dateRange.value.endDate) {
      params.endDate = dateRange.value.endDate;
    }
    const res = await getServiceHistoryList(params);
    // 处理接口返回的数据结构
    const list = res?.list || res?.data?.list || res?.data?.records || [];
    serviceRecords.value = list.map((item: any) => ({
      workOrderNo: String(item.id),
      agedId: item.agedId,
      agedName: item.agedName,
      nurseName: item.staffName || "",
      serviceDate: item.orderDispatchDate
        ? new Date(item.orderDispatchDate).toISOString().split("T")[0]
        : "",
      actualDuration: item.actualDuration || 0,
      planDuration: item.planDuration || item.orderSerTimes || 0,
      orderAddress: item.orderAddress || "",
      workStatus: item.status ?? 0,
      workStatusName:
        item.status === 1 ? "已完成" : item.status === 0 ? "待执行" : "执行中",
      serviceItems: (item.projects || []).map((p: any) => ({
        itemName: p.projectName || p.name,
      })),
    }));
  } catch (error) {
    console.error("获取服务历史记录失败:", error);
    serviceRecords.value = [];
  }
};

// 页面加载
onMounted(() => {
  const pages = getCurrentPages(); //获取当前页面栈
  const currentPage = pages[pages.length - 1]; //获取当前页面
  const options = currentPage.options || currentPage.$route?.query || {};
  const agedId = options.id || options.agedId; //获取老人ID

  if (agedId) {
    currentAgedId.value = agedId;
    fetchElderlyDetail(agedId);
    fetchServiceRecords(agedId);
  }
});
</script>

<template>
  <view class="historical-record-page">
    <!-- 老人信息卡片 -->
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
              >{{ elderlyInfo.gender }} · {{ elderlyInfo.age }}岁 ·
              {{ elderlyInfo.nursingMode === "机构护理" ? "床位" : "地址" }}
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
    <view class="date-filter" @click="openDateFilter">
      <view class="filter-header">
        <view class="filter-label">记录</view>
        <view class="date-range-wrapper">
          <view class="date-range">
            <view class="date-input">
              <text
                class="date-text"
                :class="{ active: dateRange.startDate }"
                >{{ dateRange.startDate || "开始日期" }}</text
              >
            </view>
            <text class="date-separator">至</text>
            <view class="date-input">
              <text class="date-text" :class="{ active: dateRange.endDate }">{{
                dateRange.endDate || "结束日期"
              }}</text>
            </view>
          </view>
          <view
            v-if="hasDateFilter"
            class="clear-btn"
            @click.stop="onDateClear"
          >
            <text class="clear-icon">×</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 日期范围选择器组件 -->
    <DateRangePicker
      v-model:show="showDateFilter"
      :begin-date="dateRange.startDate"
      :end-date="dateRange.endDate"
      title="选择日期范围"
      @confirm="onDateConfirm"
      @clear="onDateClear"
    />

    <!-- 服务记录列表 -->
    <view class="record-list">
      <view
        class="record-item"
        v-for="record in filteredRecords"
        :key="record.id"
      >
        <view class="record-header">
          <view class="record-title">
            <text class="record-date">{{
              formatDate(record.serviceDate)
            }}</text>
            <text class="record-dot">·</text>
            <text class="record-service">{{ record.nurseName }}</text>
          </view>
          <view
            class="record-status"
            :class="getStatusInfo(record.workStatus).class"
          >
            {{ getStatusInfo(record.workStatus).text }}
          </view>
        </view>
        <view class="record-info">
          <text class="info-item">
            {{
              record.workStatus === 3
                ? "实际用时：" + formatDuration(record.actualDuration)
                : "计划用时：" + formatDuration(record.planDuration)
            }}
          </text>
          <text class="info-item">任务单：{{ record.workOrderNo }}</text>
          <text class="info-item"
            >服务地址：{{ record.orderAddress || "-" }}</text
          >
        </view>
        <view class="record-projects">
          <view
            class="project-tag"
            v-for="(item, index) in record.serviceItems"
            :key="index"
          >
            {{ item.itemName }}
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
            font-size: 26rpx;
            color: #999;
          }

          .record-service {
            font-size: 28rpx;
            color: #333;
          }
        }

        .record-status {
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          font-size: 22rpx;

          &.completed {
            background-color: #d0f9d9;
            color: #52c41a;
          }

          &.in-progress {
            background-color: #e6f7ff;
            color: #1890ff;
          }

          &.pending {
            background-color: #fff7e6;
            color: #fa8c16;
          }

          &.cancelled {
            background-color: #f5f5f5;
            color: #999;
          }
        }
      }

      .record-info {
        display: flex;
        gap: 24rpx;
        margin-bottom: 16rpx;

        .info-item {
          font-size: 24rpx;
          color: #666;
        }
      }

      .record-projects {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;

        .project-tag {
          padding: 8rpx 16rpx;
          background-color: #f5f5f5;
          border-radius: 8rpx;
          font-size: 24rpx;
          color: #666;
          border: 1rpx solid #e8e8e8;
        }
      }
    }
  }
}
</style>
