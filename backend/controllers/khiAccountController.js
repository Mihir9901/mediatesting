const KHIAccount = require('../models/KHIAccount');
const User = require('../models/User');
const Team = require('../models/Team');

// @desc    Create a new KHI Account
// @route   POST /api/admin/khi-accounts
// @access  Private (Admin)
exports.createKHIAccount = async (req, res) => {
    try {
        const { platformName, username, password, apiDetails, allowedRoles, allowedUsers } = req.body;

        const newAccount = new KHIAccount({
            platformName,
            username,
            password,
            apiDetails,
            allowedRoles,
            allowedUsers,
            createdBy: req.user.id
        });

        await newAccount.save();
        res.status(201).json({ message: 'Account created successfully', account: newAccount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all KHI Accounts (for Admin) - split by admin vs manager created
// @route   GET /api/admin/khi-accounts
// @access  Private (Admin)
exports.getAllKHIAccounts = async (req, res) => {
    try {
        const Manager = require('../models/Manager');

        // Admin-created accounts
        const adminAccounts = await KHIAccount.find({ createdByModel: { $ne: 'Manager' } })
            .populate('allowedUsers', 'name email role')
            .sort({ createdAt: -1 })
            .lean();

        // Manager-created accounts with manager name populated
        const managerAccounts = await KHIAccount.find({ createdByModel: 'Manager' })
            .populate('allowedUsers', 'name email role')
            .sort({ createdAt: -1 })
            .lean();

        // Attach manager name to each manager account
        const managerIds = [...new Set(managerAccounts.map(a => a.createdBy?.toString()).filter(Boolean))];
        const managers = await Manager.find({ _id: { $in: managerIds } }).select('name email').lean();
        const managerMap = {};
        managers.forEach(m => { managerMap[m._id.toString()] = m; });

        const enrichedManagerAccounts = managerAccounts.map(acc => ({
            ...acc,
            createdByManager: managerMap[acc.createdBy?.toString()] || null
        }));

        res.status(200).json({ adminAccounts, managerAccounts: enrichedManagerAccounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update KHI Account
// @route   PUT /api/admin/khi-accounts/:id
// @access  Private (Admin)
exports.updateKHIAccount = async (req, res) => {
    try {
        const { platformName, username, password, apiDetails, allowedRoles, allowedUsers } = req.body;
        
        const account = await KHIAccount.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        account.platformName = platformName || account.platformName;
        account.username = username || account.username;
        account.password = password || account.password;
        account.apiDetails = apiDetails || account.apiDetails;
        account.allowedRoles = allowedRoles || account.allowedRoles;
        account.allowedUsers = allowedUsers || account.allowedUsers;

        await account.save();
        res.status(200).json({ message: 'Account updated successfully', account });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Toggle KHI Account status (Active/Inactive)
// @route   PATCH /api/admin/khi-accounts/:id/toggle
// @access  Private (Admin)
exports.toggleKHIAccountStatus = async (req, res) => {
    try {
        const account = await KHIAccount.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        account.isActive = !account.isActive;
        await account.save();
        
        res.status(200).json({ 
            message: `Account ${account.isActive ? 'activated' : 'deactivated'} successfully`, 
            account 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete KHI Account
// @route   DELETE /api/admin/khi-accounts/:id
// @access  Private (Admin)
exports.deleteKHIAccount = async (req, res) => {
    try {
        const account = await KHIAccount.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        await account.deleteOne();
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get accounts visible to the logged-in user

// @route   GET /api/khi-accounts/my-accounts
// @access  Private (Admin, Manager, User, TeamHead)
exports.getMyKHIAccounts = async (req, res) => {
    try {
        // Handle both JWT structures: req.user (Admin/User/TeamHead) and req.manager (Manager)
        let userId, userRole;
        
        if (req.manager) {
            userId = req.manager.id;
            userRole = 'Manager';
        } else if (req.user) {
            userId = req.user.id;
            userRole = req.user.role;
        } else {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // If user is Admin, they see all active ones
        // For others, filter by matching role or matching specific user ID
        let query = { isActive: true };
        
        if (userRole !== 'Admin') {
            query.$or = [
                { allowedRoles: userRole },
                { allowedUsers: userId }
            ];
        }

        const accounts = await KHIAccount.find(query);
        res.status(200).json(accounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== MANAGER-SCOPED METHODS ====================

// @desc    Get TeamHeads assigned to this manager's teams
// @route   GET /api/manager/khi-accounts/my-team-heads
// @access  Private (Manager)
exports.getManagerTeamHeads = async (req, res) => {
    try {
        const managerId = req.manager.id;
        
        // Find all teams owned by this manager
        const teams = await Team.find({ managerId }).lean();
        
        // Get teamHeadUserIds from those teams
        const teamHeadIds = teams
            .map(t => t.teamHeadUserId)
            .filter(Boolean);
        
        if (teamHeadIds.length === 0) {
            return res.json([]);
        }
        
        // Get user details for those team heads
        const teamHeads = await User.find({ _id: { $in: teamHeadIds } })
            .select('name email role')
            .lean();
        
        res.json(teamHeads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create KHI Account (Manager-scoped)
// @route   POST /api/manager/khi-accounts
// @access  Private (Manager)
exports.managerCreateKHIAccount = async (req, res) => {
    try {
        const { platformName, username, password, apiDetails, allowedUsers } = req.body;

        const newAccount = new KHIAccount({
            platformName,
            username,
            password,
            apiDetails,
            allowedRoles: [],
            allowedUsers: allowedUsers || [],
            createdBy: req.manager.id,
            createdByModel: 'Manager'
        });

        await newAccount.save();
        res.status(201).json({ message: 'Account created successfully', account: newAccount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get KHI Accounts created by this manager + admin-shared accounts
// @route   GET /api/manager/khi-accounts
// @access  Private (Manager)
exports.managerGetKHIAccounts = async (req, res) => {
    try {
        // Own accounts created by this manager
        const ownAccounts = await KHIAccount.find({ createdBy: req.manager.id })
            .populate('allowedUsers', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        // Admin-shared accounts: where allowedRoles includes 'Manager' and is active
        const adminSharedAccounts = await KHIAccount.find({
            createdByModel: { $ne: 'Manager' },
            allowedRoles: 'Manager',
            isActive: true
        }).sort({ createdAt: -1 }).lean();

        res.status(200).json({
            ownAccounts: ownAccounts.map(a => ({ ...a, _source: 'own' })),
            adminShared: adminSharedAccounts.map(a => ({ ...a, _source: 'admin' }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update KHI Account (Manager-scoped, only own accounts)
// @route   PUT /api/manager/khi-accounts/:id
// @access  Private (Manager)
exports.managerUpdateKHIAccount = async (req, res) => {
    try {
        const { platformName, username, password, apiDetails, allowedUsers } = req.body;
        
        const account = await KHIAccount.findOne({ _id: req.params.id, createdBy: req.manager.id });
        if (!account) {
            return res.status(404).json({ message: 'Account not found or unauthorized' });
        }

        account.platformName = platformName || account.platformName;
        account.username = username || account.username;
        account.password = password || account.password;
        account.apiDetails = apiDetails || account.apiDetails;
        account.allowedUsers = allowedUsers || account.allowedUsers;

        await account.save();
        res.status(200).json({ message: 'Account updated successfully', account });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Toggle KHI Account status (Manager-scoped)
// @route   PATCH /api/manager/khi-accounts/:id/toggle
// @access  Private (Manager)
exports.managerToggleKHIAccountStatus = async (req, res) => {
    try {
        const account = await KHIAccount.findOne({ _id: req.params.id, createdBy: req.manager.id });
        if (!account) {
            return res.status(404).json({ message: 'Account not found or unauthorized' });
        }

        account.isActive = !account.isActive;
        await account.save();
        
        res.status(200).json({ 
            message: `Account ${account.isActive ? 'activated' : 'deactivated'} successfully`, 
            account 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete KHI Account (Manager-scoped, only own accounts)
// @route   DELETE /api/manager/khi-accounts/:id
// @access  Private (Manager)
exports.managerDeleteKHIAccount = async (req, res) => {
    try {
        const account = await KHIAccount.findOne({ _id: req.params.id, createdBy: req.manager.id });
        if (!account) {
            return res.status(404).json({ message: 'Account not found or unauthorized' });
        }

        await account.deleteOne();
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
