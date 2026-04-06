# Unit of Work Story Map

각 User Story를 개발 유닛에 매핑하고 구현 순서를 정의합니다. (Contract-First 완전 독립 병렬 개발)

---

## Story Assignment Overview

| Unit | Story Count | Story IDs | Priority | Developer | Dependencies |
|---|---|---|---|---|---|
| **Unit 1: Backend** | 1 | TECH-001 | P1 | Developer 1 | Day 0 계약 |
| **Unit 2: Customer Frontend** | 8 | CUS-001 ~ CUS-008 | P1 | Developer 2 | Day 0 계약 |
| **Unit 3: Admin Frontend** | 11 | ADM-001 ~ ADM-011 | P1 | Developer 3 | Day 0 계약 |

**Total Stories**: 20  
**Total Units**: 3  
**Development Strategy**: Day 0 계약 합의 → Week 1-2 완전 병렬 개발 (Unit 1 ∥ Unit 2 ∥ Unit 3) → Week 3 통합

---

## Day 0: Contract & Schema Agreement (모든 개발자)

### Stories: None (사전 준비)

### Activities

**시간**: 1일 (8시간)

**Morning (4h)**:
- [ ] API 계약 정의 (api-contract.yaml)
  - 15개 API 엔드포인트 전체 명세
  - Request/Response 스키마
  - Error 응답 형식
  - JWT 인증 방식
  - SSE 이벤트 형식
- [ ] TypeScript 타입 생성 (index.ts)

**Afternoon (4h)**:
- [ ] Database Schema 정의 (database-schema.md)
  - ERD 다이어그램
  - 9개 테이블 구조
  - Foreign Key 관계
- [ ] Mock Data 샘플 (mock-data-samples.json)
  - 모든 API 응답 예시
  - SSE 이벤트 예시

### Deliverables

- [ ] `aidlc-docs/inception/contracts/api-contract.yaml`
- [ ] `aidlc-docs/inception/contracts/database-schema.md`
- [ ] `aidlc-docs/inception/contracts/mock-data-samples.json`
- [ ] `frontend/common-types/index.ts`

**Duration**: 1일  
**Participants**: Developer 1, 2, 3 (모두 참여)  
**Critical**: 이 단계 없이는 병렬 개발 불가능

---

## Unit 1: Backend API & Database

### Stories Assigned to Unit 1

| Story ID | Title | Priority | Depends On | Estimated Days |
|---|---|---|---|---|
| TECH-001 | 개발 환경 시드 데이터 생성 | Must Have | Day 0 계약 | 1-2 |

### Implementation Sequence

**Week 1-2 (10-14일)**:

1. **Day 1-2**: FastAPI 애플리케이션 구조
   - [ ] FastAPI app 초기화
   - [ ] Database 연결 설정 (SQLite)
   - [ ] Alembic 설정

2. **Day 3-5**: Database & Models
   - [ ] SQLAlchemy models (9개 테이블, Day 0 Schema 준수)
   - [ ] Alembic migrations
   - [ ] TECH-001: 시드 데이터 스크립트
   - [ ] 시드 데이터 로드 테스트

3. **Day 6-8**: Authentication & Menu APIs (6개 엔드포인트)
   - [ ] AuthService (JWT, bcrypt)
   - [ ] MenuService (CRUD)
   - [ ] Customer Login API
   - [ ] Admin Login API
   - [ ] Menu CRUD APIs (4개)
   - [ ] Day 0 계약 준수 확인

4. **Day 9-11**: Order & Table APIs + SSE (9개 엔드포인트)
   - [ ] OrderService (CRUD, 상태 관리)
   - [ ] TableService (세션 라이프사이클)
   - [ ] SSEManager (실시간 스트림)
   - [ ] Customer Order APIs (3개)
   - [ ] Admin Order APIs (6개)
   - [ ] SSE 엔드포인트
   - [ ] Day 0 계약 준수 확인

5. **Day 12-14**: Testing & Documentation
   - [ ] 단위 테스트 (services, repositories, routers)
   - [ ] Postman 테스트 (모든 엔드포인트)
   - [ ] API 문서 확인 (/docs)
   - [ ] README 작성

### Unit 1 Implementation Notes

- **독립 개발**: Backend 없이 시드 데이터와 Postman으로 테스트
- **Day 0 계약 준수**: 모든 API는 계약된 형식 정확히 준수
- **Frontend 불필요**: Mock API로 독립 개발 중인 Frontend는 영향 없음

### Unit 1 Deliverables

1. 작동하는 FastAPI 애플리케이션
2. SQLite 데이터베이스 (스키마 + 시드 데이터)
3. 15개 API 엔드포인트 (Day 0 계약 준수)
4. SSE 실시간 스트림
5. JWT 인증 미들웨어
6. 단위 테스트 (80% 이상 통과)
7. API 문서 (FastAPI auto-generated)

**Duration**: 1-2주  
**Developer**: Developer 1  
**Parallel**: Developer 2, 3와 완전 병렬 개발  
**No Dependencies**: Frontend 개발 진행과 무관

---

## Unit 2: Customer Frontend

### Stories Assigned to Unit 2

| Story ID | Title | Priority | Depends On | Estimated Days |
|---|---|---|---|---|
| CUS-001 | 테이블 자동 로그인 | Must Have | Day 0 계약 | 2 |
| CUS-002 | 메뉴 목록 조회 | Must Have | Day 0 계약, CUS-001 | 2 |
| CUS-003 | 메뉴 카테고리 필터링 | Should Have | CUS-002 | 1 |
| CUS-004 | 장바구니 담기 | Must Have | CUS-002 | 2 |
| CUS-005 | 장바구니 수량 조정 | Must Have | CUS-004 | 1 |
| CUS-006 | 주문 생성 | Must Have | Day 0 계약, CUS-004 | 3 |
| CUS-007 | 주문 내역 조회 | Must Have | Day 0 계약, CUS-006 | 2 |
| CUS-008 | 주문 상태 표시 | Should Have | CUS-007 | 1 |

### Implementation Sequence

**Week 1-2 (10-14일)**:

1. **Day 1**: React 프로젝트 초기화 & Mock API
   - [ ] Vite + React + TypeScript 프로젝트 생성
   - [ ] 공통 타입 import (`frontend/common-types/index.ts`)
   - [ ] Mock API 구현 (`mockApi.ts`, Day 0 계약 준수)
   - [ ] API 클라이언트 설정 (Mock ↔ Real 전환 가능)

2. **Day 2-3**: 공통 컴포넌트 & 레이아웃
   - [ ] Button, Modal, LoadingSpinner, EmptyState
   - [ ] App 레이아웃 (Header, Footer)
   - [ ] React Context 설정 (CustomerAppContext)
   - [ ] 라우팅 설정 (React Router)

3. **Day 4-5**: CUS-001 (테이블 자동 로그인)
   - [ ] 자동 로그인 로직 (URL 파라미터)
   - [ ] Session 저장 (Context + LocalStorage)
   - [ ] Mock API로 로그인 테스트
   - [ ] Unit test

4. **Day 6-8**: CUS-002, CUS-003 (메뉴 조회 & 필터링)
   - [ ] MenuPage 구현
   - [ ] MenuCategoryList 컴포넌트
   - [ ] MenuCard 컴포넌트
   - [ ] 카테고리 필터링 로직
   - [ ] Mock API로 메뉴 조회 테스트
   - [ ] Unit tests

5. **Day 9-10**: CUS-004, CUS-005 (장바구니)
   - [ ] CartPage 구현
   - [ ] CartItem 컴포넌트
   - [ ] LocalStorage 장바구니 관리
   - [ ] 수량 조정 로직
   - [ ] Unit tests

6. **Day 11-12**: CUS-006 (주문 생성)
   - [ ] 주문 생성 API 호출 (Mock)
   - [ ] 주문 성공 처리
   - [ ] 장바구니 초기화
   - [ ] Unit test

7. **Day 13-14**: CUS-007, CUS-008 (주문 내역)
   - [ ] OrderHistoryPage 구현
   - [ ] OrderCard 컴포넌트
   - [ ] 주문 상태 표시
   - [ ] Mock API로 주문 내역 테스트
   - [ ] Unit tests
   - [ ] 전체 통합 테스트 (Mock 환경)

### Unit 2 Implementation Notes

- **완전 독립**: Mock API로 Backend 없이 모든 기능 구현 및 테스트
- **Day 0 계약 준수**: Mock API는 계약된 형식 정확히 반환
- **Backend 불필요**: 개발 중 Backend 서버 실행 불필요

### Unit 2 Deliverables

1. 작동하는 React 애플리케이션 (고객용)
2. 8개 User Stories 구현
3. Mock API로 모든 기능 작동
4. 장바구니 LocalStorage 영속성
5. UI 컴포넌트 (13개)
6. 단위 테스트
7. README (Mock 실행 방법)

**Duration**: 1-2주  
**Developer**: Developer 2  
**Parallel**: Developer 1, 3와 완전 병렬 개발  
**No Dependencies**: Backend 개발 진행과 무관

---

## Unit 3: Admin Frontend

### Stories Assigned to Unit 3

| Story ID | Title | Priority | Depends On | Estimated Days | Epic |
|---|---|---|---|---|---|
| ADM-001 | 관리자 로그인 | Must Have | Day 0 계약 | 2 | - |
| ADM-002 | 실시간 주문 대시보드 (Epic) | Must Have | Day 0 계약, ADM-001 | 10 (epic) | Epic |
| ADM-002.1 | SSE 연결 및 실시간 주문 수신 | Must Have | ADM-002 | 4 | ADM-002 |
| ADM-002.2 | 주문 상태 변경 | Must Have | ADM-002.1 | 3 | ADM-002 |
| ADM-002.3 | 주문 삭제 | Must Have | ADM-002.1 | 3 | ADM-002 |
| ADM-003 | 테이블 관리 (Epic) | Must Have | Day 0 계약, ADM-001 | 7 (epic) | Epic |
| ADM-003.1 | 활성 테이블 목록 조회 | Must Have | ADM-003 | 2 | ADM-003 |
| ADM-003.2 | 테이블별 주문 내역 조회 | Must Have | ADM-003.1 | 3 | ADM-003 |
| ADM-003.3 | 테이블 세션 종료 | Must Have | ADM-003.1 | 2 | ADM-003 |
| ADM-004 | 메뉴 목록 조회 | Must Have | Day 0 계약, ADM-001 | 2 | - |
| ADM-005 | 메뉴 등록 | Must Have | ADM-004 | 3 | - |
| ADM-006 | 메뉴 수정 | Must Have | ADM-004 | 2 | - |
| ADM-007 | 메뉴 삭제 | Should Have | ADM-004 | 1 | - |

### Implementation Sequence

**Week 1-2 (10-14일)**:

1. **Day 1**: React 프로젝트 초기화 & Mock API + Mock SSE
   - [ ] Vite + React + TypeScript 프로젝트 생성
   - [ ] 공통 타입 import (`frontend/common-types/index.ts`)
   - [ ] Mock API 구현 (`mockApi.ts`, Day 0 계약 준수)
   - [ ] Mock SSE 구현 (`mockSse.ts`, Day 0 이벤트 형식 준수)
   - [ ] API 클라이언트 설정 (Mock ↔ Real 전환 가능)

2. **Day 2-3**: 공통 컴포넌트 & 레이아웃
   - [ ] Button, Modal, LoadingSpinner, EmptyState
   - [ ] App 레이아웃 (Sidebar, Header)
   - [ ] React Context 설정 (AdminAppContext)
   - [ ] 라우팅 설정 (React Router)

3. **Day 4-5**: ADM-001 (관리자 로그인)
   - [ ] LoginPage 구현
   - [ ] JWT Mock (Cookie 시뮬레이션)
   - [ ] 인증 상태 관리 (Context)
   - [ ] Mock API로 로그인 테스트
   - [ ] Unit test

4. **Day 6-9**: ADM-002.1 (SSE 연결 & 실시간 주문 수신)
   - [ ] DashboardPage 구현
   - [ ] SSE 클라이언트 (Mock SSE 연결)
   - [ ] TableCard 컴포넌트
   - [ ] 실시간 주문 수신 처리
   - [ ] Mock SSE 이벤트 시뮬레이션 테스트
   - [ ] Unit tests

5. **Day 10-12**: ADM-002.2, ADM-002.3 (주문 상태 변경 & 삭제)
   - [ ] OrderDetailModal 구현
   - [ ] 주문 상태 변경 로직 (Mock API)
   - [ ] 주문 삭제 로직 (Mock API)
   - [ ] Unit tests

6. **Day 13-14**: ADM-003 (테이블 관리) + ADM-004~007 (메뉴 CRUD)
   - [ ] TableManagementPage 구현
   - [ ] MenuManagementPage 구현
   - [ ] TableSetupForm, OrderHistoryModal 구현
   - [ ] MenuForm, MenuList 구현
   - [ ] Mock API로 CRUD 테스트
   - [ ] Unit tests
   - [ ] 전체 통합 테스트 (Mock 환경)

### Unit 3 Implementation Notes

- **완전 독립**: Mock API + Mock SSE로 Backend 없이 모든 기능 구현 및 테스트
- **Day 0 계약 준수**: Mock API & Mock SSE는 계약된 형식 정확히 반환
- **Backend 불필요**: 개발 중 Backend 서버 실행 불필요

### Unit 3 Deliverables

1. 작동하는 React 애플리케이션 (관리자용)
2. 11개 User Stories 구현
3. Mock API + Mock SSE로 모든 기능 작동
4. 실시간 대시보드 (Mock SSE)
5. UI 컴포넌트 (17개)
6. 단위 테스트
7. README (Mock 실행 방법)

**Duration**: 1-2주  
**Developer**: Developer 3  
**Parallel**: Developer 1, 2와 완전 병렬 개발  
**No Dependencies**: Backend 개발 진행과 무관

---

## Cross-Unit Story Dependencies

### 개발 중 (Week 1-2): 의존성 없음

**완전 독립 병렬 개발**:
- Unit 1: 시드 데이터 + Postman 테스트
- Unit 2: Mock API로 독립 개발
- Unit 3: Mock API + Mock SSE로 독립 개발

**No Backend → Frontend Dependency**: Mock 사용으로 의존성 제거  
**No Frontend → Frontend Dependency**: Unit 2 ↔ Unit 3 완전 독립

---

### 통합 후 (Week 3): 계약 기반 의존성

| Frontend Story | Backend API | Nature |
|---|---|---|
| CUS-001 | POST /api/customer/login | API endpoint |
| CUS-002 | GET /api/customer/menus | API endpoint |
| CUS-006 | POST /api/customer/orders | API endpoint |
| CUS-007 | GET /api/customer/orders | API endpoint |
| ADM-001 | POST /api/admin/login | API endpoint |
| ADM-002.1 | GET /api/admin/orders/stream | SSE endpoint (critical) |
| ADM-002.2 | PATCH /api/admin/orders/{id}/status | API endpoint |
| ADM-002.3 | DELETE /api/admin/orders/{id} | API endpoint |
| ADM-003.1 | GET /api/admin/tables (implied) | API endpoint |
| ADM-003.2 | GET /api/admin/orders/history | API endpoint |
| ADM-003.3 | POST /api/admin/tables/{id}/complete | API endpoint |
| ADM-004~007 | GET/POST/PUT/DELETE /api/admin/menus | API endpoints |

**통합 시점**: Week 3 (Mock → Real API 전환)

---

## Implementation Timeline

### Day 0: 계약 합의 (모든 개발자)

**모든 개발자 참여 (1일)**:
- [ ] API 계약 정의 (api-contract.yaml)
- [ ] Database Schema 정의 (database-schema.md)
- [ ] Mock Data 샘플 (mock-data-samples.json)
- [ ] TypeScript 타입 생성 (index.ts)

**Deliverables**:
- [ ] 4개 계약 문서 완료

---

### Week 1-2: 완전 병렬 개발 (3명 독립)

**Developer 1 (Unit 1 - Backend)**:
- [ ] Day 1-2: FastAPI 초기화
- [ ] Day 3-5: Database + Models + 시드 데이터 (TECH-001)
- [ ] Day 6-8: Auth & Menu APIs (6개)
- [ ] Day 9-11: Order & Table APIs + SSE (9개)
- [ ] Day 12-14: Testing & Documentation

**Developer 2 (Unit 2 - Customer Frontend)**:
- [ ] Day 1: React 초기화 + Mock API
- [ ] Day 2-3: 공통 컴포넌트
- [ ] Day 4-5: CUS-001 (자동 로그인)
- [ ] Day 6-8: CUS-002, CUS-003 (메뉴 조회)
- [ ] Day 9-10: CUS-004, CUS-005 (장바구니)
- [ ] Day 11-12: CUS-006 (주문 생성)
- [ ] Day 13-14: CUS-007, CUS-008 (주문 내역)

**Developer 3 (Unit 3 - Admin Frontend)**:
- [ ] Day 1: React 초기화 + Mock API + Mock SSE
- [ ] Day 2-3: 공통 컴포넌트
- [ ] Day 4-5: ADM-001 (로그인)
- [ ] Day 6-9: ADM-002.1 (SSE 실시간 대시보드)
- [ ] Day 10-12: ADM-002.2, ADM-002.3 (상태 변경, 삭제)
- [ ] Day 13-14: ADM-003, ADM-004~007 (테이블 & 메뉴 관리)

**Coordination**: 없음 (완전 독립, Day 0 계약만 준수)

---

### Week 3: 통합 & 테스트

**Day 1-2: Backend 준비**
- [ ] Developer 1: Backend 서버 실행 및 검증
- [ ] Developer 1: Postman 전체 API 테스트
- [ ] Developer 1: API 문서 (/docs) 확인
- [ ] Developer 2, 3: Backend API 엔드포인트 확인

**Day 3-4: Customer Frontend 통합**
- [ ] Developer 2: `.env` 변경 (VITE_USE_MOCK_API=false)
- [ ] Developer 2: Real API로 전환 테스트
- [ ] Developer 2: 버그 발견 시 Developer 1에게 보고
- [ ] Developer 2: 통합 테스트 (Customer journey)

**Day 5-6: Admin Frontend 통합**
- [ ] Developer 3: `.env` 변경 (VITE_USE_MOCK_API=false)
- [ ] Developer 3: Real API + Real SSE로 전환 테스트
- [ ] Developer 3: SSE 연결 검증
- [ ] Developer 3: 버그 발견 시 Developer 1에게 보고
- [ ] Developer 3: 통합 테스트 (Admin journey)

**Day 7: End-to-End 테스트**
- [ ] 모든 개발자: 전체 플로우 테스트
  - Customer: 로그인 → 메뉴 조회 → 장바구니 → 주문 생성
  - Admin: SSE로 실시간 주문 수신
  - Admin: 주문 상태 변경
  - Customer: 변경된 상태 확인 (주문 내역)
- [ ] 성능 테스트
- [ ] Bug fixes
- [ ] Documentation updates

---

## Story Priority Summary

### Must Have (17 stories)

**Unit 1**:
- TECH-001 (시드 데이터)

**Unit 2**:
- CUS-001, CUS-002, CUS-004, CUS-005, CUS-006, CUS-007 (6 stories)

**Unit 3**:
- ADM-001, ADM-002 (epic), ADM-002.1, ADM-002.2, ADM-002.3, ADM-003 (epic), ADM-003.1, ADM-003.2, ADM-003.3, ADM-004, ADM-005, ADM-006 (10 stories)

### Should Have (3 stories)

**Unit 2**:
- CUS-003 (카테고리 필터링)
- CUS-008 (주문 상태 표시)

**Unit 3**:
- ADM-007 (메뉴 삭제)

---

## Critical Path Analysis

### Critical Path: Day 0 계약 → 병렬 개발 → 통합

**Longest Path**:
1. Day 0: 계약 합의 (1일) - **Critical**
2. Week 1-2: 개발 (10-14일) - 모두 병렬
3. Week 3: 통합 (5-7일) - Sequential

**Total Duration**: 2.5-3주 (최소), 3-4주 (현실적)

**Optimization**:
- Day 0 계약을 철저히 하면 통합 시간 단축
- Mock API를 Day 0 계약과 정확히 일치시키면 통합 버그 최소화

### Bottlenecks

**통합 단계에서만 발생** (개발 중에는 bottleneck 없음):

1. **Backend API 불일치**: Day 0 계약과 실제 구현 차이
   - **Risk**: 통합 시 버그 발생
   - **Mitigation**: Developer 1이 Day 0 계약 철저히 준수, Postman으로 사전 검증

2. **SSE 통합 이슈**: Real SSE 연결 문제
   - **Risk**: Admin UI 실시간 기능 작동 안 함
   - **Mitigation**: Developer 1이 SSE 독립 테스트, Developer 3이 SSE reconnection 로직 구현

3. **CORS 문제**: Frontend → Backend 요청 시 CORS 에러
   - **Risk**: 통합 시 API 호출 실패
   - **Mitigation**: Developer 1이 FastAPI CORS 설정, Developer 2, 3가 credentials 설정

---

## Validation Checklist

- [x] All 20 stories assigned to units
- [x] Story dependencies identified (개발 중: 없음, 통합 후: Day 0 계약)
- [x] Implementation sequence defined for each unit (완전 독립)
- [x] Cross-unit dependencies mapped (통합 시에만)
- [x] Timeline and critical path analyzed (병렬 + 통합)
- [x] Must Have vs Should Have priorities respected
- [x] Epic breakdown included (ADM-002, ADM-003)
- [x] API dependencies documented per story (Day 0 계약)
- [x] Parallel development opportunities identified (Week 1-2 완전 병렬)
- [x] Developer assignments defined (Developer 1, 2, 3)
- [x] Coordination points identified (Day 0만, 개발 중 coordination 불필요)
- [x] Mock strategy defined (Mock API + Mock SSE로 독립 개발)

---

**Story Mapping Complete** ✓  
**All Stories Assigned**: 20/20  
**Units Covered**: 3/3  
**Development Strategy**: Day 0 계약 → Week 1-2 완전 병렬 (Unit 1 ∥ Unit 2 ∥ Unit 3) → Week 3 통합  
**Critical Path**: Day 0 계약 → 병렬 개발 → 통합  
**Independence Guaranteed**: Mock API + Mock SSE로 완전 독립 병렬 개발 가능
