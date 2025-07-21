const express = require('express');
const router = express.Router();
const casesController = require('../controllers/cases.controller');
// const { authenticateToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes (disabled for testing)
// router.use(authenticateToken);

// Cases CRUD operations
router.get('/', casesController.getAllCases);
router.get('/statistics', casesController.getCaseStatistics);
router.get('/dashboard-metrics', casesController.getDashboardMetrics);
router.get('/priority/:priority', casesController.getCasesByPriority);
router.get('/assigned/:userId', casesController.getAssignedCases);
router.get('/:id', casesController.getCaseById);
router.post('/', casesController.createCase);
router.put('/:id', casesController.updateCase);
router.delete('/:id', casesController.deleteCase);

// Bulk operations
router.put('/bulk/update', casesController.bulkUpdateCases);

// Flag management
router.post('/:id/flags', casesController.addFlag);
router.delete('/:id/flags/:flagId', casesController.removeFlag);

// Query management
router.post('/:id/queries', casesController.addQuery);
router.put('/:id/queries/:queryId', casesController.updateQuery);

module.exports = router; 