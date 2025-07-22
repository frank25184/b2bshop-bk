// app/frontend.js
"use strict";
const user = require('./front/user'),
     index = require('./front/index'),
	backend = require('./back/admin'),
	product = require('./front/product'),
	order = require('./front/order'),
	support = require('./front/support'),
	article = require('./front/post'),
	errors = require('./front/errors');
	//env = process.env.NODE_ENV || 'development';

	// const {createProxyMiddleware} = require("http-proxy-middleware");
	 let key = '';

// const User = require('../models/User');

module.exports   = function(app, passport, User) {
	app.use('/', index); 
	app.use('/support', support); 
	app.use('/user',user(app,User,passport));
	app.use('/admin', backend);
	app.use('/product', product);
	app.use('/order', order);
	app.use('/article', article);
    app.use('/errors', errors);
};
