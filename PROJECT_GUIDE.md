# CivicShield 3.0 – Project Guide

This file gives any AI agent or new contributor everything needed to understand, run, and extend the project quickly.

## Overview
- Purpose: Civic issue reporting (potholes, street lights, garbage, women safety) with image uploads, location, and status tracking.
- Stack:
  - Backend: Node.js, Express, Multer, Mongoose
  - DB: MongoDB (Atlas recommended)
  - Frontend: React + Vite + React Router
- Default Ports:
  - Backend API: http://localhost:5000
  - Frontend: http://localhost:5173

## Repository Structure
```
SFF 3.0 Project/
  backend/
    server.js
    README.md
    package.json
    src/
      models/Report.js
      repositories/reportRepo.js
      routes/reports.js
    uploads/              # runtime: uploaded images (served at /uploads)
  frontend/
    CivicShield/
      package.json
      src/
        api.js, App.jsx, components/reportform.jsx, pages/*
      public/
```

## Quick Start
1) Prerequisites: Node 18+, npm, a MongoDB Atlas cluster (or local MongoDB).

2) Backend – install and run
```bash
cd backend
npm install
# Create .env (see Environment section)
npm run dev      # development (nodemon)
# or
npm start        # production
```

3) Frontend – install and run
```bash
cd frontend/CivicShield
npm install
npm run dev      # opens http://localhost:5173
```

## Environment
Create `backend/.env` with:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password_encoded>@<cluster>.<id>.mongodb.net/civik_shield?retryWrites=true&w=majority
```
Notes:
- If your password contains special characters like @, encode them (e.g., @ => %40).
- The DB name used is `civik_shield`. Atlas Network Access must allow your current IP.

## Backend Details
- Entry: `backend/server.js`
- Static: `GET /uploads/*` serves files from `backend/uploads`.
- Health: `GET /api/health` returns `{ status: 'ok' }`.
- Reports API (mounted at `/api/reports`):
  - `GET /` – list reports (newest first)
  - `GET /:id` – get report by id
  - `POST /` – multipart/form-data with fields: `title`, `description`, `category` in {`road_pothole`,`street_light`,`garbage`,`women_safety`}, `latitude`, `longitude`, `address?`; images under field name `images` (max 5, 10MB each)
  - `PATCH /:id` – `{ status: 'submitted'|'in_progress'|'resolved' }`
- Error handling: Multer errors (size/count/type) and generic errors return JSON `{ error: string }`.
- DB fallback: If Mongo isn’t connected, repository uses an in-memory store so APIs still work (non-persistent).

## Data Model (Report)
```
{
  title: string,
  description: string,
  category: 'road_pothole' | 'street_light' | 'garbage' | 'women_safety',
  images: string[],             // e.g. "/uploads/<filename>"
  location: { latitude: number, longitude: number, address?: string },
  status: 'submitted' | 'in_progress' | 'resolved',
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Details
- App entry: `frontend/CivicShield/src/main.jsx`, `App.jsx`
- Pages:
  - `/` Report form (geolocation + images)
  - `/dashboard` Dashboard table with filters/search
  - `/about` Info page
- API client: `frontend/CivicShield/src/api.js` with base `http://localhost:5000/api`

## Common Operations
- Create a report (curl, no images):
```bash
curl -X POST http://localhost:5000/api/reports \
  -F "title=Test" -F "description=Demo" -F "category=road_pothole" \
  -F "latitude=28.6139" -F "longitude=77.2090" -F "address=Delhi"
```
- List reports:
```bash
curl http://localhost:5000/api/reports
```
- Update status:
```bash
curl -X PATCH http://localhost:5000/api/reports/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

## Housekeeping & Conventions
- Do not commit `node_modules/` or `uploads/` contents.
- Logs and transient files should be deleted: `*.err.log`, `*.out.log`, `TEST_RESULTS.md`.
- Keep `backend/uploads/` folder but it may be empty.
- Sensitive credentials must not be committed; use `.env`.

## Troubleshooting
- Seeing `127.0.0.1:27017` in logs:
  - Ensure `backend/.env` exists and contains `MONGO_URI`.
  - Restart the backend process after changes.
  - Verify Atlas Network Access allows your IP.
- Image uploads failing:
  - Ensure you are sending field name `images` and total ≤5 files, each ≤10MB.
- CORS/network errors from frontend:
  - Backend must be reachable at `http://localhost:5000` or update `frontend/CivicShield/src/api.js`.

## Security (Recommended)
- Restrict Atlas access to specific IPs, rotate DB user credentials.
- Avoid placing secrets in code; prefer environment variables / secret managers.

---
This guide is the single source of truth for setup and operations. If you change structure or endpoints, update this file.
