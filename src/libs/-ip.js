//attention:  module doesn't work

const axios = require('axios')

// //for jsonp
// axios.defaults.headers['Content-Type'] = 'application/vnd.api+json';
// axios.defaults.headers['Accept'] = 'application/vnd.api+json';

// require request-ip and register it as middleware
var requestIp = require('request-ip');

module.exports = function (app) {
    app.use(requestIp.mw())
    
    app.use(function(req, res,next) {
        // by default, the ip address will be set on the `clientIp` attribute
        var ip = req.clientIp;
        console.log(`ip ${ip}`) ///

        axios.get(`http://ip-api.com/json/${ip}?fields=520191&lang=en`).then(function (response) {
            console.log('in get')
            console.log(`responese.country in getting ip : ${response.country}`);
            req.country = response.country || ''

            next()
        })
        .catch(function (error) {
          console.log('error '+error);
          throw new Error(error)
        });

        
    });
}










console.log('aobve get')



// Make a request for a user with a given ID


