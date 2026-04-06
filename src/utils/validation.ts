// ============================================================================
// Login Form Validation
// ============================================================================

export function validateUsername(value: string): string | null {
  if (!value || value.trim() === '') {
    return '사용자명을 입력하세요';
  }
  if (value.length < 3) {
    return '사용자명은 최소 3자 이상이어야 합니다';
  }
  if (value.length > 50) {
    return '사용자명은 최대 50자까지 가능합니다';
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value || value.trim() === '') {
    return '비밀번호를 입력하세요';
  }
  if (value.length < 4) {
    return '비밀번호는 최소 4자 이상이어야 합니다';
  }
  if (value.length > 100) {
    return '비밀번호는 최대 100자까지 가능합니다';
  }
  return null;
}

export function validateStoreId(value: string): string | null {
  if (!value || value.trim() === '') {
    return '매장 ID를 입력하세요';
  }
  if (value.length < 2) {
    return '매장 ID는 최소 2자 이상이어야 합니다';
  }
  if (value.length > 50) {
    return '매장 ID는 최대 50자까지 가능합니다';
  }
  return null;
}

// ============================================================================
// Menu Form Validation
// ============================================================================

export function validateMenuName(value: string): string | null {
  if (!value || value.trim() === '') {
    return '메뉴명을 입력하세요';
  }
  if (value.length < 2) {
    return '메뉴명은 최소 2자 이상이어야 합니다';
  }
  if (value.length > 100) {
    return '메뉴명은 최대 100자까지 가능합니다';
  }
  return null;
}

export function validateMenuPrice(value: number): string | null {
  if (value === null || value === undefined || isNaN(value)) {
    return '가격을 입력하세요';
  }
  if (value < 0) {
    return '가격은 0원 이상이어야 합니다';
  }
  if (value > 1000000) {
    return '가격은 1,000,000원 이하여야 합니다';
  }
  return null;
}

export function validateCategoryId(value: string): string | null {
  if (!value || value.trim() === '') {
    return '카테고리를 선택하세요';
  }
  return null;
}

export function validateMenuDescription(value: string): string | null {
  // Optional field
  if (!value) return null;

  if (value.length > 500) {
    return '설명은 최대 500자까지 가능합니다';
  }
  return null;
}

export function validateImageUrl(value: string): string | null {
  // Optional field
  if (!value) return null;

  // Basic URL validation
  try {
    new URL(value);
    return null;
  } catch {
    return '올바른 URL 형식이 아닙니다';
  }
}

export function validateDisplayOrder(value: number): string | null {
  if (value === null || value === undefined || isNaN(value)) {
    return '노출 순서를 입력하세요';
  }
  if (value < 1) {
    return '노출 순서는 1 이상이어야 합니다';
  }
  if (value > 9999) {
    return '노출 순서는 9999 이하여야 합니다';
  }
  return null;
}

// ============================================================================
// Table Setup Form Validation
// ============================================================================

export function validateTableNumber(value: string): string | null {
  if (!value || value.trim() === '') {
    return '테이블 번호를 입력하세요';
  }
  if (value.length < 1) {
    return '테이블 번호를 입력하세요';
  }
  if (value.length > 10) {
    return '테이블 번호는 최대 10자까지 가능합니다';
  }
  return null;
}

export function validateTablePassword(value: string): string | null {
  if (!value || value.trim() === '') {
    return '테이블 비밀번호를 입력하세요';
  }
  if (value.length < 4) {
    return '테이블 비밀번호는 최소 4자 이상이어야 합니다';
  }
  if (value.length > 20) {
    return '테이블 비밀번호는 최대 20자까지 가능합니다';
  }
  return null;
}

// ============================================================================
// Generic Validators
// ============================================================================

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName}을(를) 입력하세요`;
  }
  return null;
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): string | null {
  if (value.length < minLength) {
    return `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다`;
  }
  return null;
}

export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): string | null {
  if (value.length > maxLength) {
    return `${fieldName}은(는) 최대 ${maxLength}자까지 가능합니다`;
  }
  return null;
}

export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): string | null {
  if (value === null || value === undefined || isNaN(value)) {
    return `${fieldName}을(를) 입력하세요`;
  }
  if (value < min || value > max) {
    return `${fieldName}은(는) ${min}에서 ${max} 사이여야 합니다`;
  }
  return null;
}
