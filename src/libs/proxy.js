const https = require('https');

const OPENAI_API_HOST = 'api.openai.com';

const OPENAI_API_KEY = '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';
const fs = require('fs');

// const getForwardedHeaders = (req) => {
//   const { rawHeaders } = req;

//   // Get header names only
//   return rawHeaders.filter((_, i) => i % 2 === 0);
// };

// Configure HTTPS agent options
// const httpsAgent = new https.Agent({
//     rejectUnauthorized: false
// });

function corsMiddleware(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
};

module.exports = function(app){
    app.all('/v1/*',corsMiddleware, async (req, res) => {
        const { method, url, headers,signal,body } = req;
      const path = url.replace('/v1', '');
       console.log(`path: ${path}`)
       console.log(`into /v1/`)


        const options = {
          hostname: OPENAI_API_HOST,
          port: 443,
          path: path,
          method,
          signal,
          headers: {
            ...headers,
            Accept: "text/event-stream",
            'Content-Type': 'application/json',
            //'Content-Length': Buffer.byteLength(JSON.stringify(req.body)),
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            //'X-Forwarded-Host': OPENAI_API_HOST,
            //'X-Forwarded-For': req.connection.remoteAddress,     
            //'X-Forwarded-Proto': req.protocol
            //'Forwarded': req.headers['forwarded']
          },
         // agent: new https.Agent({ rejectUnauthorized: false }),
        };
      
        const apiReq = https.request(options, (apiRes) => {
          if (apiRes.statusCode !== 200) {
            let errorBody = "";
            apiRes.on("data", (chunk) => {
              errorBody += chunk;
            });
            apiRes.on("end", () => {
              if(errorBody){
                console.error(errorBody);
              }
            });
            return;
          }
          
          console.log(`apiRes: ${JSON.stringify(apiRes)}`)
          let apiData = "";
          apiRes.on("data", (chunk) => {
            apiData += chunk;
          });
          res.json(JSON.parse(apiData));
        }
          // res.set(apiRes.headers);
          // apiRes.pipe(res);
          // console.log(`apiRes: ${JSON.stringify(apiRes)}`)
          // res.send(apiRes);
        );
        

        // Write data to request body
        apiReq.write(JSON.stringify(body));

        apiReq.on('error', (error) => {
          console.error(error);
          res.send(`Error: ${error.message.body}`);
        });
      
        apiReq.end(); 
      
});
}




// const { createProxyMiddleware } = require('http-proxy-middleware');


// module.exports = function(app){
//     app.use(
//         '/v1',
//         createProxyMiddleware({
//           target: 'https://api.openai.com',
//           //changeOrigin: true,
//           ws: true, // proxy websockets
//           changeOrigin: true,
//           secure: true,
//           xfwd: true,
//           onProxyReq: (proxyReq, req, res) => {
//             // add custom header to request
//             proxyReq.setHeader('Access-Control-Allow-Origin', '*');
//             // or log the req
//           }
//         })
//       );
// }

// app.use('/api', createProxyMiddleware({ target: 'http://www.example.org', changeOrigin: true }));
// app.listen(3000);

// http://localhost:3000/api/foo/bar -> http://www.example.org/api/foo/bar


