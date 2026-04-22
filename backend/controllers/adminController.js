const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Manager = require('../models/Manager');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const xlsx = require('xlsx');
const { createAuditLog } = require('../middleware/auditMiddleware');
const { logSuccessfulLogin, requireLatLong } = require('../utils/loginLogger');
const { updateTenureStatuses } = require('../utils/tenureUpdater');

// @route   POST api/admin/register
// @desc    Register admin
// @access  Public
exports.registerAdmin = async (req, res) => {
    const { name, email, password, secretKey } = req.body;

    try {
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(400).json({ msg: 'Invalid secret key' });
        }

        let admin = await User.findOne({ email });
        if (admin) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        admin = new User({ name, email, password, role: 'Admin' });

        await admin.save();

        const payload = { user: { id: admin.id, role: 'Admin' } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: admin.id, name: admin.name, email: admin.email, role: 'Admin'} });
        });
    } catch (err) {
        console.error('Register admin error:', err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST api/admin/login
// @desc    Login admin
// @access  Public
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const loc = requireLatLong(req);
        if (!loc.ok) {
            return res.status(400).json({ msg: loc.message });
        }

        const emailNorm = String(email || '').trim().toLowerCase();
        const user = await User.findOne({ email: emailNorm });
        if (!user || user.role !== 'Admin') {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        await logSuccessfulLogin({
            req,
            role: 'Admin',
            username: user.name,
            email: user.email,
        });

        const payload = { user: { id: user.id, role: 'Admin' } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: 'Admin'} });
        });
    } catch (err) {
        console.error('Login admin error:', err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST api/admin/create-department
// @desc    Create a new department
// @access  Private (Admin)
exports.createDepartment = async (req, res) => {
    const { departmentName } = req.body;
    try {
        let department = await Department.findOne({ departmentName });
        if (department) {
            return res.status(400).json({ msg: 'Department already exists' });
        }
        department = new Department({ departmentName });
        await department.save();
        res.json(department);
    } catch (err) {
        console.error('Create department error:', err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/admin/all-departments
// @desc    Get all departments
// @access  Private (Admin)
exports.getAllDepartments = async (req, res) => {
    try {
        // Get departments from Department collection
        const departments = await Department.find().sort({ departmentName: 1 });
        
        // Also get unique domains from employees
        const employeesWithDomains = await Employee.find().select('domain departmentName').lean();
        const employeeDomains = employeesWithDomains
            .map(emp => emp.domain || emp.departmentName)
            .filter(Boolean);
        const uniqueEmployeeDomains = [...new Set(employeeDomains)];
        
        // Get department names from Department collection
        const departmentNames = departments.map(d => d.departmentName);
        
        // Combine and deduplicate
        const allDepartments = [...new Set([...departmentNames, ...uniqueEmployeeDomains])].sort();
        
        // Return as array of objects with _id and departmentName
        const result = allDepartments.map(name => ({
            _id: name,
            departmentName: name
        }));
        
        res.json(result);
    } catch (err) {
        console.error('Get departments error:', err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/admin/managers
// @desc    Get all managers
// @access  Private (Admin)
exports.getAllManagers = async (req, res) => {
    try {
        const managers = await Manager.find()
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json(managers);
    } catch (err) {
        console.error('Get managers error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST api/admin/create-manager
// @desc    Create a new manager
// @access  Private (Admin)
exports.createManager = async (req, res) => {
    const { name, email, password, departments } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (!departments || !Array.isArray(departments) || departments.length === 0) {
        return res.status(400).json({ message: 'Please assign at least one department' });
    }

    try {
        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return res.status(400).json({ message: 'Manager with this email already exists' });
        }

        const newManager = new Manager({ name, email, password, departments });
        const savedManager = await newManager.save();

        if (req.user && req.user.id) {
            try {
                await createAuditLog(req, 'CREATE_MANAGER', `Manager ${savedManager.name} created`, 'User', savedManager._id);
            } catch (auditErr) {
                console.error('Audit log error:', auditErr.message);
            }
        }

        res.status(201).json(savedManager);
    } catch (err) {
        console.error('Create manager error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error while creating manager: ' + (err.message || 'Unknown error') });
    }
};

// @route   PUT api/admin/managers/:id
// @desc    Update manager (name, email, departments, status)
// @access  Private (Admin)
exports.updateManager = async (req, res) => {
    const { name, email, departments, isActive } = req.body;

    try {
        // First check if the ID is valid
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid manager ID format' });
        }

        const manager = await Manager.findById(req.params.id);
        if (!manager) {
            return res.status(404).json({ message: 'Manager not found' });
        }

        // Check email uniqueness if changing
        if (email && email !== manager.email) {
            const existingManager = await Manager.findOne({ email });
            if (existingManager) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update fields
        let hasChanges = false;
        
        if (name && name !== manager.name) {
            manager.name = name;
            hasChanges = true;
        }
        
        if (email && email !== manager.email) {
            manager.email = email;
            hasChanges = true;
        }
        
        if (departments) {
            // Sort arrays for comparison
            const currentDepts = [...(manager.departments || [])].sort();
            const newDepts = [...departments].sort();
            
            if (JSON.stringify(currentDepts) !== JSON.stringify(newDepts)) {
                manager.departments = departments;
                hasChanges = true;
            }
        }
        
        if (isActive !== undefined && isActive !== manager.isActive) {
            manager.isActive = isActive;
            hasChanges = true;
        }

        if (!hasChanges) {
            const managerResponse = {
                _id: manager._id,
                name: manager.name,
                email: manager.email,
                departments: manager.departments,
                isActive: manager.isActive,
                createdAt: manager.createdAt,
                updatedAt: manager.updatedAt
            };
            return res.json(managerResponse);
        }

        // Save the manager - password is NOT being updated
        const updatedManager = await manager.save();

        // Create audit log - use 'User' instead of 'Manager' for enum compatibility
        try {
            await createAuditLog(req, 'UPDATE_MANAGER', 
                `Manager ${updatedManager.name} updated`,
                'User', updatedManager._id
            );
        } catch (auditErr) {
            console.error('Audit log error:', auditErr.message);
        }

        const managerResponse = {
            _id: updatedManager._id,
            name: updatedManager.name,
            email: updatedManager.email,
            departments: updatedManager.departments,
            isActive: updatedManager.isActive,
            createdAt: updatedManager.createdAt,
            updatedAt: updatedManager.updatedAt
        };

        res.json(managerResponse);
        
    } catch (err) {
        console.error('Update manager error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

// @route   DELETE api/admin/managers/:id
// @desc    Delete manager
// @access  Private (Admin)
exports.deleteManager = async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.id);
        if (!manager) {
            return res.status(404).json({ message: 'Manager not found' });
        }

        // Create audit log before deletion - use 'User' instead of 'Manager' for enum compatibility
        try {
            await createAuditLog(req, 'DELETE_MANAGER', 
                `Manager ${manager.name} deleted`,
                'User', manager._id
            );
        } catch (auditErr) {
            console.error('Audit log error:', auditErr.message);
        }

        await manager.deleteOne();
        res.json({ message: 'Manager removed successfully' });
    } catch (err) {
        console.error('Delete manager error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   PATCH api/admin/managers/:id/toggle
// @desc    Toggle manager active status
// @access  Private (Admin)
exports.toggleManagerStatus = async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.id);
        if (!manager) {
            return res.status(404).json({ message: 'Manager not found' });
        }

        manager.isActive = !manager.isActive;
        await manager.save();

        // Create audit log - use 'User' instead of 'Manager' for enum compatibility
        try {
            await createAuditLog(req, 'UPDATE_MANAGER', 
                `Manager ${manager.name} status toggled to ${manager.isActive ? 'active' : 'inactive'}`,
                'User', manager._id
            );
        } catch (auditErr) {
            console.error('Audit log error:', auditErr.message);
        }

        res.json({ 
            _id: manager._id,
            isActive: manager.isActive,
            message: `Manager ${manager.isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (err) {
        console.error('Toggle status error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

// @route   POST api/admin/create-user
// @desc    Create a User (Dept Lead)
// @access  Private (Admin)
exports.createUser = async (req, res) => {
    const { name, email, password, departmentId } = req.body;
    
    if (!name || !email || !password || !departmentId) {
        return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ msg: 'Department not found' });
        }

        const existingUser = await User.findOne({ departmentId, role: 'User' });
        if (existingUser) {
            return res.status(400).json({ msg: 'Department already has a User (Dept Lead)' });
        }

        user = new User({
            name,
            email,
            password,
            role: 'User',
            departmentIds: [departmentId]
        });

        await user.save();
        res.json({ msg: 'User (Dept Lead) created successfully', user: { id: user.id, name: user.name, email: user.email, role: 'User', department: department.departmentName } });
    } catch (err) {
        console.error('Create user error:', err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server error');
    }
};

// @route   GET api/admin/all-users
// @desc    Get all Users (Dept Leads)
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'User' })
            .select('-password')
            .populate('departmentIds', 'departmentName')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   GET api/admin/all-shareable-users
// @desc    Get all users except Admins (for credential sharing)
// @access  Private (Admin)
exports.getAllShareableUsers = async (req, res) => {
    try {
        // Fetch all non-admin users from User collection
        const users = await User.find({ role: { $ne: 'Admin' } })
            .select('name email role')
            .lean();
            
        // Fetch all from Manager collection
        const managers = await Manager.find()
            .select('name email')
            .lean();
            
        // Combine and deduplicate by email (User collection takes priority)
        const emailSet = new Set();
        const unifiedUsers = [];
        
        // Add users first (they have proper role info)
        for (const u of users) {
            const key = (u.email || '').toLowerCase();
            if (!emailSet.has(key)) {
                emailSet.add(key);
                unifiedUsers.push(u);
            }
        }
        
        // Add managers that aren't already in the list
        for (const m of managers) {
            const key = (m.email || '').toLowerCase();
            if (!emailSet.has(key)) {
                emailSet.add(key);
                unifiedUsers.push({ ...m, role: 'Manager' });
            }
        }
        
        unifiedUsers.sort((a, b) => a.name.localeCompare(b.name));
        res.json(unifiedUsers);
    } catch (err) {
        console.error('Get shareable users error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/admin/team-heads
// @desc    List all TeamHead accounts
// @access  Private (Admin)
exports.getAllTeamHeads = async (req, res) => {
    try {
        const Team = require('../models/Team');
        const heads = await User.find({ role: 'TeamHead' })
            .select('name email isActive teamId createdAt lastLogin')
            .sort({ createdAt: -1 })
            .lean();

        const teamIds = heads.map(h => h.teamId).filter(Boolean);
        const teams = teamIds.length
            ? await Team.find({ _id: { $in: teamIds } }).select('name').lean()
            : [];
        const teamMap = new Map(teams.map(t => [String(t._id), t.name]));

        const payload = heads.map(h => ({
            ...h,
            teamName: h.teamId ? (teamMap.get(String(h.teamId)) || '') : ''
        }));

        res.json(payload);
    } catch (err) {
        console.error('Get team heads error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @route   PATCH api/admin/team-heads/:id/toggle
// @desc    Toggle TeamHead active status
// @access  Private (Admin)
exports.toggleTeamHeadStatus = async (req, res) => {
    try {
        const head = await User.findById(req.params.id);
        if (!head || head.role !== 'TeamHead') {
            return res.status(404).json({ message: 'Team head not found' });
        }
        head.isActive = !head.isActive;
        await head.save();
        res.json({ _id: head._id, isActive: head.isActive });
    } catch (err) {
        console.error('Toggle team head status error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET api/admin/attendance-day?date=YYYY-MM-DD&department=
// @desc    Get employees and their attendance for a specific day
// @access  Private (Admin)
exports.getAttendanceDay = async (req, res) => {
    try {
        const { date, department } = req.query;
        if (!date) {
            return res.status(400).json({ message: 'date is required (YYYY-MM-DD)' });
        }

        const employeeQuery = department
            ? { $or: [{ domain: department }, { departmentName: department }] }
            : {};

        const employees = await Employee.find(employeeQuery)
            .select('name email domain departmentName employee_id appliedDate')
            .sort({ name: 1 })
            .lean();

        const ids = employees.map((e) => e.employee_id);
        const records = await Attendance.find({ date, employee_id: { $in: ids } })
            .select('employee_id status taskDescription date isLocked')
            .lean();

        const recordMap = new Map(records.map((r) => [r.employee_id, r]));

        const rows = employees.map((e) => {
            const r = recordMap.get(e.employee_id);
            return {
                employee: e,
                attendance: r
                    ? {
                          id: r._id,
                          date: r.date,
                          status: r.status,
                          taskDescription: r.taskDescription || '',
                          isLocked: !!r.isLocked,
                      }
                    : null,
            };
        });

        res.json({ date, department: department || 'All', rows });
    } catch (err) {
        console.error('getAttendanceDay error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   PUT api/admin/attendance-day
// @desc    Upsert attendance for an employee+date (Admin override)
// @access  Private (Admin)
exports.upsertAttendanceDay = async (req, res) => {
    try {
        const { employee_id, date, status, taskDescription } = req.body;
        if (!employee_id || !date || !status) {
            return res
                .status(400)
                .json({ message: 'employee_id, date, and status are required' });
        }

        const emp = await Employee.findOne({ employee_id: String(employee_id).trim() }).lean();
        if (!emp) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // If Admin marks attendance as "Completed", treat it as tenure completion too.
        // This matches common usage where admins "complete" an intern from the attendance override page.
        if (status === 'Completed' && emp.tenureStatus !== 'Completed') {
            await Employee.updateOne(
                { employee_id: emp.employee_id },
                { $set: { tenureStatus: 'Completed', tenureCompletedAt: new Date() } }
            );
        }

        const updated = await Attendance.findOneAndUpdate(
            { employee_id: emp.employee_id, date },
            {
                $set: {
                    employee_id: emp.employee_id,
                    date,
                    status,
                    taskDescription: taskDescription || '',
                },
            },
            { upsert: true, new: true, runValidators: true }
        ).lean();

        res.json({ message: 'Attendance updated', attendance: updated });
    } catch (err) {
        console.error('upsertAttendanceDay error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST api/admin/upload-employees
// @desc    Upload employees via Excel
// @access  Private (Admin)
exports.uploadEmployees = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload an excel file' });
        }

        const workbook = xlsx.read(req.file.buffer, { 
            type: 'buffer',
            cellDates: true,
            dateNF: 'yyyy-mm-dd'
        });
        const sheetName = workbook.SheetNames[0];
        const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
            raw: false,
            dateNF: 'yyyy-mm-dd'
        });

        const employeesToInsert = [];
        
        for (const row of sheet) {
            const getValue = (row, ...keys) => {
                for (const key of keys) {
                    if (row[key] !== undefined) return row[key];
                }
                return '';
            };

            const uniqueId = String(getValue(row, 'Unique ID', 'unique_id', 'UniqueID', 'ID', 'id', 'Unique Id') || '');
            const fullName = String(getValue(row, 'Full Name', 'full name', 'FullName', 'Name', 'name') || '');
            const email = getValue(row, 'Email', 'email') || '';
            const contactNo = getValue(row, 'Contact No.', 'contact no', 'ContactNo', 'Phone', 'phone', 'Mobile', 'mobile') || '';
            const departmentName = getValue(row, 'Department', 'department', 'Dept', 'dept', 'Department Name') || '';
            const domain = getValue(row, 'Domain', 'domain') || '';
            const appliedDate = getValue(row, 'Applied Date', 'applied date', 'AppliedDate', 'appliedDate', 'Applied', 'Joining Date', 'joining date', 'JoiningDate', 'joiningDate') || '';
            const tenureMonthsRaw = getValue(
                row,
                'Duration (months)',
                'Duration (month)',
                'Duration Months',
                'Duration Month',
                'Duration',
                'Tenure Months',
                'tenureMonths',
                'tenure_months',
                'Internship Duration (months)'
            );

            if (uniqueId && fullName) {
                let parsedAppliedDate = null;
                if (appliedDate) {
                    const dateObj = new Date(appliedDate);
                    if (!isNaN(dateObj.getTime())) {
                        parsedAppliedDate = dateObj;
                    }
                }

                let tenureMonths = undefined;
                if (tenureMonthsRaw !== undefined && tenureMonthsRaw !== null && String(tenureMonthsRaw).trim() !== '') {
                    const n = parseInt(String(tenureMonthsRaw).trim(), 10);
                    if (!Number.isNaN(n) && n > 0) {
                        tenureMonths = n;
                    }
                }

                employeesToInsert.push({
                    employee_id: uniqueId,
                    name: fullName,
                    email: email,
                    contactNo: contactNo,
                    departmentName: departmentName,
                    domain: domain,
                    appliedDate: parsedAppliedDate,
                    ...(tenureMonths ? { tenureMonths } : {})
                });
            }
        }
        
        if (employeesToInsert.length === 0) {
             return res.status(400).json({ msg: 'No valid data found in file. Ensure columns are named: Full Name, Email, Contact No., Department, Unique ID, Joining Date' });
        }

        let insertedCount = 0;
        let updatedCount = 0;
        
        for (const emp of employeesToInsert) {
             const result = await Employee.updateOne(
                 { employee_id: emp.employee_id },
                 { $set: emp },
                 { upsert: true }
             );
             if (result.upsertedCount > 0) insertedCount++;
             if (result.modifiedCount > 0) updatedCount++;
        }

        res.json({ msg: `Successfully processed file. Inserted: ${insertedCount}, Updated: ${updatedCount}` });
    } catch (err) {
        console.error('Upload employees error:', err.message);
        res.status(500).send('Server error during upload');
    }
};

// @route   POST api/admin/create-employee
// @desc    Create a single employee
// @access  Private (Admin)
exports.createEmployee = async (req, res) => {
    const { fullName, email, contactNo, domain, uniqueId, appliedDate, tenureMonths, tenureDays } = req.body;

    if (!fullName || !uniqueId) {
        return res.status(400).json({ msg: 'Full Name and Unique ID are required' });
    }

    try {
        const existingEmployee = await Employee.findOne({ employee_id: uniqueId });
        if (existingEmployee) {
            return res.status(400).json({ msg: 'Employee with this Unique ID already exists' });
        }

        let parsedAppliedDate = null;
        if (appliedDate) {
            const dateObj = new Date(appliedDate);
            if (!isNaN(dateObj.getTime())) {
                parsedAppliedDate = dateObj;
            }
        }

        const employee = new Employee({
            employee_id: uniqueId,
            name: fullName,
            email: email || '',
            contactNo: contactNo || '',
            domain: domain || '',
            appliedDate: parsedAppliedDate,
            tenureMonths: tenureMonths ? parseInt(tenureMonths, 10) : undefined,
            tenureDays: tenureDays ? parseInt(tenureDays, 10) : undefined
        });

        await employee.save();

        res.json({ msg: 'Employee created successfully', employee });
    } catch (err) {
        console.error('Create employee error:', err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server error');
    }
};

// @route   GET api/admin/employees
// @desc    Get all employees
// @access  Private (Admin)
exports.getEmployees = async (req, res) => {
    try {
        // Auto-update tenure before fetching
        await updateTenureStatuses();

        // Optimize: Only select fields needed for intern details page
        const employees = await Employee.find()
            .select('name email contactNo domain departmentName employee_id appliedDate tenureMonths tenureDays tenureStatus tenureCompletedAt createdAt')
            .sort({ createdAt: -1 })
            .lean();
        res.json(employees);
    } catch (err) {
        console.error('Get employees error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/admin/employees/:id
// @desc    Update an employee
// @access  Private (Admin)
exports.updateEmployee = async (req, res) => {
    try {
        const { name, email, contactNo, departmentName, domain, appliedDate, tenureMonths, tenureDays, tenureStatus } = req.body;
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({ msg: 'Employee not found' });
        }
        
        if (name) employee.name = name;
        if (email) employee.email = email;
        if (contactNo) employee.contactNo = contactNo;
        if (departmentName) employee.departmentName = departmentName;
        if (domain) employee.domain = domain;
        if (appliedDate) employee.appliedDate = appliedDate;
        if (tenureMonths !== undefined) employee.tenureMonths = tenureMonths;
        if (tenureDays !== undefined) employee.tenureDays = tenureDays;
        if (tenureStatus !== undefined && tenureStatus !== null) {
            const normalized = String(tenureStatus).trim();
            if (['Active', 'Completed'].includes(normalized)) {
                employee.tenureStatus = normalized;
                if (normalized === 'Completed' && !employee.tenureCompletedAt) {
                employee.tenureCompletedAt = new Date();
                }
                if (normalized === 'Active') {
                employee.tenureCompletedAt = null;
                }
            }
        }
        
        await employee.save();
        res.json(employee);
    } catch (err) {
        console.error('Update employee error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/admin/login-logs
// @desc    List login logs (Admin only)
// @access  Private (Admin)
exports.getLoginLogs = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || '25', 10), 1), 200);
        const role = (req.query.role || '').trim();
        const q = (req.query.q || '').trim();

        const filter = {};
        if (role && ['Admin', 'Manager', 'TeamHead'].includes(role)) {
            filter.role = role;
        }
        if (q) {
            const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ username: re }, { email: re }, { ipAddress: re }];
        }

        const LoginLog = require('../models/LoginLog');
        const total = await LoginLog.countDocuments(filter);
        const logs = await LoginLog.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        res.json({
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            logs,
        });
    } catch (err) {
        console.error('getLoginLogs error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   DELETE api/admin/employees/:id
// @desc    Delete an employee
// @access  Private (Admin)
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({ msg: 'Employee not found' });
        }
        
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Employee deleted successfully' });
    } catch (err) {
        console.error('Delete employee error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/admin/export-report
// @desc    Export attendance report
// @access  Private (Admin)
exports.exportReport = async (req, res) => {
    const { month, year, employeeId } = req.query;
    try {
        if (!month || !year) {
             return res.status(400).json({msg: 'Month and year are required (MM, YYYY)'});
        }
        
        const prefix = `${year}-${month.padStart(2, '0')}`;
        
        const query = { date: { $regex: `^${prefix}` } };
        if (employeeId) {
            query.employee_id = employeeId;
        }
        
        const attendanceRecords = await Attendance.find(query);
        
        let employees;
        if (employeeId) {
            employees = await Employee.find({ employee_id: employeeId }).populate('departmentId', 'departmentName');
        } else {
            employees = await Employee.find().populate('departmentId', 'departmentName');
        }
        
        const employeeMap = {};
        employees.forEach(emp => {
            employeeMap[emp.employee_id] = emp;
        });
        
        const reportData = [];
        
        const activeDatesQuery = employeeId 
            ? { date: { $regex: `^${prefix}` }, employee_id: employeeId }
            : { date: { $regex: `^${prefix}` } };
        const activeDates = await Attendance.distinct('date', activeDatesQuery);
        
        const recordsByEmployee = {};
        attendanceRecords.forEach(record => {
            const empId = record.employee_id;
            if (!recordsByEmployee[empId]) {
                recordsByEmployee[empId] = [];
            }
            recordsByEmployee[empId].push(record);
        });
        
        if (employeeId && employees.length > 0) {
            const emp = employees[0];
            const empRecords = recordsByEmployee[emp.employee_id] || [];
            const taskCompleted = empRecords.filter(r => r.status === 'Completed').length;
            
            reportData.push({
                'Unique ID': emp.employee_id,
                'Name': emp.name,
                'Department': emp.departmentId ? emp.departmentId.departmentName : (emp.domain || 'N/A'),
                'Task Completed': taskCompleted
            });
            
            const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
            
            const recordByDate = {};
            empRecords.forEach(record => {
                recordByDate[record.date] = record;
            });
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const record = recordByDate[dateStr];
                
                if (record) {
                    reportData.push({
                        'Date': record.date,
                        'Status': record.status,
                        'Task Details': record.taskDescription || '',
                        'Remarks': record.remarks || ''
                    });
                } else {
                    reportData.push({
                        'Date': dateStr,
                        'Status': 'Incomplete',
                        'Task Details': '',
                        'Remarks': ''
                    });
                }
            }
        } else {
            employees.forEach(emp => {
                 const empRecords = recordsByEmployee[emp.employee_id] || [];
                 const taskCompleted = empRecords.filter(r => r.status === 'Completed').length;
                 
                 reportData.push({
                     'Unique ID': emp.employee_id,
                     'Name': emp.name,
                     'Department': emp.departmentId ? emp.departmentId.departmentName : (emp.domain || 'N/A'),
                     'Task Completed': taskCompleted
                 });
            });
        }

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(reportData);
        
        const fileName = employeeId 
            ? `Attendance_Report_${prefix}_${employeeId}.xlsx`
            : `Attendance_Report_${prefix}.xlsx`;
        xlsx.utils.book_append_sheet(workbook, worksheet, `Report ${prefix}`);
        
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        
    } catch (err) {
        console.error('Export report error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/admin/manager-departments
// @desc    Get all unique departments from registered managers
// @access  Private (Admin)
exports.getManagerDepartments = async (req, res) => {
    try {
        const managers = await Manager.find().select('departments');
        
        // Extract all departments and get unique values
        const allDepartments = managers.flatMap(manager => manager.departments || []);
        const uniqueDepartments = [...new Set(allDepartments)].sort();
        
        res.json(uniqueDepartments);
    } catch (err) {
        console.error('Get manager departments error:', err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/admin/attendance-report
// @desc    Export attendance report for all departments
// @access  Private (Admin)
exports.exportAttendanceReport = async (req, res) => {
    const { date, month, year } = req.query;
    try {
        if (!year) {
            return res.status(400).json({ msg: 'Year is required' });
        }
        
        // Build query based on filters
        let startDate, endDate;
        
        if (date) {
            // Specific date
            startDate = date;
            endDate = date;
        } else if (month && year) {
            // Specific month
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
            const lastDay = new Date(yearNum, monthNum, 0).getDate();
            endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        } else if (year) {
            // Full year
            startDate = `${year}-01-01`;
            endDate = `${year}-12-31`;
        }
        
        const query = {
            date: { $gte: startDate, $lte: endDate }
        };
        
        const attendanceRecords = await Attendance.find(query).sort({ date: 1 });
        
        // Get all employees
        const employees = await Employee.find();
        
        const employeeMap = {};
        employees.forEach(emp => {
            employeeMap[emp.employee_id] = emp;
        });
        
        // Group records by employee
        const recordsByEmployee = {};
        attendanceRecords.forEach(record => {
            const empId = record.employee_id;
            if (!recordsByEmployee[empId]) {
                recordsByEmployee[empId] = [];
            }
            recordsByEmployee[empId].push(record);
        });
        
        const reportData = [];
        
        // Build date range string
        let dateRange = '';
        if (date) {
            dateRange = date;
        } else if (month && year) {
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            const startDate = `${yearNum}/${String(monthNum).padStart(2, '0')}/01`;
            const lastDay = new Date(yearNum, monthNum, 0).getDate();
            const endDate = `${yearNum}/${String(monthNum).padStart(2, '0')}/${String(lastDay).padStart(2, '0')}`;
            dateRange = `${startDate} - ${endDate}`;
        } else if (year) {
            dateRange = `${year}/01/01 - ${year}/12/31`;
        }
        
        employees.forEach(emp => {
            const empRecords = recordsByEmployee[emp.employee_id] || [];
            const taskCompleted = empRecords.filter(r => r.status === 'Completed').length;
            const totalDays = empRecords.length;
            
            reportData.push({
                'Date Range': dateRange,
                'Unique ID': emp.employee_id,
                'Name': emp.name,
                'Email': emp.email || '',
                'Department': emp.domain || emp.departmentName || 'N/A',
                'Total Working Days': totalDays,
                'Tasks Completed': taskCompleted,
                'Incomplete Days': totalDays - taskCompleted
            });
        });
        
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(reportData);
        
        const prefix = year + (month ? `-${String(month).padStart(2, '0')}` : '');
        const fileName = `Attendance_Report_All_${prefix}.xlsx`;
        
        xlsx.utils.book_append_sheet(workbook, worksheet, 'All Departments');
        
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        
    } catch (err) {
        console.error('Export attendance report error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/admin/attendance-report/department
// @desc    Export attendance report for specific department
// @access  Private (Admin)
exports.exportDepartmentReport = async (req, res) => {
    const { name, date, month, year } = req.query;
    try {
        if (!year) {
            return res.status(400).json({ msg: 'Year is required' });
        }
        if (!name) {
            return res.status(400).json({ msg: 'Department name is required' });
        }
        
        // Build query based on filters
        let startDate, endDate;
        
        if (date) {
            startDate = date;
            endDate = date;
        } else if (month && year) {
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
            const lastDay = new Date(yearNum, monthNum, 0).getDate();
            endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        } else if (year) {
            startDate = `${year}-01-01`;
            endDate = `${year}-12-31`;
        }
        
        const query = {
            date: { $gte: startDate, $lte: endDate }
        };
        
        const attendanceRecords = await Attendance.find(query).sort({ date: 1 });
        
        // Get employees for the specific department (match by domain or departmentName)
        const employees = await Employee.find({
            $or: [
                { domain: name },
                { departmentName: name }
            ]
        });
        
        const employeeIds = employees.map(emp => emp.employee_id);
        
        // Filter attendance records for this department
        const deptRecords = attendanceRecords.filter(record => 
            employeeIds.includes(record.employee_id)
        );
        
        const employeeMap = {};
        employees.forEach(emp => {
            employeeMap[emp.employee_id] = emp;
        });
        
        // Group records by employee
        const recordsByEmployee = {};
        deptRecords.forEach(record => {
            const empId = record.employee_id;
            if (!recordsByEmployee[empId]) {
                recordsByEmployee[empId] = [];
            }
            recordsByEmployee[empId].push(record);
        });
        
        const reportData = [];
        
        // Build date range string
        let dateRange = '';
        if (date) {
            dateRange = date;
        } else if (month && year) {
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            const startDate = `${yearNum}/${String(monthNum).padStart(2, '0')}/01`;
            const lastDay = new Date(yearNum, monthNum, 0).getDate();
            const endDate = `${yearNum}/${String(monthNum).padStart(2, '0')}/${String(lastDay).padStart(2, '0')}`;
            dateRange = `${startDate} - ${endDate}`;
        } else if (year) {
            dateRange = `${year}/01/01 - ${year}/12/31`;
        }
        
        employees.forEach(emp => {
            const empRecords = recordsByEmployee[emp.employee_id] || [];
            const taskCompleted = empRecords.filter(r => r.status === 'Completed').length;
            const totalDays = empRecords.length;
            
            reportData.push({
                'Date Range': dateRange,
                'Unique ID': emp.employee_id,
                'Name': emp.name,
                'Email': emp.email || '',
                'Department': emp.domain || emp.departmentName || name,
                'Total Working Days': totalDays,
                'Tasks Completed': taskCompleted,
                'Incomplete Days': totalDays - taskCompleted
            });
        });
        
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(reportData);
        
        const prefix = year + (month ? `-${String(month).padStart(2, '0')}` : '');
        const safeDeptName = name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `Attendance_Report_${safeDeptName}_${prefix}.xlsx`;
        
        xlsx.utils.book_append_sheet(workbook, worksheet, name.substring(0, 30));
        
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        
    } catch (err) {
        console.error('Export department report error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/admin/all-domains
// @desc    Get all unique domains from employees (same as Attendance Hub)
// @access  Private (Admin)
exports.getAllDomains = async (req, res) => {
    try {
        const employees = await Employee.find().select('domain');
        const allDomains = employees.map(emp => emp.domain).filter(Boolean);
        const uniqueDomains = [...new Set(allDomains)].sort();
        
        res.json(uniqueDomains);
    } catch (err) {
        console.error('Get all domains error:', err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/admin/attendance-report/data
// @desc    Get attendance report data as JSON (not Excel export)
// @access  Private (Admin)
exports.getAttendanceReportData = async (req, res) => {
    const { date, month, year, department } = req.query;
    try {
        if (!year) {
            return res.status(400).json({ msg: 'Year is required' });
        }
        
        // Build query based on filters
        let startDate, endDate;
        
        if (date) {
            // Specific date
            startDate = date;
            endDate = date;
        } else if (month && year) {
            // Specific month
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
            const lastDay = new Date(yearNum, monthNum, 0).getDate();
            endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        } else if (year) {
            // Full year
            startDate = `${year}-01-01`;
            endDate = `${year}-12-31`;
        }
        
        const query = {
            date: { $gte: startDate, $lte: endDate }
        };
        
        const attendanceRecords = await Attendance.find(query).sort({ date: 1 });
        
        // Get employees (optionally filter by department)
        let employees;
        if (department) {
            employees = await Employee.find({
                $or: [
                    { domain: department },
                    { departmentName: department }
                ]
            });
        } else {
            employees = await Employee.find();
        }
        
        const employeeMap = {};
        employees.forEach(emp => {
            employeeMap[emp.employee_id] = emp;
        });
        
        const employeeIds = employees.map(emp => emp.employee_id);
        
        // Filter records for employees in the selected departments
        const filteredRecords = attendanceRecords.filter(record => 
            employeeIds.includes(record.employee_id)
        );
        
        // Group records by employee
        const recordsByEmployee = {};
        filteredRecords.forEach(record => {
            const empId = record.employee_id;
            if (!recordsByEmployee[empId]) {
                recordsByEmployee[empId] = [];
            }
            recordsByEmployee[empId].push(record);
        });
        
        // Build detailed report data
        const reportData = employees.map(emp => {
            const empRecords = recordsByEmployee[emp.employee_id] || [];
            const taskCompleted = empRecords.filter(r => r.status === 'Completed').length;
            const presentCount = empRecords.filter(r => r.status === 'Present').length;
            const absentCount = empRecords.filter(r => r.status === 'Absent').length;
            const totalDays = empRecords.length;
            
            return {
                _id: emp._id,
                employee_id: emp.employee_id,
                name: emp.name,
                email: emp.email || '',
                department: emp.domain || emp.departmentName || 'N/A',
                totalWorkingDays: totalDays,
                tasksCompleted: taskCompleted,
                present: presentCount,
                absent: absentCount,
                incompleteDays: totalDays - taskCompleted,
                records: empRecords.map(r => ({
                    date: r.date,
                    status: r.status,
                    taskDescription: r.taskDescription || ''
                }))
            };
        });
        
        // Calculate summary stats
        const summary = {
            totalEmployees: employees.length,
            totalRecords: filteredRecords.length,
            totalCompleted: filteredRecords.filter(r => r.status === 'Completed').length,
            totalPresent: filteredRecords.filter(r => r.status === 'Present').length,
            totalAbsent: filteredRecords.filter(r => r.status === 'Absent').length
        };
        
        res.json({
            dateRange: { startDate, endDate },
            department: department || 'All',
            summary,
            employees: reportData
        });
        
    } catch (err) {
        console.error('Get attendance report data error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/admin/download-template
// @desc    Download Excel template for intern upload
// @access  Private (Admin)
exports.downloadTemplate = async (req, res) => {
    try {
        const data = [
            {
                "Unique ID": "GM2024001",
                "Full Name": "Rahul Sharma",
                "Email": "rahul.sharma@example.com",
                "Contact No.": "9876543210",
                "Department": "Engineering",
                "Domain": "Web Development",
                "Joining Date": "2024-05-01",
                "Duration (months)": 6
            },
            {
                "Unique ID": "GM2024002",
                "Full Name": "Priya Singh",
                "Email": "priya.singh@example.com",
                "Contact No.": "9876543211",
                "Department": "Design",
                "Domain": "UI/UX Design",
                "Joining Date": "2024-05-15",
                "Duration (months)": 3
            },
            {
                "Unique ID": "GM2024003",
                "Full Name": "Amit Verma",
                "Email": "amit.verma@example.com",
                "Contact No.": "9876543212",
                "Department": "Marketing",
                "Domain": "Digital Marketing",
                "Joining Date": "2024-06-01",
                "Duration (months)": 4
            }
        ];

        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Interns Template");

        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="interns_bulk_upload_template.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);
    } catch (err) {
        console.error('Download template error:', err.message);
        res.status(500).send('Server error');
    }
};