# Runtime image only — JAR must be built separately (`mvn package`) under target/, or supplied there by CI.
# Local: `mvn package` then `docker build -t todoops-backend .`

FROM eclipse-temurin:17-jre-jammy
WORKDIR /opt/app

RUN mkdir -p /opt/app/logs

COPY target/backend-*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
