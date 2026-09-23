# Stage 1: Build Application
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Copy Maven Wrapper and POM
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B

# Copy source code and build package
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Production JRE Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user and group
RUN addgroup -S findit && adduser -S findit -G findit

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads/items && chown -R findit:findit /app

# Copy built jar from builder
COPY --from=builder --chown=findit:findit /app/target/*.jar app.jar

USER findit

EXPOSE 8080

ENV SERVER_PORT=8080 \
    APP_UPLOAD_DIR=/app/uploads/items

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]
