//老人页面
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
import ElderlyCard from "@/components/ElderlyCard.vue";
import { getAgedPage } from "@/api/older/older.js";

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
const allElderlyList = ref<any[]>([]);
const loading = ref(false);
const pageNo = ref(1);
const pageSize = ref(10);
const total = ref(0);
const hasMore = computed(() => allElderlyList.value.length < total.value);

// 搜索关键词
const searchKeyword = ref("");

// 过滤后的列表（前端筛选）
const filteredList = computed(() => {
  let result = allElderlyList.value;

  // 性别筛选
  if (selectedFilters.value.gender) {
    result = result.filter(
      (item) => item.gender === selectedFilters.value.gender
    );
  }
  // 失能筛选
  if (selectedFilters.value.disability) {
    result = result.filter(
      (item) => item.disability === selectedFilters.value.disability
    );
  }
  // 护理方式筛选
  if (selectedFilters.value.careType) {
    result = result.filter(
      (item) => item.status === selectedFilters.value.careType
    );
  }

  return result;
});

// 获取老人列表
const fetchElderlyList = async (isLoadMore = false) => {
  if (loading.value) return;
  loading.value = true;

  if (!isLoadMore) {
    pageNo.value = 1;
    allElderlyList.value = [];
  }

  try {
    const params: any = {
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    };

    // 搜索关键词
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }

    const res = await getAgedPage(params);

    // 处理接口返回的数据结构
    const records = res?.list || [];

    // 处理数据
    const processedRecords = records.map((item: any) => {
      const status =
        item.huiliType === "1"
          ? "居家护理"
          : item.huiliType === "2"
          ? "机构护理"
          : item.huiliType === "3"
          ? "社区护理"
          : "";
      return {
        id: item.agedId,
        name: item.agedName,
        gender: item.sex === "1" ? "男" : "女",
        age: item.age,
        bedNo: item.juzhuAddress || "-",
        status: status,
        statusColor: getStatusColor(status),
        disability: getDisabilityText(item.shinengLevelid),
        photo: item.photo,
      };
    });

    if (isLoadMore) {
      allElderlyList.value.push(...processedRecords);
    } else {
      allElderlyList.value = processedRecords;
    }
    total.value = res?.total || 0;
  } catch (error) {
    console.error("获取老人列表失败:", error);
    uni.showToast({
      title: "获取数据失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
    uni.stopPullDownRefresh();
  }
};

// 根据护理类型获取颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case "机构护理":
      return "green";
    case "居家护理":
      return "blue";
    case "社区护理":
      return "orange";
    default:
      return "green";
  }
};

// 从本地存储获取字典数据
const getDictData = () => {
  const dictData = uni.getStorageSync("dictData");
  return dictData?.data || dictData || {};
};
// 根据失能等级获取显示文本
const getDisabilityText = (level: string | number) => {
  if (!level && level !== 0) return "-";
  const dictData = getDictData();
  const dict = dictData["changhu_sndj"];
  // 尝试字符串和数字两种key
  const text = dict?.[String(level)] || dict?.[Number(level)];
  return text || String(level);
};

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    pageNo.value++;
    fetchElderlyList(true);
  }
};

// 切换筛选
const switchFilter = (id: number) => {
  filterList.value.forEach((item) => {
    item.active = item.id === id && !item.active;
  });
  currentFilter.value =
    currentFilter.value === id ? null : (id as number | null);

  // 打开筛选时，初始化临时值为当前选中的值
  if (currentFilter.value) {
    const filter = filterList.value.find((item) => item.id === id);
    if (filter) {
      tempFilters.value[filter.key as keyof typeof tempFilters.value] =
        selectedFilters.value[filter.key as keyof typeof selectedFilters.value];
    }
  }
};

// 确认筛选
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
  // 刷新列表
  fetchElderlyList();
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
const handleButtonClick = (buttonText: string, agedId: number) => {
  if (buttonText === "服务计划") {
    uni.navigateTo({
      url: "/pages/servicePlan/servicePlan?agedId=" + agedId,
    });
  } else {
    uni.showToast({
      title: `${buttonText}`,
      icon: "none",
    });
  }
};

// 处理卡片点击 - 跳转到老人档案页
const handleCardClick = (elderlyId: number) => {
  uni.navigateTo({
    url: "/pages/oderFile/index?id=" + elderlyId,
  });
};

// 监听搜索关键词变化，防抖搜索
let searchTimer: any = null;
watch(searchKeyword, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchElderlyList();
  }, 500);
});

// 页面加载时获取数据
onMounted(() => {
  fetchElderlyList();
});

// 页面生命周期 - 下拉刷新
onPullDownRefresh(() => {
  fetchElderlyList();
});

// 页面生命周期 - 上拉加载更多
onReachBottom(() => {
  loadMore();
});
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
    <view class="elderly-list">
      <ElderlyCard
        v-for="item in filteredList"
        :key="item.id"
        :item="item"
        @button-click="handleButtonClick"
        @card-click="handleCardClick"
      />

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view
        v-if="!loading && (!filteredList || filteredList.length === 0)"
        class="empty-state"
      >
        <text>暂无数据</text>
      </view>

      <!-- 底部安全区域 -->
      <view style="height: calc(100rpx + env(safe-area-inset-bottom))"></view>
    </view>
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
  z-index: 101;

  .filter-mask {
    position: fixed;
    top: 200rpx;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }

  .filter-content {
    background-color: #fff;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #eee;

    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
      margin-bottom: 20rpx;

      .filter-option {
        padding: 12rpx 24rpx;
        background-color: #f5f5f5;
        border-radius: 8rpx;
        font-size: 26rpx;
        color: #666;

        &.active {
          background-color: #e6f2ff;
          color: #1677ff;
        }
      }
    }

    .filter-actions {
      display: flex;
      gap: 20rpx;

      .btn-clear,
      .btn-confirm {
        flex: 1;
        height: 72rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8rpx;
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

// 搜索框
.search-section {
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;

  .search-box {
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 40rpx;
    padding: 16rpx 24rpx;

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
  padding: 0 20rpx;
}

// 加载状态
.loading-state {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

// 空状态
.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
