const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department');
const Team = require('../models/Team');
const { logSuccessfulLogin, requireLatLong } = require('../utils/loginLogger');

// @route   POST api/user/register
// @desc    Register a new User (Dept Lead)
// @access  Private (Admin only)
exports.registerUser = async (req, res) => {
    const { name, email, password, departmentId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !departmentId) {
        return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: 'Please enter a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Verify department exists
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ msg: 'Department not found' });
        }

        // Check if department already has a User (Dept Lead)
        const existingUser = await User.findOne({ departmentId, role: 'User' });
        if (existingUser) {
            return res.status(400).json({ msg: 'Department already has a User (Dept Lead)' });
        }

        user = new User({
            name,
            email,
            password,
            role: 'User',
            departmentId
        });

        await user.save();

        const payload = { user: { id: user.id, role: 'User', department: department.departmentName, departmentId: user.departmentId } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                token, 
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    role: 'User',
                    department: department.departmentName
                } 
            });
        });
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server error');
    }
};

// @route   POST api/user/login
// @desc    Login User (Dept Lead)
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter email and password' });
    }

    try {
        const loc = requireLatLong(req);
        if (!loc.ok) {
            return res.status(400).json({ msg: loc.message });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user || !['User', 'Manager', 'TeamHead'].includes(user.role)) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ msg: 'Account is deactivated. Contact admin.' });
        }

        user.lastLogin = new Date();
        await user.save();

        if (user.role === 'Manager' || user.role === 'TeamHead') {
            await logSuccessfulLogin({
                req,
                role: user.role === 'TeamHead' ? 'TeamHead' : 'Manager',
                username: user.name,
                email: user.email,
            });
        }

        const department = await Department.findById(user.departmentId);

        let teamName = '';
        let teamIdStr = '';
        if (user.role === 'TeamHead' && user.teamId) {
            const team = await Team.findById(user.teamId).select('name');
            teamName = team?.name || '';
            teamIdStr = user.teamId.toString();
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                department: department?.departmentName || '',
                departmentId: user.departmentId,
                teamId: teamIdStr,
                teamName,
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: department?.departmentName || '',
                    teamId: teamIdStr || undefined,
                    teamName: teamName || undefined,
                    managerAccount: false,
                },
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/user/me
// @access  Private (User / Manager / TeamHead from User collection)
exports.getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const u = await User.findById(req.user.id).select('-password');
        if (!u) {
            return res.status(404).json({ msg: 'User not found' });
        }

        let teamName;
        let memberCount;
        if (u.role === 'TeamHead' && u.teamId) {
            const team = await Team.findById(u.teamId).select('name memberEmployeeIds');
            teamName = team?.name;
            memberCount = team?.memberEmployeeIds?.length || 0;
        }

        res.json({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            teamId: u.teamId,
            teamName,
            memberCount,
            managerAccount: false,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/user/:id
// @desc    Get User by ID (Admin only)
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('departmentId', 'departmentName');
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/user/:id
// @desc    Update User (Admin only)
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    const { name, email, departmentId, isActive } = req.body;

    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) {
        // Check if email is already taken
        const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
        if (existingUser) {
            return res.status(400).json({ msg: 'Email already in use' });
        }
        userFields.email = email;
    }
    if (departmentId) {
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ msg: 'Department not found' });
        }
        userFields.departmentId = departmentId;
    }
    if (isActive !== undefined) userFields.isActive = isActive;

    try {
        let user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: userFields },
            { new: true }
        ).select('-password').populate('departmentId', 'departmentName');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/user/:id
// @desc    Delete User (Admin only)
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Prevent deleting Admin
        if (user.role === 'Admin') {
            return res.status(400).json({ msg: 'Cannot delete Admin users' });
        }

        await user.deleteOne();

        res.json({ msg: 'User removed successfully' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @route   GET api/user/department/:deptId
// @desc    Get all Users in a department
// @access  Private (Admin)
exports.getUsersByDepartment = async (req, res) => {
    try {
        const users = await User.find({ 
            departmentId: req.params.deptId,
            role: { $in: ['Manager', 'User'] }
        }).select('-password').populate('departmentId', 'departmentName');

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
