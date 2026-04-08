const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const repo = require('../repositories/reportRepo');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${uniqueSuffix}-${safeOriginal}`);
  },
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB per image
    files: 5 // Maximum 5 images
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// GET /api/reports - Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await repo.findAll();
    res.json(reports);
  } catch (err) {
    console.error('Fetch reports error:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/user/my-reports - Get current user's reports (protected)
router.get('/user/my-reports', protect, async (req, res) => {
  try {
    const userReports = await repo.findByUserId(req.user.id);
    res.json(userReports);
  } catch (err) {
    console.error('Fetch user reports error:', err);
    res.status(500).json({ error: 'Failed to fetch your reports' });
  }
});

// GET /api/reports/:id - Get single report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await repo.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    console.error('Fetch report error:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// POST /api/reports - multipart/form-data with fields and images[]
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    if (!['road_pothole', 'street_light', 'garbage', 'women_safety'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category. Must be one of: road_pothole, street_light, garbage, women_safety' });
    }
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location (latitude and longitude) is required' });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude values' });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Latitude must be between -90 and 90, longitude between -180 and 180' });
    }

    const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

    const report = await repo.create({
      userId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      images,
      location: {
        latitude: lat,
        longitude: lng,
        address: address ? address.trim() : undefined,
      },
    });

    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });
  } catch (err) {
    console.error('Create report error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create report', details: err.message });
  }
});

// PATCH /api/reports/:id - Update report status (admin only)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['submitted', 'in_progress', 'resolved', 'pending', 'received', 'investigation_started'];
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const report = await repo.updateStatus(req.params.id, status);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      message: 'Report status updated successfully',
      report
    });
  } catch (err) {
    console.error('Update report error:', err);
    res.status(500).json({ error: 'Failed to update report', details: err.message });
  }
});

// PATCH /api/reports/assign/:id - Assign report to a department (admin only)
router.patch('/assign/:id', protect, adminOnly, async (req, res) => {
  try {
    const { assignedDepartment } = req.body;
    
    if (!assignedDepartment) {
      return res.status(400).json({ error: 'Department is required' });
    }
    
    if (!['municipal', 'women_safety'].includes(assignedDepartment)) {
      return res.status(400).json({ error: 'Invalid department' });
    }

    const report = await repo.assignDepartment(req.params.id, assignedDepartment);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      message: `Report assigned to ${assignedDepartment} successfully`,
      report
    });
  } catch (err) {
    console.error('Assign report error:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

// GET /api/reports/assigned/me - Get reports assigned to the current authority
router.get('/assigned/me', protect, async (req, res) => {
  try {
    const role = req.user.role;
    if (!['municipal', 'women_safety'].includes(role)) {
      return res.status(403).json({ error: 'Access denied. Authority only.' });
    }

    const reports = await repo.findByDepartment(role);
    res.json(reports);
  } catch (err) {
    console.error('Fetch assigned reports error:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

// PATCH /api/reports/authority-update/:id - Update status and remarks by authority
router.patch('/authority-update/:id', protect, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const role = req.user.role;

    if (!['municipal', 'women_safety'].includes(role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const report = await repo.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (report.assignedDepartment !== role) {
      return res.status(403).json({ error: 'This report is not assigned to your department' });
    }

    const updated = await repo.authorityUpdate(req.params.id, status, remarks);

    // Send Notification to User
    try {
      await Notification.create({
        userId: report.userId,
        message: `Your report "${report.title}" status has been updated to "${status.replace('_', ' ')}" by the ${role.replace('_', ' ')} authority.`,
        reportId: report._id
      });
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
    }

    res.json({
      message: 'Status and remarks updated successfully',
      report: updated
    });
  } catch (err) {
    console.error('Authority update error:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

// GET /api/reports/notifications/me - Get current user's notifications
router.get('/notifications/me', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;


