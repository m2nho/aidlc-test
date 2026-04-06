# Unit 3: Admin Frontend - User Interaction Flows

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - Functional Design  
**Date**: 2026-04-06

---

## Interaction Flow Overview

이 문서는 Admin Frontend의 모든 사용자 인터랙션 플로우를 정의합니다.

---

## Flow 1: 관리자 로그인

**User Story**: ADM-001  
**Starting Point**: LoginPage (`/login`)

### Flow Diagram

```
[LoginPage 로드]
      ↓
[사용자명 입력]
      ↓
[비밀번호 입력]
      ↓
["로그인" 버튼 클릭]
      ↓
[로딩 상태 표시]
      ↓
[API: POST /api/auth/login/admin]
      ↓
[성공?] ─Yes→ [Context 업데이트 (AUTH_LOGIN_SUCCESS)]
   │                ↓
   │           [Dashboard로 리다이렉트]
   │                ↓
   │           [SSE 연결 자동 시작]
   │
   No
   ↓
[에러 메시지 표시]
   ↓
[재시도 가능]
```

### Step-by-Step Details

| Step | Action | UI Change | API Call | State Update | Navigation |
|---|---|---|---|---|---|
| 1 | 페이지 로드 | 로그인 폼 표시 | - | - | - |
| 2 | Username 입력 | 입력 필드 값 변경 | - | Local state: `username` | - |
| 3 | Password 입력 | 입력 필드 값 변경 | - | Local state: `password` | - |
| 4 | "로그인" 클릭 | 로딩 스피너 표시, 버튼 비활성화 | POST /auth/login/admin | AUTH_LOGIN_START | - |
| 5a | 성공 (200) | - | - | AUTH_LOGIN_SUCCESS | → /dashboard |
| 5b | 실패 (401) | 에러 메시지 Inline + Toast | - | AUTH_LOGIN_FAILURE | - |
| 5c | 실패 (429) | "5분 후 재시도" Toast | - | - | - |

### Error Scenarios

1. **401 Unauthorized**: "로그인 실패: 인증 정보를 확인하세요"
2. **429 Too Many Requests**: "너무 많은 로그인 시도. 5분 후 다시 시도하세요"
3. **Network Error**: "네트워크 오류가 발생했습니다"
4. **500 Internal Server Error**: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요"

---

## Flow 2: 실시간 주문 대시보드 조회

**User Story**: ADM-002  
**Starting Point**: DashboardPage (`/`)

### Flow Diagram

```
[DashboardPage 로드]
      ↓
[인증 체크] ──No→ [로그인 페이지로 리다이렉트]
      ↓ Yes
[API: GET /api/orders]
      ↓
[SSE 연결: /api/events/orders]
      ↓
[테이블 카드 그리드 표시]
      ↓
[SSE 이벤트 수신 대기]
      ↓
[신규 주문 이벤트]
      ↓
[해당 테이블 카드 강조 (3초)]
      ↓
[사용자가 테이블 카드 클릭]
      ↓
[OrderDetailModal 열기]
```

### Step-by-Step Details

| Step | Action | UI Change | API/SSE | State Update | Duration |
|---|---|---|---|---|---|
| 1 | 페이지 로드 | 로딩 스피너 표시 | - | - | - |
| 2 | 인증 체크 | - | - | Context: `auth.isAuthenticated` | Instant |
| 3 | 주문 조회 | - | GET /orders | ORDERS_FETCH_START/SUCCESS | ~1s |
| 4 | SSE 연결 | SSE 상태 표시 (연결됨/연결 중) | SSE /events/orders | SSE_CONNECT | ~0.5s |
| 5 | 테이블 그리드 렌더링 | 테이블 카드 3-4 columns | - | - | Instant |
| 6 | 신규 주문 수신 | 해당 카드 배경색 변경 (#FFF9C4) + Bounce 애니메이션 | SSE event | ORDER_ADD, ORDER_MARK_NEW | Instant |
| 7 | 3초 대기 | 강조 유지 | - | - | 3s |
| 8 | 강조 제거 | 배경색 원상복귀 | - | ORDER_CLEAR_NEW | Instant |
| 9 | 테이블 카드 클릭 | OrderDetailModal 열기 | - | Local: `selectedTableId` | Instant |

### SSE Event Handling

| Event Type | Payload | Action | State Update |
|---|---|---|---|
| `order.created` | `{ order: Order }` | 주문 추가 + 강조 | ORDER_ADD, ORDER_MARK_NEW |
| `order.updated` | `{ order: Order }` | 주문 상태 업데이트 | ORDER_UPDATE |
| `order.deleted` | `{ orderId: number }` | 주문 제거 | ORDER_DELETE |

---

## Flow 3: 주문 상태 변경

**User Story**: ADM-003  
**Starting Point**: OrderDetailModal (DashboardPage에서 열림)

### Flow Diagram

```
[OrderDetailModal 열림]
      ↓
[주문 목록 표시]
      ↓
[상태 드롭다운 클릭]
      ↓
[허용된 상태 목록 표시]
      ↓
[새 상태 선택]
      ↓
[API: PATCH /api/orders/:id/status]
      ↓
[성공?] ─Yes→ [Context 업데이트 (ORDER_UPDATE)]
   │                ↓
   │           [드롭다운 닫기]
   │                ↓
   │           [Toast: "상태가 변경되었습니다"]
   │
   No
   ↓
[에러 Toast 표시]
   ↓
[상태 롤백]
```

### Step-by-Step Details

| Step | Action | UI Change | API Call | State Update |
|---|---|---|---|---|
| 1 | 상태 드롭다운 클릭 | 드롭다운 열림 | - | - |
| 2 | 옵션 표시 | 허용된 상태만 표시 (Frontend validation) | - | - |
| 3 | 새 상태 선택 | 드롭다운 닫기, 낙관적 UI 업데이트 (Optional) | PATCH /orders/:id/status | ORDER_UPDATE |
| 4a | 성공 (200) | Toast: "상태가 변경되었습니다" | - | - |
| 4b | 실패 | Toast: 에러 메시지, 상태 롤백 | - | ORDER_UPDATE (rollback) |

### Allowed Status Transitions (Frontend Validation)

답변: **C) Hybrid** - Frontend UI 제한 + Backend 검증

| Current Status | Allowed Next Status |
|---|---|
| pending | preparing, completed |
| preparing | completed |
| completed | (변경 불가) |

---

## Flow 4: 주문 삭제

**User Story**: ADM-005  
**Starting Point**: OrderDetailModal

### Flow Diagram

```
[OrderDetailModal]
      ↓
["삭제" 버튼 클릭]
      ↓
[확인 팝업 표시]
      ↓
["확인" or "취소"]
      ↓
["확인"]─→[API: DELETE /api/orders/:id]
      ↓
[성공?] ─Yes→ [Context 업데이트 (ORDER_DELETE)]
   │                ↓
   │           [주문 목록에서 제거]
   │                ↓
   │           [테이블 총액 재계산]
   │                ↓
   │           [Toast: "주문이 삭제되었습니다"]
   │
   No
   ↓
[에러 Toast 표시]
```

### Step-by-Step Details

| Step | Action | UI Change | API Call | State Update |
|---|---|---|---|---|
| 1 | "삭제" 버튼 클릭 | 확인 Modal 열림 | - | - |
| 2a | "확인" 클릭 | Modal 닫기 | DELETE /orders/:id | ORDER_DELETE |
| 2b | "취소" 클릭 | Modal 닫기 | - | - |
| 3a | 성공 (200) | 주문 항목 제거, Toast: "삭제됨" | - | - |
| 3b | 실패 | Toast: 에러 메시지 | - | - |

---

## Flow 5: 테이블 세션 종료

**User Story**: ADM-006  
**Starting Point**: TableManagementPage 또는 DashboardPage

### Flow Diagram

```
[TableManagementPage]
      ↓
["이용 완료" 버튼 클릭]
      ↓
[확인 팝업]
      ↓
["확인"]─→[API: POST /api/tables/:id/complete]
      ↓
[성공?] ─Yes→ [Context 업데이트 (TABLE_UPDATE)]
   │                ↓
   │           [주문 내역 → OrderHistory로 이동]
   │                ↓
   │           [테이블 현재 주문 목록 0으로 리셋]
   │                ↓
   │           [Toast: "세션이 종료되었습니다"]
   │
   No
   ↓
[에러 Toast 표시]
```

### Step-by-Step Details

| Step | Action | UI Change | API Call | State Update |
|---|---|---|---|---|
| 1 | "이용 완료" 클릭 | 확인 Modal: "이 테이블의 세션을 종료하시겠습니까?" | - | - |
| 2a | "확인" 클릭 | Modal 닫기, 로딩 표시 | POST /tables/:id/complete | TABLE_UPDATE |
| 2b | "취소" 클릭 | Modal 닫기 | - | - |
| 3a | 성공 (200) | 테이블 상태 업데이트, Toast: "세션 종료됨" | - | - |
| 3b | 실패 | Toast: 에러 메시지 | - | - |

---

## Flow 6: 메뉴 등록

**User Story**: ADM-009  
**Starting Point**: MenuManagementPage

### Flow Diagram

```
[MenuManagementPage]
      ↓
["메뉴 추가" 버튼 클릭]
      ↓
[MenuForm Modal 열기 (mode: create)]
      ↓
[입력 필드 작성]
      ↓
[실시간 검증 (onChange)]
      ↓
["저장" 버튼 클릭]
      ↓
[폼 검증]
      ↓
[유효?] ─No→ [Inline 에러 표시]
      ↓ Yes
[API: POST /api/menus]
      ↓
[성공?] ─Yes→ [Context 업데이트 (MENU_ADD)]
   │                ↓
   │           [Modal 닫기]
   │                ↓
   │           [메뉴 목록에 추가]
   │                ↓
   │           [Toast: "메뉴가 등록되었습니다"]
   │
   No
   ↓
[에러 Toast 표시]
   ↓
[Modal 유지 (재시도 가능)]
```

### Step-by-Step Details

| Step | Action | UI Change | API Call | State Update | Validation |
|---|---|---|---|---|---|
| 1 | "메뉴 추가" 클릭 | MenuForm Modal 열림 | - | Local: `showMenuForm=true, mode='create'` | - |
| 2 | 입력 필드 작성 | 입력 값 변경 | - | Local: form state | onChange validation |
| 3 | "저장" 클릭 | 로딩 표시 | - | - | Full validation |
| 4a | 검증 실패 | Inline 에러 표시 (각 필드 아래) | - | - | - |
| 4b | 검증 성공 | - | POST /menus | MENU_ADD | - |
| 5a | API 성공 (201) | Modal 닫기, Toast: "등록됨" | - | - | - |
| 5b | API 실패 | Toast: 에러 메시지, Modal 유지 | - | - | - |

---

## Flow 7: 메뉴 수정

**User Story**: ADM-010  
**Starting Point**: MenuManagementPage

### Flow Diagram

```
[MenuManagementPage]
      ↓
["편집" 버튼 클릭]
      ↓
[MenuForm Modal 열기 (mode: edit, 기존 데이터 로드)]
      ↓
[입력 필드 수정]
      ↓
[실시간 검증 (onChange)]
      ↓
["저장" 버튼 클릭]
      ↓
[폼 검증]
      ↓
[유효?] ─No→ [Inline 에러 표시]
      ↓ Yes
[API: PUT /api/menus/:id]
      ↓
[성공?] ─Yes→ [Context 업데이트 (MENU_UPDATE)]
   │                ↓
   │           [Modal 닫기]
   │                ↓
   │           [메뉴 목록 업데이트]
   │                ↓
   │           [Toast: "메뉴가 수정되었습니다"]
   │
   No
   ↓
[에러 Toast 표시]
   ↓
[Modal 유지 (재시도 가능)]
```

### Step-by-Step Details

동일한 패턴, 다만:
- 초기 값이 기존 메뉴 데이터로 채워짐
- API 호출이 PUT /menus/:id
- Context action이 MENU_UPDATE

---

## Flow 8: 메뉴 삭제

**User Story**: ADM-011  
**Starting Point**: MenuManagementPage

### Flow Diagram

```
[MenuManagementPage]
      ↓
["삭제" 버튼 클릭]
      ↓
[확인 팝업: "이 메뉴를 삭제하시겠습니까?"]
      ↓
["확인" or "취소"]
      ↓
["확인"]─→[API: DELETE /api/menus/:id]
      ↓
[성공?] ─Yes→ [Context 업데이트 (MENU_DELETE)]
   │                ↓
   │           [메뉴 목록에서 제거]
   │                ↓
   │           [Toast: "메뉴가 삭제되었습니다"]
   │
   No
   ↓
[에러 Toast 표시]
```

---

## Flow 9: 과거 주문 내역 조회

**User Story**: ADM-007  
**Starting Point**: TableManagementPage

### Flow Diagram

```
[TableManagementPage]
      ↓
["과거 내역" 버튼 클릭]
      ↓
[OrderHistoryModal 열기]
      ↓
[API: GET /api/orders/history]
      ↓
[과거 주문 목록 표시]
      ↓
[필터 적용 (테이블, 날짜)]
      ↓
[API 재호출 (필터 파라미터)]
      ↓
[필터링된 목록 표시]
      ↓
["닫기" 버튼 클릭]
      ↓
[Modal 닫기]
```

### Step-by-Step Details

| Step | Action | UI Change | API Call | State Update |
|---|---|---|---|---|
| 1 | "과거 내역" 클릭 | OrderHistoryModal 열림 | GET /orders/history | Local: `showHistoryModal=true` |
| 2 | 로딩 | 로딩 스피너 표시 | - | - |
| 3 | 데이터 수신 | 주문 목록 표시 | - | Local: `history` |
| 4 | 필터 변경 (테이블 또는 날짜) | 필터 UI 업데이트 | GET /orders/history?... | Local: `filters`, `history` |
| 5 | "닫기" 클릭 | Modal 닫기 | - | Local: `showHistoryModal=false` |

---

## Flow 10: SSE 연결 실패 및 재연결

**User Story**: N/A (기술적 플로우)  
**Starting Point**: DashboardPage SSE 연결

### Flow Diagram

```
[SSE 연결 시작]
      ↓
[EventSource 생성]
      ↓
[연결 성공?] ─Yes→ [정상 작동]
      ↓ No
[onerror 이벤트]
      ↓
[재시도 횟수 확인]
      ↓
[< 5회?] ─No→ [재연결 포기]
      ↓                ↓
     Yes            [에러 상태 표시]
      ↓
[Exponential Backoff 대기]
  (1s, 2s, 4s, 8s, 16s)
      ↓
[재연결 시도]
      ↓
[성공?] ─Yes→ [정상 작동]
      ↓ No
[재시도 횟수 증가]
      ↓
[반복]
```

### Step-by-Step Details

답변: **B) Exponential Backoff** - 1s, 2s, 4s, 8s, 16s 간격으로 재시도

| Attempt | Delay | UI Feedback | Max Attempts |
|---|---|---|---|
| 0 | 0s | "연결 중..." | - |
| 1 | 1s | "재연결 시도 중 (1/5)..." | 5 |
| 2 | 2s | "재연결 시도 중 (2/5)..." | 5 |
| 3 | 4s | "재연결 시도 중 (3/5)..." | 5 |
| 4 | 8s | "재연결 시도 중 (4/5)..." | 5 |
| 5 | 16s | "재연결 시도 중 (5/5)..." | 5 |
| 6 | - | "연결 실패. 페이지를 새로고침해주세요." | - |

---

## Navigation Flow

### Routing Structure

답변: **C) Protected Routing** - PrivateRoute로 인증 체크

```
App
├── /login → LoginPage (Public)
└── / (PrivateRoute - 인증 필요)
    ├── / → DashboardPage
    ├── /tables → TableManagementPage
    └── /menus → MenuManagementPage
```

### PrivateRoute Implementation

```tsx
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAdminAppContext();
  const location = useLocation();
  
  if (state.auth.isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!state.auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}
```

---

## Error Handling Flows

### API Error Flow

```
[API 호출]
      ↓
[Try-Catch]
      ↓
[에러 발생?] ─No→ [정상 처리]
      ↓ Yes
[에러 타입 확인]
      ↓
[401 Unauthorized] → [로그아웃 + 로그인 페이지로]
[403 Forbidden] → [Toast: "권한이 없습니다"]
[404 Not Found] → [Toast: "리소스를 찾을 수 없습니다"]
[500 Server Error] → [Toast: "서버 오류가 발생했습니다"]
[Network Error] → [Toast: "네트워크 오류가 발생했습니다"]
```

### Rendering Error Flow

```
[컴포넌트 렌더링]
      ↓
[에러 발생?] ─No→ [정상 렌더링]
      ↓ Yes
[Error Boundary catch]
      ↓
[ErrorFallback 표시]
      ↓
["다시 시도" 버튼]
      ↓
[페이지 새로고침 또는 에러 reset]
```

---

## Summary

**Total Flows**: 10개
- 인증: 1개 (로그인)
- 주문 관리: 3개 (대시보드 조회, 상태 변경, 삭제)
- 테이블 관리: 2개 (세션 종료, 과거 내역)
- 메뉴 관리: 3개 (등록, 수정, 삭제)
- 기술적: 1개 (SSE 재연결)

**Key Patterns**:
- 모든 변경 작업: 확인 팝업 → API 호출 → Context 업데이트 → Toast 피드백
- 폼 검증: onChange 실시간 검증 + onSubmit 전체 검증
- 에러 처리: Inline (필드별) + Toast (전체 상태)
- SSE: Exponential Backoff 재연결 (최대 5회)
- 라우팅: Protected Route (인증 필수)
