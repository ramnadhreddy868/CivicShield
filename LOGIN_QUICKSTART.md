# CivicShield Login System - Quick Start Guide

## 🎯 What's New

The CivicShield application now includes a complete authentication system with:
- ✅ **Citizen Registration & Login** - Users can create accounts and log in
- ✅ **Admin Login Portal** - Admins can log in to manage reports
- ✅ **Protected Routes** - Report submission and dashboard require authentication
- ✅ **JWT Security** - Industry-standard token-based authentication
- ✅ **Admin Dashboard** - Admins can view and update report status

## 🚀 Getting Started

### 1. Start the Backend
```bash
cd backend
npm install          # Install dependencies (if not done)
npm run dev         # Start with nodemon
```
Backend runs at: http://localhost:5000/api

### 2. Start the Frontend
```bash
cd frontend/CivicShield
npm install          # Install dependencies (if not done)
npm run dev         # Start Vite dev server
```
Frontend runs at: http://localhost:5173

## 📋 Testing the System

### Option A: Via Web Interface (Easiest)

#### Register & Login as Citizen
1. Open http://localhost:5173 in browser
2. You'll see login buttons in navbar
3. Click **"Citizen Login"**
4. Click **"Sign up"** to create new account
5. Fill in: Email, Password, Name, Phone (optional)
6. Click **"Create Account"**
7. You're logged in! Now you can:
   - Submit reports with images
   - View dashboard
   - Logout from navbar

#### Admin Login
1. From any page, click **"Admin"** button in navbar
2. Login with admin credentials (see "Creating Admin Account" below)
3. Access: http://localhost:5173/admin-dashboard
4. Manage reports: Change status, view details, see images

### Option B: Via cURL Commands

#### Register Citizen
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "citizen",
    "phone": "555-0000"
  }'
```

#### Login Citizen
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "role": "citizen"
  }'
```
Returns: `{ token: "jwt_token", user: {...} }`

#### Submit Report (use token from login)
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Broken Pothole" \
  -F "description=Large hole in street" \
  -F "category=road_pothole" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "images=@photo.jpg"
```

## 👨‍💼 Creating an Admin Account

### Method 1: Register with Admin Role (Easy)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@civicshield.com",
    "password": "admin_password_123",
    "name": "System Administrator",
    "role": "admin"
  }'
```

Then login with this account using the Admin Login page.

### Method 2: MongoDB Direct Insert
Connect to your MongoDB database and insert:
```javascript
db.users.insertOne({
  email: "admin@civicshield.com",
  password: "$2a$10$...", // bcrypt hash of "admin_password"
  name: "System Admin",
  role: "admin",
  phone: "",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note:** Use the register method above (easier - password auto-hashes)

## 🔑 Key Features

- **Separate Logins**: Citizens and admins have different login portals
- **Auto JWT Storage**: Tokens saved to localStorage automatically
- **Protected Pages**: Must login to submit reports or view dashboard
- **Admin Dashboard**: 
  - Filter reports by status
  - Update report status (submitted → in_progress → resolved)
  - View report images
  - Manage all citizen reports
- **Auto Logout**: Click logout button anytime
- **Session Storage**: Stay logged in until logout or token expires (7 days)

## 📁 File Structure (New/Modified)

### Backend
```
backend/
  src/
    models/
      User.js                  ← NEW: User schema
    middleware/
      auth.js                  ← NEW: JWT middleware
    repositories/
      userRepo.js              ← NEW: User database ops
    routes/
      auth.js                  ← NEW: Auth endpoints
      reports.js               ← UPDATED: Protected + userId
    models/
      Report.js                ← UPDATED: Added userId
  server.js                    ← UPDATED: Added /api/auth route
```

### Frontend
```
frontend/CivicShield/
  src/
    pages/
      citizenloginpage.jsx     ← NEW: Citizen login/register
      adminloginpage.jsx       ← NEW: Admin login
      admindashboard.jsx       ← NEW: Admin dashboard
      loginpage.css            ← NEW: Login styles
      admindashboard.css       ← NEW: Admin dashboard styles
    api.js                     ← UPDATED: Axios + auth methods
    App.jsx                    ← UPDATED: ProtectedRoute + navbar
    index.css                  ← UPDATED: Auth navbar styles
```

## 🔒 Security Notes

The authentication system uses:
- **bcryptjs**: Passwords hashed with salt rounds = 10
- **JWT**: Tokens signed with secret key, expire after 7 days
- **HTTPS**: Recommended for production
- **CORS**: Enabled between localhost:5000 and localhost:5173

⚠️ **For Production:**
- Use HTTPOnly cookies instead of localStorage
- Enable HTTPS/TLS
- Store JWT_SECRET in environment variables
- Implement rate limiting on auth endpoints
- Add email verification for registration

## 🆘 Troubleshooting

### "Unauthorized" error when submitting report
→ You're not logged in. Refresh page and try citizen login again.

### Admin can't see reports
→ Make sure you logged with admin account (role: "admin")
→ Check admin dashboard at http://localhost:5173/admin-dashboard

### Token expired
→ Login again. Tokens last 7 days.

### Password hashing issue
→ Make sure `bcryptjs` is installed: `npm install bcryptjs` in backend

### CORS errors
→ Verify backend runs on port 5000 and frontend on 5173
→ Check CORS middleware in server.js is active

## 📞 Support

For detailed API documentation, see: **AUTH_SYSTEM_DOCUMENTATION.md**

For questions or issues:
1. Check console for error messages
2. Review auth route responses
3. Verify MongoDB connection
4. Confirm tokens are stored in localStorage (DevTools → Application → Storage)

---

**Happy Civic Reporting! 🎉**
