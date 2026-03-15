export const ErrorCode = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  IP_BLOCKED:          'IP_BLOCKED',
  TOKEN_EXPIRED:       'TOKEN_EXPIRED',
  TOKEN_INVALID:       'TOKEN_INVALID',
  TOKEN_REUSED:        'TOKEN_REUSED',
  UNAUTHORIZED:        'UNAUTHORIZED',
  FORBIDDEN:           'FORBIDDEN',
  // Common
  NOT_FOUND:           'NOT_FOUND',
  CONFLICT:            'CONFLICT',
  BAD_REQUEST:         'BAD_REQUEST',
  // Region
  DUPLICATE_NAME:      'DUPLICATE_NAME',
  UPLOAD_FAILED:       'UPLOAD_FAILED',
  // User
  DUPLICATE_ID:        'DUPLICATE_ID',
  SELF_DELETE:         'SELF_DELETE',
  // Device
  MODBUS_ERROR:        'MODBUS_ERROR',
  // Schedule
  SCHEDULE_TIME_REQUIRED: 'SCHEDULE_TIME_REQUIRED',
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];
