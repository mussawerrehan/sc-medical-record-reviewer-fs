const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const casesController = require('../controllers/cases.controller');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/medical-records/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Authentication middleware (temporarily commented out for testing)
// router.use(authenticateToken);

// Upload medical record and create case
router.post('/upload-medical-record', upload.single('medicalRecord'), casesController.uploadMedicalRecord);

// Existing routes
router.get('/', casesController.getAllCases);
router.get('/:id', casesController.getCaseById);
router.post('/', casesController.createCase);
router.put('/:id', casesController.updateCase);
router.delete('/:id', casesController.deleteCase);

// Flag management
router.post('/:id/flags', casesController.addFlag);
router.put('/:id/flags/:flagId', casesController.updateFlag);
router.delete('/:id/flags/:flagId', casesController.removeFlag);

// Query management  
router.post('/:id/queries', casesController.addQuery);
router.put('/:id/queries/:queryId', casesController.updateQuery);

// Dashboard metrics
router.get('/dashboard/metrics', casesController.getDashboardMetrics);

module.exports = router; 