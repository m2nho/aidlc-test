# Table Order Service - Admin Frontend

관리자용 웹 애플리케이션 (React + TypeScript + Vite)

---

## 프로젝트 개요

테이블 주문 시스템의 관리자 대시보드. 실시간 주문 현황 조회, 주문 상태 관리, 테이블 관리, 메뉴 관리 기능을 제공합니다.

### 주요 기능
- ✅ 관리자 로그인 (JWT 인증)
- ✅ 실시간 주문 대시보드 (SSE)
- ⏳ 주문 상태 변경
- ⏳ 테이블 관리 (설정, 세션 종료)
- ⏳ 메뉴 관리 (CRUD)
- ⏳ 주문 내역 조회

### 기술 스택
- **React** 18.2+
- **TypeScript** 5+ (Strict Mode)
- **Vite** 4.5+ (빌드 도구)
- **Tailwind CSS** 3.3+ (스타일링)
- **React Router** 6.16+ (라우팅)
- **Vitest** + **React Testing Library** (테스팅)

---

## 시작하기

### 요구사항
- Node.js >= 18.0.0
- npm >= 9.0.0

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=false
VITE_NODE_ENV=development
```

**Mock API 사용** (백엔드 없이 개발 시):
```env
VITE_USE_MOCK_API=true
```

---

## 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3001 접속

### 기본 로그인 정보 (Mock API)
- 매장 ID: `store-1`
- 사용자명: `admin`
- 비밀번호: `password`

---

## 빌드

### 프로덕션 빌드
```bash
npm run build
```

빌드 결과물: `dist/` 디렉토리

### 프로덕션 빌드 미리보기
```bash
npm run preview
```

---

## 테스트

### 단위 테스트 실행
```bash
npm test
```

### 테스트 커버리지
```bash
npm test:coverage
```

### UI 모드로 테스트
```bash
npm test:ui
```

---

## 코드 품질

### Lint 검사
```bash
npm run lint
```

### Lint 자동 수정
```bash
npm run lint:fix
```

### 코드 포맷팅
```bash
npm run format
```

### 타입 체크
```bash
npm run type-check
```

---

## 프로젝트 구조

```
admin-frontend/
├── src/
│   ├── common/          # 공통 컴포넌트
│   ├── contexts/        # Context API (전역 상태)
│   ├── hooks/           # 커스텀 훅
│   ├── services/        # API 클라이언트, 타입 정의
│   ├── utils/           # 유틸리티 함수
│   ├── pages/           # 페이지 컴포넌트
│   ├── features/        # 기능별 컴포넌트
│   ├── App.tsx          # 루트 컴포넌트
│   ├── main.tsx         # 진입점
│   └── index.css        # 전역 스타일
├── tests/               # 테스트 파일
├── public/              # 정적 파일
├── aidlc-docs/          # 설계 문서
└── ...config files
```

---

## API 연동

### Backend API (Unit 1)
백엔드 API가 http://localhost:8000에서 실행 중이어야 합니다.

### API 엔드포인트
- `POST /api/admin/login` - 로그인
- `GET /api/admin/orders` - 주문 목록 조회
- `GET /api/admin/orders/stream` - SSE 실시간 업데이트
- `PATCH /api/admin/orders/{id}/status` - 주문 상태 변경
- `DELETE /api/admin/orders/{id}` - 주문 삭제
- `GET /api/admin/tables` - 테이블 목록 조회
- `POST /api/admin/tables/{id}/complete` - 테이블 세션 종료
- `GET /api/admin/menus` - 메뉴 목록 조회
- `POST /api/admin/menus` - 메뉴 등록
- `PUT /api/admin/menus/{id}` - 메뉴 수정
- `DELETE /api/admin/menus/{id}` - 메뉴 삭제

---

## NFR 준수 사항

### Performance
- ✅ Initial load < 3초
- ✅ API response < 2초 (timeout 10초)
- ✅ SSE latency < 2초
- ✅ Code Splitting (route-based lazy loading)
- ✅ Bundle target < 200KB gzipped

### Security
- ✅ JWT authentication (HTTP-only Cookie)
- ✅ XSS protection (React default)
- ✅ CSRF protection (SameSite Cookie)
- ✅ Console.log removal in production
- ✅ Environment-specific error messages

### Reliability
- ✅ Error Boundary for rendering errors
- ✅ SSE Exponential Backoff (max 5 attempts)
- ✅ Full data sync on reconnect
- ✅ Toast notifications for errors

---

## 다음 단계

1. Feature 컴포넌트 구현 (Steps 9-11)
2. 단위 테스트 작성 (target: 70-100% coverage)
3. 백엔드 API 연동 테스트
4. E2E 테스트 (선택사항)
5. 프로덕션 배포

---

## 문서

- [Code Summary](./aidlc-docs/construction/unit3-admin-frontend/code/code-summary.md)
- [Functional Design](./aidlc-docs/construction/unit3-admin-frontend/functional-design/)
- [NFR Requirements](./aidlc-docs/construction/unit3-admin-frontend/nfr-requirements/)
- [NFR Design](./aidlc-docs/construction/unit3-admin-frontend/nfr-design/)

---

## 라이선스

MIT

---
