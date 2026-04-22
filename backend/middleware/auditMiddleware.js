const AuditLog = require('../models/AuditLog');

// Middleware to create audit log entries
const createAuditLog = async (req, action, description, entityType = 'System', entityId = null, metadata = {}) => {
    try {
        // Map entityType to valid enum values
        let validEntityType = entityType;
        
        // If entityType is 'Manager', map it to a valid enum value
        if (entityType === 'Manager') {
            validEntityType = 'User'; // Map Manager to User since it's in the enum
        }
        
        const auditEntry = {
            user: (req && req.user && req.user.id && req.user.id.match(/^[0-9a-fA-F]{24}$/)) ? req.user.id : null,
            userName: (req && req.user && req.user.name) ? req.user.name : 'System',
            userRole: (req && req.user && ['Admin', 'Manager', 'User'].includes(req.user.role)) ? req.user.role : 'System',
            action,
            description,
            entityType: validEntityType,
            entityId: (entityId && entityId.toString().match(/^[0-9a-fA-F]{24}$/)) ? entityId : null,
            ipAddress: (req && (req.ip || (req.connection && req.connection.remoteAddress))) || null,
            userAgent: (req && typeof req.get === 'function') ? req.get('user-agent') : null,
            metadata
        };

        // If userRole is 'System', we need to make sure it's allowed in the enum or handle it
        // The AuditLog model enum is ['Admin', 'Manager', 'User']
        if (auditEntry.userRole === 'System') {
            auditEntry.userRole = 'Admin'; // Fallback to Admin or handle differently
        }

        // If user is null, and it's required, we might need a default admin ID or handle it
        if (!auditEntry.user) {
            // Try to find an admin user if no user is provided
            const User = require('../models/User');
            const admin = await User.findOne({ role: 'Admin' });
            if (admin) {
                auditEntry.user = admin._id;
            } else {
                console.error('Audit log error: No admin user found for fallback');
                return; // Can't create audit log without a user
            }
        }

        await AuditLog.create(auditEntry);
    } catch (err) {
        console.error('Audit log error:', err.message);
        // Don't fail the main request if audit logging fails
    }
};

// Get audit logs (Admin only)
const getAuditLogs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            action, 
            userId, 
            entityType,
            startDate, 
            endDate 
        } = req.query;

        const query = {};

        if (action) query.action = action;
        if (userId) query.user = userId;
        if (entityType) query.entityType = entityType;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(query)
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.json({
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { createAuditLog, getAuditLogs };