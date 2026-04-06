# Unit 2 - Customer Frontend: Code Generation Plan

**Unit**: Unit 2 - Customer Frontend  
**Stage**: Code Generation  
**Created**: 2026-04-06T16:16:00Z

---

## Context

### Unit Information
- **Unit Name**: Customer Frontend
- **Description**: React 기반 고객용 프론트엔드 애플리케이션
- **Tech Stack**: React 18 + Vite + TypeScript (strict mode)
- **State Management**: React Context API
- **UI Framework**: Tailwind CSS + HeadlessUI
- **Routing**: React Router v6
- **HTTP Client**: fetch API
- **Testing**: Vitest + React Testing Library (60% coverage)

### Stories Implemented
| Story ID | Title | Priority |
|---|---|---|
| CUS-001 | 테이블 자동 로그인 | Must Have |
| CUS-002 | 메뉴 목록 조회 | Must Have |
| CUS-003 | 메뉴 카테고리 필터링 | Should Have |
| CUS-004 | 장바구니 담기 | Must Have |
| CUS-005 | 장바구니 수량 조정 | Must Have |
| CUS-006 | 주문 생성 | Must Have |
| CUS-007 | 주문 내역 조회 | Must Have |
| CUS-008 | 주문 상태 표시 | Should Have |

### Dependencies
- **Day 0 Contract**: TypeScript types from `/aidlc-docs/inception/contracts/typescript-types.ts`
- **Mock API**: Complete mock implementation for independent development
- **No Backend Dependency**: Fully functional with mock API

### Code Location
- **Workspace Root**: `/home/ec2-user/environment/unit_2/aidlc-test`
- **Unit Directory**: `customer-frontend/`
- **Application Code**: `customer-frontend/src/`, `customer-frontend/tests/`
- **Documentation**: `aidlc-docs/construction/unit2-customer/code/`

---

## Code Generation Steps

### Phase 1: Project Structure Setup

#### Step 1: Initialize Vite + React + TypeScript Project
- [x] Create `customer-frontend/` directory
- [x] Initialize Vite project with React + TypeScript template
- [x] Configure TypeScript strict mode in `tsconfig.json`
- [x] Configure Vitest for testing
- [x] Set up ESLint + Prettier
- [x] Configure Tailwind CSS
- [x] Install dependencies:
  - react, react-dom, react-router-dom
  - @headlessui/react
  - tailwindcss
  - vitest, @testing-library/react, @testing-library/jest-dom
- [x] Create `.env.example` with `VITE_USE_MOCK_API` flag
- [x] Create initial `README.md` with setup instructions

**Story Coverage**: Infrastructure for all stories  
**Files Created**: `customer-frontend/package.json`, `customer-frontend/vite.config.ts`, `customer-frontend/tsconfig.json`, `.eslintrc.json`, `.prettierrc`, `tailwind.config.js`, `postcss.config.js`, `.env.example`, `.env.local`, `.gitignore`, `README.md`

---

#### Step 2: Create Directory Structure
- [x] Create 5-layer architecture directories:
  - `src/presentation/pages/` (4 pages)
  - `src/presentation/features/` (4 feature components)
  - `src/presentation/common/` (5 common components)
  - `src/business-logic/context/` (Context + Hooks)
  - `src/business-logic/hooks/` (Custom hooks)
  - `src/business-logic/validators/` (Validation logic)
  - `src/data-access/` (API client, Mock API, LocalStorage)
  - `src/utility/` (Formatters, Constants)
  - `src/infrastructure/` (Router, ErrorBoundary, Logger)
  - `tests/` (Unit tests mirroring src/ structure)

**Story Coverage**: Infrastructure for all stories  
**Files Created**: Directory structure (18 directories)

---

### Phase 2: Infrastructure Layer

#### Step 3: Create Router and Protected Routes
- [x] Implement `src/infrastructure/Router.tsx`
  - React Router v6 setup
  - Routes: `/`, `/login`, `/menu`, `/cart`, `/orders`
  - Protected routes requiring authentication
  - Lazy loading for code splitting
- [x] Implement `src/infrastructure/ProtectedRoute.tsx`
  - Check authentication state
  - Redirect to `/login` if not authenticated
- [x] Add unit tests: `tests/infrastructure/Router.test.tsx`, `tests/infrastructure/ProtectedRoute.test.tsx`

**Story Coverage**: CUS-001 (authentication routing)  
**Files Created**: `src/infrastructure/Router.tsx`, `src/infrastructure/ProtectedRoute.tsx`, `tests/infrastructure/Router.test.tsx`, `tests/infrastructure/ProtectedRoute.test.tsx`

---

#### Step 4: Create Error Boundary
- [x] Implement `src/infrastructure/ErrorBoundary.tsx`
  - Catch React component errors
  - Display fallback UI with reload button
  - Log errors to console
  - Custom fallback support
- [x] Add unit tests: `tests/infrastructure/ErrorBoundary.test.tsx`

**Story Coverage**: All stories (error handling)  
**Files Created**: `src/infrastructure/ErrorBoundary.tsx`, `tests/infrastructure/ErrorBoundary.test.tsx`

---

#### Step 5: Create Logger Utility
- [x] Implement `src/infrastructure/Logger.ts`
  - Log levels: info, warn, error
  - Console logging for development
  - Timestamp prefix
  - Skip info logs in production
- [x] Add unit tests: `tests/infrastructure/Logger.test.ts`

**Story Coverage**: All stories (debugging)  
**Files Created**: `src/infrastructure/Logger.ts`, `tests/infrastructure/Logger.test.ts`

---

### Phase 3: Utility Layer

#### Step 6: Create Constants
- [x] Implement `src/utility/constants.ts`
  - API endpoints
  - LocalStorage keys
  - UI constants (max quantity, cache duration, etc.)
  - Order status types and labels
  - Error and success messages
  - Accessibility constants

**Story Coverage**: All stories  
**Files Created**: `src/utility/constants.ts`

---

#### Step 7: Create Formatters
- [x] Implement `src/utility/formatters.ts`
  - `formatPrice(price: number): string` - 가격 포맷팅 (예: 10000 → "₩10,000")
  - `formatDate(date: string): string` - 날짜 포맷팅
  - `formatDateShort(date: string): string` - 짧은 날짜 포맷
  - `formatOrderStatus(status: string): string` - 주문 상태 한글 변환
  - `formatTableNumber`, `formatQuantity`, `truncateText`
- [x] Add unit tests: `tests/utility/formatters.test.ts`

**Story Coverage**: CUS-002 (메뉴 가격), CUS-007, CUS-008 (주문 내역)  
**Files Created**: `src/utility/formatters.ts`, `tests/utility/formatters.test.ts`

---

#### Step 8: Create Validators
- [x] Implement `src/utility/validators.ts`
  - `validateQuantity(quantity: number): ValidationResult`
  - `validateTableNumber(tableNumber: number): ValidationResult`
  - `validatePassword(password: string): ValidationResult`
  - `validateLoginCredentials(tableNumber, password): ValidationResult`
  - `ValidationResult` type: `{ valid: boolean; message?: string }`
- [x] Add unit tests: `tests/utility/validators.test.ts`

**Story Coverage**: CUS-001 (로그인), CUS-004, CUS-005 (장바구니)  
**Files Created**: `src/utility/validators.ts`, `tests/utility/validators.test.ts`

---

### Phase 4: Data Access Layer

#### Step 9: Copy Day 0 TypeScript Types
- [x] Copy `/aidlc-docs/construction/day0-contract/typescript-types.ts` to `src/data-access/types.ts`
- [x] Export all types from `types.ts`

**Story Coverage**: All stories (type definitions)  
**Files Created**: `src/data-access/types.ts`

---

#### Step 10: Create LocalStorage Manager
- [x] Implement `src/data-access/localStorageManager.ts`
  - `saveCart(cart: Cart): void`
  - `loadCart(): Cart | null` - with expiry check (24 hours)
  - `clearCart(): void`
  - `saveCustomerAuth(auth: { tableNumber, password, storeId }): void`
  - `loadCustomerAuth(): { tableNumber, password, storeId } | null`
  - `clearCustomerAuth(): void`
  - `calculateCartTotal(items: CartItem[]): number`
- [x] Add unit tests: `tests/data-access/localStorageManager.test.ts`

**Story Coverage**: CUS-001 (auto-login), CUS-004, CUS-005 (cart persistence)  
**Files Created**: `src/data-access/localStorageManager.ts`, `tests/data-access/localStorageManager.test.ts`

---

#### Step 11: Create API Client Interface
- [x] Implement `src/data-access/api.ts`
  - Define `CustomerApiClient` interface with methods:
    - `loginCustomer(credentials: CustomerLoginRequest): Promise<CustomerLoginResponse>`
    - `getMenus(params?: GetMenusParams): Promise<Menu[]>`
    - `createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse>`
    - `getOrderHistory(tableId: number): Promise<Order[]>`
  - Export async API selector with dynamic imports
  - Environment variable check: `VITE_USE_MOCK_API`
  - Convenience methods for direct usage
- [x] Add unit tests: `tests/data-access/api.test.ts`

**Story Coverage**: All API-dependent stories  
**Files Created**: `src/data-access/api.ts`, `tests/data-access/api.test.ts`

---

#### Step 12: Create Mock API Implementation
- [x] Implement `src/data-access/mockApi.ts`
  - Implement all `CustomerApiClient` methods
  - Use mock data (9 menus, 3 categories, 10 tables)
  - Simulate network delay (500ms)
  - Simulate error scenarios (AUTH_INVALID_CREDENTIALS, MENU_NOT_FOUND, TABLE_NOT_FOUND, VALIDATION_ERROR)
  - Follow Day 0 Contract response format exactly
  - In-memory order storage
- [x] Add unit tests: `tests/data-access/mockApi.test.ts`

**Story Coverage**: All stories (independent development)  
**Files Created**: `src/data-access/mockApi.ts`, `tests/data-access/mockApi.test.ts`

---

#### Step 13: Create Real API Implementation (Stub)
- [x] Implement `src/data-access/realApi.ts`
  - Implement all `CustomerApiClient` methods using fetch API
  - Base URL from constants: `API_BASE_URL`
  - Error handling with `handleApiError`
  - 10-second timeout with `fetchWithTimeout`
  - JWT credentials: 'include' for cookie handling
- [x] Add unit tests: `tests/data-access/realApi.test.ts`

**Story Coverage**: All stories (future integration)  
**Files Created**: `src/data-access/realApi.ts`, `tests/data-access/realApi.test.ts`

---

### Phase 5: Business Logic Layer

#### Step 14: Create Domain Entities and Validators
- [x] Implement `src/business-logic/validators/domainValidators.ts`
  - `validateCartItem(item: CartItem): ValidationResult`
  - `validateCart(cart: Cart): ValidationResult`
  - `isMenuInCart(cart: Cart, menuId: number): boolean`
  - `findCartItem(cart: Cart, menuId: number): CartItem | undefined`
  - `validateOrderRequest(cart: Cart, tableId: number): ValidationResult`
  - Business rules:
    - BR-CART-001: Quantity 1-99
    - BR-CART-002: No duplicate menus in cart
    - BR-CART-003: Cart expiry (handled in localStorageManager)
- [x] Add unit tests: `tests/business-logic/validators/domainValidators.test.ts`

**Story Coverage**: CUS-004, CUS-005, CUS-006 (cart validation, order creation)  
**Files Created**: `src/business-logic/validators/domainValidators.ts`, `tests/business-logic/validators/domainValidators.test.ts`

---

#### Step 15: Create CustomerAppContext (State Management)
- [x] Implement `src/business-logic/context/CustomerAppContext.tsx`
  - Context definition with complete state management
  - Auth actions: login, logout
  - Menu actions: loadMenus
  - Cart actions: addToCart, updateCartItemQuantity, removeFromCart, clearCart
  - Order actions: createOrder, loadOrderHistory
  - LocalStorage sync for cart and auth
  - Error handling and loading states
  - Toast notifications (placeholder)
- [x] Export `CustomerAppProvider` and `useCustomerApp` hook
- [x] Add unit tests: `tests/business-logic/context/CustomerAppContext.test.tsx`
- [x] Create test setup file: `tests/setup.ts`
- [x] Create Vite env types: `src/vite-env.d.ts`

**Story Coverage**: All stories (central state management)  
**Files Created**: `src/business-logic/context/CustomerAppContext.tsx`, `tests/business-logic/context/CustomerAppContext.test.tsx`, `tests/setup.ts`, `src/vite-env.d.ts`

---

#### Step 16: Create useAutoLogin Hook
- [x] Implement `src/business-logic/hooks/useAutoLogin.ts`
  - Check LocalStorage for saved credentials on mount
  - Auto-login if credentials exist
  - Handle auto-login failure (don't clear credentials, let user retry)
  - Redirect to `/menu` on success
  - Skip if already authenticated
- [x] Add unit tests: `tests/business-logic/hooks/useAutoLogin.test.ts`

**Story Coverage**: CUS-001 (auto-login)  
**Files Created**: `src/business-logic/hooks/useAutoLogin.ts`, `tests/business-logic/hooks/useAutoLogin.test.ts`

---

#### Step 17: Create useCart Hook
- [x] Implement `src/business-logic/hooks/useCart.ts`
  - Wrapper around `useCustomerApp` for cart operations
  - Computed values: `totalPrice`, `totalItems`, `isEmpty`, `itemCount`
  - Cart actions: `add`, `updateQuantity`, `remove`, `clear`
  - Helpers: `getItemQuantity`, `hasItem`
- [x] Add unit tests: `tests/business-logic/hooks/useCart.test.ts`

**Story Coverage**: CUS-004, CUS-005 (cart management)  
**Files Created**: `src/business-logic/hooks/useCart.ts`, `tests/business-logic/hooks/useCart.test.ts`

---

### Phase 6: Presentation Layer - Common Components

#### Step 18: Create Button Component
- [x] Implement `src/presentation/common/Button.tsx`
  - Props: `label`, `onClick`, `variant` (primary, secondary, danger), `disabled`, `type`, `data-testid`
  - Tailwind CSS styling with 44x44px min touch target
  - Focus ring for accessibility
- [x] Add unit tests: `tests/presentation/common/Button.test.tsx`

**Story Coverage**: All stories (UI interactions)  
**Files Created**: `src/presentation/common/Button.tsx`, `tests/presentation/common/Button.test.tsx`

---

#### Step 19: Create LoadingSpinner Component
- [x] Implement `src/presentation/common/LoadingSpinner.tsx`
  - Props: `size` (small, medium, large), `message`
  - CSS animation with Tailwind
  - Accessible with role="status" and aria-label
- [x] Add unit tests: `tests/presentation/common/LoadingSpinner.test.tsx`

**Story Coverage**: All stories (loading states)  
**Files Created**: `src/presentation/common/LoadingSpinner.tsx`, `tests/presentation/common/LoadingSpinner.test.tsx`

---

#### Step 20: Create Modal Component
- [x] Implement `src/presentation/common/Modal.tsx`
  - Props: `isOpen`, `onClose`, `title`, `children`
  - HeadlessUI Dialog with Transition
  - Accessible (focus trap, ESC key, backdrop click)
- [x] Add unit tests: `tests/presentation/common/Modal.test.tsx`

**Story Coverage**: CUS-006 (order confirmation modal)  
**Files Created**: `src/presentation/common/Modal.tsx`, `tests/presentation/common/Modal.test.tsx`

---

#### Step 21: Create Toast Component
- [x] Implement `src/presentation/common/Toast.tsx`
  - Props: `message`, `type` (success, error, info), `onClose`, `duration`
  - Auto-dismiss after 3 seconds (configurable)
  - Position: bottom-center fixed
  - Manual close button
- [x] Add unit tests: `tests/presentation/common/Toast.test.tsx`

**Story Coverage**: All stories (error/success notifications)  
**Files Created**: `src/presentation/common/Toast.tsx`, `tests/presentation/common/Toast.test.tsx`

---

#### Step 22: Create EmptyState Component
- [x] Implement `src/presentation/common/EmptyState.tsx`
  - Props: `message`, `icon`, `actionLabel`, `onAction`
  - Centered layout with optional action button
- [x] Add unit tests: `tests/presentation/common/EmptyState.test.tsx`

**Story Coverage**: CUS-004 (empty cart), CUS-007 (no orders)  
**Files Created**: `src/presentation/common/EmptyState.tsx`, `tests/presentation/common/EmptyState.test.tsx`

---

### Phase 7: Presentation Layer - Feature Components

#### Step 23: Create MenuCard Component
- [x] Implement `src/presentation/features/MenuCard.tsx`
  - Props: `menu: Menu`, `onAddToCart: (menu: Menu) => void`
  - Display: name, description, price, availability status
  - "담기" button (disabled if not available)
  - Hover effect with shadow
  - `data-testid="menu-card-{menuId}"`
- [x] Add unit tests: `tests/presentation/features/MenuCard.test.tsx`

**Story Coverage**: CUS-002 (menu display)  
**Files Created**: `src/presentation/features/MenuCard.tsx`, `tests/presentation/features/MenuCard.test.tsx`

---

#### Step 24: Create MenuCategoryList Component
- [x] Implement `src/presentation/features/MenuCategoryList.tsx`
  - Props: `categories`, `selectedCategory`, `onSelectCategory`
  - Horizontal scrollable pill-style category list
  - Active category highlighting with primary color
  - "전체" option for all categories
  - `data-testid="category-{categoryId}"`
- [x] Add unit tests: `tests/presentation/features/MenuCategoryList.test.tsx`

**Story Coverage**: CUS-003 (category filtering)  
**Files Created**: `src/presentation/features/MenuCategoryList.tsx`, `tests/presentation/features/MenuCategoryList.test.tsx`

---

#### Step 25: Create CartItem Component
- [x] Implement `src/presentation/features/CartItem.tsx`
  - Props: `item`, `onUpdateQuantity`, `onRemove`
  - Display: menu name, price, quantity controls, subtotal
  - Quantity controls: +/- buttons with min/max validation
  - Remove button with X icon
  - `data-testid="cart-item-{menuId}"`
- [x] Add unit tests: `tests/presentation/features/CartItem.test.tsx`

**Story Coverage**: CUS-004, CUS-005 (cart item management)  
**Files Created**: `src/presentation/features/CartItem.tsx`, `tests/presentation/features/CartItem.test.tsx`

---

#### Step 26: Create OrderCard Component
- [x] Implement `src/presentation/features/OrderCard.tsx`
  - Props: `order: Order`
  - Display: order number, items list, total price, status badge, timestamp
  - Color-coded status badge from constants
  - Formatted date and prices
  - `data-testid="order-card-{orderId}"`
- [x] Add unit tests: `tests/presentation/features/OrderCard.test.tsx`

**Story Coverage**: CUS-007, CUS-008 (order history)  
**Files Created**: `src/presentation/features/OrderCard.tsx`, `tests/presentation/features/OrderCard.test.tsx`

---

### Phase 8: Presentation Layer - Pages

#### Step 27: Create LoginPage
- [x] Implement `src/presentation/pages/LoginPage.tsx`
  - Form: table number, password inputs
  - Login button with loading state
  - Auto-login check with useAutoLogin hook
  - Error display
  - Navigate to /menu on success
  - `data-testid="login-form-submit-button"`
- [x] Add unit tests: `tests/presentation/pages/LoginPage.test.tsx`

**Story Coverage**: CUS-001 (login)  
**Files Created**: `src/presentation/pages/LoginPage.tsx`, `tests/presentation/pages/LoginPage.test.tsx`

---

#### Step 28: Create MenuPage
- [x] Implement `src/presentation/pages/MenuPage.tsx`
  - Load menus on mount with useEffect
  - Sticky header with cart button (badge shows item count)
  - MenuCategoryList for filtering
  - Grid layout with MenuCard components
  - Add to cart with error handling
  - Loading and empty states
  - `data-testid="menu-page"`
- [x] Add unit tests: `tests/presentation/pages/MenuPage.test.tsx`

**Story Coverage**: CUS-002, CUS-003 (menu browsing)  
**Files Created**: `src/presentation/pages/MenuPage.tsx`, `tests/presentation/pages/MenuPage.test.tsx`

---

#### Step 29: Create CartPage
- [x] Implement `src/presentation/pages/CartPage.tsx`
  - CartItem list with quantity controls
  - Total price display
  - "주문하기" button opens confirmation modal
  - Modal with order summary
  - "장바구니 비우기" button
  - Empty state with action button
  - Navigate to /orders after successful order
  - `data-testid="cart-page-place-order-button"`
- [x] Add unit tests: `tests/presentation/pages/CartPage.test.tsx`

**Story Coverage**: CUS-004, CUS-005, CUS-006 (cart and order creation)  
**Files Created**: `src/presentation/pages/CartPage.tsx`, `tests/presentation/pages/CartPage.test.tsx`

---

#### Step 30: Create OrderHistoryPage
- [x] Implement `src/presentation/pages/OrderHistoryPage.tsx`
  - Load order history on mount
  - OrderCard list display
  - Manual refresh button with loading state
  - Loading spinner for initial load
  - Empty state with "메뉴 보기" action
  - Error display
  - `data-testid="order-history-page"`
- [x] Add unit tests: `tests/presentation/pages/OrderHistoryPage.test.tsx`

**Story Coverage**: CUS-007, CUS-008 (order history)  
**Files Created**: `src/presentation/pages/OrderHistoryPage.tsx`, `tests/presentation/pages/OrderHistoryPage.test.tsx`

---

### Phase 9: Application Entry Point

#### Step 31: Create App Component
- [x] Implement `src/App.tsx`
  - Wrap with ErrorBoundary
  - Wrap with CustomerAppProvider
  - Include Router component
  - Import global CSS (index.css)
- [x] Add unit tests: `tests/App.test.tsx`
- [x] Create `src/index.css` with Tailwind directives and custom styles

**Story Coverage**: All stories (app initialization)  
**Files Created**: `src/App.tsx`, `tests/App.test.tsx`, `src/index.css`

---

#### Step 32: Create Main Entry Point
- [x] Implement `src/main.tsx`
  - React 18 createRoot API
  - React.StrictMode wrapper
  - Render App component
- [x] Create `index.html`
  - Korean language (lang="ko")
  - Viewport meta tag
  - Root div element
  - Module script for main.tsx

**Story Coverage**: All stories (app entry)  
**Files Created**: `src/main.tsx`, `index.html`

---

### Phase 10: Configuration and Documentation

#### Step 33: Create Environment Configuration
- [x] Create `.env.example` (completed in Step 1)
- [x] Create `.env.local` (completed in Step 1)
- [x] Update `.gitignore` (completed in Step 1)

**Story Coverage**: All stories (environment config)  
**Files Created**: `.env.example`, `.env.local`, `.gitignore` (Step 1)

---

#### Step 34: Create README
- [x] Create `customer-frontend/README.md` (completed in Step 1)
  - Complete project overview with all sections
  - Full tech stack documentation
  - Setup and development instructions
  - Mock API explanation
  - Story coverage table
  - 5-layer architecture overview

**Story Coverage**: All stories (documentation)  
**Files Created**: `customer-frontend/README.md` (Step 1)

---

#### Step 35: Create Code Summary Documentation
- [x] Create `aidlc-docs/construction/unit2-customer/code/code-summary.md`:
  - Complete file structure (70+ files)
  - Component hierarchy (13 UI components)
  - 5-layer architecture with dependency flow
  - State management flow diagrams
  - API integration strategy (Mock + Real)
  - Story traceability matrix (8/8 stories)
  - NFR compliance checklist
  - Testing strategy and coverage
  - Integration timeline
  - Known limitations and future enhancements

**Story Coverage**: All stories (documentation)  
**Files Created**: `aidlc-docs/construction/unit2-customer/code/code-summary.md`

---

### Phase 11: Build Configuration

#### Step 36: Configure Vite Build
- [ ] Update `vite.config.ts`:
  - Configure build output directory: `dist/`
  - Enable source maps for debugging
  - Configure Vitest for unit tests
  - Optimize bundle size (code splitting, tree shaking)
- [ ] Verify build target: modern browsers (ES2020)

**Story Coverage**: All stories (build config)  
**Files Created**: `vite.config.ts` (updated)

---

#### Step 37: Configure TypeScript
- [ ] Update `tsconfig.json`:
  - Enable strict mode
  - Configure path aliases: `@/` → `src/`
  - Target: ES2020
  - JSX: react-jsx
  - Include: `src/**/*`, `tests/**/*`

**Story Coverage**: All stories (TypeScript config)  
**Files Created**: `tsconfig.json` (updated)

---

#### Step 38: Configure Tailwind CSS
- [ ] Create `tailwind.config.js`:
  - Content paths: `src/**/*.{ts,tsx}`
  - Theme extensions (colors, spacing)
  - Plugins: @tailwindcss/forms (if needed)
- [ ] Create `src/index.css`:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

**Story Coverage**: All stories (styling)  
**Files Created**: `tailwind.config.js`, `src/index.css`

---

#### Step 39: Configure ESLint and Prettier
- [ ] Create `.eslintrc.json`:
  - Extend: `eslint:recommended`, `plugin:react/recommended`, `plugin:@typescript-eslint/recommended`
  - Rules: enforce React hooks rules, no unused vars
- [ ] Create `.prettierrc`:
  - Semi: true
  - SingleQuote: true
  - TabWidth: 2
- [ ] Add scripts to `package.json`: `lint`, `format`

**Story Coverage**: All stories (code quality)  
**Files Created**: `.eslintrc.json`, `.prettierrc`

---

### Phase 12: Testing Configuration

#### Step 40: Configure Vitest and Testing Library
- [ ] Update `vite.config.ts` with Vitest configuration:
  - Test environment: jsdom
  - Setup files: `tests/setup.ts`
  - Coverage: enabled, threshold 60%
  - Include: `tests/**/*.test.{ts,tsx}`
- [ ] Create `tests/setup.ts`:
  - Import `@testing-library/jest-dom`
  - Mock window.localStorage
  - Mock fetch API (if needed)
- [ ] Add test scripts to `package.json`: `test`, `test:coverage`

**Story Coverage**: All stories (testing infrastructure)  
**Files Created**: `tests/setup.ts`, `vite.config.ts` (updated)

---

### Phase 13: Package Scripts

#### Step 41: Add Package Scripts
- [ ] Update `customer-frontend/package.json` with scripts:
  - `dev`: Start dev server with Vite
  - `build`: Build production bundle
  - `preview`: Preview production build
  - `test`: Run unit tests
  - `test:coverage`: Run tests with coverage
  - `lint`: Run ESLint
  - `format`: Run Prettier
  - `type-check`: TypeScript type checking
- [ ] Verify all scripts work correctly

**Story Coverage**: All stories (development workflow)  
**Files Created**: `package.json` (updated)

---

## Plan Summary

### Total Steps
- **41 steps** across 13 phases
- **Phase 1**: Project Structure Setup (2 steps)
- **Phase 2**: Infrastructure Layer (3 steps)
- **Phase 3**: Utility Layer (3 steps)
- **Phase 4**: Data Access Layer (5 steps)
- **Phase 5**: Business Logic Layer (4 steps)
- **Phase 6**: Presentation - Common Components (5 steps)
- **Phase 7**: Presentation - Feature Components (4 steps)
- **Phase 8**: Presentation - Pages (4 steps)
- **Phase 9**: Application Entry Point (2 steps)
- **Phase 10**: Configuration and Documentation (3 steps)
- **Phase 11**: Build Configuration (3 steps)
- **Phase 12**: Testing Configuration (1 step)
- **Phase 13**: Package Scripts (1 step)

### Story Coverage
- **CUS-001**: Steps 3, 16, 27
- **CUS-002**: Steps 7, 23, 28
- **CUS-003**: Steps 24, 28
- **CUS-004**: Steps 10, 14, 17, 25, 29
- **CUS-005**: Steps 10, 14, 17, 25, 29
- **CUS-006**: Steps 15, 20, 29
- **CUS-007**: Steps 15, 26, 30
- **CUS-008**: Steps 7, 26, 30

### Files to Create
- **Total**: ~70 files
- **Application Code**: ~50 files (src/ directory)
- **Tests**: ~40 files (tests/ directory)
- **Configuration**: ~10 files (config, dotfiles)
- **Documentation**: ~2 files (README, code summary)

### Estimated Scope
- **Lines of Code**: ~5,000-7,000 LOC (application + tests)
- **Test Coverage**: 60% minimum
- **Components**: 13 (5 common + 4 features + 4 pages)
- **Layers**: 5 (Presentation, Business Logic, Data Access, Utility, Infrastructure)

---

## Execution Strategy

### Sequential Execution
Steps will be executed in order (Step 1 → Step 41) to maintain dependencies:
- Infrastructure before layers that depend on it
- Data Access before Business Logic
- Business Logic before Presentation
- Common components before feature components
- Feature components before pages
- Pages before App entry point

### Checkpoint After Each Phase
After completing each phase, verify:
- All files created successfully
- All tests passing
- No TypeScript errors
- No linting errors

### Story Traceability
Each step maps to one or more stories, ensuring complete story implementation.

---

**This plan is the single source of truth for Unit 2 Customer Frontend Code Generation.**

All checkboxes will be marked [x] as steps are completed during execution.
