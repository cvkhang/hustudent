# HUStudent Project

A full-stack web application with React (Vite) frontend and Express.js backend.

## Project Structure

```
hustudent/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
└── backend/           # Express.js backend
    ├── routes/        # API routes
    ├── controllers/   # Route controllers
    ├── models/        # Data models
    ├── middleware/    # Custom middleware
    ├── config/        # Configuration files
    ├── server.js      # Entry point
    └── package.json
```

## Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:5000`

## Environment Variables

### Backend
Create a `.env` file in the `backend` directory:
```
PORT=5000
NODE_ENV=development
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

## Tech Stack

### Frontend
- React 18
- Vite
- ESLint

### Backend
- Express.js
- CORS
- dotenv
- nodemon (dev)

## License

ISC
