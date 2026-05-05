// const mongoose = require('mongoose');

// const teamSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         managerId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Manager',
//             required: true,
//             index: true,
//         },
//         teamHeadUserId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             default: null,
//         },
//         /** Employee.employee_id values for interns in this team */
//         memberEmployeeIds: {
//             type: [String],
//             default: [],
//         },
//     },
//     { timestamps: true }
// );

// teamSchema.index({ managerId: 1, name: 1 }, { unique: true });

// module.exports = mongoose.model('Team', teamSchema);






const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Who created this team (Admin or Manager)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Creator role
    creatorRole: {
      type: String,
      enum: ['admin', 'manager'],
      required: true,
    },

    // Assigned Team Head login
    teamHeadUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Employee.employee_id values assigned to this team
    memberEmployeeIds: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Prevent duplicate team names globally
teamSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);