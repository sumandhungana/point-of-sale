#!/bin/bash
set -e

echo "=== Starting Point of Sale Services ==="

# Locate backend fat jar
JAR_FILE=$(ls /app/backend-service/build/libs/*-all.jar 2>/dev/null | head -n 1)
if [ -z "$JAR_FILE" ]; then
    JAR_FILE=$(ls /app/backend-service/build/libs/*.jar 2>/dev/null | grep -v "plain" | grep -v "javadoc" | grep -v "sources" | head -n 1)
fi

echo "Starting backend-service ($JAR_FILE) on port 8080..."
cd /app/backend-service
java -jar "$JAR_FILE" &
BACKEND_PID=$!

echo "Starting frontend dev server on port 5173..."
cd /app/frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

cleanup() {
    echo "Terminating services..."
    kill -TERM "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

wait -n "$BACKEND_PID" "$FRONTEND_PID"
