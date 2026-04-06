# Tech Stack Decisions - Unit 1: Backend API & Database

Unit 1 (Backend API & Database)의 기술 스택 선택 근거 및 결정 사항을 문서화합니다.

---

## Document Overview

**Unit**: Unit 1 - Backend API & Database  
**Decision Date**: 2026-04-06  
**Decision Context**: MVP 테이블오더 서비스 Backend 구축  
**Target Audience**: 개발자, 아키텍트

---

## 1. Core Technology Stack

### 1.1 Python 3.9+

**선택 이유**:
- ✅ **빠른 개발 속도**: 간결한 문법, 풍부한 라이브러리 생태계
- ✅ **FastAPI 지원**: Python 3.9+ 타입 힌팅 활용
- ✅ **개발자 친화적**: 학습 곡선 낮음, 디버깅 용이
- ✅ **비동기 지원**: `async`/`await` 키워드로 비동기 처리
- ✅ **크로스 플랫폼**: Windows, macOS, Linux 모두 지원

**대안 기술**:
- Node.js (Express, NestJS): 타입 안정성 낮음, MVP 개발 속도 느림
- Go: 학습 곡선 높음, ORM 생태계 부족
- Java (Spring Boot): 보일러플레이트 많음, 개발 속도 느림

**버전 선택**: 3.9 이상
- 타입 힌팅 개선 (PEP 585, PEP 604)
- 딕셔너리 병합 연산자 (`|`)
- 문자열 메서드 개선

---

### 1.2 FastAPI

**선택 이유**:
- ✅ **자동 문서화**: OpenAPI/Swagger 자동 생성 (`/docs`)
- ✅ **타입 검증**: Pydantic 기반 자동 요청/응답 검증
- ✅ **비동기 지원**: `async`/`await` 네이티브 지원
- ✅ **빠른 성능**: Starlette 기반, 높은 처리 속도
- ✅ **개발자 경험**: 코드 완성, IDE 지원 우수
- ✅ **SSE 지원**: `StreamingResponse`로 SSE 구현 용이

**대안 프레임워크**:
- Flask: 자동 문서화 없음, 타입 검증 수동
- Django: 무거움 (ORM, Admin 등), REST API에 과도한 기능
- Django REST Framework: Django 의존성, 학습 곡선 높음

**주요 기능 활용**:
- Dependency Injection (DI): 인증, DB 세션 관리
- Pydantic Models: 요청/응답 스키마 정의
- APIRouter: 라우터 모듈화
- Middleware: CORS, 로깅, 에러 핸들링
- Background Tasks: 비동기 작업 (선택 사항)

---

### 1.3 SQLAlchemy 2.0+

**선택 이유**:
- ✅ **ORM 추상화**: SQL 쿼리 없이 Python 코드로 DB 조작
- ✅ **타입 안정성**: Python 타입 힌팅 지원
- ✅ **데이터베이스 독립성**: SQLite → PostgreSQL 전환 용이
- ✅ **관계 매핑**: Foreign Key, One-to-Many, Many-to-One 자동 매핑
- ✅ **트랜잭션 관리**: Context manager로 트랜잭션 자동 관리
- ✅ **쿼리 빌더**: 복잡한 쿼리도 Python 코드로 표현

**대안 ORM**:
- Django ORM: Django 프레임워크 의존
- Peewee: 기능 제한적, 커뮤니티 작음
- Tortoise ORM: 비동기 전용, 학습 곡선 높음

**주요 기능 활용**:
- Declarative Base: 모델 정의
- Session Management: 트랜잭션 관리
- Relationship: Foreign Key 자동 로드
- Query API: 필터링, 정렬, 조인
- Eager Loading: `joinedload`, `selectinload`

---

### 1.4 Alembic

**선택 이유**:
- ✅ **자동 마이그레이션 생성**: `--autogenerate`로 스키마 변경 감지
- ✅ **버전 관리**: 마이그레이션 히스토리 추적
- ✅ **롤백 지원**: `downgrade` 명령으로 이전 버전 복원
- ✅ **SQLAlchemy 통합**: SQLAlchemy 모델 기반 마이그레이션
- ✅ **환경별 설정**: 개발/프로덕션 환경 분리

**대안 도구**:
- SQLAlchemy-Migrate: 더 이상 활발히 유지보수되지 않음
- 수동 SQL 스크립트: 버전 관리 어려움, 오류 위험 높음

**주요 명령어**:
```bash
# 마이그레이션 생성
alembic revision --autogenerate -m "Add order table"

# 마이그레이션 실행
alembic upgrade head

# 마이그레이션 롤백
alembic downgrade -1

# 마이그레이션 히스토리
alembic history
```

---

### 1.5 SQLite

**선택 이유**:
- ✅ **단순 배포**: 파일 기반, 별도 서버 불필요
- ✅ **설정 없음**: 설치 및 설정 간단
- ✅ **개발 편의성**: 로컬 개발 시 즉시 사용 가능
- ✅ **데이터 이식성**: `.db` 파일 하나로 전체 데이터 관리
- ✅ **MVP 적합**: 1-10 동시 사용자에 충분한 성능

**제약사항**:
- ⚠️ **동시 쓰기 제한**: 단일 writer lock (동시 쓰기 불가)
- ⚠️ **확장성 제한**: 수평 확장(scale-out) 불가
- ⚠️ **네트워크 접근 불가**: 파일 기반, 원격 접근 제한
- ⚠️ **고급 SQL 기능 제한**: Window function, 일부 제약조건 지원 제한

**대안 데이터베이스**:
- PostgreSQL: 설정 복잡, MVP에 과도한 기능
- MySQL: 설정 복잡, 라이선스 이슈 (GPL)
- MongoDB: NoSQL, 관계형 데이터에 부적합

**마이그레이션 경로**:
- SQLAlchemy ORM 사용으로 PostgreSQL 전환 용이
- 마이그레이션 시점: 동시 사용자 50명 이상, 또는 멀티 매장 확장 시

---

## 2. Authentication & Security

### 2.1 JWT (JSON Web Token)

**선택 이유**:
- ✅ **Stateless**: 서버에 세션 저장 불필요
- ✅ **확장성**: 수평 확장 시 세션 공유 불필요
- ✅ **표준**: RFC 7519 표준, 광범위한 라이브러리 지원
- ✅ **Payload 포함**: 사용자 정보 토큰에 포함 가능
- ✅ **만료 시간**: `exp` 클레임으로 자동 만료

**대안 방식**:
- Session-based Auth: 서버 메모리/DB에 세션 저장 필요, 확장성 낮음
- OAuth 2.0: 복잡도 높음, MVP에 과도

**JWT 구조**:
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "store_id" or "admin_id",
    "role": "customer" or "admin",
    "store_id": 1,
    "exp": 1234567890
  },
  "signature": "..."
}
```

**라이브러리**: `python-jose` 또는 `PyJWT`

---

### 2.2 bcrypt

**선택 이유**:
- ✅ **보안성**: Salt 자동 생성, Rainbow Table 공격 방어
- ✅ **적응형 해싱**: Cost factor 조정으로 해싱 속도 조절
- ✅ **표준**: 업계 표준 비밀번호 해싱 알고리즘
- ✅ **라이브러리 지원**: `bcrypt` 라이브러리로 간단히 구현

**대안 알고리즘**:
- MD5/SHA1: 안전하지 않음 (deprecated)
- SHA256: Salt 없이 사용 시 Rainbow Table 공격 취약
- Argon2: 더 안전하지만, bcrypt로 충분 (MVP)

**Cost Factor**: 12
- 해싱 시간: ~300ms (적절한 보안과 성능 균형)

**라이브러리**: `bcrypt`

---

### 2.3 HTTP-only Cookie

**선택 이유**:
- ✅ **XSS 방어**: JavaScript로 쿠키 접근 불가
- ✅ **자동 전송**: 브라우저가 모든 요청에 자동 포함
- ✅ **CSRF 방어**: SameSite 속성으로 CSRF 공격 방어

**쿠키 설정**:
```python
response.set_cookie(
    key="access_token",
    value=jwt_token,
    httponly=True,      # JavaScript 접근 불가
    secure=True,        # HTTPS only (프로덕션)
    samesite="lax",     # CSRF 방어
    max_age=57600       # 16시간 (초 단위)
)
```

**대안 방식**:
- LocalStorage: XSS 공격에 취약
- SessionStorage: XSS 공격에 취약

---

## 3. Development Tools

### 3.1 Dependency Management

**선택**: `requirements.txt`

**선택 이유**:
- ✅ **단순성**: 설정 파일 하나로 관리
- ✅ **표준**: Python 표준 방식
- ✅ **CI/CD 통합**: 대부분의 CI/CD 도구 지원

**대안 도구**:
- Poetry: 복잡도 높음, MVP에 과도
- Pipenv: 성능 이슈, 커뮤니티 활동 감소

**requirements.txt 예시**:
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
pydantic==2.5.0
python-jose[cryptography]==3.3.0
bcrypt==4.1.1
python-dotenv==1.0.0
pytest==7.4.3
```

---

### 3.2 Environment Configuration

**선택**: `.env` 파일 (python-dotenv)

**선택 이유**:
- ✅ **단순성**: 환경 변수를 파일로 관리
- ✅ **보안**: `.gitignore`로 버전 관리 제외
- ✅ **환경별 설정**: `.env.dev`, `.env.prod` 분리 가능
- ✅ **12-Factor App**: 환경 변수 사용 권장사항 준수

**.env 예시**:
```env
# Database
DATABASE_URL=sqlite:///./table_order.db

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=16

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

**대안 방식**:
- 시스템 환경 변수: 로컬 개발 시 설정 번거로움
- config.yaml: 타입 검증 어려움, 보안 위험

---

### 3.3 Testing Framework

**선택**: pytest

**선택 이유**:
- ✅ **간결한 문법**: `assert` 키워드로 테스트 작성
- ✅ **Fixture 지원**: 테스트 데이터 및 설정 재사용
- ✅ **FastAPI 통합**: `TestClient`로 API 테스트 용이
- ✅ **플러그인 생태계**: pytest-cov (커버리지), pytest-asyncio (비동기 테스트)

**대안 프레임워크**:
- unittest: 보일러플레이트 많음, 문법 장황
- nose: 더 이상 유지보수되지 않음

**pytest 예시**:
```python
def test_create_order(client, test_session):
    response = client.post("/api/orders", json={
        "table_id": 1,
        "items": [{"menu_id": 1, "quantity": 2}]
    })
    assert response.status_code == 201
    assert response.json()["order_number"] == 1
```

---

### 3.4 Code Quality Tools

**린터**: `flake8` 또는 `pylint`
- 코드 스타일 검사 (PEP 8)
- 잠재적 버그 감지

**포맷터**: `black`
- 자동 코드 포맷팅
- 일관된 코드 스타일

**타입 체커**: `mypy` (선택 사항)
- 타입 힌팅 검증
- 런타임 오류 사전 감지

---

### 3.5 ASGI Server

**선택**: Uvicorn

**선택 이유**:
- ✅ **FastAPI 권장**: FastAPI 공식 권장 서버
- ✅ **빠른 성능**: uvloop 기반 (libuv)
- ✅ **개발 편의성**: `--reload` 옵션으로 핫 리로드
- ✅ **프로덕션 사용 가능**: 프로덕션 배포 가능

**대안 서버**:
- Gunicorn: WSGI 서버 (ASGI 지원 제한)
- Hypercorn: 성능 uvicorn과 유사, 커뮤니티 작음
- Daphne: Django Channels 용, FastAPI에 비최적

**실행 명령어**:
```bash
# 개발 환경
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 프로덕션 환경
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 4. Architecture Patterns

### 4.1 Layered Architecture

**선택 이유**:
- ✅ **관심사 분리**: Router, Service, Repository 레이어 분리
- ✅ **테스트 용이성**: 각 레이어 독립적 테스트 가능
- ✅ **유지보수성**: 변경 영향 범위 최소화
- ✅ **확장성**: 새로운 기능 추가 용이

**레이어 구조**:
```
Router (API 엔드포인트)
  ↓
Service (비즈니스 로직)
  ↓
Repository (데이터 접근)
  ↓
Database (SQLite)
```

---

### 4.2 Dependency Injection

**선택 이유**:
- ✅ **FastAPI 내장**: `Depends` 함수로 DI 구현
- ✅ **테스트 용이성**: 의존성 모킹 용이
- ✅ **코드 재사용**: DB 세션, 인증 로직 재사용

**예시**:
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/orders")
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # ...
```

---

## 5. Environment Strategy

### 5.1 Development Environment

**설정**:
- `DEBUG=True`
- `LOG_LEVEL=DEBUG`
- `CORS_ORIGINS=*` (모든 origin 허용)
- HTTP (HTTPS 불필요)
- Uvicorn `--reload` 모드

**목적**: 빠른 개발 및 디버깅

---

### 5.2 Production Environment

**설정**:
- `DEBUG=False`
- `LOG_LEVEL=INFO`
- `CORS_ORIGINS=<specific-origins>`
- HTTPS (리버스 프록시 또는 서버 설정)
- Uvicorn `--workers 4`

**목적**: 보안 및 성능 최적화

---

## 6. Technology Decision Matrix

| Technology | Decision | Rationale | Alternative |
|------------|----------|-----------|-------------|
| **Language** | Python 3.9+ | 빠른 개발, 타입 힌팅, 비동기 지원 | Node.js, Go |
| **Web Framework** | FastAPI | 자동 문서화, 타입 검증, 성능 | Flask, Django |
| **ORM** | SQLAlchemy 2.0+ | DB 독립성, 관계 매핑, 타입 안정성 | Django ORM, Peewee |
| **Migration Tool** | Alembic | 자동 마이그레이션, 버전 관리 | 수동 SQL |
| **Database** | SQLite | 단순 배포, MVP 적합 | PostgreSQL, MySQL |
| **Authentication** | JWT | Stateless, 확장성, 표준 | Session-based |
| **Password Hash** | bcrypt | 보안성, 표준, Salt 자동 | Argon2, SHA256 |
| **Token Storage** | HTTP-only Cookie | XSS 방어, 자동 전송 | LocalStorage |
| **Dependency Mgmt** | requirements.txt | 단순성, 표준 | Poetry, Pipenv |
| **Environment Config** | .env (python-dotenv) | 단순성, 보안, 12-Factor App | config.yaml |
| **Testing** | pytest | 간결한 문법, FastAPI 통합 | unittest |
| **ASGI Server** | Uvicorn | FastAPI 권장, 성능, 핫 리로드 | Hypercorn, Gunicorn |
| **Code Formatter** | Black | 자동 포맷팅, 일관성 | autopep8 |
| **Linter** | flake8 | PEP 8 검사, 버그 감지 | pylint |

---

## 7. Future Considerations

### 7.1 Database Migration (SQLite → PostgreSQL)
**시점**: 동시 사용자 50명 이상, 또는 멀티 매장 확장 시
**작업**:
- SQLAlchemy 설정 변경 (DATABASE_URL만 변경)
- 데이터 마이그레이션 (SQLite → PostgreSQL)
- Connection Pool 설정 추가

---

### 7.2 Caching Layer (Redis)
**시점**: 메뉴 조회 성능 개선 필요 시
**작업**:
- Redis 설치 및 설정
- 메뉴 데이터 캐싱
- 캐시 무효화 전략

---

### 7.3 External Logging Service (Sentry, Datadog)
**시점**: 실시간 모니터링 필요 시
**작업**:
- Sentry SDK 통합
- 에러 추적 및 알림 설정

---

### 7.4 Containerization (Docker)
**시점**: 프로덕션 배포 간소화 필요 시
**작업**:
- Dockerfile 작성
- docker-compose.yml 작성 (multi-container)

---

**Tech Stack Decisions Complete**
