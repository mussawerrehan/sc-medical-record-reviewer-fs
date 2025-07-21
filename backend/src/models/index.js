const { User, ROLES } = require('./user.model');
const Hospital = require('./hospital.model');
const { Provider, SPECIALTIES } = require('./provider.model');
const { Claim, CLAIM_TYPES, CLAIM_STATUS } = require('./claim.model');

module.exports = {
  User,
  ROLES,
  Hospital,
  Provider,
  SPECIALTIES,
  Claim,
  CLAIM_TYPES,
  CLAIM_STATUS
}; 