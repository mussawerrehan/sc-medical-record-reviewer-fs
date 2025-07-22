const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Sample case data matching frontend interface
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

// GET /api/claims - Get all claims
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, priority, status, unit, assignedTo } = req.query;
    
    let cases = getSampleCases();
    
    // Apply filters
    if (search) {
      const searchTerm = search.toLowerCase();
      cases = cases.filter(case_ =>
        case_.patientName.toLowerCase().includes(searchTerm) ||
        case_.mrn.toLowerCase().includes(searchTerm) ||
        case_.primaryDiagnosis.toLowerCase().includes(searchTerm) ||
        case_.unit.toLowerCase().includes(searchTerm)
      );
    }
    
    if (priority && priority !== 'all') {
      cases = cases.filter(case_ => case_.priority === priority);
    }
    
    if (status && status !== 'all') {
      cases = cases.filter(case_ => case_.status === status);
    }
    
    if (unit && unit !== 'all') {
      cases = cases.filter(case_ => case_.unit === unit);
    }
    
    if (assignedTo && assignedTo !== 'all') {
      cases = cases.filter(case_ => case_.assignedTo === assignedTo);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCases = cases.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        cases: paginatedCases,
        pagination: {
          total: cases.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(cases.length / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/claims - Create new claim
router.post('/', auth, async (req, res) => {
  try {
    // TODO: Implement create claim logic
    res.json({ message: "Create claim endpoint" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/claims/:id - Get claim by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const cases = getSampleCases();
    const case_ = cases.find(c => c.id === req.params.id);
    
    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    res.json({
      success: true,
      data: case_
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/claims/:id - Update claim
router.put('/:id', auth, async (req, res) => {
  try {
    // TODO: Implement update claim logic
    res.json({ message: `Update claim ${req.params.id} endpoint` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/claims/:id - Delete claim
router.delete('/:id', auth, async (req, res) => {
  try {
    // TODO: Implement delete claim logic
    res.json({ message: `Delete claim ${req.params.id} endpoint` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 