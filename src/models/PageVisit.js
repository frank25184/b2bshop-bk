'use strict';
const mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

// Constants
const MAX_ACTIVE_SESSIONS = 1000;
const SESSION_LENGTH = 30 * 60 * 1000; // 30 minute session
const MAX_DAILY_STATS_DAYS = 365; // Keep one year of daily stats

// Session schema for better tracking
const sessionSchema = new Schema({
    sessionId: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    lastActivityTime: { type: Date, default: Date.now },
    deviceType: { 
        type: String, 
        enum: ['mobile', 'tablet', 'desktop'],
        default: 'desktop'
    },
    ipAddress: { type: String, required: true },
    referrer: { type: String },
    userAgent: { type: String }
}, { _id: false });

// Daily stats schema for time-based analytics
const dailyStatsSchema = new Schema({
    date: { type: Date, required: true },
    visits: { type: Number, default: 0, min: 0 },
    uniqueVisitors: { type: Number, default: 0, min: 0 }
}, { _id: false });

// Referrer schema
const referrerSchema = new Schema({
    url: { type: String, required: true },
    count: { type: Number, default: 0, min: 0 }
}, { _id: false });

// Main pageVisit schema
const pageVisitSchema = new Schema({
    // Page Information
    url: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: [2048, 'URL cannot be longer than 2048 characters'],
        unique: true
    },
    title: { 
        type: String,
        trim: true,
        maxlength: [255, 'Title cannot be longer than 255 characters']
    },
    
    // Visit Metrics
    totalVisits: {
        type: Number,
        default: 0,
        min: 0
    },
    deviceStats: {
        mobile: { type: Number, default: 0, min: 0 },
        tablet: { type: Number, default: 0, min: 0 },
        desktop: { type: Number, default: 0, min: 0 }
    },

    // Active sessions (for current visitors)
    activeSessions: {
        type: [sessionSchema],
        default: [],
        validate: {
            validator: function(v) {
                return v.length <= MAX_ACTIVE_SESSIONS;
            },
            message: `Active sessions cannot exceed ${MAX_ACTIVE_SESSIONS}`
        }
    },

    // Daily analytics
    dailyStats: {
        type: [dailyStatsSchema],
        default: []
    },

    // Referrer stats (changed from Map to Array for better MongoDB compatibility)
    referrers: {
        type: [referrerSchema],
        default: []
    }
}, {
    timestamps: { 
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    }
});

// Define indexes
pageVisitSchema.index({ url: 1 }, { unique: true });
pageVisitSchema.index({ 'dailyStats.date': -1 });
pageVisitSchema.index({ 'referrers.url': 1 });

// Virtual for current active visitors
pageVisitSchema.virtual('activeVisitors').get(function() {
    const now = Date.now();
    return this.activeSessions.filter(session => 
        (now - session.lastActivityTime) < SESSION_LENGTH
    ).length;
});

// Helper method to get today's date in UTC
const getTodayUTC = () => {
    return moment().utc().startOf('day').toDate();
};

// Helper method to update referrer stats
pageVisitSchema.methods.updateReferrerStats = function(referrerUrl) {
    if (!referrerUrl) return;
    
    const referrer = this.referrers.find(r => r.url === referrerUrl);
    if (referrer) {
        referrer.count++;
    } else {
        this.referrers.push({ url: referrerUrl, count: 1 });
    }
};

// Methods
pageVisitSchema.statics.recordVisit = async function(visitData) {
    try {
        // Validate input
        if (!visitData?.url || !visitData?.sessionId || !visitData?.ipAddress) {
            throw new Error('Missing required visit data');
        }
        if (!visitData.deviceType || !['mobile', 'tablet', 'desktop'].includes(visitData.deviceType)) {
            visitData.deviceType = 'desktop'; // Default to desktop if invalid
        }

        const now = new Date();
        const today = getTodayUTC();

        // Try to find existing record for this URL
        let pageVisit = await this.findOne({ url: visitData.url });

        if (!pageVisit) {
            // Create new page visit record
            pageVisit = new this({
                url: visitData.url,
                title: visitData.title,
                totalVisits: 1,
                deviceStats: {
                    [visitData.deviceType]: 1
                },
                activeSessions: [{
                    sessionId: visitData.sessionId,
                    startTime: now,
                    lastActivityTime: now,
                    deviceType: visitData.deviceType,
                    ipAddress: visitData.ipAddress,
                    referrer: visitData.referrer,
                    userAgent: visitData.userAgent
                }],
                dailyStats: [{
                    date: today,
                    visits: 1,
                    uniqueVisitors: 1
                }]
            });

            if (visitData.referrer) {
                pageVisit.referrers.push({ url: visitData.referrer, count: 1 });
            }

            await pageVisit.save();
            return pageVisit;
        }

        // Clean up expired sessions
        pageVisit.activeSessions = pageVisit.activeSessions.filter(session =>
            (now - session.lastActivityTime) < SESSION_LENGTH
        );

        // Find or create today's stats
        let dailyStats = pageVisit.dailyStats.find(stat => 
            stat.date.getTime() === today.getTime()
        );

        if (!dailyStats) {
            dailyStats = {
                date: today,
                visits: 0,
                uniqueVisitors: 0
            };
            pageVisit.dailyStats.push(dailyStats);
        }

        // Update session info
        const existingSession = pageVisit.activeSessions.find(s => s.sessionId === visitData.sessionId);
        
        if (existingSession) {
            existingSession.lastActivityTime = now;
            existingSession.deviceType = visitData.deviceType;
        } else {
            // New session
            pageVisit.activeSessions.push({
                sessionId: visitData.sessionId,
                startTime: now,
                lastActivityTime: now,
                deviceType: visitData.deviceType,
                ipAddress: visitData.ipAddress,
                referrer: visitData.referrer,
                userAgent: visitData.userAgent
            });
            dailyStats.uniqueVisitors++;
        }

        // Update metrics
        dailyStats.visits++;
        pageVisit.totalVisits++;
        pageVisit.deviceStats[visitData.deviceType]++;
        pageVisit.updateReferrerStats(visitData.referrer);

        // Cleanup old stats if array is too large
        if (pageVisit.dailyStats.length > MAX_DAILY_STATS_DAYS) {
            pageVisit.dailyStats.sort((a, b) => b.date - a.date);
            pageVisit.dailyStats = pageVisit.dailyStats.slice(0, MAX_DAILY_STATS_DAYS);
        }

        await pageVisit.save();
        return pageVisit;
    } catch (error) {
        console.error('Error recording visit:', error);
        throw error;
    }
};

// Export model
module.exports = mongoose.model('PageVisit', pageVisitSchema);;
