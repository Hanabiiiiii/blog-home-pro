<template>
  <div class="weather">
    <template v-if="loading">
      <span>加载中...</span>
    </template>
    <template v-else-if="weatherData.city && weatherData.weather.weather">
      <span>{{ weatherData.city }}&nbsp;</span>
      <span>{{ weatherData.weather.weather }}&nbsp;</span>
      <span>{{ weatherData.weather.temperature }}℃</span>
      <span class="sm-hidden">
        &nbsp;{{ formatWindDirection(weatherData.weather.winddirection) }}&nbsp;
      </span>
      <span class="sm-hidden">{{ weatherData.weather.windpower }}级</span>
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
import { getLocationByIP, getNowWeather } from '@/api'

// 天气数据加载状态
const loading = ref(true)

// 天气数据
const weatherData = reactive({
  city: null,
  adcode: null,
  weather: {
    weather: null,
    temperature: null,
    winddirection: null,
    windpower: null
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

    // 通过 Worker 获取 IP 定位
    const location = await getLocationByIP()
    weatherData.city = location.city || '当前位置'
    weatherData.adcode = location.adcode || '131'
    // console.log('定位信息:', location)

    // 通过 Worker 获取当前天气
    const weather = await getNowWeather(weatherData.adcode)
    weatherData.weather = {
      weather: weather.text,
      temperature: weather.temp,
      winddirection: weather.windDir,
      windpower: weather.windScale ? weather.windScale.replace('级', '') : '--'
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
