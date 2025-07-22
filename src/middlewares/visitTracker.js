// visitTracker.js
'use strict';

const PageVisit = require('../models/PageVisit');
const util = require('../libs/utility');
const logger = require('../libs/logger');
const useragent = require('express-useragent');

// Constants from PageVisit model
const URL_MAX_LENGTH = 2048;
const TITLE_MAX_LENGTH = 255;

/**
 * Middleware for tracking page visits
 */
const visitTracker = [
    useragent.express(), // Add user-agent parsing
    async (req, res, next) => {
        logger.info('Visit tracker middleware called', {
            method: req.method,
            path: req.path,
            userAgent: req.headers['user-agent']
        });

        // Skip tracking for non-GET requests or asset files
        if (req.method !== 'GET' || req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
            logger.debug('Skipping visit tracking for asset or non-GET request', {
                method: req.method,
                path: req.path
            });
            return next();
        }
        //skip robot

        try {
            // Get device type with more detailed detection
            let deviceType = 'desktop';
            if (req.useragent) {
                if (req.useragent.isMobile) deviceType = 'mobile';
                else if (req.useragent.isTablet) deviceType = 'tablet';
            }

            logger.debug('Detected device type', { deviceType });

            // Get real IP address considering proxies
            const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                            req.connection.remoteAddress || 
                            req.socket.remoteAddress || 
                            req.ip;

            // Generate or get session ID
            if (!req.session?.visitId) {
                req.session = req.session || {};
                req.session.visitId = util.generateUUID();
                logger.debug('Generated new session ID', { sessionId: req.session.visitId });
            }

            // Get referrer (clean and validate)
            let referrer = req.headers.referer || req.headers.referrer;
            if (referrer) {
                try {
                    const refUrl = new URL(referrer);
                    // Only track external referrers
                    if (refUrl.host === req.hostname) {
                        referrer = null;
                    }
                } catch (e) {
                    referrer = null;
                }
            }

            // Get and validate URL and title
            const url = (req.originalUrl || '/').slice(0, URL_MAX_LENGTH);
            const title = (req.seoTitle || req.title || 'Unknown Page').slice(0, TITLE_MAX_LENGTH);

            // Prepare visit data
            const visitData = {
                url: url,
                title: title,
                sessionId: req.session.visitId,
                ipAddress: ipAddress,
                deviceType: deviceType,
                referrer: referrer,
                userAgent: req.headers['user-agent']
            };

            logger.debug('Prepared visit data', { visitData });

            // Record visit
            const pageVisit = await PageVisit.recordVisit(visitData);
            logger.info('Page visit recorded successfully', {
                url: visitData.url,
                deviceType: deviceType,
                sessionId: req.session.visitId,
                totalVisits: pageVisit.totalVisits
            });
        } catch (error) {
            // Log error but don't break the request
            logger.error('Error recording page visit:', {
                error: error.message,
                url: req.originalUrl,
                stack: error.stack
            });
        }

        next();
    }
];

module.exports = visitTracker;