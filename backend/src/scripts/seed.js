const mongoose = require('mongoose');
const { User } = require('../models/user.model');
const { Hospital } = require('../models/hospital.model');
const logger = require('../utils/logger');

require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/claims_db');
    logger.info('Connected to MongoDB');

    // Clear existing data
    await Hospital.deleteMany({});
    await User.deleteMany({});
    logger.info('Cleared existing data');

    // Create test hospital
    const testHospital = await Hospital.create({
      name: 'Test Hospital',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      npi: '1234567890',
      licenseNumber: 'TEST123',
      contactInfo: {
        phone: '123-456-7890',
        email: 'test@hospital.com'
      },
      isActive: true
    });
    logger.info('Test hospital created successfully');

    // Create demo hospital
    const demoHospital = await Hospital.create({
      name: 'Demo Hospital',
      address: {
        street: '456 Demo Ave',
        city: 'Demo City',
        state: 'DM',
        zipCode: '67890'
      },
      npi: '0987654321',
      licenseNumber: 'DEMO456',
      contactInfo: {
        phone: '098-765-4321',
        email: 'demo@hospital.com'
      },
      isActive: true
    });
    logger.info('Demo hospital created successfully');

    // Create test user
    const testUser = await User.create({
      email: 'test@example.com',
      username: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'provider',
      isActive: true,
      hospitalIds: [testHospital._id]
    });
    logger.info('Test user created successfully');

    // Update test hospital with provider
    testHospital.providerIds = [testUser._id];
    await testHospital.save();

    // Create demo user
    const demoUser = await User.create({
      email: 'demo@smartcycle.ai',
      username: 'demo@smartcycle.ai',
      password: 'SmartCyclePass',
      name: 'Demo User',
      role: 'provider',
      isActive: true,
      hospitalIds: [demoHospital._id]
    });
    logger.info('Demo user created successfully');

    // Update demo hospital with provider
    demoHospital.providerIds = [demoUser._id];
    await demoHospital.save();

    logger.info('Database seeding completed');
  } catch (error) {
    logger.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};

// Run the seed function
seedDatabase(); 