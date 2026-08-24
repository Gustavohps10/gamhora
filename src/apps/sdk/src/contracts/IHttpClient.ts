export interface IHttpClientConfig {
  baseURL: string
  params?: Record<string, string>
  headers?: Record<string, string>
  timeout?: number
}

export interface IHttpClient {
  configure(config: IHttpClientConfig): void
  get<T>(url: string, config?: unknown): Promise<any>
  post<T>(url: string, data?: unknown, config?: unknown): Promise<any>
  put<T>(url: string, data?: unknown, config?: unknown): Promise<any>
  patch<T>(url: string, data?: unknown, config?: unknown): Promise<any>
  delete<T>(url: string, config?: unknown): Promise<any>
}
