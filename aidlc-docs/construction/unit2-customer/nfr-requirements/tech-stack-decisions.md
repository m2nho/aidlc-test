# Tech Stack Decisions - Unit 2 (Customer Frontend)

**Unit**: Unit 2 - Customer Frontend  
**Created**: 2026-04-06T16:07:00Z

---

## Overview

Customer Frontend의 기술 스택 선택과 그 이유를 설명합니다. 각 결정은 NFR 요구사항, MVP 목표, 팀 역량, 유지보수성을 고려하여 이루어졌습니다.

---

## 1. Core Framework & Build Tools

### React 18 + Vite

**선택**: React 18 + Vite

**대안 고려**:
- React 18 + Create React App
- Next.js (SSR)
- Vue.js 3

**선택 이유**:
1. **React 18**: 
   - 최신 React 기능 (Concurrent Rendering, Automatic Batching)
   - Day 0 계약의 TypeScript 타입과 완벽 호환
   - 가장 인기 있는 React 버전 (활발한 커뮤니티)
   - React 18의 성능 개선 (자동 배칭, Suspense)

2. **Vite**:
   - 매우 빠른 개발 서버 시작 (콜드 스타트 1초 이내)
   - 빠른 HMR (Hot Module Replacement)
   - Rollup 기반 프로덕션 빌드 (작은 번들 크기)
   - TypeScript 기본 지원
   - 간단한 설정

**vs Create React App**:
- CRA는 느린 빌드 속도 (Webpack 기반)
- CRA는 복잡한 설정 (eject 필요)
- Vite가 훨씬 빠르고 가벼움

**vs Next.js**:
- Next.js는 SSR에 특화 (SEO 목적)
- Customer Frontend는 SPA로 충분 (SEO 불필요)
- Next.js는 오버엔지니어링

**트레이드오프**:
- ❌ CRA만큼 성숙하지 않음 (플러그인 생태계 작음)
- ❌ 일부 레거시 라이브러리와 호환 문제 가능
- ✅ 빠른 개발 경험
- ✅ 작은 번들 크기

---

## 2. Programming Language

### TypeScript (Strict Mode)

**선택**: TypeScript with strict mode

**대안 고려**:
- JavaScript + JSDoc
- JavaScript only

**선택 이유**:
1. **Day 0 계약**: TypeScript 타입이 이미 정의되어 있음
2. **타입 안전성**: 컴파일 타임에 타입 에러 발견
3. **자동 완성**: IDE 지원으로 개발 속도 향상
4. **리팩토링 용이**: 타입 시스템으로 안전한 리팩토링
5. **유지보수성**: 명확한 인터페이스와 계약

**Strict Mode 설정**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**트레이드오프**:
- ❌ 초기 설정 복잡도 증가
- ❌ 타입 작성 시간 추가
- ✅ 버그 조기 발견
- ✅ 더 나은 IDE 지원
- ✅ 팀 간 명확한 계약

---

## 3. State Management

### React Context API

**선택**: React Context API (라이브러리 없음)

**대안 고려**:
- Redux Toolkit
- Zustand
- Jotai
- MobX

**선택 이유**:
1. **간단한 상태**: 장바구니, 메뉴, 세션 정보만 관리
2. **추가 설치 불필요**: React 내장 기능
3. **충분한 성능**: 13개 컴포넌트에서 충분
4. **MVP 적합**: 빠른 구현 가능
5. **학습 곡선 낮음**: React 기본 개념만 필요

**Context 구조**:
```typescript
CustomerAppContext
├── cart (Cart)
├── menus (Menu[])
├── categories (MenuCategory[])
├── session (SessionInfo)
└── actions (CustomerAppActions)
```

**vs Redux Toolkit**:
- Redux는 복잡한 상태 관리에 적합
- Customer Frontend는 단순한 상태
- Redux는 보일러플레이트 코드 많음

**vs Zustand**:
- Zustand는 가볍지만 여전히 외부 라이브러리
- Context API로 충분

**트레이드오프**:
- ❌ 컴포넌트 최적화 수동 (React.memo)
- ❌ 큰 앱에서는 성능 문제 가능
- ✅ 간단한 구현
- ✅ 추가 라이브러리 없음
- ✅ React 표준 방식

---

## 4. UI Styling

### Tailwind CSS + HeadlessUI

**선택**: Tailwind CSS 3.x + HeadlessUI

**대안 고려**:
- Material-UI (MUI)
- Ant Design
- Chakra UI
- Styled Components
- CSS Modules

**선택 이유**:
1. **빠른 개발**: 유틸리티 클래스로 빠른 스타일링
2. **작은 번들**: 사용한 클래스만 번들 포함 (PurgeCSS)
3. **커스터마이징 용이**: `tailwind.config.js`로 디자인 시스템 정의
4. **접근성**: HeadlessUI로 접근성 높은 컴포넌트 구현
5. **일관성**: 유틸리티 클래스로 일관된 디자인

**HeadlessUI**:
- 접근성 우수한 UI 컴포넌트 (Modal, Dropdown 등)
- Tailwind와 완벽 통합
- 스타일 자유도 높음

**vs Material-UI**:
- MUI는 무겁고 커스터마이징 어려움
- MUI는 Material Design 강제
- Tailwind는 더 가볍고 자유로움

**vs CSS Modules**:
- CSS Modules는 전통적이지만 보일러플레이트 많음
- Tailwind가 더 빠른 개발 가능

**트레이드오프**:
- ❌ HTML 클래스명 길어짐
- ❌ 디자이너와 협업 시 학습 곡선
- ✅ 매우 빠른 개발 속도
- ✅ 작은 번들 크기
- ✅ 일관된 디자인 시스템

**설정**:
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      minWidth: { touch: '44px' },
      minHeight: { touch: '44px' }
    }
  }
}
```

---

## 5. HTTP Client

### Fetch API (Native)

**선택**: Fetch API (네이티브)

**대안 고려**:
- axios
- React Query (+ fetch)
- SWR

**선택 이유**:
1. **네이티브**: 추가 설치 불필요
2. **충분한 기능**: MVP에서는 기본 fetch로 충분
3. **작은 번들**: 외부 라이브러리 없음
4. **표준**: 모든 모던 브라우저 지원
5. **Mock API 전환 용이**: Mock/Real API 전환 간단

**구현 예시**:
```typescript
// api.ts
export async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Cookie 포함
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw error
  }
  
  return response.json()
}
```

**vs axios**:
- axios는 풍부한 기능 (인터셉터, 자동 JSON 변환)
- MVP에서는 fetch로 충분
- 필요 시 나중에 axios로 전환 가능

**vs React Query**:
- React Query는 캐싱, 자동 재시도 제공
- Customer Frontend는 간단한 데이터 페칭
- 오버엔지니어링

**트레이드오프**:
- ❌ 인터셉터 없음 (직접 구현 필요)
- ❌ 자동 재시도 없음
- ✅ 추가 라이브러리 없음
- ✅ 간단한 구현
- ✅ 표준 API

---

## 6. Routing

### React Router v6

**선택**: React Router v6

**대안 고려**:
- React Router v5
- Wouter (경량)
- 라우팅 없음 (단일 페이지)

**선택 이유**:
1. **최신 버전**: React Router v6는 개선된 API
2. **인기**: 가장 널리 사용되는 라우팅 라이브러리
3. **다중 페이지 구조**: Functional Design에서 결정된 구조
4. **타입 안전성**: TypeScript 지원
5. **활발한 커뮤니티**: 문제 해결 용이

**라우팅 구조**:
```
/ → Redirect to /menu (자동 로그인 체크)
/login → LoginPage
/menu → MenuPage
/cart → CartPage
/orders → OrderHistoryPage
```

**vs Wouter**:
- Wouter는 경량이지만 기능 제한적
- React Router가 더 성숙하고 안정적

**vs 단일 페이지**:
- 단일 페이지는 URL 관리 어려움
- 다중 페이지가 더 명확한 구조

**트레이드오프**:
- ❌ 번들 크기 증가 (약 10KB)
- ✅ 명확한 페이지 구분
- ✅ 브라우저 뒤로가기 지원
- ✅ URL 기반 네비게이션

---

## 7. Testing

### Vitest + React Testing Library

**선택**: Vitest + React Testing Library

**대안 고려**:
- Jest + React Testing Library
- Cypress Component Testing
- 테스트 없음

**선택 이유**:
1. **Vite 친화적**: Vitest는 Vite와 완벽 호환
2. **빠른 실행**: Jest보다 훨씬 빠름
3. **Jest 호환 API**: 기존 Jest 지식 활용 가능
4. **React Testing Library**: 사용자 관점 테스트
5. **ESM 지원**: 최신 JavaScript 모듈 시스템

**테스트 전략**:
- **단위 테스트**: 비즈니스 로직, 유틸리티 함수
- **컴포넌트 테스트**: 주요 사용자 플로우
- **목표 커버리지**: 60%

**vs Jest**:
- Jest는 느린 실행 속도
- Jest는 Vite와 설정 복잡
- Vitest가 Vite 환경에 최적

**vs Cypress**:
- Cypress는 E2E에 특화
- 컴포넌트 테스트는 Vitest로 충분

**트레이드오프**:
- ❌ Jest만큼 성숙하지 않음
- ❌ 일부 Jest 플러그인 미지원
- ✅ 매우 빠른 실행 속도
- ✅ Vite 통합
- ✅ 현대적인 API

---

## 8. Code Quality Tools

### ESLint + Prettier + Husky

**선택**: ESLint + Prettier + Husky (pre-commit hook)

**설정**:
- **ESLint**: `eslint-config-airbnb-typescript`
- **Prettier**: 기본 설정
- **Husky**: pre-commit hook (자동 린트 및 포맷)

**선택 이유**:
1. **일관성**: 모든 코드가 동일한 스타일
2. **자동화**: 커밋 전 자동 검사 및 수정
3. **버그 방지**: ESLint로 잠재적 버그 조기 발견
4. **협업**: 팀 간 일관된 코드 스타일
5. **TypeScript 통합**: TypeScript 규칙 포함

**ESLint 주요 규칙**:
```json
{
  "extends": [
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off", // React 18
    "react/no-danger": "error", // XSS 방지
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

**Prettier 설정**:
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Husky 설정**:
```bash
# .husky/pre-commit
npm run lint
npm run format
```

**트레이드오프**:
- ❌ 초기 설정 시간 필요
- ❌ 커밋 속도 약간 느려짐
- ✅ 자동화된 코드 품질 보장
- ✅ 버그 조기 발견
- ✅ 일관된 스타일

---

## 9. Error Tracking

### Console.error (Dev), 향후 Sentry (Prod)

**선택**: MVP에서는 `console.error`만 사용

**대안 고려**:
- Sentry
- LogRocket
- 에러 추적 없음

**선택 이유**:
1. **로컬 환경**: 개발 중에는 콘솔로 충분
2. **MVP 범위**: 클라우드 서비스는 과도함
3. **비용**: Sentry는 유료 (로컬 환경에 불필요)
4. **간단함**: 추가 설정 없음

**구현**:
```typescript
function handleError(error: any, context?: string) {
  console.error(`Error in ${context}:`, error)
  
  // 향후 Sentry 추가
  // Sentry.captureException(error)
  
  showToast('오류가 발생했습니다', 'error')
}
```

**향후 프로덕션**:
- Sentry 통합 (클라우드 배포 시)
- 에러 대시보드 구축
- 알림 설정

**트레이드오프**:
- ❌ 프로덕션 에러 추적 없음
- ❌ 에러 통계 수집 안 됨
- ✅ 간단한 구현
- ✅ 비용 절감
- ✅ MVP 범위 준수

---

## 10. Additional Tools

### Date Formatting: date-fns

**선택**: date-fns (필요 시)

**대안**: Moment.js, Day.js, Native Intl

**선택 이유**:
- 트리 셰이킹 지원 (사용한 함수만 번들 포함)
- 불변성 (Immutable)
- TypeScript 지원
- 가벼움

**사용 예시**:
```typescript
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const time = format(new Date(order.created_at), 'a h:mm', { locale: ko })
// "오후 3:24"
```

---

### Toast Notifications: react-toastify

**선택**: react-toastify

**대안**: react-hot-toast, Sonner

**선택 이유**:
- 간단한 API
- 커스터마이징 용이
- 작은 번들 크기
- TypeScript 지원

**사용 예시**:
```typescript
import { toast } from 'react-toastify'

toast.success('장바구니에 추가되었습니다', {
  position: 'bottom-center',
  autoClose: 3000
})
```

---

## Tech Stack Summary

### Core Stack
| 분류 | 선택 | 이유 |
|------|------|------|
| **Framework** | React 18 | 최신, 성능 개선, 인기 |
| **Build Tool** | Vite | 빠른 빌드, 간단한 설정 |
| **Language** | TypeScript (strict) | 타입 안전성, Day 0 계약 |
| **State Management** | React Context API | 간단한 상태, 라이브러리 불필요 |
| **Styling** | Tailwind CSS + HeadlessUI | 빠른 개발, 작은 번들, 접근성 |
| **HTTP Client** | fetch API | 네이티브, 충분한 기능 |
| **Routing** | React Router v6 | 최신, 인기, 다중 페이지 |
| **Testing** | Vitest + React Testing Library | Vite 친화적, 빠름 |
| **Linting** | ESLint + Prettier | 코드 품질, 일관성 |
| **Hooks** | Husky | pre-commit 자동 검사 |

### Additional Libraries
| 라이브러리 | 용도 | 필수 여부 |
|-----------|------|----------|
| date-fns | 날짜 포맷팅 | 선택 |
| react-toastify | Toast 알림 | 필수 |
| @headlessui/react | 접근성 높은 UI | 권장 |

### Development Tools
| 도구 | 용도 |
|------|------|
| Vite DevTools | 개발 서버 |
| React DevTools | 컴포넌트 디버깅 |
| Chrome DevTools | 성능 프로파일링 |
| axe DevTools | 접근성 검사 |

---

## Bundle Size Estimation

### Estimated Bundle Sizes
- **React + React-DOM**: ~140KB (gzipped)
- **React Router**: ~10KB
- **Tailwind CSS**: ~50KB (purged)
- **react-toastify**: ~15KB
- **Application Code**: ~100KB
- **Total**: **~315KB (gzipped)**

### Target: < 500KB (gzipped)
✅ **목표 달성** (여유 185KB)

---

## Migration Path (Future)

### 향후 고려사항

**성능 최적화 필요 시**:
- React Query 추가 (캐싱, 자동 재시도)
- Code splitting (React.lazy)
- 가상 스크롤 (메뉴 수 증가 시)

**상태 관리 복잡도 증가 시**:
- Zustand로 전환 (Context API 성능 문제 발생 시)

**에러 추적 필요 시**:
- Sentry 통합 (프로덕션 환경)

**HTTP 클라이언트 업그레이드 필요 시**:
- axios로 전환 (인터셉터, 자동 재시도 필요 시)

---

이상으로 Customer Frontend의 기술 스택 결정을 완료했습니다.
