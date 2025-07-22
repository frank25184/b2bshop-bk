var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var sassMiddleware = require('node-sass-middleware');
const thelogger = require('./src/libs/logger');
const config = require('./src/common/get-config');

const User = require('./src/models/User');  

var app = express();
const passport = require('passport');
require('./src/libs/passport')(passport); // pass passport for configuration
require('./src/libs/mongoose-connect')

require('./src/libs/hbs')(app);

// view engine setup
app.set('views', path.join(__dirname, 'src/views'));
// app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

// const postcssMiddleware = require('postcss-middleware');

// app.use(sassMiddleware({ 
//   src: path.join(__dirname, 'src/public'),
//   dest: path.join(__dirname, 'src/public'),
//   indentedSyntax: false, // true = .sass and false = .scss
//   sourceMap: true,
//   debug: true,
//   outputStyle: 'compressed',
// }));
// const autoprefixer = require('autoprefixer');
// app.use(postcssMiddleware({
//   plugins: [
//     /* Plugins */
//     autoprefixer({
//       /* Options */
//     })
//   ],
//   src: function(req) {
//     return path.join(`${__dirname}src/public`, req.url);
//   }
// }));

app.use(express.static(path.join(__dirname, 'src/public')));
//Flash messages are stored in the session. First, setup sessions as usual by enabling cookieParser and session middleware. Then, use flash middleware provided by connect-flash.With the flash middleware in place, all requests will have a req.flash() function that can be used for flash messages.
const flash    = require('connect-flash');
// redis session starts:
// we can restore any data using req.session and you can get it automatically in every subsequent request from the same client; Express uses memories to store session data so that the session date will be lost if you close your app or the app clashes; so we can use Redis or Mongodb to store the session data;
const session = require('express-session');
// Create express-session and pass it to connect-redis object as parameter. This will initialize it.
const redisStore = require('connect-redis')(session);
// Then in session middle ware, pass the Redis store information such as host, port and other required parameters.
// const client = require('./lib/redis');

// redis session starts:

const client = require('./src/libs/redis');

// const Redis = require("ioredis")
// let client = new Redis() 

app.use(
    session({
      secret: config.session_secret,
      cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days //cookie: { domain:'.yourdomain.com'},
      store: new redisStore({ client: client }),
      saveUninitialized: false,
      resave: false,
    })
)
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// // CSRF Protection
// const { csrfProtection, handleCSRFError } = require('./src/middlewares/csrf');

// // Apply CSRF protection to all routes except those under /api
// app.use((req, res, next) => {
//   if (req.path.startsWith('/api/')) {
//     next();
//   } else {
//     csrfProtection(req, res, next);
//   }
// });

// Handle CSRF errors
//app.use(handleCSRFError);

const env = process.env.NODE_ENV || 'development';
// if(env=="production"){
//   require('./src/libs/helmet')(app);
// }

// app.use(require('./src/libs/limit')(1,20));
require('./src/libs/globalSetting.js')(app);

app.disable('x-powered-by'); //delete x-powered-by

if(env == 'production'){
  // Redirect all HTTP requests to HTTPS
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });

  //require('./src/libs/cron');
}

// //enable CORS for all routes in your application
// const cors = require('cors');
// app.use(cors());
let ip = require('./src/libs/ip');
app.use(ip().getIpInfoMiddleware);

require('./src/routes/routes')(app, passport, User);

require('./src/libs/errors').errors(app);
// require('./data/update-title-changed')();
module.exports = app;
