const rateLimit = require('express-rate-limit')

//min一般设置15-60, max比如5-100
module.exports = function (min, max) {
    const createAccountLimiter = rateLimit({
        windowMs: min * 60 * 1000 || 5, // min minutes   1  1/60
        max: max || 15, // Limit each IP to 5 create account requests per `window` (here, per hour) . 5
        // message:
        //     'Too many trials' + ', please try again later',
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
        delayMs: 0, //不延迟请求处理
        keyGenerator: function(req, res) {
          return req.ip; //基于IP地址对请求分组
        },
        handler: function(req, res /*, next*/) {
          res.status(429).send('Too many trials, please try again later; ');//超过最大请求数后返回429
          
        }

    })

    return createAccountLimiter;
}
// Apply the rate limiting middleware to all requests

//usage：  app.post('/create-account', createAccountLimiter(1,5), (request, response) => {
// 	//...
// })
