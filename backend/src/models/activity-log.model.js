const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  caseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'cases',
      key: 'id'
    }
  },
  activityType: {
    type: DataTypes.ENUM(
      'Case Created', 'Case Updated', 'Status Changed', 'Assignment Changed',
      'Note Added', 'Attachment Added', 'Query Sent', 'Query Responded',
      'Review Completed', 'Workflow Changed', 'Claim Added', 'Member Updated',
      'System Event', 'User Action'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  oldValue: {
    type: DataTypes.JSON,
    allowNull: true
  },
  newValue: {
    type: DataTypes.JSON,
    allowNull: true
  },
  performedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  performedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'activity_logs',
  timestamps: true
});

module.exports = ActivityLog; 