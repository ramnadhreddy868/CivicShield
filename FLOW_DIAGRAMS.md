# CivicShield - Login Connection Visualizer

## 🎨 User Flow Diagrams

### CITIZEN REGISTRATION & LOGIN FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│ User visits http://localhost:5173                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │ Landing Page           │
        │ See two buttons:       │
        │ • Citizen Login        │
        │ • Admin                │
        └────────────┬───────────┘
                     │ Click "Citizen Login"
                     ↓
        ┌────────────────────────────────────┐
        │ CitizenLoginPage                   │
        │ isLogin = true (default)           │
        ├────────────────────────────────────┤
        │ 🔐 Login Mode                      │
        │ ┌──────────────────────────────┐   │
        │ │ Email:    [________]         │   │
        │ │ Password: [________]         │   │
        │ │                              │   │
        │ │ [Login Button]               │   │
        │ │                              │   │
        │ │ Don't have account?          │   │
        │ │ [Sign up]                    │   │
        └────────────┬───────────────────┘
                     │ Click "Sign up"
                     ↓
        ┌────────────────────────────────────┐
        │ CitizenLoginPage                   │
        │ isLogin = false (toggled)          │
        ├────────────────────────────────────┤
        │ 📝 Register Mode                   │
        │ ┌──────────────────────────────┐   │
        │ │ Email:    [________]         │   │
        │ │ Password: [________]         │   │
        │ │ Name:     [________]         │   │
        │ │ Phone:    [________]         │   │
        │ │                              │   │
        │ │ [Create Account Button]      │   │
        │ │                              │   │
        │ │ Already have account?        │   │
        │ │ [Login]                      │   │
        └────────────┬───────────────────┘
                     │ Fill form & click "Create Account"
                     ↓
        ┌────────────────────────────────────┐
        │ registerUser(email, password,      │
        │             name, "citizen", phone)│
        │ called from api.js                 │
        └────────────┬───────────────────────┘
                     │ POST /api/auth/register
                     ↓
        ┌────────────────────────────────────┐
        │ BACKEND: auth.js                   │
        ├────────────────────────────────────┤
        │ 1. Validate input                  │
        │ 2. Check email not duplicate       │
        │ 3. Hash password (bcryptjs)        │
        │ 4. Create User in MongoDB          │
        │ 5. Generate JWT token              │
        │ 6. Return {token, user}            │
        └────────────┬───────────────────────┘
                     │ ← {token, user} response
                     ↓
        ┌────────────────────────────────────┐
        │ api.js registerUser()              │
        ├────────────────────────────────────┤
        │ 1. localStorage.setItem('token',   │
        │    res.data.token)                 │
        │ 2. localStorage.setItem('user',    │
        │    JSON.stringify(res.data.user))  │
        │ 3. Return {token, user}            │
        └────────────┬───────────────────────┘
                     │ Return to CitizenLoginPage
                     ↓
        ┌────────────────────────────────────┐
        │ CitizenLoginPage                   │
        │ Check: if (!result.error)          │
        └────────────┬───────────────────────┘
                     │ navigate("/")
                     ↓
        ┌────────────────────────────────────┐
        │ App.jsx ProtectedRoute             │
        ├────────────────────────────────────┤
        │ Check: isAuthenticated()           │
        │ → getStoredToken()                 │
        │ → !!localStorage.getItem('token')  │
        │ ✅ Token exists!                   │
        └────────────┬───────────────────────┘
                     │ Render children
                     ↓
        ┌────────────────────────────────────┐
        │ ReportPage Component               │
        │ Can now submit reports!            │
        │ Each report auto-linked to userId  │
        └────────────────────────────────────┘
```

---

### CITIZEN LOGIN FLOW (Existing Account)

```
┌─────────────────────────────────────────────────────────────┐
│ User visits http://localhost:5173                           │
│ Previously registered ✅                                     │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ CitizenLoginPage           │
    │ isLogin = true (default)   │
    ├────────────────────────────┤
    │ 🔐 Login Mode              │
    │ ┌──────────────────────┐   │
    │ │ Email:    [user@..] │   │
    │ │ Password: [***...]  │   │
    │ │                      │   │
    │ │ [Login Button]       │   │
    └────────────┬──────────────┘
                 │ Click "Login"
                 ↓
    ┌────────────────────────────┐
    │ loginUser(email, password, │
    │           "citizen")       │
    │ called from api.js         │
    └────────────┬────────────────┘
                 │ POST /api/auth/login
                 ↓
    ┌────────────────────────────┐
    │ BACKEND: auth.js           │
    ├────────────────────────────┤
    │ 1. Find user by email      │
    │ 2. Compare password        │
    │ 3. Verify role = citizen   │
    │ 4. Generate JWT token      │
    │ 5. Return {token, user}    │
    └────────────┬────────────────┘
                 │ ← {token, user} response
                 ↓
    ┌────────────────────────────┐
    │ api.js loginUser()         │
    ├────────────────────────────┤
    │ 1. localStorage.setItem()  │
    │ 2. Return res.data         │
    └────────────┬────────────────┘
                 │ Return to CitizenLoginPage
                 ↓
    ┌────────────────────────────┐
    │ CitizenLoginPage           │
    │ if (!result.error)         │
    │ navigate("/")              │
    └────────────┬────────────────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ ✅ LOGGED IN!              │
    │ See Report form            │
    │ Navbar shows:              │
    │ "Welcome, John Doe"        │
    │ [Logout]                   │
    └────────────────────────────┘
```

---

### ADMIN LOGIN FLOW

```
┌─────────────────────────────────────────────────────────────┐
│ User at http://localhost:5173                               │
│ Need admin dashboard access                                 │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ Navbar                      │
    │ Click "Admin" button        │
    └────────────┬────────────────┘
                 │ navigate("/admin-login")
                 ↓
    ┌────────────────────────────────────┐
    │ AdminLoginPage                     │
    ├────────────────────────────────────┤
    │ 🔑 Admin Portal                    │
    │ ┌──────────────────────────────┐   │
    │ │ Admin Email:   [admin@...]   │   │
    │ │ Password:      [***...]      │   │
    │ │                              │   │
    │ │ [Admin Login Button]          │   │
    │ │                              │   │
    │ │ Not an admin?                │   │
    │ │ [Citizen Login]              │   │
    └────────────┬───────────────────┘
                 │ Enter admin credentials & submit
                 ↓
    ┌────────────────────────────────────┐
    │ loginUser(email, password,         │
    │           "admin")  ← role: admin  │
    │ from api.js                        │
    └────────────┬───────────────────────┘
                 │ POST /api/auth/login
                 │ {role: "admin"}
                 ↓
    ┌────────────────────────────────────┐
    │ BACKEND: auth.js                   │
    ├────────────────────────────────────┤
    │ 1. Find user by email              │
    │ 2. Compare password                │
    │ 3. ⭐ Verify role = "admin" ⭐     │
    │    (This is key!)                  │
    │ 4. If role ≠ admin:                │
    │    Return 403 error                │
    │ 5. If admin: Generate JWT token    │
    │ 6. Return {token, user}            │
    └────────────┬───────────────────────┘
                 │ ← {token, user} response
                 ↓
    ┌────────────────────────────────────┐
    │ api.js loginUser()                 │
    ├────────────────────────────────────┤
    │ 1. localStorage.setItem('token',   │
    │    res.data.token)                 │
    │ 2. localStorage.setItem('user',    │
    │    JSON.stringify(res.data.user))  │
    │ 3. Return res.data                 │
    └────────────┬───────────────────────┘
                 │ Return to AdminLoginPage
                 ↓
    ┌────────────────────────────────────┐
    │ AdminLoginPage                     │
    │ if (!result.error)                 │
    │ navigate("/admin-dashboard")       │
    └────────────┬───────────────────────┘
                 │
                 ↓
    ┌────────────────────────────────────┐
    │ AdminDashboard                     │
    ├────────────────────────────────────┤
    │ 1. Check user role = "admin"       │
    │ 2. Fetch GET /api/reports          │
    │ 3. Show all citizen reports        │
    │ 4. Filter options:                 │
    │    • All Reports                   │
    │    • Submitted                     │
    │    • In Progress                   │
    │    • Resolved                      │
    │ 5. Update report status:           │
    │    PATCH /api/reports/:id          │
    │ 6. ⭐ adminOnly() middleware       │
    │    ensures only admins can update  │
    └────────────┬───────────────────────┘
                 │
                 ↓
    ┌────────────────────────────────────┐
    │ ✅ ADMIN MODE ACTIVE!              │
    │                                    │
    │ [Report Status Filter]             │
    │ ┌──────────────────────────────┐   │
    │ │ Submitted (12)               │   │
    │ │ In Progress (5)              │   │
    │ │ Resolved (28)                │   │
    │ └──────────────────────────────┘   │
    │                                    │
    │ [Report Card 1]                    │
    │ Pothole on Main St                 │
    │ [Submitted] → [In Progress ▼]    │
    │                                    │
    │ [Report Card 2]                    │
    │ Broken Streetlight                 │
    │ [In Progress] → [Resolved ▼]     │
    │                                    │
    │ [Logout]                           │
    └────────────────────────────────────┘
```

---

### TOKEN-BASED REQUEST FLOW (Report Submission)

```
User logged in as citizen ✅
Token stored: localStorage['token'] = "eyJhbGc..."
         │
         ↓
    ┌────────────────────────────────┐
    │ Fill Report Form               │
    │ • Title: "Pothole on Main St"  │
    │ • Description: "Large hole..."  │
    │ • Category: road_pothole       │
    │ • Location: 40.7128, -74.0060  │
    │ • Images: [photo.jpg]          │
    │                                │
    │ [Submit Report]                │
    └────────────┬───────────────────┘
                 │ createReport(formData)
                 │ from api.js
                 ↓
    ┌────────────────────────────────┐
    │ axios.post('/reports',         │
    │            formData)           │
    │                                │
    │ Interceptor adds header:       │
    │ Authorization:                 │
    │   "Bearer eyJhbGc..."          │
    └────────────┬───────────────────┘
                 │
                 ↓ HTTP POST
    {
      url: http://localhost:5000/api/reports
      headers: {
        Authorization: "Bearer eyJhbGc...",
        Content-Type: "multipart/form-data"
      }
      body: FormData {
        title: "Pothole on Main St",
        description: "...",
        category: "road_pothole",
        latitude: "40.7128",
        longitude: "-74.0060",
        images: File[]
      }
    }
                 │
                 ↓
    ┌────────────────────────────────┐
    │ BACKEND: Express Server        │
    ├────────────────────────────────┤
    │ Middleware chain:              │
    │                                │
    │ 1. CORS check ✅              │
    │ 2. JSON/URL parsing ✅        │
    │ 3. Multer (file upload) ✅    │
    │ 4. ⭐ protect() middleware     │
    │    (JWT verification)          │
    │                                │
    │    ├─ Extract token from       │
    │    │  Authorization header     │
    │    ├─ Verify signature         │
    │    ├─ Decode: {id, email,     │
    │    │           role}           │
    │    ├─ Attach to req.user       │
    │    └─ Continue ✅              │
    │                                │
    │ 5. Route handler:              │
    │    POST /api/reports           │
    │                                │
    │    ├─ Validate inputs          │
    │    ├─ Parse images             │
    │    ├─ Create report with:      │
    │    │  userId: req.user.id ← ⭐ │
    │    │  (links to logged-in user)│
    │    ├─ Save to MongoDB          │
    │    └─ Return success           │
    └────────────┬───────────────────┘
                 │
                 ↓ Response
    {
      status: 201 Created
      body: {
        message: "Report submitted successfully",
        report: {
          _id: "...",
          userId: "...",  ← Linked to user!
          title: "Pothole on Main St",
          status: "submitted",
          ...
        }
      }
    }
                 │
                 ↓
    ┌────────────────────────────────┐
    │ Frontend receives response      │
    ├────────────────────────────────┤
    │ if (!res.data.error) {         │
    │   showNotification("✅ Report  │
    │                   submitted")  │
    │   resetForm()                  │
    │   redirectToDashboard()        │
    │ }                              │
    └────────────┬───────────────────┘
                 │
                 ↓
    ┌────────────────────────────────┐
    │ ✅ SUCCESS!                    │
    │ Report saved with userId ref   │
    │ Now visible in:                │
    │ • Citizen's dashboard          │
    │ • Admin's dashboard            │
    └────────────────────────────────┘
```

---

## 🔐 Token Lifecycle

```
Token Created                    Token Used                    Token Expired
(Login)                         (Every Request)               (7 days)
   │                                 │                              │
   ↓                                 ↓                              ↓
┌──────────┐  localStorage      ┌──────────┐  Authorization   ┌──────────────┐
│ Sign JWT │ ────────────────→  │ Get from │ ───────────────→ │ Logout/Re-   │
│ with key │  "eyJhbGc..."     │localStorage│  Bearer header  │ login needed │
│ 7d exp   │                   │            │                 │              │
└──────────┘                   └──────────┘                   └──────────────┘
   every     POST /api/reports
   login     POST /api/auth/login
   register  GET /api/auth/me
             PATCH /api/auth/me
             PATCH /api/reports/:id (admin)
```

---

## ✅ Connection Summary

| Component | Backend | Frontend | Status |
|-----------|---------|----------|--------|
| **Auth Routes** | ✅ `/api/auth/*` | ← | Connected |
| **Login Method** | ✅ POST /login | → axios | Connected |
| **Register Method** | ✅ POST /register | → axios | Connected |
| **JWT Storage** | ✅ Generated | → localStorage | Connected |
| **Protected Routes** | ✅ protect() | ProtectedRoute ← | Connected |
| **Admin Check** | ✅ adminOnly() | ← | Connected |
| **Report Submission** | ✅ /reports (auth) | → with token | Connected |
| **Status Update** | ✅ /reports/:id (admin) | → with token | Connected |

**Result: 🟢 FULLY CONNECTED & FUNCTIONAL**
