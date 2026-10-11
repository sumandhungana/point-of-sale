# Skill: Docker Development & Verification Workflow

This skill explains how to build, run, and troubleshoot the containerized Point of Sale environment.

---

## 1. Quick Start Commands

### Start All Services (Detached Mode)
```bash
docker compose up -d --build
```

### Inspect Container Status
```bash
docker compose ps
```

### View Live Logs
```bash
# All containers
docker compose logs -f

# Specific container
docker compose logs -f backend-service
docker compose logs -f frontend
docker compose logs -f postgres
```

### Stop All Services
```bash
docker compose down
```

### Reset Database Volume
```bash
docker compose down -v
```

---

## 2. Ports and URLs

| Service | Port | Endpoint URL | Description |
|---|---|---|---|
| Frontend | 5173 | http://localhost:5173 | Vite React UI |
| Backend | 8080 | http://localhost:8080/api/v1 | Micronaut REST API |
| Postgres | 5432 | localhost:5432 | PostgreSQL (db: `khatabook`) |

---

## 3. Container Verification Checklist

1. **Verify Backend Health**:
   ```bash
   curl -i http://localhost:8080/api/v1/user/login
   ```
2. **Verify Frontend Dev Server**:
   ```bash
   curl -i http://localhost:5173
   ```
3. **Verify Database Connection**:
   ```bash
   docker compose exec postgres pg_isready -U postgres -d khatabook
   ```

---

## 4. Troubleshooting Common Issues

### Issue: gradlew fails with `\r: command not found`
- **Cause**: Windows CRLF line endings.
- **Solution**: The Dockerfile uses `dos2unix ./gradlew` during build to automatically sanitize line endings.

### Issue: Frontend cannot communicate with Backend
- **Cause**: In container networks, `localhost` inside a container points to itself.
- **Solution**: In browser, frontend runs in the client browser, so `http://localhost:8080` resolves directly to the host's published backend port. Verify CORS in `backend-service/src/main/resources/application.yml` allows `http://localhost:5173`.
