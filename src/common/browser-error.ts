export interface BrowserError {
  message: string
  stack?: string
  timestamp: string
  url: string
  userAgent: string
  type: 'error' | 'unhandledRejection'
}
