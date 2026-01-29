# 🎬 Video Streaming Platform

A production-grade MERN Stack Video Processing & Streaming Application with JWT Authentication, Role-Based Access Control (RBAC), Real-time Processing Events, and HTTP 206 Partial Content Streaming.

![Video Platform Banner](https://via.placeholder.com/1200x400/1a1a2e/16213e?text=Video+Streaming+Platform)

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with secure token management
- **Role-Based Access Control (RBAC)** with three roles:
  - **Admin**: Full access - manage all videos and users
  - **Editor**: Upload and manage their own videos
  - **Viewer**: Watch videos only

### 📹 Video Processing (Sensitivity Engine)
- Automated video processing simulation
- Real-time processing status updates via Socket.io
- Random status assignment: `safe` or `flagged`
- Metadata extraction support

### 🎥 Video Streaming
- **HTTP 206 Partial Content** streaming
- Support for video seeking and buffering
- Range header handling for efficient streaming

### 🖥️ Modern Frontend
- React + Vite for blazing fast development
- Tailwind CSS for beautiful, responsive UI
- Real-time upload progress bar
- Custom video player with streaming support
- Video grid with status badges

---

## 🏗️ Project Structure

```
/root
├── /server                 # Backend (Node/Express)
│   ├── /config             # Configuration files
│   ├── /controllers        # Route controllers
│   ├── /middleware         # Auth & other middleware
│   ├── /models             # MongoDB schemas
│   ├── /routes             # API routes
│   ├── /services           # Business logic
│   ├── /uploads            # Video storage
│   └── server.js           # Entry point
│
├── /client                 # Frontend (React + Vite)
│   ├── /src
│   │   ├── /components     # React components
│   │   ├── /contexts       # Auth context
│   │   ├── /hooks          # Custom hooks
│   │   ├── /pages          # Page components
│   │   ├── /services       # API services
│   │   └── /utils          # Utility functions
│   └── index.html
│
└── package.json            # Root package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and Install Dependencies**
```bash
# Install all dependencies (root, server, client)
npm run install:all
```

2. **Configure Environment Variables**
```bash
# Server
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. **Start Development Servers**
```bash
# From root directory - starts both server and client
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Socket.io: http://localhost:5000

---

## 🔑 Default Users

| Role   | Email              | Password |
|--------|--------------------|----------|
| Admin  | admin@example.com  | admin123 |
| Editor | editor@example.com | editor123|
| Viewer | viewer@example.com | viewer123|

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | /api/auth/register  | Register new user    |
| POST   | /api/auth/login     | Login user           |
| GET    | /api/auth/me        | Get current user     |

### Videos
| Method | Endpoint              | Description           | Access       |
|--------|-----------------------|-----------------------|--------------|
| GET    | /api/videos           | Get all videos        | All roles    |
| GET    | /api/videos/:id       | Get single video      | All roles    |
| POST   | /api/videos/upload    | Upload new video      | Editor/Admin |
| DELETE | /api/videos/:id       | Delete video          | Owner/Admin  |
| GET    | /api/videos/stream/:id| Stream video (206)    | All roles    |

### Admin
| Method | Endpoint           | Description        | Access    |
|--------|--------------------|--------------------|-----------|
| GET    | /api/admin/users   | Get all users      | Admin     |
| PUT    | /api/admin/videos/:id | Update any video | Admin     |

---

## 🔌 Socket.io Events

| Event               | Direction      | Description                    |
|---------------------|----------------|--------------------------------|
| processing_start    | Server → Client| Video processing started       |
| processing_progress | Server → Client| Processing progress update     |
| processing_complete | Server → Client| Processing completed with status|

---

## 🛠️ Technology Stack

### Backend
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.io-client** - Real-time events
- **React Router** - Routing

---

## 📝 License

MIT License - Feel free to use this project for learning and development.

---

## 📧 Support

For any technical issues, contact: **rajvardhanwork07@gmail.com**
