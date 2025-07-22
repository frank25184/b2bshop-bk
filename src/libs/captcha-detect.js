/**
 * CAPTCHA Detection and Solving Module
 * 
 * This module provides functionality to detect and solve CAPTCHAs on websites
 * during the crawling process. It uses dynamic detection of CAPTCHA elements
 * and Tesseract.js for OCR-based CAPTCHA solving.
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Tesseract = require('tesseract.js');
const fs = require('fs').promises;
const path = require('path');

// Apply stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

// Configuration for known CAPTCHA patterns on specific sites
const siteConfig = {
  // Example configurations - expand as needed
  'cloudflare.com': {
    captchaImageSelector: 'img.cf-captcha-image',
    captchaInputSelector: 'input.cf-captcha-input',
    captchaSubmitSelector: 'button.cf-captcha-submit'
  },
  'recaptcha.net': {
    captchaImageSelector: 'img.rc-image-tile-33',
    captchaInputSelector: 'input.rc-response-input',
    captchaSubmitSelector: 'button.rc-button-default'
  },
  'hcaptcha.com': {
    captchaImageSelector: 'img.challenge-image',
    captchaInputSelector: 'input.challenge-input',
    captchaSubmitSelector: 'button.challenge-submit'
  }
  // Add more domains and selectors as needed
};

/**
 * Detects CAPTCHA elements on a page
 * @param {Object} page - Puppeteer page object
 * @param {String} domain - Domain of the website being crawled
 * @returns {Object} - Object containing CAPTCHA element information
 */
async function detectCaptchaElements(page, domain) {
  // Helper function to check if a string contains CAPTCHA-related keywords
  const hasCaptchaKeyword = (str) => {
    if (!str) return false;
    const keywords = ['captcha', 'verify', 'verification', 'challenge', 'security', 'robot', 'human'];
    return keywords.some(keyword => str.toLowerCase().includes(keyword));
  };

  // Detect CAPTCHA image
  async function findCaptchaImage() {
    // Look for images with CAPTCHA-related attributes
    const images = await page.$$('img');
    for (const img of images) {
      try {
        const src = await img.evaluate(el => el.src || '');
        const className = await img.evaluate(el => el.className || '');
        const id = await img.evaluate(el => el.id || '');
        const alt = await img.evaluate(el => el.alt || '');
        const width = await img.evaluate(el => el.width || el.naturalWidth || 0);
        const height = await img.evaluate(el => el.height || el.naturalHeight || 0);
        const isVisible = await img.evaluate(el => {
          const style = window.getComputedStyle(el);
          return el.offsetParent !== null && style.display !== 'none' && style.visibility !== 'hidden';
        });

        // Check for CAPTCHA keywords in attributes and ensure image is visible and reasonably sized
        if ((hasCaptchaKeyword(src) || hasCaptchaKeyword(className) || 
             hasCaptchaKeyword(id) || hasCaptchaKeyword(alt)) &&
            width > 50 && width < 500 && height > 20 && height < 400 && isVisible) {
          return { element: img, src };
        }
      } catch (error) {
        console.error('Error analyzing image element:', error);
      }
    }

    // Look for canvas elements (some CAPTCHAs use canvas)
    const canvases = await page.$$('canvas');
    for (const canvas of canvases) {
      try {
        const id = await canvas.evaluate(el => el.id || '');
        const className = await canvas.evaluate(el => el.className || '');
        const width = await canvas.evaluate(el => el.width || 0);
        const height = await canvas.evaluate(el => el.height || 0);
        const isVisible = await canvas.evaluate(el => {
          const style = window.getComputedStyle(el);
          return el.offsetParent !== null && style.display !== 'none' && style.visibility !== 'hidden';
        });

        if ((hasCaptchaKeyword(id) || hasCaptchaKeyword(className)) &&
            width > 50 && width < 500 && height > 20 && height < 400 && isVisible) {
          // For canvas, we'll need to take a screenshot
          const dataUrl = await canvas.evaluate(el => {
            try {
              return el.toDataURL('image/png');
            } catch (e) {
              return null;
            }
          });
          if (dataUrl) {
            return { element: canvas, src: dataUrl };
          }
        }
      } catch (error) {
        console.error('Error analyzing canvas element:', error);
      }
    }

    // Look for iframe-based CAPTCHAs (like reCAPTCHA)
    const iframes = await page.$$('iframe');
    for (const iframe of iframes) {
      try {
        const src = await iframe.evaluate(el => el.src || '');
        const title = await iframe.evaluate(el => el.title || '');
        const name = await iframe.evaluate(el => el.name || '');
        const id = await iframe.evaluate(el => el.id || '');
        
        if (hasCaptchaKeyword(src) || hasCaptchaKeyword(title) || 
            hasCaptchaKeyword(name) || hasCaptchaKeyword(id)) {
          return { element: iframe, src, isIframe: true };
        }
      } catch (error) {
        console.error('Error analyzing iframe element:', error);
      }
    }

    return null;
  }

  // Detect CAPTCHA input field
  async function findCaptchaInput() {
    const inputs = await page.$$('input[type="text"], input:not([type]), input[type="number"], textarea');
    for (const input of inputs) {
      try {
        const name = await input.evaluate(el => el.name || '');
        const id = await input.evaluate(el => el.id || '');
        const className = await input.evaluate(el => el.className || '');
        const placeholder = await input.evaluate(el => el.placeholder || '');
        const ariaLabel = await input.evaluate(el => el.getAttribute('aria-label') || '');
        const isVisible = await input.evaluate(el => {
          const style = window.getComputedStyle(el);
          return el.offsetParent !== null && style.display !== 'none' && style.visibility !== 'hidden';
        });

        // Check for CAPTCHA keywords in attributes and ensure input is visible
        if ((hasCaptchaKeyword(name) || hasCaptchaKeyword(id) || 
             hasCaptchaKeyword(className) || hasCaptchaKeyword(placeholder) ||
             hasCaptchaKeyword(ariaLabel)) && isVisible) {
          return input;
        }
      } catch (error) {
        console.error('Error analyzing input element:', error);
      }
    }
    return null;
  }

  // Detect CAPTCHA submit button
  async function findCaptchaSubmit() {
    const buttons = await page.$$('button, input[type="submit"], input[type="button"], a.button, div[role="button"]');
    for (const button of buttons) {
      try {
        const text = await button.evaluate(el => el.textContent || el.value || '');
        const className = await button.evaluate(el => el.className || '');
        const id = await button.evaluate(el => el.id || '');
        const ariaLabel = await button.evaluate(el => el.getAttribute('aria-label') || '');
        const isVisible = await button.evaluate(el => {
          const style = window.getComputedStyle(el);
          return el.offsetParent !== null && style.display !== 'none' && style.visibility !== 'hidden';
        });

        // Check for CAPTCHA or submit-related keywords in attributes
        if ((hasCaptchaKeyword(className) || hasCaptchaKeyword(id) || hasCaptchaKeyword(ariaLabel) ||
             /submit|verify|continue|next|proceed/i.test(text)) && isVisible) {
          return button;
        }
      } catch (error) {
        console.error('Error analyzing button element:', error);
      }
    }
    return null;
  }

  try {
    // Try dynamic detection
    const captchaImage = await findCaptchaImage();
    const captchaInput = await findCaptchaInput();
    const captchaSubmit = await findCaptchaSubmit();

    // Fallback to site-specific config if detection fails
    const config = siteConfig[domain] || {};

    return {
      hasCaptcha: !!captchaImage,
      captchaImageSelector: captchaImage ? await page.evaluate(el => {
        return cssPath(el);
      }, captchaImage.element).catch(() => config.captchaImageSelector) : config.captchaImageSelector,
      captchaInputSelector: captchaInput ? await page.evaluate(el => {
        return cssPath(el);
      }, captchaInput).catch(() => config.captchaInputSelector) : config.captchaInputSelector,
      captchaSubmitSelector: captchaSubmit ? await page.evaluate(el => {
        return cssPath(el);
      }, captchaSubmit).catch(() => config.captchaSubmitSelector) : config.captchaSubmitSelector,
      captchaImageElement: captchaImage?.element,
      captchaImageSrc: captchaImage?.src,
      captchaInputElement: captchaInput,
      captchaSubmitElement: captchaSubmit,
      isIframe: captchaImage?.isIframe || false
    };
  } catch (error) {
    console.error('Error in CAPTCHA detection:', error);
    return {
      hasCaptcha: false,
      captchaImageSelector: null,
      captchaInputSelector: null,
      captchaSubmitSelector: null,
      captchaImageElement: null,
      captchaImageSrc: null,
      captchaInputElement: null,
      captchaSubmitElement: null,
      isIframe: false
    };
  }
}

/**
 * Solves a CAPTCHA image using Tesseract OCR
 * @param {String} imagePath - Path to the CAPTCHA image file
 * @returns {String|null} - Extracted CAPTCHA text or null if failed
 */
async function solveCaptchaImage(imagePath) {
  try {
    // Configure Tesseract for better CAPTCHA recognition
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      { 
        logger: info => console.log(`Tesseract progress: ${info.status} (${Math.floor(info.progress * 100)}%)`),
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' 
      }
    );

    // Clean up the extracted text
    const cleanedText = text.replace(/[^a-zA-Z0-9]/g, '').trim();
    console.log('Extracted CAPTCHA text:', cleanedText);
    return cleanedText;
  } catch (error) {
    console.error('Error processing CAPTCHA with Tesseract:', error);
    return null;
  }
}

/**
 * Handles CAPTCHA detection and solving during page navigation
 * @param {Object} page - Puppeteer page object
 * @param {String} url - URL of the page being navigated to
 * @param {String} screenshotDir - Directory to save screenshots and CAPTCHA images
 * @returns {Object} - Object containing navigation result and CAPTCHA information
 */
async function handleCaptchaNavigation(page, url, screenshotDir) {
  try {
    // Extract domain for site-specific config
    const domain = new URL(url).hostname;
    
    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Take a screenshot before CAPTCHA detection
    const initialScreenshotPath = path.join(screenshotDir, `initial-${Date.now()}.png`);
    await page.screenshot({ path: initialScreenshotPath, fullPage: true });
    
    // Detect CAPTCHA elements
    const captchaInfo = await detectCaptchaElements(page, domain);
    
    // If no CAPTCHA detected, return success
    if (!captchaInfo.hasCaptcha) {
      return { success: true, hasCaptcha: false, screenshotPath: initialScreenshotPath };
    }
    
    console.log(`CAPTCHA detected on ${url}`);
    
    // Handle iframe-based CAPTCHAs
    if (captchaInfo.isIframe) {
      console.log('Iframe-based CAPTCHA detected, cannot solve automatically');
      return { 
        success: false, 
        hasCaptcha: true, 
        captchaType: 'iframe',
        screenshotPath: initialScreenshotPath 
      };
    }
    
    // Download CAPTCHA image if available
    if (captchaInfo.captchaImageSrc) {
      const imagePath = path.join(screenshotDir, `captcha-${domain}-${Date.now()}.png`);
      
      // Handle data URLs (from canvas elements)
      if (captchaInfo.captchaImageSrc.startsWith('data:')) {
        const base64Data = captchaInfo.captchaImageSrc.split(',')[1];
        await fs.writeFile(imagePath, Buffer.from(base64Data, 'base64'));
      } else {
        // Navigate to image URL and save buffer
        const imageBuffer = await page.goto(captchaInfo.captchaImageSrc)
          .then(res => res.buffer())
          .catch(() => null);
          
        if (imageBuffer) {
          await fs.writeFile(imagePath, imageBuffer);
        } else {
          // Take screenshot of the image element as fallback
          await captchaInfo.captchaImageElement.screenshot({ path: imagePath });
        }
        
        // Navigate back to original page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      }
      
      // Solve CAPTCHA
      const captchaText = await solveCaptchaImage(imagePath);
      
      if (captchaText && captchaInfo.captchaInputElement) {
        // Enter CAPTCHA solution
        await captchaInfo.captchaInputElement.type(captchaText, { delay: 100 });
        
        // Submit CAPTCHA form
        if (captchaInfo.captchaSubmitElement) {
          await captchaInfo.captchaSubmitElement.click();
          
          // Wait for navigation after submission
          await page.waitForNavigation({ timeout: 60000 }).catch(() => {});  // Extended to 60 seconds
          
          // Take final screenshot
          const finalScreenshotPath = path.join(screenshotDir, `final-${Date.now()}.png`);
          await page.screenshot({ path: finalScreenshotPath, fullPage: true });
          
          return { 
            success: true, 
            hasCaptcha: true, 
            solved: true,
            screenshotPath: finalScreenshotPath 
          };
        }
      }
      
      return { 
        success: false, 
        hasCaptcha: true, 
        solved: false,
        screenshotPath: initialScreenshotPath 
      };
    }
    
    return { 
      success: false, 
      hasCaptcha: true, 
      screenshotPath: initialScreenshotPath 
    };
  } catch (error) {
    console.error('Error in CAPTCHA navigation:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to get CSS selector path for an element
// This function needs to be injected into the page context
function cssPath(el) {
  if (!(el instanceof Element)) return;
  const path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += '#' + el.id;
      path.unshift(selector);
      break;
    } else {
      let sib = el, nth = 1;
      while (sib = sib.previousElementSibling) {
        if (sib.nodeName.toLowerCase() === selector) nth++;
      }
      if (nth !== 1) selector += ":nth-of-type("+nth+")";
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
}

// Add the cssPath function to the page context
async function injectHelpers(page) {
  await page.evaluate(() => {
    window.cssPath = function(el) {
      if (!(el instanceof Element)) return;
      const path = [];
      while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) {
          selector += '#' + el.id;
          path.unshift(selector);
          break;
        } else {
          let sib = el, nth = 1;
          while (sib = sib.previousElementSibling) {
            if (sib.nodeName.toLowerCase() === selector) nth++;
          }
          if (nth !== 1) selector += ":nth-of-type("+nth+")";
        }
        path.unshift(selector);
        el = el.parentNode;
      }
      return path.join(" > ");
    };
  });
}

module.exports = {
  detectCaptchaElements,
  solveCaptchaImage,
  handleCaptchaNavigation,
  injectHelpers
};