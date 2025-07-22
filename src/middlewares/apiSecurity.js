"use strict";

/**
 * Middleware to protect API routes
 * Only allows requests from coglist.com domain
 */
module.exports = function(req, res, next) {
    const origin = req.get('origin');
    const referer = req.get('referer');
    
    // Allow requests from coglist.com domain
    if (origin && (origin.includes('coglist.com'))) {
        console.log('origin is '+ origin);
        return next();
    }

    //|| origin.includes('localhost')
    
    // Also check referer header as fallback
    if (referer && (referer.includes('coglist.com') )) {
        console.log('origin is '+ origin);
        return next();
    }
    //|| referer.includes('localhost')
    
    // For development/testing
    if (process.env.NODE_ENV === 'development') {
        console.log('passed. origin is '+ origin);
        return next();
    }
    
    // Reject all other requests
    return res.status(403).json({
        error: 'Access denied. API is only accessible from coglist.com'
    });
};
