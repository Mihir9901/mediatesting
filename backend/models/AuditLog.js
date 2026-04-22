const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        enum: ['Admin', 'Manager', 'User'],
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN',
            'LOGOUT',
            'CREATE_DEPARTMENT',
            'UPDATE_DEPARTMENT',
            'DELETE_DEPARTMENT',
            'CREATE_MANAGER',
            'UPDATE_MANAGER',
            'DELETE_MANAGER',
            'CREATE_USER',
            'UPDATE_USER',
            'DELETE_USER',
            'UPLOAD_EMPLOYEES',
            'MARK_ATTENDANCE',
            'UPDATE_ATTENDANCE',
            'DELETE_ATTENDANCE',
            'LOCK_ATTENDANCE',
            'EXPORT_REPORT',
            'PASSWORD_RESET',
            'CREATE_EMPLOYEE',
            'UPDATE_EMPLOYEE',
            'DELETE_EMPLOYEE'
        ]
    },
    description: {
        type: String,
        required: true
    },
    entityType: {
        type: String,
        enum: ['User', 'Employee', 'Department', 'Attendance', 'System', 'Manager'], // Added 'Manager' here
        default: 'System'
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for efficient querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);