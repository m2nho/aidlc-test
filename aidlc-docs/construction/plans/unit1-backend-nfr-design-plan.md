# NFR Design Plan - Unit 1: Backend API & Database

Unit 1 (Backend)의 NFR 요구사항을 구체적인 설계 패턴과 논리적 컴포넌트로 변환합니다.

---

## Plan Overview

**Unit**: Unit 1 - Backend API & Database  
**Components**: 26개 (Models, Services, Repositories, Routers, Utils)  
**NFR Focus**: Error Handling, Logging, Authentication, Transaction Management, SSE Management

---

## NFR Design Checklist

### Phase 1: Error Handling Pattern

- [x] HTTP 에러 응답 구조 설계
- [x] 비즈니스 예외 클래스 계층 구조 설계
- [x] 글로벌 예외 핸들러 설계
- [x] 검증 오류 처리 패턴 설계
- [x] 데이터베이스 오류 처리 패턴 설계

---

### Phase 2: Logging Pattern

- [x] 로깅 설정 구조 설계 (환경별 분리)
- [x] 로그 포맷 및 내용 표준화
- [x] 보안 로깅 전략 (민감 정보 제외)
- [x] 요청/응답 로깅 미들웨어 설계
- [x] 로그 파일 로테이션 전략

---

### Phase 3: Authentication & Authorization Pattern

- [x] JWT 생성 및 검증 로직 설계
- [x] HTTP-only Cookie 설정 패턴
- [x] 인증 의존성 주입 패턴
- [x] 역할 기반 권한 검증 패턴 (Customer vs Admin)
- [x] 토큰 갱신 전략 (선택 사항)

---

### Phase 4: Transaction Management Pattern

- [x] Repository 레벨 트랜잭션 패턴
- [x] Service 레벨 트랜잭션 조정 패턴
- [x] 롤백 및 커밋 전략
- [x] 중첩 트랜잭션 처리 방식
- [x] 트랜잭션 격리 수준 설정

---

### Phase 5: SSE Connection Management

- [x] SSE 연결 생명주기 관리
- [x] 이벤트 브로드캐스트 패턴
- [x] 연결 풀 관리 전략
- [x] Heartbeat 메커니즘
- [x] 재연결 처리 전략

---

### Phase 6: Performance Optimization Pattern

- [x] 데이터베이스 쿼리 최적화 전략
- [x] Eager Loading vs Lazy Loading 전략
- [x] 인덱스 활용 패턴
- [x] N+1 쿼리 문제 방지 패턴
- [x] 응답 페이로드 최소화 전략

---

### Phase 7: Logical Components

- [x] 로깅 컴포넌트 (Logger Utility)
- [x] 인증 컴포넌트 (JWT Manager)
- [x] SSE 매니저 컴포넌트
- [x] 에러 핸들러 컴포넌트
- [x] 환경 설정 컴포넌트 (Config Manager)

---

## Clarifying Questions

### Q1: Error Handling Strategy
비즈니스 예외를 어떻게 처리할까요?

A) **Custom Exception Classes**: 비즈니스 예외를 위한 커스텀 예외 클래스 계층 구조 (권장)
B) **HTTP Exceptions Only**: FastAPI의 HTTPException만 사용
C) **Mixed Approach**: 일부는 커스텀, 일부는 HTTPException
D) **Other** (please describe)

[Answer]: A

**Rationale**: 커스텀 예외 클래스로 비즈니스 로직과 HTTP 계층 분리, 글로벌 핸들러에서 일관된 변환 

---

### Q2: Logging Middleware
요청/응답 로깅을 어떻게 구현할까요?

A) **Custom Middleware**: FastAPI 미들웨어로 모든 요청/응답 로깅 (권장)
B) **Route-level Logging**: 각 라우터에서 수동 로깅
C) **No Request/Response Logging**: 비즈니스 이벤트만 로깅
D) **Other** (please describe)

[Answer]: A

**Rationale**: 미들웨어로 모든 엔드포인트에 일관된 로깅 적용, 중복 코드 제거 

---

### Q3: Authentication Dependency
인증 의존성 주입을 어떻게 구현할까요?

A) **Depends with JWT Utility**: FastAPI Depends + JWT 유틸리티 클래스 (권장)
B) **Decorator Pattern**: 커스텀 데코레이터로 인증
C) **Middleware**: 미들웨어에서 전역 인증
D) **Other** (please describe)

[Answer]: A

**Rationale**: FastAPI의 DI 시스템 활용, 엔드포인트별 인증 요구사항 유연하게 지정 가능 

---

### Q4: Transaction Scope
트랜잭션 스코프를 어디에 둘까요?

A) **Repository Level**: Repository 메서드마다 트랜잭션 (권장)
B) **Service Level**: Service 메서드가 트랜잭션 관리
C) **Route Level**: 라우터에서 트랜잭션 관리
D) **Other** (please describe)

[Answer]: A

**Rationale**: Repository가 데이터 접근 경계, 각 DB 작업마다 자동 트랜잭션 관리로 안전성 보장 

---

### Q5: SSE Connection Storage
SSE 연결을 어떻게 저장할까요?

A) **In-Memory Dict**: 메모리 딕셔너리에 연결 저장 (간단, 권장)
B) **Redis**: Redis에 연결 정보 저장 (분산 환경)
C) **Database**: 데이터베이스에 연결 상태 저장
D) **Other** (please describe)

[Answer]: A

**Rationale**: MVP 단일 서버 환경에서는 In-Memory로 충분, Redis 불필요 

---

### Q6: Database Session Management
데이터베이스 세션을 어떻게 관리할까요?

A) **Dependency Injection**: FastAPI Depends로 세션 주입 (권장)
B) **Context Manager**: with 문으로 세션 관리
C) **Global Session**: 전역 세션 객체 사용
D) **Other** (please describe)

[Answer]: A

**Rationale**: FastAPI DI로 세션 생명주기 자동 관리, try-finally로 안전한 close 보장 

---

### Q7: Configuration Management
환경 설정을 어떻게 관리할까요?

A) **Pydantic Settings**: pydantic BaseSettings로 타입 안전한 설정 (권장)
B) **python-dotenv Only**: os.getenv()로 직접 로드
C) **Config Class**: 커스텀 Config 클래스
D) **Other** (please describe)

[Answer]: A

**Rationale**: Pydantic BaseSettings로 타입 검증, 기본값 설정, .env 자동 로드 통합 

---

### Q8: Password Hashing Service
비밀번호 해싱을 어떻게 구현할까요?

A) **Utility Class**: bcrypt 래퍼 유틸리티 클래스 (권장)
B) **Direct bcrypt**: 직접 bcrypt 라이브러리 호출
C) **Service Layer**: AuthService에 통합
D) **Other** (please describe)

[Answer]: A

**Rationale**: 유틸리티 클래스로 bcrypt 래핑, 테스트 용이, 향후 알고리즘 변경 시 유연성 

---

## Deliverables

이 계획이 승인되면 다음 아티팩트를 생성합니다:

1. **nfr-design-patterns.md**: 설계 패턴 상세 문서
2. **logical-components.md**: 논리적 컴포넌트 및 유틸리티 설계

---

**Plan Complete** - 사용자 답변 대기 중
