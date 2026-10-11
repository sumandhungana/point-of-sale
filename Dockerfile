# Unified Dockerfile for point-of-sale
FROM eclipse-temurin:21-jdk-jammy

# Install Node.js 20, npm, dos2unix, and procps
RUN apt-get update && \
    apt-get install -y curl dos2unix procps && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Build backend-service
COPY backend-service/ ./backend-service/
WORKDIR /app/backend-service
RUN dos2unix ./gradlew && chmod +x ./gradlew && ln -s /app/backend-service/gradlew /usr/local/bin/gradle
RUN gradle clean build -x test --no-daemon

# 2. Setup frontend
WORKDIR /app
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm install

# 3. Setup launcher entrypoint
WORKDIR /app
COPY entrypoint.sh ./
RUN dos2unix ./entrypoint.sh && chmod +x ./entrypoint.sh

# Expose backend (8080) and frontend (5173) ports
EXPOSE 8080 5173

CMD ["./entrypoint.sh"]
