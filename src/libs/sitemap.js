const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');
const { Readable } = require('stream');
const Product = require('../models/Product');

let sitemap;

module.exports = function(router){
    router.get('/sitemap.xml',async  function(req, res) {
        res.header('Content-Type', 'application/xml');
        res.header('Content-Encoding', 'gzip');
        // if we have a cached entry send it
        if (sitemap) {
          res.send(sitemap)
          return
        }
      
        try {
          console.log('generating...')
          const smStream = new SitemapStream({ hostname: 'https://minshengmedical.com' })

          const pipeline = smStream.pipe(createGzip())

          let tools =  await Product.find({}).exec();
          for(let i=0;i<tools.length;i++){
            let tool = tools[i];
            smStream.write({ url: `/product/${tool.pathName}`, changefreq: 'weekly', priority: 0.8 }); 
          }   
      
          // cache the response
          streamToPromise(pipeline).then(sm => sitemap = sm)
          // make sure to attach a write stream such as streamToPromise before ending
          smStream.end()
          // stream write the response
          pipeline.pipe(res).on('error', (e) => {throw e})
        } catch (e) {
          console.error(e)
          res.status(500).end()
        }
      })
}
