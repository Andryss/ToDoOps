# Stage 1: build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src/
RUN mvn package -DskipTests -Dcheckstyle.skip=true -B

# Stage 2: run
FROM openjdk:17.0.1-jdk-slim
WORKDIR /opt/app

RUN mkdir -p /opt/app/logs

COPY --from=build /app/target/backend-*.jar backend.jar

ENTRYPOINT ["java", "-jar", "backend.jar"]
