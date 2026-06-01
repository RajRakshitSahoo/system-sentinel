# 🛡️ SYSTEM SENTINEL
### Real-Time System Monitoring & Performance Analytics Platform

![System Sentinel](https://img.shields.io/badge/version-1.0.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-7-green) ![License](https://img.shields.io/badge/license-MIT-orange)

---

## 📖 Overview

System Sentinel is a **production-grade, full-stack system monitoring platform** that provides complete real-time visibility into your computer's performance. Built with modern technologies and featuring a stunning futuristic UI, it's ideal for final-year projects, hackathons, and portfolio showcases.

---

## ✨ Features

| Module | Description |
|---|---|
| 📊 **Live Dashboard** | Real-time CPU, RAM, Disk, Network gauges updating every second |
| 🖥 **System Overview** | Detailed CPU, OS, BIOS, and hardware info |
| ⚙️ **Process Manager** | Search, sort, and monitor 100+ live processes |
| 🌐 **Network Monitor** | Live bandwidth charts and interface details |
| 💾 **Storage Analyzer** | Pie charts and per-drive usage breakdown |
| 🔋 **Battery Monitor** | Charge level, health, and time estimates |
| 🌡 **Hardware Monitor** | CPU/GPU temperature and motherboard info |
| 📈 **Analytics** | Daily, weekly, monthly performance history |
| 🔔 **Alert System** | Severity-based alerts with acknowledgement |
| 📅 **Event Timeline** | Chronological system event log |
| 🔐 **Security Dashboard** | Login, USB, and network change tracking |
| 💼 **Productivity** | Active vs idle time and app usage tracking |
| 📄 **Report Generator** | Export PDF, CSV, JSON reports |
| ⚙️ **Settings** | 4 themes, alert thresholds, refresh rates |
| 👤 **Auth System** | JWT login/register with secure sessions |

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS (custom themes)
- Framer Motion (animations)
- Recharts (charts)
- Socket.IO Client
- React Router v6

**Backend:**
- Node.js + Express
- Socket.IO
- systeminformation
- JWT + bcryptjs
- PDFKit (report generation)

**Database:**
- MongoDB + Mongoose
- Auto TTL indexes for data cleanup

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Setup
```bash
# Navigate to project
cd system-sentinel

# Copy env file
cp backend/.env.example backend/.env
```

### 2. Configure Environment
Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/system-sentinel
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Install Backend
```bash
cd backend
npm install
```

### 4. Install Frontend
```bash
cd frontend
npm install
```

### 5. Start MongoDB
```bash
# If running locally
mongod

# Or use MongoDB Atlas - update MONGODB_URI in .env
```

### 6. Start Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### 7. Start Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 8. Open Browser
Navigate to `http://localhost:5173`, register a new account, and start monitoring!

---

## 📁 Project Structure

```
system-sentinel/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── monitorController.js
│   │   ├── alertController.js
│   │   ├── analyticsController.js
│   │   ├── reportController.js
│   │   ├── userController.js
│   │   ├── eventController.js
│   │   ├── securityController.js
│   │   └── productivityController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── SystemStats.js
│   │   ├── Alert.js
│   │   ├── EventLog.js
│   │   ├── SecurityLog.js
│   │   ├── ProductivityLog.js
│   │   └── Report.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── monitorRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── userRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── securityRoutes.js
│   │   └── productivityRoutes.js
│   ├── services/
│   │   ├── monitoringService.js
│   │   └── socketService.js
│   ├── uploads/
│   │   └── reports/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Layout.jsx
│   │   │       └── UI.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SystemOverview.jsx
│   │   │   ├── ProcessManager.jsx
│   │   │   ├── NetworkMonitor.jsx
│   │   │   ├── StorageAnalyzer.jsx
│   │   │   ├── BatteryMonitor.jsx
│   │   │   ├── HardwareMonitor.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Alerts.jsx
│   │   │   ├── EventTimeline.jsx
│   │   │   ├── Security.jsx
│   │   │   ├── Productivity.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Profile.jsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/monitor/stats` | Current system stats |
| GET | `/api/monitor/cpu` | CPU details |
| GET | `/api/monitor/processes` | Running processes |
| GET | `/api/monitor/network` | Network info |
| GET | `/api/monitor/storage` | Storage info |
| GET | `/api/monitor/hardware` | Hardware info |
| GET | `/api/alerts` | List alerts |
| PUT | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| GET | `/api/analytics/daily` | Daily statistics |
| GET | `/api/analytics/weekly` | Weekly statistics |
| POST | `/api/reports/generate` | Generate report |
| GET | `/api/reports/:id/download` | Download report |
| GET | `/api/events` | Event timeline |
| GET | `/api/security` | Security logs |

---

## 🎨 Themes

| Theme | Primary Color | Description |
|---|---|---|
| Dark Monitor | `#00d4ff` | Default dark monitoring theme |
| Cyber Purple | `#bf00ff` | Cyberpunk neon purple |
| Hacker Green | `#00ff41` | Classic terminal green |
| Light Mode | `#0066cc` | Clean light interface |

---

## ⚡ Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `systemStats` | Server → Client | Real-time system metrics (every 1s) |
| `alert` | Server → Client | New alert triggered |
| `ping/pong` | Client ↔ Server | Connection heartbeat |

---

## 🔒 Security

- JWT tokens with configurable expiry
- bcrypt password hashing (12 rounds)
- Rate limiting (500 req/15 min)
- Protected routes via middleware
- Input validation with express-validator
- Security event logging

---

## 📊 Database Schemas

| Collection | TTL | Description |
|---|---|---|
| `users` | None | User accounts |
| `systemstats` | 30 days | Performance history |
| `alerts` | None | System alerts |
| `eventlogs` | 90 days | System events |
| `securitylogs` | None | Security events |
| `productivitylogs` | None | Daily productivity |
| `reports` | None | Generated reports |

---

## 🚀 Deployment

### Backend (e.g., Render, Railway, VPS)
```bash
cd backend
npm install --production
npm start
```

### Frontend (e.g., Vercel, Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Environment Variables (Production)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<very_long_random_string>
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License — free to use for personal and commercial projects.

---

## 🏆 Credits

Built with ❤️ as a full-stack portfolio project.

**Technologies:** React, Node.js, Express, MongoDB, Socket.IO, Tailwind CSS, systeminformation, Chart.js/Recharts, Framer Motion
