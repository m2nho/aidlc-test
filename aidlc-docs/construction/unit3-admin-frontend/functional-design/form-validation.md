# Unit 3: Admin Frontend - Form Validation Rules

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - Functional Design  
**Date**: 2026-04-06

---

## Validation Strategy

답변: **A) Manual Validation** - MVP 단계에서 폼이 단순하고 개수가 적음

**Rationale**:
- Admin Frontend에는 3개의 폼만 존재 (로그인, 메뉴, 테이블 설정)
- 각 폼은 3-5개 필드로 단순
- Form 라이브러리 추가 불필요 (오버엔지니어링)

---

## Error Display Strategy

답변: **D) Hybrid** - Inline + Toast

**Display Rules**:
- **Inline Errors**: 필드별 검증 에러 → 각 필드 아래 즉시 표시
- **Toast Errors**: 서버 에러, 네트워크 에러 → 전체 화면 Toast

---

## Form 1: LoginForm (LoginPage)

### Form Fields

| Field | Type | Required | Validation Rules |
|---|---|---|---|
| username | text | Yes | Min 3 characters, Max 50 characters |
| password | password | Yes | Min 6 characters, Max 100 characters |

### Validation Rules

#### username
```tsx
function validateUsername(value: string): string | null {
  if (!value || value.trim() === '') {
    return '사용자명을 입력하세요';
  }
  if (value.length < 3) {
    return '사용자명은 최소 3자 이상이어야 합니다';
  }
  if (value.length > 50) {
    return '사용자명은 최대 50자까지 가능합니다';
  }
  return null; // Valid
}
```

#### password
```tsx
function validatePassword(value: string): string | null {
  if (!value || value.trim() === '') {
    return '비밀번호를 입력하세요';
  }
  if (value.length < 6) {
    return '비밀번호는 최소 6자 이상이어야 합니다';
  }
  if (value.length > 100) {
    return '비밀번호는 최대 100자까지 가능합니다';
  }
  return null; // Valid
}
```

### Validation Timing

| Event | Action | Validation Type |
|---|---|---|
| onChange | 입력 시마다 실시간 검증 (300ms debounce) | Individual field |
| onBlur | 필드 벗어날 때 검증 | Individual field |
| onSubmit | 제출 시 전체 검증 | All fields |

### Error Display

**Inline** (각 필드 아래):
```tsx
{errors.username && (
  <span className="error-message">{errors.username}</span>
)}
```

**Toast** (API 에러):
- 401: "로그인 실패: 인증 정보를 확인하세요"
- 429: "너무 많은 로그인 시도. 5분 후 다시 시도하세요"
- Network error: "네트워크 오류가 발생했습니다"

### Form State

```tsx
interface LoginFormState {
  values: {
    username: string;
    password: string;
  };
  errors: {
    username?: string;
    password?: string;
  };
  touched: {
    username: boolean;
    password: boolean;
  };
  isSubmitting: boolean;
}
```

### Validation Flow

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 1. Validate all fields
  const usernameError = validateUsername(values.username);
  const passwordError = validatePassword(values.password);
  
  setErrors({
    username: usernameError,
    password: passwordError
  });
  
  // 2. Stop if validation failed
  if (usernameError || passwordError) {
    return;
  }
  
  // 3. Submit
  setIsSubmitting(true);
  try {
    await api.login(values);
    // Success handling
  } catch (error) {
    // Toast error
    showToast(error.message);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Form 2: MenuForm (MenuManagementPage)

### Form Fields

| Field | Type | Required | Validation Rules |
|---|---|---|---|
| name | text | Yes | Min 2 characters, Max 50 characters |
| category_id | select | Yes | Must be valid category ID |
| price | number | Yes | Integer, >= 0, <= 1000000 |
| description | textarea | No | Max 200 characters |
| is_available | checkbox | No | Boolean (default: true) |

### Validation Rules

#### name
```tsx
function validateMenuName(value: string): string | null {
  if (!value || value.trim() === '') {
    return '메뉴 이름을 입력하세요';
  }
  if (value.length < 2) {
    return '메뉴 이름은 최소 2자 이상이어야 합니다';
  }
  if (value.length > 50) {
    return '메뉴 이름은 최대 50자까지 가능합니다';
  }
  return null;
}
```

#### category_id
```tsx
function validateCategoryId(value: number | '', categories: MenuCategory[]): string | null {
  if (value === '' || value === null || value === undefined) {
    return '카테고리를 선택하세요';
  }
  if (!categories.find(cat => cat.id === value)) {
    return '유효한 카테고리를 선택하세요';
  }
  return null;
}
```

#### price
```tsx
function validatePrice(value: string | number): string | null {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '가격을 입력하세요';
  }
  if (numValue < 0) {
    return '가격은 0 이상이어야 합니다';
  }
  if (numValue > 1000000) {
    return '가격은 1,000,000원 이하여야 합니다';
  }
  if (!Number.isInteger(numValue)) {
    return '가격은 정수로 입력하세요';
  }
  return null;
}
```

#### description
```tsx
function validateDescription(value: string): string | null {
  if (value && value.length > 200) {
    return '설명은 최대 200자까지 가능합니다';
  }
  return null; // Optional field, no required check
}
```

### Validation Timing

| Event | Action | Validation Type |
|---|---|---|
| onChange | 입력 시마다 실시간 검증 (300ms debounce) | Individual field |
| onBlur | 필드 벗어날 때 검증 | Individual field |
| onSubmit | 제출 시 전체 검증 | All fields |

### Error Display

**Inline** (각 필드 아래):
```tsx
<div className="form-field">
  <label>메뉴 이름 *</label>
  <input
    type="text"
    value={values.name}
    onChange={handleChange}
    onBlur={handleBlur}
    className={errors.name && touched.name ? 'error' : ''}
  />
  {errors.name && touched.name && (
    <span className="error-message">{errors.name}</span>
  )}
</div>
```

**Toast** (API 에러):
- 400: "잘못된 요청입니다. 입력 내용을 확인하세요"
- 409: "이미 존재하는 메뉴 이름입니다"
- 500: "서버 오류가 발생했습니다"

### Form State

```tsx
interface MenuFormState {
  values: {
    name: string;
    category_id: number | '';
    price: number | '';
    description: string;
    is_available: boolean;
  };
  errors: {
    name?: string;
    category_id?: string;
    price?: string;
    description?: string;
  };
  touched: {
    name: boolean;
    category_id: boolean;
    price: boolean;
    description: boolean;
  };
  isSubmitting: boolean;
}
```

### Initial Values (Create vs Edit Mode)

**Create Mode**:
```tsx
const initialValues = {
  name: '',
  category_id: '',
  price: '',
  description: '',
  is_available: true
};
```

**Edit Mode** (기존 메뉴 데이터 로드):
```tsx
const initialValues = {
  name: menu.name,
  category_id: menu.category_id,
  price: menu.price,
  description: menu.description || '',
  is_available: menu.is_available
};
```

---

## Form 3: TableSetupForm (TableManagementPage)

### Form Fields

| Field | Type | Required | Validation Rules |
|---|---|---|---|
| tableNumber | number | Yes | Integer, > 0, <= 999 |
| password | password | Yes | Min 4 characters, Max 20 characters |

### Validation Rules

#### tableNumber
```tsx
function validateTableNumber(value: number | ''): string | null {
  if (value === '' || value === null || value === undefined) {
    return '테이블 번호를 입력하세요';
  }
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  if (isNaN(numValue)) {
    return '테이블 번호를 입력하세요';
  }
  if (numValue <= 0) {
    return '테이블 번호는 1 이상이어야 합니다';
  }
  if (numValue > 999) {
    return '테이블 번호는 999 이하여야 합니다';
  }
  if (!Number.isInteger(numValue)) {
    return '테이블 번호는 정수로 입력하세요';
  }
  return null;
}
```

#### password
```tsx
function validateTablePassword(value: string): string | null {
  if (!value || value.trim() === '') {
    return '비밀번호를 입력하세요';
  }
  if (value.length < 4) {
    return '비밀번호는 최소 4자 이상이어야 합니다';
  }
  if (value.length > 20) {
    return '비밀번호는 최대 20자까지 가능합니다';
  }
  return null;
}
```

### Error Display

**Inline** + **Toast** (Hybrid)

---

## Validation Utilities

### Shared Validation Functions

```tsx
// src/utils/validation.ts

export const validators = {
  required: (value: any, fieldName: string): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName}을(를) 입력하세요`;
    }
    return null;
  },
  
  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value.length < min) {
      return `${fieldName}은(는) 최소 ${min}자 이상이어야 합니다`;
    }
    return null;
  },
  
  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (value.length > max) {
      return `${fieldName}은(는) 최대 ${max}자까지 가능합니다`;
    }
    return null;
  },
  
  integer: (value: number, fieldName: string): string | null => {
    if (!Number.isInteger(value)) {
      return `${fieldName}은(는) 정수로 입력하세요`;
    }
    return null;
  },
  
  min: (value: number, min: number, fieldName: string): string | null => {
    if (value < min) {
      return `${fieldName}은(는) ${min} 이상이어야 합니다`;
    }
    return null;
  },
  
  max: (value: number, max: number, fieldName: string): string | null => {
    if (value > max) {
      return `${fieldName}은(는) ${max} 이하여야 합니다`;
    }
    return null;
  }
};

// Compose multiple validators
export function composeValidators(...validators: Array<(value: any) => string | null>) {
  return (value: any): string | null => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}
```

### Usage Example

```tsx
const validateMenuNameComposed = composeValidators(
  (value) => validators.required(value, '메뉴 이름'),
  (value) => validators.minLength(value, 2, '메뉴 이름'),
  (value) => validators.maxLength(value, 50, '메뉴 이름')
);

const error = validateMenuNameComposed(formValues.name);
```

---

## Form Validation Hook (Optional)

### useFormValidation Hook

```tsx
// src/hooks/useFormValidation.ts

interface UseFormValidationOptions<T> {
  initialValues: T;
  validate: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useFormValidation<T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
) {
  const [values, setValues] = useState<T>(options.initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setValues(prev => ({ ...prev, [field]: newValue }));
    
    // Real-time validation (debounced)
    if (touched[field]) {
      const fieldErrors = options.validate({ ...values, [field]: newValue });
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };
  
  const handleBlur = (field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur
    const fieldErrors = options.validate(values);
    setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);
    setTouched(allTouched);
    
    // Validate all fields
    const validationErrors = options.validate(values);
    setErrors(validationErrors);
    
    // Stop if errors
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    // Submit
    setIsSubmitting(true);
    try {
      await options.onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors
  };
}
```

### Usage Example

```tsx
const loginForm = useFormValidation({
  initialValues: { username: '', password: '' },
  validate: (values) => {
    const errors: any = {};
    const usernameError = validateUsername(values.username);
    const passwordError = validatePassword(values.password);
    if (usernameError) errors.username = usernameError;
    if (passwordError) errors.password = passwordError;
    return errors;
  },
  onSubmit: async (values) => {
    await api.login(values);
    navigate('/');
  }
});

return (
  <form onSubmit={loginForm.handleSubmit}>
    <input
      value={loginForm.values.username}
      onChange={loginForm.handleChange('username')}
      onBlur={loginForm.handleBlur('username')}
    />
    {loginForm.errors.username && loginForm.touched.username && (
      <span>{loginForm.errors.username}</span>
    )}
  </form>
);
```

---

## Client-Side vs Server-Side Validation

### Client-Side Validation (Frontend)
**Purpose**: 즉각적 사용자 피드백, 불필요한 API 호출 방지

**Rules**:
- 필수 필드 체크
- 형식 검증 (길이, 타입, 범위)
- 기본적인 비즈니스 규칙 (예: 가격 >= 0)

### Server-Side Validation (Backend)
**Purpose**: 보안, 데이터 무결성

**Rules**:
- 모든 클라이언트 검증 재실행
- 비즈니스 로직 검증 (예: 중복 메뉴 이름)
- 권한 체크
- 데이터베이스 제약조건

### Validation Flow

```
[Client-Side Validation]
      ↓ (Pass)
[API Request]
      ↓
[Server-Side Validation]
      ↓ (Pass)
[Database Update]
      ↓ (Success)
[200 OK Response]

[Server-Side Validation]
      ↓ (Fail)
[400 Bad Request with errors]
      ↓
[Client displays server errors in Toast]
```

---

## Error Messages Style Guide

### Tone:
- **명확하고 구체적**: "입력하세요" 대신 "메뉴 이름을 입력하세요"
- **친절하고 도움이 되는**: "틀렸습니다" 대신 "최소 3자 이상이어야 합니다"
- **액션 지향적**: 무엇을 해야 하는지 명확히

### Examples:

**Good**:
- "메뉴 이름은 최소 2자 이상이어야 합니다"
- "가격은 0 이상의 정수로 입력하세요"
- "카테고리를 선택하세요"

**Bad**:
- "잘못된 입력"
- "오류 발생"
- "실패"

---

## Summary

**Total Forms**: 3개
- LoginForm: 2개 필드
- MenuForm: 5개 필드
- TableSetupForm: 2개 필드

**Validation Strategy**: Manual validation (no library)
**Error Display**: Hybrid (Inline + Toast)
**Validation Timing**: onChange (debounced) + onBlur + onSubmit

**Key Principles**:
- Client-side validation for UX
- Server-side validation for security
- Immediate feedback (inline errors)
- Clear, actionable error messages
