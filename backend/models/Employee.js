const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employee_id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        index: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    departmentName: {
        type: String,
        index: true
    },
    email: {
        type: String,
        index: true
    },
    contactNo: {
        type: String
    },
    domain: {
        type: String,
        index: true
    },
    appliedDate: {
        type: Date
    },
    /** Internship duration in months (preferred). */
    tenureMonths: {
        type: Number
    },
    /** Internship duration in days (legacy; kept for backwards compatibility). */
    tenureDays: {
        type: Number
    },
    /** Active until tenure completes */
    tenureStatus: {
        type: String,
        enum: ['Active', 'Completed'],
        default: 'Active',
        index: true
    },
    tenureCompletedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Add compound index for common query patterns
employeeSchema.index({ createdAt: -1 });
employeeSchema.index({ domain: 1, departmentName: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
