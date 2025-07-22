const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const Case = require('../models/case.model');
const Member = require('../models/member.model');
const Attachment = require('../models/attachment.model');
const CaseNote = require('../models/case-note.model');
const ActivityLog = require('../models/activity-log.model');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/case-attachments');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `case-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|gif|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents and images are allowed'));
    }
  }
});

// Helper function to log activity
const logActivity = async (caseId, activityType, description, performedBy, oldValue = null, newValue = null, req = null) => {
  try {
    await ActivityLog.create({
      caseId,
      activityType,
      description,
      oldValue,
      newValue,
      performedBy,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      metadata: { timestamp: new Date() }
    });
  } catch (error) {
    logger.error('Error logging activity:', error);
  }
};

// Get real lookup data for analytics
router.get('/lookup-data', async (req, res) => {
  try {
    // This would come from actual database queries in production
    const data = {
      facilities: [
        'Main Campus Hospital',
        'North Campus Medical Center',
        'South Campus Clinic',
        'Downtown Emergency Center',
        'Suburban Outpatient Center'
      ],
      serviceLines: [
        'Medicine',
        'Surgery', 
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Oncology',
        'Pediatrics',
        'Emergency Medicine',
        'Radiology',
        'Pathology'
      ],
      userRoles: [
        'CDI Specialist',
        'Compliance Officer',
        'Quality Manager',
        'Physician Advisor',
        'Case Manager',
        'Administrator'
      ],
      priorities: ['Low', 'Medium', 'High', 'Critical'],
      statuses: ['Open', 'In Progress', 'Closed', 'Submitted for Review', 'Approved', 'Rejected'],
      workflowStatuses: ['Draft', 'Active', 'Under Review', 'Completed', 'Cancelled']
    };

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching lookup data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch lookup data' });
  }
});

// Create new case
router.post('/create', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const {
      memberId, patientName, mrn, age, sex, admitDate, dischargeDate,
      primaryDiagnosis, secondaryDiagnoses, facility, serviceLine, unit,
      attendingPhysician, priority, notes
    } = req.body;

    // Generate unique case number
    const caseNumber = `CASE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const caseData = await Case.create({
      caseNumber,
      memberId,
      patientName,
      mrn,
      age,
      sex,
      admitDate,
      dischargeDate,
      lengthOfStay: dischargeDate ? 
        Math.ceil((new Date(dischargeDate) - new Date(admitDate)) / (1000 * 60 * 60 * 24)) : 1,
      primaryDiagnosis,
      secondaryDiagnoses: secondaryDiagnoses || [],
      facility,
      serviceLine,
      unit,
      attendingPhysician,
      priority: priority || 'Medium',
      status: 'Open',
      workflowStatus: 'Draft',
      createdBy: userId,
      assignedTo: userId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      complianceScore: Math.floor(Math.random() * 40) + 60, // Random score 60-100
      riskScore: Math.floor(Math.random() * 30) + 1, // Random score 1-30
      financialImpact: Math.floor(Math.random() * 5000) + 1000 // Random $1000-$6000
    });

    // Log case creation
    await logActivity(
      caseData.id,
      'Case Created',
      `Case ${caseNumber} created for patient ${patientName}`,
      userId,
      null,
      caseData.toJSON(),
      req
    );

    // Add initial note if provided
    if (notes) {
      await CaseNote.create({
        caseId: caseData.id,
        noteType: 'General',
        title: 'Initial Case Notes',
        content: notes,
        createdBy: userId
      });

      await logActivity(
        caseData.id,
        'Note Added',
        'Initial case notes added',
        userId,
        null,
        { noteType: 'General', content: notes },
        req
      );
    }

    logger.info('Case created successfully', { caseId: caseData.id, createdBy: userId });

    res.status(201).json({
      success: true,
      data: caseData,
      message: 'Case created successfully'
    });
  } catch (error) {
    logger.error('Error creating case:', error);
    res.status(500).json({ success: false, error: 'Failed to create case' });
  }
});

// Update case workflow status
router.put('/:id/workflow', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { status, workflowStatus, notes } = req.body;

    const caseData = await Case.findByPk(req.params.id);
    if (!caseData) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }

    const oldStatus = { status: caseData.status, workflowStatus: caseData.workflowStatus };
    
    if (status) caseData.status = status;
    if (workflowStatus) caseData.workflowStatus = workflowStatus;
    
    await caseData.save();

    // Log workflow change
    await logActivity(
      caseData.id,
      'Workflow Changed',
      `Case workflow updated from ${oldStatus.status}/${oldStatus.workflowStatus} to ${caseData.status}/${caseData.workflowStatus}`,
      userId,
      oldStatus,
      { status: caseData.status, workflowStatus: caseData.workflowStatus },
      req
    );

    // Add workflow note if provided
    if (notes) {
      await CaseNote.create({
        caseId: caseData.id,
        noteType: 'Administrative',
        title: `Workflow Update - ${status || workflowStatus}`,
        content: notes,
        createdBy: userId
      });
    }

    res.json({
      success: true,
      data: caseData,
      message: 'Case workflow updated successfully'
    });
  } catch (error) {
    logger.error('Error updating case workflow:', error);
    res.status(500).json({ success: false, error: 'Failed to update case workflow' });
  }
});

// Add attachment to case
router.post('/:id/attachments', upload.single('file'), async (req, res) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const { fileType, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const caseData = await Case.findByPk(caseId);
    if (!caseData) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }

    const attachment = await Attachment.create({
      caseId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileType: fileType || 'Document',
      description,
      uploadedBy: userId
    });

    // Log attachment addition
    await logActivity(
      caseId,
      'Attachment Added',
      `File "${req.file.originalname}" attached to case`,
      userId,
      null,
      { fileName: req.file.originalname, fileType },
      req
    );

    res.status(201).json({
      success: true,
      data: attachment,
      message: 'Attachment added successfully'
    });
  } catch (error) {
    logger.error('Error adding attachment:', error);
    res.status(500).json({ success: false, error: 'Failed to add attachment' });
  }
});

// Get case attachments
router.get('/:id/attachments', async (req, res) => {
  try {
    const attachments = await Attachment.findAll({
      where: { caseId: req.params.id, isActive: true },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: attachments });
  } catch (error) {
    logger.error('Error fetching attachments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attachments' });
  }
});

// Add note to case
router.post('/:id/notes', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { noteType, title, content, priority, isPrivate, tags } = req.body;

    const note = await CaseNote.create({
      caseId: req.params.id,
      noteType: noteType || 'General',
      title,
      content,
      priority: priority || 'Medium',
      isPrivate: isPrivate || false,
      tags: tags || [],
      createdBy: userId
    });

    // Log note addition
    await logActivity(
      req.params.id,
      'Note Added',
      `${noteType || 'General'} note added: ${title || 'Untitled'}`,
      userId,
      null,
      { noteType, title, priority },
      req
    );

    res.status(201).json({
      success: true,
      data: note,
      message: 'Note added successfully'
    });
  } catch (error) {
    logger.error('Error adding note:', error);
    res.status(500).json({ success: false, error: 'Failed to add note' });
  }
});

// Get case notes
router.get('/:id/notes', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { noteType } = req.query;

    const whereClause = { 
      caseId: req.params.id, 
      isActive: true,
      [Op.or]: [
        { isPrivate: false },
        { createdBy: userId }
      ]
    };

    if (noteType) {
      whereClause.noteType = noteType;
    }

    const notes = await CaseNote.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: notes });
  } catch (error) {
    logger.error('Error fetching notes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notes' });
  }
});

// Get case activity log
router.get('/:id/activity', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const activities = await ActivityLog.findAndCountAll({
      where: { caseId: req.params.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['performedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        activities: activities.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: activities.count,
          totalPages: Math.ceil(activities.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching activity log:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch activity log' });
  }
});

// Get case with all related data
router.get('/:id/complete', async (req, res) => {
  try {
    const caseData = await Case.findByPk(req.params.id);
    if (!caseData) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }

    // Get related data
    const [attachments, notes, activities] = await Promise.all([
      Attachment.findAll({ 
        where: { caseId: req.params.id, isActive: true },
        order: [['createdAt', 'DESC']]
      }),
      CaseNote.findAll({ 
        where: { caseId: req.params.id, isActive: true },
        order: [['createdAt', 'DESC']]
      }),
      ActivityLog.findAll({ 
        where: { caseId: req.params.id },
        order: [['performedAt', 'DESC']],
        limit: 20
      })
    ]);

    res.json({
      success: true,
      data: {
        case: caseData,
        attachments,
        notes,
        recentActivities: activities
      }
    });
  } catch (error) {
    logger.error('Error fetching complete case data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch case data' });
  }
});

module.exports = router; 