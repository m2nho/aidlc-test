// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// API Endpoints
export const API_ENDPOINTS = {
  CUSTOMER_LOGIN: '/api/customer/login',
  CUSTOMER_MENUS: '/api/customer/menus',
  CUSTOMER_ORDERS: '/api/customer/orders',
  CUSTOMER_ORDER_HISTORY: '/api/customer/orders',
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  CART: 'customer_cart',
  AUTH: 'customer_auth',
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,
  NETWORK_DELAY_MS: 500, // Mock API delay
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  TOAST_DURATION_MS: 3000, // 3 seconds
  CART_EXPIRY_HOURS: 24,
  REQUEST_TIMEOUT_MS: 10000, // 10 seconds
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Order Status Labels (Korean)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: '대기 중',
  ACCEPTED: '접수됨',
  PREPARING: '준비 중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

// Order Status Colors
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
  AUTH_INVALID_CREDENTIALS: '테이블 번호 또는 비밀번호가 올바르지 않습니다.',
  AUTH_UNAUTHORIZED: '로그인이 필요합니다.',
  MENU_NOT_FOUND: '메뉴를 찾을 수 없습니다.',
  CART_EMPTY: '장바구니가 비어있습니다.',
  ORDER_CREATE_FAILED: '주문 생성에 실패했습니다.',
  VALIDATION_QUANTITY_MIN: '수량은 최소 1개 이상이어야 합니다.',
  VALIDATION_QUANTITY_MAX: '수량은 최대 99개까지 가능합니다.',
  VALIDATION_TABLE_NUMBER: '올바른 테이블 번호를 입력해주세요.',
  VALIDATION_PASSWORD: '비밀번호를 입력해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '로그인에 성공했습니다.',
  CART_ADD_SUCCESS: '장바구니에 추가되었습니다.',
  CART_UPDATE_SUCCESS: '수량이 변경되었습니다.',
  CART_REMOVE_SUCCESS: '장바구니에서 제거되었습니다.',
  ORDER_CREATE_SUCCESS: '주문이 완료되었습니다.',
} as const;

// Accessibility
export const ACCESSIBILITY = {
  MIN_TOUCH_TARGET_SIZE: 44, // px (WCAG 2.1 Level AAA)
} as const;
