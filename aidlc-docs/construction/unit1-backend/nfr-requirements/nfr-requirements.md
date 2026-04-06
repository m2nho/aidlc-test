# NFR Requirements - Unit 1: Backend API & Database

Unit 1 (Backend API & Database)의 비기능적 요구사항(Non-Functional Requirements)을 정의합니다.

---

## Document Overview

**Unit**: Unit 1 - Backend API & Database  
**Components**: 26개 (Models 9, Services 4, Repositories 4, Routers 4, Utils 5)  
**Technology**: Python 3.9+, FastAPI, SQLAlchemy, SQLite  
**Scope**: MVP 단일 매장 시나리오

---

## 1. Scalability Requirements

### 1.1 User Capacity
- **동시 사용자 수**: 1-10명 (고객 5-8명 + 관리자 1-2명)
- **테이블 수**: 5-10개 테이블
- **매장 수**: 단일 매장
- **확장 전략**: MVP 검증 후 PostgreSQL 마이그레이션 고려

### 1.2 Order Processing Capacity
- **동시 주문 생성**: 5개 이하 동시 처리
- **일일 주문량**: 100-200 주문 예상
- **주문 항목**: 주문당 평균 2-5개 항목
- **아카이브 데이터**: 세션당 평균 10-20개 주문

### 1.3 SSE Connection Capacity
- **동시 SSE 연결**: 1-5개 연결 (관리자당 1개)
- **이벤트 전송 빈도**: 주문 생성/변경 시 실시간
- **연결 유지 시간**: 영업 시간 내 지속 (8-12시간)

### 1.4 Database Scalability
- **데이터베이스**: SQLite (파일 기반)
- **동시 쓰기 제한**: 단일 writer (SQLite 특성)
- **데이터 크기**: 예상 100MB 이하 (1년 기준)
- **성능 임계점**: 10,000 주문 이상 시 쿼리 성능 재평가 필요

### 1.5 Scalability Constraints
- SQLite는 동시 쓰기 제한 (단일 writer lock)
- 네트워크 기반 데이터베이스 접근 불가 (파일 기반)
- 수평 확장(scale-out) 불가
- 수직 확장(scale-up)만 가능

---

## 2. Performance Requirements

### 2.1 API Response Time
- **목표**: 대부분의 API가 1초 이내 응답
- **주요 API 목표**:
  - `POST /api/orders`: < 500ms (주문 생성)
  - `PATCH /api/orders/{id}/status`: < 300ms (상태 변경)
  - `GET /api/orders`: < 500ms (주문 목록 조회)
  - `GET /api/menus`: < 300ms (메뉴 조회)
  - `POST /api/auth/login/*`: < 500ms (로그인)
- **복잡한 쿼리**: 1-2초 허용 (예: 전체 히스토리 조회)

### 2.2 Database Query Performance
- **단순 조회**: < 100ms (인덱스 활용)
- **조인 쿼리**: < 300ms (2-3개 테이블 조인)
- **집계 쿼리**: < 500ms (COUNT, SUM 등)
- **인덱스 전략**:
  - Primary Key 인덱스 (자동)
  - Foreign Key 인덱스 (수동 생성)
  - 자주 조회되는 컬럼 인덱스 (store_id, status, table_id)

### 2.3 SSE Event Delivery
- **이벤트 전송 지연**: < 1초 (주문 생성/변경 → SSE 이벤트 전송)
- **이벤트 크기**: < 5KB per event
- **연결 유지**: Heartbeat 30초마다 전송
- **재연결 시간**: < 3초

### 2.4 Concurrent Request Handling
- **동시 요청**: 10개 요청 동시 처리
- **요청 큐잉**: FastAPI의 비동기 처리 활용
- **타임아웃**: API 요청 30초 타임아웃

### 2.5 Caching Strategy
- **메뉴 캐싱**: 메뉴 데이터는 캐싱 없음 (실시간 변경 반영)
- **세션 캐싱**: 활성 세션 정보는 메모리 캐싱 가능 (선택 사항)
- **JWT 검증**: 매 요청마다 검증 (캐싱 없음)

---

## 3. Availability Requirements

### 3.1 Service Availability
- **목표**: Best Effort (MVP 단계에서 특정 SLA 없음)
- **영업 시간**: 주 7일, 하루 10-12시간 운영 가정
- **계획된 다운타임**: 업데이트/배포 시 최대 5분 허용
- **비계획 다운타임**: 수동 복구

### 3.2 Failure Recovery
- **데이터베이스 백업**: 수동 백업 (SQLite 파일 복사)
- **백업 빈도**: 매일 또는 주간 (수동)
- **복구 시간**: 30분 이내 (수동 복구)
- **복구 절차**: 
  1. 백업된 SQLite 파일 복원
  2. 서버 재시작
  3. 서비스 정상 동작 확인

### 3.3 Deployment Strategy
- **배포 방식**: 수동 배포 (git pull + restart)
- **다운타임**: 배포 시 1-5분 다운타임 허용
- **롤백 전략**: 이전 버전으로 git checkout 후 재시작

### 3.4 Health Check
- **Health Check 엔드포인트**: `GET /health`
- **응답 내용**: 
  - `status`: "ok" | "error"
  - `database`: "connected" | "disconnected"
  - `timestamp`: ISO 8601 timestamp
- **체크 간격**: 외부 모니터링 툴에서 1분마다 호출 (선택 사항)

---

## 4. Security Requirements

### 4.1 Authentication & Authorization
- **인증 방식**: JWT (JSON Web Token)
- **토큰 저장**: HTTP-only Cookie
- **토큰 만료**: 16시간 (영업 시간 커버)
- **비밀번호 해싱**: bcrypt (cost factor 12)
- **JWT 서명**: HS256 알고리즘
- **시크릿 키**: 환경 변수 (.env)에서 로드

### 4.2 API Security
- **HTTPS**: 
  - 개발 환경: HTTP (localhost)
  - 프로덕션 환경: HTTPS 지원 (리버스 프록시 또는 서버 설정)
- **CORS 설정**:
  - 개발 환경: 모든 origin 허용 (permissive)
  - 프로덕션 환경: 특정 origin만 허용 (restrictive)
- **Rate Limiting**: MVP에서는 구현하지 않음
- **API Key**: 사용하지 않음 (JWT로 충분)

### 4.3 Input Validation
- **Pydantic 모델**: 모든 요청 body 검증
- **SQL Injection 방어**: SQLAlchemy ORM 사용 (parameterized queries)
- **XSS 방어**: 입력값 이스케이프 (FastAPI 기본 제공)
- **파일 업로드**: MVP에서는 파일 업로드 없음

### 4.4 Sensitive Data Protection
- **비밀번호**: bcrypt 해싱, 평문 저장 금지
- **JWT Secret**: 환경 변수에서 로드, 코드에 하드코딩 금지
- **데이터베이스 파일**: 접근 권한 제한 (파일 시스템 레벨)
- **로그**: 비밀번호, JWT 토큰 로깅 금지

### 4.5 Security Logging
- **로그 레벨**: 
  - 로그인 실패: WARNING
  - 인증 실패: WARNING
  - 권한 오류: ERROR
- **로그 내용**: 
  - 타임스탬프
  - 사용자 ID (store_id, admin_id)
  - 요청 엔드포인트
  - 실패 원인 (예: "Invalid password", "Token expired")

---

## 5. Reliability Requirements

### 5.1 Error Handling
- **HTTP 상태 코드**: 
  - 200 OK: 성공
  - 201 Created: 리소스 생성 성공
  - 400 Bad Request: 잘못된 요청 (검증 실패)
  - 401 Unauthorized: 인증 실패
  - 403 Forbidden: 권한 없음
  - 404 Not Found: 리소스 없음
  - 409 Conflict: 비즈니스 규칙 위반
  - 500 Internal Server Error: 서버 오류
- **에러 응답 형식**:
```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": { ... }  // 선택 사항
}
```

### 5.2 Logging Strategy
- **로깅 라이브러리**: Python `logging` 모듈
- **로깅 레벨**:
  - **개발 환경**: DEBUG (모든 요청/응답 로깅)
  - **프로덕션 환경**: INFO (주요 이벤트만 로깅)
- **로그 출력**:
  - Console (stdout)
  - 파일 (`logs/app.log`)
- **로그 로테이션**: 일일 로테이션, 최대 7일 보관

### 5.3 Logging Content
- **INFO 레벨**:
  - 주문 생성: `"Order {order_id} created for table {table_number}"`
  - 주문 상태 변경: `"Order {order_id} status changed to {status}"`
  - 세션 생성/종료: `"Session {session_id} started/completed"`
  - 로그인 성공: `"Admin {admin_id} logged in"`
- **WARNING 레벨**:
  - 로그인 실패
  - 비즈니스 규칙 위반 (예: 이미 완료된 주문 수정 시도)
- **ERROR 레벨**:
  - 데이터베이스 연결 실패
  - 예상치 못한 예외
  - SSE 연결 오류

### 5.4 Monitoring and Alerting
- **모니터링 도구**: 파일 기반 로깅 (외부 서비스 없음)
- **수동 모니터링**: 로그 파일 확인
- **알림**: MVP에서는 알림 기능 없음
- **에러 추적**: 로그 파일에서 ERROR 레벨 검색

### 5.5 Transaction Management
- **트랜잭션 범위**: Repository 레벨
- **자동 롤백**: 예외 발생 시 자동 롤백
- **트랜잭션 격리 수준**: SQLite 기본값 (SERIALIZABLE)
- **긴 트랜잭션**: 피함 (최대 5초)

### 5.6 Data Consistency
- **Referential Integrity**: Foreign Key 제약조건 활용
- **데이터 검증**: Pydantic 모델 + 비즈니스 규칙 검증
- **Optimistic Locking**: MVP에서는 구현하지 않음
- **Pessimistic Locking**: 필요 시 SELECT ... FOR UPDATE (SQLite 제한적 지원)

---

## 6. Maintainability Requirements

### 6.1 Code Quality
- **테스트 커버리지**: 
  - 유닛 테스트: 80% 이상 (Service, Repository 레이어)
  - 통합 테스트: 주요 API 엔드포인트 커버
- **코드 린팅**: 
  - pylint 또는 flake8
  - Black (코드 포맷터)
- **타입 힌팅**: Python 3.9+ type hints 사용

### 6.2 Testing Strategy
- **유닛 테스트**: 
  - Service 레이어 비즈니스 로직 검증
  - Repository 레이어 데이터 접근 검증
  - 프레임워크: pytest
- **통합 테스트**: 
  - API 엔드포인트 E2E 테스트
  - 데이터베이스 상호작용 테스트
  - 프레임워크: pytest + TestClient (FastAPI)
- **테스트 데이터**: 
  - In-memory SQLite (`:memory:`) 사용
  - 테스트 픽스처로 시드 데이터 생성

### 6.3 API Documentation
- **자동 문서화**: FastAPI 자동 생성 (OpenAPI/Swagger)
- **엔드포인트**: `/docs` (Swagger UI), `/redoc` (ReDoc)
- **문서 내용**: 
  - 요청/응답 스키마
  - 상태 코드
  - 인증 요구사항
  - 예시 요청/응답

### 6.4 Database Migration
- **마이그레이션 도구**: Alembic
- **마이그레이션 전략**: 
  - 스키마 변경 시 자동 마이그레이션 생성
  - `alembic revision --autogenerate -m "message"`
- **마이그레이션 실행**: 
  - 개발 환경: 자동 실행 (앱 시작 시)
  - 프로덕션 환경: 수동 실행 (`alembic upgrade head`)
- **롤백**: `alembic downgrade -1`

### 6.5 Development Environment
- **Python 버전**: 3.9 이상
- **의존성 관리**: `requirements.txt` 또는 `pyproject.toml` (Poetry)
- **가상 환경**: venv 또는 virtualenv
- **환경 변수**: `.env` 파일 (python-dotenv)
- **로컬 실행**: `uvicorn main:app --reload`

### 6.6 Debugging and Troubleshooting
- **디버그 모드**: 개발 환경에서 활성화 (`DEBUG=True`)
- **상세 에러 메시지**: 개발 환경에서 스택 트레이스 노출
- **로그 레벨**: 개발 환경 DEBUG, 프로덕션 INFO
- **FastAPI 자동 문서**: `/docs`에서 API 테스트 가능

---

## 7. Usability Requirements

### 7.1 API Usability
- **RESTful 원칙**: 일관된 URL 구조 및 HTTP 메서드 사용
- **명확한 에러 메시지**: 사용자 친화적 에러 메시지
- **일관된 응답 형식**: JSON 응답 형식 통일

### 7.2 Developer Experience
- **개발 서버**: 핫 리로드 지원 (`uvicorn --reload`)
- **자동 문서화**: `/docs`로 API 테스트 가능
- **명확한 코드 구조**: Layered Architecture (Router → Service → Repository)

---

## 8. Compliance and Standards

### 8.1 Coding Standards
- **PEP 8**: Python 코딩 스타일 가이드 준수
- **네이밍 컨벤션**: 
  - 함수/변수: snake_case
  - 클래스: PascalCase
  - 상수: UPPER_SNAKE_CASE

### 8.2 API Standards
- **RESTful API**: REST 원칙 준수
- **OpenAPI 3.0**: FastAPI 자동 생성

---

## 9. NFR Summary Matrix

| NFR Category | Key Metric | Target | Priority |
|--------------|------------|--------|----------|
| Scalability | 동시 사용자 수 | 1-10명 | High |
| Scalability | 동시 SSE 연결 | 1-5개 | Medium |
| Performance | API 응답 시간 | < 1초 | High |
| Performance | SSE 이벤트 지연 | < 1초 | High |
| Availability | 서비스 가용성 | Best Effort | Low |
| Availability | 백업 전략 | 수동 백업 | Medium |
| Security | 인증 방식 | JWT + bcrypt | High |
| Security | HTTPS | 프로덕션 지원 | Medium |
| Reliability | 에러 핸들링 | 표준 HTTP 코드 | High |
| Reliability | 로깅 | 파일 기반 | Medium |
| Maintainability | 테스트 커버리지 | 80% (유닛) | High |
| Maintainability | API 문서화 | OpenAPI 자동 | High |
| Maintainability | DB 마이그레이션 | Alembic 자동 | High |

---

## 10. Trade-offs and Constraints

### 10.1 SQLite vs PostgreSQL
- **선택**: SQLite
- **이유**: 
  - MVP 단순 배포 (파일 기반)
  - 설정 및 관리 간단
  - 1-10 동시 사용자에 충분
- **제약사항**: 
  - 동시 쓰기 제한
  - 수평 확장 불가
- **마이그레이션 경로**: 향후 PostgreSQL로 전환 가능 (SQLAlchemy ORM 사용으로 전환 용이)

### 10.2 파일 기반 로깅 vs 외부 서비스
- **선택**: 파일 기반 로깅
- **이유**: 
  - MVP 비용 절감
  - 설정 간단
- **제약사항**: 
  - 실시간 모니터링 어려움
  - 대규모 로그 분석 제한
- **마이그레이션 경로**: 향후 Sentry, Datadog 등 외부 서비스 통합 가능

### 10.3 수동 백업 vs 자동 백업
- **선택**: 수동 백업
- **이유**: 
  - MVP 단순화
  - 자동 백업 스크립트 불필요
- **제약사항**: 
  - 백업 누락 위험
  - 수동 개입 필요
- **마이그레이션 경로**: 향후 cron job 또는 백업 서비스 추가 가능

---

**NFR Requirements Complete**
