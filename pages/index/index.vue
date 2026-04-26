<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import ServiceCard from "@/components/ServiceCard.vue";
import { pageGuard } from "@/utils/routerGuard.js";
import { getServiceOrderService } from "@/api/index.js";
import { getDictDataSimpleList } from "@/api/dict/dict.js";
import { getUserProfileService } from "@/api/user.js";

// 字典数据缓存
const dictDataMap = ref({});

// 页面显示时进行
onShow(async () => {
  pageGuard(); // 登录路由检查
  await getUserInfo(); // 获取用户信息
  await fetchDictData(); // 获取字典数据
  await fetchServiceOrderData(); // 获取服务工单数据
});

// 获取字典数据
const fetchDictData = async () => {
  // 先尝试从本地缓存读取
  const cachedDict = uni.getStorageSync("dictData");
  if (cachedDict) {
    dictDataMap.value = cachedDict;
    return;
  }
  // 本地没有缓存，从接口获取
  try {
    const res = await getDictDataSimpleList();
    if (Array.isArray(res) && res.length > 0) {
      // 将字典数据转换为 Map 格式
      // 格式: { dictType: { value: label } }
      const dictMap = {};
      res.forEach((item) => {
        if (!dictMap[item.dictType]) {
          dictMap[item.dictType] = {};
        }
        dictMap[item.dictType][item.value] = item.label;
      });
      dictDataMap.value = dictMap;
      // 缓存到本地存储
      uni.setStorageSync("dictData", dictMap);
    }
  } catch (error) {
    console.error("获取字典数据失败:", error);
  }
};

// 看板数据
const kanbanData = ref([]);

// 用户信息
const userInfo = ref({
  nickname: "",
  avatar: "",
  deptName: "",
  roleName: "",
});

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await getUserProfileService();
    if (res) {
      userInfo.value = {
        nickname: res.nickname || "",
        avatar: res.avatar || "",
        deptName: res.dept?.name || "",
        roleName: res.roles?.[0]?.name || "",
      };
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

// 订单列表数据
const cardfrom = ref([]);

// 获取服务工单数据
const fetchServiceOrderData = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const data = await getServiceOrderService({ serviceDate: today });
    if (data) {
      // 更新看板数据
      kanbanData.value = [
        {
          id: 1,
          name: "今日待服务订单",
          count: data.pendingTodayServiceOrderCount || 0,
        },
        {
          id: 2,
          name: "今日已服务订单",
          count: data.completedTodayServiceOrderCount || 0,
        },
        { id: 3, name: "今日累计时长", count: data.totalTime || 0 },
        { id: 4, name: "今日服务老人", count: data.totalAgedCount || 0 },
      ];

      // 更新订单列表
      if (
        data.orderList &&
        Array.isArray(data.orderList) &&
        data.orderList.length > 0
      ) {
        cardfrom.value = data.orderList.map((order) => ({
          id: order.id,
          name: order.fullname,
          photo: order.photo,
          gender: "—",
          age: "—",
          address: order.orderAddress || "——",
          label: getServiceTypeText(order.orderHuiliType),
          disability: getDisabilityLevelText(order.shinengLevelid),
          labelblue: order.projectList
            ? order.projectList.map((p) => p.projectName)
            : [],
          time: order.orderDispatchDate
            ? new Date(order.orderDispatchDate)
                .toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .replace(/\//g, "-")
            : "",
          orderSerTimes: order.orderSerTimes,
          serTime: order.serTime || 0,
        }));
      } else {
        cardfrom.value = [];
      }
    }
  } catch (error) {
    console.error("获取服务工单失败:", error);
    uni.showToast({
      title: "获取数据失败",
      icon: "none",
    });
  }
};

// 获取服务方式
const getServiceTypeText = (type) => {
  return dictDataMap.value["changhu_nursing_type"]?.[type] || "";
};

// 获取失能等级
const getDisabilityLevelText = (level) => {
  return dictDataMap.value["changhu_sndj"]?.[level] || "";
};
</script>


<template>
  <view class="mypage">
    <view class="header">
      <view class="touxiang">
        <image
          v-if="userInfo.avatar"
          :src="userInfo.avatar"
          mode="aspectFill"
          class="touxiang-img"
        />
      </view>
      <view class="headername">
        <text class="text">{{ userInfo.nickname || "某护理人员" }}</text>
        <text class="mintext"
          >{{ userInfo.deptName
          }}{{ userInfo.roleName ? " · " + userInfo.roleName : "" }}</text
        >
      </view>
    </view>
    <view class="kanban">
      <view class="lantext">
        <text>今日核心数据看板</text>
      </view>
      <view class="shuju">
        <view class="sjkuang" v-for="item in kanbanData" :key="item.id">
          <text class="text1">{{ item.name }}</text>
          <text class="text2"
            >{{ item.count
            }}<text
              v-if="item.id === 3"
              style="font-size: 30rpx; margin-left: 20rpx; color: #778599"
              >min</text
            ></text
          >
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
        <!-- 空状态 -->
        <view v-if="cardfrom.length === 0" class="empty-state">
          <text class="empty-text">今日暂无待服务任务</text>
        </view>
        <view
          v-for="(item, index) in cardfrom"
          :key="item.id"
          class="timeline-item"
          v-else
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
              <ServiceCard
                :labelblue="item.labelblue"
                :photo="item.photo"
                :serTime="item.serTime"
                :orderSerTimes="item.orderSerTimes"
                :label="item.label"
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
    overflow: hidden;
    .touxiang-img {
      width: 100%;
      height: 100%;
    }
  }
  .headername {
    width: 500rpx;
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
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 100rpx 0;

      .empty-text {
        font-size: 28rpx;
        color: #999;
      }
    }

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
          font-size: 26rpx;
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
