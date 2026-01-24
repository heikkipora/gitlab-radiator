export interface BrowserError {
  message: string
  stack?: string
  timestamp: number
  url: string
  userAgent: string
  type: 'error' | 'unhandledRejection'
  line?: number
  column?: number
  source?: string
}
