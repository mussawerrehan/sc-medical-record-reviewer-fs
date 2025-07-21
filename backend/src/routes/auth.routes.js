const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');
const authController = require('../controllers/auth.controller');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/refresh-token
router.post('/refresh-token', authController.refreshToken);

// GET /api/auth/profile
router.get('/profile', authController.getProfile);

// PUT /api/auth/profile
router.put('/profile', authController.updateProfile);

module.exports = router; 