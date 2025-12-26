# 🎓 HUStudent - Platform Học tập Xã hội

> Hệ thống quản lý học tập và kết nối sinh viên toàn diện với kiến trúc hiện đại, bảo mật cao và khả năng mở rộng tốt.

[![Deployment](https://img.shields.io/badge/Deployment-AWS-orange?logo=amazon-aws)](https://www.hustudent.id.vn)
[![CDN](https://img.shields.io/badge/CDN-Cloudflare-blue?logo=cloudflare)](https://cloudflare.com)
[![License](https://img.shields.io/badge/License-ISC-green)](LICENSE)

---

## 📖 Giới thiệu

**HUStudent** là một nền tảng web toàn diện giúp sinh viên:
- 📚 Tạo và tham gia nhóm học tập
- 💬 Nhắn tin, thảo luận theo thời gian thực
- 📝 Tạo và chia sẻ flashcard, quiz
- 🎮 Học qua trò chơi (Flashcard Match, Quiz Game)
- 📅 Lên lịch session học nhóm
- 🏆 Theo dõi tiến độ và thành tựu học tập

Hệ thống được xây dựng với **Client-Server Decoupled Architecture**, triển khai trên AWS Cloud với CI/CD tự động hóa hoàn toàn.

---

## ✨ Tính năng chính

### 🔐 Xác thực & Quản lý Người dùng
- Đăng ký/Đăng nhập với JWT Authentication
- Profile cá nhân có thể tùy chỉnh (avatar, cover, bio)
- Hệ thống bạn bè (gửi lời mời, chấp nhận, từ chối)

### 👥 Nhóm Học tập
- Tạo nhóm học với vai trò Admin/Member
- Tham gia/Rời nhóm
- Chat realtime trong nhóm (Socket.IO)
- Gửi file đính kèm trong chat
- Lên lịch study session với RSVP

### 📚 Học liệu
- **Flashcard**: Tạo bộ thẻ học, chia sẻ, học theo chế độ lật thẻ
- **Quiz**: Tạo bài quiz trắc nghiệm, chấm điểm tự động
- **Gamification**: Flashcard Matching Game, Quiz Timer Challenge

### 📱 Mạng xã hội
- Đăng bài, like, comment
- Feed tin tức cá nhân hóa
- Tìm kiếm người dùng, nhóm
- Thông báo realtime (like, comment, friend request, group invite)

### 📊 Theo dõi Tiến độ
- Thống kê điểm quiz
- Lịch sử học flashcard
- Bảng xếp hạng nhóm

---

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    User (Browser)                        │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare (CDN + WAF + SSL)               │
├─────────────────────┬───────────────────────────────────┤
│   Static Files      │        API/WebSocket              │
│   (Frontend)        │        (Backend)                  │
└────────┬────────────┴──────────────┬────────────────────┘
         │                           │
         ▼                           ▼
┌──────────────┐            ┌─────────────────┐
│   AWS S3     │            │   AWS EC2       │
│   Bucket     │            │   Docker Host   │
│ (React SPA)  │            │   (Node.js)     │
└──────────────┘            └────────┬────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   Supabase       │
                            │   PostgreSQL     │
                            │   + Storage      │
                            └──────────────────┘
```

**Đọc thêm:** [Tài liệu Kiến trúc Chi tiết](docs/DEPLOYMENT_GUIDE.md)

---

## 🛠️ Tech Stack

### Frontend
| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **React** | 19.2.0 | UI Framework |
| **Vite** | 7.2.4 | Build Tool |
| **React Router** | 7.11.0 | Client-side Routing |
| **TanStack Query** | 5.90.12 | Data Fetching & Caching |
| **Socket.IO Client** | 4.8.3 | Real-time Communication |
| **Tailwind CSS** | 4.1.18 | Styling |
| **Framer Motion** | 12.23.26 | Animations |
| **Lucide React** | 0.562.0 | Icons |

### Backend
| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **Node.js** | 20.19.6 | Runtime |
| **Express** | 5.0.1 | Web Framework |
| **Sequelize** | 6.37.6 | ORM (PostgreSQL) |
| **Socket.IO** | 4.8.3 | WebSocket Server |
| **JWT** | 9.0.2 | Authentication |
| **Bcrypt** | 5.1.1 | Password Hashing |
| **Multer** | 1.4.5-lts.1 | File Upload |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **AWS S3** | Static Hosting (Frontend) |
| **AWS EC2** | Compute (Backend) |
| **Supabase** | Database + File Storage |
| **Cloudflare** | CDN, SSL, WAF |
| **Docker** | Containerization |
| **GitHub Actions** | CI/CD Pipeline |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- Docker & Docker Compose (cho production)
- Git

### Development Setup

1. **Clone Repository**
```bash
git clone https://github.com/cvkhang/hustudent.git
cd hustudent
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Cấu hình .env với Database URL, JWT Secret, v.v.
npm run dev
```

Backend chạy tại `http://localhost:3000`

3. **Setup Frontend** (Terminal mới)
```bash
cd frontend
npm install
cp .env.example .env
# Cấu hình VITE_API_URL=http://localhost:3000/api
npm run dev
```

Frontend chạy tại `http://localhost:5173`

---

## 📦 Production Deployment

### Tự động với CI/CD
Chỉ cần push code lên nhánh `main`, GitHub Actions sẽ tự động:
1. Build Frontend → Upload lên S3
2. Build Backend Docker Image → Deploy lên EC2

**Hướng dẫn chi tiết:**
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Kiến trúc, flow, phân tích kỹ thuật
- [CI/CD Setup](docs/CICD_SETUP.md) - Cấu hình GitHub Secrets
- [Architecture Presentation](docs/PRESENTATION_ARCHITECTURE.md) - Tài liệu thuyết trình

### Thủ công với Docker Compose
```bash
# Trên server EC2
git clone https://github.com/cvkhang/hustudent.git
cd hustudent
docker compose up -d backend
```

---

## 📂 Cấu trúc Thư mục

```
hustudent/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context (Auth, Socket)
│   │   ├── lib/              # API client, utilities
│   │   └── layouts/          # Layout wrappers
│   ├── public/               # Static assets
│   ├── Dockerfile            # Multi-stage build config
│   └── vite.config.js
│
├── backend/                  # Node.js API Server
│   ├── routes/               # Express routes
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic
│   ├── models/               # Sequelize models
│   ├── middleware/           # Auth, validation, error handling
│   ├── config/               # Database, env config
│   ├── socket/               # Socket.IO handlers
│   ├── server.js             # Entry point
│   └── Dockerfile
│
├── docs/                     # Documentation
│   ├── DEPLOYMENT_GUIDE.md   # Comprehensive deployment docs
│   ├── CICD_SETUP.md         # CI/CD configuration
│   └── PRESENTATION_ARCHITECTURE.md
│
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions pipeline
│
├── docker-compose.yml        # Production orchestration
└── README.md
```

---

## 🔧 Scripts

### Frontend
```bash
npm run dev      # Start dev server (Vite)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

### Backend
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production start
```

---

## 🌐 Environment Variables

### Backend `.env`
```env
# Server
NODE_ENV=production
PORT=3000

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS
FRONTEND_URL=https://www.hustudent.id.vn
```

### Frontend `.env.production`
```env
VITE_API_URL=https://api.hustudent.id.vn/api
VITE_SOCKET_URL=https://api.hustudent.id.vn
```

---

## 📊 API Documentation

API được document với **Swagger UI**:
- **Local**: `http://localhost:3000/api-docs`
- **Production**: `https://api.hustudent.id.vn/api-docs`

### Các endpoint chính

#### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Làm mới token

#### Users
- `GET /api/users/me` - Lấy thông tin user hiện tại
- `PUT /api/users/profile` - Cập nhật profile
- `POST /api/users/avatar` - Upload avatar

#### Groups
- `GET /api/groups` - Danh sách nhóm
- `POST /api/groups` - Tạo nhóm mới
- `POST /api/groups/:id/join` - Tham gia nhóm
- `GET /api/groups/:id/messages` - Lấy tin nhắn nhóm

#### Flashcards & Quizzes
- `GET /api/flashcards/sets` - Danh sách bộ flashcard
- `POST /api/quizzes` - Tạo quiz mới
- `POST /api/quizzes/:id/submit` - Nộp bài quiz

**Xem đầy đủ:** [API Documentation](https://api.hustudent.id.vn/api-docs)

---

## 🧪 Testing

```bash
# Backend unit tests (future)
cd backend
npm test

# Frontend tests (future)
cd frontend
npm test
```

---

## 🤝 Contributing

1. Fork repository
2. Tạo branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

---

## 📝 License

Dự án này được phân phối dưới giấy phép **ISC License**.

---

## 👨‍💻 Team

- **Developer**: cvkhang
- **University**: Hanoi University of Science and Technology
- **Subject**: Web Application Development

---

## 🙏 Acknowledgments

- [React](https://react.dev) - UI Library
- [Vite](https://vitejs.dev) - Build Tool
- [Express](https://expressjs.com) - Backend Framework
- [Supabase](https://supabase.com) - Database & Storage
- [Cloudflare](https://cloudflare.com) - CDN & Security
- [AWS](https://aws.amazon.com) - Cloud Infrastructure

---

## 📞 Support

Nếu có vấn đề, vui lòng:
1. Kiểm tra [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) phần Troubleshooting
2. Xem [Issues](https://github.com/cvkhang/hustudent/issues)
3. Tạo Issue mới với label phù hợp

---

**Developed with ❤️ by HUStudent Team**
