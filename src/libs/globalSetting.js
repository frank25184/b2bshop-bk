module.exports = function(app) {

    app.use(function(req, res, next) {

         /**
         * @withQuery Boolean   
         * @return String url
         */
        req.getUrl = function(withQuery) {
            if(withQuery == true){
                let url = req.protocol + "://" + req.get('host') + req.originalUrl;
               // console.log(`req originalurl: ${url}`);
                
                return url
            }else if(withQuery == false){
                let url = req.protocol + "://" + req.get('host') + req.path;
               // console.log(`req.url: ${url}`);
                
                return url
            }

            //req.url
        }
        return next();
    });

    // app.use((req, res, next) => {
    //     // Add CSRF token to all templates
    //     res.locals.csrfToken = req.csrfToken();
    //     next();
    // });

}
