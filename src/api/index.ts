import axios from 'axios';
import { ElMessage } from 'element-plus';
import type { AxiosResponse } from 'axios';
import type { AuthApiResponse } from './auth';

// 配置axios默认值
axios.defaults.timeout = 10000; // 超时时间
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
axios.defaults.baseURL = ''; // 清空baseURL，使用request.ts中的配置

// 请求拦截器
axios.interceptors.request.use(
  config => {
    // 添加token到请求头
    const token = localStorage.getItem('vuems_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('axios全局请求添加了Authorization头', config.url);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    // 添加详细日志
    console.log('响应拦截器收到响应:', response.status, response.config.url);
    
    const res = response.data;
    
    // 如果响应中包含错误码
    if (res.code && res.code !== 200) {
      // 未登录或token过期
      if (res.code === 401) {
        ElMessage.error(res.message || '未登录或登录已过期，请重新登录');
        localStorage.removeItem('vuems_token');
        localStorage.removeItem('vuems_name');
        localStorage.removeItem('vuems_user');
        
        window.location.href = '/#/login';
        return Promise.reject(new Error(res.message));
      }
      
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '未知错误'));
    }
    
    // 直接返回响应数据
    return res;
  },
  error => {
    console.error('响应拦截器捕获错误:', error);
    
    const { response } = error;
    if (response) {
      console.error('错误响应状态码:', response.status);
      console.error('错误响应数据:', response.data);
      
      // 根据状态码处理错误
      switch (response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录');
          // 处理登录过期逻辑
          localStorage.removeItem('vuems_token');
          localStorage.removeItem('vuems_name');
          localStorage.removeItem('vuems_user');
          window.location.href = '/#/login';
          break;
        case 403:
          ElMessage.error('拒绝访问');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器错误');
          break;
        default:
          ElMessage.error(`连接错误 ${response.status}`);
      }
    } else {
      ElMessage.error('网络连接异常，请稍后重试');
    }
    return Promise.reject(error);
  }
);

// 导出所有API
export * from './auth';
export * from './article';

export default axios;
