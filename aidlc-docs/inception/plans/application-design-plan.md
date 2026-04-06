# Application Design Plan

테이블오더 서비스의 애플리케이션 설계를 위한 실행 계획입니다.

---

## Design Scope

이 설계는 다음을 포함합니다:
- 고객용 프론트엔드 컴포넌트
- 관리자용 프론트엔드 컴포넌트  
- 백엔드 API 컴포넌트
- 서비스 레이어
- 컴포넌트 간 의존성 및 통신 패턴

---

## Clarifying Questions

다음 질문들에 답변하여 설계 방향을 명확히 해주세요.

### Q1: Component Organization - Frontend
프론트엔드 컴포넌트를 어떻게 구성하시겠습니까?

A) 기능별 (Features): 각 기능별로 컴포넌트 그룹화 (로그인, 메뉴, 장바구니 등)
B) 페이지별 (Pages): 페이지/화면별로 컴포넌트 그룹화
C) 아토믹 디자인 (Atomic): Atoms, Molecules, Organisms, Templates
D) Hybrid: 기능별 + 공통 컴포넌트 분리
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

### Q2: State Management - Frontend
프론트엔드 상태 관리를 어떻게 하시겠습니까?

A) React Context API (내장 기능)
B) Redux (전역 상태 관리 라이브러리)
C) Zustand (경량 상태 관리)
D) 로컬 상태만 (useState/useReducer)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Q3: Backend Architecture Style
백엔드 아키텍처 스타일을 어떻게 설계하시겠습니까?

A) Layered Architecture (Controller → Service → Repository)
B) Clean Architecture (Domain-centric)
C) Simple MVC (Model-View-Controller)
D) API Routes with inline logic (단순 구조)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Q4: API Organization
백엔드 API를 어떻게 구성하시겠습니까?

A) 기능별 라우터 (customer, admin, menu 등)
B) 리소스별 라우터 (orders, tables, menus 등)
C) 버전별 + 기능별 (/api/v1/customer, /api/v1/admin)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Q5: Service Layer Responsibility
서비스 레이어의 책임 범위는 어떻게 하시겠습니까?

A) 비즈니스 로직 + 데이터 접근 (Service가 DB 직접 접근)
B) 비즈니스 로직만 (Repository 패턴 사용)
C) 오케스트레이션 + 비즈니스 로직 (여러 리소스 조율)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Design Artifacts Generation Plan

다음 아티팩트를 생성합니다.

### Phase 1: Component Identification
- [x] 고객용 프론트엔드 컴포넌트 식별
  - [x] 페이지/화면 컴포넌트
  - [x] 기능별 컴포넌트
  - [x] 공통/재사용 컴포넌트
- [x] 관리자용 프론트엔드 컴포넌트 식별
  - [x] 페이지/화면 컴포넌트
  - [x] 기능별 컴포넌트
  - [x] 공통/재사용 컴포넌트
- [x] 백엔드 컴포넌트 식별
  - [x] API 라우터/컨트롤러
  - [x] 서비스 레이어
  - [x] 데이터 접근 레이어
  - [x] 유틸리티/헬퍼
- [x] components.md 생성

### Phase 2: Component Methods Definition
- [x] 각 컴포넌트의 주요 메서드 식별
- [x] 메서드 시그니처 정의 (입력/출력 타입)
- [x] 메서드 목적 및 책임 정의
- [x] component-methods.md 생성

### Phase 3: Service Layer Design
- [x] 서비스 식별 (비즈니스 로직 그룹)
- [x] 서비스 책임 정의
- [x] 서비스 간 오케스트레이션 패턴
- [x] 서비스 인터페이스 정의
- [x] services.md 생성

### Phase 4: Component Dependencies
- [x] 컴포넌트 간 의존성 매핑
- [x] 통신 패턴 정의 (API 호출, 이벤트, Props 등)
- [x] 데이터 플로우 다이어그램
- [x] 의존성 매트릭스
- [x] component-dependency.md 생성

### Phase 5: Consolidated Document
- [x] application-design.md 생성 (모든 설계 문서 통합)
- [x] 설계 완전성 검증
- [x] 설계 일관성 확인

---

## Design Principles

설계 시 다음 원칙을 따릅니다:

1. **Separation of Concerns**: 각 컴포넌트는 명확한 단일 책임
2. **DRY (Don't Repeat Yourself)**: 공통 로직은 재사용 가능하게
3. **KISS (Keep It Simple)**: MVP에 적합한 단순한 설계
4. **Scalability**: 향후 확장 가능한 구조
5. **Testability**: 테스트 가능한 설계

---

## Notes

- **상세 비즈니스 로직**: Functional Design (CONSTRUCTION 단계)에서 정의
- **데이터베이스 스키마**: 이미 Requirements에서 정의됨
- **API 엔드포인트**: 이미 Requirements에서 개요 정의됨
- **이 단계 목적**: 고수준 컴포넌트 구조 및 책임 정의
