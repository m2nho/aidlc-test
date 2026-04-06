# Unit 3: Admin Frontend - Business Rules

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - Functional Design  
**Date**: 2026-04-06

---

## Business Rules Overview

Admin Frontend의 비즈니스 규칙을 정의합니다. 프론트엔드에서 강제하는 UI/UX 규칙과 백엔드에서 최종 검증하는 규칙을 구분합니다.

---

## BR-01: 인증 및 권한

### BR-01.1: 관리자 인증 필수

답변: **C) Both** - Frontend 토큰 체크 + Backend 검증

**Rule**: 모든 관리자 기능은 인증된 사용자만 접근 가능

**Frontend Enforcement**:
- JWT 토큰 존재 여부 체크 (Cookie)
- 토큰 없으면 → 즉시 `/login`으로 리다이렉트
- PrivateRoute 컴포넌트로 보호

**Backend Enforcement**:
- 모든 `/api/admin/*` 및 `/api/events/*` 엔드포인트에서 JWT 검증
- 유효하지 않은 토큰 → 401 Unauthorized

**Implementation**:
```tsx
// PrivateRoute.tsx
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAdminAppContext();
  
  if (!state.auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

---

### BR-01.2: 세션 만료 처리

**Rule**: JWT 토큰 만료 시 자동 로그아웃 및 로그인 페이지 리다이렉트

**Token Lifetime**: 16시간

**Frontend Handling**:
- API 호출 시 401 Unauthorized 수신 → 자동 로그아웃
- Context에서 AUTH_LOGOUT dispatch
- `/login`으로 리다이렉트

**Implementation**:
```tsx
// API error interceptor
if (response.status === 401) {
  dispatch({ type: 'AUTH_LOGOUT' });
  navigate('/login');
}
```

---

### BR-01.3: 동시 세션 제한 (Optional - MVP 제외)

**Rule**: 한 관리자 계정은 한 번에 하나의 세션만 허용 (향후 구현)

**MVP**: 제한 없음

---

## BR-02: 주문 관리

### BR-02.1: 주문 상태 전환 규칙

답변: **C) Hybrid** - Frontend UI 제한 + Backend 검증

**Rule**: 주문 상태는 정해진 순서대로만 변경 가능

**Allowed Transitions**:
| Current Status | Allowed Next Status |
|---|---|
| `pending` | `preparing`, `completed` |
| `preparing` | `completed` |
| `completed` | (변경 불가) |

**Frontend Enforcement**:
- OrderDetailModal의 상태 드롭다운에서 허용된 상태만 표시
- `completed` 상태일 때 드롭다운 비활성화

**Backend Enforcement**:
- 모든 상태 변경 요청에서 전환 규칙 검증
- 잘못된 전환 → 400 Bad Request

**Implementation**:
```tsx
// OrderDetailModal.tsx
const getAllowedStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  switch (currentStatus) {
    case 'pending':
      return ['preparing', 'completed'];
    case 'preparing':
      return ['completed'];
    case 'completed':
      return []; // 변경 불가
    default:
      return [];
  }
};

const allowedStatuses = getAllowedStatuses(order.status);

<select disabled={allowedStatuses.length === 0}>
  {allowedStatuses.map(status => (
    <option key={status} value={status}>{statusLabels[status]}</option>
  ))}
</select>
```

---

### BR-02.2: 주문 삭제 확인

**Rule**: 주문 삭제 시 관리자에게 확인 요청

**Reason**: 실수로 인한 주문 삭제 방지

**Frontend Enforcement**:
- "삭제" 버튼 클릭 → 확인 Modal 표시
- "이 주문을 삭제하시겠습니까?" 메시지
- "확인" 클릭 시에만 API 호출

**Backend Enforcement**:
- 주문 삭제 전 주문 존재 여부 확인
- 이미 완료된 주문은 삭제 불가 (Optional - MVP에서는 모든 주문 삭제 가능)

---

### BR-02.3: 신규 주문 강조 (3초)

답변: **D) Hybrid** - Color + Animation

**Rule**: SSE로 수신한 신규 주문은 3초간 시각적으로 강조

**Visual Effects**:
- 배경색: 노란색 하이라이트 (#FFF9C4)
- 애니메이션: Bounce effect
- 3초 후 자동으로 일반 상태로 복귀

**Implementation**:
```tsx
// DashboardPage.tsx
useSSE({
  onMessage: (event) => {
    const data = JSON.parse(event.data);
    if (data.event === 'order.created') {
      dispatch({ type: 'ORDER_ADD', payload: { order: data.data } });
      dispatch({ type: 'ORDER_MARK_NEW', payload: { orderId: data.data.id } });
      
      // 3초 후 강조 제거
      setTimeout(() => {
        dispatch({ type: 'ORDER_CLEAR_NEW', payload: { orderId: data.data.id } });
      }, 3000);
    }
  }
});

// TableCard.tsx
<div className={isNewOrder ? 'table-card new-order' : 'table-card'}>
  {/* card content */}
</div>

// CSS
.table-card.new-order {
  background-color: #FFF9C4;
  animation: bounce 0.5s;
}
```

---

### BR-02.4: 테이블 카드 주문 미리보기

답변: **A) 최신 3개**

**Rule**: 대시보드의 테이블 카드는 최신 주문 3개만 미리보기로 표시

**Reason**: 카드 크기 제한, 가독성

**Frontend Enforcement**:
- Orders를 `created_at` 기준 내림차순 정렬
- 상위 3개만 렌더링
- "자세히 보기" 버튼 → OrderDetailModal에서 전체 주문 표시

**Implementation**:
```tsx
// TableCard.tsx
const recentOrders = orders
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 3);

{recentOrders.map(order => (
  <div key={order.id}>{/* order preview */}</div>
))}

{orders.length > 3 && (
  <button onClick={onClick}>자세히 보기 ({orders.length}개)</button>
)}
```

---

## BR-03: 테이블 관리

### BR-03.1: 테이블 세션 종료 확인

**Rule**: 테이블 세션 종료 시 관리자에게 확인 요청

**Reason**: 실수로 인한 세션 종료 방지, 현재 주문 내역이 과거 이력으로 이동

**Frontend Enforcement**:
- "이용 완료" 버튼 클릭 → 확인 Modal 표시
- "이 테이블의 세션을 종료하시겠습니까?" 메시지
- "확인" 클릭 시에만 API 호출

**Backend Enforcement**:
- 세션 종료 시 현재 주문을 OrderHistory로 이동
- 테이블 상태 리셋 (주문 목록 0, 총액 0)

---

### BR-03.2: 테이블 초기 설정 (1회)

**Rule**: 테이블 태블릿은 관리자가 1회 초기 설정해야 고객이 사용 가능

**Frontend Flow**:
1. TableSetupForm에서 테이블 번호 + 비밀번호 입력
2. API 호출 → 세션 생성
3. 설정 정보를 태블릿 LocalStorage에 저장
4. 이후 고객이 자동 로그인

**Backend Enforcement**:
- 테이블 번호 중복 체크
- 비밀번호 해싱 저장
- 16시간 세션 생성

---

### BR-03.3: 과거 주문 내역 조회

**Rule**: 과거 주문 내역은 테이블별, 날짜별 필터링 가능

**Filters**:
- 테이블 ID (선택 사항)
- 시작 날짜 (선택 사항)
- 종료 날짜 (선택 사항)

**Frontend Enforcement**:
- 필터 변경 시 API 재호출
- 결과를 시간 역순으로 정렬

**Backend Enforcement**:
- Query parameter로 필터 적용
- 해당 매장(store_id)의 내역만 조회

---

## BR-04: 메뉴 관리

### BR-04.1: 메뉴 필수 필드

**Rule**: 메뉴 등록 시 필수 필드는 반드시 입력해야 함

**Required Fields**:
- `name` (메뉴 이름)
- `category_id` (카테고리)
- `price` (가격)

**Optional Fields**:
- `description` (설명)
- `is_available` (판매 가능 여부 - 기본값: true)

**Frontend Enforcement**:
- 폼 검증으로 필수 필드 체크
- 빈 값 제출 시 에러 메시지 표시

**Backend Enforcement**:
- Pydantic schema로 필수 필드 검증
- 누락 시 422 Unprocessable Entity

---

### BR-04.2: 메뉴 가격 범위

**Rule**: 메뉴 가격은 0 이상의 정수

**Range**: 0 <= price <= 1,000,000

**Frontend Enforcement**:
- 입력 필드 타입: number
- 검증: >= 0, <= 1,000,000, 정수
- 음수 입력 시 에러 메시지

**Backend Enforcement**:
- 가격 범위 검증
- 잘못된 값 → 400 Bad Request

---

### BR-04.3: 메뉴 이름 길이

**Rule**: 메뉴 이름은 2-50자

**Frontend Enforcement**:
- 검증: minLength(2), maxLength(50)
- 초과 시 에러 메시지

**Backend Enforcement**:
- 길이 검증
- 초과 시 400 Bad Request

---

### BR-04.4: 메뉴 설명 길이

**Rule**: 메뉴 설명은 최대 200자 (선택 사항)

**Frontend Enforcement**:
- 검증: maxLength(200)
- 초과 시 에러 메시지

**Backend Enforcement**:
- 길이 검증
- 초과 시 400 Bad Request

---

### BR-04.5: 메뉴 삭제 확인

**Rule**: 메뉴 삭제 시 관리자에게 확인 요청

**Reason**: 실수로 인한 메뉴 삭제 방지

**Frontend Enforcement**:
- "삭제" 버튼 클릭 → 확인 Modal 표시
- "이 메뉴를 삭제하시겠습니까?" 메시지
- "확인" 클릭 시에만 API 호출

**Backend Enforcement**:
- 메뉴 삭제 전 존재 여부 확인
- 관련 OrderItem이 있으면 삭제 불가 (Optional - MVP에서는 모든 메뉴 삭제 가능)

---

## BR-05: SSE 연결 및 실시간 업데이트

### BR-05.1: SSE 자동 재연결

답변: **B) Exponential Backoff**

**Rule**: SSE 연결 실패 시 Exponential Backoff으로 자동 재연결

**Retry Schedule**:
| Attempt | Delay | Max Attempts |
|---|---|---|
| 1 | 1s | 5 |
| 2 | 2s | 5 |
| 3 | 4s | 5 |
| 4 | 8s | 5 |
| 5 | 16s | 5 |
| 6+ | (재연결 포기) | - |

**Frontend Enforcement**:
- useSSE Hook에서 자동 재연결 로직 구현
- 재연결 횟수 Context에 저장
- 최대 5회 시도 후 포기

**User Feedback**:
- "재연결 시도 중 (1/5)..."
- "재연결 시도 중 (2/5)..."
- ...
- "연결 실패. 페이지를 새로고침해주세요."

---

### BR-05.2: SSE 이벤트 즉시 반영

답변: **A) Direct State Update**

**Rule**: SSE 이벤트 수신 시 즉시 Context 상태 업데이트

**Reason**: MVP 단계에서 SSE 신뢰, 추가 검증 불필요

**Implementation**:
```tsx
useSSE({
  onMessage: (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.event) {
      case 'order.created':
        dispatch({ type: 'ORDER_ADD', payload: { order: data.data } });
        break;
      case 'order.updated':
        dispatch({ type: 'ORDER_UPDATE', payload: { orderId: data.data.id, updates: data.data } });
        break;
      case 'order.deleted':
        dispatch({ type: 'ORDER_DELETE', payload: { orderId: data.data.id } });
        break;
    }
  }
});
```

---

### BR-05.3: SSE 연결 상태 표시

**Rule**: 대시보드 상단에 SSE 연결 상태 표시

**States**:
- 연결됨 (초록색 점)
- 연결 중 (노란색 점)
- 연결 끊김 (빨간색 점)

**Implementation**:
```tsx
// DashboardPage.tsx
const { state } = useAdminAppContext();

<div className="sse-status">
  <span className={`indicator ${state.sse.isConnected ? 'connected' : 'disconnected'}`} />
  {state.sse.isConnected ? '실시간 업데이트 연결됨' : '연결 끊김'}
</div>
```

---

## BR-06: Mock API / Real API 전환

### BR-06.1: 환경 변수로 전환

답변: **A) Environment Variable**

**Rule**: `.env` 파일의 `VITE_USE_MOCK_API` 플래그로 Mock/Real API 전환

**Configuration**:
```bash
# .env (개발 - Mock API)
VITE_USE_MOCK_API=true

# .env.production (프로덕션 - Real API)
VITE_USE_MOCK_API=false
```

**Implementation**:
```tsx
// src/services/api.ts
import { mockApi } from './mockApi';
import { realApi } from './realApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export const api = USE_MOCK ? mockApi : realApi;
```

---

### BR-06.2: Mock API 지연 시뮬레이션

**Rule**: Mock API는 네트워크 지연을 시뮬레이션 (500ms)

**Reason**: 실제 API와 유사한 경험, 로딩 상태 테스트

**Implementation**:
```tsx
// mockApi.ts
const MOCK_DELAY = 500;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  login: async (credentials) => {
    await sleep(MOCK_DELAY);
    return { /* mock data */ };
  }
};
```

---

## BR-07: 에러 처리

### BR-07.1: API 에러 처리 전략

답변: **E) Hybrid** - Try-Catch + Error Boundary

**API Errors** (Try-Catch):
- 각 API 호출을 try-catch로 감싸기
- 에러 타입별 처리:
  - 401: 자동 로그아웃 + 로그인 페이지
  - 403: Toast "권한이 없습니다"
  - 404: Toast "리소스를 찾을 수 없습니다"
  - 500: Toast "서버 오류가 발생했습니다"
  - Network: Toast "네트워크 오류가 발생했습니다"

**Rendering Errors** (Error Boundary):
- App.tsx에 Error Boundary 설정
- 컴포넌트 렌더링 에러 catch
- ErrorFallback 화면 표시
- "다시 시도" 버튼 제공

---

### BR-07.2: 폼 검증 에러 표시

답변: **D) Hybrid** - Inline + Toast

**Inline Errors**:
- 각 필드별 검증 에러 → 필드 아래 즉시 표시
- 빨간색 텍스트
- 필드 테두리 빨간색

**Toast Errors**:
- API 에러 → 전체 화면 Toast
- 서버 검증 실패 → Toast
- 네트워크 에러 → Toast

---

## BR-08: 라우팅 및 네비게이션

### BR-08.1: Protected Routes

답변: **C) Protected Routing**

**Rule**: 모든 관리자 페이지는 인증된 사용자만 접근 가능

**Routes**:
- `/login` - Public
- `/` (Dashboard) - Protected
- `/tables` - Protected
- `/menus` - Protected

**Implementation**: PrivateRoute 컴포넌트로 보호 (BR-01.1 참조)

---

### BR-08.2: 로그인 후 리다이렉트

**Rule**: 로그인 성공 시 원래 접근하려던 페이지로 리다이렉트

**Flow**:
1. 미인증 사용자가 `/tables` 접근 시도
2. PrivateRoute에서 `/login`으로 리다이렉트 (state에 from: `/tables` 저장)
3. 로그인 성공 후 `/tables`로 리다이렉트 (from 값 사용)
4. from 값이 없으면 기본적으로 `/` (Dashboard)로 이동

**Implementation**:
```tsx
// PrivateRoute.tsx
<Navigate to="/login" state={{ from: location }} replace />

// LoginPage.tsx
const location = useLocation();
const from = location.state?.from?.pathname || '/';

// After successful login
navigate(from, { replace: true });
```

---

## Business Rules Summary

| Category | Rule Count | Frontend Enforcement | Backend Enforcement |
|---|---|---|---|
| 인증 및 권한 | 3 | 3 | 3 |
| 주문 관리 | 4 | 4 | 2 |
| 테이블 관리 | 3 | 3 | 3 |
| 메뉴 관리 | 5 | 5 | 5 |
| SSE 연결 | 3 | 3 | 1 |
| Mock/Real 전환 | 2 | 2 | 0 |
| 에러 처리 | 2 | 2 | 0 |
| 라우팅 | 2 | 2 | 0 |
| **Total** | **24** | **24** | **14** |

---

## Key Principles

1. **Hybrid Enforcement**: 프론트엔드에서 UX 향상, 백엔드에서 보안 및 무결성 보장
2. **User Feedback**: 모든 작업에 즉각적 피드백 (Toast, Inline error, Loading state)
3. **Confirmation Dialogs**: 중요한 작업(삭제, 세션 종료)은 확인 요청
4. **Status Transitions**: 주문 상태는 정해진 순서대로만 변경
5. **Real-time Updates**: SSE 이벤트는 즉시 반영, Exponential Backoff 재연결
6. **Protected Access**: 모든 관리자 기능은 인증 필수
