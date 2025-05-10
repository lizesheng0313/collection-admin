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
            // 显示后端返回的错误信息
            ElMessage.error(res.message);
            
            // 未登录或token过期
            if (res.code === 401) {
                // 清除本地存储的登录信息
                localStorage.removeItem('vuems_token');
                localStorage.removeItem('vuems_name');
                localStorage.removeItem('vuems_user');
                
                // 重定向到登录页
                setTimeout(() => {
                    window.location.href = '/#/login';
                }, 1500);
            }
            
            // 仅拒绝Promise，不传递具体错误信息
            return Promise.reject();
        }
        
        // 正常返回数据
        return res;
    },
    (error: AxiosError) => {
        console.error('请求错误', error);
        
        // 处理HTTP错误
        if (error.response) {
            // 显示后端返回的错误信息
            const responseData = error.response.data as any;
            if (responseData && responseData.message) {
                ElMessage.error(responseData.message);
            }
            
            // 处理401未授权
            if (error.response.status === 401) {
                localStorage.removeItem('vuems_token');
                localStorage.removeItem('vuems_name');
                localStorage.removeItem('vuems_user');
                window.location.href = '/#/login';
            }
        } else {
            // 网络错误
            ElMessage.error('网络请求失败');
        }
        
        // 仅拒绝Promise，不传递具体错误信息
        return Promise.reject();
    }
);

export default service;
