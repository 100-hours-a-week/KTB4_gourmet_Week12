# KTB4_gourmet_Week11

# 11주차 회고 및 AI 사용 기록

---

# 1. 회고

## 1.1 이번 주에 진행한 작업

이번 주에는 Gourmet Community 프로젝트를 AWS EC2에 배포하고, EC2 운영체제에 직접 설치하는 방식과 Docker Compose를 이용하는 방식을 각각 구성하였다.

첫 번째 과제에서는 React, Spring Boot, MySQL, Nginx를 EC2 한 대에 직접 설치하였다. React는 운영용 정적 파일로 빌드한 뒤 Nginx가 제공하도록 구성했고, Spring Boot는 실행 가능한 JAR 파일을 생성하여 systemd 서비스로 등록하였다. Nginx는 외부 요청을 받는 단일 진입점으로 사용하고, `/api` 요청은 EC2 내부에서 실행 중인 Spring Boot의 8080번 포트로 전달하도록 설정하였다.

두 번째 과제에서는 React와 Spring Boot에 각각 멀티스테이지 Dockerfile을 작성하였다. MySQL, Spring Boot, React와 Nginx를 Docker Compose로 통합하여 한 번의 명령으로 전체 서비스를 실행할 수 있도록 구성하였다.

---

## 1.2 EC2 직접 배포를 진행하며 배운 점

배포를 시작하기 전에는 빌드된 프로젝트를 서버에서 실행하면 끝나는 작업이라고 생각하였다. 그러나 실제 배포를 진행하면서 다음 요소들이 모두 정상적으로 연결되어야 서비스가 동작한다는 것을 알게 되었다.

- EC2 인스턴스 생성
- 보안 그룹 인바운드 규칙
- Java와 Node.js 실행 환경
- MySQL 데이터베이스와 애플리케이션 계정
- Spring Boot 운영 환경 변수
- React 운영 빌드 결과물
- Spring Boot 프로세스 관리
- Nginx 정적 파일 제공
- Nginx 리버스 프록시
- 이미지 업로드 저장 경로

React는 로컬 개발 환경처럼 `npm run dev`를 계속 실행하는 방식이 아니었다. `npm run build`로 생성된 HTML, CSS, JavaScript 파일을 Nginx가 사용자에게 제공하도록 구성해야 했다.

반면 Spring Boot는 요청을 계속 처리하는 백엔드 프로세스가 필요하였다. 단순히 EC2 터미널에서 `java -jar` 명령을 실행하는 것보다 systemd 서비스로 등록하여 터미널 연결 여부와 관계없이 실행되도록 구성하였다.

이를 통해 EC2 Instance Connect 창은 실제 서버가 아니라 서버를 조작하기 위한 원격 터미널이라는 점도 이해하였다. 연결 창을 닫아도 EC2 인스턴스와 systemd 서비스가 실행 중이라면 사이트는 계속 동작한다.

---

## 1.3 보안 그룹과 포트 구성

외부 사용자는 Nginx가 실행되는 80번 포트로만 서비스에 접근하도록 구성하였다.

사용한 주요 포트는 다음과 같다.

| 포트 | 용도 | 외부 공개 여부 |
|---:|---|---|
| 22 | SSH 및 EC2 Instance Connect | 제한적으로 공개 |
| 80 | Nginx HTTP 요청 | 공개 |
| 8080 | Spring Boot | 공개하지 않음 |
| 3306 | MySQL | 공개하지 않음 |
| 5173 | Vite 개발 서버 | 공개하지 않음 |

Spring Boot의 8080번 포트와 MySQL의 3306번 포트를 외부에 직접 공개하지 않고 Nginx를 통해서만 요청이 들어오도록 구성하였다.

이를 통해 Nginx 리버스 프록시는 단순히 요청을 전달하는 기능뿐만 아니라 외부 사용자가 접근하는 서비스의 진입점을 하나로 통합하는 역할도 한다는 것을 이해하였다.

---

## 1.4 Nginx 리버스 프록시를 구성하며 배운 점

Nginx는 다음과 같은 역할을 수행하도록 설정하였다.

```text
/
→ React 정적 파일 제공

/api/*
→ Spring Boot로 요청 전달

/uploads/*
→ Spring Boot의 이미지 경로로 요청 전달
```

프론트엔드에서 `/api/users`, `/api/posts`와 같은 주소로 요청하면 Nginx가 이를 Spring Boot로 전달하였다.

React Router 경로로 직접 접근하거나 새로고침했을 때 404 오류가 발생하지 않도록 다음 설정도 적용하였다.

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

이를 통해 서버에 실제 파일이 없는 React 경로로 접근하더라도 `index.html`을 반환하고, React Router가 화면을 처리하도록 구성할 수 있었다.

---

## 1.5 Spring Boot 빌드 과정에서 발생한 문제

EC2에서 다음 명령으로 Spring Boot 테스트와 JAR 빌드를 진행하였다.

```bash
./gradlew clean test bootJar
```

빌드 과정에서 비밀번호 변경 DTO와 테스트 코드가 일치하지 않아 다음과 같은 컴파일 오류가 발생하였다.

```text
cannot find symbol
request.getPassword()
```

비밀번호 변경 DTO는 현재 비밀번호와 새로운 비밀번호를 함께 받도록 변경되어 있었지만, 테스트 코드에서는 이전 메서드를 사용하고 있었다.

테스트 코드를 현재 DTO 구조에 맞게 수정하였다.

```java
when(request.getCurrentPassword()).thenReturn("Old1234!");
when(request.getNewPassword()).thenReturn("New1234!");
```

수정 후 로컬에서 테스트를 실행하고 GitHub에 Push하였다. 이후 EC2에서 최신 코드를 받아 다시 빌드하여 다음 결과를 확인하였다.

```text
BUILD SUCCESSFUL
```

이 과정을 통해 실제 기능이 정상적으로 동작하더라도 테스트 코드가 현재 서비스의 구조와 일치하지 않으면 배포용 결과물을 생성할 수 없다는 점을 알게 되었다.

또한 배포 전에 테스트를 통과한 결과물을 만드는 과정이 중요하다는 것을 경험하였다.

---

## 1.6 환경 변수 관리

MySQL 비밀번호와 JWT Secret 같은 민감한 값은 소스 코드에 직접 작성하지 않았다.

EC2 직접 배포에서는 다음 파일에서 운영 환경 변수를 관리하였다.

```text
/etc/gourmet-community/gourmet.env
```

주요 환경 변수는 다음과 같다.

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
JWT_SECRET
SPRING_JPA_HIBERNATE_DDL_AUTO
UPLOAD_DIR
```

실제 비밀번호와 JWT Secret 값은 GitHub, README, 과제 문서에 포함하지 않았다.

환경 변수 파일의 접근 권한도 제한하였다.

```bash
sudo chmod 600 /etc/gourmet-community/gourmet.env
```

이를 통해 설정값을 소스 코드와 분리하고 민감한 정보가 GitHub에 노출되지 않도록 관리할 수 있었다.

---

## 1.7 Docker 멀티스테이지 빌드를 적용하며 배운 점

Spring Boot와 React 모두 빌드에 필요한 환경과 실제 실행에 필요한 환경이 다르다는 것을 알게 되었다.

### Spring Boot

```text
빌드 단계
→ Java 21 JDK와 Gradle을 사용하여 JAR 생성

실행 단계
→ Java 21 JRE와 생성된 JAR만 사용
```

### React

```text
빌드 단계
→ Node.js 22에서 npm ci, lint, Vite build 실행

실행 단계
→ Nginx와 dist 정적 파일만 사용
```

Spring Boot의 최종 이미지에는 Gradle과 JDK 전체를 포함하지 않고 JRE와 실행 가능한 JAR만 포함하였다.

React의 최종 이미지에도 Node.js 개발 환경과 `node_modules`를 모두 포함하지 않고 Nginx와 운영 빌드 결과물만 포함하였다.

멀티스테이지 빌드는 단순히 Dockerfile을 여러 단계로 나누는 것이 아니라 빌드 환경과 실행 환경의 책임을 분리하는 방법이라는 것을 이해하였다.

---

## 1.8 Docker Compose를 구성하며 배운 점

Docker Compose를 사용하여 다음 서비스를 하나의 실행 단위로 구성하였다.

- Frontend와 Nginx
- Spring Boot Backend
- MySQL
- Docker Network
- MySQL 데이터 Volume
- 이미지 업로드 Volume

전체 서비스는 다음 명령으로 실행하였다.

```bash
docker compose up -d
```

컨테이너 상태는 다음 명령으로 확인하였다.

```bash
docker compose ps
```

정상 실행 상태는 다음과 같았다.

```text
gourmet-db          running (healthy)
gourmet-backend     running
gourmet-frontend    running
```

과제 1에서는 EC2에 Java, Node.js, MySQL, Nginx를 직접 설치하고 각 프로그램을 개별적으로 관리해야 했다.

Docker Compose를 적용한 뒤에는 서비스의 이미지, 환경 변수, 네트워크, 실행 순서와 저장 공간을 파일로 관리할 수 있었다.

이를 통해 Docker와 Compose가 설치된 다른 서버에서도 같은 구성으로 서비스를 다시 생성할 수 있는 기반을 마련하였다.

---

## 1.9 Docker Compose 실행 중 발생한 문제

Docker 이미지를 정상적으로 빌드한 뒤 홈 디렉터리에서 다음 명령을 실행하였다.

```bash
docker compose up -d
```

그러나 다음 오류가 발생하였다.

```text
no configuration file provided: not found
```

문제의 원인은 Docker Compose가 현재 작업 디렉터리에서 `compose.yaml` 파일을 찾기 때문이었다.

다음과 같이 Compose 파일이 있는 디렉터리로 이동한 뒤 다시 실행하여 해결하였다.

```bash
cd ~/KTB4_gourmet_Week11/Assignment
docker compose up -d
```

이를 통해 명령어 자체가 맞더라도 현재 작업 경로가 다르면 원하는 파일을 찾지 못할 수 있다는 점을 다시 확인하였다.

---

## 1.10 배포 검증 방법

브라우저에서 화면이 표시되는 것만으로는 전체 배포가 성공했다고 판단할 수 없었다.

다음과 같이 각 구간을 나누어 확인하였다.

### Frontend와 Nginx 확인

```bash
curl -I http://127.0.0.1/
```

결과:

```text
HTTP/1.1 200 OK
```

Frontend 컨테이너의 Nginx가 React 정적 파일을 정상적으로 제공하고 있음을 확인하였다.

### Nginx와 Backend 연결 확인

```bash
curl -i http://127.0.0.1/api/users/me
```

결과:

```text
HTTP/1.1 401
인증이 필요합니다.
```

로그인 정보가 없는 요청이므로 401 응답은 정상적인 Spring Security 응답이었다.

이 결과를 통해 다음 요청 흐름이 정상적으로 연결된 것을 확인하였다.

```text
EC2 80번 포트
→ Nginx
→ Spring Boot
→ Spring Security
```

### MySQL 확인

MySQL 컨테이너 내부에서 다음 명령으로 테이블을 확인하였다.

```bash
docker compose exec db sh -c \
'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SHOW TABLES;"'
```

`users`, `posts`, `comments`, `post_likes` 등의 테이블이 생성된 것을 확인하였다.

---

## 1.11 최종 회고

과제를 하는 것에 있어서 늦은 이유는 기능 2개를 추가하고 나서 리액트 마이그레이션을 진행했고 배포까지 한번에 하려 해서 많이 늦었던 것 같다. 

11주차까지 끝냈고 이제 12주차에서 github action 과제를 빠르게 끝내고 난 뒤에 남은 기능 2가지를 추가하여 이번주 12주차에 과제를 제출하면서 기능 구현을 마무리 지을 생각을 하고 있다. 

다음주에는 피드백 기반으로 성능 개선이랑 문제가 되는 부분을 고치면서 테스트 과정을 거칠 생각이다.

EC2 직접 설치 방식과 Docker Compose 방식을 모두 수행하면서 두 배포 방식의 차이를 명확하게 확인할 수 있었다.

직접 설치 방식은 서버에 필요한 프로그램을 하나씩 설치하고 설정 파일과 프로세스를 개별적으로 관리해야 했다.

Docker 방식은 애플리케이션의 실행 환경과 서비스 관계를 Dockerfile과 Compose 파일에 작성할 수 있어 환경을 다시 구성하기 쉬웠다.

이번 과정을 통해 다음 내용을 직접 경험한 점이 가장 의미 있었다.

- React와 Spring Boot의 운영 실행 방식 차이
- Nginx 정적 파일 제공
- Nginx 리버스 프록시 구성
- systemd를 이용한 Spring Boot 프로세스 관리
- MySQL 사용자와 환경 변수 분리
- 멀티스테이지 Docker 이미지 빌드
- Docker Network를 이용한 컨테이너 통신
- MySQL Health Check
- Named Volume을 이용한 데이터 유지
- 배포 후 단계별 검증 과정

현재는 EC2에 직접 접속하여 최신 코드를 받고 다음 명령을 실행하는 수동 배포 방식이다.

```bash
git pull origin main
docker compose up -d --build
```

---

# 2. AI 사용 기록

## 2.1 AI 사용 목적

이번 과제에서는 AWS EC2에 처음으로 React와 Spring Boot 프로젝트를 배포해봤다.

배포 과정이 처음이었기 때문에 전체 작업 순서를 정리하고, 각 단계에서 발생한 오류의 원인을 확인하기 위해 AI를 활용하였다.

주로 다음 작업에서 AI를 활용하였다.

- EC2 생성 이후 배포 순서 정리
- 보안 그룹 포트 설정 확인
- EC2 접속 오류 원인 확인
- Java, MySQL, Nginx, Node.js 설치 순서 확인
- Spring Boot JAR 빌드 방법 확인
- 테스트 실패 로그 분석
- systemd 서비스 등록 방법 확인
- React 운영 빌드 방법 확인
- Nginx 리버스 프록시 설정 확인
- Dockerfile 구조 설계
- Docker Compose 서비스 구성
- 오류 메시지 분석
- 배포 결과 검증 명령 확인

---

## 2.2 EC2 접속 과정에서의 AI 활용

처음 SSH 접속을 시도했을 때 연결이 바로 종료되었고, 브라우저 기반 EC2 Instance Connect도 연결되지 않았다.

AI에게 다음 정보를 전달하였다.

- EC2 실행 상태
- 상태 검사 결과
- 보안 그룹 인바운드 규칙
- SSH 실행 결과
- EC2 Instance Connect 오류 화면

AI의 설명을 참고하여 EC2 인스턴스의 운영체제 사용자 이름, 퍼블릭 IP, 키페어와 보안 그룹을 다시 확인하였다.

EC2 Instance Connect를 위한 접근 규칙을 추가한 뒤 브라우저 터미널로 접속할 수 있었다.

이후 터미널 프롬프트가 다음과 같이 표시되는 것을 확인하였다.

```text
ubuntu@ip-172-xx-xx-xx:~$
```

이를 통해 로컬 컴퓨터가 아니라 EC2 서버 내부에 접속한 상태임을 확인하였다.

---

## 2.3 패키지 업데이트와 Swap 설정에서의 AI 활용

Ubuntu 패키지 업데이트를 진행하는 중 화면이 멈춘 것처럼 보이는 상황이 발생하였다.

AI에게 현재 터미널 화면을 전달하여 작업이 실제로 실행 중인지 질문하였다.

AI의 안내를 참고하여 다음 명령으로 `apt`, `dpkg` 프로세스를 확인하였다.

```bash
ps aux | grep -E 'apt|dpkg|needrestart'
```

업데이트 완료 후에는 `t3.micro`의 낮은 메모리를 보완하기 위해 Swap 설정 방법을 질문하였다.

AI가 제시한 명령을 적용한 뒤 다음 명령으로 결과를 확인하였다.

```bash
free -h
swapon --show
```

출력 결과에서 2GB Swap이 활성화된 것을 직접 확인하였다.

---

## 2.4 프로그램 설치 과정에서의 AI 활용

EC2에 필요한 프로그램과 설치 순서를 질문하였다.

AI는 다음 순서로 설치하는 방법을 안내하였다.

```text
Git
→ Java 21
→ MySQL
→ Nginx
→ Node.js 22
```

설치 후에는 각 버전을 직접 확인하였다.

```bash
git --version
java --version
javac --version
mysql --version
nginx -v
node --version
npm --version
```

프로그램이 설치되었다는 사실만 확인하지 않고 실제 프로젝트의 Java 버전과 Vite가 요구하는 Node.js 버전에 맞는지도 확인하였다.

---

## 2.5 systemd 서비스 등록 과정에서의 AI 활용

Spring Boot를 EC2 터미널에서 직접 실행하는 방식과 systemd 서비스로 등록하는 방식의 차이를 질문하였다.

AI는 다음 순서로 구성하는 방법을 안내하였다.

```text
JAR 운영 경로 생성
→ 환경 변수 파일 작성
→ systemd 서비스 파일 작성
→ 서비스 활성화
→ 서비스 실행
```

안내를 참고하여 Spring Boot를 `gourmet-community.service`로 등록하였다.

실행 상태는 다음 명령으로 확인하였다.

```bash
sudo systemctl status gourmet-community
sudo ss -ltnp | grep 8080
```

AI에게 상태 화면을 전달하여 `active (running)` 상태와 8080번 포트가 정상인지 확인받았다.

이후 브라우저 연결 창을 닫아도 사이트가 계속 동작하는지 직접 확인하였다.

---

## 2.6 Nginx 설정 과정에서의 AI 활용

React 운영 빌드 결과를 Nginx가 제공하고 `/api` 요청을 Spring Boot로 전달하는 방법을 질문하였다.

AI는 다음 경로 구조를 안내하였다.

```text
/
→ React 정적 파일

/api/
→ Spring Boot

/uploads/
→ Spring Boot 이미지 경로
```

안내를 참고하여 Nginx 설정 파일을 작성하였다.

설정 적용 전 다음 명령으로 문법을 직접 검사하였다.

```bash
sudo nginx -t
```

정상 결과를 확인한 후 설정을 적용하였다.

```bash
sudo systemctl reload nginx
```

배포 주소에서 React 화면이 표시되는지 확인하고, 회원가입과 로그인 기능을 직접 실행하여 Nginx와 Spring Boot가 정상적으로 연결되었는지 검증하였다.

---

## 2.7 Dockerfile 작성 과정에서의 AI 활용

React와 Spring Boot 모두 멀티스테이지 빌드를 적용해야 했기 때문에 현재 기술 스택에 맞는 Dockerfile 구조를 질문하였다.

AI의 설명을 참고하여 다음 구조로 작성하였다.

```text
Spring Boot
JDK 빌드 단계
→ JRE 실행 단계

React
Node.js 빌드 단계
→ Nginx 실행 단계
```

AI가 제시한 구조를 그대로 사용하는 대신 다음 항목을 직접 확인하였다.

- Java 버전이 프로젝트와 일치하는지
- Node.js 버전이 Vite 요구사항을 만족하는지
- Gradle Wrapper가 정상적으로 복사되는지
- 실제 실행 가능한 JAR 파일이 선택되는지
- React `dist`가 Nginx 경로로 복사되는지
- 비밀 설정 파일이 `.dockerignore`에 포함되는지

Dockerfile 작성 후 EC2에서 실제 이미지 빌드를 진행하여 정상적으로 완료되는지 확인하였다.

---

## 2.8 Docker Compose 작성 과정에서의 AI 활용

Frontend, Backend, MySQL을 한 번에 실행하기 위한 Compose 구조를 질문하였다.

AI는 다음 항목을 포함한 구성을 설명하였다.

- MySQL 환경 변수
- Backend 환경 변수
- MySQL Health Check
- Backend의 DB 준비 상태 의존
- Docker Bridge Network
- MySQL Named Volume
- 이미지 업로드 Named Volume
- 외부 80번 포트 공개
- `.env` 파일을 통한 비밀값 관리

작성 후 다음 명령으로 Compose 문법을 직접 확인하였다.

```bash
docker compose config --quiet
```

아무 오류 없이 명령이 종료되는 것을 확인한 뒤 이미지 빌드를 진행하였다.

---

## 2.9 배포 검증 과정에서의 AI 활용

컨테이너가 실행 중인 것만으로 전체 서비스가 정상이라고 판단하기 어려워 배포 검증 순서를 질문하였다.

AI의 안내를 참고하여 다음 순서로 검증하였다.

### 컨테이너 상태 확인

```bash
docker compose ps
```

### Frontend와 Nginx 확인

```bash
curl -I http://127.0.0.1/
```

결과:

```text
HTTP/1.1 200 OK
```

### Nginx와 Backend 연결 확인

```bash
curl -i http://127.0.0.1/api/users/me
```

결과:

```text
HTTP/1.1 401
인증이 필요합니다.
```

AI에게 해당 결과를 전달하여 401 응답은 서버 연결 실패가 아니라 인증 정보가 없는 요청에 대한 정상적인 Spring Security 응답이라는 설명을 들었다.

### MySQL 확인

```bash
docker compose exec db sh -c \
'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SHOW TABLES;"'
```

테이블 생성 여부를 직접 확인하였다.

### 실제 브라우저 기능 확인

다음 기능은 명령 결과만으로 판단하지 않고 배포 사이트에서 직접 실행하였다.

- 회원가입
- 로그인
- 게시글 작성
- 게시글 조회
- 댓글 작성
- 좋아요
- 검색
- 이미지 업로드
- 새로고침 후 로그인 상태 유지
- 로그아웃

---

## 2.10 AI 사용 결과

AI를 활용하여 처음 접하는 배포 과정을 작은 단계로 나누어 진행할 수 있었다.

특히 오류가 발생했을 때 현재 화면, 로그와 명령 실행 결과를 전달하고 원인을 질문하는 방식이 도움이 되었다.

AI를 통해 다음 내용을 빠르게 정리할 수 있었다.

- 전체 배포 순서
- 실행 환경 설치와 확인 방법
- EC2 접속 오류 확인 방법
- Spring Boot 운영 실행 방식
- Nginx 리버스 프록시 구조
- Docker 멀티스테이지 빌드 구조
- Docker Compose 서비스 관계
- 컨테이너 간 통신 방식
- 오류 메시지의 의미
- 배포 결과 검증 방법

다만 AI 답변을 그대로 적용하지 않고 현재 프로젝트의 경로, 포트, 파일 이름, 환경 변수와 일치하는지 확인한 뒤 사용하였다.

이번 과제를 통해 AI는 배포를 대신 수행하는 도구라기보다, 현재 상황을 설명하고 다음 확인 항목을 질문하면서 문제 해결 범위를 좁히는 보조 도구로 활용하는 것이 적절하다고 느꼈다.
