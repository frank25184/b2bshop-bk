"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      util = require('../libs/utility'),
      moment = require('moment');

// Create schema for current news articles
const currentNewsSchema = new Schema({
    source: {
        id: { type: String },
        name: { type: String, required: true }
    },
    author: { type: String },
    title: { type: String, required: true },
    title_changed: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    image: { type: String },
    publishedAt: { type: Date, required: true },
    content: { type: String },
    aiSummary: { type: String },
    hidden: { type: Boolean, default: false },
    pv: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Format time using moment.js
currentNewsSchema.methods.time = time => {
    return moment(time).format('MMMM D, YYYY');
};
// Process news article data
currentNewsSchema.methods.processNews = article => {
    return {
        _id: article._id,
        source: article.source,
        author: article.author,
        title: article.title,
        title_changed: article.title_changed,
        description: article.description,
        url: article.url,
        image: article.image,
        publishedAt: article.time(article.publishedAt),
        content: article.content,
        aiSummary: article.aiSummary,
        pv: article.pv,
        hidden: article.hidden,
        created_at: article.time(article.created_at),
        updated_at: article.time(article.updated_at)
    };
};

// Export the model
module.exports = mongoose.model('CurrentNews', currentNewsSchema);