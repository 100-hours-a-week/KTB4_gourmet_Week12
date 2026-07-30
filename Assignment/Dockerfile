# 1단계: Spring Boot 애플리케이션 빌드
FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /workspace

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY src src

RUN chmod +x gradlew \
    && ./gradlew clean bootJar --no-daemon \
    && cp "$(find build/libs -maxdepth 1 -type f \
        -name '*.jar' ! -name '*-plain.jar' | head -1)" /workspace/app.jar


# 2단계: 빌드 도구 없이 JRE로만 실행
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

RUN mkdir -p /app/uploads

COPY --from=build /workspace/app.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]