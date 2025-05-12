import http, { ApiResponse } from '../utils/http';

// 用户相关接口
export interface User {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    // 其他用户属性
}

export interface LoginParams {
    username: string;
    password: string;
}

export interface RegisterParams extends LoginParams {
    email?: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

// 用户API
export const userApi = {
    // 登录
    login: (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
        return http.post('/auth/login', params);
    },

    // 注册
    register: (params: RegisterParams): Promise<ApiResponse<LoginResponse>> => {
        return http.post('/auth/register', params);
    },

    // 获取用户信息
    getProfile: (): Promise<ApiResponse<User>> => {
        return http.get('/user/profile');
    },

    // 更新用户信息
    updateProfile: (data: Partial<User>): Promise<ApiResponse<User>> => {
        return http.put('/user/profile', data);
    },
};