# Component Methods

각 컴포넌트의 주요 메서드 시그니처와 목적을 정의합니다.

**Note**: 상세한 비즈니스 로직은 Functional Design (CONSTRUCTION 단계)에서 정의됩니다.

---

## Frontend Components - Customer

### MenuPage
```typescript
interface MenuPageMethods {
  // 메뉴 데이터 로드
  fetchMenus(): Promise<Menu[]>
  
  // 카테고리 선택 처리
  handleCategorySelect(categoryId: string): void
  
  // 장바구니에 메뉴 추가
  handleAddToCart(menuId: string, quantity: number): void
  
  // 메뉴 상세 모달 열기
  handleMenuDetail(menuId: string): void
}
```

### CartPage
```typescript
interface CartPageMethods {
  // 장바구니 아이템 로드 (LocalStorage)
  loadCartItems(): CartItem[]
  
  // 수량 업데이트
  handleUpdateQuantity(itemId: string, quantity: number): void
  
  // 아이템 삭제
  handleRemoveItem(itemId: string): void
  
  // 장바구니 비우기
  handleClearCart(): void
  
  // 주문 확정
  handleCheckout(): Promise<void>
  
  // 총액 계산
  calculateTotal(): number
}
```

### OrderHistoryPage
```typescript
interface OrderHistoryPageMethods {
  // 주문 내역 로드
  fetchOrders(sessionId: string): Promise<Order[]>
  
  // 주문 상세 보기
  handleViewOrderDetail(orderId: string): void
  
  // 주문 상태 폴링 (선택사항)
  pollOrderStatus(): void
}
```

---

## Frontend Components - Admin

### LoginPage
```typescript
interface LoginPageMethods {
  // 로그인 폼 제출
  handleLogin(credentials: AdminCredentials): Promise<void>
  
  // 폼 유효성 검증
  validateForm(): boolean
  
  // 에러 메시지 표시
  showError(message: string): void
}
```

### DashboardPage
```typescript
interface DashboardPageMethods {
  // SSE 연결 초기화
  initializeSSE(): EventSource
  
  // SSE 이벤트 핸들러
  handleNewOrder(orderData: Order): void
  
  // 초기 주문 데이터 로드
  fetchInitialOrders(): Promise<Order[]>
  
  // 테이블 필터링
  handleFilterTable(tableId: string): void
  
  // 주문 상세 모달 열기
  handleViewOrderDetail(tableId: string): void
  
  // SSE 연결 종료
  cleanupSSE(): void
}
```

### TableManagementPage
```typescript
interface TableManagementPageMethods {
  // 테이블 목록 로드
  fetchTables(): Promise<Table[]>
  
  // 테이블 초기 설정
  handleTableSetup(tableData: TableSetupData): Promise<void>
  
  // 주문 삭제
  handleDeleteOrder(orderId: string): Promise<void>
  
  // 테이블 세션 종료
  handleCompleteSession(tableId: string): Promise<void>
  
  // 과거 주문 내역 조회
  handleViewHistory(tableId: string): void
}
```

### MenuManagementPage
```typescript
interface MenuManagementPageMethods {
  // 메뉴 목록 로드
  fetchMenus(): Promise<Menu[]>
  
  // 메뉴 등록
  handleCreateMenu(menuData: MenuData): Promise<void>
  
  // 메뉴 수정
  handleUpdateMenu(menuId: string, menuData: MenuData): Promise<void>
  
  // 메뉴 삭제
  handleDeleteMenu(menuId: string): Promise<void>
  
  // 폼 모달 열기/닫기
  openMenuForm(mode: 'create' | 'edit', menu?: Menu): void
  closeMenuForm(): void
}
```

---

## Backend Components - Services

### AuthService
```python
class AuthService:
    # 테이블 로그인
    def login_table(
        self, 
        store_id: str, 
        table_number: int, 
        table_password: str
    ) -> TableSession:
        """테이블 자동 로그인 처리"""
        pass
    
    # 관리자 로그인
    def login_admin(
        self, 
        store_id: str, 
        username: str, 
        password: str
    ) -> AdminToken:
        """관리자 인증 및 JWT 토큰 발급"""
        pass
    
    # JWT 토큰 생성
    def create_jwt_token(
        self, 
        user_id: str, 
        user_type: str
    ) -> str:
        """JWT 토큰 생성"""
        pass
    
    # JWT 토큰 검증
    def verify_jwt_token(self, token: str) -> TokenPayload:
        """JWT 토큰 검증 및 디코딩"""
        pass
    
    # 비밀번호 해싱
    def hash_password(self, password: str) -> str:
        """bcrypt를 사용한 비밀번호 해싱"""
        pass
    
    # 비밀번호 검증
    def verify_password(
        self, 
        plain_password: str, 
        hashed_password: str
    ) -> bool:
        """비밀번호 일치 여부 확인"""
        pass
```

### OrderService
```python
class OrderService:
    # 주문 생성
    def create_order(
        self, 
        table_id: str, 
        session_id: str, 
        order_items: List[OrderItemData]
    ) -> Order:
        """주문 생성 및 검증"""
        pass
    
    # 주문 조회 (테이블 세션별)
    def get_orders_by_session(
        self, 
        session_id: str
    ) -> List[Order]:
        """현재 테이블 세션의 주문 목록 조회"""
        pass
    
    # 주문 조회 (매장별)
    def get_orders_by_store(
        self, 
        store_id: str
    ) -> List[Order]:
        """매장의 모든 활성 주문 조회"""
        pass
    
    # 주문 상태 변경
    def update_order_status(
        self, 
        order_id: str, 
        new_status: OrderStatus
    ) -> Order:
        """주문 상태 업데이트"""
        pass
    
    # 주문 삭제
    def delete_order(self, order_id: str) -> bool:
        """주문 삭제 및 총액 재계산"""
        pass
    
    # SSE 이벤트 브로드캐스트
    def broadcast_order_event(
        self, 
        store_id: str, 
        event_type: str, 
        order_data: Order
    ) -> None:
        """실시간 주문 이벤트 전송"""
        pass
    
    # 주문 이력 아카이빙
    def archive_orders(
        self, 
        session_id: str
    ) -> None:
        """세션 종료 시 주문을 이력으로 이동"""
        pass
    
    # 과거 주문 조회
    def get_order_history(
        self, 
        table_id: str, 
        date_filter: Optional[str]
    ) -> List[OrderHistory]:
        """과거 주문 내역 조회"""
        pass
```

### TableService
```python
class TableService:
    # 테이블 세션 생성
    def create_table_session(
        self, 
        table_id: str
    ) -> TableSession:
        """새로운 테이블 세션 시작"""
        pass
    
    # 테이블 세션 종료
    def complete_table_session(
        self, 
        table_id: str
    ) -> bool:
        """테이블 이용 완료 처리"""
        pass
    
    # 테이블 상태 조회
    def get_table_status(
        self, 
        table_id: str
    ) -> TableStatus:
        """테이블의 현재 상태 및 주문 집계"""
        pass
    
    # 테이블 초기 설정
    def setup_table(
        self, 
        table_id: str, 
        table_number: int, 
        table_password: str
    ) -> Table:
        """테이블 태블릿 초기 설정"""
        pass
    
    # 테이블별 주문 집계
    def get_table_order_summary(
        self, 
        table_id: str
    ) -> TableOrderSummary:
        """테이블의 총 주문액 및 주문 목록"""
        pass
```

### MenuService
```python
class MenuService:
    # 메뉴 조회 (카테고리별)
    def get_menus_by_category(
        self, 
        store_id: str, 
        category_id: Optional[str]
    ) -> List[Menu]:
        """카테고리별 메뉴 조회"""
        pass
    
    # 메뉴 생성
    def create_menu(
        self, 
        menu_data: MenuCreateData
    ) -> Menu:
        """새 메뉴 등록 및 유효성 검증"""
        pass
    
    # 메뉴 수정
    def update_menu(
        self, 
        menu_id: str, 
        menu_data: MenuUpdateData
    ) -> Menu:
        """메뉴 정보 수정"""
        pass
    
    # 메뉴 삭제
    def delete_menu(self, menu_id: str) -> bool:
        """메뉴 삭제"""
        pass
    
    # 메뉴 유효성 검증
    def validate_menu_data(
        self, 
        menu_data: MenuData
    ) -> ValidationResult:
        """메뉴 데이터 유효성 검증"""
        pass
    
    # 카테고리 조회
    def get_categories(self, store_id: str) -> List[MenuCategory]:
        """매장의 메뉴 카테고리 목록"""
        pass
```

---

## Backend Components - Repositories

### OrderRepository
```python
class OrderRepository:
    # 기본 CRUD
    def create(self, order: Order) -> Order:
        """주문 생성"""
        pass
    
    def get_by_id(self, order_id: str) -> Optional[Order]:
        """주문 ID로 조회"""
        pass
    
    def update(self, order: Order) -> Order:
        """주문 업데이트"""
        pass
    
    def delete(self, order_id: str) -> bool:
        """주문 삭제"""
        pass
    
    # 커스텀 쿼리
    def get_by_session(self, session_id: str) -> List[Order]:
        """세션별 주문 조회"""
        pass
    
    def get_by_store(self, store_id: str) -> List[Order]:
        """매장별 활성 주문 조회"""
        pass
    
    def get_by_table(self, table_id: str) -> List[Order]:
        """테이블별 주문 조회"""
        pass
    
    # OrderItem 관련
    def create_order_items(
        self, 
        order_id: str, 
        items: List[OrderItemData]
    ) -> List[OrderItem]:
        """주문 아이템 생성"""
        pass
    
    # OrderHistory 관련
    def archive_orders_to_history(
        self, 
        session_id: str
    ) -> int:
        """주문을 이력으로 이동"""
        pass
    
    def get_order_history(
        self, 
        table_id: str, 
        filters: HistoryFilters
    ) -> List[OrderHistory]:
        """과거 주문 조회"""
        pass
```

### TableRepository
```python
class TableRepository:
    # 기본 CRUD
    def create(self, table: Table) -> Table:
        """테이블 생성"""
        pass
    
    def get_by_id(self, table_id: str) -> Optional[Table]:
        """테이블 ID로 조회"""
        pass
    
    def update(self, table: Table) -> Table:
        """테이블 업데이트"""
        pass
    
    # 커스텀 쿼리
    def get_by_store(self, store_id: str) -> List[Table]:
        """매장별 테이블 목록"""
        pass
    
    def get_by_table_number(
        self, 
        store_id: str, 
        table_number: int
    ) -> Optional[Table]:
        """테이블 번호로 조회"""
        pass
    
    # TableSession 관련
    def create_session(self, session: TableSession) -> TableSession:
        """테이블 세션 생성"""
        pass
    
    def get_active_session(
        self, 
        table_id: str
    ) -> Optional[TableSession]:
        """활성 세션 조회"""
        pass
    
    def complete_session(
        self, 
        session_id: str
    ) -> TableSession:
        """세션 종료"""
        pass
```

### MenuRepository
```python
class MenuRepository:
    # 기본 CRUD
    def create(self, menu: Menu) -> Menu:
        """메뉴 생성"""
        pass
    
    def get_by_id(self, menu_id: str) -> Optional[Menu]:
        """메뉴 ID로 조회"""
        pass
    
    def update(self, menu: Menu) -> Menu:
        """메뉴 업데이트"""
        pass
    
    def delete(self, menu_id: str) -> bool:
        """메뉴 삭제"""
        pass
    
    # 커스텀 쿼리
    def get_by_store(self, store_id: str) -> List[Menu]:
        """매장별 메뉴 목록"""
        pass
    
    def get_by_category(
        self, 
        category_id: str
    ) -> List[Menu]:
        """카테고리별 메뉴 조회"""
        pass
    
    # MenuCategory 관련
    def create_category(
        self, 
        category: MenuCategory
    ) -> MenuCategory:
        """카테고리 생성"""
        pass
    
    def get_categories(
        self, 
        store_id: str
    ) -> List[MenuCategory]:
        """매장 카테고리 목록"""
        pass
```

### AdminRepository
```python
class AdminRepository:
    # 기본 CRUD
    def create(self, admin: Admin) -> Admin:
        """관리자 생성"""
        pass
    
    def get_by_id(self, admin_id: str) -> Optional[Admin]:
        """관리자 ID로 조회"""
        pass
    
    # 커스텀 쿼리
    def get_by_username(
        self, 
        store_id: str, 
        username: str
    ) -> Optional[Admin]:
        """사용자명으로 관리자 조회"""
        pass
```

### StoreRepository
```python
class StoreRepository:
    # 기본 CRUD
    def create(self, store: Store) -> Store:
        """매장 생성"""
        pass
    
    def get_by_id(self, store_id: str) -> Optional[Store]:
        """매장 ID로 조회"""
        pass
    
    def get_all(self) -> List[Store]:
        """모든 매장 조회"""
        pass
```

---

## Backend Components - Utilities

### JWTUtil
```python
class JWTUtil:
    @staticmethod
    def encode_token(
        payload: Dict[str, Any], 
        secret_key: str, 
        expiry_hours: int
    ) -> str:
        """JWT 토큰 생성"""
        pass
    
    @staticmethod
    def decode_token(
        token: str, 
        secret_key: str
    ) -> Dict[str, Any]:
        """JWT 토큰 디코딩"""
        pass
    
    @staticmethod
    def verify_token(token: str, secret_key: str) -> bool:
        """JWT 토큰 유효성 검증"""
        pass
```

### PasswordUtil
```python
class PasswordUtil:
    @staticmethod
    def hash_password(password: str) -> str:
        """bcrypt 해싱"""
        pass
    
    @staticmethod
    def verify_password(
        plain_password: str, 
        hashed_password: str
    ) -> bool:
        """비밀번호 검증"""
        pass
```

### SSEManager
```python
class SSEManager:
    def __init__(self):
        """SSE 클라이언트 연결 딕셔너리 초기화"""
        self.connections: Dict[str, List[Queue]] = {}
    
    def add_connection(
        self, 
        store_id: str, 
        queue: Queue
    ) -> None:
        """새 SSE 클라이언트 연결 추가"""
        pass
    
    def remove_connection(
        self, 
        store_id: str, 
        queue: Queue
    ) -> None:
        """SSE 클라이언트 연결 제거"""
        pass
    
    def broadcast(
        self, 
        store_id: str, 
        event_data: Dict[str, Any]
    ) -> None:
        """모든 연결된 클라이언트에게 이벤트 전송"""
        pass
    
    def format_sse_message(
        self, 
        event_type: str, 
        data: Dict[str, Any]
    ) -> str:
        """SSE 메시지 포맷"""
        pass
```

### DatabaseSession
```python
class DatabaseSession:
    def __init__(self, engine):
        """데이터베이스 엔진 초기화"""
        self.engine = engine
    
    def get_session(self) -> Session:
        """SQLAlchemy 세션 생성"""
        pass
    
    def commit_session(self, session: Session) -> None:
        """트랜잭션 커밋"""
        pass
    
    def rollback_session(self, session: Session) -> None:
        """트랜잭션 롤백"""
        pass
    
    def close_session(self, session: Session) -> None:
        """세션 종료"""
        pass
```

### SeedDataLoader
```python
class SeedDataLoader:
    def load_all(self) -> None:
        """모든 시드 데이터 로드"""
        pass
    
    def load_stores(self) -> List[Store]:
        """샘플 매장 생성"""
        pass
    
    def load_tables(self, store_id: str) -> List[Table]:
        """샘플 테이블 생성 (5개)"""
        pass
    
    def load_admin(self, store_id: str) -> Admin:
        """샘플 관리자 생성"""
        pass
    
    def load_menu_categories(
        self, 
        store_id: str
    ) -> List[MenuCategory]:
        """샘플 카테고리 생성 (3개)"""
        pass
    
    def load_menus(
        self, 
        store_id: str, 
        categories: List[MenuCategory]
    ) -> List[Menu]:
        """샘플 메뉴 생성 (각 카테고리당 3개)"""
        pass
    
    def check_data_exists(self) -> bool:
        """기존 시드 데이터 존재 여부 확인"""
        pass
```

---

## Method Count Summary

- **Customer Frontend Methods**: ~40 methods
- **Admin Frontend Methods**: ~50 methods
- **Backend Service Methods**: ~35 methods
- **Backend Repository Methods**: ~40 methods
- **Backend Utility Methods**: ~20 methods

**Total**: ~185 methods

**Note**: 실제 구현 시 추가 헬퍼 메서드가 필요할 수 있습니다.
