// ./models/User.js
'use strict';
const mongoose = require('mongoose'),
  moment = require('moment'),
  User = require('./User'),
//   helper = require('../libs/utility'),
     // logger = require('./logger'),
  Schema = mongoose.Schema;

// create a schema
// The allowed SchemaTypes are:
// String
// Number
// Date
// Buffer
// Boolean
// Mixed
// ObjectId
// Array
var contactSchema = new Schema({
      message: { type: String, required: true,  min: 4 },
      name:  { type: String},
      email: { type: String },
      user: { type: Schema.Types.ObjectId, ref: 'User' }, 
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});//, usePushEach: true

// methods ======================
contactSchema.methods.time = time => {
  return moment(time).format('MMMM D,YYYY');
};

contactSchema.methods.processContact = fb => {
  return {
        _id: fb._id,
        user: fb.user,
        name: fb.name,
        message: fb.message,
        email: fb.email,
        created_at: fb.time(fb.created_at),
        updated_at: fb.time(fb.updated_at),
  };
};



// the schema is useless so far
// we need to create a model using it

// make this available to our users in our Node applications
module.exports = mongoose.model('Contact', contactSchema);
