import request from '../utils/request';

/**
 * 定义API响应接口
 */
export interface AuthApiResponse<T = any> {
    code: number;
    data: T;
    message: string;
}

/**
 * 登录参数接口
 */
export interface LoginParams {
    username: string;
    password: string;
}

/**
 * 登录响应数据接口
 */
export interface LoginResult {
    token: string;
    userInfo: {
        id: number;
        username: string;
        avatar: string;
        nickname: string;
        email: string;
    };
}

/**
 * 用户信息接口
 */
export interface UserInfo {
    id: number;
    username: string;
    avatar: string;
    nickname: string;
    email: string;
    roles: string[];
}

/**
 * 用户登录
 * @param data 登录参数
 * @returns Promise
 */
export function apiLogin(data: LoginParams): Promise<AuthApiResponse<LoginResult>> {
    return request({
        url: '/api/auth/login',
        method: 'post',
        data
    });
}

/**
 * 获取用户信息
 * @returns Promise
 */
export function apiGetUserInfo(): Promise<AuthApiResponse<UserInfo>> {
    return request({
        url: '/api/auth/info',
        method: 'get'
    });
}

/**
 * 退出登录
 * @returns Promise
 */
export function apiLogout(): Promise<AuthApiResponse<null>> {
    return request({
        url: '/api/auth/logout',
        method: 'post'
    });
} 