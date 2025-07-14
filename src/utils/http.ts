import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { logging } from './logger';
import { Auth } from '../api/auth';

// 默认配置
const DEFAULT_TIMEOUT = 30000; // 30秒超时

export const TOKEN_KEY = 'token';

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

class HttpClient {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = Config.API_URL || 'http://127.0.0.1:3031';

    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await Auth.getToken();
        if (token && config.headers) {
          config.headers.Authorization = 'Bearer ' + token.access_token;
        }
        return config;
      },
      (error) => {
        logging.error('[REQ] ' + this.baseURL, error)
        return Promise.reject(error);
      },
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error: AxiosError<ApiResponse>) => {
        logging.error('[RES]');
        logging.error(error.response?.data)
        logging.error(error.response?.data.data)

        return Promise.reject(error.response?.data);
      }
    );
  }

  private getErrorMessage(status: number, data: any): string {
    if (data && data.message) {
      return data.message;
    }

    const statusMessages: Record<number, string> = {
      // 4xx 客户端错误
      400: '请求参数校验失败',          // BadRequestException
      401: '身份验证失败',             // UnauthorizedException 
      403: '无权限访问资源',           // ForbiddenException
      404: '资源不存在',              // NotFoundException
      409: '资源冲突',               // ConflictException
      422: '实体校验失败',            // UnprocessableEntityException

      // 5xx 服务端错误
      500: '服务器内部错误',           // 未捕获的异常
      502: '上游服务不可用',
      503: '服务暂时不可用',           // 维护模式
      504: '网关请求超时'
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
