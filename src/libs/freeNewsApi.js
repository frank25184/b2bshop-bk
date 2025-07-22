
// Store news articles in database
const currentNews = require('../db_proxy/currentNews');
const axios = require('axios');
const logger = require('../libs/logger');
async function fetchNews24HoursAgo() {
  logger.info('into fetchNews24HoursAgo')
    let key = 'bc3d1e21279748e593b16f2c16263099';
    // Adding required parameters: country and category
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'AI',
          language: 'en',
          sortBy: 'publishedAt',
          excludeDomains: 'douban.com,prtimes.jp,Qiita.com,Pypi.org,EURACTIV,Europython-society.org',
          apiKey: key
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching news:', error.message);
      return { status: 'error', message: error.message };
    }
}
async function init(){
  logger.info('init')
  const news = await fetchNews24HoursAgo(); // 获取新闻的函数
  //console.log(`news: ${JSON.stringify(news)}`);
  let result;
  if (news.status == 'error') {
    //news: {"status":"error","code":"apiKeyInvalid","message":"Your API key is invalid or incorrect. Check your key, or go to https://newsapi.org to create a free API key."}
    logger.error('Error storing news:', news.message);
  } else {
    //console.log( 'news', JSON.stringify(news.articles));
    if(news.articles.length && news.status == 'ok') {
        result = await currentNews.saveNewsAsync(news.articles);
        logger.info(`Stored ${result.count} new articles in database`);
    }
  }
}
init();
// res.setHeader('Content-Type', 'text/event-stream');
// res.setHeader('Cache-Control', 'no-cache');
// res.setHeader('Connection', 'keep-alive');

// 每20分发送新数据
let interval = 1000 * 60 * 20; // 20分钟
//news: {"status":"ok","totalResults":47905,"articles":[{"source":{"id":null,"name":"Gadgets360.com"},"author":"Akash","title":"OpenAI Expands","description":"","url":"","urlToImage":"" ,"publishedAt":"2025-04-01T09:33:35Z","content":""},{...}]
setInterval(async () => {
  init();
  // res.write(`data: ${JSON.stringify(news)}\n\n`);
}, interval);

//req.on('close', () => clearInterval(interval));
// module.exports = function (req,res){

// }


//数据缓存（Redis示例）

// const redis = require('redis');
// const client = redis.createClient();
// async function cacheNews(news) {
//   await client.setEx('latest_news', 10, JSON.stringify(news)); // 缓存10秒
// }



//  前端实现
// <div id="news-container"></div>
// <script>
//   const eventSource = new EventSource('/news-stream');
//   eventSource.onmessage = (e) => {
//     const news = JSON.parse(e.data);
//     document.getElementById('news-container').innerHTML = 
//       news.map(article => `<div class="news-item">${article.title}</div>`).join('');
//   };
// </script> 

// 最佳实践建议
// 性能优化:

// 使用Redis缓存新闻，减少API调用和数据库查询。

// 合并多个新闻条目后推送，而非频繁发送单条。

// 错误处理:

// 添加重试机制（如 axios-retry）。

// 捕获SSE连接中断事件，前端自动重连。

// 安全性:

// 通过环境变量存储API密钥（如 dotenv）。

// 限制新闻API的调用频率，避免超额费用。

// 扩展性:

// 使用消息队列（如RabbitMQ）解耦新闻生成和推送。

// 部署为无服务架构（如AWS Lambda + API Gateway）。






