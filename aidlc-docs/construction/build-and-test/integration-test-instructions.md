# Integration Test Instructions

## Purpose

Backend API와 Frontend 애플리케이션 간의 통합을 테스트하여 전체 시스템이 올바르게 동작하는지 검증합니다.

---

## Test Architecture

```
┌─────────────────────┐
│ Customer Frontend   │
│ (Port 5173)         │
└──────────┬──────────┘
           │ HTTP
           │ Requests
           ▼
┌─────────────────────┐      ┌─────────────────────┐
│ Backend API         │◄────►│ Admin Frontend      │
│ (Port 8000)         │ SSE  │ (Port 5174)         │
└──────────┬──────────┘      └─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ SQLite Database     │
│ (table_order.db)    │
└─────────────────────┘
```

---

## Prerequisites

### 1. Build All Units
완료된 빌드가 필요합니다 (build-instructions.md 참조)

### 2. Install Testing Tools
```bash
# API 테스트용 (선택사항)
pip install httpx
npm install -g newman  # Postman CLI (선택사항)
```

---

## Integration Test Scenarios

### Scenario 1: Customer Login & Menu Browsing

**Purpose**: 고객이 로그인하고 메뉴를 조회하는 전체 플로우 테스트

#### Setup
```bash
# Terminal 1: Backend 실행
cd backend
python scripts/seed_data.py  # 시드 데이터 초기화
uvicorn app.main:app --reload --port 8000
```

```bash
# Terminal 2: Customer Frontend 실행
cd customer-frontend
# .env 파일에서 Mock API 비활성화
echo "VITE_USE_MOCK_API=false" > .env
echo "VITE_API_URL=http://localhost:8000" >> .env
npm run dev
```

#### Test Steps

**Step 1: 고객 로그인**
1. 브라우저에서 http://localhost:5173 접속
2. Table Number: `1` 입력
3. Password: `1234` 입력
4. "로그인" 버튼 클릭

**Expected Result**:
- ✅ 로그인 성공
- ✅ 메뉴 페이지로 리디렉션
- ✅ 상단에 "테이블 1" 표시

**Step 2: 메뉴 조회**
1. 메뉴 페이지에서 카테고리 필터 확인
2. 각 카테고리 클릭하여 메뉴 필터링 테스트

**Expected Result**:
- ✅ 4개 카테고리 표시 (찌개류, 면류, 밥류, 음료)
- ✅ 카테고리별 메뉴 정확히 필터링됨
- ✅ 각 메뉴에 이름, 가격, 설명 표시

**Step 3: 장바구니 추가**
1. "김치찌개" 메뉴 카드에서 "담기" 버튼 클릭
2. 장바구니 페이지로 이동

**Expected Result**:
- ✅ 장바구니에 김치찌개 1개 추가됨
- ✅ 총 금액: 8,000원 표시

#### Cleanup
```bash
# Ctrl+C로 Backend와 Frontend 종료
```

---

### Scenario 2: Order Creation & Status Tracking

**Purpose**: 고객이 주문하고 주문 상태를 추적하는 플로우 테스트

#### Setup
동일하게 Backend와 Customer Frontend 실행

#### Test Steps

**Step 1: 주문 생성**
1. 장바구니에 메뉴 추가 (김치찌개, 콜라)
2. "주문하기" 버튼 클릭

**Expected Result**:
- ✅ 주문 생성 성공 메시지
- ✅ 주문 번호 생성됨
- ✅ 주문 내역 페이지로 리디렉션

**Step 2: 주문 내역 확인**
1. 주문 내역 페이지에서 방금 생성한 주문 확인
2. 주문 상태: "준비 중" 또는 "대기 중"

**Expected Result**:
- ✅ 주문 번호 표시
- ✅ 주문 항목 (김치찌개, 콜라) 표시
- ✅ 주문 상태 배지 표시

#### Verification (Backend API)
```bash
# 별도 터미널에서 API 직접 호출
curl -X GET "http://localhost:8000/api/orders" \
  -H "Cookie: access_token=<YOUR_TOKEN>"
```

**Expected Response**:
```json
[
  {
    "id": 1,
    "order_number": 1,
    "table_id": 1,
    "status": "pending",
    "items": [
      {
        "menu_id": 1,
        "quantity": 1,
        "menu": {"name": "김치찌개"}
      },
      {
        "menu_id": 8,
        "quantity": 1,
        "menu": {"name": "콜라"}
      }
    ]
  }
]
```

---

### Scenario 3: Admin Dashboard & Order Management

**Purpose**: 관리자가 실시간으로 주문을 받고 상태를 업데이트하는 플로우 테스트

#### Setup
```bash
# Terminal 1: Backend 실행 (이미 실행 중)
cd backend
uvicorn app.main:app --reload --port 8000
```

```bash
# Terminal 2: Admin Frontend 실행
cd /home/ec2-user/environment/aidlc-table-order
# .env 파일에서 Mock API 비활성화
echo "VITE_USE_MOCK=false" > .env
echo "VITE_API_URL=http://localhost:8000" >> .env
npm run dev
```

#### Test Steps

**Step 1: 관리자 로그인**
1. 브라우저에서 http://localhost:5174 접속
2. Username: `admin` 입력
3. Password: `admin1234` 입력
4. "로그인" 버튼 클릭

**Expected Result**:
- ✅ 로그인 성공
- ✅ 대시보드 페이지로 리디렉션
- ✅ 활성 테이블 목록 표시

**Step 2: 주문 목록 확인**
1. 대시보드에서 "대기 중인 주문" 섹션 확인
2. Customer Frontend에서 새 주문 생성 (Scenario 2)
3. Admin Dashboard에서 자동으로 새 주문 표시되는지 확인

**Expected Result**:
- ✅ 실시간으로 새 주문 표시 (SSE 동작)
- ✅ 주문 번호, 테이블 번호, 항목 표시
- ✅ 주문 상태: "대기 중"

**Step 3: 주문 상태 업데이트**
1. 주문 카드에서 "준비 시작" 버튼 클릭
2. 주문 상태가 "준비 중"으로 변경되는지 확인
3. Customer Frontend에서 주문 내역 페이지 새로고침하여 상태 변경 확인

**Expected Result**:
- ✅ Admin Dashboard에서 상태 "준비 중"으로 변경
- ✅ Customer Frontend에서도 동일한 상태 표시
- ✅ 상태 변경 로그 확인 (브라우저 콘솔)

**Step 4: 주문 완료**
1. "완료" 버튼 클릭
2. 주문 상태가 "완료"로 변경되는지 확인

**Expected Result**:
- ✅ 주문 상태 "완료"로 변경
- ✅ "대기 중인 주문" 목록에서 제거됨
- ✅ Customer Frontend에서 완료 상태 표시

---

### Scenario 4: SSE (Server-Sent Events) Real-time Updates

**Purpose**: 실시간 주문 알림이 올바르게 동작하는지 테스트

#### Setup
Backend와 Admin Frontend 실행 (Scenario 3과 동일)

#### Test Steps

**Step 1: SSE 연결 확인**
1. Admin Dashboard에 로그인
2. 브라우저 개발자 도구 → Network 탭 열기
3. SSE 연결 확인 (`/api/sse/orders`)

**Expected Result**:
- ✅ `EventStream` 타입 연결 확인
- ✅ 연결 상태: "pending" (계속 유지)

**Step 2: 주문 생성 이벤트**
1. Customer Frontend에서 새 주문 생성
2. Admin Dashboard에서 즉시 알림 표시되는지 확인
3. 브라우저 콘솔에서 SSE 이벤트 로그 확인

**Expected Result**:
- ✅ SSE 이벤트 수신: `order_created`
- ✅ Admin Dashboard에 새 주문 카드 자동 추가
- ✅ 알림 토스트 표시 (선택사항)

**Step 3: 상태 업데이트 이벤트**
1. Admin Dashboard에서 주문 상태 변경
2. SSE 이벤트 `order_status_updated` 수신 확인
3. 다른 관리자 세션에서도 업데이트 반영되는지 확인 (2개 브라우저 탭)

**Expected Result**:
- ✅ SSE 이벤트 수신: `order_status_updated`
- ✅ 모든 관리자 세션에서 동시에 상태 업데이트됨

#### Verification (SSE Connection)
```bash
# curl로 SSE 연결 테스트
curl -N -H "Accept: text/event-stream" \
  -H "Cookie: access_token=<ADMIN_TOKEN>" \
  http://localhost:8000/api/sse/orders
```

**Expected Output**:
```
data: {"type":"heartbeat"}

data: {"type":"order_created","order":{"id":1,"order_number":1,...}}

data: {"type":"order_status_updated","order":{"id":1,"status":"preparing",...}}
```

---

### Scenario 5: Table Session Management

**Purpose**: 테이블 세션 관리가 올바르게 동작하는지 테스트

#### Test Steps

**Step 1: 세션 시작**
1. Customer Frontend에서 테이블 1로 로그인
2. 주문 생성
3. Admin Dashboard에서 "활성 테이블" 목록 확인

**Expected Result**:
- ✅ 테이블 1이 활성 상태로 표시
- ✅ 대기 중인 주문 수 표시

**Step 2: 세션 완료**
1. Admin Dashboard에서 "Table Management" 페이지로 이동
2. 테이블 1의 "세션 완료" 버튼 클릭
3. 확인 대화상자에서 "확인" 클릭

**Expected Result**:
- ✅ 세션 완료 성공 메시지
- ✅ 주문이 히스토리로 아카이빙됨
- ✅ 테이블 1이 비활성 상태로 변경

**Step 3: 세션 재시작**
1. Customer Frontend에서 다시 테이블 1로 로그인
2. 새로운 세션이 생성되는지 확인

**Expected Result**:
- ✅ 새 세션 자동 생성
- ✅ 이전 주문 내역은 보이지 않음 (새 세션)

---

## Integration Test Checklist

### Backend ↔ Customer Frontend
- [ ] 고객 로그인 (JWT 토큰 발급 및 쿠키 저장)
- [ ] 메뉴 조회 (카테고리별 필터링)
- [ ] 주문 생성 (장바구니 → API 호출)
- [ ] 주문 내역 조회 (실시간 업데이트)
- [ ] 세션 관리 (로그인 시 세션 자동 생성)

### Backend ↔ Admin Frontend
- [ ] 관리자 로그인 (JWT 토큰 발급 및 쿠키 저장)
- [ ] 주문 목록 조회 (모든 테이블 주문)
- [ ] 주문 상태 업데이트 (pending → preparing → completed)
- [ ] 주문 삭제 (취소)
- [ ] 활성 테이블 목록 조회
- [ ] 테이블 세션 완료
- [ ] SSE 실시간 알림 (order_created, order_status_updated, order_deleted)

### Cross-Component Integration
- [ ] Customer가 주문 생성 → Admin에 실시간 알림 (SSE)
- [ ] Admin이 상태 변경 → Customer 주문 내역에 반영
- [ ] 여러 테이블의 동시 주문 처리
- [ ] 세션 완료 후 주문 히스토리 조회

---

## Manual Integration Test Script

### Complete End-to-End Test (10분 소요)

```bash
#!/bin/bash
# integration-test-e2e.sh

echo "===== Starting Backend ====="
cd backend
python scripts/seed_data.py
uvicorn app.main:app --port 8000 &
BACKEND_PID=$!
sleep 3

echo "===== Starting Customer Frontend ====="
cd ../customer-frontend
npm run dev -- --port 5173 &
CUSTOMER_PID=$!
sleep 3

echo "===== Starting Admin Frontend ====="
cd ..
npm run dev -- --port 5174 &
ADMIN_PID=$!
sleep 3

echo "✅ All services started!"
echo "Backend: http://localhost:8000"
echo "Customer: http://localhost:5173"
echo "Admin: http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to press Ctrl+C
trap "kill $BACKEND_PID $CUSTOMER_PID $ADMIN_PID; exit" INT
wait
```

**Usage**:
```bash
chmod +x integration-test-e2e.sh
./integration-test-e2e.sh
```

---

## API Integration Tests (Automated)

### Using curl Scripts

**Test 1: Customer Login & Order Creation**
```bash
# 1. 고객 로그인
CUSTOMER_TOKEN=$(curl -X POST "http://localhost:8000/api/auth/login/customer" \
  -H "Content-Type: application/json" \
  -d '{"table_number": 1, "password": "1234"}' \
  -c cookies.txt -s | jq -r '.message')

# 2. 메뉴 조회
curl -X GET "http://localhost:8000/api/menus" \
  -b cookies.txt | jq

# 3. 주문 생성
curl -X POST "http://localhost:8000/api/orders" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"table_id": 1, "items": [{"menu_id": 1, "quantity": 1}]}' | jq
```

**Test 2: Admin Login & Order Management**
```bash
# 1. 관리자 로그인
ADMIN_TOKEN=$(curl -X POST "http://localhost:8000/api/auth/login/admin" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin1234"}' \
  -c admin_cookies.txt -s | jq -r '.message')

# 2. 주문 목록 조회
curl -X GET "http://localhost:8000/api/orders" \
  -b admin_cookies.txt | jq

# 3. 주문 상태 업데이트
ORDER_ID=1
curl -X PUT "http://localhost:8000/api/orders/${ORDER_ID}/status" \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{"status": "preparing"}' | jq
```

---

## Common Integration Issues

### Issue 1: CORS Errors
**Symptom**: Frontend에서 API 요청 시 CORS 오류
**Cause**: Backend CORS 설정 문제
**Solution**:
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: Cookie Not Set
**Symptom**: 로그인 후 인증 토큰이 저장되지 않음
**Cause**: SameSite 또는 Secure 쿠키 설정 문제
**Solution**:
```python
# backend/app/routers/auth_router.py
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    samesite="lax",  # 로컬 개발 시 "lax" 사용
    secure=False,    # HTTPS 아닐 때 False
)
```

### Issue 3: SSE Connection Fails
**Symptom**: Admin Dashboard에서 실시간 알림 받지 못함
**Cause**: SSE 연결 설정 문제 또는 방화벽
**Solution**:
1. 브라우저 콘솔에서 SSE 연결 상태 확인
2. Backend 로그에서 SSE 연결 확인
3. 네트워크 탭에서 `/api/sse/orders` 연결 확인

---

## Integration Test Summary

### Expected Results
- ✅ **Backend API**: 모든 엔드포인트 정상 응답
- ✅ **Customer Frontend**: 로그인, 메뉴 조회, 주문 생성 정상 동작
- ✅ **Admin Frontend**: 로그인, 주문 관리, 실시간 알림 정상 동작
- ✅ **SSE**: 실시간 이벤트 정상 수신
- ✅ **Database**: 데이터 정합성 유지

### Test Duration
- **Manual Testing**: ~10-15분
- **Automated API Tests**: ~2-3분

---

## Next Steps

✅ **If integration tests pass**: Proceed to Performance Tests (performance-test-instructions.md)

❌ **If integration tests fail**:
1. Check Backend logs for errors
2. Check Frontend browser console for errors
3. Verify CORS settings
4. Verify authentication token handling
5. Test individual API endpoints with curl
6. Fix issues and rerun tests
