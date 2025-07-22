const mongoose = require('mongoose');

const SPECIALTIES = [
  'Internal Medicine',
  'Family Practice',
  'Pediatrics',
  'Cardiology',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'Oncology',
  'Emergency Medicine',
  'Surgery',
  'Other'
];

const providerSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: true,
      trim: true
    },
    last: {
      type: String,
      required: true,
      trim: true
    },
    middle: {
      type: String,
      trim: true
    }
  },
  npi: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  specialty: {
    type: String,
    required: true,
    enum: SPECIALTIES
  },
  hospitalIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    trim: true
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
});

// Indexes for faster lookups (npi already has unique index)
providerSchema.index({ userId: 1 });
providerSchema.index({ specialty: 1 });

// Virtual for full name
providerSchema.virtual('fullName').get(function() {
  return `${this.name.first} ${this.name.middle ? this.name.middle + ' ' : ''}${this.name.last}`;
});

// Method to check if associated with hospital
providerSchema.methods.isAssociatedWithHospital = function(hospitalId) {
  return this.hospitalIds.some(id => id.equals(hospitalId));
};

// Method to add hospital association
providerSchema.methods.addHospital = function(hospitalId) {
  if (!this.isAssociatedWithHospital(hospitalId)) {
    this.hospitalIds.push(hospitalId);
  }
};

// Method to remove hospital association
providerSchema.methods.removeHospital = function(hospitalId) {
  this.hospitalIds = this.hospitalIds.filter(id => !id.equals(hospitalId));
};

const Provider = mongoose.model('Provider', providerSchema);

module.exports = {
  Provider,
  SPECIALTIES
}; 