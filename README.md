# HUStudent Project

A full-stack web application with React (Vite) frontend and Express.js backend.

## Features

- Study Groups & Scheduling (Module 5.4)
  - Create and join study groups
  - Admin/member role management
  - Schedule study sessions
  - RSVP to sessions (yes/no/cancel)
  - View upcoming and past sessions with attendee counts

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

## Module 5.4: Study Groups & Scheduling

### Manual Test Steps

1. **Create a Study Group**
   - Navigate to `/study-groups`
   - Click "Create New Group"
   - Fill in group name and description
   - Submit the form

2. **Join a Study Group**
   - From the groups list, click "Join Group" on any group
   - Confirm the join action

3. **Create a Study Session**
   - Click "View Sessions" on a group
   - Click "Create Session"
   - Fill in title, description, and date/time
   - Submit the form

4. **RSVP to a Session**
   - In the sessions list, RSVP buttons would be added in future updates
   - Currently, attendee count is displayed

5. **View Study Schedule**
   - Sessions are filtered by upcoming/past
   - Attendee counts are shown for each session

### API Endpoints

- `GET /api/study-groups` - List all groups
- `POST /api/study-groups/create` - Create new group
- `POST /api/study-groups/:groupId/join` - Join group
- `POST /api/study-groups/:groupId/leave` - Leave group
- `GET /api/study-groups/my` - Get user's groups
- `GET /api/study-groups/:groupId` - Get group details
- `POST /api/study-groups/:groupId/sessions` - Create session
- `GET /api/study-groups/:groupId/sessions?type=upcoming|past` - List sessions
- `POST /api/study-groups/sessions/:sessionId/rsvp` - RSVP to session

### Notes

- Data is stored in-memory for demo purposes
- Authentication is mocked (user ID = 1)
- Admin role is assigned to group creators
- Sessions show attendee counts based on RSVP status
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
