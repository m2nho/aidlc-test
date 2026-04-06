# Build Instructions

## Overview

이 문서는 테이블오더 서비스의 3개 유닛(Backend, Customer Frontend, Admin Frontend)을 빌드하는 방법을 설명합니다.

---

## Prerequisites

### System Requirements
- **OS**: Linux, macOS, or Windows with WSL2
- **Memory**: 최소 4GB RAM
- **Disk Space**: 최소 2GB 여유 공간
- **Node.js**: v18.x 이상 (Frontend용)
- **Python**: 3.9 이상 (Backend용)

### Required Tools
- **Backend**: Python 3.9+, pip
- **Frontend**: Node.js 18+, npm
- **Version Control**: Git

---

## Unit 1: Backend API & Database

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

**Expected Output**:
```
Successfully installed fastapi-0.104.1 uvicorn-0.24.0 sqlalchemy-2.0.23 ...
```

### 3. Configure Environment
```bash
# .env 파일이 없으면 생성
cp .env.example .env

# 또는 직접 환경 변수 설정
export DATABASE_URL="sqlite:///./table_order.db"
export JWT_SECRET_KEY="your-secret-key-here"
export CORS_ORIGINS='["http://localhost:5173","http://localhost:5174"]'
```

### 4. Initialize Database
```bash
# 데이터베이스 테이블 생성 (자동으로 startup 시 실행됨)
# 또는 수동으로 시드 데이터 추가
python scripts/seed_data.py
```

**Expected Output**:
```
Seed data inserted successfully!
Store: 맛있는 식당
Admin: admin (password: admin1234)
Tables: 10 tables (password: 1234)
Menus: 10 menus across 4 categories
```

### 5. Build Verification
```bash
# FastAPI 앱 실행 테스트
uvicorn app.main:app --reload --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

**Build Artifacts**:
- `table_order.db` - SQLite 데이터베이스 파일
- Python bytecode files (`__pycache__/`)

### Troubleshooting

#### Dependency Installation Fails
- **Cause**: pip 버전이 오래되었거나 네트워크 문제
- **Solution**:
  ```bash
  pip install --upgrade pip
  pip install -r requirements.txt --no-cache-dir
  ```

#### Database Initialization Fails
- **Cause**: 데이터베이스 파일 권한 문제
- **Solution**:
  ```bash
  rm -f table_order.db
  python scripts/seed_data.py
  ```

---

## Unit 2: Customer Frontend

### 1. Navigate to Customer Frontend Directory
```bash
cd customer-frontend
```

### 2. Install Dependencies
```bash
npm install
```

**Expected Output**:
```
added 1234 packages, and audited 1235 packages in 30s
```

### 3. Configure Environment
```bash
# .env 파일 생성
cp .env.example .env

# 환경 변수 설정
# .env 파일 내용:
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_API=false
```

**Mock API 사용 시** (Backend 없이 독립 개발):
```bash
VITE_USE_MOCK_API=true
```

### 4. Build for Production
```bash
npm run build
```

**Expected Output**:
```
vite v4.5.0 building for production...
✓ 1234 modules transformed.
dist/index.html                  1.23 kB
dist/assets/index-abc123.js    456.78 kB │ gzip: 123.45 kB
✓ built in 12.34s
```

**Build Artifacts**:
- `dist/` - 프로덕션 빌드 파일
- `dist/index.html` - Entry point
- `dist/assets/` - JavaScript, CSS 번들

### 5. Build Verification (Development Mode)
```bash
npm run dev
```

**Expected Output**:
```
VITE v4.5.0  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Troubleshooting

#### npm install Fails
- **Cause**: Node.js 버전 호환성 문제
- **Solution**:
  ```bash
  nvm use 18
  npm install
  ```

#### Build Fails with TypeScript Errors
- **Cause**: 타입 오류
- **Solution**:
  ```bash
  npm run type-check
  # 오류 수정 후 다시 빌드
  npm run build
  ```

---

## Unit 3: Admin Frontend

### 1. Navigate to Project Root
```bash
cd /home/ec2-user/environment/aidlc-table-order
```

**Note**: Unit 3는 프로젝트 루트에 있습니다 (src/, tests/ 등)

### 2. Install Dependencies
```bash
npm install
```

**Expected Output**:
```
added 1234 packages, and audited 1235 packages in 30s
```

### 3. Configure Environment
```bash
# .env 파일 설정
cat > .env << 'EOF'
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK=false
EOF
```

**Mock API 사용 시**:
```bash
VITE_USE_MOCK=true
```

### 4. Build for Production
```bash
npm run build
```

**Expected Output**:
```
vite v4.5.0 building for production...
✓ 987 modules transformed.
dist/index.html                  1.45 kB
dist/assets/index-xyz789.js    567.89 kB │ gzip: 145.67 kB
✓ built in 10.23s
```

**Build Artifacts**:
- `dist/` - 프로덕션 빌드 파일
- `dist/index.html` - Entry point
- `dist/assets/` - JavaScript, CSS 번들

### 5. Build Verification (Development Mode)
```bash
npm run dev
```

**Expected Output**:
```
VITE v4.5.0  ready in 987 ms

➜  Local:   http://localhost:5174/
➜  Network: use --host to expose
```

### Troubleshooting

#### Port Already in Use
- **Cause**: 5174 포트가 이미 사용 중 (Unit 2와 충돌)
- **Solution**:
  ```bash
  # vite.config.ts에서 포트 변경
  npm run dev -- --port 5175
  ```

#### Build Fails with Memory Error
- **Cause**: Node.js 힙 메모리 부족
- **Solution**:
  ```bash
  export NODE_OPTIONS="--max-old-space-size=4096"
  npm run build
  ```

---

## Build All Units (Complete System)

### Sequential Build (권장)
```bash
# 1. Backend 빌드
cd backend
pip install -r requirements.txt
python scripts/seed_data.py
cd ..

# 2. Customer Frontend 빌드
cd customer-frontend
npm install
npm run build
cd ..

# 3. Admin Frontend 빌드
npm install
npm run build
```

### Verification
```bash
# 모든 빌드 아티팩트 확인
ls -la backend/table_order.db
ls -la customer-frontend/dist/
ls -la dist/
```

**Expected Structure**:
```
aidlc-table-order/
├── backend/
│   ├── table_order.db              ✅ Database
│   └── app/                        ✅ Python code
├── customer-frontend/
│   └── dist/                       ✅ Production build
├── dist/                           ✅ Admin production build
└── src/                            ✅ Admin source code
```

---

## Summary

| Unit | Build Tool | Build Time | Build Status |
|------|-----------|-----------|--------------|
| Unit 1 (Backend) | pip + Python | ~30s | ✅ Ready |
| Unit 2 (Customer Frontend) | npm + Vite | ~15s | ✅ Ready |
| Unit 3 (Admin Frontend) | npm + Vite | ~12s | ✅ Ready |

**Total Build Time**: ~60 seconds

**Next Steps**: Execute unit tests (see unit-test-instructions.md)
