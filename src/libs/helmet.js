'use strict';
// Helmet helps you secure your Express apps by setting various HTTP headers.
const helmet = require('helmet');
const crypto = require('crypto');
module.exports = function (app) {
    // the same as app.set('x-powered-by', false) from: http://expressjs.com/en/api.html#app.disable
    // app.disable('x-powered-by');which helmet includes it

  // app.use(helmet());

  app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
    //res.setHeader('Content-Security-Policy', `script-src 'nonce-${res.locals.cspNonce}'`);
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false
    })
  );

  // Sets all of the defaults, but overrides `script-src` and disables the default `style-src`
  // app.use(
  //   helmet.contentSecurityPolicy({
  //     directives: {
  //     //  "script-src": ["'self'", 'https://cdnjs.cloudflare.com', 'https://code.jquery.com', 'https://cdn.staticfile.org','https://npm.elemecdn.com',"*.google-analytics.com", (req, res) => `'nonce-${res.locals.cspNonce}'`],
  //     // // frameAncestors: ["'none'"],
  //     //  'default-src': ["'self'", "wss://speech.platform.bing.com","wss://iat-api.xfyun.cn","https://speech.platform.bing.com","https://cdn.jsdelivr.net","https://kill136-gpt-proxy.deno.dev","'unsafe-inline'", "'unsafe-eval'", 'blob:']
        

  //     // //default
  //     // // default-src 'self';
  //     // // base-uri 'self';
  //     // // font-src 'self' https: data:;
  //     // // "form-action": ["'self'","https://kill136-gpt-proxy.deno.dev"],
  //     // // frame-ancestors 'self';
  //     // // img-src 'self' data:;
  //     // //object-src 'none';
  //     // //"script-src":["'self'", "cdn.staticfile.org","npm.elemecdn.com",""] // script-src 'self';
  //     // // script-src-attr 'none';
  //     // // style-src 'self' https: 'unsafe-inline';
  //     // // upgrade-insecure-requests

  //     // },






      
  //   })
  // );






};
