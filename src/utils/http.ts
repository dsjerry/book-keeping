import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Config from 'react-native-config'
import { logging } from './logger'
import { Auth, Token } from '../api/auth'

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
  private origin: string

  constructor() {
    // 服务端已启用 URI 版本控制，所有路由挂在 /v1 下（与 server 的 enableVersioning 对应）
    const origin = (Config.API_URL || 'http://127.0.0.1:3031').replace(/\/+$/, '')
    this.baseURL = `${origin}/v1`
    // 记录不带版本前缀的源站地址：拼接文件下载等相对 URL 时使用
    this.origin = origin

    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /** 源站地址（不含 /v1），用于把服务端返回的相对文件地址拼成绝对 URL */
  getOrigin() {
    return this.origin
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
      async error => {
        const original = error?.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined
        // 401 = access token 过期：用 refresh_token 换新 token 并重放原请求（只重试一次防止循环）
        if (error?.response?.status === 401 && original && !original._retry) {
          const token = await Auth.getToken()
          if (token?.refresh_token) {
            const refreshed = await this.refreshToken(token.refresh_token)
            if (refreshed) {
              original._retry = true
              original.headers = { ...original.headers, Authorization: 'Bearer ' + refreshed.access_token }
              return this.instance.request(original)
            }
          }
          // 刷新也失败：凭证已彻底过期，清除后由调用方按未登录处理
          await Auth.removeToken()
        }
        const normalized = this.toErrorResponse(error)
        logging.error('[RES]', normalized.message, normalized.code)
        return Promise.reject(error)
      },
    )
  }

  /**
   * 用 refresh_token 换新的 token 对。
   * 走独立 axios 实例（不经过本类的拦截器），避免刷新请求自身 401 时递归。
   */
  private async refreshToken(refreshToken: string): Promise<Token | null> {
    try {
      const res = await axios.post<ApiResponse<Token>>(`${this.baseURL}/auth/refresh`, { refreshToken }, {
        timeout: DEFAULT_TIMEOUT,
      })
      const data = res.data?.data
      if (res.data?.success && data?.access_token) {
        await Auth.saveToken(data)
        return data
      }
      return null
    } catch (error) {
      logging.error('[AUTH] 刷新 token 失败', error)
      return null
    }
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

  // PATCH请求
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      return await this.instance.patch(url, data, config)
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
