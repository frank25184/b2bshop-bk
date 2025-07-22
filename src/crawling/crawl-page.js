const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const captchaDetector = require('../libs/captcha-detect');
const sharp = require('sharp');
const env = process.env.NODE_ENV || 'development';
// Initialize Puppeteer
let browser;  
/**
 * const crawler = require('./crawl-page.js');
// Get HTML content of a page
async function example1() {
const result = await crawler.getHTML(' https://example.com ');
console.log(result.html);
}
// Capture screenshot of a page
async function example2() {
const result = await crawler.captureScreenshot(' https://example.com ', 'example.png');
console.log(`Screenshot saved at: ${result.path}` );
}
 * 
 * **/
class PageCrawler {
  constructor() {
    this.screenshotDir = path.join(__dirname, '../public/upload/sites/thumbnail');
    // Ensure screenshots directory exists
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { 
        recursive: true,
        mode: 0o755 // Explicit permissions for Debian
      });
    }
  }

  async getHTML(url) {
    console.log('getHTML url: ' + url);
    browser = await puppeteer.launch({
      headless: true,
      // executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--ignore-certificate-errors'
      ]
    });  
    const page = await browser.newPage();      
    if (!url) throw new Error('URL is required');
    try {
      await page.setViewport({ width: 1000, height: 800 });
      
      // Inject helper functions for CAPTCHA detection
      await captchaDetector.injectHelpers(page);
      
      // Use CAPTCHA-aware navigation
      let navigationResult;
      try {
        navigationResult = await captchaDetector.handleCaptchaNavigation(page, url, this.screenshotDir);
      } catch (error) {
        console.error('Navigation Error:', error);
        throw new Error(`Failed to load page: ${error.message}`);
      }
      
      // Get the page HTML content
      const html = await page.content();
      console.log('HTML content captured'+ html);
      
      return {
        success: true,
        html: html,
        hasCaptcha: navigationResult.hasCaptcha || false,
        captchaSolved: navigationResult.solved || false
      };
    } catch (error) {
      console.error('HTML capture error:', error);
      throw error;
    }
  }

  async captureScreenshot(url, filename) {
    browser = await puppeteer.launch({
      headless: true,
      // executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--ignore-certificate-errors'
      ]
    });  
    const page = await browser.newPage();  
    if (!url) throw new Error('URL is required');
    try {
      await page.setViewport({ width: 1000, height: 800 });
      
      // Inject helper functions for CAPTCHA detection
      await captchaDetector.injectHelpers(page);
      
      // Use CAPTCHA-aware navigation
      let navigationResult;
      try {
        navigationResult = await captchaDetector.handleCaptchaNavigation(page, url, this.screenshotDir);
      } catch (error) {
        console.error('Navigation Error:', error);
        throw new Error(`Failed to load page: ${error.message}`);
      }
      
      // Generate filename if not provided
      const screenshotFilename = filename || `screenshot-${Date.now()}.png`;
      const screenshotPath = path.join(this.screenshotDir, screenshotFilename);
      
      // If CAPTCHA was detected and handled, use the screenshot from that process
      if (navigationResult.hasCaptcha) {
        console.log(`CAPTCHA detected on ${url}. Solved: ${navigationResult.solved || false}`);
        
        // If CAPTCHA was solved successfully, take a new screenshot
        if (navigationResult.success) {
          await page.screenshot({
            path: screenshotPath,
            delay: 10000,  // 10-second delay
            fullPage: false
          });
        } else {
          // If CAPTCHA couldn't be solved, use the initial screenshot
          fs.copyFileSync(navigationResult.screenshotPath, screenshotPath);
        }
      } else {
        // No CAPTCHA detected, take normal screenshot
        await page.screenshot({
          path: screenshotPath,
          fullPage: false
        });
      }
      const screenshotBuffer = await page.screenshot({ fullPage: false });
      // Rebuild sharp if facing libvips issues: npm rebuild sharp
const compressedBuffer = await sharp(screenshotBuffer)
        .resize({ width: 400, height: 300, fit: 'inside' })
        .jpeg({ quality: 75 })
        .toBuffer();

      fs.writeFileSync(screenshotPath, compressedBuffer);
      console.log(`Screenshot captured and saved as ${screenshotPath}`);
      return {
        success: true,
        filename: screenshotFilename,
        path: screenshotPath,
        hasCaptcha: navigationResult.hasCaptcha || false,
        captchaSolved: navigationResult.solved || false
      };
    } catch (error) {
      console.error('Screenshot capture error:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}

module.exports = new PageCrawler();