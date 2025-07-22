// ./models/User.js
'use strict';
const mongoose = require('mongoose'),
  bcrypt = require('bcrypt'),
  moment = require('moment'),
  helper = require('../libs/utility'),
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
var feedbackSchema = new Schema({
      feedback: { type: String, required: true,  min: 4 },
      name:  { type: String},
      email: { type: String },
      user: { type: Schema.Types.ObjectId, ref: 'User' }, 
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});//, usePushEach: true

// methods ======================
feedbackSchema.methods.time = time => {
  return moment(time).format('MMMM D,YYYY');
};

feedbackSchema.methods.processfeedback = fb => {
  return {
        _id: fb._id,
        user: fb.user,
        name: fb.name,
        feedback: fb.feedback,
        email: fb.email,
        created_at: user.time(user.created_at),
        updated_at: user.time(user.updated_at),
  };
};



// the schema is useless so far
// we need to create a model using it

// make this available to our users in our Node applications
module.exports = mongoose.model('Feedback', feedbackSchema);
