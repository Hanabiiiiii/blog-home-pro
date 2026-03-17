<template>
  <div :class="['cover', { show: store.backgroundShow }]">
    <img
      v-if="bgUrl"
      v-show="store.imgLoadStatus"
      :src="bgUrl"
      class="bg"
      alt="cover"
      @load="onImgLoad"
      @error="onImgError"
      @animationend="onAnimationEnd"
    />
    <div :class="['gray', { hidden: store.backgroundShow }]" />
    <Transition name="fade" mode="out-in">
      <a
        v-if="store.backgroundShow && store.coverType != '3'"
        class="down"
        :href="bgUrl"
        target="_blank"
      >
        下载壁纸
      </a>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, h } from "vue";
import { mainStore } from "@/store";
import { ElMessage } from "element-plus";
import { Error } from "@icon-park/vue-next";
import { getRandomPicH, getRandomPicV } from "../utils/random";

const store = mainStore();
const bgUrl = ref("");
const imgTimeout = ref(null);
const emit = defineEmits(["loadComplete"]);

// 状态控制
const retryQueue = ref([]); // 当前尝试的地址队列
const retryIndex = ref(0);  // 当前尝试到第几个
const bgRandom = Math.floor(Math.random() * 10 + 1); // 随机本地图编号

/**
 * 核心：触发背景切换
 * @param {Number} type 壁纸类型
 */
const changeBg = (type) => {
  // 清除之前的状态，防止竞态冲突
  retryIndex.value = 0;
  
  if (type == 0) {
    retryQueue.value = [`/images/background${bgRandom}.jpg`];
  } else if (type == 1) {
    retryQueue.value = [
      "https://bing.img.run/1920x1080.php",
      "https://api.vvhan.com/api/bing",
    ];
  } else if (type == 2) {
    retryQueue.value = [
      "https://api.vvhan.com/api/wallpaper/views",
      "https://bing.img.run/rand.php",
    ];
  } else if (type == 3) {
    retryQueue.value = [
      getP2xRandom(),
      "https://api.mtyqx.cn/api/random.php",
      "https://api.r10086.com/樱道随机图片api接口.php?自适应图片系列=原神",
    ];
  }
  
  loadCurrentUrl();
};

// 拼接时间戳并赋值给 img 标签
const loadCurrentUrl = () => {
  const rawUrl = retryQueue.value[retryIndex.value];
  if (!rawUrl) return;
  
  // 如果是本地图片，不加时间戳（防止某些环境路径解析失败）
  if (rawUrl.startsWith("/")) {
    bgUrl.value = rawUrl;
  } else {
    const connector = rawUrl.includes("?") ? "&" : "?";
    bgUrl.value = `${rawUrl}${connector}t=${Date.now()}`;
  }
};

// 图片加载成功
const onImgLoad = () => {
  clearTimeout(imgTimeout.value);
  imgTimeout.value = setTimeout(() => {
    store.setImgLoadStatus(true);
  }, Math.floor(Math.random() * 301) + 300); // 300-600ms 随机延迟，增加动效平滑度
};

// 图片加载失败（核心逻辑：自动重试）
const onImgError = () => {
  // 1. 如果当前已经是最后一张（本地图）还报错，停止重试，防止死循环
  if (bgUrl.value.includes(`/images/background${bgRandom}.jpg`)) {
    console.error("所有图源均失效，包括本地图");
    return;
  }

  retryIndex.value++;

  if (retryIndex.value < retryQueue.value.length) {
    // 2. 还有备用地址，继续尝试
    console.warn("当前图源失效，正在尝试备用地址...");
    ElMessage({
      message: "当前图源失效，正在尝试备用地址",
      icon: h(Error, { theme: "filled", fill: "#efefef" }),
    });
    loadCurrentUrl();
  } else {
    // 3. 全部备用地址都失败了，强制切回本地
    console.error("所有图源加载失败，回退到本地默认图");
    ElMessage({
      message: "图源加载失败，已切换回默认",
      icon: h(Error, { theme: "filled", fill: "#efefef" }),
    });
    bgUrl.value = `/images/background${bgRandom}.jpg`;
  }
};

// 动画结束
const onAnimationEnd = () => {
  emit("loadComplete");
};

// 工具：获取自适应图源
const getP2xRandom = () => {
  const isH = window.innerWidth >= window.innerHeight;
  return isH ? getRandomPicH() : getRandomPicV();
};

// 响应式监听
let resizeTimer = null;
let lastIsH = window.innerWidth >= window.innerHeight;

const onResize = () => {
  if (store.coverType != 3) return;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const nowIsH = window.innerWidth >= window.innerHeight;
    if (nowIsH !== lastIsH) {
      lastIsH = nowIsH;
      changeBg(3);
    }
  }, 300);
};

// 监听类型切换
watch(() => store.coverType, (val) => changeBg(val));

// 生命周期
onMounted(() => {
  window.addEventListener("resize", onResize);
  changeBg(store.coverType);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  clearTimeout(imgTimeout.value);
  clearTimeout(resizeTimer);
});
</script>

<style lang="scss" scoped>
.cover {
  position: absolute;
  inset: 0; // 现代写法代替 top/left/width/height
  transition: 0.25s;
  z-index: -1;

  &.show {
    z-index: 1;
  }

  .bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    filter: blur(20px) brightness(0.3);
    transition: filter 0.3s, transform 0.3s;
    animation: fade-blur-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: 0.45s;
  }

  .gray {
    opacity: 1;
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);
    transition: 1.5s;

    &.hidden {
      opacity: 0;
    }
  }

  .down {
    font-size: 16px;
    color: white;
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 26px; // 调整了高度，原代码 height+display 有冲突
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s;
    text-decoration: none;

    &:hover {
      transform: translateX(-50%) scale(1.05);
      background-color: rgba(0, 0, 0, 0.4);
    }

    &:active {
      transform: translateX(-50%) scale(0.95);
    }
  }
}
</style>