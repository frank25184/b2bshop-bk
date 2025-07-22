const Crawler = require('crawler');
const logger =  require('./logger');

const c = new Crawler({
    maxConnections: 10,
    // This will be called for each crawled page

    callback: (error, res, done) => {
        if (error) {
            logger.error(error);

        } else {
            const $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log($('body').text());
        }
        done();
    }
});

function returnData(url){
    // Queue URLs with custom callbacks & parameters
    c.queue([{
        uri: url,
        //jQuery: false,

        // The global callback won't be called
        callback: (error, res, done) => {
            if (error) {
                console.log(error);
                
            } else {
                console.log('Grabbed', res.body);
                
                return res
            }
            done(res);
        }
    }]);


}


module.exports = returnData;