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
      <view style="padding-bottom: calc(100rpx + env(safe-area-inset-bottom))">
        <ServiceCard
          v-for="item in cardfrom"
          :key="item.id"
          :labelblue="item.labelblue"
        >
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
          <template #labelblue="{ item }">{{ item }}</template>
        </ServiceCard>
      </view>
    </view>
  </view>
</template>



<style lang="scss" scoped>
.header {
  width: 100%;
  height: 240rpx;
  border-radius: 0 0 50rpx 50rpx;
  background: linear-gradient(120deg, #549bff, #144cd8);
  display: flex;
  align-items: center;
  padding-left: 30rpx;
  box-sizing: border-box;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.1);
  .touxiang {
    width: 160rpx;
    height: 160rpx;
    border-radius: 40rpx;
    background-color: #8ab7fc;
  }
  .headername {
    width: 250rpx;
    margin-left: 30rpx;
    display: flex;
    flex-direction: column;
    .text {
      font-size: 70rpx;
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
  height: 650rpx;
  padding: 0 30rpx;
  box-sizing: border-box;
  .lantext {
    color: #838fa3;
    margin-bottom: 20rpx;
  }
}
</style>
