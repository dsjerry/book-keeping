import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Config from 'react-native-config';

// 默认配置
const DEFAULT_TIMEOUT = 30000; // 30秒超时
const TOKEN_KEY = 'auth_token';

// 响应数据接口
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

// 创建HTTP实例
class HttpClient {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    // 从环境变量获取API基础URL，如果没有则使用默认值
    this.baseURL = Config.API_URL || 'https://api.example.com';
    
    // 创建axios实例
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Platform': Platform.OS,
        'X-App-Version': Config.APP_VERSION || '1.0.0',
      },
    });

    // 初始化拦截器
    this.setupInterceptors();
  }

  // 配置请求和响应拦截器
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      async (config) => {
        // 从AsyncStorage获取token并添加到请求头
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 直接返回响应数据
        return response.data;
      },
      (error: AxiosError) => {
        // 处理错误响应
        if (error.response) {
          // 服务器返回了错误状态码
          const status = error.response.status;
          
          // 处理401未授权错误（token过期或无效）
          if (status === 401) {
            // 清除本地token
            AsyncStorage.removeItem(TOKEN_KEY);
            // 这里可以添加重定向到登录页面的逻辑
          }
          
          // 返回错误信息
          return Promise.reject({
            code: status,
            message: this.getErrorMessage(status, error.response.data),
            data: null,
            success: false
          });
        } else if (error.request) {
          // 请求已发出但没有收到响应
          return Promise.reject({
            code: -1,
            message: '网络请求失败，请检查网络连接',
            data: null,
            success: false
          });
        } else {
          // 请求配置出错
          return Promise.reject({
            code: -2,
            message: error.message || '请求配置错误',
            data: null,
            success: false
          });
        }
      }
    );
  }

  // 获取错误信息
  private getErrorMessage(status: number, data: any): string {
    // 可以根据后端API的错误格式自定义
    if (data && data.message) {
      return data.message;
    }
    
    // 常见HTTP状态码错误信息
    const statusMessages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '拒绝访问',
      404: '请求的资源不存在',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时',
    };
    
    return statusMessages[status] || `未知错误(${status})`;
  }

  // GET请求
  public async get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      return await this.instance.get(url, { params, ...config });
    } catch (error) {
      return error as ApiResponse<T>;
    }
  }

  // POST请求
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      return await this.instance.post(url, data, config);
    } catch (error) {
      return error as ApiResponse<T>;
    }
  }

  // PUT请求
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      return await this.instance.put(url, data, config);
    } catch (error) {
      return error as ApiResponse<T>;
    }
  }

  // DELETE请求
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      return await this.instance.delete(url, config);
    } catch (error) {
      return error as ApiResponse<T>;
    }
  }

  // 上传文件
  public async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const uploadConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    };
    
    try {
      return await this.instance.post(url, formData, uploadConfig);
    } catch (error) {
      return error as ApiResponse<T>;
    }
  }

  // 下载文件
  public async download(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    const downloadConfig: AxiosRequestConfig = {
      responseType: 'blob',
      ...config,
    };
    
    const response = await this.instance.get(url, downloadConfig);
    return response as unknown as Blob;
  }
}

// 创建并导出HTTP客户端实例
const http = new HttpClient();
export default http;
