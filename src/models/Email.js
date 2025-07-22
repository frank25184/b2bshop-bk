// ./models/Email.js
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
var emailSchema = new Schema({
      email: { type: String, required: true,  min: 4 },
      count:  { type: Number, default: 0},
      frequency: { type: String },
      from:  { type: String},
      user: { type: Schema.Types.ObjectId, ref: 'User' }, 
      sent: { type: Boolean, default: false},
      fail:{ type: Boolean, default: false},
      unsubscribe: { type: Boolean, default: false},
      isVerified: { type: Boolean, default: false },
      verificationToken: { type: String },
      verificationExpires: { type: Date },
      verified_at: { type: Date },
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});//, usePushEach: true

// methods ======================
emailSchema.methods.time = time => {
  return moment(time).format('MMMM D,YYYY');
};

emailSchema.methods.processEmail = mail => {

  return {
        _id: mail._id,
        user: mail.user,
        mail: mail.email,
        sent: mail.sent,
        fail: mail.fail,
        frequency: mail.frequency,
        count: mail.count,
        from: mail.from,
        isVerified: mail.isVerified,
        verificationToken: mail.verificationToken,
        verificationExpires: mail.verificationExpires,
        unsubscribe: mail.unsubscribe,
        verified_at: mail.verified_at,
        created_at: mail.time(mail.created_at),
        updated_at: mail.time(mail.updated_at),
  };
};

emailSchema.methods.generateVerificationToken = function() {
    const token = bcrypt.hashSync(this.email + Date.now().toString(), 10).replace(/[\/\+]/g, '');
    this.verificationToken = token;
    this.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return token;
};

// the schema is useless so far
// we need to create a model using it

// make this available to our users in our Node applications
module.exports = mongoose.model('Email', emailSchema);
