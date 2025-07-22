const { DataTypes, Sequelize } = require('sequelize');

// Initialize Sequelize instance
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'sqlite:./database.sqlite',
  {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const Case = sequelize.define('Case', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  caseNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  patientName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  mrn: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 150
    }
  },
  sex: {
    type: DataTypes.ENUM('M', 'F', 'Other'),
    allowNull: false
  },
  admitDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dischargeDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  lengthOfStay: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  primaryDiagnosis: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  secondaryDiagnoses: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  currentDrg: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  suggestedDrg: {
    type: DataTypes.STRING,
    allowNull: true
  },
  drgWeight: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  financialImpact: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  room: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attendingPhysician: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  assignedTo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  status: {
    type: DataTypes.ENUM('New', 'In Progress', 'Query Sent', 'Physician Response', 'Completed', 'On Hold'),
    allowNull: false,
    defaultValue: 'New'
  },
  flags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of flag objects with type, text, severity, dateCreated'
  },
  queries: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of query objects with content, sentDate, responseDate, status'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  complianceScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  riskScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  lastReviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastReviewedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  escalated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  escalationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  hospitalId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  providerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional metadata for extensibility'
  }
}, {
  tableName: 'cases',
  timestamps: true,
  paranoid: true, // Soft deletes
  indexes: [
    {
      fields: ['caseNumber']
    },
    {
      fields: ['mrn']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['assignedTo']
    },
    {
      fields: ['admitDate']
    },
    {
      fields: ['unit']
    }
  ]
});

// Virtual field for calculated values
Case.addHook('afterFind', (instances) => {
  if (!instances) return;
  
  const processInstance = (instance) => {
    if (instance.dataValues) {
      // Calculate days since admit
      if (instance.admitDate) {
        const admitDate = new Date(instance.admitDate);
        const today = new Date();
        instance.dataValues.daysSinceAdmit = Math.floor((today - admitDate) / (1000 * 60 * 60 * 24));
      }
      
      // Calculate priority score for sorting
      const priorityScores = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      instance.dataValues.priorityScore = priorityScores[instance.priority] || 2;
      
      // Format financial impact
      if (instance.financialImpact) {
        const impact = parseFloat(instance.financialImpact);
        instance.dataValues.formattedImpact = impact >= 0 ? `+$${impact.toLocaleString()}` : `-$${Math.abs(impact).toLocaleString()}`;
      }
    }
  };
  
  if (Array.isArray(instances)) {
    instances.forEach(processInstance);
  } else {
    processInstance(instances);
  }
});

// Instance methods
Case.prototype.addFlag = function(flagData) {
  const flags = this.flags || [];
  flags.push({
    id: require('crypto').randomUUID(),
    type: flagData.type,
    text: flagData.text,
    severity: flagData.severity,
    dateCreated: new Date(),
    createdBy: flagData.createdBy
  });
  this.flags = flags;
  return this.save();
};

Case.prototype.removeFlag = function(flagId) {
  this.flags = (this.flags || []).filter(flag => flag.id !== flagId);
  return this.save();
};

Case.prototype.addQuery = function(queryData) {
  const queries = this.queries || [];
  queries.push({
    id: require('crypto').randomUUID(),
    content: queryData.content,
    sentTo: queryData.sentTo,
    sentDate: new Date(),
    sentBy: queryData.sentBy,
    status: 'Sent',
    priority: queryData.priority || 'Medium'
  });
  this.queries = queries;
  this.status = 'Query Sent';
  return this.save();
};

Case.prototype.updateQuery = function(queryId, updateData) {
  const queries = this.queries || [];
  const queryIndex = queries.findIndex(q => q.id === queryId);
  if (queryIndex !== -1) {
    queries[queryIndex] = { ...queries[queryIndex], ...updateData };
    this.queries = queries;
    
    // Update case status based on query response
    if (updateData.status === 'Responded') {
      this.status = 'Physician Response';
    }
    
    return this.save();
  }
  return Promise.resolve(this);
};

// Class methods
Case.getActiveByPriority = function(priority) {
  return this.findAll({
    where: {
      priority: priority,
      isActive: true,
      status: {
        [sequelize.Sequelize.Op.notIn]: ['Completed']
      }
    },
    order: [['createdAt', 'DESC']]
  });
};

Case.getByAssignedUser = function(userId) {
  return this.findAll({
    where: {
      assignedTo: userId,
      isActive: true
    },
    order: [['priority', 'DESC'], ['createdAt', 'ASC']]
  });
};

Case.getDashboardMetrics = function() {
  return Promise.all([
    this.count({ where: { status: 'New', isActive: true } }),
    this.count({ where: { status: 'In Progress', isActive: true } }),
    this.count({ where: { status: 'Query Sent', isActive: true } }),
    this.count({ where: { priority: 'High', isActive: true, status: { [sequelize.Sequelize.Op.notIn]: ['Completed'] } } }),
    this.sum('financialImpact', { where: { isActive: true } })
  ]).then(([newCases, inProgress, queriesSent, highPriority, totalImpact]) => ({
    newCases,
    inProgress, 
    queriesSent,
    highPriority,
    totalImpact: totalImpact || 0
  }));
};

module.exports = Case; 