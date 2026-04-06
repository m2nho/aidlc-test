# Requirements Verification Questions

다음 질문들에 답변하여 요구사항을 명확히 해주세요. 각 질문 아래의 [Answer]: 태그 옆에 선택한 문자를 입력해주시면 됩니다.

---

## Question 1: 기술 스택 - 프론트엔드 프레임워크
고객용 및 관리자용 웹 UI 개발에 어떤 프론트엔드 프레임워크를 사용하시겠습니까?

A) React (가장 널리 사용되는 UI 라이브러리)
B) Vue.js (점진적 프레임워크)
C) Next.js (React 기반 풀스택 프레임워크, SSR 지원)
D) Angular (완전한 프레임워크)
E) Svelte (컴파일 타임 프레임워크)
F) 순수 HTML/JavaScript (프레임워크 없이)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2: 기술 스택 - 백엔드 언어 및 프레임워크
서버 시스템 개발에 어떤 백엔드 기술을 사용하시겠습니까?

A) Node.js + Express (JavaScript/TypeScript)
B) Python + FastAPI (최신 비동기 프레임워크)
C) Python + Django (완전한 웹 프레임워크)
D) Java + Spring Boot (엔터프라이즈급 프레임워크)
E) Go (고성능 서버)
F) Ruby on Rails (생산성 중심 프레임워크)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 3: 기술 스택 - 데이터베이스
데이터 저장에 어떤 데이터베이스를 사용하시겠습니까?

A) PostgreSQL (오픈소스 관계형 DB)
B) MySQL/MariaDB (널리 사용되는 관계형 DB)
C) MongoDB (NoSQL 문서 DB)
D) SQLite (경량 파일 기반 DB)
E) DynamoDB (AWS 관리형 NoSQL)
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 4: 배포 환경
애플리케이션을 어디에 배포하실 계획입니까?

A) 로컬 서버 (개발/테스트 전용)
B) AWS (EC2, RDS, S3 등)
C) Docker 컨테이너 (로컬 또는 클라우드)
D) Heroku / Vercel / Netlify (관리형 플랫폼)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5: 메뉴 이미지 저장 방식
메뉴 이미지를 어떻게 저장하고 관리하시겠습니까?

A) 외부 URL만 저장 (이미지는 외부 호스팅)
B) 로컬 파일 시스템에 저장
C) 클라우드 스토리지 (AWS S3, Google Cloud Storage 등)
D) 데이터베이스에 Base64로 저장
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6: 실시간 업데이트 구현 방식
관리자 화면의 실시간 주문 모니터링을 어떻게 구현하시겠습니까?

A) Server-Sent Events (SSE) - 요구사항 문서에 명시된 방식
B) WebSocket (양방향 통신)
C) Polling (주기적 API 호출)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7: 인증 토큰 저장 위치
관리자 로그인 세션 (JWT 토큰)을 어디에 저장하시겠습니까?

A) LocalStorage (브라우저 저장소)
B) SessionStorage (브라우저 세션)
C) HTTP-only Cookie (XSS 방지)
D) In-memory (상태 관리 라이브러리)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 8: 테스트 범위
어떤 수준의 테스트를 포함하시겠습니까?

A) 단위 테스트만 (Unit tests)
B) 통합 테스트 포함 (Unit + Integration tests)
C) E2E 테스트 포함 (Unit + Integration + E2E tests)
D) 테스트 없음 (MVP 빠른 개발)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) Yes — 모든 SECURITY 규칙을 필수 제약사항으로 적용 (프로덕션급 애플리케이션 권장)
B) No — 모든 SECURITY 규칙 생략 (PoC, 프로토타입, 실험 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 10: 프로젝트 구조
선호하는 프로젝트 구조는 무엇입니까?

A) Monorepo (프론트엔드 + 백엔드 하나의 저장소)
B) 분리된 저장소 (프론트엔드와 백엔드 별도 저장소)
C) 현재 작업공간에 모두 포함 (단일 디렉토리 구조)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 11: 환경 변수 관리
환경별 설정(DB 연결, API 키 등)을 어떻게 관리하시겠습니까?

A) .env 파일 사용 (로컬 개발)
B) 환경 변수만 사용 (배포 환경에서 설정)
C) 설정 파일 사용 (config.json 등)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 12: 초기 매장 및 테이블 데이터
개발 및 테스트를 위한 초기 데이터를 어떻게 제공하시겠습니까?

A) 시드 데이터 스크립트 생성 (자동 삽입)
B) 수동으로 데이터 입력 (관리자 UI 사용)
C) SQL/JSON 파일 제공 (수동 실행)
X) Other (please describe after [Answer]: tag below)

[Answer]: A 

---

**작성 완료 후 "완료했습니다" 또는 "done"이라고 알려주세요.**
