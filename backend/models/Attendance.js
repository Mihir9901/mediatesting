const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee_id: {
        type: String,
        required: true
    },
    date: {
        type: String, // Storing as YYYY-MM-DD for easy querying
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Completed'],
        required: true
    },
    taskDescription: {
        type: String,
        default: '',
        trim: true,
        maxlength: 500
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isLocked: {
        type: Boolean,
        default: false // Indicates if attendance is locked for the day
    },
    lockedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Ensure a single record per employee per day
attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

// Add indexes for better query performance
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ employee_id: 1 });
attendanceSchema.index({ date: 1, employee_id: 1 });
// Compound index optimized for monthly report queries
attendanceSchema.index({ date: 1, employee_id: 1, status: 1 });
// Index for status filtering
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
