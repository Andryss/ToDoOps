# Runtime image only — JAR must be built separately (e.g. `mvn package`) and placed next to this file.
# Local: `cp target/backend-*.jar .` in this directory, then `docker build -t todoops-backend .`

FROM eclipse-temurin:17-jre-jammy
WORKDIR /opt/app

RUN mkdir -p /opt/app/logs

COPY target/backend-*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
