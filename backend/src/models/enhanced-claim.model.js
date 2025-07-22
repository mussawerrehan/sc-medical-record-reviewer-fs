const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const EnhancedClaim = sequelize.define('EnhancedClaim', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  claimNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  caseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'cases',
      key: 'id'
    }
  },
  memberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'members',
      key: 'id'
    }
  },
  claimType: {
    type: DataTypes.ENUM('Institutional', 'Professional', 'Dental', 'Vision', 'Pharmacy'),
    allowNull: false,
    defaultValue: 'Institutional'
  },
  serviceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  serviceEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  primaryDiagnosis: {
    type: DataTypes.STRING,
    allowNull: false
  },
  secondaryDiagnoses: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  procedureCodes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  drgCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chargedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  allowedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  deductibleAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  coinsuranceAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  copayAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Submitted', 'Pending', 'In Review', 'Approved', 'Denied', 'Paid', 'Rejected'),
    defaultValue: 'Draft'
  },
  denialReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  denialCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateSubmitted: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dateProcessed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  providerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'providers',
      key: 'id'
    }
  },
  facilityId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hospitals',
      key: 'id'
    }
  },
  payerId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  payerName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  authorizationNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referralNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  processedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'enhanced_claims',
  timestamps: true
});

module.exports = EnhancedClaim; 