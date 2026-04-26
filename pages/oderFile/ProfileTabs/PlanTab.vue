// 计划标签页组件
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  getServicePlanByAged,
  getServicePlanChangeLog,
} from "@/api/older/older.js";

// 页面加载时
onMounted(async () => {
  await fetchServicePlan(); // 获取服务计划
  await fetchPlanChangeLog(); // 获取变更日志（需要在服务计划之后）
});

// Props 接收老人ID
const props = defineProps<{
  agedId: string;
}>();

// 服务计划数据（按类型分组）
const servicePlanData = ref<any[]>([]);
const loading = ref(false);

// 获取服务计划数据
const fetchServicePlan = async () => {
  if (!props.agedId) return;
  loading.value = true;
  try {
    const res = await getServicePlanByAged(props.agedId);
    // 处理接口返回数据结构
    const data = res?.data || res || [];
    servicePlanData.value = Array.isArray(data) ? data : [];
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

// 计算所有服务项目列表（用于展示）
const allServiceProjects = computed(() => {
  const projects: any[] = [];
  servicePlanData.value.forEach((group: any) => {
    if (group.projects && Array.isArray(group.projects)) {
      group.projects.forEach((project: any, index: number) => {
        projects.push({
          ...project,
          cateName: group.cateName,
          // 使用 projectId 作为关联键
          projectId: project.projectId,
        });
      });
    }
  });
  return projects;
});

// 计算已完成进度
const completedProgress = computed(() => {
  const total = allServiceProjects.value.length;
  const completed = allServiceProjects.value.filter(
    (item) => (item.completedCount || 0) > 0
  ).length;
  return {
    completed,
    total: total || 1, // 避免除以0
  };
});
const progressPercent = computed(() => {
  return Math.round(
    (completedProgress.value.completed / completedProgress.value.total) * 100
  );
});

// 计划调整（变更日志）
const planAdjustments = ref<any[]>([]);

// 获取计划变更日志
const fetchPlanChangeLog = async () => {
  if (!props.agedId) return;
  try {
    const res = await getServicePlanChangeLog({
      size: 100,
    });
    // 处理接口返回数据结构
    const data = res?.data || res || {};
    const list = data.list || data || [];

    // 过滤当前老人的变更数据
    // 先获取当前老人的所有 projectId
    const currentProjectIds = new Set(
      allServiceProjects.value.map((p: any) => p.projectId).filter(Boolean)
    );

    // 过滤并格式化变更日志
    const filteredList = list.filter((item: any) => {
      return currentProjectIds.has(item.projectId);
    });

    planAdjustments.value = filteredList.map((item: any) => ({
      id: item.id,
      date: formatDate(item.biangengTime || item.createTime),
      title: `调整：${item.projectName || "项目"}`,
      content: generateChangeContent(item),
    }));
  } catch (error) {
    console.error("获取计划变更日志失败:", error);
  }
};

// 格式化日期
const formatDate = (timestamp: number | string) => {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// 生成变更内容描述
const generateChangeContent = (item: any) => {
  const {
    projectName,
    projectPinlvOld,
    projectPinlvNumOld,
    projectPinlvNew,
    projectPinlvNumNew,
  } = item;
  const name = projectName || "该项目";

  // 频次变更
  if (
    projectPinlvOld !== projectPinlvNew ||
    projectPinlvNumOld !== projectPinlvNumNew
  ) {
    const oldFreq = `${projectPinlvNumOld || 1}次/${getPinlvUnit(
      projectPinlvOld
    )}`;
    const newFreq = `${projectPinlvNumNew || 1}次/${getPinlvUnit(
      projectPinlvNew
    )}`;
    return `频次由”${oldFreq}“调整为“${newFreq}”。`;
  }

  return `${name}发生变更。`;
};

// 获取频次单位
const getPinlvUnit = (pinlv: string) => {
  const unitMap: Record<string, string> = {
    每天: "天",
    每周: "周",
    每月: "月",
    每年: "年",
    不定期: "不定期",
  };
  return unitMap[pinlv] || "其他";
};

// 计划执行记录（无顺延状态，统一展示完成，去掉最后一个）
const executionRecords = ref([
  {
    id: 1,
    name: "血压测量",
    time: "2026-01-26 08:10",
    executor: "护工-陈",
    status: "完成",
  },
  {
    id: 2,
    name: "晨间清洁",
    time: "2026-01-26 07:40",
    executor: "护工-陈",
    status: "完成",
  },
  {
    id: 3,
    name: "关节活动训练",
    time: "2026-01-25 16:20",
    executor: "康复师-周",
    status: "完成",
  },
]);

// 获取调整类型样式
const getAdjustmentTypeClass = (type: string) => {
  switch (type) {
    case "计划变更":
      return "type-change";
    case "计划删除":
      return "type-delete";
    default:
      return "type-change";
  }
};
</script>

<template>
  <view class="plan-tab">
    <!-- 服务计划 -->
    <view class="section">
      <view class="section-title">服务计划</view>
      <view class="plan-list" v-if="allServiceProjects.length > 0">
        <view
          class="plan-card"
          v-for="item in allServiceProjects"
          :key="item.projectId"
        >
          <view class="plan-header">
            <view class="plan-title-row">
              <text class="plan-name">{{ item.projectName }}</text>
            </view>
            <text class="plan-tag">{{ item.cateName }}</text>
          </view>
          <view class="plan-detail">
            <text class="detail-text">
              频次: {{ item.projectPinlvNum }}次/{{
                item.projectPinlv === "每天"
                  ? "天"
                  : item.projectPinlv === "每周"
                  ? "周"
                  : item.projectPinlv === "每月"
                  ? "月"
                  : item.projectPinlv === "不定期"
                  ? "不定期"
                  : "其他"
              }}
              · 时长 {{ item.projectTime }}分钟 · 注意事项
              {{ item.projectInfo || "-" }}
            </text>
          </view>
        </view>
      </view>
      <view class="empty-state" v-else-if="!loading">
        <text>暂无服务计划</text>
      </view>
    </view>

    <!-- 已完成 -->
    <view class="section">
      <view class="progress-header">
        <text class="section-title">已完成</text>
        <text class="progress-text">
          {{ completedProgress.completed }}/{{ completedProgress.total }} ({{
            progressPercent
          }}%)
        </text>
      </view>
      <view class="progress-bar">
        <view
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></view>
      </view>
    </view>

    <!-- 计划调整 -->
    <view class="section timeline-section">
      <view class="section-title">计划调整</view>
      <view class="timeline">
        <view
          class="timeline-item"
          v-for="(item, index) in planAdjustments"
          :key="item.id"
        >
          <view class="timeline-line">
            <view class="timeline-dot"></view>
            <view
              class="timeline-connector"
              v-if="index < planAdjustments.length - 1"
            ></view>
          </view>
          <view class="timeline-content">
            <text class="timeline-date">{{ item.date }}</text>
            <view class="timeline-card">
              <view class="card-header">
                <text class="card-title">{{ item.title }}</text>
                <text
                  class="card-type"
                  :class="getAdjustmentTypeClass(item.type)"
                >
                  {{ item.type }}
                </text>
              </view>
              <text class="card-content">{{ item.content }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 计划执行记录 -->
    <view class="section">
      <view class="section-title">计划执行记录</view>
      <view class="record-list">
        <view
          class="record-card"
          v-for="item in executionRecords"
          :key="item.id"
        >
          <view class="record-header">
            <text class="record-name">{{ item.name }}</text>
            <text class="record-status">{{ item.status }}</text>
          </view>
          <view class="record-info">
            <text class="info-text">
              执行时间 {{ item.time }} · 执行人员 {{ item.executor }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.plan-tab {
  padding: 20rpx 30rpx;

  .section {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    border: 1rpx solid #0f172a14;

    .section-title {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 20rpx;
    }
  }

  .plan-list {
    .plan-card {
      background-color: #fff;
      border: 2rpx solid #eaeaea;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;
      box-shadow: 2rpx 5rpx 15rpx rgba(0, 0, 0, 0.06);

      &:last-child {
        margin-bottom: 0;
      }

      .plan-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        .plan-title-row {
          display: flex;
          align-items: center;

          .plan-name {
            font-size: 30rpx;
            font-weight: 600;
            color: #333;
          }
        }

        .plan-tag {
          font-size: 24rpx;
          color: #999;
          background-color: #f5f5f5;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
        }
      }

      .plan-detail {
        .detail-text {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .section-title {
      margin-bottom: 0;
    }

    .progress-text {
      font-size: 28rpx;
      color: #666;
    }
  }

  .progress-bar {
    width: 100%;
    height: 15rpx;
    background-color: #e8e8e8;
    border-radius: 6rpx;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: #1677ff;
      border-radius: 6rpx;
      transition: width 0.3s ease;
    }
  }

  .timeline-section {
    padding-left: 20rpx;
  }

  .timeline {
    .timeline-item {
      display: flex;
      align-items: flex-start;

      .timeline-line {
        width: 32rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        flex-shrink: 0;

        .timeline-dot {
          width: 20rpx;
          height: 20rpx;
          background-color: #1677ff;
          border-radius: 50%;
          margin-top: 4rpx;
          flex-shrink: 0;
        }

        .timeline-connector {
          width: 3rpx;
          flex: 1;
          min-height: 120rpx;
          background-color: #e8e8e8;
          margin: 8rpx 0;
        }
      }

      .timeline-content {
        flex: 1;
        padding-bottom: 30rpx;
        padding-left: 20rpx;

        .timeline-date {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 12rpx;
          display: block;
        }

        .timeline-card {
          background-color: #fff;
          border: 2rpx solid #eaeaea;
          border-radius: 16rpx;
          padding: 24rpx;
          box-shadow: 2rpx 5rpx 15rpx rgba(0, 0, 0, 0.1);

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12rpx;

            .card-title {
              font-size: 30rpx;
              font-weight: 600;
              color: #333;
            }

            .card-type {
              font-size: 24rpx;
              padding: 4rpx 12rpx;
              border-radius: 8rpx;

              &.type-change {
                background-color: #f5f5f5;
                color: #666;
              }

              &.type-delete {
                background-color: #fff1f0;
                color: #ff4d4f;
              }
            }
          }

          .card-content {
            font-size: 26rpx;
            color: #666;
            line-height: 1.5;
          }
        }
      }
    }
  }

  .record-list {
    .record-card {
      background-color: #fff;
      border: 2rpx solid #eaeaea;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;
      box-shadow: 2rpx 5rpx 15rpx rgba(0, 0, 0, 0.06);

      &:last-child {
        margin-bottom: 0;
      }

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10rpx;

        .record-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
        }

        .record-status {
          font-size: 24rpx;
          color: #52c41a;
          background-color: #d0f9d9;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
        }
      }

      .record-info {
        .info-text {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}
</style>
