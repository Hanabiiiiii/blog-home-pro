<template>
  <div :class="store.backgroundShow ? 'cover show' : 'cover'">
    <img
      v-show="store.imgLoadStatus"
      :src="bgUrl"
      class="bg"
      alt="cover"
      @load="imgLoadComplete"
      @error="imgLoadError"
      @animationend="imgAnimationEnd"
    />
    <div :class="store.backgroundShow ? 'gray hidden' : 'gray'" />
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
import { mainStore } from "@/store";
import { h, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { Error } from "@icon-park/vue-next";

const store = mainStore();
const bgUrl = ref(null);
const imgTimeout = ref(null);
const emit = defineEmits(["loadComplete"]);

// 随机本地图背景
const bgRandom = Math.floor(Math.random() * 10 + 1);

// 主备图源尝试机制
const tryUrls = ref([]);
const currentTryIndex = ref(0);

const trySetBg = (urls) => {
  tryUrls.value = urls;
  currentTryIndex.value = 0;
  tryLoadUrl();
};

const tryLoadUrl = () => {
  const url = tryUrls.value[currentTryIndex.value];
  const img = new Image();
  img.onload = () => {
    bgUrl.value = url;
  };
  img.onerror = () => {
    currentTryIndex.value++;
    if (currentTryIndex.value < tryUrls.value.length) {
      tryLoadUrl(); // 尝试下一个接口
    } else {
      // 全部失败，使用本地默认图
      bgUrl.value = `/images/background${bgRandom}.jpg`;
    }
  };
  img.src = url;
};

// 更换壁纸逻辑
const changeBg = (type) => {
  if (type == 0) {
    bgUrl.value = `/images/background${bgRandom}.jpg`;
  } else if (type == 1) {
    // Bing 高清壁纸
    trySetBg([
      "https://bing.img.run/1920x1080.php",
      "https://api.xsot.cn/bing?jump=true",
    ]);
  } else if (type == 2) {
    // Bing 随机壁纸
    trySetBg([
      "https://bing.img.run/rand.php",
      "https://api.btstu.cn/sjbz/api.php?lx=fengjing&format=images",
    ]);
  } else if (type == 3) {
    // 动漫类壁纸
    trySetBg([
      "https://api.btstu.cn/sjbz/api.php?lx=dongman&format=images",
      "https://api.mtyqx.cn/api/random.php",
    ]);
  }
};

// 图片加载完成
const imgLoadComplete = () => {
  imgTimeout.value = setTimeout(() => {
    store.setImgLoadStatus(true);
  }, Math.floor(Math.random() * (600 - 300 + 1)) + 300);
};

// 动画完成
const imgAnimationEnd = () => {
  console.log("壁纸加载且动画完成");
  emit("loadComplete");
};

// 图片加载失败提示（无需再切换 bgUrl）
const imgLoadError = () => {
  console.error("壁纸加载失败，尝试备用地址中：", tryUrls.value[currentTryIndex.value]);
  ElMessage({
    message: "壁纸加载失败，正在尝试备用地址...",
    icon: h(Error, { theme: "filled", fill: "#efefef" }),
  });
};

// 监听壁纸类型切换
watch(
  () => store.coverType,
  (value) => {
    changeBg(value);
  }
);

// 初始加载
onMounted(() => {
  changeBg(store.coverType);
});

// 清理超时
onBeforeUnmount(() => {
  clearTimeout(imgTimeout.value);
});
</script>

<style lang="scss" scoped>
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: 0.25s;
  z-index: -1;

  &.show {
    z-index: 1;
  }

  .bg {
    position: absolute;
    left: 0;
    top: 0;
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
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);
    transition: 1.5s;

    &.hidden {
      opacity: 0;
      transition: 1.5s;
    }
  }

  .down {
    font-size: 16px;
    color: white;
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: block;
    padding: 20px 26px;
    border-radius: 8px;
    background-color: #00000030;
    width: 120px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      transform: scale(1.05);
      background-color: #00000060;
    }

    &:active {
      transform: scale(1);
    }
  }
}
</style>
