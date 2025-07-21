const { verifyToken } = require('../utils/jwt.utils');
const { User, ROLES } = require('../models');

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if user has required role
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }

    next();
  };
};

// Check if user is Super Admin
const isSuperAdmin = (req, res, next) => {
  return hasRole(ROLES.SUPER_ADMIN)(req, res, next);
};

// Check if user is Hospital Admin
const isHospitalAdmin = (req, res, next) => {
  return hasRole(ROLES.HOSPITAL_ADMIN)(req, res, next);
};

// Check if user is Provider
const isProvider = (req, res, next) => {
  return hasRole(ROLES.PROVIDER)(req, res, next);
};

// Check if user has access to hospital
const hasHospitalAccess = async (req, res, next) => {
  try {
    const hospitalId = req.params.hospitalId || req.body.hospitalId;
    
    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID is required' });
    }

    // Super admin has access to all hospitals
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    // Check if user is associated with the hospital
    if (!req.user.isAssociatedWithHospital(hospitalId)) {
      return res.status(403).json({ 
        message: 'You do not have access to this hospital' 
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check if user has access to claim
const hasClaimAccess = async (req, res, next) => {
  try {
    const { Claim } = require('../models');
    const claimId = req.params.claimId;
    
    if (!claimId) {
      return res.status(400).json({ message: 'Claim ID is required' });
    }

    const claim = await Claim.findById(claimId);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Super admin has access to all claims
    if (req.user.role === ROLES.SUPER_ADMIN) {
      req.claim = claim;
      return next();
    }

    // Hospital admin can access claims from their hospital
    if (req.user.role === ROLES.HOSPITAL_ADMIN &&
        req.user.isAssociatedWithHospital(claim.hospitalId)) {
      req.claim = claim;
      return next();
    }

    // Provider can only access their own claims
    if (req.user.role === ROLES.PROVIDER) {
      const { Provider } = require('../models');
      const provider = await Provider.findOne({ userId: req.user._id });
      
      if (!provider || !provider._id.equals(claim.providerId)) {
        return res.status(403).json({ 
          message: 'You do not have access to this claim' 
        });
      }
      
      req.claim = claim;
      return next();
    }

    return res.status(403).json({ 
      message: 'You do not have access to this claim' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateToken,
  hasRole,
  isSuperAdmin,
  isHospitalAdmin,
  isProvider,
  hasHospitalAccess,
  hasClaimAccess
}; 