<script setup lang="ts">
import { ref, computed } from "vue";
import ElderlyCard from "@/components/ElderlyCard.vue";

// 筛选选项
const filterList = ref([
  { id: 1, name: "性别", active: false, key: "gender" },
  { id: 2, name: "失能", active: false, key: "disability" },
  { id: 3, name: "护理方式", active: false, key: "careType" },
]);

// 当前打开的筛选类型
const currentFilter = ref<number | null>(null);

// 筛选选项数据
const filterOptions = ref({
  gender: [
    { label: "全部", value: "" },
    { label: "男", value: "男" },
    { label: "女", value: "女" },
  ],
  disability: [
    { label: "全部", value: "" },
    { label: "轻度", value: "轻度" },
    { label: "中度", value: "中度" },
    { label: "重度", value: "重度" },
    { label: "完全失能", value: "完全失能" },
  ],
  careType: [
    { label: "全部", value: "" },
    { label: "机构护理", value: "机构护理" },
    { label: "居家护理", value: "居家护理" },
    { label: "社区护理", value: "社区护理" },
  ],
});

// 当前选中的筛选值（已确认）
const selectedFilters = ref({
  gender: "",
  disability: "",
  careType: "",
});

// 临时筛选值（未确认）
const tempFilters = ref({
  gender: "",
  disability: "",
  careType: "",
});

// 当前筛选选项列表
const currentFilterOptions = computed(() => {
  if (!currentFilter.value) return [];
  const filter = filterList.value.find(
    (item) => item.id === currentFilter.value
  );
  if (!filter) return [];
  return (
    filterOptions.value[filter.key as keyof typeof filterOptions.value] || []
  );
});

// 当前临时筛选值
const currentTempFilter = computed(() => {
  if (!currentFilter.value) return "";
  const filter = filterList.value.find(
    (item) => item.id === currentFilter.value
  );
  if (!filter) return "";
  return tempFilters.value[filter.key as keyof typeof tempFilters.value] || "";
});

// 选择当前筛选
const selectCurrentFilter = (value: string) => {
  if (!currentFilter.value) return;
  const filter = filterList.value.find(
    (item) => item.id === currentFilter.value
  );
  if (filter) {
    tempFilters.value[filter.key as keyof typeof tempFilters.value] = value;
  }
};

// 老人列表数据
const allElderlyList = ref([
  {
    id: 1,
    name: "张三",
    gender: "男",
    age: 78,
    bedNo: "3F-301-01",
    status: "机构护理",
    statusColor: "green",
    disability: "中度",
    careLevel: "二级",
    bedStatus: "在床",
  },
  {
    id: 2,
    name: "李红",
    gender: "女",
    age: 84,
    bedNo: "2F-206-02",
    status: "居家护理",
    statusColor: "orange",
    disability: "重度",
    careLevel: "三级",
    bedStatus: "离床",
  },
  {
    id: 3,
    name: "王五",
    gender: "男",
    age: 72,
    bedNo: "3F-302-01",
    status: "社区护理",
    statusColor: "green",
    disability: "轻度",
    careLevel: "一级",
    bedStatus: "在床",
  },
]);

// 搜索关键词
const searchKeyword = ref("");

// 过滤后的列表
const filteredList = computed(() => {
  return allElderlyList.value.filter((item) => {
    // 搜索关键词过滤
    if (searchKeyword.value && !item.name.includes(searchKeyword.value)) {
      return false;
    }
    // 性别筛选
    if (
      selectedFilters.value.gender &&
      item.gender !== selectedFilters.value.gender
    ) {
      return false;
    }
    // 失能筛选
    if (
      selectedFilters.value.disability &&
      item.disability !== selectedFilters.value.disability
    ) {
      return false;
    }
    // 护理方式筛选
    if (
      selectedFilters.value.careType &&
      item.status !== selectedFilters.value.careType
    ) {
      return false;
    }
    return true;
  });
});

// 切换筛选下拉
const switchFilter = (id: number) => {
  if (currentFilter.value === id) {
    currentFilter.value = null;
  } else {
    currentFilter.value = id;
    // 打开时同步当前已确认的筛选值到临时值
    const filter = filterList.value.find((item) => item.id === id);
    if (filter) {
      tempFilters.value[filter.key as keyof typeof tempFilters.value] =
        selectedFilters.value[filter.key as keyof typeof selectedFilters.value];
    }
  }
  // 更新激活状态
  filterList.value.forEach((item) => {
    item.active = item.id === currentFilter.value;
  });
};

// 确定筛选（将临时值应用到实际筛选）
const confirmFilter = () => {
  const filter = filterList.value.find(
    (item) => item.id === currentFilter.value
  );
  if (filter) {
    selectedFilters.value[filter.key as keyof typeof selectedFilters.value] =
      tempFilters.value[filter.key as keyof typeof tempFilters.value];
  }
  currentFilter.value = null;
  filterList.value.forEach((item) => {
    item.active = false;
  });
};

// 清空筛选（清空临时值）
const clearFilter = () => {
  const filter = filterList.value.find(
    (item) => item.id === currentFilter.value
  );
  if (filter) {
    tempFilters.value[filter.key as keyof typeof tempFilters.value] = "";
  }
};

// 处理按钮点击
const handleButtonClick = (buttonText: string, elderlyName: string) => {
  uni.showToast({
    title: `${buttonText}: ${elderlyName}`,
    icon: "none",
  });
};
</script>

<template>
  <view class="managing-older-page">
    <!-- 固定头部区域 -->
    <view class="header-section">
      <!-- 筛选栏 -->
      <view class="filter-bar-wrapper">
        <view class="filter-bar">
          <view
            class="filter-item"
            v-for="item in filterList"
            :key="item.id"
            :class="{ active: item.active }"
            @click="switchFilter(item.id)"
          >
            <text>{{ item.name }}</text>
            <text class="arrow-down">▼</text>
          </view>
        </view>

        <!-- 筛选弹窗 -->
        <view class="filter-popup" v-if="currentFilter">
          <view class="filter-mask" @click="currentFilter = null"></view>
          <view class="filter-content">
            <view class="filter-options">
              <view
                class="filter-option"
                v-for="option in currentFilterOptions"
                :key="option.value"
                :class="{ active: currentTempFilter === option.value }"
                @click="selectCurrentFilter(option.value)"
              >
                {{ option.label }}
              </view>
            </view>
            <view class="filter-actions">
              <view class="btn-clear" @click="clearFilter">清空</view>
              <view class="btn-confirm" @click="confirmFilter">确定</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 搜索框 -->
      <view class="search-section">
        <view class="search-box">
          <uni-icons type="search" size="24" color="#999"></uni-icons>
          <input
            class="search-input"
            type="text"
            placeholder="请输入搜索关键字..."
            v-model="searchKeyword"
            confirm-type="search"
          />
          <uni-icons
            v-if="searchKeyword"
            type="clear"
            size="24"
            color="#999"
            @click="searchKeyword = ''"
          ></uni-icons>
        </view>
      </view>
    </view>

    <!-- 老人卡片列表 -->
    <scroll-view class="elderly-list" scroll-y>
      <ElderlyCard
        v-for="item in filteredList"
        :key="item.id"
        :item="item"
        @buttonClick="handleButtonClick"
      />

      <!-- 底部安全区域 -->
      <view style="height: calc(100rpx + env(safe-area-inset-bottom))"></view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.managing-older-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 固定头部区域
.header-section {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
}

// 筛选栏
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;

  .filter-item {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #666;

    .arrow-down {
      font-size: 20rpx;
      margin-left: 8rpx;
    }

    &.active {
      color: #1677ff;
    }
  }
}

// 筛选栏包装器
.filter-bar-wrapper {
  position: relative;
}

// 筛选弹窗
.filter-popup {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;

  .filter-mask {
    position: fixed;
    top: 180rpx;
    left: 0;
    right: 0;
    bottom: 100rpx;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }

  .filter-content {
    position: relative;
    background-color: #fff;
    z-index: 100;
    padding: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;
      margin-bottom: 30rpx;

      .filter-option {
        padding: 16rpx 32rpx;
        background-color: #f5f5f5;
        border-radius: 32rpx;
        font-size: 28rpx;
        color: #666;

        &.active {
          background-color: #e6f2ff;
          color: #1677ff;
        }
      }
    }

    .filter-actions {
      border-top: 1rpx solid #e7e6e6;
      padding-top: 30rpx;
      display: flex;
      gap: 20rpx;

      .btn-clear,
      .btn-confirm {
        flex: 1;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 40rpx;
        font-size: 28rpx;
      }

      .btn-clear {
        background-color: #f5f5f5;
        color: #666;
      }

      .btn-confirm {
        background-color: #1677ff;
        color: #fff;
      }
    }
  }
}

// 搜索和标签区域
.search-section {
  padding: 20rpx 30rpx;
  background-color: #fff;
  margin-bottom: 20rpx;

  .search-box {
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 40rpx;
    padding: 16rpx 24rpx;
    margin-bottom: 10rpx;

    .search-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
      color: #999;
    }

    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;

      &::placeholder {
        color: #999;
      }
    }
  }
}

// 老人列表
.elderly-list {
  height: calc(100vh - 380rpx);
}
</style>
