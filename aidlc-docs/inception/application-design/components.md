# Component Definitions

테이블오더 서비스의 주요 컴포넌트를 정의합니다.

---

## Frontend Components

### 1. Customer Frontend Components (고객용)

#### 1.1 Page/Screen Components

**CustomerApp**
- **Purpose**: 고객용 애플리케이션의 루트 컴포넌트
- **Responsibilities**:
  - 라우팅 설정
  - 전역 상태 관리 (Context Provider)
  - 자동 로그인 처리
  - 레이아웃 구조
- **Interface**: N/A (Root component)

**MenuPage**
- **Purpose**: 메뉴 조회 및 탐색 화면
- **Responsibilities**:
  - 메뉴 카테고리 표시
  - 카테고리별 메뉴 목록 표시
  - 메뉴 상세 정보 표시
  - 장바구니 추가 액션
- **Interface**: Props (category filter, search)

**CartPage**
- **Purpose**: 장바구니 관리 화면
- **Responsibilities**:
  - 장바구니 아이템 목록 표시
  - 수량 조절 UI
  - 총액 계산 표시
  - 주문 확정 액션
- **Interface**: Props (cart items from context)

**OrderHistoryPage**
- **Purpose**: 주문 내역 조회 화면
- **Responsibilities**:
  - 현재 세션 주문 목록 표시
  - 주문 상세 정보 표시
  - 주문 상태 표시
- **Interface**: Props (session ID)

#### 1.2 Feature Components

**MenuCategoryList**
- **Purpose**: 메뉴 카테고리 목록 표시
- **Responsibilities**:
  - 카테고리 버튼 렌더링
  - 카테고리 선택 처리
  - 활성 카테고리 강조
- **Interface**: Props (categories, onSelectCategory)

**MenuCard**
- **Purpose**: 개별 메뉴 아이템 표시
- **Responsibilities**:
  - 메뉴 이미지, 이름, 가격, 설명 표시
  - "장바구니에 추가" 버튼
  - 메뉴 상세 모달 트리거
- **Interface**: Props (menu item, onAddToCart)

**CartItem**
- **Purpose**: 장바구니 개별 아이템
- **Responsibilities**:
  - 아이템 정보 표시 (이름, 가격, 수량)
  - 수량 증가/감소 버튼
  - 삭제 버튼
- **Interface**: Props (item, onUpdateQuantity, onRemove)

**OrderCard**
- **Purpose**: 주문 내역 카드
- **Responsibilities**:
  - 주문 번호, 시각, 메뉴 목록 표시
  - 주문 상태 표시
  - 주문 총액 표시
- **Interface**: Props (order)

#### 1.3 Common/Shared Components

**Button**
- **Purpose**: 재사용 가능한 버튼 컴포넌트
- **Responsibilities**: 일관된 버튼 스타일 및 동작
- **Interface**: Props (label, onClick, variant, disabled)

**Modal**
- **Purpose**: 모달 다이얼로그
- **Responsibilities**: 모달 오버레이, 닫기 기능
- **Interface**: Props (isOpen, onClose, children)

**LoadingSpinner**
- **Purpose**: 로딩 인디케이터
- **Responsibilities**: 로딩 상태 시각화
- **Interface**: Props (size, color)

**EmptyState**
- **Purpose**: 빈 상태 표시
- **Responsibilities**: "아이템 없음" 메시지 표시
- **Interface**: Props (message, icon)

---

### 2. Admin Frontend Components (관리자용)

#### 2.1 Page/Screen Components

**AdminApp**
- **Purpose**: 관리자용 애플리케이션의 루트 컴포넌트
- **Responsibilities**:
  - 라우팅 설정
  - 전역 상태 관리 (Context Provider)
  - 인증 상태 관리
  - 레이아웃 구조 (헤더, 사이드바)
- **Interface**: N/A (Root component)

**LoginPage**
- **Purpose**: 관리자 로그인 화면
- **Responsibilities**:
  - 로그인 폼 (매장 ID, 사용자명, 비밀번호)
  - 로그인 요청 처리
  - 에러 메시지 표시
- **Interface**: Props (onLoginSuccess)

**DashboardPage**
- **Purpose**: 실시간 주문 대시보드
- **Responsibilities**:
  - 테이블별 주문 현황 그리드 표시
  - SSE로 실시간 주문 수신
  - 신규 주문 강조
  - 테이블 필터링
- **Interface**: Props (store ID)

**TableManagementPage**
- **Purpose**: 테이블 관리 화면
- **Responsibilities**:
  - 테이블 목록 표시
  - 테이블 초기 설정
  - 세션 종료 액션
  - 과거 주문 내역 조회
- **Interface**: Props (store ID)

**MenuManagementPage**
- **Purpose**: 메뉴 관리 화면
- **Responsibilities**:
  - 메뉴 목록 표시
  - 메뉴 CRUD 액션
  - 카테고리 관리
- **Interface**: Props (store ID)

#### 2.2 Feature Components

**TableCard**
- **Purpose**: 대시보드의 테이블 카드
- **Responsibilities**:
  - 테이블 번호, 총 주문액 표시
  - 최신 주문 3개 미리보기
  - 클릭 시 상세 모달
  - 신규 주문 강조 애니메이션
- **Interface**: Props (table info, orders, onClick)

**OrderDetailModal**
- **Purpose**: 주문 상세 모달
- **Responsibilities**:
  - 전체 주문 목록 표시
  - 주문 상태 변경 드롭다운
  - 주문 삭제 버튼
- **Interface**: Props (table ID, orders, onStatusChange, onDelete, onClose)

**TableSetupForm**
- **Purpose**: 테이블 초기 설정 폼
- **Responsibilities**:
  - 테이블 번호 입력
  - 테이블 비밀번호 입력
  - 설정 제출
- **Interface**: Props (onSubmit)

**OrderHistoryModal**
- **Purpose**: 과거 주문 내역 모달
- **Responsibilities**:
  - 과거 주문 목록 표시
  - 날짜 필터링
  - 테이블 필터링
- **Interface**: Props (store ID, onClose)

**MenuForm**
- **Purpose**: 메뉴 등록/수정 폼
- **Responsibilities**:
  - 메뉴 정보 입력 필드
  - 유효성 검증
  - 제출 처리
- **Interface**: Props (menu, onSubmit, mode: create/edit)

**MenuList**
- **Purpose**: 메뉴 목록 표시
- **Responsibilities**:
  - 카테고리별 메뉴 그룹화
  - 메뉴 수정/삭제 액션
- **Interface**: Props (menus, onEdit, onDelete)

#### 2.3 Common/Shared Components

동일한 공통 컴포넌트 사용 (Button, Modal, LoadingSpinner, EmptyState)

---

## Backend Components

### 3. API Layer (Controller/Router)

**CustomerRouter**
- **Purpose**: 고객용 API 라우트 그룹
- **Responsibilities**:
  - POST /api/customer/login - 테이블 로그인
  - GET /api/customer/menus - 메뉴 조회
  - POST /api/customer/orders - 주문 생성
  - GET /api/customer/orders - 주문 내역 조회
- **Interface**: FastAPI APIRouter

**AdminRouter**
- **Purpose**: 관리자용 API 라우트 그룹
- **Responsibilities**:
  - POST /api/admin/login - 관리자 로그인
  - GET /api/admin/orders/stream - SSE 실시간 주문 스트림
  - GET /api/admin/orders - 주문 목록 조회
  - PATCH /api/admin/orders/{order_id}/status - 주문 상태 변경
  - DELETE /api/admin/orders/{order_id} - 주문 삭제
  - POST /api/admin/tables/{table_id}/complete - 테이블 세션 종료
  - GET /api/admin/orders/history - 과거 주문 내역
- **Interface**: FastAPI APIRouter

**MenuRouter**
- **Purpose**: 메뉴 관리 API 라우트 그룹
- **Responsibilities**:
  - GET /api/admin/menus - 메뉴 목록 조회
  - POST /api/admin/menus - 메뉴 등록
  - PUT /api/admin/menus/{menu_id} - 메뉴 수정
  - DELETE /api/admin/menus/{menu_id} - 메뉴 삭제
- **Interface**: FastAPI APIRouter

---

### 4. Service Layer

**AuthService**
- **Purpose**: 인증 및 권한 관리
- **Responsibilities**:
  - 테이블 로그인 검증
  - 관리자 로그인 검증
  - JWT 토큰 생성 및 검증
  - 세션 관리
  - 비밀번호 해싱 및 검증
- **Interface**: Service methods

**OrderService**
- **Purpose**: 주문 비즈니스 로직
- **Responsibilities**:
  - 주문 생성 및 검증
  - 주문 상태 변경
  - 주문 조회 (현재 세션, 테이블별, 전체)
  - 주문 삭제
  - 주문 이력 아카이빙
  - SSE 이벤트 생성 및 전송
- **Interface**: Service methods

**TableService**
- **Purpose**: 테이블 관리 비즈니스 로직
- **Responsibilities**:
  - 테이블 세션 생성
  - 테이블 세션 종료 (이용 완료)
  - 테이블 상태 조회
  - 테이블별 주문 집계
- **Interface**: Service methods

**MenuService**
- **Purpose**: 메뉴 관리 비즈니스 로직
- **Responsibilities**:
  - 메뉴 CRUD
  - 카테고리별 메뉴 조회
  - 메뉴 유효성 검증
  - 메뉴 노출 순서 관리
- **Interface**: Service methods

---

### 5. Data Access Layer (Repository)

**OrderRepository**
- **Purpose**: 주문 데이터 접근
- **Responsibilities**:
  - 주문 생성, 조회, 수정, 삭제
  - 주문 아이템 관리
  - 주문 이력 저장 및 조회
  - 복잡한 주문 쿼리
- **Interface**: Repository methods (CRUD + custom queries)

**TableRepository**
- **Purpose**: 테이블 데이터 접근
- **Responsibilities**:
  - 테이블 조회 및 수정
  - 테이블 세션 CRUD
  - 테이블별 데이터 집계
- **Interface**: Repository methods (CRUD + custom queries)

**MenuRepository**
- **Purpose**: 메뉴 데이터 접근
- **Responsibilities**:
  - 메뉴 CRUD
  - 카테고리 CRUD
  - 메뉴-카테고리 조인 쿼리
- **Interface**: Repository methods (CRUD + custom queries)

**AdminRepository**
- **Purpose**: 관리자 데이터 접근
- **Responsibilities**:
  - 관리자 조회 (인증용)
  - 관리자 CRUD (시드 데이터)
- **Interface**: Repository methods (CRUD)

**StoreRepository**
- **Purpose**: 매장 데이터 접근
- **Responsibilities**:
  - 매장 조회
  - 매장 CRUD (시드 데이터)
- **Interface**: Repository methods (CRUD)

---

### 6. Data Models (SQLAlchemy ORM)

**Store**
- **Purpose**: 매장 엔티티
- **Responsibilities**: 매장 정보 표현
- **Interface**: SQLAlchemy Model

**Table**
- **Purpose**: 테이블 엔티티
- **Responsibilities**: 테이블 정보 및 현재 세션 추적
- **Interface**: SQLAlchemy Model

**TableSession**
- **Purpose**: 테이블 세션 엔티티
- **Responsibilities**: 테이블 이용 세션 추적
- **Interface**: SQLAlchemy Model

**Admin**
- **Purpose**: 관리자 엔티티
- **Responsibilities**: 관리자 정보 및 인증
- **Interface**: SQLAlchemy Model

**MenuCategory**
- **Purpose**: 메뉴 카테고리 엔티티
- **Responsibilities**: 메뉴 분류
- **Interface**: SQLAlchemy Model

**Menu**
- **Purpose**: 메뉴 엔티티
- **Responsibilities**: 메뉴 정보 표현
- **Interface**: SQLAlchemy Model

**Order**
- **Purpose**: 주문 엔티티
- **Responsibilities**: 주문 헤더 정보
- **Interface**: SQLAlchemy Model

**OrderItem**
- **Purpose**: 주문 아이템 엔티티
- **Responsibilities**: 주문 상세 라인 아이템
- **Interface**: SQLAlchemy Model

**OrderHistory**
- **Purpose**: 과거 주문 이력 엔티티
- **Responsibilities**: 완료된 주문 아카이브
- **Interface**: SQLAlchemy Model

---

### 7. Utilities and Helpers

**JWTUtil**
- **Purpose**: JWT 토큰 유틸리티
- **Responsibilities**:
  - 토큰 생성
  - 토큰 검증 및 디코딩
  - 토큰 만료 확인
- **Interface**: Utility functions

**PasswordUtil**
- **Purpose**: 비밀번호 해싱 유틸리티
- **Responsibilities**:
  - bcrypt 해싱
  - 비밀번호 검증
- **Interface**: Utility functions

**SSEManager**
- **Purpose**: SSE 연결 관리
- **Responsibilities**:
  - SSE 클라이언트 연결 추적
  - 이벤트 브로드캐스트
  - 연결 종료 처리
- **Interface**: Manager class

**DatabaseSession**
- **Purpose**: 데이터베이스 세션 관리
- **Responsibilities**:
  - SQLAlchemy 세션 생성
  - 트랜잭션 관리
  - 세션 정리
- **Interface**: Context manager

**SeedDataLoader**
- **Purpose**: 시드 데이터 로더
- **Responsibilities**:
  - 초기 데이터 생성
  - 데이터 무결성 확인
- **Interface**: Loader functions

---

## Component Count Summary

- **Customer Frontend**: 13 components (4 pages + 4 features + 5 common)
- **Admin Frontend**: 17 components (5 pages + 7 features + 5 common)
- **Backend API**: 3 routers
- **Backend Services**: 4 services
- **Backend Repositories**: 5 repositories
- **Data Models**: 9 models
- **Utilities**: 5 utilities

**Total**: 56 components
