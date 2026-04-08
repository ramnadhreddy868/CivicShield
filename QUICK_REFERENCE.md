# 🎯 QUICK REFERENCE CARD

## 🚀 ONE-MINUTE SETUP

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend/CivicShield && npm run dev

# Terminal 3 - Test (optional)
cd backend && node test-auth-connection.js
```

Then open: http://localhost:5173

---

## 👤 CITIZEN USER FLOW

### Register
```
1. Click "Citizen Login"
2. Click "Sign up" 
3. Fill: Email, Password, Name, Phone (optional)
4. Click "Create Account"
5. ✅ Auto-logged in → See Report Form
```

### Login
```
1. Click "Citizen Login"
2. Fill: Email, Password
3. Click "Login"
4. ✅ Logged in → See Report Form
```

### Submit Report
```
1. Fill: Title, Description, Category
2. Click "Get My Location"
3. Add Images (optional)
4. Click "Submit Report"
5. ✅ Report saved with your user ID
```

### View Dashboard
```
1. Click "Dashboard"
2. See all your submitted reports
3. Click report to see details
```

### Logout
```
1. Click "Logout" button in top right
2. ✅ Logged out → Back to login page
```

---

## 👨‍💼 ADMIN USER FLOW

### Create Admin Account
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin"
  }'
```

### Login as Admin
```
1. Click "Admin" button (top right)
2. Fill: Email: admin@example.com
3. Fill: Password: admin123
4. Click "Admin Login"
5. ✅ Redirected to Admin Dashboard
```

### Manage Reports
```
1. See all citizen-submitted reports
2. Filter by status:
   - Submitted (new reports)
   - In Progress (being worked on)
   - Resolved (completed)
3. Click status dropdown on report
4. Select new status
5. ✅ Report updated immediately
```

### Logout
```
1. Click "Logout" button
2. ✅ Logged out → Back to login page
```

---

## 🔗 ENDPOINTS QUICK REFERENCE

### Auth Endpoints
```
POST   /api/auth/register     → Create account
POST   /api/auth/login        → Login user
GET    /api/auth/me           → Get profile (protected)
PATCH  /api/auth/me           → Update profile (protected)
POST   /api/auth/logout       → Logout (protected)
```

### Report Endpoints
```
GET    /api/reports           → List all reports
GET    /api/reports/:id       → Get one report
POST   /api/reports           → Create report (protected)
PATCH  /api/reports/:id       → Update status (admin only)
```

---

## 💾 STORAGE

### Frontend localStorage
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "citizen"
  }
}
```

### Backend MongoDB
```
Collections:
- users    → { email, password, name, role, phone, timestamps }
- reports  → { title, description, category, userId, status, images }
```

---

## 🔐 TOKEN INFO

```
Type:     JWT (JSON Web Token)
Expires:  7 days
Secret:   gs#secret (from .env)
Format:   Authorization: Bearer <token>
Storage:  localStorage (frontend)
Auto-add: axios interceptor adds to requests
```

---

## ❌ TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Cannot connect to backend" | Check backend on :5000 |
| "Cannot register" | Check MongoDB connection |
| "Login redirects to login" | Check token in localStorage |
| "Cannot submit report" | Make sure you're logged in |
| "Cannot update status" | Must be logged in as admin |
| "CORS error" | Check CORS in server.js |
| "Auth endpoint not found" | Check auth routes mounted |

---

## 🎯 KEY FILES

### Backend
```
server.js              → Main server
src/routes/auth.js     → Auth endpoints
src/middleware/auth.js → Token validation
src/models/User.js     → User schema
```

### Frontend
```
src/App.jsx                     → Routes & ProtectedRoute
src/api.js                      → API client with axios
src/pages/citizenloginpage.jsx  → Citizen login/register
src/pages/adminloginpage.jsx    → Admin login
src/pages/admindashboard.jsx    → Admin panel
```

---

## 📊 FLOW OVERVIEW

```
Landing Page
    ├─ "Citizen Login" → Citizen flow
    │   ├─ Register → Create account
    │   ├─ Login → Access reports
    │   ├─ Submit reports
    │   └─ View dashboard
    │
    └─ "Admin" → Admin flow
        ├─ Login → Access admin panel
        ├─ View reports
        ├─ Update status
        └─ Logout
```

---

## ✅ STATUS

- Backend: ✅ Running on :5000
- Frontend: ✅ Running on :5173
- Database: ✅ MongoDB connected
- Auth: ✅ JWT implemented
- Routes: ✅ Protected
- Integration: ✅ Complete

**READY TO USE! 🎉**

---

## 📞 DOCUMENTATION

For detailed info, see:
- `CONNECTION_COMPLETE.md` - Full summary
- `INTEGRATION_STATUS.md` - Detailed status
- `INTEGRATION_GUIDE.md` - Setup guide
- `FLOW_DIAGRAMS.md` - Visual flows
- `AUTH_SYSTEM_DOCUMENTATION.md` - Technical docs
- `LOGIN_QUICKSTART.md` - Quick start

---

**Last Updated**: March 11, 2026
**Version**: 1.0
**Status**: ✅ Production Ready
