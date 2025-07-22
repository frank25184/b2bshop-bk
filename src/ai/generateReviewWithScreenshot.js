const AIProjectGenerator = require('./ai-projects');
const PageCrawler = require('../crawling/crawl-page');
const Site = require('../models/Site');

async function generateReviewWithScreenshot(keyword, url, options = {}) {
  try {
    options.websiteUrl = url;
    // Generate the AI review with provided categories
    const reviewData = await AIProjectGenerator.generateReview(keyword, options);
    
    // After review is generated, capture screenshot if URL is provided
    if (url) {
      const screenshotResult = await PageCrawler.captureScreenshot(
        url,
        `${Date.now()}-${reviewData.name_changed}.jpg`
      );
      
      // Update the review data with screenshot info
      await Site.findByIdAndUpdate(reviewData._id, {
        $push: { imgs: screenshotResult.filename }
      });
      
      console.log(`Screenshot captured and saved to database: ${screenshotResult.path}`);
    }
    
    return reviewData;
  } catch (error) {
    console.error('Error in generateReviewWithScreenshot:', error);
    throw error;
  }
}

// Example usage
// generateReviewWithScreenshot('AI Image Generator', 'https://example-ai-tool.com')
//   .then(result => console.log('Review generated:', result))
//   .catch(error => console.error('Error:', error));

module.exports = { generateReviewWithScreenshot };

//how to use: 
// generateReviewWithScreenshot('AI Tool Name', ' https://example.com ', { categories: ['categoryId1'], subcategories: ['subCategoryId1'], stageCategories: ['stageCategoryId1'], stageSubcategories: ['stageSubCategoryId1'] }).