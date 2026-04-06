# Unit 2 - Customer Frontend: NFR Requirements Plan

**Unit**: Unit 2 - Customer Frontend  
**Stage**: NFR Requirements Assessment  
**Created**: 2026-04-06T16:01:00Z

---

## Unit Context

### Functional Overview
- **목적**: 고객이 테이블 태블릿에서 메뉴를 보고 주문하는 웹 UI
- **User Stories**: 8개 (CUS-001 ~ CUS-008)
- **핵심 기능**: 자동 로그인, 메뉴 조회, 장바구니, 주문 생성, 주문 내역
- **컴포넌트**: 13개 React 컴포넌트

### 기존 요구사항
- 성능: 메뉴 로딩 1초, 주문 2초 (요구사항 명세)
- 사용성: 터치 친화적 UI, 44x44px 최소 버튼
- 인증: 자동 로그인 (LocalStorage 기반)
- 독립 개발: Mock API 활용

---

## NFR Requirements 질문

이 질문들은 Customer Frontend의 비기능 요구사항과 기술 스택을 명확히 하기 위한 것입니다.

### Q1: 성능 목표 - 페이지 로딩 시간

초기 페이지 로딩 시간 목표는 무엇입니까?

A) 1초 이내 (매우 빠름 - First Contentful Paint)
B) 2초 이내 (빠름 - 일반적인 SPA 목표)
C) 3초 이내 (수용 가능)
D) 5초 이내 (느림 - 복잡한 앱)
E) Other (please describe after [Answer]: tag below)

**배경**: React 앱의 초기 로딩 성능은 사용자 경험에 큰 영향을 미칩니다.

[Answer]: B

**선택 이유**: 2초는 일반적인 SPA의 현실적인 목표이며, MVP로서 충분히 빠른 속도입니다. Vite를 사용하면 달성 가능합니다. 

---

### Q2: 성능 목표 - UI 응답성

버튼 클릭이나 입력에 대한 UI 응답 시간 목표는?

A) 100ms 이내 (즉각 반응)
B) 300ms 이내 (빠른 반응)
C) 500ms 이내 (수용 가능)
D) 1초 이내 (느림)
E) Other (please describe after [Answer]: tag below)

**배경**: 터치 친화적 UI에서 응답성은 매우 중요합니다.

[Answer]: A

**선택 이유**: 100ms는 사용자가 즉각 반응으로 느끼는 시간입니다. 터치 UI에서는 필수적이며, React의 성능으로 충분히 달성 가능합니다. 

---

### Q3: 확장성 - 메뉴 아이템 수

시스템이 지원해야 하는 최대 메뉴 아이템 수는?

A) 50개 이하 (소규모 카페)
B) 100개 (일반 레스토랑)
C) 200개 (대형 레스토랑)
D) 500개 이상 (프랜차이즈)
E) Other (please describe after [Answer]: tag below)

**배경**: 메뉴 수에 따라 클라이언트 사이드 필터링 전략이 달라질 수 있습니다.

[Answer]: B

**선택 이유**: 일반적인 레스토랑의 메뉴 수는 50-100개 정도입니다. 클라이언트 사이드 필터링으로 충분히 빠르게 처리할 수 있습니다. 

---

### Q4: 확장성 - 동시 세션 수

단일 매장에서 예상되는 최대 동시 고객 세션 수는?

A) 10개 이하 (소규모)
B) 50개 (중규모)
C) 100개 (대규모)
D) 200개 이상 (초대형)
E) Other (please describe after [Answer]: tag below)

**배경**: Frontend는 서버 부하에 영향을 주지 않지만, 설계 시 고려 필요합니다.

[Answer]: B

**선택 이유**: 요구사항에 최대 50개 테이블이 명시되어 있습니다. 동시 세션 50개는 충분한 여유입니다. 

---

### Q5: 가용성 - 오프라인 지원

인터넷 연결이 끊겼을 때 동작 방식은?

A) 완전 오프라인 모드 (Service Worker, IndexedDB)
B) 부분 오프라인 (장바구니만 LocalStorage에 저장, API는 불가)
C) 오프라인 미지원 (에러 메시지만 표시)
D) Other (please describe after [Answer]: tag below)

**배경**: 로컬 환경이므로 오프라인 시나리오는 드물지만, 고려 필요할 수 있습니다.

[Answer]: B

**선택 이유**: LocalStorage로 장바구니만 저장하면 충분합니다. 완전 오프라인 모드(Service Worker)는 MVP에서 과도하며, 로컬 네트워크 환경에서는 거의 필요하지 않습니다. 

---

### Q6: 보안 - LocalStorage 보안

LocalStorage에 저장되는 민감 데이터 처리 방식은?

A) 암호화 저장 (CryptoJS 등)
B) 평문 저장 (로컬 환경으로 보안 위험 낮음)
C) SessionStorage 사용 (탭 닫으면 삭제)
D) 민감 데이터 저장 안 함 (Cookie만 사용)
E) Other (please describe after [Answer]: tag below)

**배경**: LocalStorage에 테이블 비밀번호를 저장하는데, 보안 수준을 결정해야 합니다.

[Answer]: B

**선택 이유**: 로컬 네트워크 환경에서 태블릿은 매장 내부에만 있으므로 보안 위험이 낮습니다. 평문 저장으로 충분하며, MVP에서는 과도한 암호화가 불필요합니다. 

---

### Q7: 보안 - XSS 방지

사용자 입력이나 API 응답의 XSS 공격 방지 수준은?

A) 엄격한 입력 검증 + HTML 이스케이프 + CSP (Content Security Policy)
B) React 기본 XSS 방지만 신뢰 (dangerouslySetInnerHTML 사용 금지)
C) 기본 입력 검증만 (특별한 XSS 방지 없음)
D) Other (please describe after [Answer]: tag below)

**배경**: React는 기본적으로 XSS를 방지하지만, 추가 보안 조치가 필요할 수 있습니다.

[Answer]: B

**선택 이유**: React의 기본 XSS 방지 기능으로 충분합니다. `dangerouslySetInnerHTML` 사용을 금지하면 안전하며, MVP에서 추가적인 CSP는 과도합니다. 

---

### Q8: 기술 스택 - React 버전 및 빌드 도구

React 버전과 빌드 도구는?

A) React 18 + Vite (최신, 빠른 빌드)
B) React 18 + Create React App (안정적, 설정 간편)
C) React 17 + Webpack (레거시 호환)
D) Next.js (SSR, SEO 고려)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

**선택 이유**: React 18 + Vite는 최신 기술 스택이며, Vite는 빠른 빌드와 HMR을 제공합니다. Day 0 계약에 TypeScript 타입이 정의되어 있으므로 React 18과 완벽히 호환됩니다.

---

### Q9: 기술 스택 - 상태 관리 라이브러리

전역 상태 관리 라이브러리는?

A) React Context API만 사용 (간단, 라이브러리 없음)
B) Redux Toolkit (강력, 복잡한 상태 관리)
C) Zustand (경량, 간단한 API)
D) Jotai or Recoil (Atomic 상태 관리)
E) Other (please describe after [Answer]: tag below)

**배경**: Customer Frontend는 상태가 복잡하지 않으므로 가벼운 솔루션이 적합할 수 있습니다.

[Answer]: A

**선택 이유**: Customer Frontend의 상태(장바구니, 메뉴, 세션)는 복잡하지 않습니다. React Context API만으로 충분하며, 추가 라이브러리 없이 가볍게 구현할 수 있습니다. 

---

### Q10: 기술 스택 - UI 컴포넌트 라이브러리

UI 컴포넌트 라이브러리 사용 여부는?

A) Material-UI (MUI) - 풍부한 컴포넌트, 무거움
B) Ant Design - 엔터프라이즈급 UI
C) Chakra UI - 접근성 우수, 커스터마이징 쉬움
D) Tailwind CSS + HeadlessUI - 유틸리티 우선, 가벼움
E) 라이브러리 없음 - 직접 CSS 작성
F) Other (please describe after [Answer]: tag below)

[Answer]: D

**선택 이유**: Tailwind CSS는 빠른 개발을 가능하게 하며, 유틸리티 우선 방식으로 커스터마이징이 쉽습니다. HeadlessUI와 조합하면 접근성도 우수합니다. MVP에 최적입니다. 

---

### Q11: 기술 스택 - HTTP 클라이언트

API 호출에 사용할 HTTP 클라이언트는?

A) fetch API (네이티브, 추가 설치 없음)
B) axios (풍부한 기능, 인터셉터)
C) React Query + fetch (캐싱, 자동 재시도)
D) SWR (데이터 페칭 라이브러리)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

**선택 이유**: fetch API는 네이티브이며 추가 설치가 필요 없습니다. MVP에서는 충분하며, 필요 시 나중에 axios나 React Query로 전환 가능합니다.

---

### Q12: 기술 스택 - 라우팅 라이브러리

페이지 라우팅 라이브러리는?

A) React Router v6 (최신, 가장 인기)
B) React Router v5 (안정적, 레거시)
C) Wouter (경량 라우터)
D) 라우팅 없음 (단일 페이지)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

**선택 이유**: React Router v6는 최신 버전이며 가장 인기 있는 라우팅 라이브러리입니다. Functional Design에서 다중 페이지 구조(/menu, /cart, /orders)를 선택했으므로 필수입니다.

---

### Q13: 테스트 전략 - 단위 테스트 프레임워크

단위 테스트 프레임워크는?

A) Jest + React Testing Library (가장 인기, 권장)
B) Vitest + React Testing Library (Vite 친화적, 빠름)
C) Cypress Component Testing (E2E도 가능)
D) 테스트 없음 (MVP에서 스킵)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

**선택 이유**: Vite를 사용하므로 Vitest가 더 빠르고 Vite 친화적입니다. React Testing Library와 조합하면 최신 테스트 환경을 구축할 수 있습니다.

---

### Q14: 테스트 전략 - 테스트 커버리지 목표

단위 테스트 커버리지 목표는?

A) 80% 이상 (높은 품질)
B) 60% 이상 (중간 품질)
C) 40% 이상 (최소 품질)
D) 테스트 커버리지 목표 없음 (핵심 기능만)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

**선택 이유**: 60%는 MVP로서 적절한 목표입니다. 핵심 비즈니스 로직과 주요 컴포넌트에 집중하면서도 품질을 유지할 수 있는 균형잡힌 목표입니다.

---

### Q15: 접근성 - WCAG 준수 수준

웹 접근성 (WCAG) 준수 수준은?

A) WCAG 2.1 Level AA (권장)
B) WCAG 2.1 Level A (최소)
C) 접근성 고려하지 않음 (터치 전용)
D) Other (please describe after [Answer]: tag below)

**배경**: 태블릿 UI이지만, 접근성은 좋은 UX의 기본입니다.

[Answer]: B

**선택 이유**: WCAG 2.1 Level A는 최소한의 접근성을 보장합니다. MVP로서 적절하며, 터치 UI에서도 기본적인 접근성 원칙(키보드 네비게이션, 색상 대비 등)을 따릅니다. 

---

### Q16: 브라우저 지원 범위

지원해야 하는 브라우저 범위는?

A) 최신 Chrome, Firefox, Safari, Edge만 (Modern Browsers)
B) 최신 + 1년 이내 버전 (일반적)
C) IE11 포함 (레거시 지원)
D) Chrome만 (태블릿 고정 브라우저)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

**선택 이유**: 최신 모던 브라우저만 지원하면 충분합니다. 태블릿은 최신 Chrome/Safari를 사용하며, IE11이나 레거시 브라우저 지원은 불필요합니다.

---

### Q17: 모바일/태블릿 대응

모바일 및 태블릿 대응 전략은?

A) 태블릿 전용 (iPad 크기, 10인치 이상)
B) 반응형 (모바일 + 태블릿)
C) 태블릿 최적화 + 모바일 지원
D) 데스크탑도 지원 (관리자가 PC에서 테스트)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

**선택 이유**: 태블릿 전용으로 설계하는 것이 가장 명확합니다. 10인치 이상 태블릿에 최적화하면 UI/UX가 일관되고, 44x44px 터치 타겟도 충분합니다.

---

### Q18: 에러 처리 - 에러 추적

에러 로깅 및 추적 도구 사용 여부는?

A) Sentry (클라우드 에러 추적)
B) LogRocket (세션 리플레이 포함)
C) 콘솔 로그만 (console.error)
D) 에러 추적 없음 (MVP)
E) Other (please describe after [Answer]: tag below)

[Answer]: C

**선택 이유**: MVP에서는 console.error로 충분합니다. Sentry나 LogRocket은 클라우드 서비스이며 로컬 환경에서는 과도합니다. 개발 중에는 콘솔로 충분히 디버깅 가능합니다.

---

### Q19: 코드 품질 - 린팅 및 포맷팅

코드 품질 도구는?

A) ESLint + Prettier + Husky (pre-commit hook)
B) ESLint + Prettier (수동 실행)
C) ESLint만 사용
D) 린팅/포맷팅 없음
E) Other (please describe after [Answer]: tag below)

[Answer]: A

**선택 이유**: ESLint + Prettier + Husky는 코드 품질을 자동으로 보장합니다. pre-commit hook으로 커밋 전에 자동 검사하여 일관된 코드 스타일을 유지합니다.

---

### Q20: TypeScript 사용 여부

TypeScript 사용 여부와 엄격도는?

A) TypeScript (strict mode)
B) TypeScript (일부 any 허용)
C) JavaScript + JSDoc
D) JavaScript만 사용
E) Other (please describe after [Answer]: tag below)

**배경**: Day 0 계약에 TypeScript 타입이 정의되어 있습니다.

[Answer]: A

**선택 이유**: Day 0 계약에 TypeScript 타입이 이미 정의되어 있으므로 TypeScript를 사용하는 것이 자연스럽습니다. strict mode로 타입 안전성을 최대화합니다. 

---

## NFR Requirements 평가 단계

아래 단계를 순차적으로 실행하여 NFR Requirements 아티팩트를 생성합니다.

### Step 1: 답변 수집 및 분석
- [ ] 모든 질문에 대한 답변 수집
- [ ] 모호하거나 불명확한 답변 확인
- [ ] 필요 시 명확화 질문 생성

**Status**: 사용자 답변 대기

---

### Step 2: NFR Requirements 문서 생성
- [x] 성능 요구사항 정의
- [x] 확장성 요구사항 정의
- [x] 가용성 요구사항 정의
- [x] 보안 요구사항 정의
- [x] 접근성 요구사항 정의
- [x] 브라우저 지원 정의
- [x] 에러 처리 전략 정의

**Output**: `aidlc-docs/construction/unit2-customer/nfr-requirements/nfr-requirements.md` ✅

---

### Step 3: Tech Stack Decisions 문서 생성
- [x] React 버전 및 빌드 도구 선택
- [x] 상태 관리 라이브러리 선택
- [x] UI 컴포넌트 라이브러리 선택
- [x] HTTP 클라이언트 선택
- [x] 라우팅 라이브러리 선택
- [x] 테스트 프레임워크 선택
- [x] 린팅/포맷팅 도구 선택
- [x] TypeScript 설정
- [x] 선택 이유 및 트레이드오프 설명

**Output**: `aidlc-docs/construction/unit2-customer/nfr-requirements/tech-stack-decisions.md` ✅

---

## ✅ All Steps Completed

모든 NFR Requirements 아티팩트가 생성되었습니다!

---

## Next Steps

1. 위 질문들에 답변해주세요 (각 [Answer]: 태그에 답변 입력)
2. 답변 완료 후 알려주시면 분석하겠습니다
3. 모호한 답변이 있으면 추가 명확화 질문을 드립니다
4. 모든 질문이 명확해지면 NFR Requirements 아티팩트를 생성합니다

---

**Please answer all questions above and let me know when you're done!**
