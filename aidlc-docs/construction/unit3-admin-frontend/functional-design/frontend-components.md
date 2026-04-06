# Unit 3: Admin Frontend - Component Design

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - Functional Design  
**Date**: 2026-04-06

---

## Directory Structure

답변: **D) Hybrid 폴더 구조**

```
frontend/admin/src/
├── App.tsx                     # Root component
├── main.tsx                    # Entry point
│
├── pages/                      # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── TableManagementPage.tsx
│   └── MenuManagementPage.tsx
│
├── features/                   # Feature-specific components (grouped by domain)
│   ├── dashboard/
│   │   ├── TableCard.tsx
│   │   └── OrderDetailModal.tsx
│   ├── tables/
│   │   ├── TableSetupForm.tsx
│   │   └── OrderHistoryModal.tsx
│   └── menus/
│       ├── MenuForm.tsx
│       └── MenuList.tsx
│
├── common/                     # Shared components
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── LoadingSpinner.tsx
│   └── EmptyState.tsx
│
├── contexts/                   # React Context
│   └── AdminAppContext.tsx
│
├── hooks/                      # Custom Hooks
│   ├── useSSE.ts
│   ├── useAuth.ts
│   └── useApi.ts
│
├── services/                   # API clients
│   ├── api.ts                  # Real API
│   ├── mockApi.ts              # Mock API
│   ├── sse.ts                  # Real SSE
│   └── mockSse.ts              # Mock SSE
│
├── types/                      # TypeScript types
│   └── index.ts                # Day 0 contract types
│
├── utils/                      # Utility functions
│   ├── errorHandling.ts
│   └── validation.ts
│
└── styles/                     # Global styles
    └── index.css
```

---

## Component Decomposition

답변: **B) 일부 분해**

복잡한 컴포넌트만 서브 컴포넌트로 분해:

### 분해 대상:
1. **MenuForm** → `MenuFormFields` + `MenuFormActions`
2. **OrderDetailModal** → `OrderDetailHeader` + `OrderDetailBody` + `OrderDetailActions`
3. **TableCard** → `TableCardHeader` + `TableCardOrders` + `TableCardFooter`

### 유지:
- 나머지 컴포넌트는 현재 크기 유지 (충분히 작고 단순)

---

## Component Specifications

### 1. Root Component

#### AdminApp
**Type**: Root Container  
**File**: `src/App.tsx`  
**Purpose**: 애플리케이션 루트, 전역 설정 및 라우팅

**Props**: None

**State**:
- N/A (Context Provider로 전역 상태 제공)

**Structure**:
```tsx
<AdminAppProvider>
  <ErrorBoundary>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/tables" element={<PrivateRoute><TableManagementPage /></PrivateRoute>} />
        <Route path="/menus" element={<PrivateRoute><MenuManagementPage /></PrivateRoute>} />
      </Routes>
    </Router>
  </ErrorBoundary>
</AdminAppProvider>
```

**Dependencies**:
- react-router-dom
- AdminAppContext
- ErrorBoundary (utility)

**Lifecycle**:
1. Mount: AdminAppContext 초기화
2. 인증 상태 체크
3. 라우팅 처리

---

### 2. Page Components

#### LoginPage
**Type**: Page  
**File**: `src/pages/LoginPage.tsx`  
**Purpose**: 관리자 로그인

**Props**: None

**State**:
```tsx
interface LoginPageState {
  username: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}
```

**UI Elements**:
- Username input (text)
- Password input (password)
- Login button
- Error message display

**User Actions**:
1. 사용자명 입력
2. 비밀번호 입력
3. "로그인" 버튼 클릭
4. 로그인 성공 → Dashboard로 리다이렉트
5. 로그인 실패 → 에러 메시지 표시 (Inline + Toast)

**Validation**:
- Username: required, min 3 characters
- Password: required, min 6 characters

**API Integration**:
- `POST /api/auth/login/admin`
- JWT 토큰을 Cookie로 수신
- AdminAppContext 상태 업데이트

**Error Handling**:
- 401 Unauthorized → "로그인 실패: 인증 정보를 확인하세요"
- 429 Too Many Requests → "너무 많은 로그인 시도. 5분 후 다시 시도하세요"
- Network error → "네트워크 오류가 발생했습니다"

---

#### DashboardPage
**Type**: Page  
**File**: `src/pages/DashboardPage.tsx`  
**Purpose**: 실시간 주문 대시보드

**Props**: None

**State**:
```tsx
interface DashboardPageState {
  tables: TableWithOrders[];
  isLoading: boolean;
  selectedTable: number | null;
  sseConnected: boolean;
  newOrderIds: Set<number>; // 신규 주문 강조용
}

interface TableWithOrders {
  table: Table;
  orders: Order[];
  totalAmount: number;
}
```

**UI Layout**:
- Header: "실시간 주문 대시보드" + SSE 연결 상태 표시
- Grid: 테이블 카드 (3-4 columns, responsive)
- Modal: OrderDetailModal (테이블 클릭 시)

**Child Components**:
- `TableCard` (여러 개) - 각 테이블당 1개
- `OrderDetailModal` (조건부 렌더링)

**User Actions**:
1. 페이지 로드 → 테이블 목록 조회
2. SSE 연결 시작
3. 테이블 카드 클릭 → OrderDetailModal 열기
4. 신규 주문 수신 → 해당 테이블 카드 강조

**SSE Integration**:
- useSSE Hook 사용
- `/api/events/orders` 엔드포인트 연결
- 이벤트 타입:
  - `order.created` → 주문 추가 + 강조
  - `order.updated` → 주문 상태 업데이트
  - `order.deleted` → 주문 제거
- Exponential Backoff 재연결 (1s, 2s, 4s, 8s, 16s)

**Data Flow**:
1. Initial load: `GET /api/orders?include=items,menu,table`
2. SSE events: Direct state update
3. Manual refresh: Re-fetch orders

---

#### TableManagementPage
**Type**: Page  
**File**: `src/pages/TableManagementPage.tsx`  
**Purpose**: 테이블 관리 (초기 설정, 세션 종료, 과거 내역)

**Props**: None

**State**:
```tsx
interface TableManagementPageState {
  tables: Table[];
  isLoading: boolean;
  showSetupForm: boolean;
  showHistoryModal: boolean;
  selectedTableId: number | null;
}
```

**UI Layout**:
- Header: "테이블 관리" + "테이블 추가" 버튼
- Table List: 테이블 번호, 현재 세션, 액션 버튼
- Modals: TableSetupForm, OrderHistoryModal

**Child Components**:
- `TableSetupForm` (조건부 렌더링)
- `OrderHistoryModal` (조건부 렌더링)

**User Actions**:
1. 테이블 목록 조회
2. "테이블 추가" → TableSetupForm 열기
3. "세션 종료" → 확인 팝업 → API 호출
4. "과거 내역" → OrderHistoryModal 열기

**API Integration**:
- `GET /api/tables` - 테이블 목록
- `POST /api/tables/:id/complete` - 세션 종료

---

#### MenuManagementPage
**Type**: Page  
**File**: `src/pages/MenuManagementPage.tsx`  
**Purpose**: 메뉴 CRUD 관리

**Props**: None

**State**:
```tsx
interface MenuManagementPageState {
  menus: Menu[];
  categories: MenuCategory[];
  isLoading: boolean;
  showMenuForm: boolean;
  editingMenu: Menu | null;
}
```

**UI Layout**:
- Header: "메뉴 관리" + "메뉴 추가" 버튼
- Menu List: 카테고리별 그룹화, 편집/삭제 버튼
- Modal: MenuForm (등록/수정)

**Child Components**:
- `MenuList`
- `MenuForm` (조건부 렌더링)

**User Actions**:
1. 메뉴 목록 조회 (카테고리별)
2. "메뉴 추가" → MenuForm 열기 (mode: create)
3. "편집" → MenuForm 열기 (mode: edit)
4. "삭제" → 확인 팝업 → API 호출

**API Integration**:
- `GET /api/menus?include=category` - 메뉴 목록
- `POST /api/menus` - 메뉴 생성
- `PUT /api/menus/:id` - 메뉴 수정
- `DELETE /api/menus/:id` - 메뉴 삭제

---

### 3. Feature Components

#### TableCard
**Type**: Feature Component  
**File**: `src/features/dashboard/TableCard.tsx`  
**Purpose**: 대시보드의 테이블 카드

**Props**:
```tsx
interface TableCardProps {
  table: Table;
  orders: Order[];
  totalAmount: number;
  isNewOrder: boolean; // 신규 주문 강조
  onClick: () => void;
}
```

**Sub-components**:
- `TableCardHeader` - 테이블 번호, 총액
- `TableCardOrders` - 최신 주문 3개 미리보기
- `TableCardFooter` - "자세히 보기" 버튼

**UI Structure**:
```
┌────────────────────────────┐
│ TableCardHeader            │
│ 테이블 #5  | ₩45,000      │
├────────────────────────────┤
│ TableCardOrders            │
│ • 주문 #123: 피자 x2      │
│ • 주문 #124: 파스타 x1    │
│ • 주문 #125: 콜라 x3      │
├────────────────────────────┤
│ TableCardFooter            │
│ [자세히 보기]             │
└────────────────────────────┘
```

**Visual Effects**:
- 신규 주문 강조: `isNewOrder === true`
  - 배경색: 노란색 하이라이트 (#FFF9C4)
  - 애니메이션: Bounce effect (3초 후 제거)
- 일반 상태: 흰색 배경

**User Actions**:
- 카드 클릭 → `onClick()` 실행 → OrderDetailModal 열기

---

#### OrderDetailModal
**Type**: Feature Component  
**File**: `src/features/dashboard/OrderDetailModal.tsx`  
**Purpose**: 주문 상세 정보 및 액션

**Props**:
```tsx
interface OrderDetailModalProps {
  isOpen: boolean;
  table: Table;
  orders: Order[];
  onClose: () => void;
  onStatusChange: (orderId: number, status: OrderStatus) => Promise<void>;
  onDelete: (orderId: number) => Promise<void>;
}
```

**Sub-components**:
- `OrderDetailHeader` - 테이블 번호, 총액, 닫기 버튼
- `OrderDetailBody` - 전체 주문 목록
- `OrderDetailActions` - 주문별 액션 (상태 변경, 삭제)

**UI Structure**:
```
┌─────────────────────────────────────┐
│ OrderDetailHeader                   │
│ 테이블 #5 | 총액: ₩45,000    [X]  │
├─────────────────────────────────────┤
│ OrderDetailBody                     │
│ ┌─ 주문 #123 ─────────────────┐   │
│ │ 시각: 14:30                  │   │
│ │ 피자 x2 - ₩30,000           │   │
│ │ 상태: [Dropdown] 준비중      │   │
│ │ [삭제]                       │   │
│ └──────────────────────────────┘   │
│ ┌─ 주문 #124 ─────────────────┐   │
│ │ ...                          │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

**User Actions**:
1. 상태 드롭다운 선택 → `onStatusChange()` 호출
2. "삭제" 버튼 클릭 → 확인 팝업 → `onDelete()` 호출
3. "X" 또는 외부 클릭 → `onClose()` 호출

**Status Dropdown**:
- Options: ["대기중", "준비중", "완료"]
- Hybrid validation: Frontend에서 허용된 전환만 표시
  - pending → [preparing, completed]
  - preparing → [completed]
  - completed → [] (변경 불가)

---

#### TableSetupForm
**Type**: Feature Component  
**File**: `src/features/tables/TableSetupForm.tsx`  
**Purpose**: 테이블 초기 설정 폼

**Props**:
```tsx
interface TableSetupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tableNumber: number, password: string) => Promise<void>;
}
```

**State**:
```tsx
interface TableSetupFormState {
  tableNumber: number | '';
  password: string;
  errors: {
    tableNumber?: string;
    password?: string;
  };
  isSubmitting: boolean;
}
```

**UI Elements**:
- Table Number input (number)
- Password input (password)
- "설정 완료" button
- "취소" button

**Validation Rules**:
- tableNumber: required, integer, > 0
- password: required, min 4 characters

**User Actions**:
1. 입력 필드 작성
2. "설정 완료" → 검증 → API 호출 → 성공 시 `onClose()`
3. "취소" → `onClose()`

**Error Display**: Inline errors (각 필드 아래)

---

#### OrderHistoryModal
**Type**: Feature Component  
**File**: `src/features/tables/OrderHistoryModal.tsx`  
**Purpose**: 과거 주문 내역 조회

**Props**:
```tsx
interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**State**:
```tsx
interface OrderHistoryModalState {
  history: OrderHistory[];
  isLoading: boolean;
  filters: {
    tableId?: number;
    startDate?: string;
    endDate?: string;
  };
}
```

**UI Elements**:
- Filter: Table selector, Date range picker
- History List: 주문 번호, 시각, 메뉴, 총액, 완료 시각
- Pagination

**User Actions**:
1. 필터 선택 → API 재호출
2. 주문 클릭 → 상세 정보 확장
3. "닫기" → `onClose()`

**API Integration**:
- `GET /api/orders/history?table_id=&start_date=&end_date=`

---

#### MenuForm
**Type**: Feature Component  
**File**: `src/features/menus/MenuForm.tsx`  
**Purpose**: 메뉴 등록/수정 폼

**Props**:
```tsx
interface MenuFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  menu?: Menu; // edit 모드일 때만
  categories: MenuCategory[];
  onClose: () => void;
  onSubmit: (menuData: MenuFormData) => Promise<void>;
}

interface MenuFormData {
  name: string;
  category_id: number;
  price: number;
  description: string;
  is_available: boolean;
}
```

**Sub-components**:
- `MenuFormFields` - 입력 필드들
- `MenuFormActions` - 저장/취소 버튼

**State**:
```tsx
interface MenuFormState extends MenuFormData {
  errors: {
    name?: string;
    category_id?: string;
    price?: string;
  };
  isSubmitting: boolean;
}
```

**UI Elements**:
- Name input (text)
- Category select (dropdown)
- Price input (number)
- Description textarea
- Available checkbox
- "저장" button
- "취소" button

**Validation Rules**:
- name: required, min 2 characters, max 50
- category_id: required
- price: required, integer, >= 0
- description: optional, max 200 characters

**Error Display**: Hybrid (Inline + Toast)

---

#### MenuList
**Type**: Feature Component  
**File**: `src/features/menus/MenuList.tsx`  
**Purpose**: 메뉴 목록 표시

**Props**:
```tsx
interface MenuListProps {
  menus: Menu[];
  onEdit: (menu: Menu) => void;
  onDelete: (menuId: number) => void;
}
```

**UI Structure**:
- 카테고리별 그룹화
- 각 메뉴: 이름, 가격, 설명, 편집/삭제 버튼

**User Actions**:
1. "편집" 버튼 → `onEdit(menu)` 호출
2. "삭제" 버튼 → 확인 팝업 → `onDelete(menuId)` 호출

---

### 4. Common Components

#### Button
**Type**: Common Component  
**File**: `src/common/Button.tsx`

**Props**:
```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  isLoading?: boolean;
}
```

**Variants**:
- primary: 파란색 배경, 흰색 텍스트
- secondary: 회색 배경, 검은색 텍스트
- danger: 빨간색 배경, 흰색 텍스트

---

#### Modal
**Type**: Common Component  
**File**: `src/common/Modal.tsx`

**Props**:
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

**Features**:
- Overlay (반투명 검은색)
- ESC key → onClose()
- 외부 클릭 → onClose()

---

#### LoadingSpinner
**Type**: Common Component  
**File**: `src/common/LoadingSpinner.tsx`

**Props**:
```tsx
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}
```

---

#### EmptyState
**Type**: Common Component  
**File**: `src/common/EmptyState.tsx`

**Props**:
```tsx
interface EmptyStateProps {
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Examples**:
- "주문 내역이 없습니다"
- "메뉴가 없습니다" + "메뉴 추가" 버튼

---

## Component Interaction Matrix

| Component | Uses Components | Used By | Context | Hooks | APIs |
|---|---|---|---|---|---|
| AdminApp | All Pages, PrivateRoute, ErrorBoundary | - | AdminAppContext (provides) | - | - |
| LoginPage | Button, LoadingSpinner | AdminApp | AdminAppContext (consumes) | useAuth | POST /auth/login/admin |
| DashboardPage | TableCard, OrderDetailModal | AdminApp | AdminAppContext | useSSE, useApi | GET /orders, SSE /events/orders |
| TableManagementPage | TableSetupForm, OrderHistoryModal | AdminApp | AdminAppContext | useApi | GET /tables, POST /tables/:id/complete |
| MenuManagementPage | MenuForm, MenuList | AdminApp | AdminAppContext | useApi | GET /menus, POST/PUT/DELETE /menus |
| TableCard | - | DashboardPage | - | - | - |
| OrderDetailModal | Button, Modal | DashboardPage | - | - | PATCH /orders/:id/status, DELETE /orders/:id |
| TableSetupForm | Button, Modal | TableManagementPage | - | - | POST /tables |
| OrderHistoryModal | Modal, LoadingSpinner, EmptyState | TableManagementPage | - | useApi | GET /orders/history |
| MenuForm | Button, Modal | MenuManagementPage | - | - | - |
| MenuList | Button | MenuManagementPage | - | - | - |

---

## Component Count Summary

**Total Components**: 20 (17 original + 3 sub-components)

**By Type**:
- Root: 1 (AdminApp)
- Pages: 4 (Login, Dashboard, Tables, Menus)
- Features: 9 (TableCard x3 sub, OrderDetailModal x3 sub, MenuForm x2 sub, MenuList, TableSetupForm, OrderHistoryModal)
- Common: 4 (Button, Modal, LoadingSpinner, EmptyState)
- Context: 1 (AdminAppContext)
- Hooks: 3 (useSSE, useAuth, useApi)

---

## Technology Stack

- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: react-router-dom
- **State**: React Context API
- **HTTP Client**: fetch API
- **SSE**: EventSource API (native)
- **Styling**: CSS Modules or Tailwind CSS (TBD in NFR Design)

---

## Next Steps

1. State Management 설계 (state-management.md)
2. User Interaction Flows 정의 (interaction-flows.md)
3. Form Validation Rules 상세화 (form-validation.md)
4. Business Rules 정의 (business-rules.md)
