const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function compressImage(filePath, options = {}) {
  const {
    width = 800,
    height = 600,
    quality = 75,
    fit = 'inside'
  } = options;

  try {
    const imageBuffer = fs.readFileSync(filePath);
    const compressedBuffer = await sharp(imageBuffer)
      .resize({ width, height, fit })
      .jpeg({ quality })
      .toBuffer();

    fs.writeFileSync(filePath, compressedBuffer);
    return true;
  } catch (error) {
    console.error('Error compressing image:', error);
    return false;
  }
}

module.exports = {
  compressImage
};