# syntax=docker/dockerfile:1

FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Cache dependencies before copying sources
COPY gradle ./gradle
COPY gradlew settings.gradle build.gradle ./
RUN chmod +x gradlew

COPY src ./src
RUN ./gradlew --no-daemon bootJar -x test

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar /app/app.jar
ENV JAVA_OPTS=""
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
