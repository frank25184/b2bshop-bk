const PageVisit = require('../../models/PageVisit');
const moment = require('moment');
const { performance } = require('perf_hooks');
const { getPageRankings } = require('./pageRankings');

// Constants
const ACTIVE_SESSION_TIMEOUT = 30; // minutes
const TOP_REFERRERS_LIMIT = 5;
const DAILY_STATS_DAYS = 7;

// Cache configuration
const cache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // The page stats are cached for 5 minutes

async function calculateTotalVisits(pageVisits) {
    if (!Array.isArray(pageVisits)) {
        throw new Error('Invalid pageVisits data');
    }
    return pageVisits.reduce((sum, page) => sum + (page.totalVisits || 0), 0);
}

async function calculateDeviceStats(pageVisits) {
    if (!Array.isArray(pageVisits)) {
        throw new Error('Invalid pageVisits data');
    }
    return pageVisits.reduce((stats, page) => {
        stats.desktop += page.deviceStats.desktop || 0;
        stats.mobile += page.deviceStats.mobile || 0;
        stats.tablet += page.deviceStats.tablet || 0;
        return stats;
    }, { desktop: 0, mobile: 0, tablet: 0 });
}

async function getActiveSessions(pageVisits) {
    if (!Array.isArray(pageVisits)) {
        throw new Error('Invalid pageVisits data');
    }
    return pageVisits.reduce((sessions, page) => {
        return sessions.concat(page.activeSessions.filter(session => {
            const lastActivity = moment(session.lastActivityTime);
            return moment().diff(lastActivity, 'minutes') <= ACTIVE_SESSION_TIMEOUT;
        }));
    }, []);
}

async function getTopReferrers(pageVisits) {
    if (!Array.isArray(pageVisits)) {
        throw new Error('Invalid pageVisits data');
    }
    const referrerMap = new Map();
    pageVisits.forEach(page => {
        page.referrers.forEach(ref => {
            const current = referrerMap.get(ref.url) || 0;
            referrerMap.set(ref.url, current + ref.count);
        });
    });

    return Array.from(referrerMap.entries())
        .map(([url, count]) => ({ url, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, TOP_REFERRERS_LIMIT);
}

async function getDailyStats(pageVisits) {
    if (!Array.isArray(pageVisits)) {
        throw new Error('Invalid pageVisits data');
    }
    const today = moment().startOf('day');
    const dailyStats = [];
    
    for (let i = DAILY_STATS_DAYS - 1; i >= 0; i--) {
        const date = moment(today).subtract(i, 'days');
        const dayStats = {
            date: date.format('YYYY-MM-DD'),
            visits: 0,
            uniqueVisitors: 0
        };
        
        pageVisits.forEach(page => {
            const stats = page.dailyStats.find(stat => 
                moment(stat.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
            );
            if (stats) {
                dayStats.visits += stats.visits;
                dayStats.uniqueVisitors += stats.uniqueVisitors;
            }
        });
        
        dailyStats.push(dayStats);
    }
    
    return dailyStats;
}

async function getPageStats() {
    const start = performance.now();
    const cacheKey = 'page_stats';
    
    try {
        // Check cache
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }

        // Get all page visits
        const pageVisits = await PageVisit.find({}).exec();
        
        // Run all calculations in parallel
        const [
            totalVisits,
            deviceStats,
            activeSessions,
            topReferrers,
            dailyStats,
            rankings
        ] = await Promise.all([
            calculateTotalVisits(pageVisits),
            calculateDeviceStats(pageVisits),
            getActiveSessions(pageVisits),
            getTopReferrers(pageVisits),
            getDailyStats(pageVisits),
            getPageRankings()
        ]);

        const result = {
            totalVisits,
            deviceStats,
            activeSessions,
            topReferrers,
            dailyStats,
            ...rankings
        };

        // Cache the result
        cache.set(cacheKey, {
            timestamp: Date.now(),
            data: result
        });

        return result;
    } catch (error) {
        console.error('Error getting page stats:', error);
        throw error;
    } finally {
        const duration = performance.now() - start;
        console.log(`getPageStats took ${duration}ms`);
    }
}

module.exports = {
    getPageStats
};
