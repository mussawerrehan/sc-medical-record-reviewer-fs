const Case = require('../models/case.model');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

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

    const cases = await Case.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: {
        exclude: ['deletedAt']
      }
    });

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