import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const service: AxiosInstance = axios.create({
    baseURL: '',
    timeout: 5000
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 从localStorage获取token，添加到请求头
        const token = localStorage.getItem('vuems_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.status === 200) {
            return response.data;
        } else {
            return Promise.reject();
        }
    },
    (error: AxiosError) => {
        // 处理401错误，清除token并跳转到登录页
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('vuems_token');
            localStorage.removeItem('vuems_name');
            window.location.href = '/#/login';
        }
        console.log(error);
        return Promise.reject(error);
    }
);

export default service;
