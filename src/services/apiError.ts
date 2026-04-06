// ============================================================================
// ApiError Class
// ============================================================================

export class ApiError extends Error {
  statusCode: number;
  endpoint: string;
  method: string;

  constructor(
    message: string,
    statusCode: number,
    endpoint: string,
    method: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.method = method;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Handle API errors and convert to ApiError
 */
export function handleApiError(
  error: unknown,
  endpoint: string,
  method: string
): ApiError {
  // Network error or fetch abortion
  if (error instanceof TypeError) {
    return new ApiError('네트워크 오류가 발생했습니다', 0, endpoint, method);
  }

  // Timeout error
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError('요청 시간이 초과되었습니다', 408, endpoint, method);
  }

  // Already ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Generic error
  if (error instanceof Error) {
    return new ApiError(error.message, 500, endpoint, method);
  }

  // Unknown error
  return new ApiError('알 수 없는 오류가 발생했습니다', 500, endpoint, method);
}

/**
 * Check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Get user-friendly error message from error object
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return getProductionErrorMessage(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다';
}

/**
 * Get production-safe error message (no sensitive details)
 */
export function getProductionErrorMessage(error: ApiError): string {
  const isDevelopment = import.meta.env.MODE === 'development';

  // In development, return full error message
  if (isDevelopment) {
    return `${error.message} (${error.method} ${error.endpoint} - ${error.statusCode})`;
  }

  // In production, return generic message based on status code
  switch (error.statusCode) {
    case 0:
      return '네트워크 연결을 확인해주세요';
    case 400:
      return '잘못된 요청입니다';
    case 401:
      return '로그인이 필요합니다';
    case 403:
      return '접근 권한이 없습니다';
    case 404:
      return '요청한 데이터를 찾을 수 없습니다';
    case 408:
      return '요청 시간이 초과되었습니다';
    case 409:
      return '데이터 충돌이 발생했습니다';
    case 422:
      return '입력 데이터를 확인해주세요';
    case 429:
      return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요';
    case 500:
    case 502:
    case 503:
    case 504:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요';
    default:
      return '오류가 발생했습니다';
  }
}

/**
 * Get HTTP status code from error
 */
export function getStatusCode(error: unknown): number {
  if (isApiError(error)) {
    return error.statusCode;
  }
  return 500;
}
