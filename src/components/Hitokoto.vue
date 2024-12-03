<template>
  <div class="hitokoto cards" v-show="!store.musicOpenState" @mouseenter="openMusicShow = true"
    @mouseleave="openMusicShow = false" @click.stop>
    <!-- 打开音乐面板 -->
    <Transition name="el-fade-in-linear">
      <div class="open-music" v-show="openMusicShow && store.musicIsOk" @click="store.musicOpenState = true">
        <music-menu theme="filled" size="18" fill="#efefef" />
        <span>打开音乐播放器</span>
      </div>
    </Transition>
    <!-- 一言内容 -->
    <Transition name="el-fade-in-linear" mode="out-in">
      <div :key="hitokotoData.text" class="content" @click="updateHitokoto">
        <span class="text">{{ hitokotoData.text }}</span>
        <span class="from">-「&nbsp;{{ hitokotoData.from }}&nbsp;」</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { MusicMenu, Error, Success } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import debounce from "@/utils/debounce.js";

const store = mainStore();

// 开启音乐面板按钮显隐
const openMusicShow = ref(false);

// 一言数据
const hitokotoData = reactive({
  text: "这里应该显示一句话",
  from: "花火",
});

// 保存一言数据到 localStorage
const saveLocalHitokoto = async (hitokoto) => {
  try {
    const existingData = JSON.parse(localStorage.getItem("hitokotoData")) || [];
    if (!existingData.find((item) => item.id === hitokoto.id)) {
      existingData.push(hitokoto);
      if (existingData.length > 20) {
        existingData.shift();
      }
      localStorage.setItem("hitokotoData", JSON.stringify(existingData));
    }
  } catch (error) {
    console.error("保存一言数据失败", error);
  }
};

// 从 localStorage 加载一言数据
const loadLocalHitokoto = () => {
  try {
    const data = JSON.parse(localStorage.getItem("hitokotoData"));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("加载本地一言数据失败", error);
    return [];
  }
};

const getHitokotoData = async () => {
  try {
    const response = await fetch("https://v1.hitokoto.cn/?c=b");
    if (!response.ok) {
      throw new Error("接口返回失败");
    }
    const result = await response.json();

    hitokotoData.text = result.hitokoto;
    hitokotoData.from = result.from || "未知";

    await saveLocalHitokoto({
      id: result.id,
      text: result.hitokoto,
      from: result.from || "未知",
    });
  } catch (error) {
    console.log("获取一言数据失败，尝试加载历史记录");

    const localData = loadLocalHitokoto();
    if (localData.length > 0) {
      const randomIndex = Math.floor(Math.random() * localData.length);
      const fallback = localData[randomIndex];
      hitokotoData.text = fallback.text;
      hitokotoData.from = fallback.from;
      console.log("历史记录加载成功");
    } else {
      hitokotoData.text = "这里应该显示一句话";
      hitokotoData.from = "花火";
      console.log("本地历史记录加载失败");
    }
  }
};


// 防抖更新一言数据
const updateHitokoto = () => {
  // 防抖
  debounce(() => {
    getHitokotoData();
  }, 500);
};

onMounted(() => {
  getHitokotoData();
});
</script>


<style lang="scss" scoped>
.hitokoto {
  width: 100%;
  height: 100%;
  padding: 20px;
  animation: fade 0.5s;

  .open-music {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #00000026;
    padding: 4px 0;
    border-radius: 8px 8px 0 0;

    .i-icon {
      width: 18px;
      height: 18px;
      display: block;
      margin-right: 8px;
    }

    span {
      font-size: 0.95rem;
    }
  }

  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    .text {
      font-size: 1.1rem;
      word-break: break-all;
      text-overflow: ellipsis;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    .from {
      margin-top: 10px;
      font-weight: bold;
      align-self: flex-end;
      font-size: 1.1rem;
    }
  }
}
</style>
