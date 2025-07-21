const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  }
});

const contactInfoSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }
});

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: addressSchema,
    required: true
  },
  npi: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  contactInfo: {
    type: contactInfoSchema,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  providerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  }]
}, {
  timestamps: true
});

// Add indexes
hospitalSchema.index({ npi: 1 });
hospitalSchema.index({ licenseNumber: 1 });
hospitalSchema.index({ 'address.state': 1, 'address.city': 1 });

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = { Hospital }; 