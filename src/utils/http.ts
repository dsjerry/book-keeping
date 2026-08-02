import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Config from 'react-native-config'
import { logging } from './logger'
import { Auth } from '../api/auth'

// 默认配置
const DEFAULT_TIMEOUT = 30000 // 30秒超时

export const TOKEN_KEY = 'token'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
  success: boolean
  timestamp: string
}

const STATUS_MESSAGES: Record<number, string> = {
  // 4xx 客户端错误
  400: '请求参数校验失败',
  401: '身份验证失败',
  403: '无权限访问资源',
  404: '资源不存在',
  409: '资源冲突',
  422: '实体校验失败',
  // 5xx 服务端错误
  500: '服务器内部错误',
  502: '上游服务不可用',
  503: '服务暂时不可用',
  504: '网关请求超时',
}

class HttpClient {
  private instance: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = Config.API_URL || 'http://127.0.0.1:3031'

    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      async config => {
        const token = await Auth.getToken()
        if (token && config.headers) {
          config.headers.Authorization = 'Bearer ' + token.access_token
        }
        return config
      },
      error => {
        logging.error('[REQ] ' + this.baseURL, error)
        return Promise.reject(error)
      },
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data
      },
      error => {
        const normalized = this.toErrorResponse(error)
        logging.error('[RES]', normalized.message, normalized.code)
        return Promise.reject(error)
      },
    )
  }

  /**
   * 将请求失败归一化为与成功响应同结构的 ApiResponse，
   * 调用方统一通过 `success` 判断结果，通过 `message` 展示错误。
   */
  private toErrorResponse<T>(error: unknown): ApiResponse<T> {
    const axiosError = error as AxiosError<ApiResponse>
    const status = axiosError.response?.status
    const data = axiosError.response?.data
    return {
      code: status || 0,
      data: (data?.data as T) ?? (null as unknown as T),
      message:
        data?.message ||
        STATUS_MESSAGES[status || 0] ||
        '网络连接失败，请稍后重试',
      success: false,
      timestamp: new Date().toISOString(),
    }
  }

  // GET请求
  public async get<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      return await this.instance.get(url, { params, ...config })
    } catch (error) {
      return this.toErrorResponse<T>(error)
    }
  }

  // POST请求
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      return await this.instance.post(url, data, config)
    } catch (error) {
      return this.toErrorResponse<T>(error)
    }
  }

  // PUT请求
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      return await this.instance.put(url, data, config)
    } catch (error) {
      return this.toErrorResponse<T>(error)
    }
  }

  // DELETE请求
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      return await this.instance.delete(url, config)
    } catch (error) {
      return this.toErrorResponse<T>(error)
    }
  }

  // 上传文件
  public async upload<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const uploadConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    }

    try {
      return await this.instance.post(url, formData, uploadConfig)
    } catch (error) {
      return this.toErrorResponse<T>(error)
    }
  }

  // 下载文件
  public async download(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<Blob> {
    const downloadConfig: AxiosRequestConfig = {
      responseType: 'blob',
      ...config,
    }

    const response = await this.instance.get(url, downloadConfig)
    return response as unknown as Blob
  }
}

// 创建并导出HTTP客户端实例
const http = new HttpClient()
export default http
