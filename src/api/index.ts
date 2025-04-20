import axios from 'axios';
import { ElMessage } from 'element-plus';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from './article';

// 配置axios默认值
axios.defaults.timeout = 10000; // 超时时间
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';

// 请求拦截器
axios.interceptors.request.use(
  config => {
    // 可以在这里添加token等请求头
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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
    console.log('响应数据:', response.data);
    
    // 直接返回响应数据，不做额外处理
    return response.data;
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
          // 可以在这里处理登录过期逻辑
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
export * from './article';

export default axios;
