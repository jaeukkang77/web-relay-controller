/**
 * API 에러 클래스.
 * { success: false, error: { code, message } } 응답을 JS Error로 변환.
 */
export class ApiError extends Error {
  readonly code:   string
  readonly status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name   = 'ApiError'
    this.code   = code
    this.status = status
  }
}
