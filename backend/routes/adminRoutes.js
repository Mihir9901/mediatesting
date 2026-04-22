const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const khiAccountController = require('../controllers/khiAccountController');
const { getAuditLogs } = require('../middleware/auditMiddleware');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Public Routes
router.post('/login', adminController.loginAdmin);
router.post('/register', adminController.registerAdmin);

// Protected Routes (Admin only)
router.post('/create-department', [auth, role(['Admin'])], adminController.createDepartment);
router.get('/all-departments', [auth, role(['Admin'])], adminController.getAllDepartments);

// Manager Management Routes
router.get('/managers', [auth, role(['Admin'])], adminController.getAllManagers);
router.get('/manager-departments', [auth, role(['Admin'])], adminController.getManagerDepartments);
router.get('/all-domains', [auth, role(['Admin'])], adminController.getAllDomains);
router.post('/create-manager', [auth, role(['Admin'])], adminController.createManager);
router.put('/managers/:id', [auth, role(['Admin'])], adminController.updateManager);
router.delete('/managers/:id', [auth, role(['Admin'])], adminController.deleteManager);
router.patch('/managers/:id/toggle', [auth, role(['Admin'])], adminController.toggleManagerStatus);

// User Management
router.post('/create-user', [auth, role(['Admin'])], adminController.createUser);
router.get('/all-users', [auth, role(['Admin'])], adminController.getAllUsers);
router.get('/all-shareable-users', [auth, role(['Admin'])], adminController.getAllShareableUsers);

// Team head management (Admin)
router.get('/team-heads', [auth, role(['Admin'])], adminController.getAllTeamHeads);
router.patch('/team-heads/:id/toggle', [auth, role(['Admin'])], adminController.toggleTeamHeadStatus);

// Security: login logs (Admin)
router.get('/login-logs', [auth, role(['Admin'])], adminController.getLoginLogs);

// Attendance day override (Admin)
router.get('/attendance-day', [auth, role(['Admin'])], adminController.getAttendanceDay);
router.put('/attendance-day', [auth, role(['Admin'])], adminController.upsertAttendanceDay);

// Employee Management
router.post(
  '/upload-employees',
  [auth, role(['Admin']), upload.single('file')],
  adminController.uploadEmployees
);
router.get('/download-template', [auth, role(['Admin'])], adminController.downloadTemplate);
router.post('/create-employee', [auth, role(['Admin'])], adminController.createEmployee);
router.get('/employees', [auth, role(['Admin'])], adminController.getEmployees);
router.put('/employees/:id', [auth, role(['Admin'])], adminController.updateEmployee);
router.delete('/employees/:id', [auth, role(['Admin'])], adminController.deleteEmployee);

// Attendance Report Routes
router.get('/attendance-report', [auth, role(['Admin'])], adminController.exportAttendanceReport);
router.get(
  '/attendance-report/department',
  [auth, role(['Admin'])],
  adminController.exportDepartmentReport
);
router.get(
  '/attendance-report/data',
  [auth, role(['Admin'])],
  adminController.getAttendanceReportData
);

router.get('/export-report', [auth, role(['Admin'])], adminController.exportReport);

// KHIAccount Management
router.post('/khi-accounts', [auth, role(['Admin'])], khiAccountController.createKHIAccount);
router.get('/khi-accounts', [auth, role(['Admin'])], khiAccountController.getAllKHIAccounts);
router.put('/khi-accounts/:id', [auth, role(['Admin'])], khiAccountController.updateKHIAccount);
router.patch('/khi-accounts/:id/toggle', [auth, role(['Admin'])], khiAccountController.toggleKHIAccountStatus);
router.delete('/khi-accounts/:id', [auth, role(['Admin'])], khiAccountController.deleteKHIAccount);

// Audit Logs (Admin only)
router.get('/audit-logs', [auth, role(['Admin'])], getAuditLogs);

module.exports = router;

