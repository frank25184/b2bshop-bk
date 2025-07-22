'use strict';

const logger = require('../libs/logger');
const dns = require('dns').promises;
const crypto = require('crypto');

// List of known search engine bot patterns and their domains
const SEARCH_ENGINE_PATTERNS = [
    { pattern: /Googlebot/i, domain: 'google.com', ipRanges: ['66.249.', '64.233.', '72.14.', '74.125.', '209.85.', '216.239.'] },
    { pattern: /Bingbot/i, domain: 'search.msn.com', ipRanges: ['157.55.', '207.46.', '40.77.', '13.66.', '131.253.'] },
    { pattern: /Slurp/i, domain: 'yahoo.com', ipRanges: ['68.180.', '72.30.', '74.6.', '98.136.', '67.195.'] },
    { pattern: /DuckDuckBot/i, domain: 'duckduckgo.com', ipRanges: ['23.21.', '107.21.', '54.208.'] },
    { pattern: /Baiduspider/i, domain: 'baidu.com', ipRanges: ['180.76.', '123.125.', '220.181.'] },
    { pattern: /YandexBot/i, domain: 'yandex.ru', ipRanges: ['100.43.', '37.9.', '37.140.', '77.88.', '95.108.'] },
    { pattern: /facebookexternalhit/i, domain: 'facebook.com', ipRanges: ['31.13.', '66.220.', '69.63.', '69.171.', '173.252.'] }
];

// IP reputation store with TTL
const IP_REPUTATION = {
    store: new Map(),
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    minScore: -100,
    maxScore: 100,
    scoreDecay: 5
};

// Suspicious patterns and behaviors
const SUSPICIOUS_PATTERNS = {
    params: [
        'should-crawl',
        'wait-before-scraping',
        'save-html',
        'save-markdown',
        'record-id',
        'scrape',
        'crawler',
        'spider'
    ],
    headers: [
        'x-requested-with',
        'x-forwarded-host',
        'x-scan',
        'x-crawl'
    ],
    extensions: [
        '.php',
        '.asp',
        '.aspx',
        '.jsp',
        '.cgi'
    ]
};

// Rate limiting settings with sliding window
const RATE_LIMITS = {
    window: 60 * 1000, // 1 minute window
    maxRequests: 80,   // requests per window
    burstLimit: 20,    // max burst requests
    penaltyWindow: 5 * 60 * 1000, // 5 minutes penalty
    maxPenalty: 24 * 60 * 60 * 1000 // 24 hours max penalty
};

// Stores for tracking requests and penalties
const requestStore = new Map();
const penaltyStore = new Map();

/**
 * Clean up old entries from stores
 */
function cleanupStores() {
    const now = Date.now();
    for (const [ip, data] of requestStore.entries()) {
        if (now - data.windowStart > RATE_LIMITS.window) {
            requestStore.delete(ip);
        }
    }
    for (const [ip, timestamp] of penaltyStore.entries()) {
        if (now - timestamp > RATE_LIMITS.maxPenalty) {
            penaltyStore.delete(ip);
        }
    }
    for (const [ip, data] of IP_REPUTATION.store.entries()) {
        if (now - data.lastUpdate > IP_REPUTATION.ttl) {
            IP_REPUTATION.store.delete(ip);
        }
    }
}

// Run cleanup every minute
setInterval(cleanupStores, 60000);

/**
 * Verify if the request is from a legitimate search engine bot
 * @param {string} userAgent 
 * @param {string} ip 
 * @returns {Promise<boolean>}
 */
async function verifySearchEngineBot(userAgent, ip) {
    for (const engine of SEARCH_ENGINE_PATTERNS) {
        if (engine.pattern.test(userAgent)) {
            try {
                const hostnames = await dns.reverse(ip);
                const hostname = hostnames[0].toLowerCase();
                return hostname.includes(engine.domain);
            } catch (error) {
                logger.error('DNS reverse lookup failed', { ip, error: error.message });
                return false;
            }
        }
    }
    return false;
}

/**
 * Check for suspicious patterns in the request
 * @param {Object} req 
 * @returns {boolean}
 */
function hasSuspiciousPatterns(req) {
    // Check query parameters
    const hasParams = SUSPICIOUS_PATTERNS.params.some(param => 
        Object.keys(req.query).some(key => 
            key.toLowerCase().includes(param.toLowerCase())
        )
    );
    if (hasParams) return true;

    // Check headers
    const hasHeaders = SUSPICIOUS_PATTERNS.headers.some(header => 
        req.headers[header.toLowerCase()]
    );
    if (hasHeaders) return true;

    // Check path extensions
    const hasExtension = SUSPICIOUS_PATTERNS.extensions.some(ext => 
        req.path.toLowerCase().endsWith(ext)
    );
    if (hasExtension) return true;

    return false;
}

/**
 * Apply penalty to an IP address
 * @param {string} ip 
 */
function applyPenalty(ip) {
    const now = Date.now();
    const currentPenalty = penaltyStore.get(ip) || 0;
    const newPenalty = Math.min(
        currentPenalty ? currentPenalty * 2 : RATE_LIMITS.penaltyWindow,
        RATE_LIMITS.maxPenalty
    );
    penaltyStore.set(ip, now + newPenalty);
    logger.warn('Penalty applied to IP', { ip, penaltyDuration: newPenalty });
}

/**
 * Check if request violates rate limits
 * @param {string} ip 
 * @param {number} now 
 * @returns {boolean}
 */
function isStaticAsset(req) {
    // Check file extensions for static assets
    const staticExtensions = ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    const path = req.path.toLowerCase();
    return staticExtensions.some(ext => path.endsWith(ext)) ||
           (req.headers['content-type'] && req.headers['content-type'].includes('image/'));
}

function checkRateLimit(ip, now, req) {
    // Skip rate limiting for static assets
    if (isStaticAsset(req)) {
        return false;
    }

    const requestData = requestStore.get(ip) || {
        count: 0,
        burstCount: 0,
        windowStart: now,
        lastRequest: now
    };

    // Check if in penalty
    const penaltyUntil = penaltyStore.get(ip);
    if (penaltyUntil && now < penaltyUntil) {
        return true;
    }

    // Reset window if needed
    if (now - requestData.windowStart > RATE_LIMITS.window) {
        requestData.count = 0;
        requestData.burstCount = 0;
        requestData.windowStart = now;
    }

    // Check burst rate
    if (now - requestData.lastRequest < 1000) { // Within 1 second
        requestData.burstCount++;
        if (requestData.burstCount > RATE_LIMITS.burstLimit) {
            applyPenalty(ip);
            return true;
        }
    } else {
        requestData.burstCount = 0;
    }

    requestData.count++;
    requestData.lastRequest = now;
    requestStore.set(ip, requestData);

    return requestData.count > RATE_LIMITS.maxRequests;
}

/**
 * Generate request fingerprint for behavioral analysis
 * @param {Object} req 
 * @returns {string}
 */
function generateRequestFingerprint(req) {
    const components = [
        req.headers['user-agent'] || '',
        req.headers['accept-language'] || '',
        req.headers['accept'] || '',
        req.headers['accept-encoding'] || '',
        req.method,
        req.path
    ];
    return crypto.createHash('sha256').update(components.join('|')).digest('hex');
}

/**
 * Update IP reputation score
 * @param {string} ip 
 * @param {number} score 
 */
function updateIpReputation(ip, score) {
    const now = Date.now();
    const reputation = IP_REPUTATION.store.get(ip) || {
        score: 0,
        lastUpdate: now,
        patterns: new Set()
    };

    // Apply time-based score decay
    const timeDiff = now - reputation.lastUpdate;
    const decayFactor = Math.floor(timeDiff / (60 * 60 * 1000)); // Hours since last update
    reputation.score = Math.min(
        Math.max(
            reputation.score + score - (decayFactor * IP_REPUTATION.scoreDecay),
            IP_REPUTATION.minScore
        ),
        IP_REPUTATION.maxScore
    );

    reputation.lastUpdate = now;
    IP_REPUTATION.store.set(ip, reputation);

    // Log significant reputation changes
    if (Math.abs(score) >= 10) {
        logger.info('IP reputation updated', {
            ip,
            scoreChange: score,
            newScore: reputation.score
        });
    }
}

/**
 * Check if IP is from known search engine ranges
 * @param {string} ip 
 * @param {Object} engine 
 * @returns {boolean}
 */
function isInSearchEngineRange(ip, engine) {
    return engine.ipRanges.some(range => ip.startsWith(range));
}

/**
 * Middleware to filter and rate limit crawlers
 */
const crawlerFilter = async (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.ip;

    // Generate request fingerprint
    const fingerprint = generateRequestFingerprint(req);

    // Check for search engine bots
    for (const engine of SEARCH_ENGINE_PATTERNS) {
        if (engine.pattern.test(userAgent)) {
            // First check IP range
            if (!isInSearchEngineRange(ip, engine)) {
                logger.warn('Fake search engine bot detected', { ip, userAgent });
                updateIpReputation(ip, -50);
                return res.status(403).send('Access Denied');
            }
            // Then verify with reverse DNS
            if (await verifySearchEngineBot(userAgent, ip)) {
                logger.info('Verified search engine bot allowed', { userAgent, ip });
                return next();
            }
        }
    }

    // Check IP reputation
    const reputation = IP_REPUTATION.store.get(ip);
    if (reputation && reputation.score <= IP_REPUTATION.minScore) {
        logger.warn('Blocked due to bad reputation', { ip, score: reputation.score });
        return res.status(403).send('Access Denied');
    }

    // Check for suspicious patterns
    if (hasSuspiciousPatterns(req)) {
        logger.warn('Blocked request with suspicious patterns', {
            ip,
            userAgent,
            path: req.path,
            query: req.query,
            headers: req.headers,
            fingerprint
        });
        updateIpReputation(ip, -20);
        applyPenalty(ip);
        return res.status(403).send('Access Denied');
    }

    // Check rate limits
    const now = Date.now();
    if (checkRateLimit(ip, now,req)) {
        logger.warn('Rate limit exceeded', { 
            ip, 
            userAgent,
            penaltyUntil: penaltyStore.get(ip),
            fingerprint
        });
        updateIpReputation(ip, -10);
        return res.status(429).send('Too Many Requests');
    }

    // Reward good behavior slightly
    updateIpReputation(ip, 1);
    next();
};

module.exports = crawlerFilter;