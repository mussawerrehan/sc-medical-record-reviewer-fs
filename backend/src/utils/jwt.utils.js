const jwt = require('jsonwebtoken');

const generateToken = (user, type = 'access') => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };

  const options = {
    expiresIn: type === 'refresh' 
      ? process.env.JWT_REFRESH_EXPIRATION || '7d'
      : process.env.JWT_EXPIRATION || '24h'
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    options
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const generateAuthTokens = (user) => {
  return {
    accessToken: generateToken(user, 'access'),
    refreshToken: generateToken(user, 'refresh')
  };
};

module.exports = {
  generateToken,
  verifyToken,
  generateAuthTokens
}; 