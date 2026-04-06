# Day 0 Contract - Table Order Service

3개 유닛(Backend, Customer Frontend, Admin Frontend)의 병렬 개발을 위한 사전 합의 아티팩트입니다.

---

## Overview

**Day 0 Contract**는 개발 시작 전 모든 개발자가 합의하는 인터페이스 계약입니다. 이를 통해 각 유닛이 완전히 독립적으로 개발할 수 있습니다.

---

## Contract Components

### 1. API Contract (`api-contract.yaml`)

**형식**: OpenAPI 3.0  
**용도**: Backend와 Frontend 간 API 인터페이스 정의

**포함 내용**:
- 모든 API 엔드포인트 (Auth, Orders, Tables, Menus, SSE)
- 요청/응답 스키마
- HTTP 메서드 및 상태 코드
- 에러 응답 형식

**사용 방법**:
- **Backend 개발자**: 이 스펙에 맞춰 실제 API 구현
- **Frontend 개발자**: 이 스펙을 기반으로 Mock API 구현

**검증 도구**:
- Swagger UI: `https://editor.swagger.io/` (api-contract.yaml 업로드)
- Postman: OpenAPI 파일 Import

---

### 2. Database Schema (`database-schema.md`)

**형식**: Markdown (ERD + 테이블 정의)  
**용도**: Backend 데이터베이스 구조 정의

**포함 내용**:
- 9개 테이블 스키마
- Foreign Key 관계
- 인덱스 정의
- 비즈니스 규칙

**사용 방법**:
- **Backend 개발자**: SQLAlchemy 모델 생성 시 참조
- **Frontend 개발자**: 데이터 구조 이해 및 Mock Data 생성 시 참조

---

### 3. Mock Data Samples (`mock-data-samples.json`)

**형식**: JSON  
**용도**: Frontend Mock API 구현 시 사용할 샘플 데이터

**포함 내용**:
- 각 테이블의 샘플 데이터 (stores, menus, orders 등)
- API 응답 예시 (api_responses)
- 에러 응답 예시

**사용 방법**:
- **Frontend 개발자**: 이 데이터를 기반으로 Mock API 응답 구현
- **Backend 개발자**: 시드 데이터 생성 시 참조

---

### 4. TypeScript Types (`typescript-types.ts`)

**형식**: TypeScript  
**용도**: Frontend에서 사용할 타입 정의

**포함 내용**:
- Domain Entity 타입 (Store, Menu, Order 등)
- API Request/Response 타입
- SSE Event 타입
- Error 타입
- Utility 타입 (Cart, AuthUser 등)

**사용 방법**:
- **Frontend 개발자**: 프로젝트에 복사하여 타입 안정성 확보
- React 컴포넌트에서 import하여 사용

```typescript
import { Menu, Order, CreateOrderRequest } from './types';
```

---

## Usage by Role

### Backend Developer (Unit 1)

**독립 개발 전략**:
1. ✅ **API Contract 구현**: api-contract.yaml의 모든 엔드포인트 구현
2. ✅ **Database Schema 구현**: database-schema.md에 따라 SQLAlchemy 모델 생성
3. ✅ **시드 데이터 생성**: mock-data-samples.json을 참고하여 seed script 작성
4. ✅ **Postman 테스트**: api-contract.yaml을 Import하여 API 테스트

**Frontend 의존성 없음**: 시드 데이터 + Postman으로 완전 독립 개발

---

### Customer Frontend Developer (Unit 2)

**독립 개발 전략**:
1. ✅ **TypeScript Types 설치**: typescript-types.ts를 프로젝트에 복사
2. ✅ **Mock API 구현**: api-contract.yaml + mock-data-samples.json 기반으로 Mock API 작성
3. ✅ **컴포넌트 개발**: Mock API를 호출하는 React 컴포넌트 개발
4. ✅ **환경 변수 설정**: `.env`에서 `REACT_APP_USE_MOCK=true` 설정

**Backend 의존성 없음**: Mock API로 완전 독립 개발

**Mock API 예시**:
```typescript
// src/api/mockApi.ts
import { CreateOrderRequest, CreateOrderResponse } from './types';
import mockData from './mock-data-samples.json';

export const mockApi = {
  createOrder: async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock order
    return mockData.api_responses.orders.order_created;
  }
};
```

---

### Admin Frontend Developer (Unit 3)

**독립 개발 전략**:
1. ✅ **TypeScript Types 설치**: typescript-types.ts를 프로젝트에 복사
2. ✅ **Mock API 구현**: api-contract.yaml + mock-data-samples.json 기반
3. ✅ **Mock SSE 구현**: SSE 이벤트 시뮬레이션
4. ✅ **컴포넌트 개발**: Mock API + Mock SSE를 사용하는 React 컴포넌트 개발

**Backend 의존성 없음**: Mock API + Mock SSE로 완전 독립 개발

**Mock SSE 예시**:
```typescript
// src/api/mockSSE.ts
import { SSEEvent } from './types';

export function createMockSSE(onEvent: (event: SSEEvent) => void): () => void {
  const interval = setInterval(() => {
    // Simulate SSE event every 5 seconds
    const mockEvent: SSEEvent = {
      type: 'order_created',
      order: {
        id: Math.floor(Math.random() * 1000),
        order_number: Math.floor(Math.random() * 100),
        table_number: Math.floor(Math.random() * 10) + 1,
        status: 'pending',
        items: []
      }
    };
    onEvent(mockEvent);
  }, 5000);
  
  // Return unsubscribe function
  return () => clearInterval(interval);
}
```

---

## Integration Strategy

### Week 1-2: 완전 독립 개발

```
Developer 1 (Backend)       Developer 2 (Customer)      Developer 3 (Admin)
     │                           │                          │
     │ Unit 1 Code Gen           │ Unit 2 Code Gen          │ Unit 3 Code Gen
     │                           │                          │
     ├─ Seed Data                ├─ Mock API                ├─ Mock API
     ├─ Postman Test             ├─ Components              ├─ Mock SSE
     │                           │                          ├─ Components
     │                           │                          │
     ▼                           ▼                          ▼
  Backend Complete          Customer Complete          Admin Complete
```

### Week 3: 통합

```
1. Frontend 환경 변수 변경
   - .env: REACT_APP_USE_MOCK=false
   - .env: REACT_APP_API_URL=http://localhost:8000

2. Backend + Frontend 연동 테스트
   - Customer: 로그인 → 메뉴 조회 → 주문 생성
   - Admin: 로그인 → 주문 목록 → 상태 변경 → SSE 수신

3. 통합 테스트 및 버그 수정
```

---

## Contract Validation

### API Contract 검증

**도구**: Swagger UI, Postman

**검증 항목**:
- [ ] 모든 엔드포인트가 정의되어 있는가?
- [ ] 요청/응답 스키마가 명확한가?
- [ ] 에러 응답이 정의되어 있는가?
- [ ] 인증 방식이 명시되어 있는가?

### Database Schema 검증

**도구**: SQLAlchemy, ERD Viewer

**검증 항목**:
- [ ] 모든 테이블이 정의되어 있는가?
- [ ] Foreign Key 관계가 명확한가?
- [ ] 인덱스가 적절히 정의되어 있는가?
- [ ] 비즈니스 규칙이 명시되어 있는가?

### TypeScript Types 검증

**도구**: TypeScript Compiler

**검증 항목**:
- [ ] 모든 Entity 타입이 정의되어 있는가?
- [ ] API Request/Response 타입이 일치하는가?
- [ ] SSE Event 타입이 정의되어 있는가?

---

## Contract Change Management

**원칙**: Day 0 Contract는 개발 시작 후 변경하지 않는 것이 이상적입니다.

**불가피한 변경 시**:
1. 모든 개발자에게 변경 사항 공지
2. 각 유닛에서 변경사항 반영
3. 통합 테스트 재수행

**변경 이력**:
- 2026-04-06: Initial Day 0 Contract 생성

---

## FAQ

### Q1: Mock API와 실제 API의 차이점은?

**Mock API**:
- 클라이언트 사이드에서 동작 (no network)
- mock-data-samples.json의 정적 데이터 반환
- 시뮬레이션된 지연 시간

**실제 API**:
- 서버 사이드에서 동작 (network required)
- 데이터베이스에서 동적 데이터 조회
- 실제 네트워크 지연 시간

### Q2: SSE를 Mock으로 구현하는 방법은?

`setInterval`을 사용하여 주기적으로 이벤트 발생 시뮬레이션:

```typescript
const interval = setInterval(() => {
  onEvent(mockEvent);
}, 5000); // 5초마다 이벤트 발생
```

### Q3: Contract 변경이 필요하면 어떻게 하나요?

1. 변경 제안을 모든 개발자와 공유
2. 합의 후 Day 0 Contract 수정
3. 각 유닛에서 변경사항 반영
4. 변경 이력 문서화

### Q4: 통합 시점은 언제인가요?

- **Week 1-2**: 완전 독립 개발 (Mock 사용)
- **Week 3**: 통합 테스트 (실제 API 사용)

---

## Summary

| 파일 | 용도 | Backend | Customer Frontend | Admin Frontend |
|------|------|---------|-------------------|----------------|
| `api-contract.yaml` | API 인터페이스 | ✅ 구현 | ✅ Mock 구현 | ✅ Mock 구현 |
| `database-schema.md` | DB 구조 | ✅ 구현 | 참조 | 참조 |
| `mock-data-samples.json` | 샘플 데이터 | 참조 | ✅ Mock 데이터 | ✅ Mock 데이터 |
| `typescript-types.ts` | 타입 정의 | - | ✅ 사용 | ✅ 사용 |

---

**Day 0 Contract Complete** - 병렬 개발 준비 완료
