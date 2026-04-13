# CivicShield 3.0

🛡️ **A comprehensive civic issue reporting platform** for citizens, municipal authorities, and women safety organizations to report and manage local issues collaboratively.

---

## 📋 Overview

CivicShield enables citizens to report civic issues (potholes, street lights, garbage disposal, women safety concerns) with images and location details. Authorities can manage, track, and resolve these issues in real-time.

### Key Features

✅ **Multi-Role Authentication** - Citizens, Admins, Municipal Staff, Women Safety Officers  
✅ **Issue Reporting** - Text, images, location-based reporting  
✅ **Real-Time Tracking** - Status updates and notifications  
✅ **Dashboard Analytics** - Issue statistics and trends  
✅ **Email Notifications** - When issues are updated  
✅ **Role-Based Access Control** - Different views and permissions per role  
✅ **JWT Security** - Secure token-based authentication  
✅ **MongoDB Integration** - Scalable data persistence  

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas recommended)
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer (Gmail SMTP)
- **File Upload**: Multer
- **Environment**: dotenv

### Frontend
- **Library**: React 18+
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Styling**: CSS3 + Responsive Design

### Database
- **Primary**: MongoDB Atlas (Cloud)
- **Fallback**: Local MongoDB

---

## 📦 Project Structure

```
SFF 3.0 Project/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth & validation
│   │   └── repositories/      # Database operations
│   ├── server.js              # Main server file
│   ├── package.json
│   ├── .env.example           # Environment template
│   └── README.md
│
├── frontend/
│   └── CivicShield/           # React application
│       ├── src/
│       │   ├── pages/         # Route pages
│       │   ├── components/    # Reusable components
│       │   ├── assets/        # Images, fonts
│       │   ├── api.js         # API client
│       │   └── App.jsx        # Main component
│       ├── package.json
│       ├── .env.example
│       └── README.md
│
├── Documentation files/       # Setup & integration guides
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** (Atlas account or local installation)
- **Git**

### 1. Clone Repository
```bash
git clone <repository-url>
cd SFF\ 3.0\ Project
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# - MongoDB URI
# - JWT Secret
# - Gmail credentials (for OTP/password reset)

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend/CivicShield

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with API base URL (default: http://localhost:5000/api)

# Start development server
npm run dev

# App runs on http://localhost:5173
```

---

## 🔐 Environment Configuration

### Backend (.env.example provided)
```env
PORT=5000
MONGODB_URI=mongodb://user:pass@host/database
JWT_SECRET=your_secret_here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-password
```

### Frontend (.env.example provided)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/me` - Update user profile
- `POST /api/auth/logout` - Logout

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create report
- `GET /api/reports/:id` - Get report by ID
- `PATCH /api/reports/:id` - Update report status
- `GET /api/reports/user/my-reports` - Get user's reports

### Admin/Authority
- `GET /api/reports` - View all reports
- `PATCH /api/reports/:id` - Update report status
- `POST /api/reports/:id/assign` - Assign to department

---

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **Citizen** | Report issues, view own reports, receive notifications |
| **Admin** | View all reports, manage reports, manage users, view analytics |
| **Municipal Staff** | View assigned reports, update status, add comments |
| **Women Safety Officer** | View women safety reports, coordinate response |

---

## 🔒 Security Features

✅ **Password Hashing** - bcryptjs (8 salt rounds)  
✅ **JWT Tokens** - 7-day expiry  
✅ **CORS** - Configured for localhost:3000-5000  
✅ **Input Validation** - Email format, password requirements  
✅ **Secure Headers** - CORS, X-Frame-Options  
✅ **Email Verification** - OTP-based account activation  
✅ **Password Reset** - Secure token-based reset flow  
✅ **Protected Routes** - JWT middleware on all auth endpoints  

---

## 📧 Email Configuration

### Gmail Setup (Required for OTP/Password Reset)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account → Security → App Passwords
   - Select Mail → Windows
   - Generate new 16-character password
3. **Update .env**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
   ```

### Alternative Email Services
You can modify the transporter in `backend/src/routes/auth.js` to use:
- SendGrid
- Mailgun
- AWS SES
- Microsoft 365

---

## 🧪 Testing

### Test Scripts Available

```bash
# Backend API test
npm run test-api

# Auth connection test
npm run test-auth-connection

# OTP test
npm run test-otp

# Check database
npm run check-db
```

### Manual Testing

1. **User Registration**
   - Visit frontend on http://localhost:5173
   - Click "Sign up" on citizen login page
   - Receive OTP in email
   - Verify OTP

2. **Admin Login**
   - Click "Admin Login"
   - Use admin credentials
   - Access admin dashboard

3. **Report Creation**
   - Login as citizen
   - Click "Create Report"
   - Fill form with image & location
   - Submit (appears on admin dashboard)

---

## 📖 Documentation Files

The project includes comprehensive documentation:

- **INTEGRATION_GUIDE.md** - Complete setup & integration
- **AUTH_SYSTEM_DOCUMENTATION.md** - Authentication details
- **ADMIN_MANAGEMENT_GUIDE.md** - Admin user management
- **FLOW_DIAGRAMS.md** - Process flow diagrams
- **QUICK_REFERENCE.md** - Quick API reference
- **LOGIN_QUICKSTART.md** - 30-minute quick start

---

## 🚀 Deployment

### Backend Deployment
```bash
# Build and deploy to Heroku/Railway/Render
npm install
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
npm run preview
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Verify MongoDB is running locally or Atlas URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure credentials are correct in .env

### Emails Not Sending
- Verify Gmail App Password is correct
- Check 2FA is enabled on Gmail account
- Look for error logs in backend console
- Fallback: OTP appears in backend console logs

### Frontend Not Connecting to Backend
- Verify backend is running on port 5000
- Check VITE_API_BASE_URL in .env matches
- Check browser console for CORS errors
- Verify CORS is enabled in backend

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/feature-name`
5. Submit a Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👤 Support

For issues, bugs, or feature requests:
- Open an GitHub Issue
- Check existing documentation
- Review troubleshooting section

---

## 📞 Contact

**CivicShield Team**
- Email: support@civicshield.com
- GitHub: [@CivicShield](https://github.com/civicshield)

---

**Last Updated**: April 2026  
**Version**: 3.0.0  
**Status**: ✅ Production Ready
