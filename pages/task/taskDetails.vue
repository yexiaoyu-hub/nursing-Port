// 任务详情页
<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import { onLoad, onShow, onHide } from "@dcloudio/uni-app";
import { getServiceHistoryDetail } from "@/api/history/history.js";
import { getAgedDetail } from "@/api/older/older.js";
import { getServiceOrderWithProjectsAll } from "@/api/service/order.js";

// 页面参数
const orderId = ref<number>(0);
const loading = ref(false);

// 页面数据
const taskData = ref({
  // 工单基础信息
  id: 0,
  code: "",
  status: "",
  isTiming: false,
  serviceDuration: "",
  serviceDurationSeconds: 0,
  standardDuration: 0,
  agedId: null,

  // 老人信息
  elderlyInfo: {
    name: "",
    disabilityLevel: "",
    bedNo: "",
    serviceStatus: "",
    hasAssessmentReport: false,
    serviceType: "",
  },

  // 服务项目
  serviceItemList: [],
  totalDuration: "",
  totalPrice: 0,

  // 服务过程
  serviceProcessList: [],

  // 健康采集数据
  healthData: {
    bloodPressure: {
      systolic: 0,
      diastolic: 0,
      unit: "mmHg",
      status: "normal",
    },
    bloodSugar: { value: 0, unit: "mmol/L", status: "normal" },
    heartRate: { value: 0, unit: "bpm", status: "normal" },
    bloodOxygen: { value: 0, unit: "SpO2", status: "normal" },
  },

  // 评价信息（可选）
  evaluation: null,

  // 投诉反馈信息（可选）
  feedback: null,
});

// 获取任务详情
const fetchTaskDetail = async () => {
  if (!orderId.value) {
    return;
  }

  loading.value = true;
  try {
    const res = await getServiceHistoryDetail(orderId.value);

    const data = res;
    if (data && data.id) {
      // 映射接口数据
      taskData.value = {
        // 工单基础信息
        id: data.id, // 工单ID（用于执行）
        code: data.orderNo || "", // 工单编号
        status: getStatusText(data.status),
        statusCode: data.status, // 保存原始状态码
        isTiming: data.status === 2, // 执行中
        serviceDuration: formatDuration(data.serTime),
        serviceDurationSeconds: data.serTime || 0, // 保存秒数用于计算进度
        standardDuration: data.orderSerTimes || 0,
        agedId: data.agedId, // 保存老人ID

        // 老人信息
        elderlyInfo: {
          name: data.agedName || "",
          gender: data.agedSex === "1" ? "男" : "女",
          serviceStatus: getServiceStatus(data.status),
          hasAssessmentReport: false,
          serviceType: getNursingType(data.nursingType),
        },

        // 服务项目
        serviceItemList: (data.projects || []).map((item: any) => ({
          name: item.projectName || "",
          duration: `${item.serTimes || 0} min/${item.unit || "min"}`,
          price: item.price || 0,
          category: item.cateName || "",
        })),
        totalDuration: `${data.orderSerTimes || 0}min`,
        totalPrice: data.orderAmount || 0,

        // 服务过程
        serviceProcessList: [],

        // 健康采集数据
        healthData: {
          bloodPressure: {
            systolic: 0,
            diastolic: 0,
            unit: "mmHg",
            status: "normal",
          },
          bloodSugar: { value: 0, unit: "mmol/L", status: "normal" },
          heartRate: { value: 0, unit: "bpm", status: "normal" },
          bloodOxygen: { value: 0, unit: "SpO2", status: "normal" },
        },

        // 评价信息
        evaluation: null,

        // 投诉反馈信息
        feedback: null,
      };

      // 获取老人详细信息补充数据
      let agedDetailId = null;
      if (data.agedId) {
        agedDetailId = await fetchAgedDetail(data.agedId);
      }

      // 获取服务过程数据（包含健康数据）
      await fetchServiceProcess(orderId.value);
    }
  } catch (error) {
    uni.showToast({ title: "获取详情失败", icon: "none" });
  } finally {
    loading.value = false;
  }
};

// 状态码转文本
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: "未派单",
    1: "待执行",
    2: "执行中",
    3: "已完成",
    4: "已取消",
  };
  return map[status] || "未知";
};

// 获取服务状态
const getServiceStatus = (status: number) => {
  if (status === 2) return "服务中";
  if (status === 3) return "服务完成";
  return "待服务";
};

// 护理方式转文本
const getNursingType = (type: string) => {
  const map: Record<string, string> = {
    "1": "机构护理",
    "2": "居家护理",
    "3": "社区护理",
  };
  return map[type] || "机构护理";
};

// 格式化时长（秒转时分秒）
const formatDuration = (seconds: number) => {
  if (!seconds || seconds < 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
};

// 失能等级字典映射
const disabilityLevelMap: Record<string, string> = {
  "0": "基本正常",
  "1": "轻度失能",
  "2": "中度失能",
  "3": "重度失能 I级",
  "4": "重度失能 II级",
  "5": "重度失能 III级",
};

// 获取失能等级文本
const getDisabilityLevelText = (level: string | number) => {
  return disabilityLevelMap[String(level)] || "";
};

// 评分数字转文字
const getRatingText = (rating: number) => {
  const ratingMap: Record<number, string> = {
    5: "非常满意",
    4: "满意",
    3: "一般",
    2: "不满意",
    1: "非常不满意",
  };
  return ratingMap[rating] || "";
};

// 获取老人详细信息
const fetchAgedDetail = async (agedId: number) => {
  try {
    const res = await getAgedDetail(agedId);
    if (res) {
      // 更新老人信息
      taskData.value.elderlyInfo.age = res.age;
      taskData.value.elderlyInfo.disabilityLevel = getDisabilityLevelText(
        res.shinengLevelid
      );
      taskData.value.elderlyInfo.bedNo = res.juzhuAddress || "";
      taskData.value.elderlyInfo.avatar = res.photo || "";
      // 返回老人的 id 用于获取健康采集记录
      return res.id;
    }
  } catch (error) {
    console.error("获取老人详情失败:", error);
  }
  return null;
};

// 签到类型映射
const signTypeMap: Record<number, string> = {
  1: "服务人员开始服务",
  2: "服务人员服务中",
  3: "服务人员结束服务",
};

// 格式化音频时长
const formatAudioTime = (seconds: number) => {
  if (!seconds) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// 格式化时间戳
const formatTimestamp = (timestamp: string | number) => {
  if (!timestamp) return "";
  // 如果是字符串且不是纯数字，直接返回
  if (typeof timestamp === "string" && isNaN(Number(timestamp))) {
    return timestamp;
  }
  // 转换为数字
  let ts = Number(timestamp);
  // 如果是秒级时间戳（10位），转换为毫秒
  if (String(ts).length === 10) {
    ts = ts * 1000;
  }
  const date = new Date(ts);
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 处理健康数据
const processHealthData = (healths: any[]) => {
  if (!healths || !Array.isArray(healths) || healths.length === 0) {
    return;
  }
  // 找到第一条有有效数据的记录（shousuoya、xuetang、heartRate、xueyang 至少有一个有值）
  const data = healths.find(
    (h: any) =>
      h.shousuoya || h.shuzhangya || h.xuetang || h.heartRate || h.xueyang
  );
  if (!data) {
    return;
  }
  taskData.value.healthData = {
    bloodPressure: {
      systolic: data.shousuoya || 0,
      diastolic: data.shuzhangya || 0,
      unit: "mmHg",
      status:
        data.shousuoya > 140 || data.shuzhangya > 90
          ? "high"
          : data.shousuoya < 90 || data.shuzhangya < 60
          ? "low"
          : "normal",
    },
    bloodSugar: {
      value: data.xuetang || 0,
      unit: "mmol/L",
      status:
        data.xuetang > 6.1 ? "high" : data.xuetang < 3.9 ? "low" : "normal",
    },
    heartRate: {
      value: data.heartRate || 0,
      unit: "bpm",
      status:
        data.heartRate > 100 ? "high" : data.heartRate < 60 ? "low" : "normal",
    },
    bloodOxygen: {
      value: data.xueyang || 0,
      unit: "SpO2",
      status: data.xueyang < 95 ? "low" : "normal",
    },
  };
};

// 获取服务过程数据
const fetchServiceProcess = async (orderId: number) => {
  try {
    const res = await getServiceOrderWithProjectsAll(orderId);
    if (!res) {
      return;
    }
    const data = res.data || res;

    // 处理健康数据
    if (data && data.healths && Array.isArray(data.healths)) {
      processHealthData(data.healths);
    }

    // 处理评价数据
    if (
      data &&
      data.pingjias &&
      Array.isArray(data.pingjias) &&
      data.pingjias.length > 0
    ) {
      const evalData = data.pingjias[0];
      // 使用接口返回的字段名（star/starTxt）
      taskData.value.evaluation = {
        orgRating: evalData.star || 0,
        staffRating: evalData.star || 0, // 只有一个评分字段
        content: evalData.starTxt || "",
      };
    } else {
      taskData.value.evaluation = null;
    }

    if (data && data.signs && Array.isArray(data.signs)) {
      // 查找开始签到记录（signType = 1），用于多端同步计时
      const startSign = data.signs.find((s: any) => s.signType === 1);
      if (startSign) {
        const startTime = startSign.signTime || startSign.createTime;
        if (startTime) {
          let timestamp: number;
          // 如果是字符串且不是纯数字，当作日期字符串解析
          if (typeof startTime === "string" && isNaN(Number(startTime))) {
            timestamp = new Date(startTime).getTime();
          } else {
            // 转换为数字
            let ts = Number(startTime);
            // 如果是秒级时间戳（10位），转换为毫秒
            if (String(ts).length === 10) {
              ts = ts * 1000;
            }
            timestamp = ts;
          }
          serverServiceStartTime.value = timestamp;
        }
      }

      // 处理签到记录
      const processList = data.signs.map((sign: any, index: number) => {
        // 处理照片
        const photos: string[] = [];
        if (sign.signPotos) {
          try {
            const parsed = JSON.parse(sign.signPotos);
            if (Array.isArray(parsed)) {
              photos.push(...parsed);
            }
          } catch {
            // 如果不是JSON数组，按逗号分割
            photos.push(...sign.signPotos.split(",").filter((p: string) => p));
          }
        }

        // 处理录音
        const audioList = (sign.mp3s || []).map((mp3: any) => ({
          url: mp3.mp3Url || "",
          duration: mp3.mp3Time || 0,
          durationText: formatAudioTime(mp3.mp3Time || 0),
        }));

        return {
          step: index + 1,
          time: formatTimestamp(sign.signTime),
          title: signTypeMap[sign.signType] || "服务记录",
          location: sign.signAddressName || "",
          photos: photos,
          audioList: audioList,
          record: sign.remark || "",
        };
      });

      taskData.value.serviceProcessList = processList;
    }
  } catch (error) {
    console.error("获取服务过程数据失败:", error);
  }
};

// 服务中页面的存储键
const getServiceSecondStorageKey = () => `serviceSecond_${orderId.value}`;

// 服务执行主页的存储键（包含最终时长）
const getServiceExecuteStorageKey = () => `serviceExecuteState`;

// 从服务端获取的服务开始时间（用于多端同步）
const serverServiceStartTime = ref<number | null>(null);

// 从服务中页面获取当前服务时长（支持多端同步）
const getServiceDurationFromSecondPage = () => {
  // 优先使用从服务端获取的开始时间（多端同步）
  if (serverServiceStartTime.value) {
    const duration = Math.floor(
      (Date.now() - serverServiceStartTime.value) / 1000
    );
    return duration;
  }

  // 降级：尝试从本地存储获取（当前设备开始的服务）
  try {
    const state = uni.getStorageSync(getServiceSecondStorageKey());
    if (state && state.serviceStartTime) {
      const duration = Math.floor((Date.now() - state.serviceStartTime) / 1000);
      return duration;
    }
  } catch (e) {
    console.error("获取服务中页面状态失败:", e);
  }
  return null;
};

// 从服务执行主页获取最终服务时长（服务结束时）
const getFinalServiceDuration = () => {
  try {
    const state = uni.getStorageSync(getServiceExecuteStorageKey());
    // 检查是否是当前订单的数据
    if (state && state.orderId == orderId.value && state.serviceDuration) {
      return state.serviceDuration;
    }
  } catch (e) {
    console.error("获取服务执行状态失败:", e);
  }
  return null;
};

// 计时器
let timer: ReturnType<typeof setInterval> | null = null;

// 启动实时计时器
const startTimer = () => {
  if (timer) return;
  // 如果步骤 >= 3，说明已进入服务结束页，不启动计时器，直接显示最终数据
  const currentStep = getCurrentServiceStep();
  if (currentStep >= 3) {
    const finalDuration = getFinalServiceDuration();
    if (finalDuration !== null) {
      taskData.value.serviceDurationSeconds = finalDuration;
      taskData.value.serviceDuration = formatDuration(finalDuration);
    }
    return;
  }
  timer = setInterval(() => {
    const duration = getServiceDurationFromSecondPage();
    if (duration !== null) {
      // 服务中页面有计时状态，更新显示
      taskData.value.serviceDurationSeconds = duration;
      taskData.value.serviceDuration = formatDuration(duration);
    } else {
      // 服务中页面没有计时状态（服务已结束），停止计时
      stopTimer();
      // 尝试从服务执行主页获取最终时长
      const finalDuration = getFinalServiceDuration();
      if (finalDuration !== null) {
        taskData.value.serviceDurationSeconds = finalDuration;
        taskData.value.serviceDuration = formatDuration(finalDuration);
      }
    }
  }, 1000);
};

// 停止计时器
const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// 页面加载
onLoad((options) => {
  if (options?.id) {
    orderId.value = Number(options.id);
    fetchTaskDetail().then(() => {
      // 如果是服务中状态，启动实时计时
      if (isServing.value) {
        startTimer();
      } else {
        // 非服务中状态，尝试从服务执行主页获取最终时长
        const finalDuration = getFinalServiceDuration();
        if (finalDuration !== null) {
          taskData.value.serviceDurationSeconds = finalDuration;
          taskData.value.serviceDuration = formatDuration(finalDuration);
        }
      }
    });
  }
});

// 页面显示时启动计时器或获取最终时长
onShow(() => {
  if (orderId.value && isServing.value) {
    startTimer();
  } else if (orderId.value) {
    // 非服务中状态，尝试获取最终时长
    const finalDuration = getFinalServiceDuration();
    if (finalDuration !== null) {
      taskData.value.serviceDurationSeconds = finalDuration;
      taskData.value.serviceDuration = formatDuration(finalDuration);
    }
  }
});

// 页面隐藏时停止计时器
onHide(() => {
  stopTimer();
});

// 页面卸载时停止计时器
onUnmounted(() => {
  stopTimer();
});

// 是否有评价信息
const hasEvaluation = computed(() => !!taskData.value.evaluation);

// 是否有投诉反馈
const hasFeedback = computed(() => !!taskData.value.feedback);

// 是否是待执行状态（显示"去执行"）
const isPending = computed(
  () => taskData.value.statusCode === 0 || taskData.value.statusCode === 1
);

// 是否是服务中状态（显示"继续执行"）
const isServing = computed(() => taskData.value.statusCode === 2);

// 是否是已完成状态（显示"去评价"）
const isCompleted = computed(() => taskData.value.statusCode === 3);

// 获取当前服务执行步骤
const getCurrentServiceStep = () => {
  try {
    const state = uni.getStorageSync(getServiceExecuteStorageKey());
    if (state && state.orderId == orderId.value) {
      return state.currentStep || 1;
    }
  } catch (e) {
    console.error("获取服务执行步骤失败:", e);
  }
  return 1;
};

// 服务中页面是否有计时状态（用于判断是否显示"正在计时中"标签）
// 当步骤到达第3步（服务结束）及以上时，不再显示计时
const isTimingActive = computed(() => {
  if (!isServing.value) return false;
  // 如果步骤 >= 3，说明已进入服务结束页，不再显示计时
  const currentStep = getCurrentServiceStep();
  if (currentStep >= 3) return false;

  // 优先检查服务端是否有开始时间（多端同步）
  if (serverServiceStartTime.value) return true;

  // 降级：检查本地存储
  const state = uni.getStorageSync(getServiceSecondStorageKey());
  return !!(state && state.serviceStartTime);
});

// 检查是否已进入评价流程
const hasEnteredEvaluation = computed(() => {
  const evaluationKey = `serviceEvaluation_${taskData.value.id}`;
  const evaluationState = uni.getStorageSync(evaluationKey);
  return !!(evaluationState && evaluationState.entered);
});

// 按钮文字
const actionButtonText = computed(() => {
  // 已完成状态
  if (isCompleted.value) {
    // 已评价：不显示按钮
    if (hasEvaluation.value) return "";
    // 已进入评价流程（点击了服务结束页的下一步）：显示"去评价"
    if (hasEnteredEvaluation.value) return "去评价";
    // 已完成但未进入评价流程：显示"继续执行"（继续到服务结束页）
    return "继续执行";
  }
  if (isServing.value) return "继续执行";
  return "去执行"; // 待执行状态
});

// 按钮样式类
const actionButtonClass = computed(() => {
  const text = actionButtonText.value;
  // 去评价 - 使用橘色
  if (text === "去评价") return "completed";
  // 去执行 - 使用绿色
  if (text === "去执行") return "green";
  // 继续执行 - 使用蓝色（默认）
  return "pending";
});

// 服务时长进度百分比
const durationProgress = computed(() => {
  const standardMinutes = taskData.value.standardDuration;
  const actualSeconds = taskData.value.serviceDurationSeconds;
  if (!standardMinutes || !actualSeconds) return 0;
  const standardSeconds = standardMinutes * 60;
  return (actualSeconds / standardSeconds) * 100;
});

// 服务时长进度颜色
const durationProgressColor = computed(() => {
  const progress = durationProgress.value;
  if (progress >= 80) return "#52c41a"; // 绿色
  return "#faad14"; // 黄色
});

// 获取护理方式样式类
const getNursingModeClass = (type: string) => {
  const classMap: Record<string, string> = {
    机构护理: "institution",
    居家护理: "home",
    社区护理: "community",
  };
  return classMap[type] || "";
};

// 获取服务状态样式类
const getServiceStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    服务中: "status-serving",
    待服务: "status-pending",
    服务完成: "status-completed",
  };
  return classMap[status] || "";
};

// 预览图片
const previewImage = (urls: string[], current: number) => {
  uni.previewImage({
    urls: urls,
    current: current,
  });
};

// 当前播放的音频
const currentAudio = ref<{
  url: string;
  context: UniApp.InnerAudioContext | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}>({
  url: "",
  context: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
});

// 统一的按钮点击处理
const handleActionClick = () => {
  const orderId = taskData.value.id; // 使用工单ID
  const agedId = taskData.value.agedId;

  if (!orderId) {
    uni.showToast({
      title: "工单ID不能为空",
      icon: "none",
    });
    return;
  }
  if (!agedId) {
    uni.showToast({
      title: "老人ID不能为空",
      icon: "none",
    });
    return;
  }

  // 已完成状态：跳转到服务执行页面的评价
  if (isCompleted.value) {
    // 设置服务执行状态为第4步（评价）
    const storageKey = "serviceExecuteState";
    const savedState = uni.getStorageSync(storageKey);

    // 保存状态，设置当前步骤为4（评价）
    const state = {
      orderId: orderId,
      currentStep: 4, // 评价步骤
      serviceDuration:
        savedState?.serviceDuration || taskData.value.serviceDurationSeconds,
      plannedDuration:
        savedState?.plannedDuration || taskData.value.standardDuration,
    };
    uni.setStorageSync(storageKey, state);

    uni.navigateTo({
      url: `/pages/serviceExecute/index?orderId=${orderId}&agedId=${agedId}`,
    });
    return;
  }

  // 待执行/服务中状态：跳转到服务执行页面
  // 检查本地存储的状态
  const storageKey = "serviceExecuteState";
  const savedState = uni.getStorageSync(storageKey);

  // 如果有保存的状态且订单ID匹配，使用该状态
  if (savedState && savedState.orderId == orderId) {
    // 跳转到服务执行页面，会自动恢复状态
    uni.navigateTo({
      url: `/pages/serviceExecute/index?orderId=${orderId}&agedId=${agedId}`,
    });
  } else {
    // 没有保存的状态或订单ID不匹配，清除旧状态并跳转
    uni.removeStorageSync(storageKey);
    // 同时清除各步骤的状态
    uni.removeStorageSync(`serviceStart_${orderId}`);
    uni.removeStorageSync(`serviceSecond_${orderId}`);
    uni.removeStorageSync(`serviceEnd_${orderId}`);

    uni.navigateTo({
      url: `/pages/serviceExecute/index?orderId=${orderId}&agedId=${agedId}`,
    });
  }
};

// 播放音频
const playAudio = (url: string, duration: number = 0) => {
  if (!url) {
    uni.showToast({ title: "音频地址无效", icon: "none" });
    return;
  }

  // 如果点击的是当前正在播放的音频，则暂停
  if (currentAudio.value.url === url && currentAudio.value.isPlaying) {
    currentAudio.value.context?.pause();
    currentAudio.value.isPlaying = false;
    return;
  }

  // 如果点击的是当前暂停的音频，则继续播放
  if (
    currentAudio.value.url === url &&
    !currentAudio.value.isPlaying &&
    currentAudio.value.context
  ) {
    currentAudio.value.context.play();
    currentAudio.value.isPlaying = true;
    return;
  }

  // 停止之前的音频（切换不同音频时）
  if (currentAudio.value.context) {
    currentAudio.value.context.stop();
    currentAudio.value.context.destroy();
  }

  // 创建新的音频上下文
  const innerAudioContext = uni.createInnerAudioContext();
  currentAudio.value = {
    url: url,
    context: innerAudioContext,
    isPlaying: true,
    currentTime: 0,
    duration: duration,
  };

  innerAudioContext.src = url;

  // 监听播放进度
  innerAudioContext.onTimeUpdate(() => {
    currentAudio.value.currentTime = innerAudioContext.currentTime;
  });

  // 监听播放结束
  innerAudioContext.onEnded(() => {
    currentAudio.value.isPlaying = false;
    currentAudio.value.currentTime = 0;
  });

  // 监听错误
  innerAudioContext.onError((err) => {
    console.error("音频播放错误:", err);
    uni.showToast({ title: "音频播放失败", icon: "none" });
    currentAudio.value.isPlaying = false;
  });

  // 开始播放
  innerAudioContext.play();
};

// 获取音频播放进度百分比
const getAudioProgress = (url: string, duration: number) => {
  if (currentAudio.value.url !== url) {
    return 0;
  }
  if (!duration) return 0;
  return (currentAudio.value.currentTime / duration) * 100;
};

// 获取音频当前时间文本
const getAudioCurrentTime = (url: string) => {
  if (currentAudio.value.url !== url) {
    return "00:00";
  }
  const time = Math.floor(currentAudio.value.currentTime);
  const m = Math.floor(time / 60);
  const s = time % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// 是否正在播放指定音频
const isPlayingAudio = (url: string) => {
  return currentAudio.value.url === url && currentAudio.value.isPlaying;
};

// 是否是当前音频（包括暂停状态）
const isCurrentAudio = (url: string) => {
  return currentAudio.value.url === url;
};
</script>

<template>
  <view class="task-details-page">
    <!-- 老人信息卡片 -->
    <view class="elderly-card">
      <view class="card-header">
        <view class="avatar">
          <text v-if="!taskData.elderlyInfo.avatar" class="avatar-text"
            >头像</text
          >
          <image v-else :src="taskData.elderlyInfo.avatar" mode="aspectFill" />
        </view>
        <view class="elderly-info">
          <view class="info-header">
            <view class="info-row">
              <text class="name">{{ taskData.elderlyInfo.name }}</text>
            </view>
            <view
              class="nursing-mode-tag"
              :class="getNursingModeClass(taskData.elderlyInfo.serviceType)"
            >
              {{ taskData.elderlyInfo.serviceType }}
            </view>
          </view>
          <view class="info-subtitle">
            <text class="gender">{{ taskData.elderlyInfo.gender }}</text>
            <text class="divider">·</text>
            <text class="age">{{ taskData.elderlyInfo.age }}岁</text>
            <text class="divider">·</text>
            <text class="bed">床位 {{ taskData.elderlyInfo.bedNo }}</text>
          </view>
          <view class="tags">
            <text class="tag disability"
              >失能：{{ taskData.elderlyInfo.disabilityLevel }}</text
            >
            <text class="tag care-level">工单：{{ taskData.code }}</text>
            <text
              class="tag service-status"
              :class="getServiceStatusClass(taskData.elderlyInfo.serviceStatus)"
              >{{ taskData.elderlyInfo.serviceStatus }}</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 服务时长 -->
    <view class="duration-bar" v-if="isPending || isServing || isCompleted">
      <!-- 操作按钮（待执行/服务中/已完成未评价） -->
      <view
        v-if="actionButtonText"
        class="action-btn"
        :class="actionButtonClass"
        @click="handleActionClick"
      >
        <text>{{ actionButtonText }}</text>
      </view>

      <!-- 服务中且有计时状态：显示正在计时标签 -->
      <view v-if="isServing && isTimingActive" class="timing-badge">
        <text class="dot"></text>
        <text>正在计时中</text>
      </view>

      <!-- 服务时长显示 -->
      <view class="duration-content">
        <view class="duration-row">
          <text class="duration-label">{{
            isCompleted ? "服务时长" : "已服务时长"
          }}</text>
          <text
            class="duration-value"
            :style="isCompleted ? { color: durationProgressColor } : {}"
            >{{ taskData.serviceDuration }}</text
          >
          <text class="duration-standard"
            >/ {{ taskData.standardDuration }} min（标准服务时长）</text
          >
        </view>
      </view>
    </view>

    <!-- 服务项目 -->
    <view class="section">
      <view class="section-title">服务项目</view>
      <view class="service-table">
        <view class="table-header">
          <text class="th">服务项目</text>
          <text class="th">标准时长</text>
          <text class="th">金额(元)</text>
          <text class="th">类别</text>
        </view>
        <view
          class="table-row"
          v-for="item in taskData.serviceItemList"
          :key="item.name"
        >
          <text class="td">{{ item.name }}</text>
          <text class="td">{{ item.duration }}</text>
          <text class="td">{{ item.price }}</text>
          <text class="td">{{ item.category }}</text>
        </view>
        <view class="table-row total">
          <text class="td">总计</text>
          <text class="td">{{ taskData.totalDuration }}</text>
          <text class="td">{{ taskData.totalPrice }}</text>
          <text class="td">-</text>
        </view>
      </view>
    </view>

    <!-- 服务过程 -->
    <view class="section">
      <view class="section-title">服务过程</view>
      <view class="timeline">
        <view
          class="timeline-item"
          v-for="(item, index) in taskData.serviceProcessList"
          :key="index"
        >
          <view class="timeline-left">
            <view class="timeline-dot">{{ item.step }}</view>
            <view
              class="timeline-line"
              v-if="index < taskData.serviceProcessList.length - 1"
            ></view>
          </view>
          <view class="timeline-content">
            <view class="timeline-header">
              <text class="time">{{ item.time }}</text>
              <text class="title">{{ item.title }}</text>
              <div class="location">
                <uni-icons type="map-pin-ellipse" size="16" color="#1677FF" />
                {{ item.location }}
              </div>
            </view>
            <view class="timeline-body">
              <!-- 照片 -->
              <view class="photo-list" v-if="item.photos && item.photos.length">
                <image
                  v-for="(photo, pIndex) in item.photos"
                  :key="pIndex"
                  :src="photo"
                  mode="aspectFill"
                  class="photo-item"
                  @click="previewImage(item.photos, pIndex)"
                />
              </view>
              <!-- 录音列表 -->
              <view
                class="audio-player"
                v-for="(audio, aIndex) in item.audioList"
                :key="aIndex"
                @click="playAudio(audio.url, audio.duration)"
                :class="{
                  playing: isPlayingAudio(audio.url),
                  paused:
                    isCurrentAudio(audio.url) && !isPlayingAudio(audio.url),
                }"
              >
                <view class="play-btn">
                  <text class="play-icon">{{
                    isPlayingAudio(audio.url) ? "❚❚" : "▶"
                  }}</text>
                </view>
                <view class="progress-bar">
                  <view
                    class="progress-fill"
                    :style="{
                      width: getAudioProgress(audio.url, audio.duration) + '%',
                    }"
                  ></view>
                </view>
                <text class="audio-time"
                  >{{ getAudioCurrentTime(audio.url) }}/{{
                    audio.durationText
                  }}</text
                >
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 健康采集数据 -->
    <view class="section">
      <view class="section-title">健康采集数据</view>
      <view class="health-list">
        <view class="health-item">
          <text class="health-label">血压（高压/低压）</text>
          <view class="health-value-box">
            <text
              v-if="
                taskData.healthData.bloodPressure.systolic &&
                taskData.healthData.bloodPressure.status === 'high'
              "
              class="status-tag-high"
              >偏高</text
            >
            <text
              v-else-if="
                taskData.healthData.bloodPressure.systolic &&
                taskData.healthData.bloodPressure.status === 'low'
              "
              class="status-tag-low"
              >偏低</text
            >
            <text
              v-else-if="taskData.healthData.bloodPressure.systolic"
              class="status-tag-normal"
              >正常</text
            >
            <text class="health-value"
              >{{ taskData.healthData.bloodPressure.systolic || 0 }}/{{
                taskData.healthData.bloodPressure.diastolic || 0
              }}
              {{ taskData.healthData.bloodPressure.unit }}</text
            >
          </view>
        </view>
        <view class="health-item">
          <text class="health-label">血糖</text>
          <view class="health-value-box">
            <text
              v-if="
                taskData.healthData.bloodSugar.value &&
                taskData.healthData.bloodSugar.status === 'high'
              "
              class="status-tag-high"
              >偏高</text
            >
            <text
              v-else-if="
                taskData.healthData.bloodSugar.value &&
                taskData.healthData.bloodSugar.status === 'low'
              "
              class="status-tag-low"
              >偏低</text
            >
            <text
              v-else-if="taskData.healthData.bloodSugar.value"
              class="status-tag-normal"
              >正常</text
            >
            <text class="health-value"
              >{{ taskData.healthData.bloodSugar.value || 0 }}
              {{ taskData.healthData.bloodSugar.unit }}</text
            >
          </view>
        </view>
        <view class="health-item">
          <text class="health-label">心率</text>
          <view class="health-value-box">
            <text
              v-if="
                taskData.healthData.heartRate.value &&
                taskData.healthData.heartRate.status === 'high'
              "
              class="status-tag-high"
              >偏高</text
            >
            <text
              v-else-if="
                taskData.healthData.heartRate.value &&
                taskData.healthData.heartRate.status === 'low'
              "
              class="status-tag-low"
              >偏低</text
            >
            <text
              v-else-if="taskData.healthData.heartRate.value"
              class="status-tag-normal"
              >正常</text
            >
            <text class="health-value"
              >{{ taskData.healthData.heartRate.value || 0 }}
              {{ taskData.healthData.heartRate.unit }}</text
            >
          </view>
        </view>
        <view class="health-item">
          <text class="health-label">血氧饱和度</text>
          <view class="health-value-box">
            <text
              v-if="
                taskData.healthData.bloodOxygen.value &&
                taskData.healthData.bloodOxygen.status === 'low'
              "
              class="status-tag-low"
              >偏低</text
            >
            <text
              v-else-if="taskData.healthData.bloodOxygen.value"
              class="status-tag-normal"
              >正常</text
            >
            <text class="health-value"
              >{{ taskData.healthData.bloodOxygen.value || 0 }}
              {{ taskData.healthData.bloodOxygen.unit }}</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 评价信息 -->
    <view class="section" v-if="hasEvaluation">
      <view class="section-title">评价信息</view>
      <view class="evaluation-content">
        <view class="rating-row">
          <text class="rating-label">机构评价：</text>
          <view class="stars">
            <text
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ active: i <= taskData.evaluation.orgRating }"
              >★</text
            >
          </view>
          <text class="rating-text">{{
            getRatingText(taskData.evaluation.orgRating)
          }}</text>
        </view>
        <view class="rating-row">
          <text class="rating-label">人员评价：</text>
          <view class="stars">
            <text
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ active: i <= taskData.evaluation.staffRating }"
              >★</text
            >
          </view>
          <text class="rating-text">{{
            getRatingText(taskData.evaluation.staffRating)
          }}</text>
        </view>
        <view class="comment-box">
          <text class="comment-label">评价内容：</text>
          <text class="comment-text">{{ taskData.evaluation.content }}</text>
        </view>
      </view>
    </view>

    <!-- 投诉反馈信息 -->
    <view class="section" v-if="hasFeedback">
      <view class="section-title">投诉反馈信息</view>
      <view class="feedback-content">
        <view class="feedback-item">
          <text class="feedback-label">投诉反馈类型：</text>
          <text class="feedback-value">{{ taskData.feedback.type }}</text>
        </view>
        <view class="feedback-item">
          <text class="feedback-label">投诉反馈内容：</text>
          <text class="feedback-text">{{ taskData.feedback.content }}</text>
        </view>
        <view class="feedback-item">
          <text class="feedback-label">处理情况：</text>
          <text class="feedback-status">{{ taskData.feedback.status }}</text>
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view style="height: 40rpx"></view>
  </view>
</template>

<style lang="scss" scoped>
.task-details-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 10rpx;

  // 服务时长
  .duration-bar {
    background-color: #fff;
    padding: 20rpx 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 20rpx;

    .action-btn {
      padding: 14rpx 80rpx;
      border-radius: 20rpx;
      font-size: 28rpx;
      font-weight: 500;
      color: #fff;

      &.pending {
        background: #1677ff;
      }

      &.serving {
        background: #52c41a;
      }

      &.completed {
        background: linear-gradient(135deg, #fa8c16, #d46b08);
      }

      &.green {
        background: #52c41a;
      }
    }

    .serving-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20rpx;
    }

    .timing-badge {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 8rpx 16rpx;
      background-color: #f6ffed;
      border: 2rpx solid #b7eb8f;
      border-radius: 24rpx;
      font-size: 22rpx;
      color: #52c41a;

      .dot {
        width: 12rpx;
        height: 12rpx;
        background-color: #52c41a;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
      }
    }

    .duration-content {
      display: flex;
      flex-direction: column;
      align-items: center;

      .duration-row {
        display: flex;
        align-items: baseline;
        gap: 12rpx;

        .duration-label {
          font-size: 24rpx;
          color: #666;
        }

        .duration-value {
          font-size: 36rpx;
          color: #333;
          font-weight: 700;
        }

        .duration-standard {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  // 老人信息卡片
  .elderly-card {
    background-color: #fff;
    margin: 10rpx;
    border: 2rpx solid #0f172a14;
    border-radius: 16rpx;
    padding: 24rpx;

    .card-header {
      display: flex;
      gap: 20rpx;
      padding-bottom: 10rpx;
      margin-bottom: 20rpx;

      .avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .avatar-text {
          font-size: 24rpx;
          color: #999;
        }

        image {
          width: 100%;
          height: 100%;
        }
      }

      .elderly-info {
        flex: 1;

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8rpx;

          .info-row {
            display: flex;
            align-items: center;

            .name {
              font-size: 36rpx;
              color: #333;
              font-weight: 600;
            }
          }

          .nursing-mode-tag {
            padding: 4rpx 16rpx;
            background-color: #e6f7ff;
            color: #1677ff;
            border-radius: 20rpx;
            font-size: 22rpx;

            &.institution {
              background-color: #e6f7ff;
              color: #1677ff;
            }

            &.home {
              background-color: #f6ffed;
              color: #52c41a;
            }

            &.community {
              background-color: #fff7e6;
              color: #fa8c16;
            }
          }
        }

        .info-subtitle {
          display: flex;
          align-items: center;
          gap: 8rpx;
          margin-bottom: 16rpx;

          .gender,
          .age,
          .bed {
            font-size: 24rpx;
            color: #666;
          }

          .divider {
            font-size: 24rpx;
            color: #999;
          }
        }

        .tags {
          display: flex;
          gap: 12rpx;

          .tag {
            padding: 6rpx 16rpx;
            border-radius: 20rpx;
            font-size: 22rpx;

            &.disability {
              background-color: #f5f5f5;
              color: #666;
            }

            &.care-level {
              background-color: #f5f5f5;
              color: #666;
            }

            &.service-status {
              background-color: #e6f7ff;
              color: #1677ff;

              &.status-serving {
                background-color: #e6f7ff;
                color: #1677ff;
              }

              &.status-pending {
                background-color: #fff7e6;
                color: #fa8c16;
              }

              &.status-completed {
                background-color: #f6ffed;
                color: #52c41a;
              }
            }
          }
        }
      }
    }
  }

  // 通用区块
  .section {
    background-color: #fff;
    margin: 0 10rpx 20rpx 10rpx;
    border: 2rpx solid #0f172a14;
    border-radius: 16rpx;
    padding: 24rpx;

    .section-title {
      font-size: 30rpx;
      color: #333;
      font-weight: 600;
      margin-bottom: 20rpx;

      .payment-status {
        font-size: 28rpx;
        font-weight: normal;

        &.unpaid {
          color: #ff4d4f;
        }
      }
    }

    // 服务项目表格
    .service-table {
      .table-header {
        display: flex;
        background-color: #f5f5f5;
        padding: 16rpx 0;
        border-radius: 8rpx;
        margin-bottom: 12rpx;

        .th {
          flex: 1;
          text-align: center;
          font-size: 24rpx;
          color: #666;
          font-weight: 500;
        }
      }

      .table-row {
        display: flex;
        padding: 16rpx 0;
        border-bottom: 2rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        &.total {
          .td {
            font-weight: 600;
            color: #333;
          }
        }

        .td {
          flex: 1;
          text-align: center;
          font-size: 24rpx;
          color: #666;
        }
      }
    }

    // 缴费信息
    .payment-info {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;

      .payment-item {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .label {
          font-size: 26rpx;
          color: #666;
        }

        .value {
          font-size: 28rpx;
          color: #333;
          font-weight: 600;

          &.highlight {
            color: #ff4d4f;
          }
        }
      }
    }

    // 时间轴
    .timeline {
      .timeline-item {
        display: flex;
        gap: 24rpx;

        .timeline-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 48rpx;

          .timeline-dot {
            width: 48rpx;
            height: 48rpx;
            border-radius: 50%;
            background-color: #fff;
            border: 2rpx solid #e0e0e0;
            color: #666;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24rpx;
            font-weight: 500;
          }

          .timeline-line {
            width: 2rpx;
            flex: 1;
            background-color: #e0e0e0;
            margin: 8rpx 0;
          }
        }

        .timeline-content {
          flex: 1;
          padding-bottom: 40rpx;

          .timeline-header {
            margin-bottom: 16rpx;

            .time {
              font-size: 28rpx;
              color: #333;
              font-weight: 500;
              margin-right: 16rpx;
            }

            .title {
              font-size: 28rpx;
              color: #333;
              font-weight: 500;
              margin-right: 16rpx;
            }

            .location {
              font-size: 24rpx;
              color: #1677ff;
              display: flex;
              align-items: center;
              gap: 4rpx;
              margin-top: 8rpx;
            }
          }

          .timeline-body {
            .photo-list {
              display: flex;
              gap: 16rpx;
              margin-bottom: 16rpx;

              .photo-item {
                width: 160rpx;
                height: 160rpx;
                border-radius: 12rpx;
                background-color: #f5f5f5;
              }
            }

            .audio-player {
              display: flex;
              align-items: center;
              gap: 16rpx;
              padding: 16rpx 20rpx;
              background-color: #f5f5f5;
              border-radius: 32rpx;
              margin-bottom: 16rpx;
              width: fit-content;
              min-width: 400rpx;

              &.playing {
                background-color: #e6f7ff;

                .play-btn {
                  background: linear-gradient(135deg, #1890ff, #096dd9);
                }

                .progress-fill {
                  background: linear-gradient(90deg, #1890ff, #69c0ff);
                }
              }

              &.paused {
                background-color: #fff7e6;

                .play-btn {
                  background: linear-gradient(135deg, #faad14, #d48806);
                }
              }

              .play-btn {
                width: 56rpx;
                height: 56rpx;
                background: linear-gradient(135deg, #52c41a, #389e0d);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;

                .play-icon {
                  color: #fff;
                  font-size: 24rpx;
                  margin-left: 4rpx;
                }
              }

              .progress-bar {
                flex: 1;
                height: 6rpx;
                background-color: #e0e0e0;
                border-radius: 3rpx;
                overflow: hidden;

                .progress-fill {
                  height: 100%;
                  background: linear-gradient(90deg, #52c41a, #95de64);
                  border-radius: 3rpx;
                }
              }

              .audio-time {
                font-size: 24rpx;
                color: #999;
              }
            }
          }
        }
      }
    }

    // 健康数据
    .health-list {
      .health-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 2rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .health-label {
          font-size: 28rpx;
          color: #666;
        }

        .health-value-box {
          display: flex;
          align-items: center;
          gap: 12rpx;
        }

        .health-value {
          font-size: 30rpx;
          color: #333;
          font-weight: 600;
        }

        .status-tag-high {
          padding: 4rpx 12rpx;
          background-color: #fff2f0;
          color: #ff4d4f;
          border-radius: 8rpx;
          font-size: 22rpx;
        }

        .status-tag-low {
          padding: 4rpx 12rpx;
          background-color: #e6f7ff;
          color: #1890ff;
          border-radius: 8rpx;
          font-size: 22rpx;
        }

        .status-tag-normal {
          padding: 4rpx 12rpx;
          background-color: #f6ffed;
          color: #52c41a;
          border-radius: 8rpx;
          font-size: 22rpx;
        }
      }
    }

    // 评价信息
    .evaluation-content {
      .rating-row {
        display: flex;
        align-items: center;
        gap: 16rpx;
        margin-bottom: 16rpx;

        .rating-label {
          font-size: 26rpx;
          color: #666;
        }

        .stars {
          display: flex;
          gap: 8rpx;

          .star {
            font-size: 32rpx;
            color: #e0e0e0;

            &.active {
              color: #ff9500;
            }
          }
        }

        .rating-text {
          font-size: 26rpx;
          color: #ff9500;
          font-weight: 600;
        }
      }

      .comment-box {
        margin-top: 20rpx;
        padding: 20rpx;
        background-color: #f8f8f8;
        border-radius: 12rpx;

        .comment-label {
          display: block;
          font-size: 26rpx;
          color: #666;
          margin-bottom: 12rpx;
        }

        .comment-text {
          font-size: 26rpx;
          color: #333;
          line-height: 1.6;
        }
      }
    }

    // 投诉反馈
    .feedback-content {
      .feedback-item {
        margin-bottom: 16rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .feedback-label {
          font-size: 26rpx;
          color: #666;
          margin-right: 8rpx;
        }

        .feedback-value {
          font-size: 26rpx;
          color: #333;
          font-weight: 500;
        }

        .feedback-text {
          display: block;
          margin-top: 12rpx;
          font-size: 26rpx;
          color: #333;
          line-height: 1.6;
        }

        .feedback-status {
          font-size: 26rpx;
          color: #52c41a;
          font-weight: 600;
          margin-right: 16rpx;
        }
      }
    }
  }
}
</style>
