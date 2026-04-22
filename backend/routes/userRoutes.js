const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Public routes
router.post('/login', userController.loginUser);

// Current profile (hub users & team heads)
router.get('/me', auth, userController.getProfile);

// Protected routes (Admin only)
router.post('/register', [auth, role(['Admin'])], userController.registerUser);
router.get('/', [auth, role(['Admin'])], userController.getUserById);
router.get('/department/:deptId', [auth, role(['Admin'])], userController.getUsersByDepartment);
router.get('/:id', [auth, role(['Admin'])], userController.getUserById);
router.put('/:id', [auth, role(['Admin'])], userController.updateUser);
router.delete('/:id', [auth, role(['Admin'])], userController.deleteUser);

module.exports = router;
