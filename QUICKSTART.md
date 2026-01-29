# 🚀 Quick Start Guide

## Prerequisites
- Node.js v18+ installed
- MongoDB running (local or Atlas)

## Step 1: Copy Environment Variables
```bash
cd server
copy .env.example .env
```

## Step 2: Configure MongoDB
Edit `server/.env` and update `MONGODB_URI` if using MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/video-streaming
```

## Step 3: Seed the Database
```bash
cd server
npm run seed
```

## Step 4: Start Development Servers
From the root directory:
```bash
npm run dev
```

This starts both:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Default Login Credentials
| Role   | Email              | Password  |
|--------|-------------------|-----------|
| Admin  | admin@example.com | admin123  |
| Editor | editor@example.com| editor123 |
| Viewer | viewer@example.com| viewer123 |

## Features by Role
- **Admin**: Full access to all videos, user management, can change video status
- **Editor**: Upload videos, manage own videos, view all safe videos
- **Viewer**: View and stream safe videos only
