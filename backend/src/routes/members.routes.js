const express = require('express');
const router = express.Router();
const Member = require('../models/member.model');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

// Get all members for logged-in user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { page = 1, limit = 25, search, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { enrolledBy: userId };
    
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { memberId: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const members = await Member.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        members: members.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: members.count,
          totalPages: Math.ceil(members.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching members:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch members' });
  }
});

// Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const member = await Member.findOne({
      where: { id: req.params.id, enrolledBy: userId }
    });

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    res.json({ success: true, data: member });
  } catch (error) {
    logger.error('Error fetching member:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch member' });
  }
});

// Create new member
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const {
      firstName, lastName, dateOfBirth, gender, ssn, address, city, state, zipCode,
      phone, email, insuranceProvider, policyNumber, groupNumber,
      emergencyContactName, emergencyContactPhone, allergies, medications, medicalHistory
    } = req.body;

    // Generate unique member ID
    const memberId = `MEM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const member = await Member.create({
      memberId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      ssn,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      insuranceProvider,
      policyNumber,
      groupNumber,
      emergencyContactName,
      emergencyContactPhone,
      allergies,
      medications,
      medicalHistory,
      enrolledBy: userId,
      status: 'Active'
    });

    logger.info('Member created successfully', { memberId: member.id, enrolledBy: userId });

    res.status(201).json({
      success: true,
      data: member,
      message: 'Member enrolled successfully'
    });
  } catch (error) {
    logger.error('Error creating member:', error);
    res.status(500).json({ success: false, error: 'Failed to create member' });
  }
});

// Update member
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const member = await Member.findOne({
      where: { id: req.params.id, enrolledBy: userId }
    });

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    await member.update(req.body);

    logger.info('Member updated successfully', { memberId: member.id, updatedBy: userId });

    res.json({
      success: true,
      data: member,
      message: 'Member updated successfully'
    });
  } catch (error) {
    logger.error('Error updating member:', error);
    res.status(500).json({ success: false, error: 'Failed to update member' });
  }
});

// Delete member (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const member = await Member.findOne({
      where: { id: req.params.id, enrolledBy: userId }
    });

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    await member.update({ isActive: false, status: 'Inactive' });

    logger.info('Member deactivated', { memberId: member.id, deactivatedBy: userId });

    res.json({
      success: true,
      message: 'Member deactivated successfully'
    });
  } catch (error) {
    logger.error('Error deactivating member:', error);
    res.status(500).json({ success: false, error: 'Failed to deactivate member' });
  }
});

// Get member analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const userId = req.user?.id;
    const member = await Member.findOne({
      where: { id: req.params.id, enrolledBy: userId }
    });

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    // This would integrate with case and claim analytics
    const analytics = {
      totalCases: 5,
      activeCases: 2,
      totalClaims: 12,
      approvedClaims: 8,
      deniedClaims: 2,
      pendingClaims: 2,
      totalClaimAmount: 25000.00,
      paidAmount: 18500.00,
      outstandingAmount: 6500.00,
      averageProcessingTime: 15.5,
      casesByStatus: [
        { status: 'Open', count: 1 },
        { status: 'In Progress', count: 1 },
        { status: 'Closed', count: 3 }
      ],
      claimsByMonth: [
        { month: 'Jan', approved: 2, denied: 0, pending: 1 },
        { month: 'Feb', approved: 3, denied: 1, pending: 0 },
        { month: 'Mar', approved: 3, denied: 1, pending: 1 }
      ]
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    logger.error('Error fetching member analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch member analytics' });
  }
});

// Get member lookup options
router.get('/lookup/options', async (req, res) => {
  try {
    const options = {
      genders: ['M', 'F', 'Other'],
      states: [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
      ],
      insuranceProviders: [
        'Aetna', 'Anthem', 'Blue Cross Blue Shield', 'Cigna', 'Humana',
        'Kaiser Permanente', 'Molina Healthcare', 'UnitedHealth Group',
        'Medicaid', 'Medicare', 'Other'
      ],
      statuses: ['Active', 'Inactive', 'Pending']
    };

    res.json({ success: true, data: options });
  } catch (error) {
    logger.error('Error fetching lookup options:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch lookup options' });
  }
});

module.exports = router; 