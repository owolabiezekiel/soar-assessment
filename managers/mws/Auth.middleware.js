const jwt = require('jsonwebtoken');
const config = require('../../config/index.config');

module.exports = ({ config, managers }) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                // If it's a public route (login/signup), allow it. 
                // However, middleware is usually applied to specific routes.
                // For global middleware, we'd need checks here.
                // We'll assume this is applied to protected routes.
                return res.status(401).json({ ok: false, error: 'No token provided' });
            }

            const decoded = managers.token.verifyLongToken(token);
            if (!decoded) {
                return res.status(401).json({ ok: false, error: 'Invalid token' });
            }

            req.user = decoded; // { userId, role, schoolId }
            next();
        } catch (err) {
            console.error('Auth Middleware Error:', err);
            return res.status(500).json({ ok: false, error: 'Internal Server Error' });
        }
    };
};
