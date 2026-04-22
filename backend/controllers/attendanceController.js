// controllers/attendanceController.js

const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Manager = require('../models/Manager');
const User = require('../models/User');
const Team = require('../models/Team');
const { sendAttendanceEmail } = require('../utils/emailService');
const { updateTenureStatuses } = require('../utils/tenureUpdater');

const response = (res, message) => {
    res.json({ success: true, message });
};

function getIsoDateInTz(date, timeZone) {
    // Returns YYYY-MM-DD in a specific IANA timezone (default handled by caller)
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const map = {};
    parts.forEach((p) => {
        if (p.type !== 'literal') map[p.type] = p.value;
    });
    return `${map.year}-${map.month}-${map.day}`;
}

function getTodayDateForAttendance() {
    const tz = process.env.TIME_ZONE || 'Asia/Kolkata';
    return getIsoDateInTz(new Date(), tz);
}

/** Mongo filter for employees visible to the current requester */
async function getEmployeeScopeQuery(req) {
    if (req.manager) {
        const manager = await Manager.findById(req.manager.id);
        const depts = manager?.departments || [];
        if (depts.includes('All')) {
            return {};
        }
        return {
            $or: [{ domain: { $in: depts } }, { departmentName: { $in: depts } }],
        };
    }

    if (req.user?.role === 'Admin') {
        return {};
    }

    if (req.user?.role === 'User') {
        const dept = req.user.department;
        if (!dept) {
            return { _id: { $exists: false } };
        }
        return {
            $or: [{ domain: dept }, { departmentName: dept }],
        };
    }

    if (req.user?.role === 'Manager') {
        const u = await User.findById(req.user.id).select('email');
        if (u?.email) {
            const md = await Manager.findOne({ email: u.email.toLowerCase() });
            if (md) {
                const depts = md.departments || [];
                if (depts.includes('All')) {
                    return {};
                }
                return {
                    $or: [{ domain: { $in: depts } }, { departmentName: { $in: depts } }],
                };
            }
        }
        return {};
    }

    if (req.user?.role === 'TeamHead') {
        const u = await User.findById(req.user.id).select('teamId');
        if (!u?.teamId) {
            return { _id: { $exists: false } };
        }
        const team = await Team.findOne({ _id: u.teamId, teamHeadUserId: u._id });
        if (!team?.memberEmployeeIds?.length) {
            return { _id: { $exists: false } };
        }
        return { employee_id: { $in: team.memberEmployeeIds } };
    }

    return { _id: { $exists: false } };
}

async function getEmployeesForRequest(req) {
    const q = await getEmployeeScopeQuery(req);
    // Hide interns whose tenure is completed (but keep older records intact)
    const activeClause = {
        $or: [{ tenureStatus: { $ne: 'Completed' } }, { tenureStatus: { $exists: false } }],
    };

    // Auto-mark tenure completed (best-effort) before returning list
    await updateTenureStatuses();

    return Employee.find({ ...q, ...activeClause }).sort({ name: 1 }).lean();
}

// Similar to getEmployeesForRequest, but includes completed interns (for reporting views).
async function getEmployeesForReport(req) {
    const q = await getEmployeeScopeQuery(req);
    // Auto-mark tenure completed (best-effort) before returning list
    await updateTenureStatuses();

    return Employee.find({ ...q }).sort({ name: 1 }).lean();
}

async function getManagerDisplayName(req) {
    if (req.manager) {
        const m = await Manager.findById(req.manager.id).select('name');
        return m?.name || 'Manager';
    }
    if (req.user?.id) {
        const u = await User.findById(req.user.id).select('name');
        return u?.name || 'Manager';
    }
    return 'Manager';
}

function padMonth(m) {
    return String(m).padStart(2, '0');
}

/**
 * Public: interns verify email + intern ID (employee_id) and view their attendance.
 * POST body: { email, intern_id }
 */
exports.lookupInternAttendance = async (req, res) => {
    try {
        const { email, intern_id } = req.body;
        if (!email || !intern_id) {
            return res.status(400).json({ message: 'Email and intern ID are required.' });
        }

        const emailNorm = String(email).trim().toLowerCase();
        const internId = String(intern_id).trim();
        if (!emailNorm || !internId) {
            return res.status(400).json({ message: 'Email and intern ID are required.' });
        }

        const employee = await Employee.findOne({ employee_id: internId });
        if (!employee || !employee.email || employee.email.trim().toLowerCase() !== emailNorm) {
            return res.status(401).json({ message: 'Invalid email or intern ID.' });
        }

        const raw = await Attendance.find({ employee_id: internId })
            .sort({ date: -1 })
            .limit(366)
            .select('date status taskDescription')
            .lean();

        const records = raw.map((r) => ({
            date: r.date,
            status: r.status,
            taskDescription: r.taskDescription || '',
        }));

        const summary = {
            present: records.filter((r) => r.status === 'Present').length,
            absent: records.filter((r) => r.status === 'Absent').length,
            completed: records.filter((r) => r.status === 'Completed').length,
            total: records.length,
        };

        res.json({
            name: employee.name,
            employee_id: employee.employee_id,
            department: employee.domain || employee.departmentName || '',
            summary,
            records,
        });
    } catch (err) {
        console.error('Intern attendance lookup error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route GET /api/attendance/attendance-data?date=YYYY-MM-DD
exports.getAttendanceData = async (req, res) => {
    try {
        // If date is omitted, default to server-controlled "today"
        const date = req.query.date || getTodayDateForAttendance();

        const employees = await getEmployeesForRequest(req);
        const ids = employees.map((e) => e.employee_id);

        const records = await Attendance.find({
            date,
            employee_id: { $in: ids },
        }).lean();

        const attendanceRecords = {};
        records.forEach((r) => {
            attendanceRecords[r.employee_id] = {
                status: r.status,
                taskDescription: r.taskDescription || '',
            };
        });

        res.json({ employees, attendanceRecords });
    } catch (err) {
        console.error('getAttendanceData error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route POST /api/attendance/mark
exports.markAttendance = async (req, res) => {
    try {
        const { employee_id, status, taskDescription } = req.body;
        if (!employee_id || !status) {
            return res.status(400).json({ message: 'employee_id and status are required' });
        }

        // Server-controlled attendance date (prevents manual backdating/forward dating from client)
        const date = getTodayDateForAttendance();

        const employees = await getEmployeesForRequest(req);
        const allowed = employees.some((e) => e.employee_id === employee_id);
        if (!allowed) {
            // Could be out of scope OR tenure completed
            const emp = await Employee.findOne({ employee_id }).select('tenureStatus').lean();
            if (emp?.tenureStatus === 'Completed') {
                return res.status(403).json({ message: 'Tenure completed. Attendance is locked for this intern.' });
            }
            return res.status(403).json({ message: 'Not allowed to update this employee' });
        }

        let markedBy = null;
        if (req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
            markedBy = req.user.id;
        }

        const setDoc = {
            employee_id,
            date,
            status,
            taskDescription: taskDescription || '',
        };
        if (markedBy) {
            setDoc.markedBy = markedBy;
        }

        await Attendance.findOneAndUpdate(
            { employee_id, date },
            { $set: setDoc },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, message: 'Attendance marked' });
    } catch (err) {
        console.error('markAttendance error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.lockAttendance = (req, res) => {
    response(res, 'Attendance locked');
};

// @route GET /api/attendance/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const { startDate, endDate, limit = '10' } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }

        const employees = await getEmployeesForRequest(req);
        const totalEmployees = employees.length;
        const ids = employees.map((e) => e.employee_id);

        const today = new Date().toISOString().split('T')[0];
        const todayRecords = await Attendance.find({
            date: today,
            employee_id: { $in: ids },
        }).lean();

        const todayPresent = todayRecords.filter((r) =>
            ['Present', 'Completed'].includes(r.status)
        ).length;

        const stats = {
            totalEmployees,
            todayAttendance: todayPresent,
            absent: Math.max(0, totalEmployees - todayPresent),
        };

        const recordsInRange = await Attendance.find({
            date: { $gte: startDate, $lte: endDate },
            employee_id: { $in: ids },
        }).lean();

        const dayKeys = [];
        const d0 = new Date(startDate);
        const d1 = new Date(endDate);
        for (let d = new Date(d0); d <= d1; d.setDate(d.getDate() + 1)) {
            dayKeys.push(d.toISOString().split('T')[0]);
        }

        const chartData = dayKeys.map((dateStr) => {
            const dayRecs = recordsInRange.filter((r) => r.date === dateStr);
            const completed = dayRecs.filter((r) => r.status === 'Completed').length;
            const notMarked = Math.max(0, totalEmployees - completed);
            return { date: dateStr, completed, notMarked };
        });

        const lim = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
        const recentDocs = await Attendance.find({ employee_id: { $in: ids } })
            .sort({ updatedAt: -1 })
            .limit(lim)
            .lean();

        const idToName = {};
        employees.forEach((e) => {
            idToName[e.employee_id] = e.name;
        });

        const recentActivity = recentDocs.map((r) => ({
            employeeName: idToName[r.employee_id] || r.employee_id,
            status: r.status,
        }));

        res.json({
            stats,
            analytics: { chartData },
            recentActivity,
        });
    } catch (err) {
        console.error('getDashboard error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getDepartmentEmployees = async (req, res) => {
    try {
        const employees = await getEmployeesForRequest(req);
        res.json(employees);
    } catch (err) {
        console.error('getDepartmentEmployees error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAttendanceRecords = async (req, res) => {
    try {
        const employees = await getEmployeesForRequest(req);
        const ids = employees.map((e) => e.employee_id);
        const records = await Attendance.find({ employee_id: { $in: ids } })
            .sort({ date: -1 })
            .limit(500)
            .lean();
        res.json({ records });
    } catch (err) {
        console.error('getAttendanceRecords error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAttendanceAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }
        const employees = await getEmployeesForRequest(req);
        const ids = employees.map((e) => e.employee_id);
        const recordsInRange = await Attendance.find({
            date: { $gte: startDate, $lte: endDate },
            employee_id: { $in: ids },
        }).lean();

        res.json({
            totalRecords: recordsInRange.length,
            byStatus: ['Present', 'Absent', 'Completed'].map((status) => ({
                status,
                count: recordsInRange.filter((r) => r.status === status).length,
            })),
        });
    } catch (err) {
        console.error('getAttendanceAnalytics error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const { limit = '10' } = req.query;
        const employees = await getEmployeesForRequest(req);
        const ids = employees.map((e) => e.employee_id);
        const lim = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
        const recentDocs = await Attendance.find({ employee_id: { $in: ids } })
            .sort({ updatedAt: -1 })
            .limit(lim)
            .lean();

        const idToName = {};
        employees.forEach((e) => {
            idToName[e.employee_id] = e.name;
        });

        const recentActivity = recentDocs.map((r) => ({
            employeeName: idToName[r.employee_id] || r.employee_id,
            status: r.status,
        }));

        res.json({ recentActivity });
    } catch (err) {
        console.error('getRecentActivity error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route GET /api/attendance/monthly-report?month=&year=
exports.getMonthlyReport = async (req, res) => {
    try {
        const month = parseInt(req.query.month, 10);
        const year = parseInt(req.query.year, 10);
        if (!month || !year) {
            return res.status(400).json({ message: 'month and year are required' });
        }

        const startDate = `${year}-${padMonth(month)}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${padMonth(month)}-${String(lastDay).padStart(2, '0')}`;

        const employees = await getEmployeesForReport(req);
        const ids = employees.map((e) => e.employee_id);

        const monthRecords = await Attendance.find({
            employee_id: { $in: ids },
            date: { $gte: startDate, $lte: endDate },
        })
            .select('employee_id status')
            .lean();

        const countsByEmp = {};
        monthRecords.forEach((r) => {
            const key = r.employee_id;
            if (!countsByEmp[key]) {
                countsByEmp[key] = { completed: 0, present: 0, absent: 0, total: 0 };
            }
            countsByEmp[key].total += 1;
            if (r.status === 'Completed') countsByEmp[key].completed += 1;
            else if (r.status === 'Present') countsByEmp[key].present += 1;
            else if (r.status === 'Absent') countsByEmp[key].absent += 1;
        });

        const report = employees.map((emp) => ({
            uniqueId: emp.employee_id,
            name: emp.name,
            department: emp.domain || emp.departmentName || 'N/A',
            tenureStatus: emp.tenureStatus || 'Active',
            tenureMonths: emp.tenureMonths ?? null,
            // Backwards compatible field name used by UI
            taskCompleted: countsByEmp[emp.employee_id]?.completed || 0,
            // Additional counts for proper reporting UI
            present: countsByEmp[emp.employee_id]?.present || 0,
            absent: countsByEmp[emp.employee_id]?.absent || 0,
            totalMarkedDays: countsByEmp[emp.employee_id]?.total || 0,
            appliedDate: emp.appliedDate,
        }));

        res.json({ report });
    } catch (err) {
        console.error('getMonthlyReport error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route POST /api/attendance/send-emails
exports.sendAttendanceEmails = async (req, res) => {
    try {
        // Date is server-controlled; if client omits, default to "today"
        const { employeeIds } = req.body;
        const date = req.body?.date || getTodayDateForAttendance();

        let employees = await getEmployeesForRequest(req);
        if (employeeIds?.length) {
            const set = new Set(employeeIds);
            employees = employees.filter((e) => set.has(e.employee_id));
        }

        const managerName = await getManagerDisplayName(req);
        let sent = 0;
        const errors = [];

        for (const emp of employees) {
            if (!emp.email) {
                continue;
            }
            const rec = await Attendance.findOne({ employee_id: emp.employee_id, date });
            if (!rec) {
                continue;
            }
            try {
                await sendAttendanceEmail({
                    employeeEmail: emp.email,
                    employeeName: emp.name,
                    status: rec.status,
                    date,
                    managerName,
                    department: emp.domain || emp.departmentName || '',
                    taskDescription: rec.taskDescription || '',
                });
                sent += 1;
            } catch (e) {
                console.error('sendAttendanceEmail failed:', e.message);
                errors.push(emp.email);
            }
        }

        res.json({
            success: true,
            message: emailsSummary(sent, errors),
            sent,
            failed: errors.length,
        });
    } catch (err) {
        console.error('sendAttendanceEmails error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

function emailsSummary(sent, errors) {
    if (errors.length === 0) {
        return sent > 0 ? `Attendance emails sent: ${sent}` : 'No emails sent (missing records or addresses)';
    }
    return `Sent ${sent}; failed for ${errors.length} recipient(s). Check email configuration.`;
}

exports.updateAttendance = (req, res) => {
    response(res, 'Attendance updated');
};

exports.deleteAttendance = (req, res) => {
    response(res, 'Attendance deleted');
};
