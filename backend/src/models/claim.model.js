const mongoose = require('mongoose');

const CLAIM_TYPES = {
  PROFESSIONAL: 'professional',
  INSTITUTIONAL: 'institutional',
  DRG: 'drg'
};

const CLAIM_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  REJECTED: 'rejected',
  APPROVED: 'approved'
};

const claimSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: Object.values(CLAIM_TYPES)
  },
  patientId: {
    type: String,
    required: true,
    trim: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(CLAIM_STATUS),
    default: CLAIM_STATUS.DRAFT
  },
  // Common fields
  dateOfService: {
    type: Date,
    required: true
  },
  submissionDate: {
    type: Date
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  // Professional claim specific fields
  professionalClaim: {
    cptCodes: [{
      code: {
        type: String,
        trim: true
      },
      description: String,
      modifier: String,
      quantity: {
        type: Number,
        min: 1
      },
      amount: {
        type: Number,
        min: 0
      }
    }],
    icd10Codes: [{
      code: {
        type: String,
        trim: true
      },
      description: String
    }]
  },
  // Institutional claim specific fields
  institutionalClaim: {
    admissionDate: Date,
    dischargeDate: Date,
    icd10BillingCodes: [{
      code: {
        type: String,
        trim: true
      },
      description: String
    }],
    revenueCode: {
      type: String,
      trim: true
    }
  },
  // DRG claim specific fields
  drgClaim: {
    drgCode: {
      type: String,
      trim: true
    },
    drgDescription: String,
    expectedReimbursement: {
      type: Number,
      min: 0
    },
    lengthOfStay: {
      type: Number,
      min: 1
    }
  },
  // Validation and processing
  validationErrors: [{
    field: String,
    message: String,
    code: String
  }],
  processingHistory: [{
    status: {
      type: String,
      enum: Object.values(CLAIM_STATUS)
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster lookups
claimSchema.index({ patientId: 1 });
claimSchema.index({ providerId: 1 });
claimSchema.index({ hospitalId: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ type: 1 });
claimSchema.index({ dateOfService: 1 });

// Middleware to validate claim type specific fields
claimSchema.pre('save', function(next) {
  switch (this.type) {
    case CLAIM_TYPES.PROFESSIONAL:
      if (!this.professionalClaim || !this.professionalClaim.cptCodes.length) {
        return next(new Error('Professional claims must include CPT codes'));
      }
      break;
    case CLAIM_TYPES.INSTITUTIONAL:
      if (!this.institutionalClaim || !this.institutionalClaim.icd10BillingCodes.length) {
        return next(new Error('Institutional claims must include ICD-10 billing codes'));
      }
      break;
    case CLAIM_TYPES.DRG:
      if (!this.drgClaim || !this.drgClaim.drgCode) {
        return next(new Error('DRG claims must include a DRG code'));
      }
      break;
  }
  next();
});

// Method to add processing history
claimSchema.methods.addProcessingHistory = function(status, notes, userId) {
  this.processingHistory.push({
    status,
    notes,
    userId,
    date: new Date()
  });
};

// Method to add validation error
claimSchema.methods.addValidationError = function(field, message, code) {
  this.validationErrors.push({
    field,
    message,
    code
  });
};

// Method to clear validation errors
claimSchema.methods.clearValidationErrors = function() {
  this.validationErrors = [];
};

const Claim = mongoose.model('Claim', claimSchema);

module.exports = {
  Claim,
  CLAIM_TYPES,
  CLAIM_STATUS
}; 