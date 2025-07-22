const PageVisit = require('../../models/PageVisit');
const moment = require('moment');
const { performance } = require('perf_hooks');

// Constants
const RANKING_LIMIT = 20;
const TREND_THRESHOLD = {
    STRONG_INCREASE: 20,
    STRONG_DECREASE: -20
};

// Cache configuration
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
        throw new Error('Start and end dates are required');
    }
    if (moment(endDate).isBefore(startDate)) {
        throw new Error('End date cannot be before start date');
    }
}

async function getPageRankings(page = 1, limit = RANKING_LIMIT) {
    const start = performance.now();
    const cacheKey = `rankings_${page}_${limit}`;
    
    try {
        // Check cache
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }

        const now = moment();
        const today = moment().startOf('day');
        const startOfWeek = moment().startOf('week');
        const startOfMonth = moment().startOf('month');
        const startOfYear = moment().startOf('year');

        // Validate date ranges
        validateDateRange(startOfYear, now);
        validateDateRange(startOfMonth, now);
        validateDateRange(startOfWeek, now);
        validateDateRange(today, now);

        // Get all page visits
        const pageVisits = await PageVisit.find({}).exec();

        // Calculate rankings for different periods
        const dailyRankings = calculateDailyRankings(pageVisits, today);
        const weeklyRankings = calculateWeeklyRankings(pageVisits, startOfWeek);
        const monthlyRankings = calculateMonthlyRankings(pageVisits, startOfMonth);
        const yearlyRankings = calculateYearlyRankings(pageVisits, startOfYear);

        const result = {
            dailyRankings: dailyRankings.slice((page - 1) * limit, page * limit),
            weeklyRankings: weeklyRankings.slice((page - 1) * limit, page * limit),
            monthlyRankings: monthlyRankings.slice((page - 1) * limit, page * limit),
            yearlyRankings: yearlyRankings.slice((page - 1) * limit, page * limit),
            totalPages: Math.ceil(Math.max(
                dailyRankings.length,
                weeklyRankings.length,
                monthlyRankings.length,
                yearlyRankings.length
            ) / limit)
        };

        // Cache the result
        cache.set(cacheKey, {
            timestamp: Date.now(),
            data: result
        });

        return result;
    } catch (error) {
        console.error('Error getting page rankings:', error);
        throw error;
    } finally {
        const duration = performance.now() - start;
        console.log(`getPageRankings took ${duration}ms`);
    }
}

function calculateDailyRankings(pageVisits, today) {
    const todayStr = today.format('YYYY-MM-DD');
    const yesterdayStr = today.clone().subtract(1, 'day').format('YYYY-MM-DD');

    return pageVisits.map(page => {
        const todayStats = page.dailyStats.find(stat => 
            moment(stat.date).format('YYYY-MM-DD') === todayStr
        ) || { visits: 0 };

        const yesterdayStats = page.dailyStats.find(stat => 
            moment(stat.date).format('YYYY-MM-DD') === yesterdayStr
        ) || { visits: 0 };

        return {
            path: page.url,
            visits: todayStats.visits,
            change: todayStats.visits - yesterdayStats.visits,
            lastVisit: page.activeSessions.length > 0 
                ? Math.max(...page.activeSessions.map(s => s.lastActivityTime))
                : null
        };
    }).sort((a, b) => b.visits - a.visits);
}

function calculateWeeklyRankings(pageVisits, startOfWeek) {
    return pageVisits.map(page => {
        const weekVisits = page.dailyStats
            .filter(stat => moment(stat.date).isSameOrAfter(startOfWeek))
            .reduce((sum, stat) => sum + stat.visits, 0);

        const lastWeekVisits = page.dailyStats
            .filter(stat => 
                moment(stat.date).isBetween(
                    startOfWeek.clone().subtract(1, 'week'),
                    startOfWeek,
                    'day',
                    '[)'
                )
            )
            .reduce((sum, stat) => sum + stat.visits, 0);

        const trend = calculateTrend(weekVisits, lastWeekVisits);

        return {
            path: page.url,
            visits: weekVisits,
            change: weekVisits - lastWeekVisits,
            trend
        };
    }).sort((a, b) => b.visits - a.visits);
}

function calculateMonthlyRankings(pageVisits, startOfMonth) {
    return pageVisits.map(page => {
        const monthVisits = page.dailyStats
            .filter(stat => moment(stat.date).isSameOrAfter(startOfMonth))
            .reduce((sum, stat) => sum + stat.visits, 0);

        const daysInMonth = moment().daysInMonth();
        const avgDaily = Math.round(monthVisits / daysInMonth * 100) / 100;

        const lastMonthVisits = page.dailyStats
            .filter(stat => 
                moment(stat.date).isBetween(
                    startOfMonth.clone().subtract(1, 'month'),
                    startOfMonth,
                    'day',
                    '[)'
                )
            )
            .reduce((sum, stat) => sum + stat.visits, 0);

        return {
            path: page.url,
            visits: monthVisits,
            change: monthVisits - lastMonthVisits,
            avgDaily
        };
    }).sort((a, b) => b.visits - a.visits);
}

function calculateYearlyRankings(pageVisits, startOfYear) {
    return pageVisits.map(page => {
        const yearVisits = page.dailyStats
            .filter(stat => moment(stat.date).isSameOrAfter(startOfYear))
            .reduce((sum, stat) => sum + stat.visits, 0);

        const avgMonthly = Math.round(yearVisits / 12 * 100) / 100;

        const lastYearVisits = page.dailyStats
            .filter(stat => 
                moment(stat.date).isBetween(
                    startOfYear.clone().subtract(1, 'year'),
                    startOfYear,
                    'day',
                    '[)'
                )
            )
            .reduce((sum, stat) => sum + stat.visits, 0);

        return {
            path: page.url,
            visits: yearVisits,
            change: yearVisits - lastYearVisits,
            avgMonthly
        };
    }).sort((a, b) => b.visits - a.visits);
}

function calculateTrend(current, previous) {
    if (previous === 0) return 'new';
    const change = ((current - previous) / previous) * 100;
    if (change > TREND_THRESHOLD.STRONG_INCREASE) return '↑↑';
    if (change > 0) return '↑';
    if (change < TREND_THRESHOLD.STRONG_DECREASE) return '↓↓';
    if (change < 0) return '↓';
    return '→';
}

module.exports = {
    getPageRankings
};
