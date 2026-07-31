# KTB4_gourmet_Week12

# 12주차 회고 및 AI 사용 기록

---

# 1. 회고

## 1.1 진행한 작업

이번 주에는 Gourmet Community 프로젝트에 GitHub Actions 기반 CI/CD 파이프라인을 적용하였다.

11주차에는 EC2에 직접 접속하여 최신 코드를 받고 Docker Compose 명령을 실행하는 수동 배포 방식을 사용하였다.

```text
git pull
→ Docker 이미지 빌드
→ Docker Compose 실행
→ 컨테이너 상태 확인
→ 서비스 요청 확인
```

12주차에는 `main` 브랜치에 코드가 Push되면 GitHub Actions가 Backend와 Frontend를 자동으로 검증하고, 성공한 경우 EC2에 자동 배포하도록 변경하였다.

---

## 1.2 Docker Compose 구조 변경

11주차에는 다음과 같은 3개 컨테이너 구조를 사용하였다.

```text
MySQL
Backend
Frontend + Nginx
```

12주차 과제에서는 MySQL, Frontend, Backend, Nginx가 Docker Compose를 통해 함께 생성되어야 했기 때문에 Frontend와 Nginx를 분리하였다.

변경된 구조는 다음과 같다.

```text
gourmet-db
→ MySQL

gourmet-backend
→ Spring Boot

gourmet-frontend
→ React 빌드 결과물을 3000번 포트에서 제공

gourmet-nginx
→ 외부 80번 포트에서 요청을 받아 Frontend와 Backend로 전달
```

요청 경로는 다음과 같이 구성하였다.

```text
/
→ nginx
→ frontend:3000

/api/*
→ nginx
→ backend:8080

/uploads/*
→ nginx
→ backend:8080

backend
→ db:3306
```

외부에는 Nginx의 80번 포트만 공개하고 Frontend, Backend, MySQL은 Docker Network 내부에서만 통신하도록 구성하였다.

---

## 1.3 GitHub Actions 파이프라인 구성

프로젝트에 다음 워크플로 파일을 추가하였다.

```text
.github/workflows/ci-cd.yml
```

파이프라인은 다음 순서로 실행된다.

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

Backend와 Frontend 검증은 서로 의존하지 않기 때문에 병렬로 실행하였다.

두 작업이 모두 성공하면 Docker Compose 설정과 이미지 빌드를 검증하고, 이후 EC2 배포 작업이 실행되도록 구성하였다.

Backend에서는 다음 작업을 수행한다.

```text
Java 21 설정
→ Gradle 테스트
→ Spring Boot JAR 빌드
```

Frontend에서는 다음 작업을 수행한다.

```text
Node.js 22 설정
→ npm ci
→ ESLint
→ Vite 운영 빌드
```

Docker 단계에서는 다음 작업을 수행한다.

```text
Docker Compose 문법 검사
→ Frontend 및 Backend 이미지 빌드
```

모든 검증이 성공한 경우에만 EC2 자동 배포가 진행된다.

---

## 1.4 EC2 자동 배포

GitHub Actions가 EC2에 접속할 수 있도록 배포 전용 SSH 키를 생성하였다.

EC2 접속 정보는 GitHub Repository Secrets에서 관리하였다.

```text
EC2_HOST
EC2_USER
EC2_SSH_KEY
EC2_KNOWN_HOSTS
```

MySQL 비밀번호와 JWT Secret은 GitHub에 저장하지 않고 EC2 내부의 `.env` 파일에서 계속 관리하였다.

GitHub Actions의 배포 단계에서는 EC2에 접속하여 다음 작업을 수행한다.

```text
최신 main 브랜치 코드 확인
→ EC2 코드를 최신 커밋으로 변경
→ .env 파일 존재 여부 확인
→ Docker Compose 설정 검사
→ Docker 이미지 재빌드
→ 컨테이너 실행
→ HTTP 상태 검사
```

배포 과정에서 실행되는 주요 명령은 다음과 같다.

```bash
git fetch origin main
git reset --hard origin/main

cd Assignment

docker compose config --quiet
docker compose up -d --build --remove-orphans
docker compose ps
```

변경된 컨테이너는 새 이미지로 재생성하고, 변경되지 않은 MySQL 컨테이너와 Named Volume은 유지하도록 구성하였다.

---

## 1.5 배포 검증

배포 이후 다음 두 요청을 통해 서비스 상태를 자동으로 확인하였다.

Frontend와 Nginx 확인:

```bash
curl -I http://127.0.0.1/
```

정상 결과:

```text
HTTP/1.1 200 OK
```

Nginx와 Backend 연결 확인:

```bash
curl -i http://127.0.0.1/api/users/me
```

정상 결과:

```text
HTTP/1.1 401
인증이 필요합니다.
```

로그인 정보가 없는 요청이므로 401은 정상적인 Spring Security 응답이다.

EC2의 최신 Commit도 GitHub `main` 브랜치와 일치하는 것을 확인하였다.

```bash
git log -1 --oneline
```

최종적으로 다음 네 개의 컨테이너가 실행되는 것을 확인하였다.

```text
gourmet-db          healthy
gourmet-backend     running
gourmet-frontend    running
gourmet-nginx       running
```

---

## 1.6 GitHub Actions를 먼저 구현한 이유

처음에는 댓글·좋아요 실시간 알림이나 인기 게시글 같은 기능을 먼저 추가한 뒤 GitHub Actions를 적용하는 방법도 고민하였다.

하지만 기능 변경과 배포 방식 변경을 동시에 진행하면 오류가 발생했을 때 기능 코드의 문제인지, Docker 설정의 문제인지, GitHub Actions 배포 과정의 문제인지 구분하기 어려울 수 있다고 판단하였다.

따라서 현재 정상적으로 동작하는 코드를 기준으로 GitHub Actions를 먼저 빠르게 구현하였다. 이 과정에서는 AI를 적극적으로 활용하여 Docker Compose 구조 변경, SSH 설정, Repository Secrets 등록, 워크플로 작성과 오류 확인 순서를 단계별로 진행하였다.

이제 배포 파이프라인이 정상적으로 동작하므로 이후에는 로컬에서 기능을 구현하고 충분히 실행해 본 뒤 오류가 없는 경우에만 Push할 계획이다.

앞으로의 개발 흐름은 다음과 같다.

```text
로컬에서 기능 구현
→ Backend 테스트
→ Frontend Lint 및 Build
→ 로컬 기능 확인
→ Git Push
→ GitHub Actions 자동 검증
→ 검증 성공 시 EC2 자동 배포
→ 배포 환경 최종 확인
```

GitHub Actions가 로컬 테스트를 대신하는 것이 아니라, 로컬에서 확인한 코드를 동일한 기준으로 한 번 더 검증하고 배포하는 역할을 하도록 사용할 예정이다.

---

## 1.7 최종 회고

이번 과제를 통해 CI와 CD가 각각 어떤 책임을 가지는지 실제 배포 과정에서 확인할 수 있었다.

CI에서는 Backend 테스트와 빌드, Frontend Lint와 빌드, Docker 이미지 빌드를 수행하였다. 검증에 실패하면 배포가 진행되지 않도록 구성하였다.

CD에서는 검증된 코드를 EC2에 반영하고 Docker Compose로 MySQL, Frontend, Backend, Nginx 컨테이너를 실행한 뒤 HTTP 응답까지 확인하였다.

기존에는 코드를 변경할 때마다 EC2에 직접 접속하여 배포 명령을 실행해야 했지만, 이제는 `main` 브랜치에 Push하면 검증과 배포가 자동으로 이어진다.

특히 다음 내용을 직접 경험한 점이 의미 있었다.

- Backend와 Frontend CI 병렬 실행
- `needs`를 이용한 Job 실행 순서 제어
- Repository Secrets를 이용한 접속 정보 관리
- GitHub Actions 전용 SSH 키 사용
- Docker Compose 기반 4개 컨테이너 구성
- 테스트와 빌드 성공 후에만 배포하는 흐름
- 배포 후 HTTP 상태 자동 확인
- 변경되지 않은 DB와 Volume 유지

앞으로는 완성된 자동 배포 환경을 기반으로 기능을 하나씩 추가하고, 로컬에서 충분히 검증한 코드만 Push하여 기능 오류와 배포 오류를 구분하기 쉬운 개발 흐름을 유지할 예정이다.

---

# 2. AI 사용 기록

## 2.1 AI 사용 목적

이번 과제에서는 GitHub Actions를 처음 적용하였기 때문에 전체 구성 순서를 이해하고, 각 단계에서 발생할 수 있는 문제를 확인하기 위해 AI를 활용하였다.

기능 개발과 배포 환경 변경을 동시에 진행하면 오류 원인을 구분하기 어려울 수 있다고 판단하여, AI의 도움을 받아 현재 정상 동작하는 코드를 기준으로 CI/CD 파이프라인을 먼저 빠르게 구성하였다.

AI가 GitHub Actions를 대신 실행한 것은 아니며, 현재 프로젝트 구조와 실행 결과를 전달하고 다음 단계에서 무엇을 해야 하는지 질문하면서 작업하였다.

---

## 2.2 주요 질문 내용

GitHub Actions 적용 과정에서 다음 내용을 중심으로 질문하였다.

```text
기능 구현과 GitHub Actions 중 어떤 작업을 먼저 진행하는 것이 좋은가?
```

```text
Week11 저장소에서 Week12 저장소로 원격 연결을 어떻게 변경해야 하는가?
```

```text
MySQL, Frontend, Backend, Nginx를 각각 컨테이너로 분리하려면 Compose 구조를 어떻게 변경해야 하는가?
```

```text
Frontend 컨테이너와 Nginx 컨테이너의 책임을 어떻게 분리해야 하는가?
```

```text
Backend와 Frontend 검증을 GitHub Actions에서 병렬로 실행하려면 어떻게 구성해야 하는가?
```

```text
검증이 모두 성공했을 때만 EC2 배포가 실행되도록 하려면 어떻게 해야 하는가?
```

```text
GitHub Actions가 EC2에 SSH로 접속하려면 어떤 Secret이 필요한가?
```

```text
자동 배포 이후 어떤 요청으로 정상 배포 여부를 확인해야 하는가?
```

각 질문에 대한 답변을 확인한 뒤 현재 프로젝트의 경로, 컨테이너 이름, 포트와 환경 변수에 맞게 적용하였다.

---

## 2.3 Docker Compose 구조 변경에서의 AI 활용

기존에는 Frontend 이미지 내부의 Nginx가 정적 파일 제공과 리버스 프록시를 함께 담당하였다.

과제 문구에 MySQL, Frontend, Backend, Nginx가 각각 명시되어 있어 이를 네 개의 서비스로 분리하는 방법을 질문하였다.

AI의 설명을 참고하여 다음 구조로 변경하였다.

```text
nginx:80
├─ /         → frontend:3000
├─ /api/*    → backend:8080
└─ /uploads/ → backend:8080

backend:8080
└─ db:3306
```

변경 후에는 먼저 수동으로 Docker Compose를 실행하고 네 개의 컨테이너와 주요 기능이 정상인지 확인하였다.

GitHub Actions를 연결하기 전에 수동 배포를 먼저 검증하여 Compose 문제와 Actions 문제를 분리하였다.

---

## 2.4 GitHub Actions 워크플로 작성에서의 AI 활용

Backend와 Frontend를 어떤 Job으로 나누어야 하는지 질문하였다.

AI의 설명을 참고하여 다음 Job을 구성하였다.

```text
backend-ci
frontend-ci
docker-ci
deploy
```

Backend와 Frontend Job에는 서로 간의 `needs`를 설정하지 않아 병렬로 실행하였다.

Docker Job에는 다음 의존 관계를 설정하였다.

```yaml
needs:
  - backend-ci
  - frontend-ci
```

배포 Job은 Docker 검증이 성공한 뒤에만 실행되도록 구성하였다.

```yaml
needs:
  - docker-ci
```

이를 통해 테스트나 빌드에 실패한 코드가 EC2에 배포되지 않도록 하였다.

---

## 2.5 SSH와 Secrets 설정에서의 AI 활용

기존 EC2 PEM 키를 그대로 사용하는 대신 GitHub Actions 전용 SSH 키를 만드는 방법을 질문하였다.

AI의 안내에 따라 로컬에서 전용 키를 생성하고 공개키는 EC2의 `authorized_keys`에 등록하였다.

개인키와 EC2 정보는 GitHub Repository Secrets에 저장하였다.

```text
EC2_HOST
EC2_USER
EC2_SSH_KEY
EC2_KNOWN_HOSTS
```

실제 개인키와 환경 변수 값은 코드, README와 대화에 노출하지 않았다.

DB 비밀번호와 JWT Secret은 EC2의 `.env` 파일에 남겨 두고 GitHub Actions에서는 해당 파일의 존재 여부만 확인하도록 구성하였다.

---

## 2.6 실행 결과 확인에서의 AI 활용

GitHub Actions 실행 화면에서 Backend와 Frontend가 동시에 실행되는지 질문하였다.

AI의 설명을 통해 서로를 기다리는 `needs`가 없는 Job은 병렬로 실행되고, Docker와 Deploy Job은 앞의 작업을 순서대로 기다린다는 것을 확인하였다.

배포 이후 DB 컨테이너만 생성 시간이 오래된 상태로 표시되어 문제가 있는지도 질문하였다.

AI의 설명을 통해 Docker Compose는 변경된 서비스만 재생성하며, 설정이 변경되지 않은 MySQL 컨테이너는 계속 유지된다는 점을 이해하였다.

다음 명령으로 최종 상태를 직접 확인하였다.

```bash
docker compose ps
git log -1 --oneline
curl -I http://127.0.0.1/
curl -i http://127.0.0.1/api/users/me
```

결과를 통해 최신 Commit 반영, Frontend 응답, Backend 연결과 인증 처리가 정상임을 확인하였다.

---

## 2.7 AI 답변 검증 방법

AI 답변을 그대로 적용하지 않고 다음 기준으로 직접 검증하였다.

- GitHub Actions Job이 모두 성공하는지 확인
- EC2의 최신 Commit이 원격 `main`과 일치하는지 확인
- Docker Compose에서 네 개의 컨테이너가 실행되는지 확인
- MySQL Health Check가 통과했는지 확인
- Frontend 요청이 200을 반환하는지 확인
- Backend 보호 API가 401을 반환하는지 확인
- 실제 배포 사이트의 주요 기능을 직접 실행
- GitHub에 실제 비밀번호와 개인키가 포함되지 않았는지 확인

워크플로 파일과 Docker Compose 설정도 Push하기 전에 로컬과 EC2에서 문법을 확인하였다.

---

## 2.8 AI 사용 결과

AI를 활용하여 처음 접하는 GitHub Actions 과정을 작은 단계로 나누어 진행할 수 있었다.

특히 기능 구현과 배포 환경 변경을 동시에 진행하지 않고, 정상적으로 동작하는 코드를 기준으로 자동 배포부터 구축하는 방향을 정하는 데 도움이 되었다.

오류가 발생했을 때도 결과 화면이나 로그를 전달하고 원인을 질문하면서 다음 확인 범위를 좁힐 수 있었다.

이번 과제에서 AI는 다음 역할로 활용하였다.

- 작업 순서 결정
- Docker Compose 구조 검토
- GitHub Actions Job 분리
- Job 의존 관계 구성
- SSH와 Secrets 설정 안내
- 실행 화면과 로그 해석
- 배포 검증 기준 정리

앞으로는 로컬에서 기능을 구현하고 충분히 테스트한 뒤 Push하고, GitHub Actions가 자동 검증과 배포를 수행하도록 사용할 예정이다.

AI한테 현재 상황을 설명하고 질문하면서 배포 과정과 오류 원인을 이해하는 도구로 활용하였다.
