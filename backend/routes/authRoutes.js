const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/auth/reset-password/:token
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
