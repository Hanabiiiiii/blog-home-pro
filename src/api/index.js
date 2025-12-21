/*
 * @Descripttion: 
 * @version: 
 * @Author: Hanbaka
 * @Date: 2024-07-04 20:37:45
 * @LastEditors: Hanbaka
 * @LastEditTime: 2024-12-02 16:30:26
 */
// import axios from "axios";
import fetchJsonp from "fetch-jsonp";
// import fs from 'fs';  // 用于读写文件
// import path from 'path';  // 用于文件路径操作
/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
  );
  const data = await res.json();

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */


// 获取一言数据
// export const getHitokoto = async () => {
//   const res = await fetch("https://v1.hitokoto.cn/?c=b");
//   return await res.json();
// };

/**
 * 天气
 */

// utils/api.js
/**
 * 封装fetch请求
 * @param {string} url 
 * @param {object} options 
 * @returns {Promise}
 */

// 获取教书先生天气 API
// https://api.oioweb.cn/doc/weather/GetWeather
// export const getOtherWeather = async () => {
//   const res = await fetch("https://api.oioweb.cn/api/weather/GetWeather");
//   return await res.json();
// };


// 百度地图API封装
// api/index.js
const WORKER_BASE_URL = 'https://weather.fwneko.com'; // 你的 Worker 地址

// 获取用户 IP 定位
export const getLocationByIP = async () => {
  const res = await fetch(`${WORKER_BASE_URL}/api/location`);
  const data = await res.json();

  if (data.status !== 0 || !data.content?.address_detail) {
    throw new Error('IP定位失败');
  }

  return {
    city: data.content.address_detail.city,
    district: data.content.address_detail.district,
    adcode: data.content.address_detail.adcode,
    cityCode: data.content.address_detail.city_code,
    point: data.content.point
  };
};

// 获取当前天气
export const getNowWeather = async (districtId) => {
  const res = await fetch(`${WORKER_BASE_URL}/api/weather?district_id=${districtId}`);
  const data = await res.json();

  if (data.status !== 0 || !data.result || !data.result.now) {
    throw new Error(data.message || '天气查询失败或数据格式不完整');
  }

  const now = data.result.now;
  return {
    text: now.text,
    temp: now.temp,
    windDir: now.wind_dir,
    windScale: now.wind_class
  };
};

