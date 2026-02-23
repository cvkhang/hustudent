# HUStudent

A full-stack social learning platform for university students — enabling study groups, real-time chat, flashcards, quizzes, and social networking.

**Live:** [hustudent.id.vn](https://www.hustudent.id.vn) · **API Docs:** [Swagger](https://api.hustudent.id.vn/api-docs)

## Features

- **Authentication** — JWT-based login/register, password reset, refresh tokens
- **Study Groups** — Create/join groups, real-time chat (Socket.IO), file sharing, session scheduling
- **Flashcards & Quizzes** — Create, share, and study with auto-grading and gamified modes
- **Social Feed** — Posts, likes, comments, friend system, real-time notifications
- **Admin Dashboard** — User management, platform analytics

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, TailwindCSS, TanStack Query, Framer Motion, Socket.IO Client |
| Backend | Node.js, Express, Sequelize, Socket.IO, JWT, Multer |
| Database | Supabase (PostgreSQL + Storage) |
| Infrastructure | AWS (S3, EC2), Cloudflare, Docker, GitHub Actions CI/CD |

## Getting Started

```bash
git clone https://github.com/cvkhang/hustudent.git
cd hustudent
npm run install-all

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run both frontend & backend
npm run dev
```

Frontend runs at `localhost:5173`, backend at `localhost:3000`.

## Project Structure

```
hustudent/
├── frontend/           # React SPA
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/    # Auth, Socket providers
│       └── lib/        # API client, utilities
├── backend/            # REST API + WebSocket
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/         # Sequelize ORM
│   ├── middleware/
│   └── socket/
├── docs/
└── docker-compose.yml
```

## Deployment

CI/CD via GitHub Actions — push to `main` auto-deploys frontend to S3 and backend to EC2 via Docker.

```bash
# Manual deploy
docker compose up -d backend
```

