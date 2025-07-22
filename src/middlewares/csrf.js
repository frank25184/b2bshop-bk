const csrf = require('@dr.pogodin/csurf');
const cookieParser = require('cookie-parser');

// Create CSRF protection middleware with secure cookie settings
const csrfProtection = csrf({
    cookie: {
        key: '_csrf', // Cookie name
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
        sameSite: 'strict',
        maxAge: 3600 // 1 hour
    }
});

// Error handling middleware for CSRF errors
const handleCSRFError = (err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') {
        return next(err);
    }

    // Handle CSRF token errors
    res.status(403).json({
        error: 'Invalid CSRF token',
        message: 'Your session has expired or the form was tampered with. Please refresh the page and try again.'
    });
};

// Helper function to generate and set CSRF token in cookie
const generateCsrfToken = (req) => {
    return req.csrfToken();
};

module.exports = {
    csrfProtection,
    handleCSRFError,
    generateCsrfToken
};