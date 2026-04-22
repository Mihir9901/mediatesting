const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Public: intern self-service attendance lookup (email + intern ID)
router.post('/intern-lookup', attendanceController.lookupInternAttendance);

const managerHubRoles = ['Manager', 'Admin', 'User', 'TeamHead'];

// Protected Routes (Manager, Admin, Dept lead User)
router.post('/mark', [auth, role(managerHubRoles)], attendanceController.markAttendance);
router.post('/lock', [auth, role(managerHubRoles)], attendanceController.lockAttendance);
router.get('/dashboard', [auth, role(managerHubRoles)], attendanceController.getDashboard);
router.get('/department-employees', [auth, role(managerHubRoles)], attendanceController.getDepartmentEmployees);
router.get('/attendance-data', [auth, role(managerHubRoles)], attendanceController.getAttendanceData);
router.get('/records', [auth, role(managerHubRoles)], attendanceController.getAttendanceRecords);
router.get('/analytics', [auth, role(managerHubRoles)], attendanceController.getAttendanceAnalytics);
router.get('/recent-activity', [auth, role(managerHubRoles)], attendanceController.getRecentActivity);

// Monthly report endpoint
router.get('/monthly-report', [auth, role(managerHubRoles)], attendanceController.getMonthlyReport);

// Send attendance emails
router.post('/send-emails', [auth, role(managerHubRoles)], attendanceController.sendAttendanceEmails);

// Admin only routes
router.put('/:id', [auth, role(['Admin'])], attendanceController.updateAttendance);
router.delete('/:id', [auth, role(['Admin'])], attendanceController.deleteAttendance);

module.exports = router;