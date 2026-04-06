# Unit of Work Plan

시스템을 관리 가능한 개발 단위(Unit)로 분해하기 위한 계획입니다.

---

## Decomposition Context

**Project Type**: Greenfield (새 프로젝트)  
**Total User Stories**: 20개  
**Components**: 56개 (Frontend 30 + Backend 26)  
**Recommended Decomposition**: 3 Units (Execution Plan 기준)

---

## Clarifying Questions

### Q1: Unit Decomposition Approach
시스템을 어떻게 분해하시겠습니까?

A) Frontend와 Backend 분리 (2 units: Frontend + Backend)
B) Frontend를 Customer/Admin으로 분리 (3 units: Customer UI + Admin UI + Backend)
C) 완전한 분리 (3 units: Backend + Customer UI + Admin UI)
D) Monolith (1 unit: 모든 것 포함)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

**Rationale**: Backend이 먼저 완성되어야 Frontend 개발이 가능하므로, Backend를 독립 유닛으로 구성하고 Customer UI와 Admin UI는 병렬 개발 가능

---

### Q2: Development Sequence
유닛 개발 순서는 어떻게 하시겠습니까?

A) Sequential (순차: Backend → Customer UI → Admin UI)
B) Backend first, then parallel frontends (Backend → [Customer UI | Admin UI 병렬])
C) All parallel (모두 병렬)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

**Rationale**: API가 준비되어야 Frontend 개발 시작 가능. Frontend 두 개는 독립적이므로 병렬 가능

---

### Q3: Code Organization (Greenfield)
프로젝트 디렉토리 구조는 어떻게 하시겠습니까?

A) Monorepo - 단일 저장소 (root에 backend/, frontend-customer/, frontend-admin/)
B) Separate repositories - 각 유닛별 별도 저장소
C) Simple structure - 현재 작업공간에 backend/, frontend/ (frontend 내부에서 구분)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

**Rationale**: MVP에 적합한 단순 구조. frontend/ 내부에서 customer/admin 구분

---

### Q4: Shared Code Strategy
공통 코드(타입 정의, 유틸리티)는 어떻게 관리하시겠습니까?

A) Shared package/module - 별도 공통 모듈
B) Duplicate - 각 유닛에서 필요 시 복제
C) Backend as source of truth - Backend에 정의, Frontend에서 복사 또는 생성
X) Other (please describe after [Answer]: tag below)

[Answer]: C

**Rationale**: API 계약은 Backend가 정의. Frontend는 TypeScript 타입을 Backend OpenAPI에서 생성 또는 수동 정의

---

## Unit Generation Plan

다음 아티팩트를 생성합니다.

### Phase 1: Unit Definition
- [ ] 각 유닛의 목적 및 책임 정의
- [ ] 유닛별 포함 컴포넌트 목록
- [ ] 유닛별 User Stories 매핑
- [ ] 개발 우선순위 결정
- [ ] unit-of-work.md 생성

### Phase 2: Dependency Analysis
- [ ] 유닛 간 의존성 식별
- [ ] API 계약 정의
- [ ] 데이터 플로우 매핑
- [ ] 의존성 매트릭스 생성
- [ ] unit-of-work-dependency.md 생성

### Phase 3: Story Mapping
- [x] 각 User Story를 유닛에 할당
- [x] Story 구현 순서 결정
- [x] Story 간 의존성 확인
- [x] unit-of-work-story-map.md 생성

### Phase 4: Code Organization (Greenfield)
- [x] 디렉토리 구조 정의
- [x] 각 유닛의 파일 구조 계획
- [x] 공통 코드 위치 결정
- [x] unit-of-work.md에 문서화

### Phase 5: Validation
- [x] 모든 Story가 유닛에 할당되었는지 확인
- [x] 유닛 간 의존성이 명확한지 확인
- [x] 개발 순서가 의존성과 일치하는지 확인

---

## Expected Units

Based on Execution Plan and Application Design (완전 독립 병렬 개발을 위한 3개 유닛):

### Unit 1: Backend API & Database
- **Priority**: 1
- **Purpose**: 데이터베이스, API 엔드포인트, 비즈니스 로직, 실시간 SSE 제공
- **Components**: Backend 26개 전체
- **Stories**: TECH-001 (시드 데이터)
- **Dependencies**: Day 0 계약 (API 계약 + Database Schema)
- **Independence**: 시드 데이터 + Postman으로 완전 독립 개발
- **Developer**: Developer 1

### Unit 2: Customer Frontend
- **Priority**: 1
- **Purpose**: 고객용 주문 UI 제공
- **Components**: Customer Frontend 13개
- **Stories**: CUS-001 ~ CUS-008 (8개)
- **Dependencies**: Day 0 계약 (API 계약 + TypeScript 타입)
- **Independence**: Mock API로 Backend 없이 완전 독립 개발
- **Developer**: Developer 2

### Unit 3: Admin Frontend
- **Priority**: 1
- **Purpose**: 관리자용 관리 UI 제공
- **Components**: Admin Frontend 17개
- **Stories**: ADM-001 ~ ADM-011 (11개)
- **Dependencies**: Day 0 계약 (API 계약 + SSE 이벤트 형식 + TypeScript 타입)
- **Independence**: Mock API + Mock SSE로 Backend 없이 완전 독립 개발
- **Developer**: Developer 3

---

## Notes

- **Total Units**: 3개 (완전 독립 병렬 개발)
- **Contract-First Approach**: Day 0 계약 합의 후 독립 개발
- **Parallel Development**: 
  - Day 0: 모든 개발자 참여 (API 계약 + Database Schema 합의)
  - Week 1-2: Unit 1 ∥ Unit 2 ∥ Unit 3 (3명 완전 병렬, 상호 의존성 없음)
  - Week 3: 통합 (Mock → Real API 전환)
- **Critical Path**: Day 0 계약 → 병렬 개발 → 통합
- **Developers**: 3명
  - Developer 1: Unit 1 (Backend, 시드 데이터로 독립)
  - Developer 2: Unit 2 (Customer Frontend, Mock API로 독립)
  - Developer 3: Unit 3 (Admin Frontend, Mock API + Mock SSE로 독립)
- **Independence Guaranteed**: Mock을 통해 개발 중 Backend 의존성 완전 제거
- **Deployment**: 로컬 개발 환경, 단일 서버
