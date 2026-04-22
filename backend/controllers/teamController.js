const Team = require('../models/Team');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');

// @route   GET /api/manager/teams
exports.listTeams = async (req, res) => {
    try {
        const teams = await Team.find({ managerId: req.manager.id })
            .populate('teamHeadUserId', 'name email isActive')
            .sort({ name: 1 })
            .lean();

        const payload = teams.map((t) => ({
            ...t,
            memberCount: (t.memberEmployeeIds && t.memberEmployeeIds.length) || 0,
        }));

        res.json(payload);
    } catch (err) {
        console.error('listTeams:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST /api/manager/teams
exports.createTeam = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        const trimmed = String(name).trim();
        const exists = await Team.findOne({ managerId: req.manager.id, name: trimmed });
        if (exists) {
            return res.status(400).json({ message: 'A team with this name already exists' });
        }

        const team = await Team.create({
            name: trimmed,
            managerId: req.manager.id,
            memberEmployeeIds: [],
        });

        res.status(201).json(team);
    } catch (err) {
        console.error('createTeam:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   PATCH /api/manager/teams/:teamId
exports.updateTeam = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        const team = await Team.findOne({ _id: req.params.teamId, managerId: req.manager.id });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const trimmed = String(name).trim();
        const clash = await Team.findOne({
            managerId: req.manager.id,
            name: trimmed,
            _id: { $ne: team._id },
        });
        if (clash) {
            return res.status(400).json({ message: 'Another team already uses this name' });
        }

        team.name = trimmed;
        await team.save();
        res.json(team);
    } catch (err) {
        console.error('updateTeam:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   DELETE /api/manager/teams/:teamId
exports.deleteTeam = async (req, res) => {
    try {
        const team = await Team.findOne({ _id: req.params.teamId, managerId: req.manager.id });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (team.teamHeadUserId) {
            await User.findByIdAndUpdate(team.teamHeadUserId, {
                isActive: false,
                teamId: null,
            });
        }

        await Team.deleteOne({ _id: team._id });
        res.json({ message: 'Team deleted' });
    } catch (err) {
        console.error('deleteTeam:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST /api/manager/teams/:teamId/head — manager creates Team Head login
exports.setTeamHead = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const team = await Team.findOne({ _id: req.params.teamId, managerId: req.manager.id });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (!name || !String(name).trim() || !email || !String(email).trim()) {
            return res.status(400).json({ message: 'Name and email are required' });
        }
        if (!password || String(password).length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const emailNorm = String(email).trim().toLowerCase();
        const existing = await User.findOne({ email: emailNorm });
        if (existing) {
            return res.status(400).json({ message: 'This email is already registered' });
        }

        if (team.teamHeadUserId) {
            await User.findByIdAndUpdate(team.teamHeadUserId, {
                isActive: false,
                teamId: null,
            });
        }

        const head = await User.create({
            name: String(name).trim(),
            email: emailNorm,
            password,
            role: 'TeamHead',
            teamId: team._id,
        });

        team.teamHeadUserId = head._id;
        await team.save();

        res.status(201).json({
            message: 'Team head account created. Share login credentials with the team head.',
            teamHead: {
                id: head._id,
                name: head.name,
                email: head.email,
            },
        });
    } catch (err) {
        console.error('setTeamHead:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST /api/manager/teams/:teamId/members
exports.addMember = async (req, res) => {
    try {
        const { employee_id } = req.body;
        if (!employee_id) {
            return res.status(400).json({ message: 'employee_id is required' });
        }

        const team = await Team.findOne({ _id: req.params.teamId, managerId: req.manager.id });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const emp = await Employee.findOne({ employee_id: String(employee_id).trim() });
        if (!emp) {
            return res.status(404).json({ message: 'Intern not found' });
        }

        const manager = await Manager.findById(req.manager.id);
        const depts = manager?.departments || [];
        if (!depts.includes('All')) {
            const dom = emp.domain || emp.departmentName;
            if (!dom || !depts.includes(dom)) {
                return res.status(403).json({ message: 'This intern is outside your department scope' });
            }
        }

        const idStr = emp.employee_id;
        if (team.memberEmployeeIds.includes(idStr)) {
            return res.status(400).json({ message: 'Intern is already in this team' });
        }

        team.memberEmployeeIds.push(idStr);
        await team.save();

        const populated = await Team.findById(team._id)
            .populate('teamHeadUserId', 'name email')
            .lean();

        res.json({ message: 'Intern added to team', team: populated });
    } catch (err) {
        console.error('addMember:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   DELETE /api/manager/teams/:teamId/members/:employeeId
exports.removeMember = async (req, res) => {
    try {
        const { teamId, employeeId } = req.params;
        const team = await Team.findOne({ _id: teamId, managerId: req.manager.id });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        team.memberEmployeeIds = (team.memberEmployeeIds || []).filter((id) => id !== employeeId);
        await team.save();

        res.json({ message: 'Intern removed from team', team });
    } catch (err) {
        console.error('removeMember:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/manager/intern-pool — interns manager can assign (by department scope)
exports.listPoolInterns = async (req, res) => {
    try {
        const manager = await Manager.findById(req.manager.id);
        const depts = manager?.departments || [];
        let query = {};
        if (!depts.includes('All')) {
            query = { domain: { $in: depts } };
        }

        const employees = await Employee.find(query)
            .sort({ name: 1 })
            .select('name employee_id email domain departmentName appliedDate')
            .lean();

        res.json(employees);
    } catch (err) {
        console.error('listPoolInterns:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
