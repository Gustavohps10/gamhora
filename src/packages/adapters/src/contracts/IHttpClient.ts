import { AppError, Either } from '@pandhora/shared/helpers'
import { AxiosRequestConfig } from 'axios'

export interface IHttpClientConfig {
  baseURL: string
  params?: Record<string, string>
  headers?: Record<string, string>
  timeout?: number
}

export interface IHttpClient {
  configure(config: IHttpClientConfig): void
  get<T>(url: string, config?: AxiosRequestConfig): Promise<Either<AppError, T>>
  post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>>
  put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>>
  patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>>
  delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<Either<AppError, T>>
}
