const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');
const { logSuccessfulLogin, requireLatLong } = require('../utils/loginLogger');

// @route   POST api/manager/login
// @desc    Login manager
// @access  Public
exports.loginManager = async (req, res) => {
    const { email, password } = req.body;

    try {
        const loc = requireLatLong(req);
        if (!loc.ok) {
            return res.status(400).json({ message: loc.message });
        }

        const emailNorm = String(email || '').trim().toLowerCase();
        const manager = await Manager.findOne({ email: emailNorm });
        
        if (!manager) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!manager.isActive) {
            return res.status(403).json({ message: 'Account is deactivated. Please contact admin.' });
        }

        const isMatch = await manager.matchPassword(password);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        manager.lastLogin = new Date();
        await manager.save();

        await logSuccessfulLogin({
            req,
            role: 'Manager',
            username: manager.name,
            email: manager.email,
        });

        const payload = {
            manager: {
                id: manager.id,
                role: 'Manager',
                departments: manager.departments || []
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) {
                    console.error('JWT sign error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }
                
                res.json({
                    token,
                    user: {
                        id: manager.id,
                        name: manager.name,
                        email: manager.email,
                        role: 'Manager',
                        departments: manager.departments,
                        isActive: manager.isActive,
                        managerAccount: true,
                    }
                });
            }
        );
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

// @route   GET api/manager/me
// @desc    Manager profile (Manager JWT) or hub user (User / Manager from User collection)
// @access  Private
exports.getMe = async (req, res) => {
    try {
        if (req.manager) {
            const manager = await Manager.findById(req.manager.id).select('-password');
            if (!manager) {
                return res.status(404).json({ message: 'Manager not found' });
            }
            return res.json(manager);
        }

        if (req.user && (req.user.role === 'User' || req.user.role === 'Manager')) {
            const u = await User.findById(req.user.id).select('-password');
            if (!u) {
                return res.status(404).json({ message: 'User not found' });
            }
            let departments = [];
            if (req.user.role === 'User' && req.user.department) {
                departments = [req.user.department];
            } else if (req.user.role === 'Manager') {
                const md = await Manager.findOne({ email: u.email.toLowerCase() });
                departments = md?.departments || [];
            }
            return res.json({
                name: u.name,
                email: u.email,
                departments,
                isActive: u.isActive !== false,
            });
        }

        return res.status(403).json({ message: 'Forbidden' });
    } catch (err) {
        console.error('Get me error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET api/manager/employees
// @desc    Get employees in manager's departments (or dept lead scope)
// @access  Private
exports.getDepartmentEmployees = async (req, res) => {
    try {
        if (req.manager) {
            const manager = await Manager.findById(req.manager.id);
            if (!manager || !manager.isActive) {
                return res.status(403).json({ message: 'Access denied' });
            }
            const depts = manager.departments || [];
            const query = depts.includes('All') ? {} : { domain: { $in: depts } };
            const employees = await Employee.find(query).sort({ name: 1 });
            return res.json(employees);
        }

        if (req.user?.role === 'User' && req.user.department) {
            const dept = req.user.department;
            const employees = await Employee.find({
                $or: [{ domain: dept }, { departmentName: dept }],
            }).sort({ name: 1 });
            return res.json(employees);
        }

        if (req.user?.role === 'Manager') {
            const u = await User.findById(req.user.id);
            if (!u) {
                return res.status(404).json({ message: 'User not found' });
            }
            const md = await Manager.findOne({ email: u.email.toLowerCase() });
            const depts = md?.departments || [];
            const query = depts.includes('All') ? {} : { domain: { $in: depts } };
            const employees = await Employee.find(query).sort({ name: 1 });
            return res.json(employees);
        }

        return res.status(403).json({ message: 'Access denied' });
    } catch (err) {
        console.error('Get employees error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};


// @route   POST api/manager/debug-password
// @desc    Debug password hashing
// @access  Public (temporary)
exports.debugPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const manager = await Manager.findOne({ email });
        if (!manager) {
            return res.status(404).json({ message: 'Manager not found' });
        }
        
        res.json({
            id: manager._id,
            name: manager.name,
            email: manager.email,
            departments: manager.departments,
            isActive: manager.isActive,
            passwordHash: manager.password ? manager.password.substring(0, 20) + '...' : 'No password hash',
            passwordLength: manager.password ? manager.password.length : 0,
            createdAt: manager.createdAt,
            updatedAt: manager.updatedAt
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
