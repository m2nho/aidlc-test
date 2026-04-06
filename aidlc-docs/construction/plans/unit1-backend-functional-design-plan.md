# Functional Design Plan - Unit 1: Backend API & Database

Unit 1 (Backend)의 비즈니스 로직, 도메인 모델, 비즈니스 규칙을 상세 설계합니다.

---

## Plan Overview

**Unit**: Unit 1 - Backend API & Database  
**Components**: 26개 (Models, Services, Repositories, Routers, Utils)  
**User Stories**: TECH-001 (시드 데이터)  
**Technology**: Python 3.9+, FastAPI, SQLAlchemy, SQLite

---

## Functional Design Checklist

### Phase 1: Domain Entities Design (9개 테이블)

- [x] Store Entity 상세 설계
- [x] Table Entity 상세 설계
- [x] TableSession Entity 상세 설계
- [x] Admin Entity 상세 설계
- [x] MenuCategory Entity 상세 설계
- [x] Menu Entity 상세 설계
- [x] Order Entity 상세 설계
- [x] OrderItem Entity 상세 설계
- [x] OrderHistory Entity 상세 설계

---

### Phase 2: Business Logic Model (4개 서비스)

- [x] AuthService 비즈니스 로직 설계
- [x] OrderService 비즈니스 로직 설계
- [x] TableService 비즈니스 로직 설계
- [x] MenuService 비즈니스 로직 설계

---

### Phase 3: Business Rules & Validation

- [x] 인증 관련 비즈니스 규칙
- [x] 주문 관련 비즈니스 규칙
- [x] 테이블 세션 관련 비즈니스 규칙
- [x] 메뉴 관련 비즈니스 규칙
- [x] SSE 관련 비즈니스 규칙
- [x] 데이터 일관성 규칙

---

### Phase 4: Data Flow & Integration

- [x] 주문 생성 데이터 플로우
- [x] 주문 상태 변경 데이터 플로우
- [x] 테이블 세션 종료 데이터 플로우
- [x] SSE 스트림 데이터 플로우

---

### Phase 5: Error Handling & Edge Cases

- [x] 인증 오류 시나리오
- [x] 주문 오류 시나리오
- [x] 테이블 세션 오류 시나리오
- [x] 메뉴 관리 오류 시나리오
- [x] SSE 오류 시나리오

---

## Clarifying Questions

### Q1: Order Status Transitions
주문 상태 전환 규칙을 명확히 해주세요.

A) **Strict Sequential**: pending → preparing → completed (순차적 전환만 허용)
B) **Flexible**: pending → completed 직접 전환 허용
C) **With Cancellation**: pending → cancelled, preparing → cancelled 허용
D) **Other** (please describe)

[Answer]: A

**Rationale**: Strict sequential 전환으로 주문 플로우를 명확히 하고, 취소는 삭제 API로 처리

---

### Q2: Table Session Timeout
테이블 세션에 자동 타임아웃이 필요한가요?

A) **No Timeout**: 관리자가 수동으로만 세션 종료
B) **Fixed Timeout**: N시간 후 자동 종료 (시간 지정)
C) **Inactivity Timeout**: 마지막 주문 후 N시간 비활성 시 자동 종료
D) **Other** (please describe)

[Answer]: A

**Rationale**: MVP에서는 수동 관리로 충분, 자동 타임아웃은 복잡도 증가

---

### Q3: Menu Price History
메뉴 가격 변경 시 과거 주문의 가격 처리 방식은?

A) **Snapshot**: OrderItem에 주문 당시 가격 저장 (권장)
B) **Reference**: Menu 테이블의 현재 가격 참조
C) **Price History Table**: 별도 가격 히스토리 테이블
D) **Other** (please describe)

[Answer]: A

**Rationale**: OrderItem에 가격 스냅샷 저장하여 메뉴 가격 변경과 무관하게 주문 내역 보존

---

### Q4: Order Deletion Strategy
주문 삭제 방식은?

A) **Hard Delete**: 데이터베이스에서 완전 삭제
B) **Soft Delete**: deleted_at 컬럼으로 논리적 삭제
C) **Archive Only**: OrderHistory로 이동 후 삭제
D) **Other** (please describe)

[Answer]: A

**Rationale**: MVP에서는 Hard Delete로 간단하게 구현, 삭제된 주문은 복구 불가

---

### Q5: Concurrent Order Handling
동일 테이블에서 동시에 여러 주문 생성 시 처리 방식은?

A) **Allow Concurrent**: 동시 주문 허용 (각각 별도 order_number)
B) **Lock Table**: 테이블 잠금으로 순차 처리
C) **Merge Orders**: 짧은 시간 내 주문을 하나로 병합
D) **Other** (please describe)

[Answer]: A

**Rationale**: 동시 주문 허용, 각 주문은 독립적인 order_number 부여

---

### Q6: SSE Connection Authentication
SSE 스트림 연결 시 인증 방식은?

A) **JWT Cookie**: Admin 로그인 시 발급된 JWT Cookie로 인증
B) **Query Parameter Token**: URL에 토큰 포함 (?token=...)
C) **No Authentication**: store_id만으로 인증 (비권장)
D) **Other** (please describe)

[Answer]: A

**Rationale**: JWT Cookie로 인증하여 보안 유지, Admin 로그인된 사용자만 SSE 접근 가능

---

### Q7: Order Number Generation
주문 번호 생성 규칙은?

A) **Store-wide Sequential**: 스토어별 순차 번호 (1, 2, 3, ...)
B) **Date-based**: 날짜 기반 (YYYYMMDD-001)
C) **UUID**: 고유 UUID 생성
D) **Other** (please describe)

[Answer]: A

**Rationale**: 스토어별 순차 번호로 간단하고 직관적, 매일 초기화하지 않음

---

### Q8: OrderHistory Archive Trigger
OrderHistory 생성 시점은?

A) **On Session Complete**: 테이블 세션 종료 시 모든 주문 아카이브
B) **On Order Complete**: 개별 주문이 completed 상태가 되면 즉시 아카이브
C) **Manual**: 관리자가 수동으로 아카이브 트리거
D) **Other** (please describe)

[Answer]: A

**Rationale**: 세션 종료 시 모든 주문을 한 번에 아카이브하여 세션 단위 관리

---

### Q9: Table Password Policy
테이블 비밀번호 정책은?

A) **Simple Numeric**: 4자리 숫자 (1234)
B) **Alphanumeric**: 문자+숫자 조합
C) **Strong Policy**: 대소문자+숫자+특수문자
D) **Other** (please describe)

[Answer]: A

**Rationale**: 4자리 숫자로 간단하고 터치 입력 편리

---

### Q10: SSE Reconnection Policy
SSE 연결이 끊어진 경우 처리 방식은?

A) **Client Reconnect**: 클라이언트가 자동 재연결, 서버는 재연결 지원만
B) **Event Buffer**: 서버가 일정 시간 이벤트 버퍼링 후 재연결 시 전송
C) **No Special Handling**: 재연결 시 최신 상태만 조회
D) **Other** (please describe)

[Answer]: C

**Rationale**: MVP에서는 재연결 시 최신 상태 조회로 단순화, 이벤트 버퍼링 없음

---

## Deliverables

이 계획이 승인되면 다음 아티팩트를 생성합니다:

1. **domain-entities.md**: 9개 테이블의 상세 스키마 및 관계
2. **business-logic-model.md**: 4개 서비스의 비즈니스 로직 플로우
3. **business-rules.md**: 모든 비즈니스 규칙 및 제약조건 통합 문서

---

**Plan Complete** - 사용자 답변 대기 중
