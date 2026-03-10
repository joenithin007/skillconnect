# SkillConnect – Complete Setup Guide

## Project Structure
```
skillconnect/
├── backend/          ← Node.js + Express + MongoDB
│   ├── models/       ← User, Project, Request, Notification
│   ├── routes/       ← auth, users, projects, requests, notifications, admin
│   ├── middleware/   ← JWT auth
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/         ← React app
    ├── src/
    │   ├── context/  ← AuthContext (JWT + user state)
    │   ├── components/ ← Navbar, SkillTag, MatchScore
    │   └── pages/    ← All pages
    └── package.json
```

---

## Step 1: Prerequisites

Install these if not already installed:
- Node.js v16+ → https://nodejs.org
- MongoDB Community → https://www.mongodb.com/try/download/community
- Git (optional)

---

## Step 2: Backend Setup

```bash
cd skillconnect/backend
npm install
```

Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillconnect
JWT_SECRET=change_this_to_a_long_random_string_abc123xyz
JWT_EXPIRE=7d
```

Start MongoDB (in a separate terminal):
```bash
# macOS with Homebrew:
brew services start mongodb-community

# Windows: Start MongoDB from Services or run:
mongod

# Linux:
sudo systemctl start mongod
```

Start backend:
```bash
npm run dev     # with auto-reload (development)
# or
npm start       # production
```

You should see:
```
MongoDB connected
Server running on port 5000
```

---

## Step 3: Create Admin Account

After starting the backend, seed the database with demo accounts:

```bash
node seed.js
```

Or register manually at http://localhost:3000/register and then update role in MongoDB:
```javascript
// In MongoDB Compass or mongo shell:
use skillconnect
db.users.updateOne({ email: "admin@test.com" }, { $set: { role: "admin" } })
```

---

## Step 4: Frontend Setup

```bash
cd skillconnect/frontend
npm install
npm start
```

App opens at http://localhost:3000

---

## Step 5: Test Demo Accounts

After running `node seed.js` in the backend folder, you can log in with:

| Role    | Email              | Password    |
|---------|-------------------|-------------|
| Admin   | admin@test.com    | password123 |
| Faculty | faculty@test.com  | password123 |
| Student | student@test.com  | password123 |

---

## API Endpoints Reference

### Auth
- POST `/api/auth/register` – Register new user
- POST `/api/auth/login` – Login

### Users
- GET `/api/users/me` – Get own profile
- PUT `/api/users/me` – Update own profile
- GET `/api/users/students` – List all students (staff/admin)
- GET `/api/users/faculty` – List all faculty

### Projects
- GET `/api/projects` – Browse all projects (with ?status= and ?search=)
- GET `/api/projects/my` – Faculty's own projects
- GET `/api/projects/:id` – Project detail
- POST `/api/projects` – Create project (staff/admin)
- PUT `/api/projects/:id` – Update project
- DELETE `/api/projects/:id` – Delete project

### Requests
- POST `/api/requests` – Student applies to project
- GET `/api/requests/my` – Get own requests
- GET `/api/requests/project/:id` – Get requests for a project (faculty)
- PUT `/api/requests/:id` – Accept/reject request (faculty)

### Notifications
- GET `/api/notifications` – Get notifications
- PUT `/api/notifications/:id/read` – Mark one as read
- PUT `/api/notifications/read-all` – Mark all as read

### Admin
- GET `/api/admin/stats` – Dashboard stats
- GET `/api/admin/users` – All users
- PUT `/api/admin/users/:id/toggle` – Activate/deactivate user
- DELETE `/api/admin/users/:id` – Delete user
- GET `/api/admin/projects` – All projects

---

## Features Implemented

### Core Features
- ✅ JWT authentication with role-based access
- ✅ Student/Staff/Admin roles with separate dashboards
- ✅ Skill matching algorithm (percentage based)
- ✅ Project CRUD with max 5 students
- ✅ Request system with accept/reject
- ✅ Auto-close project when full
- ✅ Real-time notifications (polling every 30s)
- ✅ Admin panel with stats + user management

### Bonus Features
- ✅ Search & filter projects
- ✅ GPA display on student profiles
- ✅ GitHub & portfolio links
- ✅ Faculty can add notes when rejecting
- ✅ Project stipend and duration fields
- ✅ Prerequisites field
- ✅ Skill match score shown before applying
- ✅ Color-coded skill tags
- ✅ Profile editing

---

## Troubleshooting

**MongoDB connection error:**
- Make sure MongoDB is running
- Check MONGO_URI in .env

**CORS error in browser:**
- Backend must be running on port 5000
- Frontend proxy is set to http://localhost:5000

**JWT errors:**
- Make sure JWT_SECRET is set in .env
- Try clearing localStorage and logging in again

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```
