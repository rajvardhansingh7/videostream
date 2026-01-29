# 🚀 Deployment Guide

This guide will help you deploy the Video Streaming Platform to the cloud.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Render        │────▶│  MongoDB Atlas  │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
│   React + Vite  │     │   Node.js API   │     │   Cloud DB      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Step 1: Set Up MongoDB Atlas (Free Tier)

### 1.1 Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account

### 1.2 Create Cluster
1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select a cloud provider (AWS recommended)
4. Choose a region close to your users
5. Name your cluster (e.g., `video-streaming`)

### 1.3 Create Database User
1. Go to **Database Access** → **Add New Database User**
2. Choose **Password** authentication
3. Create a username and strong password
4. Set privileges to **"Read and write to any database"**
5. Click **Add User**

### 1.4 Configure Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (for simplicity)
   - For production, you'll want to whitelist Render's IP addresses
3. Click **Confirm**

### 1.5 Get Connection String
1. Go to **Database** → **Connect** → **Drivers**
2. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your database user's password
4. Add your database name before `?`:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/video-streaming?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Render

### 2.1 Prepare Repository
Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for cloud deployment"
git push origin main
```

### 2.2 Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub

### 2.3 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   | Setting | Value |
   |---------|-------|
   | **Name** | video-streaming-api |
   | **Region** | Oregon (US West) |
   | **Branch** | main |
   | **Root Directory** | server |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | Free |

### 2.4 Configure Environment Variables
Add these environment variables in Render dashboard:

| Key | Value |
|-----|-------|
| `NODE_ENV` | production |
| `MONGODB_URI` | `mongodb+srv://...` (your Atlas connection string) |
| `JWT_SECRET` | (generate a random 32+ character string) |
| `JWT_EXPIRE` | 7d |
| `CLIENT_URL` | (leave empty for now, add after Vercel deploy) |

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait for the build to complete (~3-5 minutes)
3. Note your backend URL: `https://your-app-name.onrender.com`

### 2.6 Test Backend
Visit `https://your-app-name.onrender.com/api/health` to verify it's running.

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure the project:
   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | client |
   | **Build Command** | `npm run build` |
   | **Output Directory** | dist |

### 3.3 Configure Environment Variables
Add this environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-render-app.onrender.com/api` |

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (~1-2 minutes)
3. Note your frontend URL: `https://your-app-name.vercel.app`

---

## Step 4: Update Backend CORS

1. Go back to Render dashboard
2. Add/update the `CLIENT_URL` environment variable:
   ```
   CLIENT_URL=https://your-app-name.vercel.app
   ```
3. Render will automatically redeploy

---

## Step 5: Seed Initial Data (Optional)

If you want to create initial admin/test users:

1. Connect to your deployed backend via the Render shell:
   ```bash
   npm run seed
   ```

Or run locally with your production MongoDB URI:
```bash
cd server
MONGODB_URI="your-atlas-connection-string" npm run seed
```

---

## 📋 Deployment Checklist

### Backend (Render)
- [ ] Web service created
- [ ] Environment variables configured:
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI` (Atlas connection string)
  - [ ] `JWT_SECRET` (random secure string)
  - [ ] `JWT_EXPIRE=7d`
  - [ ] `CLIENT_URL` (Vercel frontend URL)
- [ ] Health check passing at `/api/health`

### Frontend (Vercel)
- [ ] Project imported from GitHub
- [ ] Root directory set to `client`
- [ ] Environment variable `VITE_API_URL` configured
- [ ] Build successful

### MongoDB Atlas
- [ ] Cluster created
- [ ] Database user created
- [ ] Network access configured (allow from anywhere)
- [ ] Connection string obtained

---

## 🔧 Troubleshooting

### "MongoDB connection failed"
- Check your `MONGODB_URI` is correct
- Verify IP whitelist includes `0.0.0.0/0` (allow all)
- Check database user password doesn't contain special characters

### "CORS error"
- Verify `CLIENT_URL` in Render matches your Vercel URL exactly
- Make sure there's no trailing slash

### "API requests failing"
- Check `VITE_API_URL` in Vercel includes `/api` suffix
- Verify backend is running (check Render logs)

### "Build failed on Vercel"
- Check the logs for dependency issues
- Make sure `package.json` is in the `client` directory

---

## 🌐 URLs Reference

| Service | URL |
|---------|-----|
| Frontend | `https://your-app.vercel.app` |
| Backend | `https://your-api.onrender.com` |
| API Health | `https://your-api.onrender.com/api/health` |
| MongoDB | `cloud.mongodb.com` (dashboard) |

---

## 💰 Cost Summary

| Service | Cost |
|---------|------|
| Vercel | Free (hobby tier) |
| Render | Free (starter tier, sleeps after 15 min inactivity) |
| MongoDB Atlas | Free (512MB storage) |
| **Total** | **$0/month** |

> **Note:** Free tier backends on Render will "sleep" after 15 minutes of inactivity. First request after sleep takes ~30 seconds. For always-on service, upgrade to paid tier ($7/month).
