# NFR Requirements - Unit 2 (Customer Frontend)

**Unit**: Unit 2 - Customer Frontend  
**Created**: 2026-04-06T16:05:00Z

---

## Overview

Customer Frontend의 비기능 요구사항(Non-Functional Requirements)을 정의합니다. 이 요구사항들은 시스템의 품질 속성, 성능, 확장성, 보안, 접근성 등을 명시합니다.

---

## 1. 성능 요구사항 (Performance Requirements)

### PERF-001: 초기 페이지 로딩 시간
**요구사항**: 초기 페이지 로딩(First Contentful Paint)은 2초 이내여야 합니다.

**측정 기준**:
- First Contentful Paint (FCP): 2초 이내
- Time to Interactive (TTI): 3초 이내
- Largest Contentful Paint (LCP): 2.5초 이내

**달성 방법**:
- Vite의 빠른 빌드 및 코드 스플리팅
- 번들 크기 최적화 (Tree shaking)
- 이미지 레이지 로딩
- 메뉴 데이터 한 번에 로드 (클라이언트 캐싱)

**검증 방법**:
- Chrome DevTools Lighthouse 스코어 90+ (Performance)
- Network throttling (Fast 3G)에서 테스트

---

### PERF-002: UI 응답성
**요구사항**: 사용자 입력(버튼 클릭, 터치)에 대한 UI 응답은 100ms 이내여야 합니다.

**측정 기준**:
- 버튼 클릭 → 시각적 피드백: 100ms 이내
- 폼 입력 → 상태 업데이트: 100ms 이내
- 페이지 전환: 300ms 이내

**달성 방법**:
- React의 효율적인 렌더링
- 불필요한 재렌더링 방지 (useMemo, useCallback)
- 낙관적 UI 업데이트 (Optimistic Updates)

**검증 방법**:
- Chrome DevTools Performance 프로파일링
- React DevTools Profiler

---

### PERF-003: 메뉴 로딩 성능
**요구사항**: 메뉴 목록 로딩은 1초 이내여야 합니다 (기존 요구사항 준수).

**측정 기준**:
- API 호출 → 메뉴 렌더링: 1초 이내
- 100개 메뉴 아이템 렌더링: 500ms 이내

**달성 방법**:
- 클라이언트 사이드 필터링 (초기 로드 후)
- 가상 스크롤 (필요 시 - 100개 이하에서는 불필요)
- 메뉴 이미지 레이지 로딩

---

### PERF-004: 장바구니 동기화 성능
**요구사항**: 장바구니 추가/수정 시 LocalStorage 동기화는 50ms 이내여야 합니다.

**측정 기준**:
- 장바구니 아이템 추가 → LocalStorage 저장: 50ms 이내
- LocalStorage 읽기 → Context 복원: 100ms 이내

**달성 방법**:
- JSON.stringify/parse 최적화
- 불필요한 동기화 방지 (debounce)

---

## 2. 확장성 요구사항 (Scalability Requirements)

### SCALE-001: 메뉴 아이템 수 지원
**요구사항**: 최대 100개의 메뉴 아이템을 원활하게 처리해야 합니다.

**제약사항**:
- 메뉴 아이템 수: 최대 100개
- 카테고리 수: 최대 10개
- 메뉴 이미지 크기: 각 500KB 이하 (향후 확장)

**달성 방법**:
- 클라이언트 사이드 필터링
- 효율적인 렌더링 (React.memo)

---

### SCALE-002: 동시 세션 수
**요구사항**: 단일 매장에서 최대 50개의 동시 고객 세션을 지원해야 합니다.

**제약사항**:
- Frontend는 서버 부하와 무관 (Stateless)
- 각 세션은 독립적 (LocalStorage 격리)

**달성 방법**:
- 클라이언트 사이드 상태 관리
- 서버 API 호출 최소화

---

### SCALE-003: 장바구니 아이템 수
**요구사항**: 장바구니는 최대 20개 아이템을 저장할 수 있어야 합니다.

**제약사항**:
- LocalStorage 크기 제한: 5MB (충분함)
- 단일 주문 최대 아이템 수: 20개

**달성 방법**:
- LocalStorage에 JSON 형식 저장
- 필요 시 경고 메시지 표시

---

## 3. 가용성 요구사항 (Availability Requirements)

### AVAIL-001: 오프라인 지원
**요구사항**: 부분 오프라인 지원 - 장바구니는 LocalStorage에 영속화되어야 합니다.

**동작 방식**:
- **온라인**: 정상적으로 모든 기능 작동
- **오프라인**: 
  - 장바구니 데이터는 LocalStorage에 보존
  - API 호출 실패 시 Toast 알림
  - 재연결 시 자동 재시도 없음 (수동 새로고침)

**미지원 기능** (오프라인 시):
- 메뉴 로딩
- 주문 생성
- 주문 내역 조회

**달성 방법**:
- LocalStorage 기반 장바구니 영속성
- 네트워크 에러 처리 및 사용자 피드백

---

### AVAIL-002: 에러 복구
**요구사항**: API 호출 실패 시 명확한 에러 메시지와 복구 방법을 제공해야 합니다.

**에러 시나리오**:
- 네트워크 연결 끊김: "네트워크 연결을 확인해주세요"
- 서버 에러 (5xx): "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
- 인증 실패 (401): 자동 재로그인 시도
- 데이터 검증 실패 (400): "입력값이 올바르지 않습니다"

**달성 방법**:
- Toast 알림으로 에러 표시 (5초 지속)
- 에러 코드별 사용자 친화적 메시지 매핑
- 콘솔에 상세 에러 로그

---

## 4. 보안 요구사항 (Security Requirements)

### SEC-001: LocalStorage 데이터 보안
**요구사항**: LocalStorage에 저장되는 데이터는 평문으로 저장합니다 (로컬 환경 전용).

**저장 데이터**:
- 테이블 번호 (숫자)
- 테이블 비밀번호 (평문)
- 장바구니 데이터 (메뉴 ID, 수량)

**보안 수준**:
- **평문 저장** (암호화 없음)
- **이유**: 로컬 네트워크 환경에서 태블릿은 매장 내부에만 존재하므로 보안 위험 낮음
- **제약**: 공개 인터넷에 노출되지 않아야 함

**향후 개선 방안** (프로덕션 환경):
- CryptoJS를 사용한 암호화
- 비밀번호를 SessionStorage로 이동
- 민감 데이터를 Cookie로만 관리

---

### SEC-002: XSS 방지
**요구사항**: React의 기본 XSS 방지 기능을 활용하여 보안을 유지합니다.

**방지 방법**:
- React의 자동 HTML 이스케이프 (기본)
- `dangerouslySetInnerHTML` 사용 금지
- 사용자 입력 검증 (장바구니 수량, 폼 입력)

**추가 조치**:
- ESLint 규칙: `react/no-danger` 활성화
- 백엔드 API 응답 검증

---

### SEC-003: HTTPS 사용
**요구사항**: 프로덕션 환경에서는 HTTPS를 사용해야 합니다.

**개발 환경**:
- HTTP (로컬 네트워크)
- Vite dev server: http://localhost:5173

**프로덕션 환경** (향후):
- HTTPS 필수
- HTTP-only Cookie 사용

---

## 5. 접근성 요구사항 (Accessibility Requirements)

### ACC-001: WCAG 2.1 Level A 준수
**요구사항**: 웹 접근성 WCAG 2.1 Level A를 준수합니다.

**준수 항목**:
- **키보드 네비게이션**: 모든 버튼과 링크는 키보드로 접근 가능
- **색상 대비**: 텍스트와 배경의 색상 대비율 4.5:1 이상
- **대체 텍스트**: 이미지에 alt 속성 제공
- **포커스 표시**: 포커스된 요소는 명확한 아웃라인 표시

**검증 방법**:
- axe DevTools로 접근성 검사
- 키보드만으로 전체 플로우 테스트

---

### ACC-002: 터치 친화적 UI
**요구사항**: 모든 터치 가능한 요소는 최소 44x44px 크기를 가져야 합니다.

**적용 대상**:
- 버튼, 링크, 아이콘 버튼
- 폼 입력 필드
- 카테고리 선택 버튼

**달성 방법**:
- CSS 최소 크기 설정: `min-width: 44px; min-height: 44px;`
- 패딩으로 터치 영역 확보

---

## 6. 사용성 요구사항 (Usability Requirements)

### USE-001: 로딩 상태 표시
**요구사항**: API 호출 중에는 로딩 인디케이터를 표시해야 합니다.

**표시 위치**:
- 메뉴 로딩: 중앙 로딩 스피너
- 주문 생성: "주문 중..." 버튼 텍스트 변경
- 주문 내역 로딩: 스켈레톤 UI 또는 스피너

**달성 방법**:
- `loading` 상태 변수 관리
- LoadingSpinner 컴포넌트

---

### USE-002: 빈 상태 표시
**요구사항**: 데이터가 없을 때 명확한 빈 상태 메시지를 표시해야 합니다.

**빈 상태 시나리오**:
- 빈 장바구니: "장바구니가 비어있습니다" + "메뉴 보러가기" 버튼
- 주문 내역 없음: "주문 내역이 없습니다" + "메뉴 보러가기" 버튼

**달성 방법**:
- EmptyState 컴포넌트
- 아이콘 + 메시지 + 액션 버튼

---

### USE-003: 에러 피드백
**요구사항**: 사용자 액션에 대한 명확한 피드백을 제공해야 합니다.

**피드백 유형**:
- **성공**: Toast 알림 (초록색, 3초)
- **에러**: Toast 알림 (빨간색, 5초)
- **경고**: Toast 알림 (노란색, 3초)
- **정보**: Toast 알림 (파란색, 3초)

**피드백 예시**:
- 장바구니 추가: "장바구니에 추가되었습니다"
- 주문 생성 성공: "주문이 접수되었습니다 (주문번호: #005)"
- API 에러: "주문 생성에 실패했습니다"

---

## 7. 테스트 요구사항 (Testing Requirements)

### TEST-001: 단위 테스트 커버리지
**요구사항**: 단위 테스트 커버리지는 60% 이상이어야 합니다.

**테스트 대상**:
- **필수** (높은 우선순위):
  - 비즈니스 로직 함수 (장바구니 추가, 총액 계산 등)
  - Context Actions (addToCart, updateCartQuantity 등)
  - 검증 함수 (validateQuantity, validateCart 등)
- **권장**:
  - 주요 컴포넌트 (CartPage, MenuPage)
  - 공통 컴포넌트 (Button, Modal)

**테스트 프레임워크**:
- Vitest + React Testing Library

**검증 방법**:
- `npm run test:coverage`
- 커버리지 리포트 생성

---

### TEST-002: 컴포넌트 테스트
**요구사항**: 주요 사용자 플로우는 컴포넌트 테스트로 커버해야 합니다.

**테스트 시나리오**:
- 메뉴 조회 → 장바구니 추가
- 장바구니 수량 조절
- 주문 생성 플로우
- 에러 처리 (API 실패 시나리오)

---

## 8. 브라우저 지원 요구사항

### BROWSER-001: 지원 브라우저
**요구사항**: 최신 모던 브라우저를 지원합니다.

**지원 브라우저**:
- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

**미지원 브라우저**:
- Internet Explorer (모든 버전)
- 레거시 모바일 브라우저

**검증 방법**:
- BrowserStack 또는 실제 디바이스 테스트

---

### BROWSER-002: 디바이스 대응
**요구사항**: 10인치 이상 태블릿 전용으로 최적화합니다.

**지원 디바이스**:
- iPad (10.2인치 이상)
- Android 태블릿 (10인치 이상)
- 해상도: 1024x768 이상

**미지원 디바이스**:
- 스마트폰 (7인치 이하)
- 데스크탑은 테스트 용도로만 지원

---

## 9. 유지보수 요구사항 (Maintainability Requirements)

### MAINT-001: 코드 품질
**요구사항**: 일관된 코드 스타일과 품질을 유지해야 합니다.

**도구**:
- **ESLint**: JavaScript/TypeScript 린팅
- **Prettier**: 코드 포맷팅
- **Husky**: pre-commit hook (자동 검사)

**규칙**:
- ESLint: `eslint-config-airbnb` 또는 `eslint-config-react-app`
- Prettier: 기본 설정
- 커밋 전 자동 린트 및 포맷팅

---

### MAINT-002: TypeScript 엄격 모드
**요구사항**: TypeScript strict mode를 사용하여 타입 안전성을 보장합니다.

**설정**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

**달성 방법**:
- Day 0 계약의 TypeScript 타입 사용
- 모든 함수와 변수에 명시적 타입 지정
- `any` 타입 최소화

---

### MAINT-003: 문서화
**요구사항**: 주요 컴포넌트와 함수에 주석을 작성해야 합니다.

**문서화 대상**:
- 복잡한 비즈니스 로직 함수
- Context Actions
- 공통 유틸리티 함수

**형식**:
- JSDoc 주석
- Props 타입에 주석

---

## 10. 성능 벤치마크

### 목표 성능 지표 요약

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 초기 로딩 (FCP) | 2초 이내 | Lighthouse |
| UI 응답성 | 100ms 이내 | DevTools Performance |
| 메뉴 로딩 | 1초 이내 | Network 탭 |
| 장바구니 동기화 | 50ms 이내 | Performance API |
| Lighthouse 성능 점수 | 90+ | Lighthouse |
| 번들 크기 | 500KB 이하 | Vite build 분석 |

---

## 11. NFR 우선순위

### P0 (Critical - 필수)
- PERF-001: 초기 페이지 로딩 시간
- PERF-002: UI 응답성
- SEC-002: XSS 방지
- USE-003: 에러 피드백

### P1 (High - 높음)
- PERF-003: 메뉴 로딩 성능
- SCALE-001: 메뉴 아이템 수 지원
- AVAIL-001: 오프라인 지원 (부분)
- ACC-002: 터치 친화적 UI
- TEST-001: 단위 테스트 커버리지

### P2 (Medium - 중간)
- PERF-004: 장바구니 동기화 성능
- SEC-001: LocalStorage 데이터 보안
- ACC-001: WCAG 2.1 Level A
- MAINT-001: 코드 품질
- MAINT-002: TypeScript 엄격 모드

### P3 (Low - 낮음)
- AVAIL-002: 에러 복구
- USE-001: 로딩 상태 표시
- USE-002: 빈 상태 표시
- MAINT-003: 문서화

---

이상으로 Customer Frontend의 비기능 요구사항 정의를 완료했습니다.
