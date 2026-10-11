# Complete Production Deployment Guide on Debian 12 (Bookworm)

This guide provides end-to-end instructions for deploying the **Point of Sale (KhataBook)** application on a clean **Debian 12 (Bookworm)** server using Docker and Docker Compose.

---

## 📋 Table of Contents

1. [Server Requirements & Sizing](#1-server-requirements--sizing)
2. [Debian 12 System Preparation](#2-debian-12-system-preparation)
3. [Installing Docker Engine & Docker Compose on Debian 12](#3-installing-docker-engine--docker-compose-on-debian-12)
4. [Project Setup & Configuration](#4-project-setup--configuration)
5. [Production Docker Compose Configuration](#5-production-docker-compose-configuration)
6. [Database Schema Initialization](#6-database-schema-initialization)
7. [Nginx Reverse Proxy & SSL (Let's Encrypt)](#7-nginx-reverse-proxy--ssl-lets-encrypt)
8. [Automated Systemd Service (Auto-Start on Boot)](#8-automated-systemd-service-auto-start-on-boot)
9. [Automated Backups & Maintenance](#9-automated-backups--maintenance)
10. [Troubleshooting & Verification](#10-troubleshooting--verification)

---

## 1. Server Requirements & Sizing

| Metric | Minimum (Small Shop) | Recommended (Multi-Branch) |
|---|---|---|
| **CPU** | 2 vCPUs | 4 vCPUs |
| **RAM** | 2 GB (with Swap) | 4 GB - 8 GB |
| **Disk** | 25 GB SSD | 50+ GB NVMe SSD |
| **OS** | Debian 12 (Bookworm) 64-bit | Debian 12 (Bookworm) 64-bit |

---

## 2. Debian 12 System Preparation

### 2.1 Update System Packages
SSH into your Debian 12 server as root or a sudo user:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw htop fail2ban ca-certificates gnupg lsb-release
```

### 2.2 Configure Swap Space (Crucial for 2GB - 4GB RAM VPS)
Compiling frontend assets and running the Java JVM requires memory headroom:
```bash
# Check if swap exists
sudo swapon --show

# Create 4GB swapfile if none exists
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize swap aggressiveness
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

### 2.3 Configure Firewall (UFW)
Only expose necessary ports (`SSH`, `HTTP`, `HTTPS`). Never expose Postgres (`5432`) or Micronaut (`8080`) directly to the public internet:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
```

---

## 3. Installing Docker Engine & Docker Compose on Debian 12

Debian 12 packages for Docker should be installed from the official Docker APT repository:

### 3.1 Setup Docker's Official GPG Key & Repository
```bash
# Remove any conflicting distro packages
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove -y $pkg; done

# Add Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository for Debian Bookworm
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
```

### 3.2 Install Docker Engine and Compose Plugin
```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 3.3 Enable Docker and Add Current User
```bash
sudo systemctl enable --now docker containerd

# Allow non-root user to run docker (replace $USER if logged in as specific user)
sudo usermod -aG docker $USER
```

Verify installation:
```bash
docker --version
docker compose version
```

---

## 4. Project Setup & Configuration

### 4.1 Clone Repository to `/opt/point-of-sale`
```bash
sudo mkdir -p /opt/point-of-sale
sudo chown -R $USER:$USER /opt/point-of-sale
git clone <YOUR_GIT_REPOSITORY_URL> /opt/point-of-sale
cd /opt/point-of-sale
```

### 4.2 Create Production Environment File (`.env`)
Create `/opt/point-of-sale/.env`:
```bash
cat << 'EOF' > /opt/point-of-sale/.env
# Database Configuration
POSTGRES_DB=khatabook
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ChangeThisSecurePasswordInProduction123!

# Backend Configuration
MICRONAUT_ENVIRONMENTS=prod
R2DBC_DATASOURCES_DEFAULT_URL=r2dbc:pool:postgresql://postgres:5432/khatabook
R2DBC_DATASOURCES_DEFAULT_USERNAME=postgres
R2DBC_DATASOURCES_DEFAULT_PASSWORD=ChangeThisSecurePasswordInProduction123!
JAVA_TOOL_OPTIONS=-XX:+UseG1GC -Xmx1024m -Xms512m

# Frontend Configuration
VITE_API_BASE_URL=https://pos.yourdomain.com
EOF
```

Protect the secrets file:
```bash
chmod 600 /opt/point-of-sale/.env
```

---

## 5. Production Docker Compose Configuration

Use the included [docker-compose.yml](file:///d:/POS/point-of-sale/docker-compose.yml) configured with production settings:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: pos-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-khatabook}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-root}
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-khatabook}"]
      interval: 5s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "5"

  backend-service:
    build:
      context: ./backend-service
      dockerfile: Dockerfile
    container_name: pos-backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      R2DBC_DATASOURCES_DEFAULT_URL: ${R2DBC_DATASOURCES_DEFAULT_URL:-r2dbc:pool:postgresql://postgres:5432/khatabook}
      R2DBC_DATASOURCES_DEFAULT_USERNAME: ${POSTGRES_USER:-postgres}
      R2DBC_DATASOURCES_DEFAULT_PASSWORD: ${POSTGRES_PASSWORD:-root}
      JAVA_TOOL_OPTIONS: ${JAVA_TOOL_OPTIONS:--XX:+UseG1GC -Xmx1024m -Xms512m}
    ports:
      - "127.0.0.1:8080:8080"
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "5"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: pos-frontend
    restart: unless-stopped
    depends_on:
      - backend-service
    ports:
      - "127.0.0.1:5173:5173"
    environment:
      VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:8080}
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "5"

volumes:
  postgres_data:
```

### Start Services:
```bash
docker compose up -d --build
```

Verify all three containers are healthy:
```bash
docker compose ps
```

---

## 6. Database Schema Initialization

The system includes pre-configured DDL scripts in `backend-service/src/main/resources/patch/`. Execute them inside the PostgreSQL container:

```bash
# 1. Apply primary DDL (tables, foreign keys, indexes)
docker compose exec -T postgres psql -U postgres -d khatabook < backend-service/src/main/resources/patch/all_ddl_query_patch_beginning.sql

# 2. Apply member schema
docker compose exec -T postgres psql -U postgres -d khatabook < backend-service/src/main/resources/patch/member.sql

# 3. Apply roles and permissions
docker compose exec -T postgres psql -U postgres -d khatabook < backend-service/src/main/resources/patch/roles_permissions.sql

# 4. Apply payments & cashbook tables
docker compose exec -T postgres psql -U postgres -d khatabook < backend-service/src/main/resources/patch/payment.sql

# 5. Apply staff salaries table
docker compose exec -T postgres psql -U postgres -d khatabook < backend-service/src/main/resources/patch/create_staff_salaries.sql
```

Verify tables are created:
```bash
docker compose exec postgres psql -U postgres -d khatabook -c "\dt"
```

---

## 7. Nginx Reverse Proxy & SSL (Let's Encrypt)

Host Nginx terminates SSL, handles compression, and routes requests to the local Docker ports.

### 7.1 Install Nginx & Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 7.2 Create Nginx Server Block
Create `/etc/nginx/sites-available/pos.conf` (replace `pos.yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name pos.yourdomain.com;

    client_max_body_size 50M;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # API requests forwarded to Micronaut Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 120s;
    }

    # Frontend UI
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and test configuration:
```bash
sudo ln -s /etc/nginx/sites-available/pos.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7.3 Obtain Let's Encrypt SSL Certificate
Ensure your DNS `A` record points `pos.yourdomain.com` to the Debian server IP, then run:
```bash
sudo certbot --nginx -d pos.yourdomain.com
```

Certbot automatically configures HTTPS redirect and renews certificates via systemd timer (`systemctl status certbot.timer`).

Test auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## 8. Automated Systemd Service (Auto-Start on Boot)

Create a systemd unit so Docker Compose starts automatically upon server reboot:

Create `/etc/systemd/system/pos-docker.service`:
```ini
[Unit]
Description=Point of Sale Docker Compose Application
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/point-of-sale
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and activate the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable pos-docker.service
```

---

## 9. Automated Backups & Maintenance

### 9.1 Daily Automated PostgreSQL Backup Script
Create `/opt/point-of-sale/scripts/backup.sh`:
```bash
mkdir -p /opt/point-of-sale/scripts
cat << 'EOF' > /opt/point-of-sale/scripts/backup.sh
#!/bin/bash
BACKUP_DIR="/var/backups/postgres-khatabook"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

# Dump database through docker
docker compose -f /opt/point-of-sale/docker-compose.yml exec -T postgres pg_dump -U postgres -d khatabook | gzip > "$BACKUP_DIR/khatabook_$TIMESTAMP.sql.gz"

# Retain only last 14 days of backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete
echo "[$(date)] Backup completed: $BACKUP_DIR/khatabook_$TIMESTAMP.sql.gz"
EOF

chmod +x /opt/point-of-sale/scripts/backup.sh
```

Add to cron (runs every night at 2:00 AM):
```bash
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/point-of-sale/scripts/backup.sh >> /var/log/pos-backup.log 2>&1") | crontab -
```

### 9.2 Zero/Low-Downtime Application Update Script
Create `/opt/point-of-sale/scripts/deploy.sh`:
```bash
cat << 'EOF' > /opt/point-of-sale/scripts/deploy.sh
#!/bin/bash
set -e
cd /opt/point-of-sale

echo "Pulling latest changes..."
git pull origin main

echo "Rebuilding and updating containers..."
docker compose build --pull
docker compose up -d --remove-orphans

echo "Pruning unused images..."
docker image prune -f

echo "Deployment finished successfully!"
EOF

chmod +x /opt/point-of-sale/scripts/deploy.sh
```

---

## 10. Troubleshooting & Verification

### Common Diagnostic Commands:
```bash
# Check container statuses
docker compose ps

# View live backend logs
docker compose logs -f backend-service

# View live frontend logs
docker compose logs -f frontend

# Test API connectivity from host
curl -I http://127.0.0.1:8080/api/v1/user/login

# Test Nginx local proxy
curl -I -k https://127.0.0.1/api/v1/user/login

# Check disk space
df -h

# Check RAM and swap usage
free -h
```

### Restoring Database from Backup:
```bash
gunzip < /var/backups/postgres-khatabook/khatabook_YYYYMMDD_HHMMSS.sql.gz | docker compose exec -T postgres psql -U postgres -d khatabook
```
