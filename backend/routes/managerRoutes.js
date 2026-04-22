const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const teamController = require('../controllers/teamController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const managerOnly = (req, res, next) => {
    if (!req.manager) {
        return res.status(403).json({ message: 'Only the manager account can manage teams' });
    }
    next();
};

// Public Routes
router.post('/login', managerController.loginManager);

// Protected routes: Manager collection JWT, or User/Manager from User collection (hub)
router.get('/me', [auth, role(['Manager', 'User'])], managerController.getMe);
router.get('/employees', [auth, role(['Manager', 'User'])], managerController.getDepartmentEmployees);
router.post('/debug-password', managerController.debugPassword);

// Teams & team head (Manager collection account only)
router.get('/teams', [auth, managerOnly], teamController.listTeams);
router.post('/teams', [auth, managerOnly], teamController.createTeam);
router.patch('/teams/:teamId', [auth, managerOnly], teamController.updateTeam);
router.delete('/teams/:teamId', [auth, managerOnly], teamController.deleteTeam);
router.post('/teams/:teamId/head', [auth, managerOnly], teamController.setTeamHead);
router.post('/teams/:teamId/members', [auth, managerOnly], teamController.addMember);
router.delete('/teams/:teamId/members/:employeeId', [auth, managerOnly], teamController.removeMember);
router.get('/intern-pool', [auth, managerOnly], teamController.listPoolInterns);

// KHI Accounts (Manager-scoped)
const khiAccountController = require('../controllers/khiAccountController');
router.get('/khi-accounts/my-team-heads', [auth, managerOnly], khiAccountController.getManagerTeamHeads);
router.get('/khi-accounts', [auth, managerOnly], khiAccountController.managerGetKHIAccounts);
router.post('/khi-accounts', [auth, managerOnly], khiAccountController.managerCreateKHIAccount);
router.put('/khi-accounts/:id', [auth, managerOnly], khiAccountController.managerUpdateKHIAccount);
router.patch('/khi-accounts/:id/toggle', [auth, managerOnly], khiAccountController.managerToggleKHIAccountStatus);
router.delete('/khi-accounts/:id', [auth, managerOnly], khiAccountController.managerDeleteKHIAccount);

module.exports = router;