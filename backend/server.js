require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static folder for uploaded files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Civik Shield API is running' });
});

// Root message (avoid 404 on base URL)
app.get('/', (_req, res) => {
  res.json({
    name: 'Civik Shield API',
    status: 'ok',
    docs: '/api/health',
    endpoints: ['/api/health', '/api/auth', '/api/reports']
  });
});

// Routes
const authRouter = require('./src/routes/auth');
const reportsRouter = require('./src/routes/reports');
app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 10MB per file.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum 5 images allowed.' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Mongo connection
const configuredMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const defaultMongoUri = 'mongodb://127.0.0.1:27017/civik_shield';

const connectToMongo = async (uri) => {
  return mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
  });
};

(async () => {
  const primaryUri = configuredMongoUri || defaultMongoUri;

  try {
    await connectToMongo(primaryUri);
    console.log('✓ MongoDB connected successfully');
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    if (configuredMongoUri && configuredMongoUri !== defaultMongoUri) {
      console.warn('⚠️ Falling back to local MongoDB URI:', defaultMongoUri);
      try {
        await connectToMongo(defaultMongoUri);
        console.log('✓ MongoDB connected successfully using local fallback');
      } catch (fallbackErr) {
        console.error('✗ Local MongoDB fallback failed:', fallbackErr.message);
        console.error('Make sure MongoDB is running locally or fix your MONGODB_URI.');
      }
    } else {
      console.error('Make sure MongoDB is running on:', defaultMongoUri);
    }
  }
})();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API endpoints available at http://localhost:${PORT}/api`);
});


