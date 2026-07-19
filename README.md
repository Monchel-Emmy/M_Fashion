# 🎽 Melody Fashion Style — Inventory & Business Management System

A full-stack MERN application for managing fashion inventory, sales, purchases, and customer orders.

**Frontend**: React + Vite → Hosted on **Vercel**  
**Backend**: Node.js + Express → Hosted on **Render**  
**Database**: MongoDB Atlas (free tier)  
**Images**: Cloudinary (free tier)  
**Currency**: FRW (Rwandan Franc)

---

## 📦 Project Structure

```
M Fashion/
├── backend/        ← Express API (deploy to Render)
└── frontend/       ← React + Vite (deploy to Vercel)
```

---

## 🚀 Local Development Setup

### Step 1: MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → Create free account
2. Create a cluster (free M0 tier)
3. Create a database user (username + password)
4. Whitelist IP: `0.0.0.0/0` (allow all)
5. Copy your connection string

### Step 2: Cloudinary
1. Go to [Cloudinary](https://cloudinary.com) → Sign up free
2. From Dashboard, copy: Cloud Name, API Key, API Secret

### Step 3: Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Cloudinary keys
npm run dev
```

### Step 4: Frontend Setup
```bash
cd frontend
# .env is already configured for local dev (http://localhost:5000/api)
npm run dev
```

### Step 5: Create Admin User
Use the backend API to register your first admin:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@melodyfashion.com","password":"admin123","role":"admin"}'
```

---

## 🌐 Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [Render](https://render.com) → New → Web Service
3. Connect your GitHub repo, select the `backend` folder as root directory
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   NODE_ENV=production
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
6. Deploy and copy the Render URL (e.g. `https://melody-fashion.onrender.com`)

### Frontend → Vercel

1. Go to [Vercel](https://vercel.com) → New Project
2. Import your GitHub repo, set **Root Directory** to `frontend`
3. Set environment variable:
   ```
   VITE_API_URL=https://melody-fashion.onrender.com/api
   ```
4. Deploy!

---

## 🔑 Features

| Feature | Description |
|---|---|
| 📦 **Stock In** | Record purchases — adds to inventory |
| 📤 **Stock Out** | Record sales — removes from inventory |
| 🛍️ **Public Storefront** | Customer browsing with add-to-cart |
| 🛒 **Online Orders** | Customers can place orders online |
| 📊 **Dashboard** | KPIs, charts, top products |
| 🔔 **Low Stock Alerts** | Visual warnings for low inventory |
| 🧾 **Transaction History** | Full audit log |
| 👥 **Supplier Management** | Track all suppliers |
| 📋 **Order Tracking** | Customers track orders by number |
| 🖼️ **Image Upload** | Cloudinary product photos |
| 🔐 **Role-Based Auth** | Admin & Staff roles |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/products` | — | Get products (public) |
| POST | `/api/products` | ✅ | Add product |
| POST | `/api/transactions/stock-in` | ✅ | Record purchase |
| POST | `/api/transactions/stock-out` | ✅ | Record sale |
| GET | `/api/dashboard/stats` | ✅ | Dashboard KPIs |
| POST | `/api/orders` | — | Place customer order |
| GET | `/api/orders/track/:num` | — | Track order |
| PUT | `/api/orders/:id/status` | ✅ | Update order status |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v7, Recharts, React Hook Form
- **Backend**: Node.js, Express 5, MongoDB, Mongoose
- **Auth**: JWT + bcryptjs
- **Images**: Cloudinary + Multer
- **Styling**: Vanilla CSS with custom design system
