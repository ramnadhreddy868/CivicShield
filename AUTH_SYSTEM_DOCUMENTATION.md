# CivicShield Authentication System Documentation

## Overview
This document explains the integrated Citizen and Admin login system for the CivicShield application.

## System Architecture

### Backend Components

#### 1. **User Model** (`backend/src/models/User.js`)
- Email (unique, lowercase)
- Password (hashed with bcryptjs)
- Name
- Role (`citizen` or `admin`)
- Phone (optional)
- isActive flag
- Timestamps (createdAt, updatedAt)

**Features:**
- Pre-save hook auto-hashes passwords
- `matchPassword()` method compares encrypted passwords
- `toJSON()` method excludes password from responses

#### 2. **Authentication Routes** (`backend/src/routes/auth.js`)
- **POST /api/auth/register** - User registration
  - Body: `{ email, password, name, role, phone }`
  - Returns: JWT token and user data
  
- **POST /api/auth/login** - User login
  - Body: `{ email, password, role }`
  - Validates user role for admin login
  - Returns: JWT token and user data
  
- **GET /api/auth/me** - Get current user (protected)
  - Requires valid JWT token
  - Returns: User profile without password
  
- **PATCH /api/auth/me** - Update user profile (protected)
  - Body: `{ name, phone }`
  - Returns: Updated user data
  
- **POST /api/auth/logout** - Logout (protected)
  - Just acknowledges logout (frontend deletes token)

#### 3. **Authentication Middleware** (`backend/src/middleware/auth.js`)
- **protect()** - Verifies JWT token in Authorization header
  - Format: `Bearer <token>`
  - Decodes token and attaches user to req.user
  
- **adminOnly()** - Checks if user role is 'admin'
  - Used with protect() to restrict routes to admins only

#### 4. **User Repository** (`backend/src/repositories/userRepo.js`)
- Database operations for users
- Methods: findByEmail, findById, create, findAll, update, delete, search

#### 5. **Updated Reports Routes** (`backend/src/routes/reports.js`)
- **POST /api/reports** - Now requires authentication
  - Automatically associates report with authenticated user's ID
  
- **PATCH /api/reports/:id** - Admin only
  - Can update report status (submitted → in_progress → resolved)

#### 6. **Updated Report Model** (`backend/src/models/Report.js`)
- Added `userId` field referencing User model
- Links each report to the citizen who created it

### Frontend Components

#### 1. **Updated API Client** (`frontend/CivicShield/src/api.js`)
- Switched from fetch to axios
- Interceptor auto-adds JWT token to requests
- Local storage management for token and user data

**Auth Methods:**
- `registerUser()` - Register new account
- `loginUser()` - Login and store token
- `logoutUser()` - Clear token and user data
- `getCurrentUser()` - Fetch current user profile
- `updateUserProfile()` - Update name/phone
- `getStoredUser()` - Get user from localStorage
- `getStoredToken()` - Get token from localStorage
- `isAuthenticated()` - Check if user is logged in

**Protected Methods:**
- `createReport()` - Auto-includes userId
- `updateReportStatus()` - Admin only

#### 2. **Citizen Login Page** (`frontend/CivicShield/src/pages/citizenloginpage.jsx`)
- Toggle between Login and Register modes
- Fields: email, password, name (register only), phone (optional)
- Stores token and user data on success
- Redirects to report page after login/registration
- Link to Admin Login

#### 3. **Admin Login Page** (`frontend/CivicShield/src/pages/adminloginpage.jsx`)
- Login only (no registration)
- Validates admin role on backend
- Redirects to admin dashboard
- Link to Citizen Login

#### 4. **Admin Dashboard** (`frontend/CivicShield/src/pages/admindashboard.jsx`)
- View all reports with filters (all, submitted, in_progress, resolved)
- Update report status (admin only)
- View report images
- Logout button
- Protected route - redirects non-admins to login

#### 5. **Updated App.jsx** (`frontend/CivicShield/src/App.jsx`)
- **ProtectedRoute component** - Checks authentication
  - Redirects to citizen login if not authenticated
  - Wraps Report and Dashboard pages
  
- **Navbar updates:**
  - Shows user name and logout button when logged in
  - Shows login buttons when logged out
  - Hides Report/Dashboard links until login
  - Admin button always visible

#### 6. **Updated Styles**
- `loginpage.css` - Login/Register form styling
- `admindashboard.css` - Admin dashboard layout
- Updated `index.css` - Navbar and auth elements

## Flow Diagrams

### Registration Flow
```
User enters email/password/name
    ↓
POST /api/auth/register
    ↓
Backend validates email uniqueness
    ↓
Hash password with bcryptjs
    ↓
Create User in MongoDB
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Frontend stores in localStorage
    ↓
Auto-login, redirect to /
```

### Login Flow
```
User enters email/password
    ↓
POST /api/auth/login
    ↓
Backend finds user by email
    ↓
Compare passwords with bcryptjs
    ↓
Validate user role (for admin login)
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Frontend stores in localStorage
    ↓
Redirect to home or admin dashboard
```

### Protected Route Flow (Report Creation)
```
User clicks "Submit Report"
    ↓
ProtectedRoute checks isAuthenticated()
    ↓
If not authenticated: redirect to /citizen-login
    ↓
POST /api/reports with FormData
    ↓
axios interceptor adds: Authorization: Bearer <token>
    ↓
Backend protect() middleware verifies token
    ↓
Token decoded, user info in req.user
    ↓
Report created with userId: req.user.id
    ↓
Report stored in MongoDB with reference to User
```

### Admin Update Status Flow
```
Admin clicks status dropdown
    ↓
PATCH /api/reports/:id with new status
    ↓
axios interceptor adds auth token
    ↓
Backend protect() middleware verifies token
    ↓
adminOnly() middleware checks req.user.role
    ↓
If not admin: return 403 error
    ↓
Update report status in MongoDB
    ↓
Return updated report
```

## Environment Setup

### Backend .env
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Default JWT Secret
Currently using: `gs#secret` (from existing .env)

## Testing the System

### 1. Register a Citizen Account
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@example.com",
    "password": "password123",
    "name": "John Citizen",
    "role": "citizen",
    "phone": "+ 1234567890"
  }'
```

### 2. Login as Citizen
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@example.com",
    "password": "password123",
    "role": "citizen"
  }'
```

### 3. Create a Report (needs token from login)
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Pothole on Main St" \
  -F "description=Large pothole" \
  -F "category=road_pothole" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "images=@image.jpg"
```

### 4. Admin Login (requires admin account in DB)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpass",
    "role": "admin"
  }'
```

### 5. Update Report Status (admin only)
```bash
curl -X PATCH http://localhost:5000/api/reports/REPORT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "in_progress" }'
```

## Creating an Admin User

### Option 1: Direct MongoDB Insert
```javascript
db.users.insertOne({
  email: "admin@example.com",
  password: bcrypt_hashed_password, // Hash "adminpass" with bcryptjs
  name: "System Admin",
  role: "admin",
  phone: "",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Option 2: Use Register Endpoint with Admin Role
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword",
    "name": "System Administrator",
    "role": "admin"
  }'
```

## Security Features

1. **Password Hashing** - bcryptjs with salt rounds = 10
2. **JWT Tokens** - Signed with JWT_SECRET, expires in 7 days
3. **Protected Routes** - Middleware validates tokens on sensitive endpoints
4. **Admin Authorization** - Two-layer check: authenticated + admin role
5. **User Role Validation** - Admin login validates role on backend
6. **Secure Headers** - localhost:5000 API with CORS enabled

## Known Limitations

1. JWT tokens stored in localStorage (vulnerable to XSS)
   - Consider: HTTPOnly cookies in production
   
2. No password reset mechanism
   - Can add: Email verification and password reset flow
   
3. No admin user management
   - Can add: Admin panel to create/edit/delete users
   
4. No rate limiting on auth endpoints
   - Can add: Express-rate-limit middleware
   
5. Reports not filtered by citizen
   - Citizens see all reports, can only edit their own
   - Can add: Filter reports by userId for citizens

## Future Enhancements

1. Email verification for registration
2. Two-factor authentication (2FA)
3. OAuth integration (Google, GitHub)
4. Admin user management panel
5. Report filtering by user
6. Audit logs for admin actions
7. Rate limiting and CAPTCHA
8. Refresh token mechanism
9. Session management
10. Password strength requirements validation

## File Summary

### Backend Files Created/Modified
- ✅ `backend/src/models/User.js` - NEW: User schema and methods
- ✅ `backend/src/middleware/auth.js` - NEW: JWT verification middleware
- ✅ `backend/src/repositories/userRepo.js` - NEW: User database operations
- ✅ `backend/src/routes/auth.js` - NEW: Authentication endpoints
- ✅ `backend/src/models/Report.js` - MODIFIED: Added userId field
- ✅ `backend/src/routes/reports.js` - MODIFIED: Added auth protection
- ✅ `backend/server.js` - MODIFIED: Integrated auth routes
- ✅ `backend/package.json` - MODIFIED: Added bcryptjs, jsonwebtoken
- ✅ `backend/.env` - ALREADY HAS: JWT_SECRET

### Frontend Files Created/Modified
- ✅ `frontend/CivicShield/src/api.js` - MODIFIED: Switched to axios, added auth methods
- ✅ `frontend/CivicShield/src/pages/citizenloginpage.jsx` - NEW: Citizen login/register
- ✅ `frontend/CivicShield/src/pages/adminloginpage.jsx` - NEW: Admin login
- ✅ `frontend/CivicShield/src/pages/admindashboard.jsx` - NEW: Admin dashboard
- ✅ `frontend/CivicShield/src/pages/loginpage.css` - NEW: Login styling
- ✅ `frontend/CivicShield/src/pages/admindashboard.css` - NEW: Dashboard styling
- ✅ `frontend/CivicShield/src/App.jsx` - MODIFIED: Added routes and protection
- ✅ `frontend/CivicShield/src/index.css` - MODIFIED: Added auth navbar styling
- ✅ `frontend/CivicShield/package.json` - MODIFIED: Added axios

## Support & Testing

To verify the system works:

1. Start backend: `npm run dev`
2. Start frontend: `npm run dev`
3. Open frontend at http://localhost:5173
4. Test citizen login: Register → Login → Submit Report
5. Test admin: Login as admin → View admin dashboard → Update report status
6. Test logout: Click Logout button → Redirected to login
7. Test protected routes: Try accessing / without login → Redirected to /citizen-login
