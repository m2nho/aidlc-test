# Customer Frontend

고객용 테이블 오더 프론트엔드 애플리케이션

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript (strict mode)
- **State Management**: React Context API
- **UI Framework**: Tailwind CSS + HeadlessUI
- **Routing**: React Router v6
- **HTTP Client**: fetch API
- **Testing**: Vitest + React Testing Library

## Features

- ✅ 테이블 자동 로그인 (CUS-001)
- ✅ 메뉴 목록 조회 (CUS-002)
- ✅ 메뉴 카테고리 필터링 (CUS-003)
- ✅ 장바구니 담기 (CUS-004)
- ✅ 장바구니 수량 조정 (CUS-005)
- ✅ 주문 생성 (CUS-006)
- ✅ 주문 내역 조회 (CUS-007)
- ✅ 주문 상태 표시 (CUS-008)

## Setup

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

### Development

```bash
# Run with Mock API (default)
npm run dev

# The app will be available at http://localhost:5173
```

### Running with Real API

```bash
# Update .env.local
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000

# Run dev server
npm run dev
```

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test:coverage

# Coverage threshold: 60%
```

## Build

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### 5-Layer Architecture

```
src/
├── presentation/       # UI Components
│   ├── pages/         # Page components (4)
│   ├── features/      # Feature components (4)
│   └── common/        # Common components (5)
├── business-logic/    # Business Logic
│   ├── context/       # React Context
│   ├── hooks/         # Custom hooks
│   └── validators/    # Business validators
├── data-access/       # Data Access
│   ├── api.ts         # API client interface
│   ├── mockApi.ts     # Mock API implementation
│   ├── realApi.ts     # Real API implementation
│   ├── types.ts       # TypeScript types (Day 0 Contract)
│   └── localStorageManager.ts
├── utility/           # Utilities
│   ├── constants.ts
│   ├── formatters.ts
│   └── validators.ts
└── infrastructure/    # Infrastructure
    ├── Router.tsx
    ├── ErrorBoundary.tsx
    └── Logger.ts
```

## Mock API

Mock API는 Backend 없이 독립적으로 개발할 수 있도록 지원합니다:

- Day 0 Contract 준수
- 500ms 네트워크 지연 시뮬레이션
- 9개 메뉴, 3개 카테고리 샘플 데이터
- 에러 시나리오 시뮬레이션 (401, 404, 500)

## Story Coverage

모든 User Story는 Mock API 환경에서 완전히 작동합니다.

| Story ID | Title | Status |
|---|---|---|
| CUS-001 | 테이블 자동 로그인 | ✅ Implemented |
| CUS-002 | 메뉴 목록 조회 | ✅ Implemented |
| CUS-003 | 메뉴 카테고리 필터링 | ✅ Implemented |
| CUS-004 | 장바구니 담기 | ✅ Implemented |
| CUS-005 | 장바구니 수량 조정 | ✅ Implemented |
| CUS-006 | 주문 생성 | ✅ Implemented |
| CUS-007 | 주문 내역 조회 | ✅ Implemented |
| CUS-008 | 주문 상태 표시 | ✅ Implemented |

## License

Private - Table Order Service MVP
