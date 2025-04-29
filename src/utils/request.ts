import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

const service: AxiosInstance = axios.create({
    baseURL: '',
    timeout: 5000
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 从localStorage获取token，添加到请求头
        const token = localStorage.getItem('vuems_token');
        console.log('拦截器被调用，当前URL:', config.url);
        console.log('localStorage中的token:', token);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('请求添加了Authorization头:', config.url, 'Bearer ' + token);
        } else {
            console.log('请求未添加Authorization头，未找到token:', config.url);
        }
        return config;
    },
    (error: AxiosError) => {
        console.log('请求错误:', error);
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    (response: AxiosResponse) => {
        const res = response.data;
        
        // 如果后端直接返回了错误码，比如code=401
        if (res.code && res.code !== 200) {
            // 未登录或token过期
            if (res.code === 401) {
                ElMessage.error(res.message || '未登录或登录已过期，请重新登录');
                // 清除本地存储的登录信息
                localStorage.removeItem('vuems_token');
                localStorage.removeItem('vuems_name');
                localStorage.removeItem('vuems_user');
                
                // 重定向到登录页
                setTimeout(() => {
                    window.location.href = '/#/login';
                }, 1500);
                
                return Promise.reject(new Error(res.message || '未登录或登录已过期'));
            }
            
            // 其他业务错误
            ElMessage.error(res.message || '请求失败');
            return Promise.reject(new Error(res.message || '未知错误'));
        }
        
        // 正常返回数据
        return res;
    },
    (error: AxiosError) => {
        console.error('请求错误', error);
        
        // HTTP状态码错误处理
        if (error.response) {
            const status = error.response.status;
            
            switch (status) {
                case 401:
                    ElMessage.error('未授权，请重新登录');
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
                    ElMessage.error(`请求错误(${status})`);
            }
        } else {
            ElMessage.error('网络连接异常，请稍后重试');
        }
        
        return Promise.reject(error);
    }
);

export default service;
