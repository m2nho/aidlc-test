# Unit 2 - Customer Frontend: Functional Design Plan

**Unit**: Unit 2 - Customer Frontend  
**Stage**: Functional Design  
**Created**: 2026-04-06T15:45:00Z

---

## Unit Overview

### Purpose
고객이 테이블 태블릿에서 메뉴를 보고 주문하는 웹 UI 제공

### Assigned User Stories
- **CUS-001**: 테이블 자동 로그인
- **CUS-002**: 메뉴 카테고리별 조회
- **CUS-003**: 메뉴 상세 정보 확인
- **CUS-004**: 장바구니에 메뉴 추가
- **CUS-005**: 장바구니 수량 조절
- **CUS-006**: 장바구니 총액 확인
- **CUS-007**: 주문 생성
- **CUS-008**: 주문 내역 조회

### Components (13개)
**Pages (4)**: CustomerApp, MenuPage, CartPage, OrderHistoryPage  
**Features (4)**: MenuCategoryList, MenuCard, CartItem, OrderCard  
**Common (5)**: Button, Modal, LoadingSpinner, EmptyState, CustomerAppContext

### Technology Stack
- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API
- **HTTP Client**: fetch API
- **Storage**: LocalStorage API
- **Testing**: Jest, React Testing Library

### Independence Strategy
- **Day 0 계약 기반**: TypeScript 타입, API 계약 사용
- **Mock API**: Backend 없이 완전 독립 개발
- **LocalStorage**: 장바구니 데이터 영속성

---

## Clarification Questions

이 질문들은 Customer Frontend의 비즈니스 로직과 UI 플로우를 명확히 하기 위한 것입니다.

### Q1: 자동 로그인 메커니즘

고객용 앱의 자동 로그인을 어떻게 구현할까요?

A) LocalStorage에 테이블 정보 저장 후 자동 로그인 (관리자가 1회 초기 설정)
B) URL 파라미터로 테이블 번호 전달 (예: /table/5)
C) QR 코드 스캔 후 자동 로그인
D) SessionStorage에 저장 (탭 닫으면 세션 종료)
E) Other (please describe after [Answer]: tag below)

**배경**: Day 0 계약에는 `CustomerLoginRequest`가 정의되어 있지만, 고객이 매번 수동 로그인하는지 자동 로그인인지 명확하지 않습니다.

[Answer]: A

**선택 이유**: 요구사항에 명시된 방식이며, 태블릿 고정 사용 시나리오에 가장 적합합니다. 관리자가 1회 초기 설정 후 고객은 로그인 절차 없이 즉시 사용 가능합니다. 

---

### Q2: 장바구니 상태 관리

장바구니 데이터를 어디에 저장하고 관리할까요?

A) LocalStorage만 사용 (페이지 새로고침 시에도 유지)
B) React Context + LocalStorage (Context가 메인, LocalStorage는 백업)
C) React Context만 사용 (새로고침 시 장바구니 초기화)
D) Backend API로 장바구니 저장 (서버에 영속성)
E) Other (please describe after [Answer]: tag below)

**배경**: 요구사항에는 "장바구니 LocalStorage"라고 명시되어 있지만, Context와의 관계가 불명확합니다.

[Answer]: B

**선택 이유**: React 앱의 일반적인 패턴입니다. Context가 런타임 상태 관리를 담당하고, LocalStorage는 영속성을 제공하여 페이지 새로고침 시에도 장바구니가 유지됩니다. 

---

### Q3: 메뉴 카테고리 필터링 동작

메뉴 카테고리를 선택했을 때 동작 방식은?

A) 클라이언트 사이드 필터링 (모든 메뉴를 한 번에 로드 후 필터링)
B) 서버 사이드 필터링 (카테고리 변경 시마다 API 호출)
C) 하이브리드 (초기 로드는 전체, 이후 클라이언트 필터링)
D) Other (please describe after [Answer]: tag below)

**배경**: NFR에는 "메뉴 로딩 1초"라고 명시되어 있지만, 필터링 전략이 불명확합니다.

[Answer]: A

**선택 이유**: 일반 식당의 메뉴 수는 많지 않으며(50-100개), 초기 로딩 후 클라이언트 사이드 필터링이 더 빠르고 간단합니다. 1초 이내 로딩 목표를 쉽게 달성할 수 있습니다. 

---

### Q4: 주문 생성 플로우

주문 확정 버튼을 누른 후 동작은?

A) 즉시 주문 생성 → 성공 메시지 → 장바구니 비우기 → 주문 내역 페이지로 이동
B) 확인 모달 표시 → 사용자 확인 → 주문 생성 → 장바구니 비우기
C) 주문 생성 → 주문 내역 페이지에서 진행 상태 표시 (장바구니 유지)
D) Other (please describe after [Answer]: tag below)

**배경**: 사용자 경험을 고려한 플로우 결정이 필요합니다.

[Answer]: B

**선택 이유**: 확인 모달을 통해 실수로 주문하는 것을 방지하고, 주문 성공 후 장바구니를 비워 깔끔한 UX를 제공합니다. 

---

### Q5: 주문 내역 실시간 업데이트

고객이 주문 내역 페이지에서 주문 상태를 어떻게 확인할까요?

A) 페이지 로드 시 한 번만 조회 (수동 새로고침)
B) 폴링 (5초마다 자동 조회)
C) SSE 연결 (실시간 업데이트)
D) 주문 상태 변경 시 푸시 알림 (브라우저 알림)
E) Other (please describe after [Answer]: tag below)

**배경**: Customer Frontend가 SSE를 사용할지, 폴링을 사용할지 명확하지 않습니다. (Admin은 SSE 사용 확정)

[Answer]: A

**선택 이유**: 고객은 주문 후 상태 변경을 자주 확인하지 않습니다. 필요 시 수동 새로고침하면 충분하며, Customer용 SSE 연결은 불필요한 복잡도를 추가합니다. Admin만 실시간 모니터링이 필요합니다. 

---

### Q6: 장바구니가 비어있을 때 동작

장바구니가 비어있을 때 주문 확정 버튼은?

A) 버튼 비활성화 (disabled) + 도움말 메시지
B) 버튼 숨김
C) 버튼 클릭 시 경고 모달 표시
D) Other (please describe after [Answer]: tag below)

[Answer]: A

**선택 이유**: 사용자에게 명확한 피드백을 제공하며, 접근성(accessibility)도 좋습니다. 버튼이 왜 작동하지 않는지 명확히 알 수 있습니다.

---

### Q7: 메뉴 품절 처리

메뉴가 품절(is_available: false)일 때 UI 동작은?

A) 메뉴 카드에 "품절" 배지 표시 + 장바구니 추가 버튼 비활성화
B) 품절 메뉴는 목록에서 숨김
C) 품절 메뉴는 리스트 하단으로 이동 + 회색 처리
D) Other (please describe after [Answer]: tag below)

[Answer]: A

**선택 이유**: 사용자가 어떤 메뉴가 있는지 볼 수 있으면서도 품절 상태를 명확히 인지할 수 있습니다. 메뉴를 숨기면 고객이 "이 메뉴가 원래 없는 건가?"라고 혼란스러워할 수 있습니다.

---

### Q8: 에러 처리 및 사용자 피드백

API 호출 실패 시 사용자에게 어떻게 알림을 제공할까요?

A) Toast 알림 (화면 상단 또는 하단에 자동 사라지는 메시지)
B) 모달 다이얼로그 (확인 버튼 클릭 필요)
C) 인라인 에러 메시지 (각 컴포넌트 내부에 표시)
D) 전역 에러 페이지로 리다이렉트
E) Other (please describe after [Answer]: tag below)

[Answer]: A

**선택 이유**: 비침투적이며 현대적인 UX 패턴입니다. 모달은 너무 방해가 되고, 인라인 메시지는 사용자가 놓칠 수 있습니다. Toast는 정보를 전달하면서도 작업 흐름을 방해하지 않습니다.

---

### Q9: 세션 만료 처리

고객의 테이블 세션이 만료되었을 때 동작은?

A) 자동으로 재로그인 시도 (LocalStorage 정보 사용)
B) 로그인 화면으로 리다이렉트 + 안내 메시지
C) 에러 모달 표시 후 수동 재로그인
D) 세션 만료 개념 없음 (16시간 유효, 거의 만료 안 됨)
E) Other (please describe after [Answer]: tag below)

**배경**: JWT 세션은 16시간 유효하지만, 만료 시 처리가 필요합니다.

[Answer]: A

**선택 이유**: 고객이 별도 조치 없이 계속 사용할 수 있습니다. 자동 로그인 개념과 일치하며, LocalStorage에 저장된 테이블 정보로 투명하게 재인증됩니다.

---

### Q10: 라우팅 구조

Customer Frontend의 페이지 라우팅 구조는?

A) 단일 페이지 (탭 네비게이션) - /customer → 탭으로 메뉴/장바구니/주문 전환
B) 다중 페이지 (React Router) - /menu, /cart, /orders
C) 하이브리드 (메인은 단일, 모달로 상세 표시)
D) Other (please describe after [Answer]: tag below)

**배경**: 태블릿 UI에서 네비게이션 방식을 결정해야 합니다.

[Answer]: B

**선택 이유**: 명확한 페이지 구분으로 사용자가 현재 위치를 쉽게 파악할 수 있으며, URL로 특정 페이지를 북마크하거나 공유할 수 있습니다. 브라우저의 뒤로가기 버튼도 자연스럽게 작동합니다.

---

## Functional Design Steps

아래 단계를 순차적으로 실행하여 Functional Design 아티팩트를 생성합니다.

### Step 1: Business Logic Model 생성
- [x] Customer 주문 플로우 모델링
- [x] 장바구니 상태 관리 로직 정의
- [x] 자동 로그인 메커니즘 정의
- [x] 메뉴 필터링 로직 정의
- [x] 주문 생성 플로우 정의

**Output**: `aidlc-docs/construction/unit2-customer/functional-design/business-logic-model.md` ✅

---

### Step 2: Domain Entities 정의
- [x] CartItem 엔티티 (프론트엔드 관점)
- [x] CustomerSession 엔티티 (LocalStorage 데이터 구조)
- [x] Menu 엔티티 (Day 0 계약 기반)
- [x] Order 엔티티 (고객 주문 내역 뷰)

**Output**: `aidlc-docs/construction/unit2-customer/functional-design/domain-entities.md` ✅

---

### Step 3: Business Rules 정의
- [x] 장바구니 검증 규칙 (최소 수량, 최대 수량)
- [x] 주문 생성 검증 규칙
- [x] 세션 유효성 검증 규칙
- [x] 메뉴 가용성 검증 규칙
- [x] 에러 처리 규칙

**Output**: `aidlc-docs/construction/unit2-customer/functional-design/business-rules.md` ✅

---

### Step 4: Frontend Components 상세 설계
- [x] 컴포넌트 계층 구조 (Component Tree)
- [x] 각 컴포넌트의 Props 및 State 정의
- [x] 컴포넌트 간 데이터 플로우
- [x] 사용자 상호작용 플로우 (User Interaction Flow)
- [x] Form 검증 규칙
- [x] API 통합 포인트 (어느 컴포넌트가 어떤 API 호출)
- [x] Context 구조 (CustomerAppContext)

**Output**: `aidlc-docs/construction/unit2-customer/functional-design/frontend-components.md` ✅

---

### Step 5: Mock API 전략 정의
- [x] Mock API 구현 범위
- [x] Mock 데이터 구조 (Day 0 계약 준수)
- [x] Mock API 지연 시간 설정
- [x] 개발 모드 전환 메커니즘 (.env)

**Output**: `aidlc-docs/construction/unit2-customer/functional-design/mock-api-strategy.md` ✅

---

## ✅ All Steps Completed

모든 Functional Design 아티팩트가 생성되었습니다!

---

## Next Steps

1. 위 질문들에 답변해주세요 (각 [Answer]: 태그에 답변 입력)
2. 답변 완료 후 알려주시면 분석하겠습니다
3. 모호한 답변이 있으면 추가 명확화 질문을 드립니다
4. 모든 질문이 명확해지면 Functional Design 아티팩트를 생성합니다

---

**Please answer all questions above and let me know when you're done!**
