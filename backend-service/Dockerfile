# Stage 1: Build the backend application
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# Install dos2unix to ensure Unix line endings on Windows checkouts
RUN apt-get update && apt-get install -y dos2unix && rm -rf /var/lib/apt/lists/*

# Copy gradle wrapper and build configuration
COPY gradlew ./
COPY gradle/ ./gradle/
COPY build.gradle.kts settings.gradle.kts gradle.properties* micronaut-cli.yml* ./

# Ensure gradlew is executable and alias gradle to gradlew
RUN dos2unix ./gradlew && chmod +x ./gradlew && ln -s /app/gradlew /usr/local/bin/gradle

# Copy source code
COPY src/ ./src/

# Execute gradle clean build (skipping tests for reproducible container build)
RUN gradle clean build -x test --no-daemon

# Stage 2: Minimal runtime image
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy the built shadow/fat jar
COPY --from=builder /app/build/libs/*-all.jar /app/app.jar

# Expose Micronaut HTTP server port
EXPOSE 8080

# Launch the application jar
CMD ["java", "-jar", "app.jar"]
