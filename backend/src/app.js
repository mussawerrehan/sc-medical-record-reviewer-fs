require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const mongoose = require('mongoose');
const { sequelize } = require('./models/index');

// Initialize Express app
const app = express();

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Connect to MongoDB for User/Hospital models
const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/claims-analysis';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connection established successfully');
    
    // Create demo user if it doesn't exist
    try {
      const { User } = require('./models/user.model');
      const demoUser = await User.findOne({ 
        $or: [
          { username: 'demo' },
          { email: 'demo@smartcycle.ai' }
        ]
      });
      if (!demoUser) {
        await User.create({
          username: 'demo',
          email: 'demo@smartcycle.ai',
          password: 'SmartCyclePass',
          name: 'Demo User',
          role: 'user',
          isActive: true
        });
        logger.info('Demo user created successfully');
      } else {
        logger.info('Demo user already exists');
      }
    } catch (userError) {
      // Don't fail the app if demo user creation fails
      if (userError.code === 11000) {
        logger.info('Demo user already exists (duplicate key)');
      } else {
        logger.warn('Demo user creation failed:', userError.message);
      }
    }
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error; // Still throw connection errors
  }
};

// Connect to SQLite for Case models
const connectSQLite = async () => {
  try {
    await sequelize.authenticate();
    logger.info('SQLite connection established successfully');
    await sequelize.sync({ alter: false });
    logger.info('SQLite database synchronized');
  } catch (error) {
    logger.error('SQLite connection error:', error);
    process.exit(1);
  }
};

// Initialize both databases
const initializeDatabases = async () => {
  try {
    await connectSQLite();
  } catch (error) {
    logger.error('SQLite initialization failed:', error);
    process.exit(1);
  }

  try {
    await connectMongoDB();
  } catch (error) {
    logger.error('MongoDB initialization failed:', error);
    process.exit(1);
  }

  logger.info('All database connections established');
};

// Start database initialization
initializeDatabases();

// Middleware
app.use(helmet());

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cases', require('./routes/cases.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/hospitals', require('./routes/hospitals.routes'));
app.use('/api/providers', require('./routes/providers.routes'));
app.use('/api/claims', require('./routes/claims.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/members', require('./routes/members.routes'));
app.use('/api/enhanced-cases', require('./routes/enhanced-cases.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    sqlite: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
  process.exit(0);
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
}); 