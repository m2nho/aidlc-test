# Unit 3: Admin Frontend - NFR Requirements

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - NFR Requirements Assessment  
**Date**: 2026-04-06

---

## NFR Requirements Summary

이 문서는 Unit 3 (Admin Frontend)의 비기능적 요구사항을 정의합니다.

---

## 1. Scalability Requirements

### 1.1 Concurrent Users

**Requirement**: 1-5명의 동시 관리자 지원

**Context**: MVP 단계, 단일 매장 환경

**Target Metrics**:
- 동시 관리자: 1-5명
- SSE 동시 연결: 1-5개
- 주문 처리량: 1-10건/분

**Implementation Considerations**:
- React Context로 충분 (Redux 불필요)
- 클라이언트 측 상태 관리 최소화
- 서버 부하 낮음

**Scaling Path** (향후):
- 다중 매장 지원 시 Redux 또는 Zustand 고려
- SSE 연결 풀링 최적화

---

### 1.2 Data Volume

**Requirement**: 소규모 데이터 볼륨 처리

**Expected Data**:
- 주문 목록: ~100건/일
- 메뉴: ~50개
- 테이블: ~20개

**Memory Footprint**: <50MB (클라이언트)

**Implementation**:
- 페이지네이션 불필요 (작은 데이터셋)
- 전체 데이터 메모리 로드 가능
- 클라이언트 측 필터링/정렬

---

## 2. Performance Requirements

### 2.1 Initial Load Time

**Target**: 3초 이내

**Measured From**: Navigation start → First Contentful Paint (FCP)

**Strategies**:
- Code Splitting (페이지별 lazy loading)
- Tree Shaking (사용하지 않는 코드 제거)
- Asset 압축 (Gzip/Brotli)
- 최소 JavaScript 번들 크기

**Bundle Size Targets**:
- Initial: <200KB (gzipped)
- Per Route: <100KB (gzipped)

**Implementation**:
```tsx
// Lazy loading pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MenuManagementPage = lazy(() => import('./pages/MenuManagementPage'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/menus" element={<MenuManagementPage />} />
  </Routes>
</Suspense>
```

---

### 2.2 API Response Time

**Target**: 2초 이내

**Measured From**: Request sent → Response received

**Applies To**:
- GET /api/orders
- POST /api/menus
- PATCH /api/orders/:id/status
- All other API endpoints

**Timeout Strategy**:
- Timeout: 10초 (네트워크 에러로 간주)
- 사용자에게 "요청 시간 초과" 에러 표시

**Implementation**:
```tsx
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch('/api/orders', {
    signal: controller.signal
  });
} catch (error) {
  if (error.name === 'AbortError') {
    throw new Error('요청 시간 초과');
  }
} finally {
  clearTimeout(timeoutId);
}
```

---

### 2.3 Real-time Update Latency

**Target**: 2초 이내

**Measured From**: Order created (backend) → UI updated (frontend)

**Applies To**: SSE events (order.created, order.updated, order.deleted)

**Acceptable Delay**: 0-2초

**Implementation**:
- SSE direct connection (no polling)
- Direct state update (no validation delay)
- Immediate UI re-render

---

### 2.4 Interaction Responsiveness

**Target**: 100ms 이내

**Applies To**:
- Button clicks
- Form input
- Modal open/close
- State changes

**Implementation**:
- Debounce 검색/필터: 300ms
- Throttle 스크롤: 100ms
- 즉시 응답: 클릭, 토글

---

## 3. Availability Requirements

### 3.1 Uptime

**Target**: 개발 단계에서는 명시 안 함

**Reason**: MVP, 로컬 서버

**향후 고려사항**:
- 프로덕션: 99.9% uptime (월 43분 다운타임)
- Health check 엔드포인트
- 자동 재시작

---

### 3.2 Disaster Recovery

**MVP**: 불필요

**향후 고려사항**:
- 백업 전략
- Failover 계획

---

## 4. Security Requirements

### 4.1 XSS Protection

**Strategy**: React 기본 XSS 방어

**Implementation**:
- React는 기본적으로 모든 값을 escape
- `dangerouslySetInnerHTML` 사용 금지
- 사용자 입력 직접 DOM 조작 금지

**Additional Measures** (향후):
- CSP (Content Security Policy) 헤더
- DOMPurify (HTML sanitization)

---

### 4.2 CSRF Protection

**Strategy**: SameSite Cookie 속성

**Implementation**:
- JWT 토큰을 HTTP-only Cookie에 저장
- `SameSite=Lax` 또는 `SameSite=Strict` 속성
- CORS 설정 (백엔드)

**Backend Configuration**:
```python
# FastAPI
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    samesite="lax",
    secure=True  # HTTPS only
)
```

---

### 4.3 Sensitive Data Protection

**Strategy**: 프로덕션 빌드에서 모든 console.log 제거

**Implementation**:
- Vite 빌드 설정에서 `drop_console` 옵션
- 민감 데이터 로깅 금지 (비밀번호, 토큰)
- 에러 메시지에 민감 정보 포함 금지

**Vite Configuration**:
```js
// vite.config.js
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}
```

---

### 4.4 Authentication & Authorization

**Requirement**: JWT 기반 인증 (백엔드에서 처리)

**Frontend Responsibility**:
- JWT 토큰 존재 여부 체크
- 토큰 없으면 `/login`으로 리다이렉트
- 401 응답 시 자동 로그아웃

**Backend Responsibility**:
- JWT 토큰 검증
- 권한 체크
- 토큰 만료 처리

---

## 5. Reliability Requirements

### 5.1 Error Handling

**Strategy**: Try-Catch + Error Boundary (Hybrid)

**API Errors** (Try-Catch):
- 401: 자동 로그아웃
- 403: "권한이 없습니다" Toast
- 404: "리소스를 찾을 수 없습니다" Toast
- 500: "서버 오류가 발생했습니다" Toast
- Network: "네트워크 오류가 발생했습니다" Toast

**Rendering Errors** (Error Boundary):
- 컴포넌트 렌더링 에러 catch
- ErrorFallback 화면 표시
- "다시 시도" 버튼

**Implementation**:
```tsx
// Error Boundary
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <AdminAppProvider>
    <App />
  </AdminAppProvider>
</ErrorBoundary>
```

---

### 5.2 SSE Connection Reliability

**Strategy**: Exponential Backoff 재연결

**Reconnection Schedule**:
| Attempt | Delay |
|---|---|
| 1 | 1s |
| 2 | 2s |
| 3 | 4s |
| 4 | 8s |
| 5 | 16s |
| 6+ | 재연결 포기 |

**Max Reconnect Attempts**: 5회

**User Feedback**:
- "재연결 시도 중 (1/5)..."
- "재연결 시도 중 (2/5)..."
- ...
- "연결 실패. 페이지를 새로고침해주세요."

---

### 5.3 API Request Retry

**Strategy**: 재시도 없음 (사용자가 수동 재시도)

**Reason**:
- SSE는 자동 재연결 (Exponential Backoff)
- API 요청은 사용자 액션이므로 명시적 재시도
- 멱등성 보장 어려움 (POST, PATCH, DELETE)

**User Experience**:
- 에러 Toast 표시
- "다시 시도" 버튼 제공 (일부 케이스)

---

### 5.4 Offline Support

**Requirement**: 불필요

**Reason**: 관리자는 항상 온라인 환경 가정

**향후 고려사항**:
- Service Worker (오프라인 캐싱)
- IndexedDB (로컬 데이터 저장)

---

## 6. Maintainability Requirements

### 6.1 Code Quality

**Tools**:
- ESLint (코드 린팅)
- Prettier (코드 포맷팅)
- TypeScript Strict Mode (타입 안전성)

**ESLint Configuration**:
```js
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-explicit-any': 'error'
  }
}
```

**Prettier Configuration**:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**TypeScript Configuration**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

---

### 6.2 Testing Requirements

**Strategy**: Vitest + React Testing Library

**Test Coverage Target**: 70% (컴포넌트, Hooks, Utils)

**Test Types**:
- Unit tests: 컴포넌트, Hooks, Utilities
- Integration tests: 페이지 플로우
- E2E tests: 불필요 (MVP 단계)

**Implementation**:
```tsx
// Example: LoginPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
  
  it('should show error on invalid input', async () => {
    render(<LoginPage />);
    const submitButton = screen.getByText('로그인');
    fireEvent.click(submitButton);
    expect(await screen.findByText('사용자명을 입력하세요')).toBeInTheDocument();
  });
});
```

---

### 6.3 Build Optimization

**Strategies**:
- Code Splitting (페이지별 lazy loading)
- Tree Shaking (사용하지 않는 코드 제거)
- Asset 압축 (Gzip/Brotli)
- Image 최적화 (WebP, lazy loading)

**Vite Configuration**:
```js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
}
```

---

### 6.4 Error Tracking

**MVP**: 브라우저 콘솔만 사용

**Reason**: MVP 단계, Sentry 등 외부 서비스 불필요

**향후 고려사항**:
- Sentry (에러 추적)
- LogRocket (세션 리플레이)

---

## 7. Usability Requirements

### 7.1 Browser Support

**Target**: 최신 브라우저만 지원

**Supported Browsers**:
- Chrome: 최신 2개 버전
- Firefox: 최신 2개 버전
- Safari: 최신 2개 버전
- Edge: 최신 2개 버전

**Not Supported**:
- IE11 (폴리필 불필요)
- 구형 모바일 브라우저

**Reason**: 관리자용, 최신 브라우저 가정 가능

---

### 7.2 Responsive Design

**Target**: 태블릿 포함 (768px 이상)

**Breakpoints**:
- Desktop: 1024px 이상
- Tablet: 768px - 1023px
- Mobile: 767px 이하 (최소 지원, 최적화 안 됨)

**Implementation** (Tailwind CSS):
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

**Reason**: 관리자가 태블릿으로도 사용 가능, 모바일은 우선순위 낮음

---

### 7.3 Accessibility

**Target**: 기본 접근성 (WCAG 2.1 A)

**Requirements**:
- 시맨틱 HTML 사용 (`<button>`, `<nav>`, `<main>`)
- 모든 이미지에 `alt` 속성
- 폼 필드에 `<label>` 연결
- 키보드 네비게이션 가능
- 충분한 색상 대비 (4.5:1)

**Not Required** (MVP):
- WCAG 2.1 AA/AAA 준수
- 스크린 리더 최적화
- ARIA 속성 (최소한만 사용)

**Implementation**:
```tsx
// Good
<button onClick={handleClick}>로그인</button>

<label htmlFor="username">사용자명</label>
<input id="username" type="text" />

// Bad
<div onClick={handleClick}>로그인</div>
<input type="text" placeholder="사용자명" />
```

---

## 8. Compliance Requirements

**MVP**: 특별한 컴플라이언스 요구사항 없음

**Reason**: 로컬 서버, 개발 단계

**향후 고려사항**:
- GDPR (EU 고객 데이터)
- PCI-DSS (결제 정보)
- SOC 2 (보안 감사)

---

## NFR Requirements Summary Matrix

| Category | Requirement | Target | Priority |
|---|---|---|---|
| **Scalability** | Concurrent Admins | 1-5명 | Medium |
| **Scalability** | SSE Connections | 1-5개 | Medium |
| **Scalability** | Order Throughput | 1-10건/분 | Medium |
| **Performance** | Initial Load | <3s | High |
| **Performance** | API Response | <2s | High |
| **Performance** | SSE Latency | <2s | High |
| **Performance** | Interaction | <100ms | High |
| **Security** | XSS Protection | React 기본 | High |
| **Security** | CSRF Protection | SameSite Cookie | High |
| **Security** | Data Protection | Console.log 제거 | Medium |
| **Reliability** | Error Handling | Hybrid | High |
| **Reliability** | SSE Reconnect | Exponential Backoff | High |
| **Reliability** | API Retry | None | Low |
| **Maintainability** | Code Quality | ESLint + Prettier + TS Strict | High |
| **Maintainability** | Testing | Vitest + RTL | Medium |
| **Maintainability** | Build Optimization | Code Split + Tree Shake | High |
| **Usability** | Browser Support | 최신 2개 버전 | High |
| **Usability** | Responsive | 768px+ | Medium |
| **Usability** | Accessibility | 기본 (WCAG A) | Medium |

---

## Trade-offs & Constraints

### MVP Simplifications:
1. **No Redux/Zustand**: React Context로 충분 (1-5명 동시 사용자)
2. **No E2E Tests**: 단위 테스트로 충분
3. **No Sentry**: 브라우저 콘솔로 충분
4. **No Offline Support**: 항상 온라인 가정
5. **No Advanced Accessibility**: 기본 접근성만
6. **No IE11**: 최신 브라우저만

### Future Enhancements:
1. **Scalability**: Redux/Zustand (다중 매장)
2. **Monitoring**: Sentry, LogRocket
3. **Testing**: E2E tests (Playwright)
4. **Security**: CSP, DOMPurify
5. **Accessibility**: WCAG AA 준수

---

## Success Criteria

### Performance:
- ✅ Initial load <3s (FCP)
- ✅ API response <2s
- ✅ SSE latency <2s
- ✅ Bundle size <200KB (gzipped)

### Quality:
- ✅ TypeScript Strict Mode
- ✅ ESLint 0 errors
- ✅ Test coverage >70%
- ✅ 0 console warnings (production)

### Usability:
- ✅ Responsive 768px+
- ✅ 최신 브라우저 지원
- ✅ 기본 접근성 준수

### Reliability:
- ✅ SSE 자동 재연결
- ✅ Error Boundary 적용
- ✅ API 에러 처리
