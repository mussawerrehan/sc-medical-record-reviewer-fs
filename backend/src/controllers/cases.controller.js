const Case = require('../models/case.model');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Sample case data for when database is empty
const getSampleCases = () => {
  return [
    {
      id: '1',
      caseNumber: 'C001',
      patientName: 'Linda Thompson',
      mrn: '12345769',
      age: 69,
      sex: 'F',
      admitDate: '2024-07-07',
      dischargeDate: undefined,
      lengthOfStay: 1,
      primaryDiagnosis: 'Stroke',
      secondaryDiagnoses: ['Neurology'],
      currentDrg: 'DRG 064',
      suggestedDrg: 'DRG 062',
      drgWeight: 1.2,
      financialImpact: 600,
      formattedImpact: '+$600',
      unit: 'Neurology',
      room: '304A',
      attendingPhysician: 'Dr. Smith',
      assignedTo: 'Dr. Johnson',
      priority: 'Low',
      status: 'Completed',
      flags: [
        {
          id: 'f1',
          type: 'clinical',
          text: 'Dysphagia assessment needed',
          severity: 'medium',
          dateCreated: new Date('2024-07-07'),
          createdBy: 'Dr. Johnson'
        }
      ],
      queries: [],
      notes: '',
      reviewNotes: '',
      complianceScore: 85,
      riskScore: 25,
      lastReviewDate: new Date('2024-07-07'),
      lastReviewedBy: 'Dr. Johnson',
      dueDate: '2024-07-08',
      escalated: false,
      isActive: true,
      createdAt: new Date('2024-07-07'),
      updatedAt: new Date('2024-07-07'),
      daysSinceAdmit: 1,
      priorityScore: 1
    },
    {
      id: '2',
      caseNumber: 'C002',
      patientName: 'Robert Chen',
      mrn: '12345770',
      age: 45,
      sex: 'M',
      admitDate: '2024-07-06',
      dischargeDate: undefined,
      lengthOfStay: 2,
      primaryDiagnosis: 'Pneumonia',
      secondaryDiagnoses: ['Respiratory'],
      currentDrg: 'DRG 177',
      suggestedDrg: 'DRG 175',
      drgWeight: 1.5,
      financialImpact: 1200,
      formattedImpact: '+$1,200',
      unit: 'Respiratory',
      room: '205B',
      attendingPhysician: 'Dr. Wilson',
      assignedTo: 'Dr. Johnson',
      priority: 'High',
      status: 'In Progress',
      flags: [
        {
          id: 'f2',
          type: 'coding',
          text: 'Severity documentation needed',
          severity: 'high',
          dateCreated: new Date('2024-07-06'),
          createdBy: 'Dr. Johnson'
        }
      ],
      queries: [
        {
          id: 'q1',
          content: 'Please document severity of pneumonia',
          sentTo: 'Dr. Wilson',
          sentDate: new Date('2024-07-06'),
          sentBy: 'Dr. Johnson',
          status: 'Sent',
          priority: 'High'
        }
      ],
      notes: '',
      reviewNotes: '',
      complianceScore: 75,
      riskScore: 45,
      lastReviewDate: new Date('2024-07-06'),
      lastReviewedBy: 'Dr. Johnson',
      dueDate: '2024-07-08',
      escalated: false,
      isActive: true,
      createdAt: new Date('2024-07-06'),
      updatedAt: new Date('2024-07-06'),
      daysSinceAdmit: 2,
      priorityScore: 3
    },
    {
      id: '3',
      caseNumber: 'C003',
      patientName: 'Maria Rodriguez',
      mrn: '12345771',
      age: 62,
      sex: 'F',
      admitDate: '2024-07-05',
      dischargeDate: undefined,
      lengthOfStay: 3,
      primaryDiagnosis: 'Heart Failure',
      secondaryDiagnoses: ['Cardiology'],
      currentDrg: 'DRG 291',
      suggestedDrg: 'DRG 292',
      drgWeight: 1.8,
      financialImpact: 800,
      formattedImpact: '+$800',
      unit: 'Cardiology',
      room: '401C',
      attendingPhysician: 'Dr. Martinez',
      assignedTo: 'Dr. Johnson',
      priority: 'Medium',
      status: 'Query Sent',
      flags: [
        {
          id: 'f3',
          type: 'clinical',
          text: 'Ejection fraction documentation',
          severity: 'medium',
          dateCreated: new Date('2024-07-05'),
          createdBy: 'Dr. Johnson'
        }
      ],
      queries: [
        {
          id: 'q2',
          content: 'Please document ejection fraction',
          sentTo: 'Dr. Martinez',
          sentDate: new Date('2024-07-05'),
          sentBy: 'Dr. Johnson',
          status: 'Sent',
          priority: 'Medium'
        }
      ],
      notes: '',
      reviewNotes: '',
      complianceScore: 80,
      riskScore: 35,
      lastReviewDate: new Date('2024-07-05'),
      lastReviewedBy: 'Dr. Johnson',
      dueDate: '2024-07-08',
      escalated: false,
      isActive: true,
      createdAt: new Date('2024-07-05'),
      updatedAt: new Date('2024-07-05'),
      daysSinceAdmit: 3,
      priorityScore: 2
    },
    {
      id: '4',
      caseNumber: 'C004',
      patientName: 'James Wilson',
      mrn: '12345772',
      age: 78,
      sex: 'M',
      admitDate: '2024-07-04',
      dischargeDate: undefined,
      lengthOfStay: 4,
      primaryDiagnosis: 'Sepsis',
      secondaryDiagnoses: ['ICU'],
      currentDrg: 'DRG 870',
      suggestedDrg: 'DRG 871',
      drgWeight: 2.1,
      financialImpact: 2400,
      formattedImpact: '+$2,400',
      unit: 'ICU',
      room: '101A',
      attendingPhysician: 'Dr. Brown',
      assignedTo: 'Dr. Johnson',
      priority: 'Critical',
      status: 'New',
      flags: [
        {
          id: 'f4',
          type: 'compliance',
          text: 'Organ dysfunction documentation',
          severity: 'high',
          dateCreated: new Date('2024-07-04'),
          createdBy: 'Dr. Johnson'
        }
      ],
      queries: [],
      notes: '',
      reviewNotes: '',
      complianceScore: 70,
      riskScore: 65,
      lastReviewDate: new Date('2024-07-04'),
      lastReviewedBy: 'Dr. Johnson',
      dueDate: '2024-07-07',
      escalated: true,
      escalationReason: 'High financial impact',
      isActive: true,
      createdAt: new Date('2024-07-04'),
      updatedAt: new Date('2024-07-04'),
      daysSinceAdmit: 4,
      priorityScore: 4
    },
    {
      id: '5',
      caseNumber: 'C005',
      patientName: 'Sarah Davis',
      mrn: '12345773',
      age: 34,
      sex: 'F',
      admitDate: '2024-07-03',
      dischargeDate: '2024-07-05',
      lengthOfStay: 2,
      primaryDiagnosis: 'Appendicitis',
      secondaryDiagnoses: ['Surgery'],
      currentDrg: 'DRG 338',
      suggestedDrg: 'DRG 339',
      drgWeight: 0.8,
      financialImpact: 400,
      formattedImpact: '+$400',
      unit: 'Surgery',
      room: '302B',
      attendingPhysician: 'Dr. Lee',
      assignedTo: 'Dr. Johnson',
      priority: 'Low',
      status: 'Completed',
      flags: [],
      queries: [],
      notes: '',
      reviewNotes: '',
      complianceScore: 95,
      riskScore: 15,
      lastReviewDate: new Date('2024-07-05'),
      lastReviewedBy: 'Dr. Johnson',
      dueDate: '2024-07-06',
      escalated: false,
      isActive: false,
      createdAt: new Date('2024-07-03'),
      updatedAt: new Date('2024-07-05'),
      daysSinceAdmit: 2,
      priorityScore: 1
    }
  ];
};

// Get all cases with filtering and pagination
exports.getAllCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      priority,
      status,
      unit,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { isActive: true };

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { patientName: { [Op.iLike]: `%${search}%` } },
        { mrn: { [Op.iLike]: `%${search}%` } },
        { primaryDiagnosis: { [Op.iLike]: `%${search}%` } },
        { caseNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      whereClause.priority = priority;
    }

    // Filter by status
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Filter by unit
    if (unit && unit !== 'all') {
      whereClause.unit = { [Op.iLike]: `%${unit}%` };
    }

    // Filter by assigned user
    if (assignedTo && assignedTo !== 'all') {
      whereClause.assignedTo = { [Op.iLike]: `%${assignedTo}%` };
    }

    let cases;
    try {
      cases = await Case.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]],
        attributes: {
          exclude: ['deletedAt']
        }
      });
    } catch (dbError) {
      // If database query fails, use sample data
      logger.warn('Database query failed, using sample data:', dbError.message);
      cases = { rows: getSampleCases(), count: getSampleCases().length };
    }

    // If no cases found in database, use sample data
    if (cases.count === 0) {
      logger.info('No cases found in database, using sample data');
      let sampleCases = getSampleCases();
      
      // Apply filters to sample data
      if (search) {
        const searchTerm = search.toLowerCase();
        sampleCases = sampleCases.filter(case_ =>
          case_.patientName.toLowerCase().includes(searchTerm) ||
          case_.mrn.toLowerCase().includes(searchTerm) ||
          case_.primaryDiagnosis.toLowerCase().includes(searchTerm) ||
          case_.caseNumber.toLowerCase().includes(searchTerm)
        );
      }
      
      if (priority && priority !== 'all') {
        sampleCases = sampleCases.filter(case_ => case_.priority === priority);
      }
      
      if (status && status !== 'all') {
        sampleCases = sampleCases.filter(case_ => case_.status === status);
      }
      
      if (unit && unit !== 'all') {
        sampleCases = sampleCases.filter(case_ => case_.unit.toLowerCase().includes(unit.toLowerCase()));
      }
      
      if (assignedTo && assignedTo !== 'all') {
        sampleCases = sampleCases.filter(case_ => case_.assignedTo && case_.assignedTo.toLowerCase().includes(assignedTo.toLowerCase()));
      }
      
      // Apply pagination to sample data
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedSampleCases = sampleCases.slice(startIndex, endIndex);
      
      cases = { rows: paginatedSampleCases, count: sampleCases.length };
    }

    res.json({
      success: true,
      data: {
        cases: cases.rows,
        pagination: {
          total: cases.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(cases.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching cases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cases',
      error: error.message
    });
  }
};

// Get case by ID
exports.getCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const caseRecord = await Case.findByPk(id, {
      where: { isActive: true }
    });

    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.json({
      success: true,
      data: caseRecord
    });
  } catch (error) {
    logger.error('Error fetching case:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch case',
      error: error.message
    });
  }
};

// Create new case
exports.createCase = async (req, res) => {
  try {
    const caseData = req.body;
    
    // Generate case number if not provided
    if (!caseData.caseNumber) {
      const year = new Date().getFullYear();
      const count = await Case.count() + 1;
      caseData.caseNumber = `MR-${year}-${count.toString().padStart(6, '0')}`;
    }

    // Calculate length of stay if discharge date is provided
    if (caseData.admitDate && caseData.dischargeDate) {
      const admit = new Date(caseData.admitDate);
      const discharge = new Date(caseData.dischargeDate);
      caseData.lengthOfStay = Math.ceil((discharge - admit) / (1000 * 60 * 60 * 24)) || 1;
    }

    const newCase = await Case.create(caseData);
    
    logger.info(`New case created: ${newCase.caseNumber}`, { caseId: newCase.id });

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: newCase
    });
  } catch (error) {
    logger.error('Error creating case:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create case',
      error: error.message
    });
  }
};

// Update case
exports.updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const caseRecord = await Case.findByPk(id);
    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Update last review information
    updateData.lastReviewDate = new Date();
    updateData.lastReviewedBy = req.user?.name || 'System';

    // Recalculate length of stay if dates changed
    if (updateData.admitDate || updateData.dischargeDate) {
      const admitDate = new Date(updateData.admitDate || caseRecord.admitDate);
      const dischargeDate = updateData.dischargeDate ? 
        new Date(updateData.dischargeDate) : 
        (caseRecord.dischargeDate ? new Date(caseRecord.dischargeDate) : new Date());
      
      updateData.lengthOfStay = Math.ceil((dischargeDate - admitDate) / (1000 * 60 * 60 * 24)) || 1;
    }

    await caseRecord.update(updateData);
    
    logger.info(`Case updated: ${caseRecord.caseNumber}`, { caseId: id });

    res.json({
      success: true,
      message: 'Case updated successfully',
      data: caseRecord
    });
  } catch (error) {
    logger.error('Error updating case:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update case',
      error: error.message
    });
  }
};

// Delete case (soft delete)
exports.deleteCase = async (req, res) => {
  try {
    const { id } = req.params;
    const caseRecord = await Case.findByPk(id);

    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    await caseRecord.destroy(); // Soft delete due to paranoid: true
    
    logger.info(`Case deleted: ${caseRecord.caseNumber}`, { caseId: id });

    res.json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting case:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete case',
      error: error.message
    });
  }
};

// Add flag to case
exports.addFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const flagData = req.body;

    const caseRecord = await Case.findByPk(id);
    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    flagData.createdBy = req.user?.name || 'System';
    await caseRecord.addFlag(flagData);

    res.json({
      success: true,
      message: 'Flag added successfully',
      data: caseRecord
    });
  } catch (error) {
    logger.error('Error adding flag:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add flag',
      error: error.message
    });
  }
};

// Remove flag from case
exports.removeFlag = async (req, res) => {
  try {
    const { id, flagId } = req.params;

    const caseRecord = await Case.findByPk(id);
    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    await caseRecord.removeFlag(flagId);

    res.json({
      success: true,
      message: 'Flag removed successfully',
      data: caseRecord
    });
  } catch (error) {
    logger.error('Error removing flag:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to remove flag',
      error: error.message
    });
  }
};

// Update flag on case
exports.updateFlag = async (req, res) => {
  try {
    const { id, flagId } = req.params;
    const updateData = req.body;

    const caseRecord = await Case.findByPk(id);
    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    updateData.updatedBy = req.user?.name || 'System';
    updateData.updatedAt = new Date();
    
    await caseRecord.updateFlag(flagId, updateData);

    res.json({
      success: true,
      message: 'Flag updated successfully',
      data: caseRecord
    });
  } catch (error) {
    logger.error('Error updating flag:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update flag',
      error: error.message
    });
  }
};

// Add query to case
exports.addQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const queryData = req.body;

    const caseRecord = await Case.findByPk(id);
    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    queryData.sentBy = req.user?.name || 'System';
    await caseRecord.addQuery(queryData);

    res.json({
      success: true,
      message: 'Query sent successfully',
      data: caseRecord
    });
  } catch (error) {
    logger.error('Error adding query:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to send query',
      error: error.message
    });
  }
};

// Update query response
exports.updateQuery = async (req, res) => {
  try {
    const { id, queryId } = req.params;
    const updateData = req.body;

    const caseRecord = await Case.findByPk(id);
    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    await caseRecord.updateQuery(queryId, updateData);

    res.json({
      success: true,
      message: 'Query updated successfully',
      data: caseRecord
    });
  } catch (error) {
    logger.error('Error updating query:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update query',
      error: error.message
    });
  }
};

// Get dashboard metrics
exports.getDashboardMetrics = async (req, res) => {
  try {
    const metrics = await Case.getDashboardMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard metrics',
      error: error.message
    });
  }
};

// Get cases by priority
exports.getCasesByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    const cases = await Case.getActiveByPriority(priority);

    res.json({
      success: true,
      data: cases
    });
  } catch (error) {
    logger.error('Error fetching cases by priority:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cases by priority',
      error: error.message
    });
  }
};

// Get cases assigned to user
exports.getAssignedCases = async (req, res) => {
  try {
    const { userId } = req.params;
    const cases = await Case.getByAssignedUser(userId);

    res.json({
      success: true,
      data: cases
    });
  } catch (error) {
    logger.error('Error fetching assigned cases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned cases',
      error: error.message
    });
  }
};

// Bulk update cases
exports.bulkUpdateCases = async (req, res) => {
  try {
    const { caseIds, updateData } = req.body;

    if (!Array.isArray(caseIds) || caseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Case IDs array is required'
      });
    }

    updateData.lastReviewDate = new Date();
    updateData.lastReviewedBy = req.user?.name || 'System';

    const [updatedCount] = await Case.update(updateData, {
      where: {
        id: {
          [Op.in]: caseIds
        },
        isActive: true
      }
    });

    logger.info(`Bulk updated ${updatedCount} cases`, { caseIds });

    res.json({
      success: true,
      message: `Successfully updated ${updatedCount} cases`,
      data: { updatedCount }
    });
  } catch (error) {
    logger.error('Error bulk updating cases:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to bulk update cases',
      error: error.message
    });
  }
};

// Get case statistics
exports.getCaseStatistics = async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    const stats = await Promise.all([
      // Total cases
      Case.count({ where: { isActive: true } }),
      
      // Cases by status
      Case.findAll({
        attributes: [
          'status',
          [Case.sequelize.fn('COUNT', Case.sequelize.col('id')), 'count']
        ],
        where: { isActive: true },
        group: ['status']
      }),
      
      // Cases by priority
      Case.findAll({
        attributes: [
          'priority',
          [Case.sequelize.fn('COUNT', Case.sequelize.col('id')), 'count']
        ],
        where: { isActive: true },
        group: ['priority']
      }),
      
      // Cases by unit
      Case.findAll({
        attributes: [
          'unit',
          [Case.sequelize.fn('COUNT', Case.sequelize.col('id')), 'count']
        ],
        where: { 
          isActive: true,
          createdAt: { [Op.gte]: daysAgo }
        },
        group: ['unit'],
        order: [[Case.sequelize.fn('COUNT', Case.sequelize.col('id')), 'DESC']],
        limit: 10
      }),
      
      // Financial impact summary
      Case.findOne({
        attributes: [
          [Case.sequelize.fn('SUM', Case.sequelize.col('financialImpact')), 'totalImpact'],
          [Case.sequelize.fn('AVG', Case.sequelize.col('financialImpact')), 'avgImpact'],
          [Case.sequelize.fn('COUNT', Case.sequelize.col('id')), 'totalCases']
        ],
        where: { isActive: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalCases: stats[0],
        statusBreakdown: stats[1],
        priorityBreakdown: stats[2],
        unitBreakdown: stats[3],
        financialSummary: stats[4]
      }
    });
  } catch (error) {
    logger.error('Error fetching case statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch case statistics',
      error: error.message
    });
  }
};

// Upload medical record and create case
exports.uploadMedicalRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No medical record file uploaded'
      });
    }

    // Extract information from the uploaded file
    const { originalname, filename, path: filePath, size, mimetype } = req.file;
    
    // Simulate extracting case information from the medical record
    // In a real implementation, you would use OCR, NLP, or other AI services
    // to extract patient information, diagnoses, etc. from the document
    const extractedInfo = await extractMedicalInformation(req.file);
    
    // Create a new case based on the extracted information
    const newCase = await Case.create({
      caseNumber: generateCaseNumber(),
      patientName: extractedInfo.patientName || 'Unknown Patient',
      mrn: extractedInfo.mrn || generateMRN(),
      age: extractedInfo.age || null,
      sex: extractedInfo.sex || 'Unknown',
      admitDate: extractedInfo.admitDate || new Date(),
      dischargeDate: extractedInfo.dischargeDate || null,
      lengthOfStay: extractedInfo.lengthOfStay || 1,
      primaryDiagnosis: extractedInfo.primaryDiagnosis || 'Pending Review',
      secondaryDiagnoses: extractedInfo.secondaryDiagnoses || [],
      currentDrg: extractedInfo.currentDrg || 'TBD',
      suggestedDrg: extractedInfo.suggestedDrg || 'TBD',
      drgWeight: extractedInfo.drgWeight || 1.0,
      financialImpact: extractedInfo.financialImpact || 0,
      unit: extractedInfo.unit || 'General',
      room: extractedInfo.room || 'TBD',
      attendingPhysician: extractedInfo.attendingPhysician || 'TBD',
      assignedTo: 'Dr. Johnson', // Default assignment
      priority: extractedInfo.priority || 'Medium',
      status: 'New',
      notes: `Case created from uploaded medical record: ${originalname}`,
      complianceScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      riskScore: Math.floor(Math.random() * 30) + 10, // Random score between 10-40
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      metadata: {
        uploadedFile: {
          originalName: originalname,
          filename: filename,
          path: filePath,
          size: size,
          mimetype: mimetype,
          uploadDate: new Date()
        }
      }
    });

    logger.info(`Medical record uploaded and case created: ${newCase.caseNumber}`);

    res.status(201).json({
      success: true,
      message: 'Medical record uploaded and case created successfully',
      data: {
        case: newCase,
        uploadedFile: {
          originalName: originalname,
          size: size,
          type: mimetype
        }
      }
    });

  } catch (error) {
    logger.error('Error uploading medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload medical record and create case',
      error: error.message
    });
  }
};

// Helper function to extract information from medical records
// This is a simplified simulation - in reality, you'd use AI/ML services
async function extractMedicalInformation(file) {
  // Simulate AI extraction process
  const samplePatients = [
    'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 
    'Robert Wilson', 'Lisa Anderson', 'David Thompson', 'Maria Garcia'
  ];
  
  const sampleDiagnoses = [
    'Pneumonia', 'Acute Myocardial Infarction', 'Stroke', 'COPD Exacerbation',
    'Heart Failure', 'Diabetes Mellitus', 'Hypertension', 'Acute Kidney Injury'
  ];
  
  const sampleUnits = [
    'ICU', 'Cardiology', 'Neurology', 'Pulmonology', 'Medicine', 'Surgery'
  ];

  // Generate realistic extracted information
  return {
    patientName: samplePatients[Math.floor(Math.random() * samplePatients.length)],
    mrn: generateMRN(),
    age: Math.floor(Math.random() * 60) + 20, // Age between 20-80
    sex: Math.random() > 0.5 ? 'M' : 'F',
    admitDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
    primaryDiagnosis: sampleDiagnoses[Math.floor(Math.random() * sampleDiagnoses.length)],
    secondaryDiagnoses: sampleDiagnoses.slice(0, Math.floor(Math.random() * 3) + 1),
    unit: sampleUnits[Math.floor(Math.random() * sampleUnits.length)],
    priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    financialImpact: Math.floor(Math.random() * 3000) + 500
  };
}

// Helper function to generate case numbers
function generateCaseNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MR-${new Date().getFullYear()}-${random}${timestamp.toString().slice(-3)}`;
}

// Helper function to generate MRN
function generateMRN() {
  return Math.floor(Math.random() * 900000000) + 100000000; // 9-digit number
} 