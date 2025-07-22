const fetch = require('node-fetch');
const Site = require('../models/Site');
const mongoose = require('mongoose');
const siteProxy = require('../db_proxy/site');
const SiteCategory = require('../models/SiteCategory');
const SiteStageCategory = require('../models/SiteStageCategory');
const logger = require('../libs/logger');

class AIProjectGenerator {
  constructor() {
    this.grokApiKey = process.env.GROK_API_KEY;
    this.grokApiEndpoint = 'https://api.x.ai/v1/chat/completions';
  }
  async generateReview(keyword, options = {}) {
    try {
      const prompt = this.buildPrompt(keyword);
      const response = await this.callGrokApi(prompt);
      const siteData = await this.processResponse(response);
      return await this.saveSiteData(siteData, options);
    } catch (error) {
      logger.error('Error generating review:', error);
      throw error;
    }
  }

  buildPrompt(keyword) {
    return {
      model: 'grok-2',
      messages: [{
        role: 'system',
        content: `You are an SEO specialist - confident, witty, and technically brilliant. Your task is to create unique, engaging review posts ranking highly on search engines while maintaining a natural, human-like writing style.`
      }, {
        role: 'user',
        content: `Research and analyze ${keyword} reviews from at least 3 authoritative sources. Create a comprehensive review that provides unique insights and valuable information for readers. Ensure the response is a VALID JSON object with all keys and string values enclosed in double quotes, no trailing commas, no unescaped characters and no extra words before the generated JSON object. The JSON structure EXAMPLE: {"name":"Product Name","Intro":"<p>Introduction content</p>","what": "<p>Product description</p>", "Sum": "<p>Summary content</p>", "Pro": ["pro1", "pro2"], "Cons": ["con1", "con2"], "Unique": ["feature1", "feature2"], "seo-intro": "SEO description within 160 characters"}`
      }],
      temperature: 0.7,
      max_tokens: 2000
    };
  }

  async callGrokApi(prompt) {
    if (!this.grokApiKey) {
      throw new Error('Grok API key is not configured');
    }

    const response = await fetch(this.grokApiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.grokApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(prompt)
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async processResponse(response) {
    console.log("response.choices[0].message: "+ JSON.stringify(response.choices[0].message));
    const reviewData = JSON.parse(response.choices[0].message.content);
    return {
      name: reviewData.name,
      name_changed: reviewData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brief: `<h3>Introduction</h3>${reviewData.Intro}<h3>What Does It Do</h3>${reviewData.what}<h3>Summary</h3>${reviewData.Sum}`,
      intro: reviewData['seo-intro'],
      features: reviewData.Unique,
      pros: reviewData.Pro,
      cons: reviewData.Cons,
      seoKeyword: reviewData.name,
      seoTitle: `${reviewData.name}`,
      seoDescription: reviewData['seo-intro']
    };
  }

  async saveSiteData(data, options = {}) {
    try {
      // Handle categories - support both IDs and names
      if (options.category) {
        console.log(`options.category: ${options.category}`)
        const categoryIds = await Promise.all(
          options.category.map(async cat => {
            if (mongoose.Types.ObjectId.isValid(cat)) {
              return mongoose.Types.ObjectId(cat);
            }
            const catId = await siteProxy.getCategoryIdByName(cat, SiteCategory);
            return catId;
            // || mongoose.Types.ObjectId('66d7086e2b698b772ce5a111'); // Default if not found
          })
        );
        data.categories = categoryIds;
      } else {
       // data.categories = [mongoose.Types.ObjectId('66d7086e2b698b772ce5a111')];
       console.log("no categories");
      }
      // Handle subcategories
      if (options.subcategory && Array.isArray(options.subcategory)) {
        data.subcategories = options.subcategory.map(id => mongoose.Types.ObjectId(id));
      } else {
        console.log("no subcategories");
      }

      // Handle stage categories - support both IDs and names
      if (options.stageCategory) {
        const stageCategoryIds = await Promise.all(
          options.stageCategory.map(async cat => {
            if (mongoose.Types.ObjectId.isValid(cat)) {
              return mongoose.Types.ObjectId(cat);
            }
            const catId = await siteProxy.getCategoryIdByName(cat, SiteStageCategory);
            return catId;
            // || mongoose.Types.ObjectId('67415359ed6cbd94eea94895'); // Default if not found
          })
        );
        data.stageCategories = stageCategoryIds;
      } else {
       // data.stageCategories = [mongoose.Types.ObjectId('67415359ed6cbd94eea94895')];
       console.log("no stage categories");
      }

      // Handle stage subcategories
      data.stageSubcategories = options.stageSubcategory;
      //? options.stageSubcategories.map(id => mongoose.Types.ObjectId(id)) : [mongoose.Types.ObjectId('67e3c4548ed745740adf3b9d')];

      // Set author and user_id
      data.author = options.author ? 
        mongoose.Types.ObjectId(options.author) :
        mongoose.Types.ObjectId('64465f7bb5e8bb8be7bd3f98');
      data.user_id = options.user_id || '64465f7bb5e8bb8be7bd3f98';
      data.websiteUrl = options.websiteUrl;
      data.availability = options.availability;
      data.pricingModel= options.pricingModel;
      data.platform = options.platform || 'web';
      data.trialAvailable = options.trialAvailable;
      data.priceCurrent = options.priceCurrent;
      data.startingPrice = options.startingPrice;
      data.isAIAgent = options.isAIAgent;
      logger.info("data: "+ JSON.stringify(data));

      data.imgs = [];

      const site = new Site(data);
      return await site.save();
    } catch (error) {
      console.error('Error saving site data:', error);
      throw error;
    }
  }
}

module.exports = new AIProjectGenerator();