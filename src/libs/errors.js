const express = require('express');
const app = express();

// Custom error class
class ErrorHandler extends Error {
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
    }
}

function errors(app){
    // 404 Not Found Handler
    app.use((req, res, next) => {
        const error = new ErrorHandler(404, 'Page Not Found');
        next(error);
    });

    // Centralized Error Handler
    app.use((error, req, res, next) => {
        const status = error.status || 500;
        const message = error.message || 'Something went wrong';
        error.message = error.message || 'Something went wrong';
        
        // Log the error
        console.error(`[${new Date().toISOString()}] ${status} - ${message}`);
        
        let user = req.user;
        let isAdmin = false;
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
        }

        // Respond to the client with a rendered error page
        if (error.status === 404) {
            res.status(404).render('errors/404', {
                error: error,
                seo: {
                    title: `Error 404`,
                    keywords: `errors 404`,
                    description: 'There are 404 errors.'
                },
                user: req.user ? req.user.processUser(req.user) : req.user,
                isAdmin: isAdmin,
            // csrfToken: req.csrfToken(),
                // messages: {
                //     error: req.flash('error'),
                //     success: req.flash('success'),
                //     info: req.flash('info'),
                // }, // get the user out of session and pass to template
            });
        } else {
            res.status(status).render('errors/error', {
                error: message,
                seo: {
                    title: `Errors`,
                    keywords: `errors`,
                    description: 'There are errors.'
                },
                user: req.user ? req.user.processUser(req.user) : req.user,
                isAdmin: isAdmin
             });
        }
    });
}



exports.errors = errors;