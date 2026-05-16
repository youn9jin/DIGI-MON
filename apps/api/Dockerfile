# syntax=docker/dockerfile:1.6
#
# DIGI-MON API (Spring Boot) — Railway 배포용 멀티 스테이지 Dockerfile
#
# 빌드 컨텍스트 전제: 레포 루트 (Railway Settings 의 Root Directory 는 비워둘 것).
# 모든 COPY 경로는 레포 루트 기준 상대경로.

# =========================
# 1) Build stage
# =========================
# Gradle 8.5 + JDK 17 — 프로젝트 wrapper(8.5) / java toolchain(17) 과 동일.
FROM gradle:8.5-jdk17 AS build

WORKDIR /workspace

# 의존성 캐시 친화적으로 변경이 적은 파일 먼저 복사
COPY gradlew gradlew
COPY gradle gradle
COPY settings.gradle settings.gradle
COPY build.gradle build.gradle
COPY apps/api/build.gradle apps/api/build.gradle

# 의존성 사전 다운로드 (소스 변경만 있을 때 캐시 재활용 목적)
RUN chmod +x ./gradlew \
 && ./gradlew :apps:api:dependencies --no-daemon || true

# 나머지 소스 복사 후 bootJar 생성 (테스트는 배포 빌드에서 제외)
COPY . .
RUN ./gradlew :apps:api:bootJar -x test --no-daemon

# =========================
# 2) Runtime stage
# =========================
FROM eclipse-temurin:17-jre

WORKDIR /app

# bootJar 산출물만 복사 (와일드카드로 version 변경에도 대응)
COPY --from=build /workspace/apps/api/build/libs/*.jar /app/app.jar

# Railway 등 외부에서 JAVA_OPTS 로 메모리/GC 옵션을 주입할 수 있도록 빈 default 유지
ENV JAVA_OPTS=""

EXPOSE 8080

# JAVA_OPTS 가 셸 변수로 평가되도록 sh -c 사용. exec 으로 PID 1 을 JVM 으로 승격해
# Railway 의 SIGTERM 이 그대로 JVM 에 전달되어 graceful shutdown 가능.
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
