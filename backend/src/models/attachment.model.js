const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Attachment = sequelize.define('Attachment', {
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
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.ENUM('Medical Record', 'Lab Result', 'Image', 'Document', 'Other'),
    allowNull: false,
    defaultValue: 'Document'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'attachments',
  timestamps: true
});

module.exports = Attachment; 