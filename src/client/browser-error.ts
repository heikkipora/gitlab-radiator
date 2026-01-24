import type {BrowserError} from '../common/browser-error'
import type {Socket} from 'socket.io-client'

export function setupErrorLogger(socket: Socket) {
  const errorHandler = (event: ErrorEvent) => socket.emit('browserError', fromErrorEvent(event))
  const rejectionHandler = (event: PromiseRejectionEvent) => socket.emit('browserError', fromRejectionEvent(event))

  window.addEventListener('error', errorHandler)
  window.addEventListener('unhandledrejection', rejectionHandler)

  return () => {
    window.removeEventListener('error', errorHandler)
    window.removeEventListener('unhandledrejection', rejectionHandler)
  }
}

function fromErrorEvent(event: ErrorEvent): BrowserError {
  return {
    message: event.message,
    stack: event.error?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    type: 'error'
  }
}

function fromRejectionEvent(event: PromiseRejectionEvent): BrowserError {
  return {
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    type: 'unhandledRejection'
  }
}