# KTB4_gourmet_Week11

# Gourmet Community

11주차에는 AWS EC2 직접 배포와 Docker Compose 통합 배포를 진행했습니다.

---

## 배포 정보

- 배포 주소: http://13.209.8.97
- GitHub Repository: https://github.com/100-hours-a-week/KTB4_gourmet_Week11
- AWS 리전: 서울 `ap-northeast-2`
- EC2 운영체제: Ubuntu 24.04 LTS
- EC2 인스턴스 유형: `t3.micro`

현재 배포 환경은 **Docker Compose 기반 구성**입니다.

---

## 주요 기능

### 사용자

- 회원가입
- 로그인 및 로그아웃
- JWT Access Token / Refresh Token 인증
- 프로필 조회 및 수정
- 비밀번호 변경
- 회원 탈퇴

### 게시글

- 게시글 작성, 조회, 수정, 삭제
- 게시판 분류
  - 자유 게시판
  - 질문 게시판
  - 스터디 게시판
  - 프로젝트 게시판
- 게시글 통합 검색
  - 제목
  - 내용
  - 작성자 닉네임
- 조회수
- 이미지 업로드

### 댓글 및 좋아요

- 댓글 작성, 수정, 삭제
- 게시글 좋아요 등록 및 취소
- 사용자별 좋아요 상태 유지

---

## 기술 스택

### Frontend

- React 19
- Vite 8
- JavaScript
- React Router
- CSS
- Nginx

### Backend

- Java 21
- Spring Boot 4
- Spring MVC
- Spring Data JPA
- Spring Security
- JWT
- Gradle

### Database

- MySQL 8
- H2 Database 테스트 환경

### Deployment

- AWS EC2
- Nginx Reverse Proxy
- Docker
- Docker Compose
- systemd

---

## 프로젝트 구조

```text
KTB4_Gourmet_Community
└─ Assignment
   ├─ Dockerfile
   ├─ compose.yaml
   ├─ .dockerignore
   ├─ .env.example
   ├─ build.gradle
   ├─ settings.gradle
   ├─ gradlew
   │
   ├─ src
   │  ├─ main
   │  │  ├─ java
   │  │  └─ resources
   │  └─ test
   │
   └─ frontend-react
      ├─ Dockerfile
      ├─ nginx.conf
      ├─ package.json
      ├─ vite.config.js
      ├─ public
      └─ src
         ├─ api
         ├─ components
         ├─ constants
         ├─ contexts
         ├─ hooks
         ├─ layouts
         ├─ pages
         ├─ routes
         ├─ styles
         └─ utils
```

---

# 11주차 과제 구현 내용

## 과제 1. EC2 직접 배포 및 Nginx 리버스 프록시

React, Spring Boot, MySQL, Nginx를 EC2 한 대에 직접 설치하여 배포했습니다.

### 구성

```text
사용자
  │
  │ HTTP 80
  ▼
Nginx
├─ React 정적 파일 제공
└─ /api 요청 전달
          │
          ▼
   Spring Boot 8080
          │
          ▼
      MySQL 3306
```

### 적용 내용

- EC2 Ubuntu 서버 생성
- Java 21 설치
- Node.js 22 설치
- MySQL 설치 및 데이터베이스 생성
- Nginx 설치 및 리버스 프록시 구성
- React 운영 빌드 결과물 배포
- Spring Boot JAR 빌드
- Spring Boot systemd 서비스 등록
- EC2 재부팅 후 자동 실행 설정
- 2GB Swap 메모리 설정
- 운영 환경 변수를 서버 내부 파일로 관리

### 외부 공개 포트

| 포트 | 용도 |
|---:|---|
| 22 | SSH 및 EC2 Instance Connect |
| 80 | Nginx HTTP 요청 |

Spring Boot의 `8080`과 MySQL의 `3306`은 외부에 공개하지 않았습니다.

---

## 과제 2. Docker Compose 통합 배포

React와 Spring Boot에 멀티스테이지 Dockerfile을 적용하고 MySQL을 포함한 전체 서비스를 Docker Compose로 구성했습니다.

### 현재 Docker 구성

```text
사용자
  │
  │ HTTP 80
  ▼
gourmet-frontend
├─ React 정적 파일
└─ Nginx Reverse Proxy
          │
          │ Docker Network
          ▼
gourmet-backend
└─ Spring Boot 8080
          │
          ▼
gourmet-db
└─ MySQL 3306
```

### 컨테이너

| 컨테이너 | 역할 |
|---|---|
| `gourmet-frontend` | React 정적 파일 제공 및 Nginx 리버스 프록시 |
| `gourmet-backend` | Spring Boot API 서버 |
| `gourmet-db` | MySQL 데이터베이스 |

### 멀티스테이지 빌드

#### Spring Boot

```text
Java 21 JDK
→ Gradle bootJar 빌드
→ Java 21 JRE 이미지에 JAR만 복사
```

#### React

```text
Node.js 22
→ npm ci
→ ESLint 검사
→ Vite 운영 빌드
→ Nginx 이미지에 dist 파일만 복사
```

### Docker Compose 관리 대상

- Frontend 컨테이너
- Backend 컨테이너
- MySQL 컨테이너
- Docker Bridge Network
- MySQL Named Volume
- 이미지 업로드 Named Volume

---

## 환경 변수

실제 환경 변수는 `.env` 파일에서 관리하며 GitHub에는 업로드하지 않습니다.

GitHub에는 변수 구조만 작성된 `.env.example`을 제공합니다.

```env
MYSQL_DATABASE=gourmet_community
MYSQL_USER=gourmet_app
MYSQL_PASSWORD=change_me
MYSQL_ROOT_PASSWORD=change_root_password
JWT_SECRET=change_to_long_random_secret
```

### 주요 환경 변수

| 변수 | 설명 |
|---|---|
| `MYSQL_DATABASE` | MySQL 데이터베이스 이름 |
| `MYSQL_USER` | 애플리케이션 DB 사용자 |
| `MYSQL_PASSWORD` | 애플리케이션 DB 비밀번호 |
| `MYSQL_ROOT_PASSWORD` | MySQL Root 비밀번호 |
| `JWT_SECRET` | JWT 서명 비밀키 |

> 실제 비밀번호와 JWT Secret은 Repository 및 제출 문서에 공개하지 않습니다.

---

# 로컬 실행 방법

## Backend

### 환경 변수 설정

```bash
export DB_USERNAME=사용자명
export DB_PASSWORD=비밀번호
export JWT_SECRET=JWT_비밀키
```

Windows PowerShell에서는 다음 형식을 사용합니다.

```powershell
$env:DB_USERNAME="사용자명"
$env:DB_PASSWORD="비밀번호"
$env:JWT_SECRET="JWT_비밀키"
```

### 실행

```bash
cd Assignment
./gradlew bootRun
```

Backend 기본 주소:

```text
http://localhost:8080
```

---

## Frontend

```bash
cd Assignment/frontend-react
npm ci
npm run dev
```

Frontend 기본 주소:

```text
http://localhost:5173
```

Vite 개발 환경에서는 `/api` 요청을 Spring Boot의 `localhost:8080`으로 전달합니다.

---

# Docker Compose 실행 방법

## 1. 환경 변수 파일 생성

```bash
cd Assignment
cp .env.example .env
```

`.env` 파일의 값을 실제 개발 환경에 맞게 수정합니다.

## 2. 이미지 빌드 및 컨테이너 실행

```bash
docker compose up -d --build
```

## 3. 컨테이너 상태 확인

```bash
docker compose ps
```

정상 상태 예시:

```text
gourmet-db          running (healthy)
gourmet-backend     running
gourmet-frontend    running
```

## 4. 로그 확인

```bash
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
docker compose logs --tail=100 db
```

전체 로그를 실시간으로 확인하려면 다음 명령을 사용합니다.

```bash
docker compose logs -f
```

## 5. 컨테이너 종료

```bash
docker compose down
```

Named Volume의 데이터를 유지하기 위해 다음 명령은 주의해서 사용해야 합니다.

```bash
docker compose down -v
```

`-v` 옵션을 사용하면 MySQL 데이터와 업로드 이미지가 저장된 Volume이 함께 제거될 수 있습니다.

---

# 배포 서버 수동 갱신 방법

현재 11주차 배포는 EC2에서 직접 갱신하는 방식입니다.

로컬에서 코드를 수정한 뒤 GitHub에 Push합니다.

```bash
git add .
git commit -m "feat: 변경 내용"
git push origin main
```

EC2에서 최신 코드를 받고 컨테이너를 다시 생성합니다.

```bash
cd ~/KTB4_gourmet_Week11
git pull origin main

cd Assignment
docker compose up -d --build
```

현재는 수동으로 수행하며, 이후 GitHub Actions를 이용해 자동화할 예정입니다.

---

# Nginx 요청 경로

| 요청 경로 | 처리 대상 |
|---|---|
| `/` | React 정적 파일 |
| `/api/*` | Spring Boot API |
| `/uploads/*` | Spring Boot 이미지 경로 |

Docker 환경의 Nginx는 Compose 서비스 이름으로 Backend에 접근합니다.

```nginx
location /api/ {
    proxy_pass http://backend:8080/;
}

location /uploads/ {
    proxy_pass http://backend:8080;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

---

# 데이터 유지

다음 데이터를 Named Volume으로 관리합니다.

| Volume | 저장 대상 |
|---|---|
| `mysql-data` | MySQL 데이터 |
| `uploads-data` | 프로필 및 게시글 이미지 |

컨테이너를 다시 빌드하거나 교체해도 Volume을 삭제하지 않는 한 데이터는 유지됩니다.

---

# 배포 검증

다음 명령으로 Frontend Nginx 응답을 확인했습니다.

```bash
curl -I http://127.0.0.1/
```

결과:

```text
HTTP/1.1 200 OK
Server: nginx
```

Nginx에서 Spring Boot로 요청이 전달되는지 확인했습니다.

```bash
curl -i http://127.0.0.1/api/users/me
```

로그인 정보가 없는 요청이므로 다음 응답이 반환됩니다.

```json
{
  "status": 401,
  "message": "인증이 필요합니다.",
  "error": "UNAUTHORIZED"
}
```

이를 통해 다음 요청 흐름이 정상적으로 연결된 것을 확인했습니다.

```text
EC2 80번 포트
→ Frontend 컨테이너 Nginx
→ Backend 컨테이너
→ Spring Security
```

---

# 기능 검증

배포 환경에서 다음 기능을 확인했습니다.

- 회원가입
- 로그인 및 로그아웃
- 새로고침 후 로그인 유지
- 게시글 작성, 조회, 수정, 삭제
- 게시판 분류 저장
- 게시글 검색
- 댓글 작성, 수정, 삭제
- 좋아요 등록 및 취소
- 프로필 이미지 업로드
- 게시글 이미지 업로드
- MySQL 데이터 저장
- 보호 API 인증 처리

---

# 향후 개선 사항

- 댓글 및 좋아요 실시간 알림
- 인기 게시글 기능
- 검색 성능 개선
- GitHub Actions 기반 자동 배포
- HTTPS 및 도메인 적용
