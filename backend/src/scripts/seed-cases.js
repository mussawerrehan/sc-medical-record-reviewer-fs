require('dotenv').config();
const Case = require('../models/case.model');

const sampleCases = [
  {
    caseNumber: 'MR-2024-001234',
    patientName: 'Sarah Martinez',
    mrn: '123456789',
    age: 67,
    sex: 'F',
    admitDate: '2024-07-05',
    dischargeDate: null,
    lengthOfStay: 3,
    primaryDiagnosis: 'Pneumonia with Sepsis',
    secondaryDiagnoses: [
      'Acute respiratory failure',
      'Type 2 diabetes mellitus',
      'Hypertension'
    ],
    currentDrg: 'DRG 871',
    suggestedDrg: 'DRG 870',
    drgWeight: 2.1234,
    financialImpact: 2400.00,
    unit: 'ICU',
    room: 'ICU-101',
    attendingPhysician: 'Dr. Michael Chen',
    assignedTo: 'Dr. Johnson',
    priority: 'High',
    status: 'New',
    flags: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'clinical',
        text: 'Sepsis criteria not documented',
        severity: 'high',
        dateCreated: new Date('2024-07-05T10:30:00Z'),
        createdBy: 'System'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        type: 'coding',
        text: 'MCC coding opportunity',
        severity: 'high',
        dateCreated: new Date('2024-07-05T14:15:00Z'),
        createdBy: 'Dr. Johnson'
      }
    ],
    queries: [],
    notes: 'Patient admitted with pneumonia, showing signs of sepsis. Documentation needed for sepsis criteria.',
    complianceScore: 75,
    riskScore: 85,
    dueDate: '2024-07-08'
  },
  {
    caseNumber: 'MR-2024-001235',
    patientName: 'Robert Chen',
    mrn: '123456790',
    age: 72,
    sex: 'M',
    admitDate: '2024-07-04',
    dischargeDate: null,
    lengthOfStay: 4,
    primaryDiagnosis: 'Acute Kidney Injury',
    secondaryDiagnoses: [
      'Chronic kidney disease stage 3',
      'Congestive heart failure',
      'Atrial fibrillation'
    ],
    currentDrg: 'DRG 682',
    suggestedDrg: 'DRG 681',
    drgWeight: 1.8765,
    financialImpact: 1800.00,
    unit: 'Medicine',
    room: 'MED-205',
    attendingPhysician: 'Dr. Sarah Williams',
    assignedTo: 'Dr. Johnson',
    priority: 'High',
    status: 'In Progress',
    flags: [
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        type: 'clinical',
        text: 'AKI severity not specified',
        severity: 'high',
        dateCreated: new Date('2024-07-04T11:00:00Z'),
        createdBy: 'System'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        type: 'compliance',
        text: 'POA indicator missing',
        severity: 'medium',
        dateCreated: new Date('2024-07-04T16:30:00Z'),
        createdBy: 'Compliance Team'
      }
    ],
    queries: [
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        content: 'Please specify the stage of acute kidney injury based on creatinine levels and urine output.',
        sentTo: 'Dr. Sarah Williams',
        sentDate: new Date('2024-07-05T09:00:00Z'),
        sentBy: 'Dr. Johnson',
        status: 'Sent',
        priority: 'High'
      }
    ],
    notes: 'Query sent to attending physician regarding AKI staging.',
    complianceScore: 68,
    riskScore: 75,
    dueDate: '2024-07-07',
    lastReviewDate: new Date('2024-07-05T09:00:00Z'),
    lastReviewedBy: 'Dr. Johnson'
  },
  {
    caseNumber: 'MR-2024-001236',
    patientName: 'Maria Rodriguez',
    mrn: '123456791',
    age: 58,
    sex: 'F',
    admitDate: '2024-07-06',
    dischargeDate: null,
    lengthOfStay: 2,
    primaryDiagnosis: 'Heart Failure',
    secondaryDiagnoses: [
      'Coronary artery disease',
      'Type 2 diabetes with complications',
      'Chronic obstructive pulmonary disease'
    ],
    currentDrg: 'DRG 293',
    suggestedDrg: 'DRG 291',
    drgWeight: 1.5432,
    financialImpact: 1200.00,
    unit: 'Cardiology',
    room: 'CARD-312',
    attendingPhysician: 'Dr. James Park',
    assignedTo: 'Dr. Smith',
    priority: 'Medium',
    status: 'Query Sent',
    flags: [
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        type: 'clinical',
        text: 'Ejection fraction not documented',
        severity: 'medium',
        dateCreated: new Date('2024-07-06T13:20:00Z'),
        createdBy: 'Dr. Smith'
      }
    ],
    queries: [
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        content: 'Please provide the ejection fraction from the echocardiogram to support the heart failure diagnosis.',
        sentTo: 'Dr. James Park',
        sentDate: new Date('2024-07-06T15:30:00Z'),
        sentBy: 'Dr. Smith',
        status: 'Sent',
        priority: 'Medium'
      }
    ],
    notes: 'Patient with acute on chronic heart failure. EF documentation needed for proper DRG assignment.',
    complianceScore: 82,
    riskScore: 45,
    dueDate: '2024-07-09',
    lastReviewDate: new Date('2024-07-06T15:30:00Z'),
    lastReviewedBy: 'Dr. Smith'
  },
  {
    caseNumber: 'MR-2024-001237',
    patientName: 'James Wilson',
    mrn: '123456792',
    age: 81,
    sex: 'M',
    admitDate: '2024-07-03',
    dischargeDate: null,
    lengthOfStay: 5,
    primaryDiagnosis: 'COPD Exacerbation',
    secondaryDiagnoses: [
      'Chronic respiratory failure',
      'Pulmonary hypertension',
      'Sleep apnea'
    ],
    currentDrg: 'DRG 192',
    suggestedDrg: 'DRG 190',
    drgWeight: 1.2345,
    financialImpact: 900.00,
    unit: 'Pulmonology',
    room: 'PULM-108',
    attendingPhysician: 'Dr. Lisa Anderson',
    assignedTo: 'Dr. Davis',
    priority: 'Medium',
    status: 'New',
    flags: [
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        type: 'clinical',
        text: 'Respiratory failure not coded',
        severity: 'medium',
        dateCreated: new Date('2024-07-03T08:45:00Z'),
        createdBy: 'System'
      }
    ],
    queries: [],
    notes: 'Elderly patient with COPD exacerbation and chronic respiratory failure.',
    complianceScore: 79,
    riskScore: 55,
    dueDate: '2024-07-10'
  },
  {
    caseNumber: 'MR-2024-001238',
    patientName: 'Linda Thompson',
    mrn: '123456793',
    age: 69,
    sex: 'F',
    admitDate: '2024-07-07',
    dischargeDate: '2024-07-08',
    lengthOfStay: 1,
    primaryDiagnosis: 'Stroke',
    secondaryDiagnoses: [
      'Hypertension',
      'Atrial fibrillation',
      'Dysphagia'
    ],
    currentDrg: 'DRG 064',
    suggestedDrg: 'DRG 062',
    drgWeight: 1.1234,
    financialImpact: 600.00,
    unit: 'Neurology',
    room: 'NEURO-201',
    attendingPhysician: 'Dr. Robert Kim',
    assignedTo: 'Dr. Johnson',
    priority: 'Low',
    status: 'Completed',
    flags: [
      {
        id: '550e8400-e29b-41d4-a716-446655440009',
        type: 'clinical',
        text: 'Dysphagia assessment needed',
        severity: 'low',
        dateCreated: new Date('2024-07-07T12:00:00Z'),
        createdBy: 'Speech Therapy'
      }
    ],
    queries: [],
    notes: 'Patient discharged with good neurological recovery. Dysphagia resolved.',
    reviewNotes: 'Case completed successfully. All documentation requirements met.',
    complianceScore: 95,
    riskScore: 20,
    dueDate: '2024-07-10',
    lastReviewDate: new Date('2024-07-08T14:00:00Z'),
    lastReviewedBy: 'Dr. Johnson'
  },
  {
    caseNumber: 'MR-2024-001239',
    patientName: 'Michael Brown',
    mrn: '123456794',
    age: 55,
    sex: 'M',
    admitDate: '2024-07-02',
    dischargeDate: null,
    lengthOfStay: 6,
    primaryDiagnosis: 'Diabetic Ketoacidosis',
    secondaryDiagnoses: [
      'Type 1 diabetes mellitus',
      'Acute kidney injury',
      'Dehydration',
      'Metabolic acidosis'
    ],
    currentDrg: 'DRG 638',
    suggestedDrg: 'DRG 637',
    drgWeight: 1.9876,
    financialImpact: 2100.00,
    unit: 'Endocrinology',
    room: 'ENDO-105',
    attendingPhysician: 'Dr. Maria Gonzalez',
    assignedTo: 'Dr. Smith',
    priority: 'High',
    status: 'In Progress',
    flags: [
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        type: 'clinical',
        text: 'Diabetes complications not specified',
        severity: 'high',
        dateCreated: new Date('2024-07-02T16:20:00Z'),
        createdBy: 'Dr. Smith'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        type: 'compliance',
        text: 'Principal diagnosis unclear',
        severity: 'medium',
        dateCreated: new Date('2024-07-03T10:15:00Z'),
        createdBy: 'Compliance Team'
      }
    ],
    queries: [
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        content: 'Please clarify if this is Type 1 or Type 2 diabetes and specify any complications.',
        sentTo: 'Dr. Maria Gonzalez',
        sentDate: new Date('2024-07-03T11:00:00Z'),
        sentBy: 'Dr. Smith',
        status: 'Sent',
        priority: 'High'
      }
    ],
    notes: 'Complex case with DKA and multiple complications. Documentation review needed.',
    complianceScore: 65,
    riskScore: 80,
    dueDate: '2024-07-05',
    lastReviewDate: new Date('2024-07-03T11:00:00Z'),
    lastReviewedBy: 'Dr. Smith'
  },
  {
    caseNumber: 'MR-2024-001240',
    patientName: 'Patricia Davis',
    mrn: '123456795',
    age: 74,
    sex: 'F',
    admitDate: '2024-07-01',
    dischargeDate: '2024-07-06',
    lengthOfStay: 5,
    primaryDiagnosis: 'Hip Fracture',
    secondaryDiagnoses: [
      'Osteoporosis',
      'Dementia',
      'Hypertension',
      'Urinary tract infection'
    ],
    currentDrg: 'DRG 481',
    suggestedDrg: 'DRG 480',
    drgWeight: 1.6789,
    financialImpact: 1500.00,
    unit: 'Orthopedics',
    room: 'ORTHO-220',
    attendingPhysician: 'Dr. Kevin Lee',
    assignedTo: 'Dr. Davis',
    priority: 'Medium',
    status: 'Completed',
    flags: [
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        type: 'clinical',
        text: 'Surgical complications not documented',
        severity: 'low',
        dateCreated: new Date('2024-07-02T09:30:00Z'),
        createdBy: 'Surgery Team'
      }
    ],
    queries: [],
    notes: 'Successful hip repair surgery. Patient discharged to rehabilitation facility.',
    reviewNotes: 'Case resolved. Patient had good surgical outcome.',
    complianceScore: 88,
    riskScore: 35,
    dueDate: '2024-07-04',
    lastReviewDate: new Date('2024-07-06T16:00:00Z'),
    lastReviewedBy: 'Dr. Davis'
  },
  {
    caseNumber: 'MR-2024-001241',
    patientName: 'Thomas Garcia',
    mrn: '123456796',
    age: 63,
    sex: 'M',
    admitDate: '2024-07-08',
    dischargeDate: null,
    lengthOfStay: 1,
    primaryDiagnosis: 'Myocardial Infarction',
    secondaryDiagnoses: [
      'Coronary artery disease',
      'Hyperlipidemia',
      'Smoking history'
    ],
    currentDrg: 'DRG 280',
    suggestedDrg: 'DRG 281',
    drgWeight: 2.3456,
    financialImpact: 3200.00,
    unit: 'Cardiology',
    room: 'CCU-102',
    attendingPhysician: 'Dr. Jennifer Wu',
    assignedTo: 'Dr. Johnson',
    priority: 'Critical',
    status: 'New',
    flags: [
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        type: 'clinical',
        text: 'STEMI vs NSTEMI not specified',
        severity: 'high',
        dateCreated: new Date('2024-07-08T07:15:00Z'),
        createdBy: 'Emergency Department'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        type: 'coding',
        text: 'Intervention coding needed',
        severity: 'high',
        dateCreated: new Date('2024-07-08T10:45:00Z'),
        createdBy: 'Cardiology'
      }
    ],
    queries: [],
    notes: 'Acute MI patient admitted to CCU. Urgent documentation review required.',
    complianceScore: 60,
    riskScore: 95,
    dueDate: '2024-07-09',
    escalated: true,
    escalationReason: 'High financial impact case requiring immediate attention'
  }
];

async function seedCases() {
  try {
    // Sync database
    await Case.sequelize.sync({ force: false });
    console.log('Database synced successfully');

    // Clear existing cases (optional - remove in production)
    // await Case.destroy({ where: {}, force: true });
    // console.log('Existing cases cleared');

    // Create cases
    const createdCases = await Case.bulkCreate(sampleCases, {
      validate: true,
      returning: true
    });

    console.log(`Successfully seeded ${createdCases.length} cases`);
    
    // Log some statistics
    const stats = await Case.getDashboardMetrics();
    console.log('Dashboard metrics after seeding:', stats);

  } catch (error) {
    console.error('Error seeding cases:', error);
    throw error;
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedCases()
    .then(() => {
      console.log('Case seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Case seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedCases, sampleCases }; 