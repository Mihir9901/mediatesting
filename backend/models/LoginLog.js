const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['Admin', 'Manager', 'TeamHead'],
      required: true,
      index: true,
    },
    username: {
      type: String,
      default: '',
      index: true,
    },
    email: {
      type: String,
      default: '',
      index: true,
    },
    ipAddress: {
      type: String,
      default: '',
      index: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

loginLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LoginLog', loginLogSchema);

