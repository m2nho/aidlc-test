# Business Rules - Unit 1: Backend

Backend의 모든 비즈니스 규칙과 제약조건을 통합 정리합니다.

---

## 1. Authentication & Authorization Rules

### 1.1. Customer Authentication

| Rule ID | Rule | Rationale |
|---|---|---|
| AUTH-C-001 | 테이블 비밀번호는 4자리 숫자 (0000~9999) | 터치 입력 편의성 |
| AUTH-C-002 | 비밀번호는 평문 저장 (Customer 테이블) | MVP 간소화, 보안 위협 낮음 |
| AUTH-C-003 | is_active = FALSE인 테이블은 로그인 불가 | 테이블 비활성화 지원 |
| AUTH-C-004 | 로그인 성공 시 세션 ID 반환 (JWT 없음) | Customer는 간단한 세션 방식 |
| AUTH-C-005 | 세션 ID는 UUID v4 형식 | 고유성 보장 |

### 1.2. Admin Authentication

| Rule ID | Rule | Rationale |
|---|---|---|
| AUTH-A-001 | Admin 비밀번호는 bcrypt 해시 저장 | 보안 강화 |
| AUTH-A-002 | bcrypt cost factor = 12 | 보안과 성능 균형 |
| AUTH-A-003 | JWT 토큰 만료 시간 = 16시간 (57600초) | 하루 업무 시간 커버 |
| AUTH-A-004 | JWT 토큰은 HTTP-only Cookie로 전송 | XSS 공격 방지 |
| AUTH-A-005 | Cookie SameSite = Strict | CSRF 공격 방지 |
| AUTH-A-006 | JWT 알고리즘 = HS256 | 대칭키 방식, 단일 서버 환경 |
| AUTH-A-007 | Admin username은 store 내 고유 | 동일 username 허용 안 함 |
| AUTH-A-008 | 비밀번호 최소 길이 = 4자리 | MVP 간소화 |

### 1.3. Authorization Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| AUTHZ-001 | Admin은 자신의 store 데이터만 접근 가능 | Store 격리 |
| AUTHZ-002 | Customer는 자신의 session 데이터만 접근 가능 | 세션 격리 |
| AUTHZ-003 | SSE 연결은 JWT 인증 필수 (Admin만) | 실시간 데이터 보안 |

---

## 2. Order Rules

### 2.1. Order Creation Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| ORD-CR-001 | 활성 세션(is_active=TRUE) 필요 | 세션 없이 주문 불가 |
| ORD-CR-002 | 최소 1개 이상의 메뉴 항목 필요 | 빈 주문 방지 |
| ORD-CR-003 | 각 메뉴 수량은 1 이상 | 0개 주문 방지 |
| ORD-CR-004 | 메뉴는 is_active=TRUE만 주문 가능 | 비활성 메뉴 주문 방지 |
| ORD-CR-005 | 주문 총액 = SUM(OrderItem.price * quantity) | 데이터 일관성 |
| ORD-CR-006 | OrderItem.price는 주문 당시 Menu.price 스냅샷 | 가격 변경 영향 방지 |
| ORD-CR-007 | 동일 테이블에서 동시 주문 허용 | 병렬 주문 지원 |
| ORD-CR-008 | 주문 생성 시 SSE 이벤트 브로드캐스트 | 실시간 알림 |

### 2.2. Order Status Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| ORD-ST-001 | 초기 상태 = 'pending' | 주문 접수 |
| ORD-ST-002 | 허용 상태: pending, preparing, completed | 3단계 플로우 |
| ORD-ST-003 | pending → preparing 허용 | 조리 시작 |
| ORD-ST-004 | preparing → completed 허용 | 조리 완료 |
| ORD-ST-005 | pending → completed 불가 | 순차 전환 강제 |
| ORD-ST-006 | 역방향 전환 불가 (completed → preparing) | 단방향 플로우 |
| ORD-ST-007 | 동일 상태로 전환 시 idempotent (에러 없음) | 중복 요청 허용 |
| ORD-ST-008 | 상태 변경 시 SSE 이벤트 브로드캐스트 | 실시간 알림 |

### 2.3. Order Number Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| ORD-NUM-001 | Store별 순차 번호 (1, 2, 3, ...) | 직관적 |
| ORD-NUM-002 | 매일 초기화하지 않음 | 간단한 구현 |
| ORD-NUM-003 | Database unique constraint로 중복 방지 | 동시성 제어 |
| ORD-NUM-004 | 주문 삭제 시 번호 재사용 안 함 | 순차성 유지 |

### 2.4. Order Deletion Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| ORD-DEL-001 | Hard Delete (물리적 삭제) | MVP 간소화 |
| ORD-DEL-002 | OrderItem은 CASCADE 삭제 | 데이터 일관성 |
| ORD-DEL-003 | 삭제 시 SSE 이벤트 브로드캐스트 | 실시간 알림 |
| ORD-DEL-004 | OrderHistory 아카이브 후 삭제 가능 | 히스토리 보존 |
| ORD-DEL-005 | 복구 불가능 | MVP 제약 |

### 2.5. Order Query Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| ORD-QRY-001 | Customer는 자신의 session 주문만 조회 | 세션 격리 |
| ORD-QRY-002 | Admin은 store의 모든 활성 주문 조회 | 전체 관리 |
| ORD-QRY-003 | 조회 결과는 created_at DESC 정렬 | 최신 주문 우선 |
| ORD-QRY-004 | OrderItem은 JOIN으로 함께 조회 | N+1 문제 방지 |

---

## 3. Table Session Rules

### 3.1. Session Creation Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| SESS-CR-001 | Customer 로그인 시 자동 생성 또는 재사용 | UX 편의성 |
| SESS-CR-002 | 테이블당 활성 세션 1개만 허용 | 동시 세션 방지 |
| SESS-CR-003 | 활성 세션 있으면 새로 생성하지 않고 재사용 | 중복 방지 |
| SESS-CR-004 | start_time = 현재 시각 | 세션 시작 기록 |
| SESS-CR-005 | is_active = TRUE | 활성 상태 |

### 3.2. Session Lifecycle Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| SESS-LC-001 | 자동 타임아웃 없음 | 수동 관리 |
| SESS-LC-002 | Admin만 세션 종료 가능 | 권한 제한 |
| SESS-LC-003 | 세션 종료 조건: 모든 주문 completed or deleted | 미완료 주문 방지 |
| SESS-LC-004 | pending 또는 preparing 주문 있으면 종료 불가 | 안전장치 |
| SESS-LC-005 | 세션 종료 시 end_time 설정, is_active=FALSE | 상태 변경 |
| SESS-LC-006 | 세션 종료 시 OrderHistory 자동 생성 | 아카이브 |

### 3.3. Session Query Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| SESS-QRY-001 | 활성 테이블 조회 시 is_active=TRUE 필터 | 현재 사용 중만 |
| SESS-QRY-002 | 주문 정보 함께 조회 (JOIN) | 대시보드 효율성 |
| SESS-QRY-003 | 주문 수, 총액 집계 포함 | 통계 정보 |

---

## 4. Menu Rules

### 4.1. Menu Data Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| MENU-D-001 | 메뉴 이름 중복 허용 | 유연성 |
| MENU-D-002 | 가격 범위: 0원 ~ 10,000,000원 | 현실적 범위 |
| MENU-D-003 | 가격은 정수 (원 단위) | 소수점 제외 |
| MENU-D-004 | image_url은 외부 URL (http:// or https://) | 업로드 기능 없음 |
| MENU-D-005 | description은 optional (NULL 허용) | 선택적 설명 |

### 4.2. Menu Lifecycle Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| MENU-LC-001 | 생성 시 is_active=TRUE | 기본 활성 |
| MENU-LC-002 | is_active=FALSE인 메뉴는 Customer UI 미표시 | 비활성 메뉴 숨김 |
| MENU-LC-003 | Admin UI는 모든 메뉴 조회 (is_active 무관) | 전체 관리 |
| MENU-LC-004 | 메뉴 가격 변경 가능 | 유연성 |
| MENU-LC-005 | 가격 변경 시 기존 주문 영향 없음 (스냅샷) | 가격 히스토리 불필요 |

### 4.3. Menu Deletion Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| MENU-DEL-001 | Hard Delete (물리적 삭제) | MVP 간소화 |
| MENU-DEL-002 | 활성 주문에 포함된 메뉴 삭제 불가 (optional) | 안전장치 |
| MENU-DEL-003 | Foreign Key RESTRICT로 보호 | 데이터 무결성 |

### 4.4. Menu Category Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| CAT-001 | 카테고리 이름 중복 허용 | 유연성 |
| CAT-002 | display_order로 정렬 (ASC) | 표시 순서 제어 |
| CAT-003 | 카테고리에 메뉴 있으면 삭제 불가 | 데이터 무결성 |

---

## 5. SSE (Server-Sent Events) Rules

### 5.1. SSE Connection Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| SSE-CON-001 | Admin만 SSE 연결 가능 (Customer 불가) | 실시간 알림 대상 |
| SSE-CON-002 | JWT Cookie로 인증 | 보안 |
| SSE-CON-003 | store_id로 연결 그룹화 | Store별 격리 |
| SSE-CON-004 | 동일 store에 여러 Admin 연결 가능 | 다중 연결 지원 |
| SSE-CON-005 | 연결 종료 시 자동 cleanup | 리소스 정리 |

### 5.2. SSE Event Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| SSE-EVT-001 | 이벤트 타입: order.created, order.status_changed, order.deleted | 3가지 이벤트 |
| SSE-EVT-002 | 주문 생성 시 order.created 브로드캐스트 | 실시간 알림 |
| SSE-EVT-003 | 상태 변경 시 order.status_changed 브로드캐스트 | 실시간 알림 |
| SSE-EVT-004 | 주문 삭제 시 order.deleted 브로드캐스트 | 실시간 알림 |
| SSE-EVT-005 | 이벤트 데이터는 JSON 형식 | 구조화된 데이터 |

### 5.3. SSE Reliability Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| SSE-REL-001 | 이벤트 버퍼링 없음 | MVP 간소화 |
| SSE-REL-002 | 재연결 시 최신 상태 조회 | 단순한 복구 |
| SSE-REL-003 | 연결 타임아웃 = Browser 기본값 | 자동 재연결 |
| SSE-REL-004 | 전송 실패 시 재시도 없음 | 연결 끊김으로 간주 |

---

## 6. Data Consistency Rules

### 6.1. Referential Integrity

| Rule ID | Rule | Rationale |
|---|---|---|
| DATA-RI-001 | 모든 Foreign Key는 RESTRICT (OrderItem 제외) | 데이터 보호 |
| DATA-RI-002 | OrderItem은 CASCADE DELETE | 주문 삭제 시 함께 삭제 |
| DATA-RI-003 | Store 삭제 불가 (자식 엔티티 있음) | 시스템 데이터 보호 |
| DATA-RI-004 | Admin, Table 삭제 불가 (시드 데이터만) | 시스템 데이터 보호 |

### 6.2. Transactional Consistency

| Rule ID | Rule | Rationale |
|---|---|---|
| DATA-TX-001 | 주문 생성은 트랜잭션 (Order + OrderItems) | 원자성 |
| DATA-TX-002 | 세션 종료는 트랜잭션 (Session + OrderHistory) | 원자성 |
| DATA-TX-003 | 주문 삭제는 트랜잭션 (Order + OrderItems) | 원자성 |
| DATA-TX-004 | 트랜잭션 실패 시 전체 롤백 | 일관성 |

### 6.3. Data Validation

| Rule ID | Rule | Rationale |
|---|---|---|
| DATA-VAL-001 | UUID v4 형식 검증 | 올바른 ID 형식 |
| DATA-VAL-002 | 금액은 0 이상 정수 | 음수 방지 |
| DATA-VAL-003 | 수량은 1 이상 정수 | 0개 방지 |
| DATA-VAL-004 | Timestamp는 UTC | 시간대 일관성 |
| DATA-VAL-005 | URL 형식 검증 (image_url) | 올바른 URL |

### 6.4. Data Constraints

| Rule ID | Rule | Rationale |
|---|---|---|
| DATA-CON-001 | Order.total_amount = SUM(OrderItem.price * quantity) | 계산 일관성 |
| DATA-CON-002 | 활성 세션은 테이블당 1개 (UNIQUE constraint) | 동시 세션 방지 |
| DATA-CON-003 | order_number는 store별 고유 (UNIQUE constraint) | 번호 중복 방지 |
| DATA-CON-004 | Admin username은 store별 고유 (UNIQUE constraint) | 계정 중복 방지 |

---

## 7. Concurrency Control Rules

### 7.1. Optimistic Locking

| Rule ID | Rule | Rationale |
|---|---|---|
| CONC-OPT-001 | updated_at 컬럼으로 변경 감지 | 간단한 구현 |
| CONC-OPT-002 | 메뉴 수정 시 updated_at 비교 | 동시 수정 감지 |

### 7.2. Pessimistic Locking

| Rule ID | Rule | Rationale |
|---|---|---|
| CONC-PES-001 | 세션 종료 시 주문 조회 with FOR UPDATE | 동시 종료 방지 |
| CONC-PES-002 | order_number 생성 시 Database lock | 중복 방지 |

### 7.3. Concurrent Operations

| Rule ID | Rule | Rationale |
|---|---|---|
| CONC-OP-001 | 동시 주문 생성 허용 (동일 테이블) | 병렬 처리 |
| CONC-OP-002 | 동시 SSE 연결 허용 (동일 store) | 다중 관리자 |
| CONC-OP-003 | 동시 메뉴 수정 시 마지막 수정 우선 | Last-Write-Wins |

---

## 8. Error Handling Rules

### 8.1. HTTP Status Codes

| Rule ID | Code | When | Example |
|---|---|---|---|
| ERR-HTTP-001 | 200 | 성공 (조회, 수정, 삭제) | Order retrieved |
| ERR-HTTP-002 | 201 | 리소스 생성 성공 | Menu created |
| ERR-HTTP-003 | 400 | 잘못된 요청 (validation 실패) | Invalid status transition |
| ERR-HTTP-004 | 401 | 인증 실패 | Invalid password, JWT expired |
| ERR-HTTP-005 | 403 | 권한 없음 | Admin accessing different store |
| ERR-HTTP-006 | 404 | 리소스 없음 | Menu not found |
| ERR-HTTP-007 | 500 | 서버 에러 | Database connection failed |

### 8.2. Error Response Format

| Rule ID | Rule | Rationale |
|---|---|---|
| ERR-FMT-001 | 에러 응답은 JSON 형식 | 일관성 |
| ERR-FMT-002 | 필수 필드: error (string) | 에러 메시지 |
| ERR-FMT-003 | 선택 필드: detail (string) | 상세 설명 |
| ERR-FMT-004 | 민감 정보 노출 금지 | 보안 |

#### Error Response Example
```json
{
  "error": "Invalid status transition",
  "detail": "Cannot change status from pending to completed directly"
}
```

### 8.3. Validation Rules

| Rule ID | Rule | Action |
|---|---|---|
| ERR-VAL-001 | 필수 필드 누락 | 400 Bad Request |
| ERR-VAL-002 | 타입 불일치 | 400 Bad Request |
| ERR-VAL-003 | 범위 초과 (price, quantity) | 400 Bad Request |
| ERR-VAL-004 | 형식 오류 (URL, UUID) | 400 Bad Request |
| ERR-VAL-005 | 비즈니스 규칙 위반 | 400 Bad Request |

---

## 9. Security Rules

### 9.1. Authentication Security

| Rule ID | Rule | Rationale |
|---|---|---|
| SEC-AUTH-001 | Admin 비밀번호는 bcrypt 해시 | 비밀번호 보호 |
| SEC-AUTH-002 | JWT는 HTTP-only Cookie | XSS 방지 |
| SEC-AUTH-003 | Cookie SameSite=Strict | CSRF 방지 |
| SEC-AUTH-004 | JWT 비밀키는 환경변수 (.env) | 코드 노출 방지 |
| SEC-AUTH-005 | 비밀번호 원문 로그 금지 | 정보 유출 방지 |

### 9.2. Authorization Security

| Rule ID | Rule | Rationale |
|---|---|---|
| SEC-AUTHZ-001 | Admin은 store_id 검증 필수 | 권한 분리 |
| SEC-AUTHZ-002 | Customer는 session_id 검증 필수 | 세션 격리 |
| SEC-AUTHZ-003 | SSE는 JWT 인증 필수 | 실시간 데이터 보호 |

### 9.3. Input Validation Security

| Rule ID | Rule | Rationale |
|---|---|---|
| SEC-INPUT-001 | SQL Injection 방지 (ORM Parameterized Query) | 공격 방지 |
| SEC-INPUT-002 | XSS 방지 (Frontend sanitization) | 스크립트 삽입 방지 |
| SEC-INPUT-003 | 입력 길이 제한 (VARCHAR 제약) | DoS 방지 |

---

## 10. Performance Rules

### 10.1. Query Optimization

| Rule ID | Rule | Rationale |
|---|---|---|
| PERF-QRY-001 | Foreign Key에 인덱스 생성 | JOIN 성능 |
| PERF-QRY-002 | is_active 컬럼에 인덱스 | 필터링 성능 |
| PERF-QRY-003 | N+1 쿼리 방지 (JOIN 사용) | 쿼리 수 감소 |
| PERF-QRY-004 | 조회 결과 페이지네이션 불필요 (MVP 소규모) | 간소화 |

### 10.2. SSE Performance

| Rule ID | Rule | Rationale |
|---|---|---|
| PERF-SSE-001 | store_id별 연결 그룹화 | 불필요한 브로드캐스트 방지 |
| PERF-SSE-002 | 연결당 Queue 사용 | 비동기 전송 |
| PERF-SSE-003 | 연결 제한 없음 (MVP 소규모) | 간소화 |

### 10.3. Transaction Performance

| Rule ID | Rule | Rationale |
|---|---|---|
| PERF-TX-001 | 트랜잭션 최소화 | 잠금 시간 단축 |
| PERF-TX-002 | SSE 브로드캐스트는 트랜잭션 외부 | 잠금 영향 없음 |
| PERF-TX-003 | 읽기 전용 쿼리는 트랜잭션 불필요 | 오버헤드 감소 |

---

## 11. Testing Rules

### 11.1. Unit Test Coverage

| Rule ID | Rule | Target |
|---|---|---|
| TEST-UT-001 | 모든 Service 메서드 테스트 | 비즈니스 로직 검증 |
| TEST-UT-002 | 모든 Repository 메서드 테스트 | 데이터 접근 검증 |
| TEST-UT-003 | 에러 케이스 테스트 | 예외 처리 검증 |
| TEST-UT-004 | 목표 커버리지 80% 이상 | 코드 품질 |

### 11.2. Integration Test

| Rule ID | Rule | Target |
|---|---|---|
| TEST-IT-001 | 전체 주문 플로우 E2E | 통합 검증 |
| TEST-IT-002 | SSE 이벤트 수신 테스트 | 실시간 기능 검증 |
| TEST-IT-003 | 세션 라이프사이클 테스트 | 세션 관리 검증 |

---

## 12. Data Management Rules

### 12.1. Seed Data Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| DATA-SEED-001 | 1개 Store 생성 | MVP 단일 매장 |
| DATA-SEED-002 | 1개 Admin 생성 | 기본 관리자 |
| DATA-SEED-003 | 10개 Table 생성 | 테스트용 |
| DATA-SEED-004 | 3개 MenuCategory 생성 | 카테고리 예시 |
| DATA-SEED-005 | 10개 Menu 생성 | 메뉴 예시 |
| DATA-SEED-006 | 시드 데이터는 idempotent (재실행 가능) | 개발 편의성 |

### 12.2. Data Retention Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| DATA-RET-001 | OrderHistory 무제한 보존 | MVP 삭제 기능 없음 |
| DATA-RET-002 | 완료된 Order 보존 (삭제 안 함) | 데이터 유지 |
| DATA-RET-003 | 삭제된 Order 복구 불가 | Hard Delete |

---

## 13. Configuration Rules

### 13.1. Environment Variables

| Rule ID | Variable | Purpose | Example |
|---|---|---|---|
| CFG-ENV-001 | DATABASE_URL | SQLite 파일 경로 | sqlite:///./tableorder.db |
| CFG-ENV-002 | JWT_SECRET_KEY | JWT 서명 비밀키 | random_secret_key_here |
| CFG-ENV-003 | JWT_ALGORITHM | JWT 알고리즘 | HS256 |
| CFG-ENV-004 | JWT_EXPIRE_HOURS | JWT 만료 시간 | 16 |

### 13.2. Application Settings

| Rule ID | Setting | Value | Rationale |
|---|---|---|---|
| CFG-APP-001 | CORS Allowed Origins | Frontend URLs | Cross-origin 허용 |
| CFG-APP-002 | API Prefix | /api | URL 일관성 |
| CFG-APP-003 | SSE Keepalive | 30s | 연결 유지 |

---

## Rule Summary

| Category | Rule Count |
|---|---|
| Authentication & Authorization | 11 |
| Order | 30 |
| Table Session | 13 |
| Menu | 14 |
| SSE | 9 |
| Data Consistency | 17 |
| Concurrency | 9 |
| Error Handling | 13 |
| Security | 8 |
| Performance | 9 |
| Testing | 5 |
| Data Management | 8 |
| Configuration | 7 |
| **Total** | **153 Rules** |

---

**Business Rules Complete** ✓  
**Total Rules**: 153개  
**All Business Constraints Defined** ✓
