const roleMiddleware = (roles) => {
    return (req, res, next) => {
        // Check if user is authenticated (either as admin or manager)
        const currentUser = req.user || req.manager;
        
        if (!currentUser) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }
        
        // Get the role from the user object
        const userRole = currentUser.role;
        
        if (!roles.includes(userRole)) {
            return res.status(403).json({ msg: 'Forbidden: Insufficient role permissions' });
        }
        next();
    };
};

module.exports = roleMiddleware;
