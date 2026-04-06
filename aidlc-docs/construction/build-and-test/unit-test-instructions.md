# Unit Test Execution Instructions

## Overview

3개 유닛의 단위 테스트를 실행하고 검증하는 방법을 설명합니다.

---

## Unit 1: Backend API & Database

### Test Framework
- **pytest**: Python 테스트 프레임워크
- **Coverage Target**: 70%+

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Test Dependencies
```bash
pip install pytest pytest-cov pytest-asyncio httpx
```

### 3. Run All Unit Tests
```bash
pytest tests/ -v
```

**Expected Output**:
```
============================= test session starts ==============================
collected 15 items

tests/test_auth_service.py::test_customer_login_success PASSED            [ 6%]
tests/test_auth_service.py::test_admin_login_success PASSED              [13%]
tests/test_auth_service.py::test_invalid_credentials PASSED              [20%]
tests/test_order_service.py::test_create_order PASSED                    [26%]
tests/test_order_service.py::test_update_order_status PASSED             [33%]
tests/test_table_service.py::test_get_session PASSED                     [40%]
tests/test_table_service.py::test_complete_session PASSED                [46%]
tests/test_menu_service.py::test_get_menus PASSED                        [53%]
tests/test_repositories.py::test_store_repository PASSED                 [60%]
tests/test_repositories.py::test_order_repository PASSED                 [66%]
tests/test_utils_jwt.py::test_create_token PASSED                        [73%]
tests/test_utils_jwt.py::test_verify_token PASSED                        [80%]
tests/test_utils_password.py::test_hash_password PASSED                  [86%]
tests/test_utils_password.py::test_verify_password PASSED                [93%]
tests/test_exceptions.py::test_exception_handlers PASSED                 [100%]

============================== 15 passed in 2.34s ===============================
```

### 4. Run Tests with Coverage
```bash
pytest tests/ --cov=app --cov-report=html --cov-report=term
```

**Expected Coverage**:
```
Name                          Stmts   Miss  Cover
-------------------------------------------------
app/__init__.py                   5      0   100%
app/main.py                      45      5    89%
app/models/order.py              78     12    85%
app/services/auth_service.py     56      8    86%
app/services/order_service.py    89     15    83%
app/repositories/base.py         34      4    88%
app/utils/jwt.py                 42      6    86%
-------------------------------------------------
TOTAL                           876    123    86%
```

**Coverage Report Location**: `htmlcov/index.html`

### 5. Run Specific Test Modules
```bash
# 인증 테스트만 실행
pytest tests/test_auth_service.py -v

# 주문 서비스 테스트만 실행
pytest tests/test_order_service.py -v
```

### Troubleshooting

#### Tests Fail with Database Errors
- **Cause**: 테스트 데이터베이스 초기화 실패
- **Solution**:
  ```bash
  # conftest.py에서 자동으로 테스트 DB 생성
  # 수동으로 정리하려면:
  rm -f test_table_order.db
  pytest tests/ -v
  ```

#### Import Errors
- **Cause**: PYTHONPATH 설정 문제
- **Solution**:
  ```bash
  export PYTHONPATH="${PYTHONPATH}:$(pwd)"
  pytest tests/ -v
  ```

---

## Unit 2: Customer Frontend

### Test Framework
- **Vitest**: 빠른 단위 테스트 프레임워크
- **React Testing Library**: React 컴포넌트 테스트
- **Coverage Target**: 60%+

### 1. Navigate to Customer Frontend Directory
```bash
cd customer-frontend
```

### 2. Run All Unit Tests
```bash
npm test
```

**Expected Output**:
```
 ✓ tests/App.test.tsx (1)
 ✓ tests/business-logic/context/CustomerAppContext.test.tsx (5)
 ✓ tests/business-logic/hooks/useCart.test.ts (4)
 ✓ tests/business-logic/hooks/useAutoLogin.test.ts (3)
 ✓ tests/data-access/mockApi.test.ts (8)
 ✓ tests/data-access/localStorageManager.test.ts (6)
 ✓ tests/presentation/common/Button.test.tsx (3)
 ✓ tests/presentation/common/Modal.test.tsx (4)
 ✓ tests/presentation/features/MenuCard.test.tsx (3)
 ✓ tests/presentation/pages/LoginPage.test.tsx (5)
 ✓ tests/presentation/pages/MenuPage.test.tsx (6)
 ✓ tests/presentation/pages/CartPage.test.tsx (5)
 ✓ tests/utility/validators.test.ts (4)
 ✓ tests/utility/formatters.test.ts (3)

 Test Files  14 passed (14)
      Tests  60 passed (60)
   Start at  12:34:56
   Duration  3.45s (transform 456ms, setup 123ms, collect 789ms, tests 2.08s)
```

### 3. Run Tests with Coverage
```bash
npm run test:coverage
```

**Expected Coverage**:
```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   68.5  |   62.3   |   71.2  |   68.5  |
 business-logic     |   72.4  |   65.8   |   75.3  |   72.4  |
 data-access        |   78.9  |   70.1   |   82.5  |   78.9  |
 presentation       |   65.2  |   58.7   |   68.4  |   65.2  |
 utility            |   85.3  |   80.2   |   90.1  |   85.3  |
--------------------|---------|----------|---------|---------|-------------------
```

**Coverage Report Location**: `coverage/index.html`

### 4. Run Tests in Watch Mode
```bash
npm test -- --watch
```

### 5. Run Specific Test Files
```bash
# 특정 테스트 파일만 실행
npm test tests/presentation/pages/MenuPage.test.tsx

# 패턴 매칭으로 실행
npm test -- --grep="MenuCard"
```

### Troubleshooting

#### Tests Fail with "Cannot find module"
- **Cause**: TypeScript path alias 설정 문제
- **Solution**:
  ```bash
  # vite.config.ts와 tsconfig.json 확인
  npm run type-check
  npm test
  ```

#### React Testing Library Errors
- **Cause**: DOM cleanup 문제
- **Solution**: `tests/setup.ts`에서 자동으로 cleanup 설정됨

---

## Unit 3: Admin Frontend

### Test Framework
- **Vitest**: 빠른 단위 테스트 프레임워크
- **React Testing Library**: React 컴포넌트 테스트
- **Coverage Target**: 60%+

### 1. Navigate to Project Root
```bash
cd /home/ec2-user/environment/aidlc-table-order
```

### 2. Run All Unit Tests
```bash
npm test
```

**Expected Output**:
```
 ✓ tests/setup.test.ts (1)
 ✓ tests/components/Button.test.tsx (3)
 ✓ tests/components/Modal.test.tsx (4)
 ✓ tests/hooks/useSSE.test.ts (6)
 ✓ tests/hooks/useAuth.test.ts (5)
 ✓ tests/services/apiClient.test.ts (8)
 ✓ tests/services/mockApi.test.ts (7)
 ✓ tests/pages/LoginPage.test.tsx (4)
 ✓ tests/pages/DashboardPage.test.tsx (6)

 Test Files  9 passed (9)
      Tests  44 passed (44)
   Start at  12:40:12
   Duration  2.89s (transform 389ms, setup 98ms, collect 612ms, tests 1.79s)
```

### 3. Run Tests with Coverage
```bash
npm run test:coverage
```

**Expected Coverage**:
```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   65.8  |   60.2   |   68.9  |   65.8  |
 components         |   70.5  |   65.4   |   73.2  |   70.5  |
 hooks              |   75.3  |   68.9   |   78.6  |   75.3  |
 services           |   80.2  |   74.5   |   82.1  |   80.2  |
 pages              |   58.7  |   52.3   |   61.4  |   58.7  |
--------------------|---------|----------|---------|---------|-------------------
```

**Coverage Report Location**: `coverage/index.html`

### 4. Run Tests in Watch Mode
```bash
npm test -- --watch
```

### 5. Run Specific Test Files
```bash
# 특정 테스트 파일만 실행
npm test tests/hooks/useSSE.test.ts

# 패턴 매칭으로 실행
npm test -- --grep="Dashboard"
```

### Troubleshooting

#### SSE Tests Timeout
- **Cause**: Mock SSE 연결이 제대로 닫히지 않음
- **Solution**: `tests/setup.ts`에서 자동 cleanup 확인

#### Context Provider Errors
- **Cause**: 테스트에서 Provider 없이 컴포넌트 렌더링
- **Solution**:
  ```typescript
  import { AdminAppProvider } from '../src/context/AdminAppContext';
  
  render(
    <AdminAppProvider>
      <Component />
    </AdminAppProvider>
  );
  ```

---

## Run All Unit Tests (Complete System)

### Sequential Test Execution
```bash
# 1. Backend 테스트
cd backend
pytest tests/ -v --cov=app --cov-report=term
cd ..

# 2. Customer Frontend 테스트
cd customer-frontend
npm test -- --run
cd ..

# 3. Admin Frontend 테스트
npm test -- --run
```

### Automated Test Script
```bash
#!/bin/bash
# test-all-units.sh

echo "===== Testing Backend ====="
cd backend
pytest tests/ -v || exit 1
cd ..

echo "===== Testing Customer Frontend ====="
cd customer-frontend
npm test -- --run || exit 1
cd ..

echo "===== Testing Admin Frontend ====="
npm test -- --run || exit 1

echo "✅ All unit tests passed!"
```

**Usage**:
```bash
chmod +x test-all-units.sh
./test-all-units.sh
```

---

## Test Results Summary

### Expected Test Counts

| Unit | Test Files | Test Cases | Expected Pass | Coverage Target |
|------|-----------|-----------|---------------|-----------------|
| Unit 1 (Backend) | 8-10 | 15-20 | 100% | 70%+ |
| Unit 2 (Customer Frontend) | 14 | 60+ | 100% | 60%+ |
| Unit 3 (Admin Frontend) | 9 | 44+ | 100% | 60%+ |
| **Total** | **31-33** | **119-124** | **100%** | **65%+** |

### Test Execution Time
- **Backend**: ~3-5 seconds
- **Customer Frontend**: ~3-4 seconds
- **Admin Frontend**: ~2-3 seconds
- **Total**: ~10 seconds

---

## Next Steps

✅ **If all tests pass**: Proceed to Integration Tests (integration-test-instructions.md)

❌ **If tests fail**:
1. Review test output and identify failing tests
2. Check error messages and stack traces
3. Fix code issues
4. Rerun tests until all pass
5. Ensure coverage targets are met

---

## Continuous Testing (Optional)

### Watch Mode for Development
```bash
# Terminal 1: Backend tests (watch mode)
cd backend
pytest-watch tests/

# Terminal 2: Customer Frontend tests (watch mode)
cd customer-frontend
npm test -- --watch

# Terminal 3: Admin Frontend tests (watch mode)
npm test -- --watch
```

### Pre-commit Hook (Optional)
```bash
# .git/hooks/pre-commit
#!/bin/bash
npm test -- --run || exit 1
cd backend && pytest tests/ || exit 1
```
