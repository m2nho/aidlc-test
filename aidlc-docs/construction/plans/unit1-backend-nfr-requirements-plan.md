# NFR Requirements Plan - Unit 1: Backend API & Database

Unit 1 (Backend)의 비기능적 요구사항(NFR)을 평가하고 기술 스택을 검증합니다.

---

## Plan Overview

**Unit**: Unit 1 - Backend API & Database  
**Components**: 26개 (Models, Services, Repositories, Routers, Utils)  
**Technology Stack (Pre-selected)**: Python 3.9+, FastAPI, SQLAlchemy, SQLite, bcrypt, JWT

---

## NFR Assessment Checklist

### Phase 1: Scalability Requirements

- [x] 예상 동시 사용자 수 평가
- [x] 예상 주문 처리량 평가
- [x] 데이터베이스 확장성 평가 (SQLite 제약사항)
- [x] SSE 연결 수 평가
- [x] 향후 확장 시나리오 평가

---

### Phase 2: Performance Requirements

- [x] API 응답 시간 목표 설정
- [x] 데이터베이스 쿼리 성능 목표 설정
- [x] SSE 이벤트 전송 지연 목표 설정
- [x] 동시 요청 처리 성능 목표 설정
- [x] 캐싱 전략 평가

---

### Phase 3: Availability Requirements

- [x] 서비스 가용성 목표 설정 (uptime %)
- [x] 장애 복구 전략 평가
- [x] 데이터베이스 백업 정책 설정
- [x] 배포 전략 평가 (downtime)
- [x] Health check 요구사항 평가

---

### Phase 4: Security Requirements

- [x] 인증/인가 보안 검증 (JWT, bcrypt)
- [x] API 보안 요구사항 평가 (HTTPS, CORS)
- [x] 입력 검증 및 SQL Injection 방어
- [x] 민감 정보 보호 (비밀번호, 세션)
- [x] 보안 로깅 요구사항

---

### Phase 5: Reliability Requirements

- [x] 에러 핸들링 전략
- [x] 로깅 수준 및 형식 정의
- [x] 모니터링 및 알림 요구사항
- [x] 장애 추적 요구사항 (Error Tracking)
- [x] 트랜잭션 관리 및 데이터 일관성 보장

---

### Phase 6: Maintainability Requirements

- [x] 코드 품질 기준 (테스트 커버리지, 린팅)
- [x] API 문서화 전략 (OpenAPI/Swagger)
- [x] 데이터베이스 마이그레이션 전략 (Alembic)
- [x] 개발 환경 설정 요구사항
- [x] 디버깅 및 트러블슈팅 지원

---

### Phase 7: Tech Stack Validation

- [x] Python/FastAPI 버전 확정
- [x] SQLAlchemy/Alembic 설정 검증
- [x] SQLite 제약사항 확인 및 대안 평가
- [x] 의존성 관리 전략 (requirements.txt, Poetry)
- [x] 개발/프로덕션 환경 분리 전략

---

## Clarifying Questions

### Q1: Expected Concurrent Users
MVP 단계에서 예상되는 동시 사용자 수는?

A) **Low (1-10 concurrent users)**: 단일 매장, 적은 테이블 수
B) **Medium (10-50 concurrent users)**: 여러 매장 또는 큰 매장
C) **High (50+ concurrent users)**: 다수 매장 체인
D) **Other** (please describe)

[Answer]: A

**Rationale**: MVP는 단일 매장 시나리오로 설계, 5-10개 테이블 정도 가정 

---

### Q2: API Response Time Target
API 응답 시간 목표는?

A) **Best Effort**: 특정 목표 없음, 합리적 수준이면 충분
B) **Sub-second (< 1s)**: 대부분의 API가 1초 이내 응답
C) **Fast (< 500ms)**: 대부분의 API가 500ms 이내 응답
D) **Very Fast (< 200ms)**: 대부분의 API가 200ms 이내 응답
E) **Other** (please describe)

[Answer]: B

**Rationale**: 1초 이내 응답은 사용자 경험에 적절하며, SQLite 기반으로 충분히 달성 가능 

---

### Q3: SSE Connection Scale
예상 SSE 동시 연결 수는?

A) **Low (1-5 connections)**: 단일 관리자, 소규모
B) **Medium (5-20 connections)**: 여러 관리자 또는 매장
C) **High (20+ connections)**: 대규모 멀티 매장
D) **Other** (please describe)

[Answer]: A

**Rationale**: MVP는 단일 매장, 1-2명의 관리자가 동시 접속하는 시나리오 

---

### Q4: Database Backup Strategy
데이터베이스 백업 전략은?

A) **No Automatic Backup**: MVP에서는 수동 백업만
B) **Daily Backup**: 일일 백업 (파일 복사)
C) **Real-time Replication**: 실시간 복제 (SQLite 제약 고려)
D) **Other** (please describe)

[Answer]: A

**Rationale**: MVP 단계에서는 자동 백업 없이 수동 관리로 충분, 필요 시 SQLite 파일 복사 

---

### Q5: Service Availability Target
서비스 가용성 목표는?

A) **Best Effort**: MVP 단계에서는 특정 목표 없음
B) **Business Hours (99%)**: 영업 시간 중 99% 가용성
C) **High Availability (99.9%)**: 24/7 고가용성
D) **Other** (please describe)

[Answer]: A

**Rationale**: MVP 검증 단계에서는 특정 가용성 SLA 없이 Best Effort로 운영 

---

### Q6: Logging Level and Strategy
로깅 수준 및 전략은?

A) **Basic (INFO)**: 주요 이벤트만 로깅 (주문 생성, 상태 변경)
B) **Detailed (DEBUG)**: 모든 요청/응답 및 내부 로직 로깅
C) **Custom**: 단계별 다른 로깅 수준 (프로덕션 INFO, 개발 DEBUG)
D) **Other** (please describe)

[Answer]: C

**Rationale**: 환경별 로깅 수준 분리로 개발 시 상세 디버깅, 프로덕션에서는 필수 이벤트만 기록 

---

### Q7: Error Tracking and Monitoring
에러 추적 및 모니터링 요구사항은?

A) **Console Logs Only**: 콘솔 로그만 사용, 별도 도구 없음
B) **File-based Logging**: 파일 기반 로깅, 수동 모니터링
C) **External Service**: Sentry, Datadog 등 외부 서비스 통합
D) **Other** (please describe)

[Answer]: B

**Rationale**: MVP에서는 파일 기반 로깅으로 충분, 외부 서비스 비용 불필요 

---

### Q8: HTTPS and CORS Configuration
HTTPS 및 CORS 설정 요구사항은?

A) **Development Only (HTTP)**: MVP는 HTTP만, HTTPS는 추후
B) **HTTPS Required**: 프로덕션 배포 시 HTTPS 필수
C) **CORS Permissive**: 모든 origin 허용 (개발 편의)
D) **CORS Restrictive**: 특정 origin만 허용
E) **Mix** (please describe)

[Answer]: E (개발: HTTP + CORS Permissive, 프로덕션: HTTPS 지원 + CORS Restrictive)

**Rationale**: 개발 단계에서는 편의성 우선, 프로덕션 배포 시 보안 강화 (환경변수로 제어) 

---

### Q9: Testing Requirements
테스트 요구사항은?

A) **Unit Tests Only**: 유닛 테스트만 (80% 커버리지 목표)
B) **Unit + Integration**: 유닛 + 통합 테스트
C) **Full Coverage**: 유닛 + 통합 + E2E 테스트
D) **Other** (please describe)

[Answer]: B

**Rationale**: 유닛 테스트로 비즈니스 로직 검증, 통합 테스트로 API 엔드포인트 및 DB 상호작용 검증 

---

### Q10: Database Migration Strategy
데이터베이스 마이그레이션 전략은?

A) **Alembic Auto-migration**: Alembic으로 자동 마이그레이션 생성
B) **Manual Migration Scripts**: 수동 마이그레이션 스크립트 작성
C) **No Migration (Recreate)**: MVP에서는 스키마 변경 시 재생성
D) **Other** (please describe)

[Answer]: A

**Rationale**: Alembic 자동 마이그레이션으로 스키마 변경 추적 및 버전 관리 

---

### Q11: Environment Configuration
환경 설정 관리 방식은?

A) **.env File**: .env 파일로 환경 변수 관리
B) **Environment Variables**: 시스템 환경 변수 사용
C) **Config File**: config.yaml 등 설정 파일 사용
D) **Mix** (please describe)

[Answer]: A

**Rationale**: .env 파일로 로컬/개발/프로덕션 환경 변수 관리, python-dotenv 사용 

---

### Q12: SQLite Limitations Awareness
SQLite의 제약사항을 인지하고 있나요?

A) **Aware and Accept**: 제약사항 인지, MVP에서는 문제 없음
B) **Consider PostgreSQL**: SQLite 제약 우려, PostgreSQL 고려
C) **Require PostgreSQL**: 처음부터 PostgreSQL 필요
D) **Other** (please describe)

[Answer]: A

**SQLite 제약사항**:
- 동시 쓰기 제한 (단일 writer)
- 대용량 데이터 처리 제한
- 일부 고급 SQL 기능 제한
- 네트워크 접근 불가 (파일 기반)

**Rationale**: MVP 규모(1-10 동시 사용자)에서는 SQLite로 충분, 향후 확장 시 PostgreSQL 마이그레이션 고려 

---

## Deliverables

이 계획이 승인되면 다음 아티팩트를 생성합니다:

1. **nfr-requirements.md**: 비기능적 요구사항 종합 문서
2. **tech-stack-decisions.md**: 기술 스택 결정 및 근거

---

**Plan Complete** - 사용자 답변 대기 중
