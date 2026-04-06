# Unit 3: Admin Frontend - NFR Design Plan

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - NFR Design  
**Date**: 2026-04-06

---

## Purpose

NFR Requirements에서 정의한 비기능적 요구사항을 구체적인 설계 패턴과 논리적 컴포넌트로 구현합니다.

---

## Context

**NFR Requirements 완료**:
- Scalability: 1-5명, React Context
- Performance: 3초 로딩, 2초 API/SSE, Code Splitting
- Security: React XSS 방어, SameSite Cookie, console.log 제거
- Reliability: Try-Catch + Error Boundary, SSE Exponential Backoff
- Tech Stack: React 18+, TypeScript Strict, Vite, Tailwind CSS, Vitest

**Functional Design 완료**:
- 20개 컴포넌트, AdminAppContext, useSSE Hook
- State Management, Interaction Flows, Form Validation, Business Rules

---

## Execution Plan

### Phase 1: NFR Design Questions
- [x] 질문 파일 생성 (embedded [Answer]: tags)
- [x] 사용자 답변 수집

### Phase 2: NFR Design Artifacts Generation
- [x] nfr-design-patterns.md 생성
- [x] logical-components.md 생성

### Phase 3: Completion and Approval
- [ ] 완료 메시지 표시
- [ ] 사용자 승인 대기
- [ ] audit.md 및 aidlc-state.md 업데이트

---

## NFR Design Questions

Admin Frontend는 이미 Functional Design과 NFR Requirements에서 대부분의 설계 결정이 완료되었습니다. 
아래 질문들은 최종 확인 및 세부 구현 방식을 명확히 하기 위한 것입니다.

---

### 1. Error Handling Patterns

**Question 1**: Error Boundary의 Fallback UI 스타일은?

A) 전체 화면 에러 (Full page error)  
B) 컴포넌트 레벨 에러 (Component-level error, 일부만 에러 표시)  
C) Other (please describe after [Answer]: tag below)

**Recommended**: A) 전체 화면 에러 (심각한 렌더링 에러는 전체 리셋 필요)

[Answer]: A

---

**Question 2**: API 에러 Toast 표시 위치는?

A) 상단 중앙 (Top center)  
B) 상단 우측 (Top right)  
C) 하단 중앙 (Bottom center)  
D) Other (please describe after [Answer]: tag below)

**Recommended**: B) 상단 우측 (일반적, 시선 방해 최소화)

[Answer]: B

---

### 2. Loading Patterns

**Question 3**: 페이지 전환 시 로딩 표시 방식은?

A) Suspense Fallback (페이지 단위 로딩)  
B) Progress Bar (상단 선형 진행 바)  
C) Skeleton Screen (컨텐츠 형태 유지)  
D) Other (please describe after [Answer]: tag below)

**Recommended**: A) Suspense Fallback (React 18 기본, 간단)

[Answer]: A

---

**Question 4**: API 요청 시 로딩 표시는?

A) 버튼 내 Spinner (Button 내부)  
B) 전체 화면 Overlay  
C) 인라인 Spinner (해당 섹션만)  
D) Other (please describe after [Answer]: tag below)

**Recommended**: A) 버튼 내 Spinner (사용자 액션과 연결)

[Answer]: A

---

### 3. Caching & Data Management

**Question 5**: API 응답 캐싱 전략은?

A) 캐싱 없음 (항상 최신 데이터)  
B) 메모리 캐싱 (Context에 저장, 페이지 새로고침 시 초기화)  
C) LocalStorage 캐싱 (영속적)  
D) Other (please describe after [Answer]: tag below)

**Recommended**: B) 메모리 캐싱 (MVP, Context에 이미 저장 중)

[Answer]: B

---

**Question 6**: SSE 연결 끊김 시 데이터 동기화는?

A) SSE 재연결 시 자동으로 GET /api/orders 호출하여 전체 동기화  
B) SSE 재연결만, 동기화 없음  
C) Other (please describe after [Answer]: tag below)

**Recommended**: A) 전체 동기화 (연결 끊김 중 놓친 이벤트 보완)

[Answer]: A

---

### 4. Performance Optimization

**Question 7**: React 컴포넌트 메모이제이션 전략은?

A) 적극적 메모이제이션 (React.memo, useMemo, useCallback 적극 사용)  
B) 필요 시에만 (성능 문제 발생 시 적용)  
C) 사용 안 함 (MVP, 최적화 나중에)  
D) Other (please describe after [Answer]: tag below)

**Recommended**: B) 필요 시에만 (조기 최적화 방지, 측정 후 적용)

[Answer]: B

---

**Question 8**: 이미지 최적화 전략은?

A) Lazy Loading (viewport 진입 시 로드)  
B) 최적화 없음 (이미지 개수 적음)  
C) Other (please describe after [Answer]: tag below)

**Recommended**: B) 최적화 없음 (메뉴 이미지는 외부 URL, 개수 적음)

[Answer]: B

---

### 5. Security Patterns

**Question 9**: JWT 토큰 검증 시점은?

A) 모든 API 요청 전 (프론트엔드에서 토큰 존재 체크)  
B) 백엔드만 검증 (프론트엔드는 401 응답 시 처리)  
C) Other (please describe after [Answer]: tag below)

**Recommended**: A) API 요청 전 체크 (401 응답 최소화)

[Answer]: A

---

**Question 10**: 민감한 에러 정보 처리는?

A) 사용자에게 일반적인 메시지만 표시 ("오류가 발생했습니다")  
B) 개발 모드에서는 상세 에러, 프로덕션에서는 일반 메시지  
C) Other (please describe after [Answer]: tag below)

**Recommended**: B) 환경별 분리 (개발 시 디버깅 용이, 프로덕션 보안)

[Answer]: B

---

## Recommended Answers Summary

모든 질문에 추천 답변(A 또는 B) 적용 완료:
1. A - 전체 화면 Error Boundary
2. B - 상단 우측 Toast
3. A - Suspense Fallback
4. A - 버튼 내 Spinner
5. B - 메모리 캐싱 (Context)
6. A - SSE 재연결 시 전체 동기화
7. B - 필요 시에만 메모이제이션
8. B - 이미지 최적화 없음
9. A - API 요청 전 토큰 체크
10. B - 환경별 에러 메시지

---

## Instructions

이미 추천 답변이 적용되었습니다. 변경이 필요한 경우에만 수정하고, 그렇지 않으면 "완료" 또는 "다음 단계"라고 알려주세요.

---
