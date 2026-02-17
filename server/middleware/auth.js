const { prepare } = require('../db');

// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please login to access this resource'
        });
    }
    next();
}

// Optional auth - adds user info if logged in
function optionalAuth(req, res, next) {
    if (req.session && req.session.userId) {
        const user = prepare(
            'SELECT user_id, username, email, full_name FROM users WHERE user_id = ?'
        ).get(req.session.userId);
        req.user = user;
    }
    next();
}

module.exports = { requireAuth, optionalAuth };
