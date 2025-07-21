const { Sequelize } = require('sequelize');

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'sqlite:./database.sqlite',
  {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const { User, ROLES } = require('./user.model');
const Hospital = require('./hospital.model');
const { Provider, SPECIALTIES } = require('./provider.model');
const { Claim, CLAIM_TYPES, CLAIM_STATUS } = require('./claim.model');
const Case = require('./case.model');

module.exports = {
  sequelize,
  Sequelize,
  User,
  ROLES,
  Hospital,
  Provider,
  SPECIALTIES,
  Claim,
  CLAIM_TYPES,
  CLAIM_STATUS,
  Case
}; 