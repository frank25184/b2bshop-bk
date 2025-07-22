const puppeteer = require('puppeteer');

(async () => {
  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: true, // 无头模式，不显示浏览器窗口
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // 提高兼容性
  });
  const page = await browser.newPage();

  // 设置视口大小（可选，根据需要调整）
  await page.setViewport({ width: 1280, height: 800 });

  // 打开目标网页
  await page.goto('', {
    waitUntil: 'networkidle0' // 等待网络空闲，确保动态内容加载完成
  });

  // 截取整个页面截图
  await page.screenshot({
    path: 'fullpage.png', // 保存路径
    fullPage: true // 捕获整个页面，包括滚动区域
  });

  // 关闭浏览器
  await browser.close();
  console.log('fullpage.png');
})();