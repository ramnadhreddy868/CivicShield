# Backend-Frontend Login Integration Guide

## ✅ Connection Status

Both citizen and admin login pages are now **fully connected** to the backend authentication system.

## 🔧 Backend Configuration

### 1. Verify Backend .env File
Make sure your `backend/.env` contains:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=gs#secret
```

### 2. Backend Routes Already Configured
✅ Auth routes mounted at `/api/auth` in `server.js`
✅ CORS enabled for localhost:5173
✅ JSON parsing middleware ready

### 3. Auth Endpoints Available
```
POST   /api/auth/register    - Create new user
POST   /api/auth/login       - Login with email/password/role
GET    /api/auth/me          - Get current user (protected)
PATCH  /api/auth/me          - Update profile (protected)
POST   /api/auth/logout      - Logout (protected)
```

## 🌐 Frontend Configuration

### 1. API Client Setup ✅
- File: `frontend/CivicShield/src/api.js`
- Uses axios with JWT interceptor
- Auto-stores token in localStorage
- All auth methods properly return data

### 2. Login Pages Connected ✅
- **Citizen Login**: `/citizen-login` (register + login)
- **Admin Login**: `/admin-login` (login only)
- Both properly call backend APIs
- Proper error handling and success redirects

### 3. Protected Routes ✅
- `/` (Report) - requires citizen login
- `/dashboard` - requires citizen login
- `/admin-dashboard` - requires admin login
- Auto-redirects to login if not authenticated

## 🚀 Step-by-Step Setup

### Phase 1: Start Backend
```bash
cd backend
npm install                    # If needed
npm run dev                    # Start express server on port 5000
```

You should see:
```
✓ MongoDB connected successfully
✓ Server running on http://localhost:5000
```

### Phase 2: Start Frontend
```bash
cd frontend/CivicShield
npm install                    # If needed
npm run dev                    # Start Vite on port 5173
```

### Phase 3: Test Citizen Flow

1. **Open browser**: http://localhost:5173
2. **See login options** in navbar - "Citizen Login" and "Admin"
3. **Click "Citizen Login"**
4. **Click "Sign up"** to register:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
   - Click "Create Account"
5. **Auto-login happens** → Redirected to `/`
6. **See logged-in navbar**:
   - "Welcome, Test User" displayed
   - "Logout" button available
   - Report and Dashboard links available
7. **Submit a report**:
   - Fill form with title, description, category
   - Get location
   - Submit
   - Success! Report linked to your user ID
8. **View dashboard**:
   - Click Dashboard link
   - See your submitted report
9. **Logout**: Click Logout button → Back to login

### Phase 4: Test Admin Flow

#### Step 1: Create Admin User (pick one method)

**Method A: Via Frontend Registration**
```
Go to http://localhost:5173/citizen-login
BUT: You can't create admin directly - use Method B
```

**Method B: Direct Backend Register (Recommended)**
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

**Response (save the token):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

#### Step 2: Login as Admin
1. Go to http://localhost:5173
2. Click "Admin" button in navbar
3. Enter admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
4. Click "Admin Login"
5. **Auto-redirected** to `/admin-dashboard`
6. **Admin features**:
   - See all citizen reports
   - Filter by status (Submitted, In Progress, Resolved)
   - Update report status
   - View report images
   - Logout

## 🔍 Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:5173
- [ ] "Citizen Login" button appears
- [ ] "Admin" button appears in navbar
- [ ] Can register new citizen account
- [ ] Auto-login works after registration
- [ ] Stored token visible in DevTools → Application → Storage → LocalStorage
- [ ] Can submit reports while logged in
- [ ] Can logout
- [ ] Cannot access `/` without login (redirects to login)
- [ ] Can create admin user
- [ ] Can login as admin
- [ ] Admin dashboard shows all reports
- [ ] Can update report status as admin

## 🐛 Troubleshooting

### Issue: "Cannot POST /api/auth/register"
**Solution**: 
- Check backend is running on port 5000
- Check auth routes are mounted in server.js
- Check network tab in DevTools shows request to localhost:5000

### Issue: "Invalid email or password" on login
**Solution**:
- Verify user was created successfully
- Check email matches exactly
- Confirm password is correct
- Check MongoDB for user document

### Issue: Redirect to login after login
**Solution**:
- Check localStorage has token (DevTools → Storage)
- Check token is valid JWT
- Check MongoDB connection
- Verify User model exists in database

### Issue: "Admin access required" error
**Solution**:
- Confirm you created admin user with `"role": "admin"`
- Confirm you're logging in with "admin" role
- Check MongoDB: user should have `"role": "admin"`

### Issue: Reports not submitting
**Solution**:
- Check you're logged in (token in localStorage)
- Check Authorization header in network tab: `Bearer <token>`
- Check backend auth middleware is protecting /reports route
- Check MongoDB connection

### Issue: Admin dashboard shows no reports
**Solution**:
- Confirm you logged in as admin
- Confirm citizens have submitted reports
- Check MongoDB: reports should have `userId` field
- Refresh page

## 📊 API Flow Diagram

```
FRONTEND                          BACKEND
[Citizen Login Page]
    │
    └─ POST /api/auth/register ──→ [Auth Route]
       {email, password, name}        │
                                      ├─ Hash password
                                      ├─ Create User in MongoDB
                                      └─ Return JWT token
    ←────────────────────────────────┘
       {token, user}
    │
    └─ Store in localStorage
    │
    └─ Redirect to /
    │
    V
[Protected Report Page]
    │
    └─ POST /api/reports ────────→ [Auth Middleware]
       Authorization: Bearer token   │
                                    ├─ Verify token
                                    ├─ Extract userId
    ←────────────────────────────────┘
       Create report with userId
    │
    └─ Success!
    │
    V
[Admin Login Page]
    │
    └─ POST /api/auth/login ──────→ [Auth Route]
       {email, password, role}       │
                                     ├─ Find user
                                     ├─ Verify password
                                     ├─ Check role = admin
                                     └─ Return JWT token
    ←────────────────────────────────┘
       {token, user}
    │
    └─ Store in localStorage
    │
    └─ Redirect to /admin-dashboard
    │
    V
[Admin Dashboard]
    │
    └─ GET /api/reports ──────────→ [Auth Middleware]
       Authorization: Bearer token   │
                                    ├─ Verify token
                                    └─ Return all reports
    ←────────────────────────────────┘
       [All citizen reports]
    │
    └─ Display with update option
    │
    └─ PATCH /api/reports/:id ────→ [Auth + Admin Middleware]
       {status: new_status}         │
                                    ├─ Verify admin token
                                    ├─ Update status
                                    └─ Return updated report
    ←────────────────────────────────┘
       {updated report}
    │
    └─ Success!
```

## 🎯 Success Indicators

✅ **Citizen Account Works** When:
- Can register with email/password/name
- Token stored in localStorage
- Can submit reports
- Reports appear in dashboard
- Can logoutout

✅ **Admin Account Works** When:
- Can login with admin credentials
- Redirects to admin dashboard
- Sees all citizen reports
- Can update report status
- Changes show immediately

✅ **Backend Connected** When:
- No CORS errors
- No 404 errors on /api/auth routes
- No token verification errors
- MongoDB stores users and reports correctly

## 🔐 Security Notes

1. **Token Storage**: Currently in localStorage (vulnerable to XSS)
   - Recommended for production: HTTPOnly cookies

2. **Password Hashing**: Using bcryptjs with 10 salt rounds ✅

3. **JWT Validation**: Tokens expire after 7 days ✅

4. **CORS**: Enabled for localhost development ✅

5. **Protected Routes**: Both frontend and backend checking ✅

## 📚 Key Files

### Backend
- `server.js` - Main server, routes mounted
- `src/routes/auth.js` - All auth endpoints
- `src/middleware/auth.js` - JWT verification
- `src/models/User.js` - User schema

### Frontend
- `src/api.js` - All API calls
- `src/App.jsx` - ProtectedRoute, navbar
- `src/pages/citizenloginpage.jsx` - Citizen login/register
- `src/pages/adminloginpage.jsx` - Admin login
- `src/pages/admindashboard.jsx` - Admin panel

## ✅ Status: READY TO TEST

Both login pages are fully integrated with the backend. Run the services and test the flows above!
