# KTB4_gourmet_Week12

# Gourmet Community
React와 Spring Boot로 구현하였으며, 12주차에는 MySQL, Frontend, Backend, Nginx를 Docker Compose로 구성하고 GitHub Actions를 이용한 CI/CD 파이프라인을 적용했습니다.

---

## 배포 정보

- Repository: https://github.com/100-hours-a-week/KTB4_gourmet_Week12
- 배포 주소: http://13.209.8.97
- AWS 리전: 서울 `ap-northeast-2`
- EC2 운영체제: Ubuntu 24.04 LTS
- EC2 인스턴스 유형: `t3.micro`

### 테스트 계정

- 이메일: `[테스트 계정 이메일]`
- 비밀번호: `[테스트 계정 비밀번호]`

> 제출 전 실제 배포 환경에서 사용할 테스트 계정으로 수정합니다.

---

## 주요 기능

### 사용자

- 회원가입
- 로그인 및 로그아웃
- Access Token 및 Refresh Token 인증
- 프로필 수정
- 비밀번호 변경
- 회원 탈퇴

### 게시글

- 게시글 작성, 조회, 수정, 삭제
- 게시판 분류
- 제목, 내용, 작성자 통합 검색
- 조회수
- 게시글 이미지 업로드

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

### 배포

- AWS EC2
- Docker
- Docker Compose
- Nginx
- GitHub Actions

---

## 프로젝트 구조

```text
KTB4_Gourmet_Community
├─ .github
│  └─ workflows
│     └─ ci-cd.yml
│
├─ README.md
├─ Retrospective.md
├─ AI_Usage.md
│
└─ Assignment
   ├─ Dockerfile
   ├─ compose.yaml
   ├─ .dockerignore
   ├─ .env.example
   ├─ build.gradle
   ├─ settings.gradle
   ├─ gradlew
   │
   ├─ nginx
   │  └─ nginx.conf
   │
   ├─ src
   │  ├─ main
   │  └─ test
   │
   └─ frontend-react
      ├─ Dockerfile
      ├─ package.json
      ├─ package-lock.json
      ├─ vite.config.js
      ├─ public
      └─ src
```

---

# Docker Compose 구성

11주차에는 Frontend 이미지 내부의 Nginx가 정적 파일 제공과 리버스 프록시를 함께 담당하는 3개 컨테이너 구조를 사용했습니다.

12주차에는 과제 요구사항에 맞게 Frontend와 Nginx를 분리하여 4개 컨테이너로 변경했습니다.

| 컨테이너 | 역할 |
|---|---|
| `gourmet-db` | MySQL 데이터베이스 |
| `gourmet-backend` | Spring Boot API 서버 |
| `gourmet-frontend` | React 빌드 결과물 제공 |
| `gourmet-nginx` | 외부 요청 수신 및 리버스 프록시 |

## 요청 흐름

```text
사용자
  │
  │ HTTP 80
  ▼
gourmet-nginx
├─ /           → gourmet-frontend:3000
├─ /api/*      → gourmet-backend:8080
└─ /uploads/*  → gourmet-backend:8080
                          │
                          ▼
                  gourmet-db:3306
```

외부에는 Nginx의 80번 포트만 공개합니다.

Frontend의 3000번 포트, Backend의 8080번 포트, MySQL의 3306번 포트는 Docker Network 내부에서만 사용합니다.

---

## Frontend Dockerfile

Frontend는 멀티스테이지 빌드를 사용합니다.

```text
Build Stage
→ Node.js 22
→ npm ci
→ ESLint
→ Vite 운영 빌드

Runtime Stage
→ serve
→ React 빌드 결과물을 3000번 포트에서 제공
```

Frontend 컨테이너는 외부 요청을 직접 받지 않고 Nginx 컨테이너를 통해 접근합니다.

---

## Backend Dockerfile

Backend도 멀티스테이지 빌드를 사용합니다.

```text
Build Stage
→ Java 21 JDK
→ Gradle bootJar 실행

Runtime Stage
→ Java 21 JRE
→ 생성된 JAR 실행
```

최종 이미지에는 애플리케이션 실행에 필요한 JRE와 JAR만 포함합니다.

---

## Nginx 리버스 프록시

별도 Nginx 컨테이너가 모든 외부 요청을 받습니다.

```nginx
location /api/ {
    proxy_pass http://backend:8080/;
}

location /uploads/ {
    proxy_pass http://backend:8080;
}

location / {
    proxy_pass http://frontend:3000;
}
```

경로별 처리 대상은 다음과 같습니다.

| 요청 경로 | 처리 대상 |
|---|---|
| `/` | Frontend 컨테이너 |
| `/api/*` | Backend 컨테이너 |
| `/uploads/*` | Backend 이미지 경로 |

---

## 데이터 유지

컨테이너가 재생성되어도 데이터가 유지되도록 Named Volume을 사용합니다.

| Volume | 저장 데이터 |
|---|---|
| `mysql-data` | MySQL 데이터 |
| `uploads-data` | 프로필 및 게시글 이미지 |

다음 명령은 Volume까지 삭제하므로 주의해야 합니다.

```bash
docker compose down -v
```

---

# GitHub Actions CI/CD

워크플로 파일은 다음 위치에서 관리합니다.

```text
.github/workflows/ci-cd.yml
```

`main` 브랜치에 코드가 Push되면 GitHub Actions가 자동으로 실행됩니다.

## 파이프라인 흐름

```text
main 브랜치 Push
        │
        ├─────────────────────────┐
        ▼                         ▼
Backend Test and Build    Frontend Lint and Build
        │                         │
        └────────────┬────────────┘
                     ▼
            Docker Compose Build
                     │
                     ▼
               Deploy to EC2
                     │
                     ▼
              배포 상태 확인
```

Backend와 Frontend 검증은 병렬로 실행됩니다.

두 작업이 모두 성공한 경우에만 Docker 이미지 빌드와 EC2 배포가 진행됩니다.

---

## Backend CI

Backend Job에서는 다음 작업을 수행합니다.

```text
Java 21 설정
→ Gradle Wrapper 실행 권한 설정
→ Backend 테스트
→ Spring Boot JAR 빌드
```

실행 명령:

```bash
./gradlew clean test --no-daemon
./gradlew bootJar --no-daemon
```

테스트 또는 빌드가 실패하면 배포 단계는 실행되지 않습니다.

---

## Frontend CI

Frontend Job에서는 다음 작업을 수행합니다.

```text
Node.js 22 설정
→ npm ci
→ ESLint
→ Vite 운영 빌드
```

실행 명령:

```bash
npm ci
npm run lint
npm run build
```

Lint 또는 빌드가 실패하면 배포 단계는 실행되지 않습니다.

---

## Docker Build 검증

Backend와 Frontend 검증이 성공하면 Docker Compose 설정과 이미지 빌드를 확인합니다.

```bash
docker compose config --quiet
docker compose build
```

이를 통해 실제 EC2에 배포하기 전에 Dockerfile과 Compose 설정이 정상인지 검증합니다.

---

## EC2 자동 배포

모든 검증이 성공하면 GitHub Actions가 SSH로 EC2에 접속하여 다음 작업을 수행합니다.

```text
최신 main 브랜치 코드 가져오기
→ EC2 코드를 최신 커밋으로 변경
→ .env 파일 존재 여부 확인
→ Docker Compose 설정 검사
→ Docker 이미지 재빌드
→ 컨테이너 실행
→ HTTP 상태 검사
```

EC2에서 실행되는 주요 명령은 다음과 같습니다.

```bash
git fetch origin main
git reset --hard origin/main

cd Assignment

docker compose config --quiet
docker compose up -d --build --remove-orphans
docker compose ps
```

변경된 컨테이너만 재생성하며 MySQL 데이터와 업로드 파일이 저장된 Named Volume은 유지합니다.

---

## 배포 상태 검사

배포 후 다음 요청을 자동으로 검사합니다.

### Frontend 및 Nginx

```bash
curl http://127.0.0.1/
```

정상 상태:

```text
HTTP 200
```

### Backend

```bash
curl http://127.0.0.1/api/users/me
```

정상 상태:

```text
HTTP 401
```

로그인 정보가 없는 요청이므로 `401 Unauthorized`는 정상적인 Spring Security 응답입니다.

두 조건을 모두 만족하면 배포 성공으로 처리합니다.

---

# GitHub Actions Secrets

EC2 접속 정보는 Repository Secrets로 관리합니다.

```text
Settings
→ Secrets and variables
→ Actions
```

등록한 Secret은 다음과 같습니다.

| Secret | 용도 |
|---|---|
| `EC2_HOST` | EC2 퍼블릭 IP |
| `EC2_USER` | EC2 사용자 이름 |
| `EC2_SSH_KEY` | GitHub Actions 전용 SSH 개인키 |
| `EC2_KNOWN_HOSTS` | EC2 Host Key 정보 |

MySQL 비밀번호와 JWT Secret은 GitHub에 저장하지 않고 EC2 내부의 `.env` 파일에서 관리합니다.

```text
/home/ubuntu/KTB4_gourmet_Week12/Assignment/.env
```

---

# 환경 변수

GitHub에는 실제 값이 없는 `.env.example` 파일만 포함합니다.

```env
MYSQL_DATABASE=gourmet_community
MYSQL_USER=gourmet_app
MYSQL_PASSWORD=change_me
MYSQL_ROOT_PASSWORD=change_root_password
JWT_SECRET=change_to_long_random_secret
```

실제 `.env` 파일은 Git에서 제외합니다.

| 변수 | 설명 |
|---|---|
| `MYSQL_DATABASE` | MySQL 데이터베이스 |
| `MYSQL_USER` | 애플리케이션 DB 사용자 |
| `MYSQL_PASSWORD` | 애플리케이션 DB 비밀번호 |
| `MYSQL_ROOT_PASSWORD` | MySQL Root 비밀번호 |
| `JWT_SECRET` | JWT 서명 비밀키 |

---

# 로컬 실행

## Backend

필요한 환경 변수를 설정한 뒤 실행합니다.

```bash
cd Assignment
./gradlew bootRun
```

Backend 기본 주소:

```text
http://localhost:8080
```

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

Vite 개발 환경에서는 `/api` 요청을 `localhost:8080`으로 전달합니다.

---

# Docker Compose 실행

## 환경 변수 파일 생성

```bash
cd Assignment
cp .env.example .env
```

생성된 `.env`를 실제 환경에 맞게 수정합니다.

## 전체 서비스 실행

```bash
docker compose up -d --build
```

## 상태 확인

```bash
docker compose ps
```

정상 상태:

```text
gourmet-db          running (healthy)
gourmet-backend     running
gourmet-frontend    running
gourmet-nginx       running
```

## 로그 확인

```bash
docker compose logs --tail=100 db
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
docker compose logs --tail=100 nginx
```

## 서비스 종료

```bash
docker compose down
```

---

# 자동 배포 사용 방법

기능 구현 후 로컬에서 테스트합니다.

```bash
cd Assignment
./gradlew clean test

cd frontend-react
npm run lint
npm run build
```

검증 후 GitHub에 Push합니다.

```bash
git add .
git commit -m "feat: 변경 내용"
git push origin main
```

Push 이후 GitHub Actions가 다음 과정을 자동으로 수행합니다.

```text
Backend 테스트 및 빌드
→ Frontend Lint 및 빌드
→ Docker Compose 빌드 검증
→ EC2 자동 배포
→ HTTP 상태 검사
```

워크플로는 GitHub의 `Actions` 탭에서 확인할 수 있습니다.

---

# 배포 검증 결과

GitHub Actions의 다음 Job이 모두 성공하는 것을 확인했습니다.

- Backend Test and Build
- Frontend Lint and Build
- Docker Compose Build
- Deploy to EC2

EC2에서 다음 네 개의 컨테이너가 실행되는 것을 확인했습니다.

```text
gourmet-db          healthy
gourmet-backend     running
gourmet-frontend    running
gourmet-nginx       running
```

EC2의 최신 Commit과 GitHub `main` 브랜치의 Commit이 일치하는 것도 확인했습니다.

```bash
git log -1 --oneline
```

Frontend 응답:

```bash
curl -I http://127.0.0.1/
```

```text
HTTP/1.1 200 OK
```

Backend 응답:

```bash
curl -i http://127.0.0.1/api/users/me
```

```text
HTTP/1.1 401
인증이 필요합니다.
```

---

# 최종 결과

기존에는 코드를 Push한 뒤 EC2에 직접 접속하여 다음 작업을 수행해야 했습니다.

```text
git pull
→ Docker 이미지 빌드
→ Docker Compose 실행
→ 컨테이너 상태 확인
→ 서비스 요청 확인
```

GitHub Actions 적용 후에는 `main` 브랜치에 Push하면 전체 과정이 자동으로 실행됩니다.

```text
코드 Push
→ Backend 테스트 및 빌드
→ Frontend Lint 및 빌드
→ Docker Compose 이미지 빌드
→ EC2 자동 접속
→ 최신 코드 반영
→ MySQL, Frontend, Backend, Nginx 실행
→ 배포 상태 자동 확인
```

테스트 또는 빌드가 실패하면 EC2 배포는 실행되지 않으며, 검증된 코드만 배포되도록 구성했습니다.
