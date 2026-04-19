<script setup lang="ts">
import { ref } from "vue";
import ServiceCard from "@/components/ServiceCard.vue";

const kanbanData = ref([
  { id: 1, name: "待服务订单", count: 2 },
  { id: 2, name: "已服务订单", count: 0 },
  { id: 3, name: "累计服务时长", count: "—" },
  { id: 4, name: "待服务老人数", count: 2 },
]);

const cardfrom = ref([
  //任务单数据
  {
    id: 1,
    name: "张三",
    gender: "男",
    age: 88,
    address: "皇后大道东",
    label: "机构护理",
    disability: "中度",
    labelblue: ["翻身", "洗浴", "按摩"],
    time: "9:00 - 10:00",
  },
  {
    id: 2,
    name: "李四",
    gender: "女",
    age: 80,
    address: "皇后大道西",
    label: "机构护理",
    disability: "轻度",
    labelblue: ["喂食", "护理"],
    time: "10:00 - 11:00",
  },
]);
</script>


<template>
  <view class="mypage">
    <view class="header">
      <view class="touxiang"></view>
      <view class="headername">
        <text class="text">张三</text>
        <text class="mintext">某机构•护理人员</text>
      </view>
    </view>
    <view class="kanban">
      <view class="lantext">
        <text>今日核心数据看板</text>
      </view>
      <view class="shuju">
        <view class="sjkuang" v-for="item in kanbanData" :key="item.id">
          <text class="text1">{{ item.name }}</text>
          <text class="text2">{{ item.count }}</text>
        </view>
      </view>
    </view>
    <view class="renwu">
      <view class="lantext">
        <text>今日待服务任务</text>
      </view>
      <view
        class="timeline-wrapper"
        style="padding-bottom: calc(100rpx + env(safe-area-inset-bottom))"
      >
        <view
          v-for="(item, index) in cardfrom"
          :key="item.id"
          class="timeline-item"
        >
          <view class="timeline-left">
            <view class="timeline-track">
              <view class="timeline-dot"></view>
              <view
                class="timeline-line"
                v-if="index < cardfrom.length - 1"
              ></view>
            </view>
          </view>
          <view class="timeline-right">
            <view class="timeline-time">{{ item.time }}</view>
            <view class="timeline-content">
              <ServiceCard :labelblue="item.labelblue">
                <template #name
                  ><text>{{ item.name }}</text></template
                >
                <template #gender
                  ><text>{{ item.gender }}</text></template
                >
                <template #age
                  ><text>{{ item.age }}</text></template
                >
                <template #address
                  ><text>{{ item.address }}</text></template
                >
                <template #label>{{ item.label }}</template>
                <template #disability>{{ item.disability }}</template>
                <template #labelblue="{ item: labelItem }">{{
                  labelItem
                }}</template>
              </ServiceCard>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>



<style lang="scss" scoped>
.header {
  width: 100%;
  height: 200rpx;
  border-radius: 0 0 50rpx 50rpx;
  background: linear-gradient(120deg, #549bff, #144cd8);
  display: flex;
  align-items: center;
  padding-left: 30rpx;
  box-sizing: border-box;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.1);
  .touxiang {
    width: 120rpx;
    height: 120rpx;
    border-radius: 20rpx;
    background-color: #8ab7fc;
  }
  .headername {
    width: 250rpx;
    margin-left: 30rpx;
    display: flex;
    flex-direction: column;
    .text {
      font-size: 50rpx;
      font-weight: 700;
      color: white;
    }
    .mintext {
      font-size: 30rpx;
      color: white;
    }
  }
}
.kanban {
  width: 690rpx;
  height: 460rpx;
  margin: 30rpx;
  .lantext {
    color: #838fa3;
  }
  .shuju {
    width: 100%;
    height: 400rpx;
    padding: 10rpx 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    .sjkuang {
      width: 330rpx;
      height: 180rpx;
      border-radius: 30rpx;
      display: flex;
      flex-direction: column;
      padding: 20rpx;
      box-sizing: border-box;
      border: 2rpx solid #eaeaea;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.05);
      .text1 {
        font-size: 26rpx;
      }
      .text2 {
        font-size: 60rpx;
        font-weight: 700;
        margin-top: 30rpx;
      }
    }
  }
}
.renwu {
  width: 100%;
  padding: 0 30rpx;
  box-sizing: border-box;
  .lantext {
    color: #838fa3;
    margin-bottom: 20rpx;
  }

  .timeline-wrapper {
    .timeline-item {
      display: flex;
      margin-bottom: 30rpx;

      .timeline-left {
        width: 40rpx;
        flex-shrink: 0;

        .timeline-track {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 8rpx;
          height: 100%;

          .timeline-dot {
            width: 16rpx;
            height: 16rpx;
            background-color: #1677ff;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .timeline-line {
            width: 3rpx;
            flex: 1;
            background-color: #cccccc;
            margin-top: 8rpx;
          }
        }
      }

      .timeline-right {
        flex: 1;

        .timeline-time {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 12rpx;
          padding-left: 16rpx;
        }

        .timeline-content {
          width: 100%;
        }
      }
    }
  }
}
</style>
