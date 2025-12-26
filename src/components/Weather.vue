<template>
  <div class="weather">
    <template v-if="loading">
      <span>加载中...</span>
    </template>
    <template v-else-if="weatherData.city && weatherData.weather.text">
      <span>{{ weatherData.city }}&nbsp;</span>
      <span>{{ weatherData.weather.text }}&nbsp;</span>
      <span>{{ weatherData.weather.temperature }}℃</span>
      <span class="sm-hidden">
        &nbsp;{{ formatWindDirection(weatherData.weather.windDirection) }}&nbsp;
      </span>
      <span class="sm-hidden">{{ weatherData.weather.windPower }}级</span>
    </template>
    <template v-else>
      <span>天气数据获取失败</span>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue'
import { ElMessage } from 'element-plus'
import { Error } from '@icon-park/vue-next'
import {  getNowWeather } from '@/api'

// 天气数据加载状态
const loading = ref(true)

// 天气数据
const weatherData = reactive({
  city: null,
  weather: {
    text: null,
    temperature: null,
    windDirection: null,
    windPower: null
  }
})

// 格式化风向（确保显示“风”字）
const formatWindDirection = (dir) => {
  return dir?.endsWith('风') ? dir : `${dir}风`
}

// 获取天气数据
const getWeatherData = async () => {
  try {
    loading.value = true

    // 直接从 Worker 获取天气（Worker 内部已做定位）
    const weather = await getNowWeather()

    weatherData.city = weather.city || '未知地区'
    weatherData.weather = {
      text: weather.text,
      temperature: weather.temp,
      windDirection: weather.windDir,
      windPower: weather.windScale
        ? weather.windScale.replace('级', '')
        : '--'
    }

  } catch (error) {
    console.error('天气获取失败:', error)
    onError(error?.message || '天气服务不可用')
  } finally {
    loading.value = false
  }
}


// 弹窗错误提示
const onError = (message) => {
  ElMessage({
    message,
    icon: h(Error, { theme: 'filled', fill: '#efefef' }),
    type: 'error'
  })
}

// 页面挂载时获取天气
onMounted(getWeatherData)
</script>
