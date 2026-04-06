# Unit 3: Admin Frontend - Tech Stack Decisions

**Unit**: Admin Frontend  
**Phase**: CONSTRUCTION - NFR Requirements Assessment  
**Date**: 2026-04-06

---

## Tech Stack Overview

Admin Frontend의 기술 스택 결정과 그 근거를 문서화합니다.

---

## Core Technology Stack

### 1. Framework: React 18+

**Decision**: React 18.2+

**Rationale**:
- ✅ 요구사항에서 이미 결정됨
- ✅ 성숙한 생태계, 풍부한 라이브러리
- ✅ Virtual DOM으로 성능 최적화
- ✅ 컴포넌트 기반 아키텍처
- ✅ Hooks로 상태 관리 간단
- ✅ Concurrent Features (React 18)

**Alternatives Considered**:
- Vue 3: 러닝 커브 낮지만 생태계 작음
- Angular: 엔터프라이즈급이지만 무거움
- Svelte: 경량이지만 생태계 작음

**Version**: `^18.2.0`

---

### 2. Language: TypeScript

**Decision**: TypeScript 5+ with Strict Mode

**Rationale**:
- ✅ 타입 안전성으로 런타임 에러 방지
- ✅ IDE 자동완성 및 IntelliSense
- ✅ 리팩토링 용이
- ✅ Day 0 Contract 타입 정의 활용
- ✅ Strict Mode로 최대 안전성

**Strict Mode Configuration**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**Alternatives Considered**:
- JavaScript: 빠르지만 타입 안전성 없음

**Version**: `^5.0.0`

---

### 3. Build Tool: Vite

**Decision**: Vite 4+

**Rationale**:
- ✅ 요구사항에서 이미 결정됨
- ✅ 초고속 HMR (Hot Module Replacement)
- ✅ ES Modules 기반, 번들 크기 작음
- ✅ TypeScript, JSX 기본 지원
- ✅ Code Splitting 자동
- ✅ Tree Shaking 최적화

**Configuration**:
```js
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
```

**Alternatives Considered**:
- Create React App (CRA): 느리고 무거움
- Webpack: 복잡한 설정, 느린 빌드

**Version**: `^4.5.0`

---

### 4. Routing: React Router

**Decision**: react-router-dom 6+

**Rationale**:
- ✅ 요구사항에서 이미 결정됨
- ✅ React 표준 라우팅 라이브러리
- ✅ Declarative routing
- ✅ Nested routes
- ✅ Protected routes 구현 쉬움

**Version**: `^6.16.0`

---

### 5. State Management: React Context API

**Decision**: React Context API + useReducer

**Rationale**:
- ✅ 요구사항에서 이미 결정됨
- ✅ Redux 불필요 (1-5명 동시 사용자)
- ✅ React 내장, 추가 라이브러리 불필요
- ✅ MVP에 충분
- ✅ Single Context (AdminAppContext)

**Alternatives Considered**:
- Redux: 오버엔지니어링 (작은 규모)
- Zustand: 경량이지만 불필요
- Jotai: 원자적 상태, 복잡도 증가

**Migration Path**: 다중 매장 지원 시 Redux Toolkit 고려

---

### 6. HTTP Client: Fetch API

**Decision**: Native Fetch API

**Rationale**:
- ✅ 요구사항에서 이미 결정됨
- ✅ 브라우저 내장, 추가 라이브러리 불필요
- ✅ Async/Await 지원
- ✅ Modern 브라우저 모두 지원
- ✅ Mock API 전환 쉬움

**Alternatives Considered**:
- Axios: 더 많은 기능이지만 불필요
- React Query: 캐싱 강력하지만 오버엔지니어링

---

### 7. SSE Client: EventSource API

**Decision**: Native EventSource API

**Rationale**:
- ✅ 요구사항에서 이미 결정됨
- ✅ 브라우저 내장, SSE 표준
- ✅ Automatic reconnection (일부 브라우저)
- ✅ useSSE Hook으로 캡슐화

**Custom Reconnection**: Exponential Backoff (1s, 2s, 4s, 8s, 16s)

**Alternatives Considered**:
- WebSocket: 양방향이지만 SSE로 충분
- Polling: 비효율적

---

## UI & Styling Stack

### 8. CSS Framework: Tailwind CSS

**Decision**: Tailwind CSS 3+

**Rationale**:
- ✅ 유틸리티 우선 (Utility-First)
- ✅ 빠른 개발 속도
- ✅ 일관된 디자인 시스템
- ✅ 반응형 쉬움 (`md:`, `lg:`)
- ✅ PurgeCSS로 사용하지 않는 CSS 제거
- ✅ 작은 번들 크기

**Configuration**:
```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B'
      }
    }
  },
  plugins: []
}
```

**Alternatives Considered**:
- Vanilla CSS: 일관성 낮음, 유지보수 어려움
- CSS Modules: 스코프 격리 좋지만 Tailwind보다 느림
- Styled Components: CSS-in-JS, 런타임 오버헤드
- Material-UI: 무겁고 커스터마이징 어려움

**Version**: `^3.3.0`

---

### 9. UI Component Library: None (Custom)

**Decision**: UI 라이브러리 사용 안 함, 직접 구현

**Rationale**:
- ✅ MVP 단계, 커스텀 컴포넌트로 충분
- ✅ 번들 크기 최소화
- ✅ 완전한 커스터마이징
- ✅ 학습 곡선 없음
- ✅ 17개 컴포넌트만 필요

**Custom Components**:
- Button, Modal, LoadingSpinner, EmptyState
- 모두 Tailwind CSS로 스타일링

**Alternatives Considered**:
- Material-UI (MUI): 무겁고 번들 크기 큼
- Ant Design: 엔터프라이즈급이지만 오버엔지니어링
- Headless UI: 고려 가능하지만 MVP에 불필요

**Migration Path**: 향후 필요 시 Headless UI 또는 shadcn/ui 고려

---

## Testing Stack

### 10. Unit Testing: Vitest + React Testing Library

**Decision**: Vitest 0.34+ + React Testing Library

**Rationale**:
- ✅ Vite와 완벽한 통합
- ✅ Jest 호환 API
- ✅ 초고속 실행
- ✅ ES Modules 지원
- ✅ React Testing Library는 표준

**Configuration**:
```js
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html'],
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    }
  }
});
```

**Test Coverage Target**: 70%

**Alternatives Considered**:
- Jest: 느리고 Vite와 통합 어려움
- Testing Library 단독: 테스트 러너 필요

**Versions**:
- vitest: `^0.34.0`
- @testing-library/react: `^14.0.0`
- @testing-library/jest-dom: `^6.0.0`

---

### 11. E2E Testing: None (MVP)

**Decision**: E2E 테스트 생략

**Rationale**:
- ✅ MVP 단계, 단위 테스트로 충분
- ✅ 개발 속도 우선
- ✅ 통합 테스트로 주요 플로우 커버

**Alternatives Considered**:
- Playwright: 강력하지만 MVP에 과함
- Cypress: 인기 있지만 시간 소요

**Migration Path**: 프로덕션 단계에서 Playwright 추가 고려

---

## Code Quality Stack

### 12. Linting: ESLint

**Decision**: ESLint 8+ with TypeScript, React plugins

**Rationale**:
- ✅ JavaScript/TypeScript 표준 린터
- ✅ 코드 품질 보장
- ✅ 일관된 코드 스타일
- ✅ 자동 수정 가능

**Configuration**:
```js
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'react/react-in-jsx-scope': 'off' // React 17+
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

**Version**: `^8.50.0`

---

### 13. Formatting: Prettier

**Decision**: Prettier 3+

**Rationale**:
- ✅ 자동 코드 포맷팅
- ✅ 일관된 스타일
- ✅ ESLint와 통합
- ✅ Git hooks로 자동화

**Configuration**:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

**Version**: `^3.0.0`

---

### 14. Git Hooks: Husky + lint-staged

**Decision**: Husky + lint-staged

**Rationale**:
- ✅ 커밋 전 자동 린팅/포맷팅
- ✅ 코드 품질 보장
- ✅ 변경된 파일만 체크 (빠름)

**Configuration**:
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

```sh
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**Versions**:
- husky: `^8.0.0`
- lint-staged: `^14.0.0`

---

## Development Tools

### 15. Package Manager: npm

**Decision**: npm (Node.js 기본)

**Rationale**:
- ✅ Node.js 기본 제공
- ✅ 안정적이고 성숙
- ✅ package-lock.json

**Alternatives Considered**:
- yarn: 빠르지만 추가 설치 필요
- pnpm: 디스크 효율적이지만 호환성 이슈

---

### 16. Environment Variables: .env

**Decision**: Vite .env files

**Files**:
- `.env` - 기본값
- `.env.local` - 로컬 오버라이드 (git ignore)
- `.env.production` - 프로덕션

**Configuration**:
```bash
# .env
VITE_USE_MOCK_API=true
VITE_API_URL=http://localhost:8000

# .env.production
VITE_USE_MOCK_API=false
VITE_API_URL=https://api.production.com
```

**Access**:
```tsx
const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Deployment Stack (향후)

### 17. Static Hosting: TBD

**Options**:
- Vercel (추천)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**MVP**: 로컬 서버 (`npm run dev`)

---

### 18. CI/CD: None (MVP)

**Decision**: CI/CD 파이프라인 없음

**Reason**: MVP 단계, 수동 배포

**향후 고려사항**:
- GitHub Actions
- GitLab CI
- Jenkins

---

## Monitoring & Error Tracking (향후)

### 19. Error Tracking: None (MVP)

**Decision**: 브라우저 콘솔만 사용

**Reason**: MVP 단계, 외부 서비스 불필요

**향후 고려사항**:
- Sentry
- LogRocket
- Rollbar

---

### 20. Analytics: None (MVP)

**Decision**: 분석 도구 없음

**Reason**: MVP 단계

**향후 고려사항**:
- Google Analytics
- Mixpanel
- Amplitude

---

## Tech Stack Summary Table

| Category | Technology | Version | Rationale |
|---|---|---|---|
| **Framework** | React | 18.2+ | 요구사항, 성숙한 생태계 |
| **Language** | TypeScript | 5.0+ | 타입 안전성, Strict Mode |
| **Build Tool** | Vite | 4.5+ | 초고속, ES Modules |
| **Routing** | react-router-dom | 6.16+ | 표준 라우팅 |
| **State** | React Context | Built-in | MVP 충분 |
| **HTTP** | Fetch API | Built-in | 브라우저 내장 |
| **SSE** | EventSource | Built-in | SSE 표준 |
| **CSS** | Tailwind CSS | 3.3+ | 빠른 개발, 작은 번들 |
| **UI Library** | None (Custom) | - | MVP 충분 |
| **Testing** | Vitest + RTL | 0.34+ / 14.0+ | Vite 통합, 표준 |
| **Linting** | ESLint | 8.50+ | 코드 품질 |
| **Formatting** | Prettier | 3.0+ | 자동 포맷팅 |
| **Git Hooks** | Husky + lint-staged | 8.0+ / 14.0+ | 커밋 전 체크 |
| **Package Manager** | npm | - | Node.js 기본 |

---

## Dependencies List

### Production Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0"
  }
}
```

### Dev Dependencies

```json
{
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.50.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0",
    "postcss": "^8.4.0",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "vite": "^4.5.0",
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^22.0.0"
  }
}
```

---

## Tech Stack Decision Matrix

| Decision Factor | Weight | Tailwind | Vanilla CSS | Styled Components |
|---|---|---|---|---|
| Development Speed | 30% | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Bundle Size | 25% | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Maintainability | 25% | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Learning Curve | 20% | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Total Score** | | **4.55** | **3.15** | **3.35** |

**Winner**: Tailwind CSS

---

## Migration Paths

### If Scaling Up:
1. **State Management**: React Context → Redux Toolkit
2. **UI Library**: Custom → Headless UI or shadcn/ui
3. **Testing**: Unit tests → + E2E (Playwright)
4. **Error Tracking**: Console → Sentry
5. **Hosting**: Local → Vercel/Netlify
6. **CI/CD**: Manual → GitHub Actions

### If Performance Issues:
1. **Caching**: Add React Query
2. **Virtualization**: Add react-window
3. **Image Optimization**: Add next/image or similar

---

## Tech Stack Justification Summary

**Philosophy**: "Keep it simple, ship fast"

**Principles**:
1. ✅ Use browser-native APIs when possible (Fetch, EventSource)
2. ✅ Avoid over-engineering for MVP
3. ✅ Choose tools with great DX (Vite, Tailwind)
4. ✅ Ensure type safety (TypeScript Strict)
5. ✅ Optimize for bundle size (Tree shaking, Code splitting)
6. ✅ Maintain code quality (ESLint, Prettier, Tests)

**Result**: Lightweight, fast, maintainable stack for MVP
