const mongoose = require('mongoose');

const khiAccountSchema = new mongoose.Schema({
    platformName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    apiDetails: {
        type: String,
        trim: true
    },
    allowedRoles: [{
        type: String,
        enum: ['Admin', 'Manager', 'User', 'TeamHead']
    }],
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'createdByModel'
    },
    createdByModel: {
        type: String,
        enum: ['User', 'Manager'],
        default: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('KHIAccount', khiAccountSchema);
