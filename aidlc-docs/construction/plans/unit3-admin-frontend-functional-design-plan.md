# Unit 3: Admin Frontend - Functional Design Plan

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - Functional Design  
**Date**: 2026-04-06

---

## Purpose

Unit 3 (Admin Frontend)의 상세 기능 설계를 수행합니다. 17개 컴포넌트의 구조, 상태 관리, 사용자 인터랙션 플로우, 폼 검증 규칙, API/SSE 통합 전략, 비즈니스 규칙을 정의합니다.

---

## Scope

### 컴포넌트 (17개)
**Pages (5개)**:
- AdminApp (루트)
- LoginPage
- DashboardPage (실시간 주문 대시보드)
- TableManagementPage
- MenuManagementPage

**Features (7개)**:
- TableCard (대시보드 테이블 카드)
- OrderDetailModal (주문 상세)
- TableSetupForm (테이블 초기 설정)
- OrderHistoryModal (과거 주문 내역)
- MenuForm (메뉴 등록/수정)
- MenuList (메뉴 목록)
- SSEConnectionHandler (SSE 연결 관리)

**Common (5개)**:
- Button, Modal, LoadingSpinner, EmptyState (고객용과 공유)
- AdminAppContext (상태 관리)

### User Stories (11개)
- ADM-001: 관리자 로그인
- ADM-002: 실시간 주문 대시보드 조회
- ADM-003: 주문 상태 변경
- ADM-004: 테이블 초기 설정
- ADM-005: 주문 삭제
- ADM-006: 테이블 세션 종료
- ADM-007: 과거 주문 내역 조회
- ADM-008: 메뉴 목록 조회
- ADM-009: 메뉴 등록
- ADM-010: 메뉴 수정
- ADM-011: 메뉴 삭제

---

## Execution Plan

### Phase 1: Requirements Clarification
- [x] 질문 파일 생성 (embedded [Answer]: tags)
- [x] 사용자 답변 수집
- [x] 답변 분석 및 모호성 검증
- [x] 필요 시 추가 명확화 질문

### Phase 2: Functional Design Artifacts Generation
- [x] Frontend Components 상세 설계 (frontend-components.md)
- [x] State Management 설계 (state-management.md)
- [x] User Interaction Flows (interaction-flows.md)
- [x] Form Validation Rules (form-validation.md)
- [x] Business Rules (business-rules.md)

### Phase 3: Completion and Approval
- [x] 완료 메시지 표시
- [ ] 사용자 승인 대기
- [ ] audit.md 및 aidlc-state.md 업데이트

---

## Clarification Questions

다음 질문들에 답변해주세요. 각 질문 뒤의 `[Answer]:` 태그에 선택한 옵션의 문자(A, B, C 등)를 입력해주세요.

---

### 1. Component Structure & Hierarchy

**Question 1**: Admin Frontend의 컴포넌트 계층 구조는 어떻게 구성하시겠습니까?

A) Flat Structure - 모든 컴포넌트를 pages/features/common 3개 폴더에 평탄하게 배치  
B) Feature-Based Structure - 기능별로 폴더를 나누고 각 폴더에 관련 컴포넌트 그룹화 (예: dashboard/, tables/, menus/)  
C) Atomic Design - Atoms/Molecules/Organisms/Templates/Pages 계층 구조  
D) Hybrid - Pages는 별도, Features는 기능별 폴더, Common은 공통 폴더  
E) Other (please describe after [Answer]: tag below)

**Recommended**: D) Hybrid - 명확한 책임 분리와 확장성을 동시에 제공

[Answer]: D 

---

**Question 2**: 17개 컴포넌트 중 일부를 더 작은 서브 컴포넌트로 분해하시겠습니까?

A) 현재 17개 유지 - 추가 분해 없음  
B) 일부 분해 - 복잡한 컴포넌트만 서브 컴포넌트로 분리 (예: MenuForm → MenuFormFields + MenuFormActions)  
C) 적극적 분해 - 모든 컴포넌트를 최대한 작은 단위로 분해  
D) Other (please describe after [Answer]: tag below)

**Recommended**: B) 일부 분해 - 복잡도가 높은 컴포넌트만 분해하여 유지보수성 향상

[Answer]: B 

---

### 2. State Management

**Question 3**: AdminAppContext의 상태 구조는 어떻게 설계하시겠습니까?

A) Single Context - 모든 상태를 하나의 Context에 통합 (auth, orders, tables, menus)  
B) Multiple Contexts - 도메인별로 Context 분리 (AuthContext, OrderContext, TableContext, MenuContext)  
C) Context + Local State - 전역 상태(auth)는 Context, 나머지는 컴포넌트 local state  
D) State Management Library - Redux, Zustand, Jotai 등 외부 라이브러리 사용  
E) Other (please describe after [Answer]: tag below)

**Recommended**: A) Single Context - MVP 단계에서 간단하고 충분, 추후 필요 시 분리 가능

[Answer]: A 

---

**Question 4**: SSE 연결 상태를 어디에 저장하시겠습니까?

A) AdminAppContext - 전역 상태로 관리  
B) DashboardPage local state - 대시보드 페이지 내부에서만 관리  
C) Custom Hook (useSSE) - SSE 연결을 Custom Hook으로 캡슐화  
D) Other (please describe after [Answer]: tag below)

**Recommended**: C) Custom Hook (useSSE) - 재사용성과 관심사 분리

[Answer]: C 

---

### 3. Routing & Navigation

**Question 5**: Admin Frontend의 라우팅 구조는 어떻게 구성하시겠습니까?

A) Simple Routing - / (login), /dashboard, /tables, /menus  
B) Nested Routing - /admin (layout) → /admin/dashboard, /admin/tables, /admin/menus  
C) Protected Routing - PrivateRoute wrapper로 인증 체크  
D) Tab-Based Navigation - Single Page에서 Tab으로 전환 (라우팅 없음)  
E) Other (please describe after [Answer]: tag below)

**Recommended**: C) Protected Routing - 인증 필수이므로 PrivateRoute로 보호

[Answer]: C 

---

### 4. Form Validation

**Question 6**: 폼 검증은 어떤 방식으로 구현하시겠습니까?

A) Manual Validation - 각 폼에서 수동으로 검증 로직 작성  
B) Form Library - React Hook Form, Formik 등 라이브러리 사용  
C) Hybrid - 간단한 폼은 수동, 복잡한 폼은 라이브러리  
D) Other (please describe after [Answer]: tag below)

**Recommended**: A) Manual Validation - MVP 단계에서 폼이 단순하고 개수가 적음 (로그인, 메뉴, 테이블 설정)

[Answer]: A 

---

**Question 7**: 폼 검증 에러 메시지는 어떻게 표시하시겠습니까?

A) Inline Errors - 각 입력 필드 아래에 에러 메시지 표시  
B) Toast/Alert - 폼 제출 시 전체 에러를 Toast 또는 Alert로 표시  
C) Modal - 에러 발생 시 Modal로 에러 목록 표시  
D) Hybrid - Inline + Toast (필드 에러는 Inline, 서버 에러는 Toast)  
E) Other (please describe after [Answer]: tag below)

**Recommended**: D) Hybrid - 사용자 경험 최적화 (즉각적 피드백 + 전체 상태 알림)

[Answer]: D 

---

### 5. API Integration

**Question 8**: Mock API와 Real API 전환은 어떻게 구현하시겠습니까?

A) Environment Variable - .env 파일의 VITE_USE_MOCK_API 플래그로 전환  
B) Build Mode - 개발 빌드는 Mock, 프로덕션 빌드는 Real API  
C) Runtime Toggle - UI에서 Mock/Real 토글 버튼으로 전환 가능  
D) Other (please describe after [Answer]: tag below)

**Recommended**: A) Environment Variable - 유연하고 간단, 개발자가 쉽게 제어 가능

[Answer]: A 

---

**Question 9**: API 에러 처리 전략은 무엇입니까?

A) Try-Catch - 각 API 호출마다 try-catch로 에러 처리  
B) Axios Interceptor - Axios response interceptor로 전역 에러 처리  
C) Custom Hook - useApi Hook에서 에러 처리 로직 캡슐화  
D) Error Boundary - React Error Boundary로 컴포넌트 레벨 에러 처리  
E) Hybrid - Try-Catch + Error Boundary (API 에러 + 렌더링 에러)  
F) Other (please describe after [Answer]: tag below)

**Recommended**: E) Hybrid - API 에러는 try-catch, 컴포넌트 에러는 Error Boundary

[Answer]: E 

---

### 6. SSE Integration

**Question 10**: SSE 연결 실패 시 재연결 전략은 무엇입니까?

A) No Retry - 연결 실패 시 에러 표시, 수동 재로드 필요  
B) Exponential Backoff - 1초, 2초, 4초, 8초... 간격으로 재시도 (최대 5회)  
C) Fixed Interval - 5초마다 재시도 (무제한)  
D) Manual Retry - "다시 연결" 버튼으로 사용자가 수동 재시도  
E) Other (please describe after [Answer]: tag below)

**Recommended**: B) Exponential Backoff - 네트워크 부하 감소 및 안정적 재연결

[Answer]: B 

---

**Question 11**: SSE 이벤트 수신 시 UI 업데이트는 어떻게 처리하시겠습니까?

A) Direct State Update - SSE 이벤트 수신 시 즉시 상태 업데이트  
B) Polling Fallback - SSE 수신 후 일정 시간 뒤 API 호출로 데이터 재검증  
C) Optimistic Update - SSE 이벤트로 즉시 UI 업데이트, 백그라운드에서 검증  
D) Other (please describe after [Answer]: tag below)

**Recommended**: A) Direct State Update - SSE 이벤트를 신뢰하고 즉시 반영 (MVP 단계에서 충분)

[Answer]: A 

---

### 7. Business Rules & Validation

**Question 12**: 주문 상태 변경 규칙은 어떻게 구현하시겠습니까?

A) Frontend Validation - 프론트엔드에서 허용된 상태 전환만 표시 (pending → preparing → completed)  
B) Backend Validation - 프론트엔드는 모든 상태 표시, 백엔드에서 검증  
C) Hybrid - 프론트엔드 UI 제한 + 백엔드 검증  
D) Other (please describe after [Answer]: tag below)

**Recommended**: C) Hybrid - 사용자 경험 개선 (불가능한 옵션 숨김) + 보안 (백엔드 검증)

[Answer]: C 

---

**Question 13**: 관리자 권한 체크는 어디에서 수행하시겠습니까?

A) Frontend Only - JWT 토큰 존재 여부만 체크 (간단)  
B) Backend Only - 모든 API 요청에서 백엔드가 JWT 검증  
C) Both - 프론트엔드에서 토큰 체크 + 백엔드에서 검증  
D) Other (please describe after [Answer]: tag below)

**Recommended**: C) Both - 프론트엔드에서 UX 개선 (즉각적 리다이렉트), 백엔드에서 보안 보장

[Answer]: C 

---

### 8. UI/UX Details

**Question 14**: 신규 주문 강조 효과는 어떻게 구현하시겠습니까?

A) Color Change - 신규 주문 카드 배경색 변경 (예: 노란색 하이라이트)  
B) Animation - 신규 주문 카드에 Bounce/Fade-in 애니메이션  
C) Sound Alert - 신규 주문 시 소리 알림 (선택적)  
D) Hybrid - Color + Animation (+ 선택적 Sound)  
E) Other (please describe after [Answer]: tag below)

**Recommended**: D) Hybrid - 시각적 강조 + 애니메이션으로 명확한 피드백

[Answer]: D 

---

**Question 15**: 테이블 카드의 주문 미리보기는 몇 개까지 표시하시겠습니까?

A) 최신 3개 - 요구사항대로 최신 주문 3개  
B) 최신 5개 - 더 많은 정보 제공  
C) 동적 조절 - 카드 크기에 따라 자동 조절  
D) Other (please describe after [Answer]: tag below)

**Recommended**: A) 최신 3개 - 요구사항 준수, 카드 크기 적절

[Answer]: A 

---

## Recommended Answers Summary

제공된 추천 답변:
1. D - Hybrid 폴더 구조
2. B - 일부 분해
3. A - Single Context
4. C - Custom Hook (useSSE)
5. C - Protected Routing
6. A - Manual Validation
7. D - Hybrid (Inline + Toast)
8. A - Environment Variable
9. E - Hybrid (Try-Catch + Error Boundary)
10. B - Exponential Backoff
11. A - Direct State Update
12. C - Hybrid (Frontend + Backend)
13. C - Both (Frontend + Backend)
14. D - Hybrid (Color + Animation)
15. A - 최신 3개

---

## Instructions

1. 각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션의 문자(A, B, C, D, E, F)를 입력해주세요.
2. "Other"를 선택한 경우, `[Answer]:` 태그 뒤에 상세한 설명을 작성해주세요.
3. 모든 질문에 답변한 후 "완료" 또는 "done"이라고 알려주세요.
4. 추천 답변이 제공되어 있으니, 빠르게 진행하려면 추천 답변을 따라도 좋습니다.

---
