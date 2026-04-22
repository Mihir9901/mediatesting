const Employee = require('../models/Employee');

/**
 * Checks and updates tenureStatus for interns whose duration has passed.
 * Returns the IDs of interns modified.
 */
async function updateTenureStatuses() {
    try {
        const defaultTenureMonths = parseInt(process.env.DEFAULT_TENURE_MONTHS || '3', 10);
        const defaultTenureDays = parseInt(process.env.DEFAULT_TENURE_DAYS || '90', 10);
        const now = new Date();

        // 1. Find all Active interns (or those with missing status)
        const candidates = await Employee.find({
            $or: [
                { tenureStatus: 'Active' },
                { tenureStatus: { $exists: false } },
                { tenureStatus: null }
            ]
        }).select('employee_id appliedDate createdAt tenureMonths tenureDays tenureStatus').lean();

        const toCompleteIds = [];
        for (const e of candidates) {
            // Join date: appliedDate preferred, else createdAt
            const join = e.appliedDate ? new Date(e.appliedDate) : (e.createdAt ? new Date(e.createdAt) : null);
            if (!join || Number.isNaN(join.getTime())) continue;

            const end = new Date(join);
            const months = (typeof e.tenureMonths === 'number' && e.tenureMonths > 0) ? e.tenureMonths : null;
            const days = (typeof e.tenureDays === 'number' && e.tenureDays > 0) ? e.tenureDays : null;

            if (months) {
                end.setMonth(end.getMonth() + months);
            } else if (days) {
                end.setDate(end.getDate() + days);
            } else {
                // fallback to defaults
                if (defaultTenureMonths > 0) {
                    end.setMonth(end.getMonth() + defaultTenureMonths);
                } else {
                    end.setDate(end.getDate() + defaultTenureDays);
                }
            }

            // If current time is past the end date, it's completed
            if (now >= end) {
                toCompleteIds.push(e.employee_id);
            }
        }

        if (toCompleteIds.length) {
            await Employee.updateMany(
                { employee_id: { $in: toCompleteIds } },
                { $set: { tenureStatus: 'Completed', tenureCompletedAt: now } }
            );
            console.log(`[TenureUpdater] Auto-completed ${toCompleteIds.length} interns.`);
        }

        return toCompleteIds;
    } catch (err) {
        console.error('[TenureUpdater] Error:', err.message);
        return [];
    }
}

module.exports = { updateTenureStatuses };
