# User Stories

테이블오더 서비스의 User Stories를 Persona별로 구성하고, 각 Persona 내에서 User Journey 순서로 정리합니다.

---

## Story Organization

- **Total Stories**: 20개
- **Epics**: 2개
- **Approach**: Hybrid (Persona-Based → Journey-Based)
- **Priority**: MoSCoW (Must Have / Should Have / Could Have / Won't Have)

---

## Table of Contents

### 👤 고객 (Customer) Stories
1. [CUS-001: 테이블 자동 로그인](#cus-001-테이블-자동-로그인)
2. [CUS-002: 메뉴 카테고리별 조회](#cus-002-메뉴-카테고리별-조회)
3. [CUS-003: 메뉴 상세 정보 확인](#cus-003-메뉴-상세-정보-확인)
4. [CUS-004: 장바구니에 메뉴 추가](#cus-004-장바구니에-메뉴-추가)
5. [CUS-005: 장바구니 수량 조절](#cus-005-장바구니-수량-조절)
6. [CUS-006: 장바구니 총액 확인](#cus-006-장바구니-총액-확인)
7. [CUS-007: 주문 생성](#cus-007-주문-생성)
8. [CUS-008: 주문 내역 조회](#cus-008-주문-내역-조회)

### 🔧 관리자 (Admin) Stories
9. [ADM-001: 관리자 로그인](#adm-001-관리자-로그인)
10. [ADM-002: 실시간 주문 대시보드 조회](#adm-002-실시간-주문-대시보드-조회)
11. [ADM-003: 주문 상태 변경](#adm-003-주문-상태-변경)
12. [EPIC-001: 테이블 관리](#epic-001-테이블-관리)
    - [ADM-004: 테이블 초기 설정](#adm-004-테이블-초기-설정)
    - [ADM-005: 주문 삭제](#adm-005-주문-삭제)
    - [ADM-006: 테이블 세션 종료](#adm-006-테이블-세션-종료)
    - [ADM-007: 과거 주문 내역 조회](#adm-007-과거-주문-내역-조회)
13. [EPIC-002: 메뉴 관리](#epic-002-메뉴-관리)
    - [ADM-008: 메뉴 목록 조회](#adm-008-메뉴-목록-조회)
    - [ADM-009: 메뉴 등록](#adm-009-메뉴-등록)
    - [ADM-010: 메뉴 수정](#adm-010-메뉴-수정)
    - [ADM-011: 메뉴 삭제](#adm-011-메뉴-삭제)

### ⚙️ 기술 (Technical) Stories
14. [TECH-001: 데이터베이스 및 시드 데이터 설정](#tech-001-데이터베이스-및-시드-데이터-설정)

---

# 👤 고객 (Customer) Stories

---

## CUS-001: 테이블 자동 로그인

**Priority**: Must Have

**As a** 고객  
**I want** 테이블에 앉자마자 자동으로 로그인되어  
**So that** 별도의 로그인 절차 없이 바로 메뉴를 볼 수 있다

### Description
매장 관리자가 테이블 태블릿을 초기 설정하면, 고객은 태블릿을 켤 때마다 자동으로 해당 테이블로 로그인됩니다. 이를 통해 고객은 로그인 과정 없이 즉시 메뉴 화면을 볼 수 있습니다.

### Acceptance Criteria

**Given** 테이블 태블릿이 초기 설정되어 있고  
**When** 고객이 태블릿을 켜면  
**Then** 자동으로 해당 테이블로 로그인되고 메뉴 화면이 표시된다

**Given** 테이블 태블릿이 초기 설정되어 있고  
**When** 페이지를 새로고침하면  
**Then** 로그인 상태가 유지되고 메뉴 화면이 다시 표시된다

**Given** 테이블 세션이 만료되지 않았고  
**When** 고객이 태블릿을 사용하면  
**Then** 세션 ID가 유지되어 주문 내역이 연속적으로 관리된다

### Related Personas
- 고객 (Customer)

### Dependencies
- ADM-004: 테이블 초기 설정 (관리자가 먼저 설정해야 함)

---

## CUS-002: 메뉴 카테고리별 조회

**Priority**: Must Have

**As a** 고객  
**I want** 메뉴를 카테고리별로 볼 수 있어서  
**So that** 원하는 종류의 메뉴를 빠르게 찾을 수 있다

### Description
고객은 메뉴를 카테고리(예: 메인 요리, 음료, 디저트)별로 필터링하여 볼 수 있습니다. 카테고리를 선택하면 해당 카테고리의 메뉴만 표시되어 메뉴 탐색이 용이합니다.

### Acceptance Criteria

**Given** 고객이 메뉴 화면에 있고  
**When** 카테고리 목록이 표시되면  
**Then** 모든 카테고리가 명확하게 표시된다

**Given** 고객이 특정 카테고리를 선택하면  
**When** 해당 카테고리의 메뉴가 로딩되면  
**Then** 1초 이내에 카테고리 메뉴가 카드 형태로 표시된다

**Given** 고객이 다른 카테고리를 선택하면  
**When** 카테고리가 전환되면  
**Then** 새로운 카테고리의 메뉴가 즉시 표시되고 이전 카테고리는 숨겨진다

### Related Personas
- 고객 (Customer)

---

## CUS-003: 메뉴 상세 정보 확인

**Priority**: Must Have

**As a** 고객  
**I want** 각 메뉴의 상세 정보(이름, 가격, 설명, 이미지)를 볼 수 있어서  
**So that** 메뉴를 선택하기 전에 충분한 정보를 확인할 수 있다

### Description
각 메뉴 카드에는 메뉴명, 가격, 설명, 이미지가 표시됩니다. 고객은 이 정보를 보고 주문할 메뉴를 결정할 수 있습니다.

### Acceptance Criteria

**Given** 고객이 메뉴 목록을 보고 있을 때  
**When** 각 메뉴 카드가 표시되면  
**Then** 메뉴명, 가격, 이미지가 명확하게 보인다

**Given** 고객이 메뉴 카드를 클릭/탭하면  
**When** 상세 정보가 표시되면  
**Then** 메뉴 설명이 전체적으로 표시된다

**Given** 메뉴에 이미지가 없으면  
**When** 메뉴 카드가 표시되면  
**Then** 기본 이미지가 표시되거나 이미지 영역이 적절히 처리된다

### Related Personas
- 고객 (Customer)

---

## CUS-004: 장바구니에 메뉴 추가

**Priority**: Must Have

**As a** 고객  
**I want** 마음에 드는 메뉴를 장바구니에 추가할 수 있어서  
**So that** 주문하기 전에 여러 메뉴를 모아둘 수 있다

### Description
고객은 메뉴 카드에서 "추가" 버튼을 눌러 장바구니에 메뉴를 추가할 수 있습니다. 장바구니는 LocalStorage에 저장되어 페이지 새로고침 시에도 유지됩니다.

### Acceptance Criteria

**Given** 고객이 메뉴를 보고 있을 때  
**When** "장바구니에 추가" 버튼을 클릭하면  
**Then** 해당 메뉴가 장바구니에 추가되고 확인 메시지가 표시된다

**Given** 장바구니에 메뉴가 추가되면  
**When** 장바구니 아이콘을 확인하면  
**Then** 장바구니 아이템 개수가 업데이트되어 표시된다

**Given** 동일한 메뉴를 다시 추가하면  
**When** "장바구니에 추가" 버튼을 클릭하면  
**Then** 기존 아이템의 수량이 1 증가한다

**Given** 장바구니에 메뉴가 추가된 후  
**When** 페이지를 새로고침하면  
**Then** 장바구니 내용이 유지된다 (LocalStorage)

### Related Personas
- 고객 (Customer)

---

## CUS-005: 장바구니 수량 조절

**Priority**: Must Have

**As a** 고객  
**I want** 장바구니에서 메뉴의 수량을 조절하거나 삭제할 수 있어서  
**So that** 주문 전에 수량을 정확하게 맞출 수 있다

### Description
장바구니 화면에서 각 메뉴의 수량을 증가/감소시키거나, 메뉴를 완전히 삭제할 수 있습니다.

### Acceptance Criteria

**Given** 장바구니에 메뉴가 있을 때  
**When** 수량 증가(+) 버튼을 클릭하면  
**Then** 해당 메뉴의 수량이 1 증가하고 총액이 업데이트된다

**Given** 장바구니에 메뉴가 있을 때  
**When** 수량 감소(-) 버튼을 클릭하면  
**Then** 해당 메뉴의 수량이 1 감소하고 총액이 업데이트된다

**Given** 메뉴 수량이 1일 때  
**When** 수량 감소(-) 버튼을 클릭하면  
**Then** 해당 메뉴가 장바구니에서 삭제된다

**Given** 장바구니에 메뉴가 있을 때  
**When** 삭제(X) 버튼을 클릭하면  
**Then** 해당 메뉴가 즉시 장바구니에서 제거되고 총액이 업데이트된다

**Given** 장바구니가 비어있을 때  
**When** 장바구니 화면을 열면  
**Then** "장바구니가 비어있습니다" 메시지가 표시된다

### Related Personas
- 고객 (Customer)

---

## CUS-006: 장바구니 총액 확인

**Priority**: Must Have

**As a** 고객  
**I want** 장바구니의 총 주문 금액을 실시간으로 볼 수 있어서  
**So that** 주문 전에 총액을 확인할 수 있다

### Description
장바구니 화면에는 각 메뉴의 금액과 전체 총액이 표시됩니다. 수량 변경 시 총액이 실시간으로 업데이트됩니다.

### Acceptance Criteria

**Given** 장바구니에 메뉴가 있을 때  
**When** 장바구니를 열면  
**Then** 각 메뉴의 "수량 x 단가 = 소계"가 표시된다

**Given** 장바구니에 여러 메뉴가 있을 때  
**When** 장바구니를 확인하면  
**Then** 모든 메뉴의 총액이 하단에 명확하게 표시된다

**Given** 메뉴 수량이 변경되면  
**When** 수량이 업데이트되면  
**Then** 총액이 즉시 재계산되어 표시된다

### Related Personas
- 고객 (Customer)

---

## CUS-007: 주문 생성

**Priority**: Must Have

**As a** 고객  
**I want** 장바구니의 메뉴를 주문할 수 있어서  
**So that** 주방에서 음식을 준비할 수 있다

### Description
장바구니에서 "주문하기" 버튼을 누르면 주문이 서버로 전송됩니다. 주문 성공 시 주문번호가 표시되고, 장바구니가 비워지며, 자동으로 메뉴 화면으로 돌아갑니다.

### Acceptance Criteria

**Given** 장바구니에 메뉴가 있을 때  
**When** "주문하기" 버튼을 클릭하면  
**Then** 주문 확인 화면이 표시되고 최종 주문 내역과 총액이 표시된다

**Given** 주문 확인 화면에서  
**When** "확인" 버튼을 클릭하면  
**Then** 주문이 서버로 전송되고 2초 이내에 응답을 받는다

**Given** 주문이 성공하면  
**When** 서버에서 주문 번호를 받으면  
**Then** "주문이 완료되었습니다. 주문번호: XXX" 메시지가 표시된다

**Given** 주문이 완료되면  
**When** 5초 후  
**Then** 장바구니가 비워지고 자동으로 메뉴 화면으로 리다이렉트된다

**Given** 주문이 실패하면  
**When** 서버에서 에러가 반환되면  
**Then** 에러 메시지가 표시되고 장바구니 내용은 유지된다

### Related Personas
- 고객 (Customer)

### Dependencies
- 서버 API: POST /api/customer/orders

---

## CUS-008: 주문 내역 조회

**Priority**: Must Have

**As a** 고객  
**I want** 내가 주문한 내역을 확인할 수 있어서  
**So that** 무엇을 주문했는지 확인하고 추가 주문을 결정할 수 있다

### Description
고객은 현재 테이블 세션의 주문 내역을 시간 순서대로 조회할 수 있습니다. 각 주문의 상태(대기중/준비중/완료)도 확인할 수 있습니다.

### Acceptance Criteria

**Given** 고객이 주문 내역 화면을 열면  
**When** 현재 테이블 세션의 주문이 있으면  
**Then** 주문 시간 역순으로 주문 목록이 표시된다

**Given** 주문 내역이 표시될 때  
**When** 각 주문을 확인하면  
**Then** 주문 번호, 주문 시각, 메뉴 목록, 총액, 상태가 표시된다

**Given** 주문 상태가 변경되면  
**When** 관리자가 상태를 변경하면  
**Then** 고객 화면의 주문 상태가 업데이트된다 (선택사항 - 폴링 또는 실시간)

**Given** 현재 테이블 세션에 주문이 없으면  
**When** 주문 내역 화면을 열면  
**Then** "주문 내역이 없습니다" 메시지가 표시된다

**Given** 이전 세션의 주문 내역은  
**When** 주문 내역을 조회하면  
**Then** 표시되지 않는다 (관리자가 세션 종료 처리한 주문)

### Related Personas
- 고객 (Customer)

---

# 🔧 관리자 (Admin) Stories

---

## ADM-001: 관리자 로그인

**Priority**: Must Have

**As a** 관리자  
**I want** 매장 식별자, 사용자명, 비밀번호로 로그인할 수 있어서  
**So that** 주문 관리 시스템에 접근할 수 있다

### Description
관리자는 매장 식별자, 사용자명, 비밀번호를 입력하여 로그인합니다. 로그인 성공 시 JWT 토큰이 발급되고 HTTP-only Cookie에 저장됩니다. 세션은 16시간 유지됩니다.

### Acceptance Criteria

**Given** 관리자가 로그인 화면에 있을 때  
**When** 매장 식별자, 사용자명, 비밀번호를 입력하고 "로그인" 버튼을 클릭하면  
**Then** 서버가 인증 정보를 검증하고 JWT 토큰을 발급한다

**Given** 로그인이 성공하면  
**When** JWT 토큰을 받으면  
**Then** 토큰이 HTTP-only Cookie에 저장되고 관리자 대시보드로 리다이렉트된다

**Given** 로그인이 실패하면  
**When** 잘못된 인증 정보를 입력하면  
**Then** "로그인 실패: 인증 정보를 확인하세요" 에러 메시지가 표시된다

**Given** 5회 연속 로그인 실패하면  
**When** 5번째 실패 후  
**Then** 5분간 해당 계정이 잠기고 "너무 많은 로그인 시도. 5분 후 다시 시도하세요" 메시지가 표시된다

**Given** 로그인된 상태에서  
**When** 16시간이 경과하면  
**Then** 자동으로 로그아웃되고 로그인 화면으로 리다이렉트된다

**Given** 로그인된 상태에서  
**When** 페이지를 새로고침하면  
**Then** 세션이 유지되고 대시보드가 다시 로드된다

### Related Personas
- 관리자 (Admin)

### Dependencies
- 서버 API: POST /api/admin/login

---

## ADM-002: 실시간 주문 대시보드 조회

**Priority**: Must Have

**As a** 관리자  
**I want** 모든 테이블의 주문 현황을 실시간으로 한눈에 볼 수 있어서  
**So that** 새 주문을 즉시 확인하고 빠르게 대응할 수 있다

### Description
관리자 대시보드는 테이블별 카드 형태로 주문 현황을 표시합니다. SSE를 통해 실시간으로 업데이트되며, 새 주문은 시각적으로 강조됩니다.

### Acceptance Criteria

**Given** 관리자가 대시보드에 접속하면  
**When** 페이지가 로드되면  
**Then** 모든 테이블의 현재 상태가 그리드 형태로 표시된다

**Given** 각 테이블 카드에는  
**When** 테이블 정보가 표시되면  
**Then** 테이블 번호, 총 주문액, 최신 주문 3개 미리보기가 표시된다

**Given** 새로운 주문이 들어오면  
**When** 고객이 주문을 생성하면  
**Then** SSE를 통해 2초 이내에 관리자 화면에 표시되고 시각적으로 강조된다 (색상 변경, 애니메이션)

**Given** 테이블 카드를 클릭하면  
**When** 카드를 선택하면  
**Then** 해당 테이블의 전체 주문 목록이 상세 모달로 표시된다

**Given** 주문 상세 모달에는  
**When** 주문 목록이 표시되면  
**Then** 각 주문의 번호, 시각, 메뉴 목록(전체), 총액, 상태가 표시된다

**Given** 테이블별 필터링 기능이 있어서  
**When** 특정 테이블을 검색하면  
**Then** 해당 테이블만 표시된다

### Related Personas
- 관리자 (Admin)

### Dependencies
- 서버 API: GET /api/admin/orders/stream (SSE)
- 서버 API: GET /api/admin/orders

---

## ADM-003: 주문 상태 변경

**Priority**: Must Have

**As a** 관리자  
**I want** 주문의 상태를 변경할 수 있어서  
**So that** 주문 진행 상황을 관리하고 고객에게 알릴 수 있다

### Description
관리자는 주문 상태를 "대기중" → "준비중" → "완료"로 변경할 수 있습니다. 상태 변경은 즉시 반영됩니다.

### Acceptance Criteria

**Given** 주문 목록에서 주문을 확인할 때  
**When** 주문의 현재 상태가 표시되면  
**Then** "대기중", "준비중", "완료" 중 하나가 표시된다

**Given** 주문 상태를 변경하려면  
**When** 상태 변경 드롭다운 또는 버튼을 클릭하면  
**Then** 가능한 상태 목록이 표시된다

**Given** 새로운 상태를 선택하면  
**When** 상태를 클릭하면  
**Then** 서버에 상태 변경 요청이 전송되고 즉시 UI에 반영된다

**Given** 상태 변경이 실패하면  
**When** 서버 에러가 발생하면  
**Then** 에러 메시지가 표시되고 이전 상태로 롤백된다

### Related Personas
- 관리자 (Admin)

### Dependencies
- 서버 API: PATCH /api/admin/orders/{order_id}/status

---

## EPIC-001: 테이블 관리

**Priority**: Must Have

**Description**: 테이블의 전체 라이프사이클을 관리하는 기능 묶음입니다. 테이블 초기 설정, 주문 삭제, 세션 종료, 과거 내역 조회를 포함합니다.

### Sub-Stories
- ADM-004: 테이블 초기 설정
- ADM-005: 주문 삭제
- ADM-006: 테이블 세션 종료
- ADM-007: 과거 주문 내역 조회

---

## ADM-004: 테이블 초기 설정

**Priority**: Must Have

**As a** 관리자  
**I want** 테이블 태블릿을 초기 설정할 수 있어서  
**So that** 고객이 자동 로그인하여 주문할 수 있다

### Description
관리자는 각 테이블 태블릿에 테이블 번호와 비밀번호를 설정합니다. 이 정보는 태블릿에 저장되어 자동 로그인에 사용됩니다.

### Acceptance Criteria

**Given** 관리자가 테이블 설정 화면에 있을 때  
**When** 테이블 번호와 비밀번호를 입력하고 "설정 완료" 버튼을 클릭하면  
**Then** 서버가 테이블 정보를 검증하고 16시간 세션을 생성한다

**Given** 테이블 설정이 성공하면  
**When** 세션 ID를 받으면  
**Then** 설정 정보가 태블릿 LocalStorage에 저장되고 자동 로그인이 활성화된다

**Given** 테이블 설정이 완료되면  
**When** 관리자가 태블릿을 고객에게 전달하면  
**Then** 고객은 별도 로그인 없이 메뉴 화면을 볼 수 있다

**Given** 테이블 번호가 중복되거나 잘못된 비밀번호를 입력하면  
**When** "설정 완료" 버튼을 클릭하면  
**Then** 에러 메시지가 표시된다

### Related Personas
- 관리자 (Admin)

### Dependencies
- CUS-001: 테이블 자동 로그인 (이 설정이 선행되어야 함)

---

## ADM-005: 주문 삭제

**Priority**: Should Have

**As a** 관리자  
**I want** 잘못된 주문을 삭제할 수 있어서  
**So that** 오류를 정정하고 정확한 주문 내역을 유지할 수 있다

### Description
관리자는 특정 주문을 삭제할 수 있습니다. 삭제 시 확인 팝업이 표시되고, 삭제 후 테이블 총 주문액이 재계산됩니다.

### Acceptance Criteria

**Given** 주문 목록에서  
**When** 주문의 삭제 버튼을 클릭하면  
**Then** "이 주문을 삭제하시겠습니까?" 확인 팝업이 표시된다

**Given** 확인 팝업에서  
**When** "확인" 버튼을 클릭하면  
**Then** 주문이 즉시 삭제되고 주문 목록에서 제거된다

**Given** 주문이 삭제되면  
**When** 삭제 처리가 완료되면  
**Then** 해당 테이블의 총 주문액이 재계산되어 업데이트된다

**Given** 확인 팝업에서  
**When** "취소" 버튼을 클릭하면  
**Then** 팝업이 닫히고 주문은 삭제되지 않는다

**Given** 삭제가 실패하면  
**When** 서버 에러가 발생하면  
**Then** 에러 메시지가 표시되고 주문은 유지된다

### Related Personas
- 관리자 (Admin)

### Dependencies
- 서버 API: DELETE /api/admin/orders/{order_id}

---

## ADM-006: 테이블 세션 종료

**Priority**: Must Have

**As a** 관리자  
**I want** 고객이 식사를 마치면 테이블 세션을 종료할 수 있어서  
**So that** 다음 고객이 깨끗한 상태에서 시작할 수 있다

### Description
관리자는 "이용 완료" 버튼을 눌러 테이블 세션을 종료합니다. 세션 종료 시 현재 주문 내역이 과거 이력으로 이동하고, 테이블 현재 주문 목록과 총액이 0으로 리셋됩니다.

### Acceptance Criteria

**Given** 테이블 카드 또는 상세 화면에서  
**When** "이용 완료" 버튼을 클릭하면  
**Then** "이 테이블의 세션을 종료하시겠습니까?" 확인 팝업이 표시된다

**Given** 확인 팝업에서  
**When** "확인" 버튼을 클릭하면  
**Then** 해당 세션의 모든 주문이 과거 이력(OrderHistory)으로 이동된다

**Given** 세션이 종료되면  
**When** 과거 이력으로 이동이 완료되면  
**Then** 테이블의 현재 주문 목록이 비워지고 총 주문액이 0으로 리셋된다

**Given** 세션이 종료되면  
**When** 새 고객이 해당 테이블 태블릿을 사용하면  
**Then** 이전 주문 내역 없이 새로운 세션으로 시작된다

**Given** 확인 팝업에서  
**When** "취소" 버튼을 클릭하면  
**Then** 팝업이 닫히고 세션은 종료되지 않는다

### Related Personas
- 관리자 (Admin)

### Dependencies
- 서버 API: POST /api/admin/tables/{table_id}/complete

---

## ADM-007: 과거 주문 내역 조회

**Priority**: Should Have

**As a** 관리자  
**I want** 과거 주문 내역을 조회할 수 있어서  
**So that** 이전 세션의 주문 기록을 확인할 수 있다

### Description
관리자는 "과거 내역" 버튼을 눌러 테이블별 과거 주문 목록을 조회할 수 있습니다. 날짜별 필터링이 가능합니다.

### Acceptance Criteria

**Given** 테이블 관리 화면에서  
**When** "과거 내역" 버튼을 클릭하면  
**Then** 과거 주문 내역 모달이 열린다

**Given** 과거 내역 모달에서  
**When** 테이블을 선택하면  
**Then** 해당 테이블의 과거 주문 목록이 시간 역순으로 표시된다

**Given** 각 과거 주문에는  
**When** 주문 정보가 표시되면  
**Then** 주문 번호, 주문 시각, 메뉴 목록, 총액, 매장 이용 완료 시각이 표시된다

**Given** 날짜 필터가 있어서  
**When** 특정 날짜를 선택하면  
**Then** 해당 날짜의 주문만 표시된다

**Given** 과거 내역 모달에서  
**When** "닫기" 버튼을 클릭하면  
**Then** 모달이 닫히고 대시보드로 돌아간다

### Related Personas
- 관리자 (Admin)

### Dependencies
- 서버 API: GET /api/admin/orders/history

---

## EPIC-002: 메뉴 관리

**Priority**: Must Have

**Description**: 매장의 메뉴를 관리하는 CRUD 기능 묶음입니다. 메뉴 조회, 등록, 수정, 삭제를 포함합니다.

### Sub-Stories
- ADM-008: 메뉴 목록 조회
- ADM-009: 메뉴 등록
- ADM-010: 메뉴 수정
- ADM-011: 메뉴 삭제

---

## ADM-008: 메뉴 목록 조회

**Priority**: Must Have

**As a** 관리자  
**I want** 현재 등록된 모든 메뉴를 조회할 수 있어서  
**So that** 메뉴 현황을 파악하고 관리할 수 있다

### Description
관리자는 메뉴 관리 화면에서 카테고리별로 메뉴를 조회할 수 있습니다.

### Acceptance Criteria

**Given** 관리자가 메뉴 관리 화면에 접속하면  
**When** 페이지가 로드되면  
**Then** 모든 메뉴가 카테고리별로 그룹화되어 표시된다

**Given** 각 메뉴에는  
**When** 메뉴 정보가 표시되면  
**Then** 메뉴명, 가격, 카테고리, 설명, 이미지 URL, 노출 순서가 표시된다

**Given** 메뉴가 많을 경우  
**When** 스크롤하면  
**Then** 페이지네이션 또는 무한 스크롤로 메뉴를 로드한다

### Related Personas
- 관리자 (Admin)

### Dependencies
- 서버 API: GET /api/admin/menus

---

## ADM-009: 메뉴 등록

**Priority**: Must Have

**As a** 관리자  
**I want** 새로운 메뉴를 등록할 수 있어서  
**So that** 고객이 새 메뉴를 주문할 수 있다

### Description
관리자는 메뉴명, 가격, 설명, 카테고리, 이미지 URL을 입력하여 새 메뉴를 등록합니다.

### Acceptance Criteria

**Given** 메뉴 관리 화면에서  
**When** "메뉴 추가" 버튼을 클릭하면  
**Then** 메뉴 등록 폼이 표시된다

**Given** 메뉴 등록 폼에서  
**When** 메뉴명, 가격, 카테고리를 입력하고 "저장" 버튼을 클릭하면  
**Then** 새 메뉴가 데이터베이스에 저장되고 메뉴 목록에 추가된다

**Given** 메뉴 등록 시  
**When** 필수 필드(메뉴명, 가격, 카테고리)가 누락되면  
**Then** "필수 항목을 입력하세요" 에러 메시지가 표시된다

**Given** 메뉴 등록 시  
**When** 가격이 0 미만이면  
**Then** "가격은 0 이상이어야 합니다" 에러 메시지가 표시된다

**Given** 메뉴 등록이 성공하면  
**When** 저장이 완료되면  
**Then** "메뉴가 등록되었습니다" 성공 메시지가 표시되고 메뉴 목록 화면으로 돌아간다

### Related Personas
- 관리자 (Admin)

### Dependencies
- 서버 API: POST /api/admin/menus

---

## ADM-010: 메뉴 수정

**Priority**: Must Have

**As a** 관리자  
**I want** 기존 메뉴 정보를 수정할 수 있어서  
**So that** 가격 변경이나 설명 업데이트를 반영할 수 있다

### Description
관리자는 메뉴 목록에서 특정 메뉴를 선택하여 정보를 수정할 수 있습니다.

### Acceptance Criteria

**Given** 메뉴 목록에서  
**When** 메뉴의 "수정" 버튼을 클릭하면  
**Then** 메뉴 수정 폼이 열리고 기존 정보가 자동으로 채워진다

**Given** 메뉴 수정 폼에서  
**When** 정보를 변경하고 "저장" 버튼을 클릭하면  
**Then** 변경 사항이 데이터베이스에 저장되고 메뉴 목록이 업데이트된다

**Given** 메뉴 수정 시  
**When** 유효성 검증 실패하면  
**Then** 해당 에러 메시지가 표시된다

**Given** 메뉴 수정이 성공하면  
**When** 저장이 완료되면  
**Then** "메뉴가 수정되었습니다" 성공 메시지가 표시된다

### Related Personas
- 관리자 (Admin)

### Dependencies
- 서버 API: PUT /api/admin/menus/{menu_id}

---

## ADM-011: 메뉴 삭제

**Priority**: Must Have

**As a** 관리자  
**I want** 더 이상 제공하지 않는 메뉴를 삭제할 수 있어서  
**So that** 고객이 주문 불가능한 메뉴를 보지 않게 할 수 있다

### Description
관리자는 메뉴 목록에서 특정 메뉴를 삭제할 수 있습니다. 삭제 시 확인 팝업이 표시됩니다.

### Acceptance Criteria

**Given** 메뉴 목록에서  
**When** 메뉴의 "삭제" 버튼을 클릭하면  
**Then** "이 메뉴를 삭제하시겠습니까?" 확인 팝업이 표시된다

**Given** 확인 팝업에서  
**When** "확인" 버튼을 클릭하면  
**Then** 메뉴가 삭제되고 메뉴 목록에서 제거된다

**Given** 메뉴 삭제가 성공하면  
**When** 삭제 처리가 완료되면  
**Then** "메뉴가 삭제되었습니다" 성공 메시지가 표시된다

**Given** 확인 팝업에서  
**When** "취소" 버튼을 클릭하면  
**Then** 팝업이 닫히고 메뉴는 삭제되지 않는다

### Related Personas
- 관리자 (Admin)

### Dependencies
- 서버 API: DELETE /api/admin/menus/{menu_id}

---

# ⚙️ 기술 (Technical) Stories

---

## TECH-001: 데이터베이스 및 시드 데이터 설정

**Priority**: Must Have

**As a** 개발자  
**I want** 데이터베이스 스키마와 초기 시드 데이터를 설정할 수 있어서  
**So that** 개발 및 테스트 환경에서 즉시 시스템을 사용할 수 있다

### Description
SQLite 데이터베이스 스키마를 생성하고, 개발/테스트를 위한 초기 시드 데이터(매장, 테이블, 관리자, 메뉴 카테고리, 샘플 메뉴)를 자동으로 삽입합니다.

### Acceptance Criteria

**Given** 데이터베이스가 없을 때  
**When** 애플리케이션을 시작하면  
**Then** SQLite 데이터베이스 파일이 자동으로 생성된다

**Given** 데이터베이스 스키마가  
**When** 생성되면  
**Then** Store, Table, TableSession, Admin, MenuCategory, Menu, Order, OrderItem, OrderHistory 테이블이 생성된다

**Given** 시드 데이터 스크립트가  
**When** 실행되면  
**Then** 다음이 자동으로 삽입된다:
- 샘플 매장 1개
- 샘플 테이블 5개 (테이블 1-5)
- 샘플 관리자 계정 1개
- 메뉴 카테고리 3개 (메인, 음료, 디저트)
- 각 카테고리별 샘플 메뉴 3개 (총 9개)

**Given** 시드 데이터가 삽입되면  
**When** 애플리케이션을 시작하면  
**Then** 즉시 로그인 및 주문 테스트가 가능하다

**Given** 시드 데이터가 이미 존재하면  
**When** 스크립트를 재실행하면  
**Then** 중복 삽입이 방지되거나 데이터가 초기화된다 (옵션)

### Related Personas
- 개발자 (Developer)

### Dependencies
- SQLAlchemy, Alembic 설정
- 시드 데이터 스크립트 작성

---

## Story Statistics

### By Persona
- **고객 (Customer)**: 8 stories
- **관리자 (Admin)**: 11 stories (2 epics 포함)
- **기술 (Technical)**: 1 story
- **Total**: 20 stories

### By Priority (MoSCoW)
- **Must Have**: 17 stories
- **Should Have**: 3 stories
- **Could Have**: 0 stories
- **Won't Have**: 0 stories

### By Epic
- **EPIC-001: 테이블 관리**: 4 sub-stories
- **EPIC-002: 메뉴 관리**: 4 sub-stories

---

## INVEST Criteria Compliance

모든 User Stories는 INVEST 기준을 준수합니다:

- **I**ndependent: 각 Story는 독립적으로 개발 및 테스트 가능 (일부 의존성 명시)
- **N**egotiable: Story 구현 방법은 협상 가능
- **V**aluable: 각 Story는 사용자에게 명확한 가치 제공
- **E**stimable: 3-5일 개발 단위로 추정 가능
- **S**mall: 한 Sprint 내 완료 가능한 크기
- **T**estable: 명확한 Acceptance Criteria로 테스트 가능

---

## Next Steps

이 User Stories를 기반으로:
1. **Workflow Planning**: 개발 순서 및 우선순위 결정
2. **Application Design**: 컴포넌트 및 서비스 설계
3. **Units Generation**: 개발 단위(유닛) 분해
4. **Code Generation**: 실제 코드 구현

User Stories는 프로젝트 전체에 걸쳐 참조되며, 구현 및 테스트의 기준이 됩니다.
