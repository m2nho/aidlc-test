# Unit 3: Admin Frontend - NFR Requirements Plan

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - NFR Requirements Assessment  
**Date**: 2026-04-06

---

## Purpose

Unit 3 (Admin Frontend)의 비기능적 요구사항(NFR)을 평가하고 기술 스택을 확정합니다.

---

## Context

**Functional Design 완료**:
- 20개 컴포넌트 (Pages 4, Features 9, Common 4, Hooks 3)
- AdminAppContext (Single Context)
- useSSE Hook (Exponential Backoff)
- 10개 사용자 인터랙션 플로우
- 3개 폼, 24개 비즈니스 규칙

**이미 결정된 기술 스택** (요구사항 문서):
- Framework: React 18+
- Language: JavaScript/TypeScript
- Build Tool: Vite
- Routing: react-router-dom
- State: React Context API
- HTTP: fetch API
- SSE: EventSource API

**확인 필요 영역**:
- CSS/UI 프레임워크
- 테스트 프레임워크
- 코드 품질 도구
- 성능 및 확장성 요구사항
- 보안 요구사항
- 브라우저 지원

---

## Execution Plan

### Phase 1: NFR Assessment
- [x] 질문 파일 생성 (embedded [Answer]: tags)
- [x] 사용자 답변 수집
- [x] 답변 분석 및 모호성 검증

### Phase 2: NFR Requirements Generation
- [x] nfr-requirements.md 생성
- [x] tech-stack-decisions.md 생성

### Phase 3: Completion and Approval
- [x] 완료 메시지 표시
- [ ] 사용자 승인 대기
- [ ] audit.md 및 aidlc-state.md 업데이트

---

## NFR Requirements Questions

다음 질문들에 답변해주세요. 각 질문 뒤의 `[Answer]:` 태그에 선택한 옵션의 문자를 입력해주세요.

---

### 1. Scalability Requirements

**Question 1**: Admin Frontend의 예상 동시 관리자 수는?

A) 1-5명 (단일 매장, MVP)  
B) 5-20명 (다중 매장, 소규모 체인)  
C) 20-100명 (중규모 체인)  
D) 100명 이상 (대규모 체인)  
E) Other (please describe after [Answer]: tag below)

**Recommended**: A) 1-5명 (단일 매장, MVP 단계)

[Answer]: 

---

**Question 2**: SSE 동시 연결 수 예상은?

A) 1-5개 (단일 매장 관리자)  
B) 5-20개 (소규모 체인)  
C) 20-100개 (중규모 체인)  
D) 100개 이상 (대규모 체인)  
E) Other (please describe after [Answer]: tag below)

**Recommended**: A) 1-5개 (MVP 단계)

[Answer]: 

---

**Question 3**: 주문 처리량 예상은? (분당 주문 수)

A) 1-10건/분 (소규모 매장)  
B) 10-50건/분 (중규모 매장)  
C) 50-100건/분 (대규모 매장)  
D) 100건 이상/분 (초대규모)  
E) Other (please describe after [Answer]: tag below)

**Recommended**: A) 1-10건/분 (MVP 단계)

[Answer]: 

---

### 2. Performance Requirements

**Question 4**: 초기 페이지 로딩 시간 목표는?

A) 3초 이내 (일반적)  
B) 2초 이내 (빠름)  
C) 1초 이내 (매우 빠름)  
D) 특별한 요구사항 없음  
E) Other (please describe after [Answer]: tag below)

**Recommended**: A) 3초 이내 (MVP에 충분)

[Answer]: 

---

**Question 5**: API 응답 시간 목표는?

A) 2초 이내 (일반적)  
B) 1초 이내 (빠름)  
C) 500ms 이내 (매우 빠름)  
D) 특별한 요구사항 없음  
E) Other (please describe after [Answer]: tag below)

**Recommended**: A) 2초 이내 (요구사항 준수)

[Answer]: 

---

**Question 6**: SSE 실시간 업데이트 지연 허용 시간은?

A) 5초 이내 (여유로움)  
B) 2초 이내 (일반적)  
C) 1초 이내 (빠름)  
D) 특별한 요구사항 없음  
E) Other (please describe after [Answer]: tag below)

**Recommended**: B) 2초 이내 (요구사항 준수)

[Answer]: 

---

### 3. Security Requirements

**Question 7**: XSS (Cross-Site Scripting) 방어 수준은?

A) React 기본 방어만 사용 (기본)  
B) DOMPurify 추가 (강화)  
C) CSP (Content Security Policy) 설정 (매우 강화)  
D) 특별한 요구사항 없음  
E) Other (please describe after [Answer]: tag below)

**Recommended**: A) React 기본 방어 (MVP에 충분, React는 기본적으로 XSS 방어)

[Answer]: 

---

**Question 8**: CSRF (Cross-Site Request Forgery) 방어는?

A) SameSite Cookie 속성만 사용 (기본)  
B) CSRF 토큰 추가 (강화)  
C) 특별한 요구사항 없음  
D) Other (please describe after [Answer]: tag below)

**Recommended**: A) SameSite Cookie (MVP에 충분, HTTP-only + SameSite)

[Answer]: 

---

**Question 9**: 민감 데이터 로깅 방지는?

A) 브라우저 콘솔에 민감 데이터 절대 로그 안 함 (기본)  
B) 프로덕션 빌드에서 모든 console.log 제거 (강화)  
C) 특별한 요구사항 없음  
D) Other (please describe after [Answer]: tag below)

**Recommended**: B) 프로덕션에서 console.log 제거 (보안 + 성능)

[Answer]: 

---

### 4. Tech Stack - CSS/UI Framework

**Question 10**: CSS 스타일링 방식은?

A) Vanilla CSS (별도 프레임워크 없음)  
B) CSS Modules (스코프 격리)  
C) Tailwind CSS (유틸리티 우선)  
D) Styled Components (CSS-in-JS)  
E) Material-UI (컴포넌트 라이브러리)  
F) Other (please describe after [Answer]: tag below)

**Recommended**: C) Tailwind CSS (빠른 개발, 일관성, 반응형 쉬움)

[Answer]: 

---

**Question 11**: UI 컴포넌트 라이브러리 사용 여부는?

A) 사용 안 함 (직접 구현)  
B) Headless UI (스타일 없는 컴포넌트)  
C) Material-UI (MUI)  
D) Ant Design  
E) Other (please describe after [Answer]: tag below)

**Recommended**: A) 사용 안 함 (MVP 단계, 커스텀 컴포넌트로 충분)

[Answer]: 

---

### 5. Tech Stack - Testing

**Question 12**: 단위 테스트 프레임워크는?

A) Jest + React Testing Library (표준)  
B) Vitest + React Testing Library (Vite 최적화)  
C) 단위 테스트 생략 (MVP)  
D) Other (please describe after [Answer]: tag below)

**Recommended**: B) Vitest + React Testing Library (Vite와 통합 우수)

[Answer]: 

---

**Question 13**: E2E 테스트 필요 여부는?

A) 필요 (Playwright 또는 Cypress)  
B) 불필요 (MVP 단계)  
C) Other (please describe after [Answer]: tag below)

**Recommended**: B) 불필요 (MVP 단계, 단위 테스트로 충분)

[Answer]: 

---

### 6. Tech Stack - Code Quality

**Question 14**: 코드 린팅 및 포맷팅 도구는?

A) ESLint + Prettier (표준)  
B) ESLint만  
C) Prettier만  
D) 사용 안 함  
E) Other (please describe after [Answer]: tag below)

**Recommended**: A) ESLint + Prettier (코드 품질 + 일관성)

[Answer]: 

---

**Question 15**: TypeScript 엄격 모드 사용 여부는?

A) Strict Mode 활성화 (`"strict": true`)  
B) 기본 모드 (일부만 활성화)  
C) TypeScript 사용 안 함 (JavaScript만)  
D) Other (please describe after [Answer]: tag below)

**Recommended**: A) Strict Mode (타입 안전성 최대화)

[Answer]: 

---

### 7. Usability Requirements

**Question 16**: 브라우저 지원 범위는?

A) 최신 브라우저만 (Chrome, Firefox, Safari, Edge 최신 2개 버전)  
B) IE11 포함 (폴리필 필요)  
C) 모바일 브라우저 포함  
D) Other (please describe after [Answer]: tag below)

**Recommended**: A) 최신 브라우저만 (MVP, 관리자용이므로 최신 브라우저 가정)

[Answer]: 

---

**Question 17**: 반응형 디자인 필요 여부는?

A) 데스크톱만 (1024px 이상)  
B) 태블릿 포함 (768px 이상)  
C) 모바일 포함 (320px 이상)  
D) Other (please describe after [Answer]: tag below)

**Recommended**: B) 태블릿 포함 (관리자가 태블릿으로도 사용 가능)

[Answer]: 

---

**Question 18**: 접근성 (Accessibility) 요구사항은?

A) 기본 접근성 (시맨틱 HTML, alt 태그)  
B) WCAG 2.1 AA 준수  
C) WCAG 2.1 AAA 준수  
D) 특별한 요구사항 없음  
E) Other (please describe after [Answer]: tag below)

**Recommended**: A) 기본 접근성 (MVP에 충분)

[Answer]: 

---

### 8. Maintainability Requirements

**Question 19**: 빌드 최적화 전략은?

A) Code Splitting (페이지별 lazy loading)  
B) Tree Shaking (사용하지 않는 코드 제거)  
C) Both (Code Splitting + Tree Shaking)  
D) 특별한 최적화 없음  
E) Other (please describe after [Answer]: tag below)

**Recommended**: C) Both (최적 성능, Vite 기본 지원)

[Answer]: 

---

**Question 20**: 에러 추적 도구 사용 여부는?

A) Sentry 또는 유사 서비스 사용  
B) 브라우저 콘솔만 사용  
C) Other (please describe after [Answer]: tag below)

**Recommended**: B) 브라우저 콘솔만 (MVP 단계, 추후 Sentry 추가 고려)

[Answer]: 

---

### 9. Reliability Requirements

**Question 21**: 오프라인 지원 필요 여부는?

A) 필요 (Service Worker 사용)  
B) 불필요 (항상 온라인 가정)  
C) Other (please describe after [Answer]: tag below)

**Recommended**: B) 불필요 (관리자는 항상 온라인 환경)

[Answer]: 

---

**Question 22**: API 요청 재시도 전략은?

A) 자동 재시도 (Exponential Backoff)  
B) 재시도 없음 (에러만 표시)  
C) Other (please describe after [Answer]: tag below)

**Recommended**: B) 재시도 없음 (SSE는 재연결, API는 사용자가 재시도)

[Answer]: 

---

## Recommended Answers Summary

제공된 추천 답변:
1. A - 1-5명 동시 관리자
2. A - 1-5개 SSE 연결
3. A - 1-10건/분 주문
4. A - 3초 이내 초기 로딩
5. A - 2초 이내 API 응답
6. B - 2초 이내 SSE 업데이트
7. A - React 기본 XSS 방어
8. A - SameSite Cookie CSRF 방어
9. B - 프로덕션 console.log 제거
10. C - Tailwind CSS
11. A - UI 라이브러리 사용 안 함
12. B - Vitest + React Testing Library
13. B - E2E 테스트 불필요
14. A - ESLint + Prettier
15. A - TypeScript Strict Mode
16. A - 최신 브라우저만
17. B - 태블릿 포함 반응형
18. A - 기본 접근성
19. C - Code Splitting + Tree Shaking
20. B - 브라우저 콘솔만
21. B - 오프라인 불필요
22. B - API 재시도 없음

---

## Instructions

1. 각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션의 문자를 입력해주세요.
2. "Other"를 선택한 경우, `[Answer]:` 태그 뒤에 상세한 설명을 작성해주세요.
3. 모든 질문에 답변한 후 "완료" 또는 "done"이라고 알려주세요.
4. 추천 답변이 제공되어 있으니, 빠르게 진행하려면 추천 답변을 따라도 좋습니다.

---
