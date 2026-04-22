const jwt = require('jsonwebtoken');
const Manager = require('../models/Manager');

const authMiddleware = async (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's a manager token
        if (decoded.manager) {
            const manager = await Manager.findById(decoded.manager.id).select('-password');
            
            if (!manager) {
                return res.status(401).json({ msg: 'Manager not found' });
            }

            if (!manager.isActive) {
                return res.status(403).json({ msg: 'Account is deactivated' });
            }

            req.manager = {
                id: manager.id,
                name: manager.name,
                role: 'Manager',
                departments: manager.departments
            };
            
        } 
        // Check if it's an admin token
        else if (decoded.user) {
            req.user = decoded.user;
        }
        
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ msg: 'Invalid token' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token expired' });
        }
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;