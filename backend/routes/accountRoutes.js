const express = require('express');
const router = express.Router();
const khiAccountController = require('../controllers/khiAccountController');
const auth = require('../middleware/authMiddleware');

// Get accounts visible to the logged-in user
router.get('/my-accounts', auth, khiAccountController.getMyKHIAccounts);

module.exports = router;
