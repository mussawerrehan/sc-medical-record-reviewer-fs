require('dotenv').config();
const Case = require('../models/case.model');

const simpleCases = [
  {
    caseNumber: 'MR-2024-001234',
    patientName: 'Sarah Martinez',
    mrn: '123456789',
    age: 67,
    sex: 'F',
    admitDate: '2024-07-05',
    lengthOfStay: 3,
    primaryDiagnosis: 'Pneumonia with Sepsis',
    secondaryDiagnoses: ['Acute respiratory failure', 'Type 2 diabetes mellitus', 'Hypertension'],
    currentDrg: 'DRG 871',
    suggestedDrg: 'DRG 870',
    drgWeight: 2.1234,
    financialImpact: 2400,
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
        dateCreated: new Date('2024-07-05T10:30:00.000Z'),
        createdBy: 'System'
      }
    ],
    queries: [],
    notes: 'Patient admitted with pneumonia, showing signs of sepsis. Documentation needed for sepsis criteria.',
    complianceScore: 75,
    riskScore: 85,
    dueDate: '2024-07-08',
    escalated: false,
    isActive: true
  },
  {
    caseNumber: 'MR-2024-001235',
    patientName: 'Robert Chen',
    mrn: '123456790',
    age: 72,
    sex: 'M',
    admitDate: '2024-07-04',
    lengthOfStay: 4,
    primaryDiagnosis: 'Acute Kidney Injury',
    secondaryDiagnoses: ['Chronic kidney disease stage 3', 'Congestive heart failure', 'Atrial fibrillation'],
    currentDrg: 'DRG 682',
    suggestedDrg: 'DRG 681',
    drgWeight: 1.8765,
    financialImpact: 1800,
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
        dateCreated: new Date('2024-07-04T11:00:00.000Z'),
        createdBy: 'System'
      }
    ],
    queries: [
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        content: 'Please specify the stage of acute kidney injury based on creatinine levels and urine output.',
        sentTo: 'Dr. Sarah Williams',
        sentDate: new Date('2024-07-05T09:00:00.000Z'),
        sentBy: 'Dr. Johnson',
        status: 'Sent',
        priority: 'High'
      }
    ],
    notes: 'Query sent to attending physician regarding AKI staging.',
    complianceScore: 68,
    riskScore: 75,
    dueDate: '2024-07-07',
    escalated: false,
    isActive: true,
    lastReviewDate: new Date('2024-07-05T09:00:00.000Z'),
    lastReviewedBy: 'Dr. Johnson'
  },
  {
    caseNumber: 'MR-2024-001236',
    patientName: 'Maria Rodriguez',
    mrn: '123456791',
    age: 58,
    sex: 'F',
    admitDate: '2024-07-06',
    lengthOfStay: 2,
    primaryDiagnosis: 'Heart Failure',
    secondaryDiagnoses: ['Coronary artery disease', 'Type 2 diabetes with complications', 'Chronic obstructive pulmonary disease'],
    currentDrg: 'DRG 293',
    suggestedDrg: 'DRG 291',
    drgWeight: 1.5432,
    financialImpact: 1200,
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
        dateCreated: new Date('2024-07-06T13:20:00.000Z'),
        createdBy: 'Dr. Smith'
      }
    ],
    queries: [
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        content: 'Please provide the ejection fraction from the echocardiogram to support the heart failure diagnosis.',
        sentTo: 'Dr. James Park',
        sentDate: new Date('2024-07-06T15:30:00.000Z'),
        sentBy: 'Dr. Smith',
        status: 'Sent',
        priority: 'Medium'
      }
    ],
    notes: 'Patient with acute on chronic heart failure. EF documentation needed for proper DRG assignment.',
    complianceScore: 82,
    riskScore: 45,
    dueDate: '2024-07-09',
    escalated: false,
    isActive: true,
    lastReviewDate: new Date('2024-07-06T15:30:00.000Z'),
    lastReviewedBy: 'Dr. Smith'
  },
  {
    caseNumber: 'MR-2024-001237',
    patientName: 'James Wilson',
    mrn: '123456792',
    age: 81,
    sex: 'M',
    admitDate: '2024-07-03',
    lengthOfStay: 5,
    primaryDiagnosis: 'COPD Exacerbation',
    secondaryDiagnoses: ['Chronic respiratory failure', 'Pulmonary hypertension', 'Sleep apnea'],
    currentDrg: 'DRG 192',
    suggestedDrg: 'DRG 190',
    drgWeight: 1.2345,
    financialImpact: 900,
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
        dateCreated: new Date('2024-07-03T08:45:00.000Z'),
        createdBy: 'System'
      }
    ],
    queries: [],
    notes: 'Elderly patient with COPD exacerbation and chronic respiratory failure.',
    complianceScore: 79,
    riskScore: 55,
    dueDate: '2024-07-10',
    escalated: false,
    isActive: true
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
    secondaryDiagnoses: ['Hypertension', 'Atrial fibrillation', 'Dysphagia'],
    currentDrg: 'DRG 064',
    suggestedDrg: 'DRG 062',
    drgWeight: 1.1234,
    financialImpact: 600,
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
        dateCreated: new Date('2024-07-07T12:00:00.000Z'),
        createdBy: 'Speech Therapy'
      }
    ],
    queries: [],
    notes: 'Patient discharged with good neurological recovery. Dysphagia resolved.',
    complianceScore: 95,
    riskScore: 20,
    dueDate: '2024-07-10',
    escalated: false,
    isActive: true,
    lastReviewDate: new Date('2024-07-08T14:00:00.000Z'),
    lastReviewedBy: 'Dr. Johnson',
    reviewNotes: 'Case completed successfully. All documentation requirements met.'
  }
];

async function seedSimpleCases() {
  try {
    // Sync database
    await Case.sequelize.sync({ force: false });
    console.log('Database synced successfully');

    // Create cases one by one to avoid bulk insert issues
    for (const caseData of simpleCases) {
      try {
        // Check if case already exists
        const existingCase = await Case.findOne({ where: { caseNumber: caseData.caseNumber } });
        if (existingCase) {
          console.log(`Case ${caseData.caseNumber} already exists, skipping...`);
          continue;
        }

        const createdCase = await Case.create(caseData);
        console.log(`Created case: ${createdCase.caseNumber}`);
      } catch (error) {
        console.error(`Error creating case ${caseData.caseNumber}:`, error.message);
      }
    }

    console.log('Case seeding completed successfully');

    // Log some statistics
    const count = await Case.count();
    console.log(`Total cases in database: ${count}`);

  } catch (error) {
    console.error('Error seeding cases:', error);
    throw error;
  } finally {
    // Don't exit process in case this is called from elsewhere
    if (require.main === module) {
      process.exit(0);
    }
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedSimpleCases()
    .then(() => {
      console.log('Simple case seeding completed successfully');
    })
    .catch((error) => {
      console.error('Simple case seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSimpleCases, simpleCases }; 