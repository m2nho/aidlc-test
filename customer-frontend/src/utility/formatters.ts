import { ORDER_STATUS_LABELS, OrderStatus } from './constants';

/**
 * Format price to Korean Won format
 * @param price - Price in number
 * @returns Formatted price string (e.g., "₩10,000")
 */
export function formatPrice(price: number): string {
  return `₩${price.toLocaleString('ko-KR')}`;
}

/**
 * Format date to Korean locale date string
 * @param date - ISO 8601 date string
 * @returns Formatted date string (e.g., "2024년 1월 1일 오후 3:00")
 */
export function formatDate(date: string): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date to short format
 * @param date - ISO 8601 date string
 * @returns Short formatted date string (e.g., "2024-01-01 15:00")
 */
export function formatDateShort(date: string): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format order status to Korean label
 * @param status - Order status
 * @returns Korean label for the status
 */
export function formatOrderStatus(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] || status;
}

/**
 * Format table number with prefix
 * @param tableNumber - Table number
 * @returns Formatted table number (e.g., "테이블 1번")
 */
export function formatTableNumber(tableNumber: number): string {
  return `테이블 ${tableNumber}번`;
}

/**
 * Format quantity with unit
 * @param quantity - Quantity number
 * @returns Formatted quantity (e.g., "3개")
 */
export function formatQuantity(quantity: number): string {
  return `${quantity}개`;
}

/**
 * Truncate long text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}
