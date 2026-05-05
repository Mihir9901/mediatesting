const express = require('express');
const router = express.Router();

const teamController = require('../controllers/teamController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Shared access: Admin + Manager
const sharedTeamRoles = ['Admin', 'Manager'];

// Shared team routes
router.get('/', [auth, role(sharedTeamRoles)], teamController.listTeams);
router.post('/', [auth, role(sharedTeamRoles)], teamController.createTeam);
router.delete('/:teamId', [auth, role(sharedTeamRoles)], teamController.deleteTeam);

router.post('/:teamId/head', [auth, role(sharedTeamRoles)], teamController.setTeamHead);

router.get('/intern-pool/all', [auth, role(sharedTeamRoles)], teamController.listPoolInterns);

router.post('/:teamId/members', [auth, role(sharedTeamRoles)], teamController.addMember);
router.delete('/:teamId/members/:employeeId', [auth, role(sharedTeamRoles)], teamController.removeMember);

module.exports = router;