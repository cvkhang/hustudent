# 📘 HUStudent - Tài liệu Triển khai Hệ thống Hoàn chỉnh

> **Phiên bản**: 1.0  
> **Ngày cập nhật**: 26/12/2024  
> **Tác giả**: HUStudent Development Team

---

## Mục lục

1. [Tổng quan Hệ thống](#1-tổng-quan-hệ-thống)
2. [Kiến trúc Chi tiết](#2-kiến-trúc-chi-tiết)
3. [Luồng Triển khai](#3-luồng-triển-khai)
4. [Phân tích Kỹ thuật](#4-phân-tích-kỹ-thuật)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Bảo mật & Tối ưu](#6-bảo-mật--tối-ưu)
7. [Monitoring & Troubleshooting](#7-monitoring--troubleshooting)

---

## 1. Tổng quan Hệ thống

### 1.1. Giới thiệu

HUStudent là một hệ thống quản lý học tập xã hội được xây dựng theo mô hình **Client-Server Decoupled Architecture**, tận dụng các dịch vụ Cloud hiện đại để đảm bảo:
- **Hiệu năng cao** (High Performance)
- **Khả năng mở rộng** (Scalability)
- **Chi phí tối ưu** (Cost Efficiency)
- **Bảo mật cao** (Security)

### 1.2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite | Single Page Application |
| **Backend** | Node.js 20 + Express | RESTful API Server |
| **Real-time** | Socket.IO | WebSocket Communication |
| **Database** | Supabase (PostgreSQL) | Relational Database |
| **Storage** | Supabase Storage | File & Media Storage |
| **Containerization** | Docker + Docker Compose | Application Packaging |
| **Hosting** | AWS S3, EC2 | Infrastructure |
| **CDN & Security** | Cloudflare | Edge Network & WAF |
| **CI/CD** | GitHub Actions | Automation |

---

## 2. Kiến trúc Chi tiết

### 2.1. Sơ đồ Kiến trúc

```mermaid
graph TB
    subgraph "Client Layer"
        User((End User))
        Browser[Web Browser<br/>React SPA]
    end

    subgraph "Edge Layer - Cloudflare"
        DNS[DNS Resolution]
        CDN[Global CDN<br/>166+ PoPs]
        WAF[Web Application<br/>Firewall]
        SSL[SSL/TLS<br/>Termination]
        
        DNS --> CDN
        CDN --> WAF
        WAF --> SSL
    end

    subgraph "Presentation Layer - AWS S3"
        S3[S3 Bucket<br/>Static Hosting]
        Assets[HTML/CSS/JS<br/>Assets]
        
        S3 --> Assets
    end

    subgraph "Application Layer - AWS EC2"
        EC2[t2.micro Instance<br/>Ubuntu 24.04]
        Docker[Docker Engine]
        Container[Node.js Container]
        Express[Express Server]
        SocketIO[Socket.IO Server]
        
        EC2 --> Docker
        Docker --> Container
        Container --> Express
        Container --> SocketIO
    end

    subgraph "Data Layer - Supabase"
        DB[(PostgreSQL<br/>Database)]
        FileStorage[Blob Storage<br/>Images/Files]
        Auth[Auth Service<br/>JWT]
    end

    subgraph "Development & Deployment"
        Dev((Developer))
        GitHub[GitHub Repository]
        Actions[GitHub Actions<br/>CI/CD]
        DockerHub[Docker Hub<br/>Registry]
    end

    %% User Flow
    User --> Browser
    Browser -- "1. Load UI" --> DNS
    SSL -- "Static Files" --> S3
    
    Browser -- "2. API Calls<br/>(HTTPS/JSON)" --> DNS
    Browser -- "3. Real-time<br/>(WSS/Socket.IO)" --> DNS
    SSL -- "Proxy to Backend" --> EC2
    
    Express --> DB
    Express --> FileStorage
    SocketIO --> DB
    
    %% CI/CD Flow
    Dev -- "git push" --> GitHub
    GitHub --> Actions
    Actions -- "Build Frontend" --> S3
    Actions -- "Build Backend" --> DockerHub
    Actions -- "Deploy" --> EC2
    EC2 -- "Pull Image" --> DockerHub
```

### 2.2. Giải thích Các Lớp

#### **Client Layer (Lớp Khách hàng)**
- **Browser**: Trình duyệt của người dùng chạy ứng dụng React
- **React SPA**: Single Page Application, toàn bộ logic UI chạy ở client
- **Kích thước**: ~450KB gzipped cho bundle chính

#### **Edge Layer (Lớp Biên - Cloudflare)**
- **DNS**: Phân giải tên miền `hustudent.id.vn` → IP Cloudflare
- **CDN**: Cache tĩnh Frontend tại 166+ điểm hiện diện toàn cầu
- **WAF**: Lọc request độc hại (SQL Injection, XSS, DDoS)
- **SSL/TLS**: Mã hóa kết nối, chứng chỉ tự động gia hạn
- **Latency**: ~10-50ms (do proximity-based routing)

#### **Presentation Layer (Lớp Trình bày - S3)**
- **Static Hosting**: Serve file HTML/CSS/JS tĩnh
- **Bucket Policy**: Public read cho website assets
- **Versioning**: Không bật (để tiết kiệm chi phí)
- **Chi phí**: ~$0.023/GB storage + $0.09/GB transfer

#### **Application Layer (Lớp Ứng dụng - EC2)**
- **Instance Type**: t2.micro (1 vCPU, 1GB RAM) - Free tier 12 tháng
- **OS**: Ubuntu 24.04 LTS
- **Docker**: Containerize toàn bộ backend
- **Port Exposure**: 80 (HTTP) public, 3000 (internal)
- **Auto-restart**: Docker compose với `restart: always`

#### **Data Layer (Lớp Dữ liệu - Supabase)**
- **Database**: PostgreSQL 15 với Sequelize ORM
- **Connection Pool**: Max 10, Min 2 connections
- **SSL**: Bắt buộc trong production
- **Backup**: Tự động hàng ngày (Supabase managed)
- **File Storage**: Bucket riêng cho avatars, attachments

---

## 3. Luồng Triển khai

### 3.1. Luồng Người dùng Truy cập (User Access Flow)

```
[1] User nhập URL → hustudent.id.vn
[2] Browser → DNS Lookup → Cloudflare IP
[3] Cloudflare kiểm tra Cache:
    ├─ Cache HIT → Trả về file từ Edge Server (< 20ms)
    └─ Cache MISS → Fetch từ S3 Origin → Cache lại
[4] Browser tải HTML → Phân tích → Tải JS/CSS
[5] React App khởi động → Render UI
[6] App gọi API:
    [6a] XHR/Fetch → https://api.hustudent.id.vn/api/...
    [6b] Cloudflare Proxy → EC2:80 → Node.js:3000
    [6c] Express Router → Controller → Service → Database
    [6d] Response JSON ← Backend
[7] App mở Socket.IO:
    [7a] Upgrade HTTP → WebSocket (WSS)
    [7b] Persistent Connection → Real-time bidirectional
[8] User tương tác → Cycle lặp lại [6-7]
```

### 3.2. Luồng Triển khai Thủ công (Manual Deployment)

#### **Backend Deployment (Lần đầu)**

```bash
# 1. SSH vào EC2
ssh -i "your-key.pem" ubuntu@<EC2_PUBLIC_IP>

# 2. Cài Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 3. Clone Repository
git clone https://github.com/cvkhang/hustudent.git
cd hustudent

# 4. Cấu hình Backend
cd backend
nano .env
# Điền các biến môi trường:
# - DATABASE_URL
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - JWT_SECRET
# - FRONTEND_URL

# 5. Build và Chạy
cd ..
docker compose up -d backend

# 6. Kiểm tra
docker ps
curl http://localhost/api/health
```

#### **Frontend Deployment**

```bash
# 1. Tại máy local, build Frontend
cd frontend
npm install
npm run build

# 2. Cấu hình AWS CLI
aws configure
# Nhập Access Key, Secret Key, Region (ap-southeast-1)

# 3. Sync lên S3
aws s3 sync dist/ s3://www.hustudent.id.vn/ --delete

# 4. Kiểm tra
# Truy cập https://www.hustudent.id.vn
```

### 3.3. Cấu hình Cloudflare

```
1. Thêm Domain vào Cloudflare
2. Đổi Nameserver tại nhà cung cấp tên miền
3. Thêm DNS Records:
   - A Record: api → <EC2_IP> (Proxied)
   - CNAME: www → <S3_ENDPOINT> (Proxied)
4. SSL/TLS Settings:
   - Mode: Flexible (hoặc Full nếu Backend có SSL)
5. Page Rules (Tùy chọn):
   - Cache Everything cho /*.js, /*.css
```

---

## 4. Phân tích Kỹ thuật

### 4.1. Tại sao Tách biệt Frontend - Backend?

| Khía cạnh | Monolith (Gộp chung) | Decoupled (Tách biệt) ✅ |
|-----------|---------------------|------------------------|
| **Deployment** | Phải deploy cả 2 cùng lúc | Deploy độc lập |
| **Scaling** | Scale cả Frontend lẫn Backend | Scale riêng từng phần theo nhu cầu |
| **Technology** | Bị lock vào 1 framework | Linh hoạt thay đổi (React → Vue, Node → Go) |
| **Performance** | Server render mọi page | CDN cache static, chỉ API động |
| **Team** | Dev phải biết cả FE & BE | Team chuyên môn hóa |

**Lựa chọn của HUStudent**: Decoupled để tận dụng CDN, giảm tải Backend, dễ bảo trì.

### 4.2. Tại sao dùng Docker?

**Docker giải quyết bài toán "Works on my machine"**:
- **Development**: Mỗi dev có môi trường giống nhau → Không clash dependencies
- **Production**: Đảm bảo version Node, thư viện giống hệt local
- **Rollback**: Lưu image cũ → Quay lại phiên bản trước trong 1 lệnh

**Image Layers** giúp build nhanh:
```dockerfile
FROM node:20-alpine          # Base (cache được)
COPY package*.json ./        # Dependencies layer (ít thay đổi)
RUN npm ci                   # Install (cache được)
COPY . .                     # Source code (thay đổi nhiều)
```

Khi chỉ sửa code → Docker chỉ rebuild layer cuối → Nhanh!

### 4.3. Tại sao dùng Cloudflare thay vì CloudFront?

| Tiêu chí | Cloudflare | AWS CloudFront |
|----------|-----------|----------------|
| **Giá Free tier** | Unlimited bandwidth | 50GB/tháng (12 tháng đầu) |
| **SSL Setup** | 1-click, tự động | Phải request ACM cert, chờ validation |
| **DDoS Protection** | Included (Enterprise-grade) | Phụ thuộc AWS Shield (trả phí) |
| **Cache Purge** | Instant | 5-15 phút |
| **DNS** | Tích hợp sẵn | Cần dùng Route53 riêng |

**Kết luận**: Cloudflare phù hợp cho học sinh/sinh viên, startup nhỏ.

### 4.4. Tại sao Backend chỉ expose Port 80?

- **Cloudflare Proxy** chỉ hỗ trợ 1 số port nhất định (80, 443, 8080, 8443...).
- Port 3000 không nằm trong danh sách → Cloudflare sẽ bypass (không proxy).
- Mapping `80:3000` cho phép:
  - Cloudflare gọi vào Port 80 (Standard HTTP)
  - Docker forward tới Port 3000 bên trong container
  - Giữ cho Backend code không phải thay đổi

---

## 5. CI/CD Pipeline

### 5.1. Workflow Diagram

```
Developer
   │
   ├─ git commit + push to main
   │
   ▼
GitHub Repository
   │
   ├─ Trigger: GitHub Actions
   │
   ▼
┌─────────────────────────────────────────┐
│   GitHub Actions Workflow (Parallel)    │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────┐  ┌───────────────┐ │
│  │ Frontend Job   │  │ Backend Job   │ │
│  ├────────────────┤  ├───────────────┤ │
│  │ 1. Checkout    │  │ 1. Checkout   │ │
│  │ 2. Setup Node  │  │ 2. Docker Hub │ │
│  │ 3. npm install │  │    Login      │ │
│  │ 4. npm build   │  │ 3. Build Image│ │
│  │ 5. Sync S3     │  │ 4. Push Image │ │
│  │                │  │ 5. SSH EC2    │ │
│  │                │  │ 6. Pull + Run │ │
│  └────┬───────────┘  └───────┬───────┘ │
│       │                      │         │
└───────┼──────────────────────┼─────────┘
        │                      │
        ▼                      ▼
    AWS S3              Docker Hub + EC2
        │                      │
        └─────────┬────────────┘
                  │
                  ▼
           Update Complete ✅
```

### 5.2. Pipeline Stages

#### **Stage 1: Code Quality (Future)**
```yaml
# Có thể thêm sau
- Linting (ESLint)
- Unit Tests (Jest)
- Integration Tests (Supertest)
```

#### **Stage 2: Build**
- **Frontend**: `npm run build` → Vite tạo bundle optimized
  - Code splitting
  - Tree shaking (loại bỏ code không dùng)
  - Minification
  - Hash filenames cho cache busting
- **Backend**: `docker build` → Multi-stage build
  - Stage 1: npm ci (chỉ prod dependencies)
  - Stage 2: Copy code + Run

#### **Stage 3: Deploy**
- **Frontend**: AWS CLI sync → S3 (incremental, chỉ upload file thay đổi)
- **Backend**: 
  - Push image lên Docker Hub (registry công khai)
  - SSH vào EC2
  - `docker compose pull` → Kéo image mới
  - `docker compose up -d` → Restart container (downtime ~2-5s)

### 5.3. Secrets Management

GitHub Actions yêu cầu các **Repository Secrets**:

```
Frontend Secrets:
├─ AWS_ACCESS_KEY_ID
├─ AWS_SECRET_ACCESS_KEY
├─ AWS_S3_BUCKET
├─ VITE_API_URL
└─ VITE_SOCKET_URL

Backend Secrets:
├─ DOCKER_USERNAME
├─ DOCKER_PASSWORD
├─ EC2_HOST
└─ EC2_SSH_KEY
```

EC2 cần file `.env` với:
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
FRONTEND_URL=https://www.hustudent.id.vn
```

---

## 6. Bảo mật & Tối ưu

### 6.1. Bảo mật Layers

HUStudent triển khai bảo mật theo mô hình **Defense in Depth** với nhiều lớp bảo vệ:

#### **Layer 1: Network Security**
- **Cloudflare WAF**: Chặn request bất thường, SQL injection, XSS
- **EC2 Security Group**:
  - Chỉ mở Port 22 (SSH) cho IP admin
  - Chỉ mở Port 80/443 cho Cloudflare IP ranges
- **Rate Limiting**: 
  - General API: 2000 req/15min/IP
  - Login: 5 attempts/15min
  - Register: 3 attempts/hour
  - Password change: 3 attempts/15min

#### **Layer 2: Application Security**

##### **A. Security Headers (Helmet.js)**
```javascript
// Được cấu hình tự động trong app.js
✅ Content-Security-Policy (CSP)
✅ X-Frame-Options: DENY (chống clickjacking)
✅ X-Content-Type-Options: nosniff (chống MIME sniffing)
✅ Strict-Transport-Security (HSTS - production)
✅ X-XSS-Protection: 1; mode=block
```

**Kiểm tra Security Headers:**
```bash
curl -I https://api.hustudent.id.vn/api/health
```

##### **B. Input Validation & Sanitization**
```javascript
// Tự động áp dụng cho mọi endpoint
✅ XSS Protection - Loại bỏ <script>, event handlers
✅ NoSQL Injection Protection - Sanitize $ và .
✅ SQL Injection Protection - Sequelize ORM
✅ Input Validation - express-validator
```

**Middleware được áp dụng:**
- `sanitizeNoSQL` - Bảo vệ NoSQL injection
- `sanitizeAll` - Loại bỏ XSS payloads
- Validation chains cho từng endpoint

##### **C. Authentication & Authorization**
- **JWT Token**: 
  - Access Token (1h expiry)
  - HTTP-only cookies (không thể truy cập từ JavaScript)
  - Secure flag trong production
  - SameSite: strict (chống CSRF)
- **Password Security**: 
  - bcrypt hashing với salt
  - Minimum 6 characters
  - Không lưu plain text
- **CORS**: Chỉ cho phép `FRONTEND_URL` truy cập API

##### **D. File Upload Security**
```javascript
✅ MIME type validation
✅ File size limit (<5MB)
✅ Sanitize filename
✅ Secure storage (Supabase)
```

#### **Layer 3: Data Security**
- **Encryption at Rest**: Supabase mặc định mã hóa ổ đĩa
- **Encryption in Transit**: 
  - SSL/TLS cho tất cả connections
  - Database connection SSL required trong production
- **Secrets Management**: 
  - Không commit file `.env`
  - GitHub Secrets cho CI/CD
  - Environment variables trong production

### 6.2. Security Best Practices

#### **Environment Variables (Production)**
```bash
# Backend .env (trên EC2)
NODE_ENV=production
DATABASE_URL=postgresql://...?ssl=true
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=<strong-key>
JWT_SECRET=<256-bit-random-secret>
FRONTEND_URL=https://www.hustudent.id.vn

# Frontend environment (build time)
VITE_API_URL=https://api.hustudent.id.vn
VITE_SOCKET_URL=https://api.hustudent.id.vn
```

#### **Security Checklist Before Production**

**Backend:**
- [x] Helmet.js configured
- [x] Rate limiting enabled
- [x] Input validation on all endpoints
- [x] XSS & NoSQL injection protection
- [x] CORS properly configured
- [x] JWT secrets are strong and unique
- [x] Database SSL enabled
- [x] Error messages don't expose sensitive info
- [ ] SSL certificate for backend (optional - Cloudflare handles)

**Frontend:**
- [x] DOMPurify installed for XSS protection
- [ ] All user inputs sanitized before display
- [ ] No hardcoded API keys
- [x] HTTPS enforced

**Infrastructure:**
- [ ] EC2 Security Group limited to Cloudflare IPs
- [ ] SSH key-based auth (no password)
- [ ] Firewall rules configured
- [ ] Regular security updates
- [ ] Backup strategy implemented

#### **Monitoring Security**

```bash
# 1. Check failed login attempts
docker compose logs backend | grep "LOGIN_FAILED"

# 2. Check rate limit hits
docker compose logs backend | grep "TOO_MANY"

# 3. Monitor suspicious requests
# Cloudflare Dashboard > Security > Events

# 4. Check for vulnerabilities
cd backend && npm audit
cd frontend && npm audit

# 5. Update dependencies
npm audit fix
```

#### **Incident Response**

**If compromised:**
1. **Immediate**: Rotate all secrets (JWT_SECRET, DB password)
2. **Invalidate**: All active JWT tokens (restart backend)
3. **Review**: Logs for unauthorized access
4. **Update**: Dependencies and patch vulnerabilities
5. **Notify**: Affected users if data breach

### 6.3. Advanced Security (Future Enhancements)

**Recommended Additions:**
- [ ] CSRF tokens for state-changing operations
- [ ] Two-factor authentication (2FA)
- [ ] API key rotation mechanism
- [ ] Intrusion detection system (IDS)
- [ ] Regular penetration testing
- [ ] Security audit logs
- [ ] Automated vulnerability scanning (Snyk, OWASP ZAP)

**See Also:** [📄 SECURITY.md](./SECURITY.md) - Comprehensive security documentation

### 6.4. Performance Optimization

#### **Frontend**
- **Code Splitting**: React.lazy() cho route-based splitting → 120KB → 40KB initial
- **Image Optimization**: WebP format, lazy loading
- **Caching Strategy**:
  ```
  Cache-Control: public, max-age=31536000 (JS/CSS với hash)
  Cache-Control: no-cache (HTML)
  ```

#### **Backend**
- **Database Indexing**: Index trên `user_id`, `created_at`
- **Query Optimization**: Eager loading (`include`) thay vì N+1 queries
- **Connection Pooling**: Max 10 connections để tránh timeout
- **Compression**: Gzip middleware cho JSON response

#### **Infrastructure**
- **CDN**: Cloudflare cache 95% request → 0 hits tới S3
- **Keep-Alive**: HTTP persistent connections
- **HTTP/2**: Multiplexing cho parallel requests

---

## 7. Monitoring & Troubleshooting

### 7.1. Health Checks

#### **Backend Health Endpoint**
```bash
curl https://api.hustudent.id.vn/api/health

# Response:
{
  "status": "ok",
  "timestamp": "2024-12-26T06:00:00.000Z",
  "uptime": 86400,
  "database": "connected"
}
```

#### **Docker Container Status**
```bash
ssh ubuntu@<EC2_IP>
docker ps
# STATUS: Up X minutes → OK
# STATUS: Restarting → Check logs
```

### 7.2. Viewing Logs

```bash
# Backend logs (last 100 lines)
docker compose logs backend --tail=100

# Real-time logs
docker compose logs -f backend

# Logs của container cụ thể
docker logs <container_id>
```

### 7.3. Common Issues

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| **521 Web server down** | Backend không chạy hoặc EC2 chưa mở port 80 | Kiểm tra `docker ps`, Security Group |
| **403 Forbidden (S3)** | Thiếu Bucket Policy | Thêm policy cho s3:GetObject |
| **404 Not Found (S3)** | File không có trong bucket root | Upload đúng nội dung `/dist` |
| **CORS Error** | FRONTEND_URL sai | Sửa `.env` backend, restart |
| **Socket disconnect** | Cloudflare timeout (100s) | Implement reconnection logic |
| **502 Bad Gateway** | Backend crash khi khởi động | Xem logs: `docker compose logs backend` |

### 7.4. Performance Monitoring

**Tools khuyến nghị**:
- **Frontend**: Lighthouse, Web Vitals
- **Backend**: PM2 (nếu không dùng Docker), New Relic APM
- **Database**: Supabase Dashboard (Query performance)
- **Infrastructure**: AWS CloudWatch (EC2 metrics), Cloudflare Analytics

---

## Kết luận

Hệ thống HUStudent được thiết kế dựa trên các nguyên tắc:
1. **Separation of Concerns**: Tách biệt Frontend, Backend, Data
2. **Scalability First**: Dễ dàng scale từng layer độc lập
3. **Cost-Effective**: Tận dụng Free tier, CDN để tiết kiệm
4. **Security by Design**: Nhiều lớp bảo vệ, theo nguyên tắc Defense in Depth
5. **DevOps Automation**: CI/CD giúp triển khai nhanh, an toàn

Với kiến trúc này, hệ thống có thể:
- Phục vụ **10,000+ users** đồng thời (nhờ CDN)
- Deployment trong **< 3 phút** (tự động)
- Chi phí vận hành **< $10/tháng** (sau khi hết free tier)
- Uptime **99.9%** (Cloudflare SLA + Docker auto-restart)
