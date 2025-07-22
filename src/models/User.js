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
var userSchema = new Schema({
      username: { type: String, required: true, unique: true },
      username_changed: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true,min: 4 },
      password: { type: String, required: true },//,match: /[0-9a-zA-Z_-]/
      active: {type:Boolean, required: true, default: true },
      logo: {type: String},
      botAllow:{type: Boolean, default: false}, 
      //Properties resetPasswordToken and resetPassword are not part of the above document, because they are set only after password reset is submitted. And since we haven’t specified default values, those properties will not be set when creating a new user.
      resetPasswordToken:  {type: String},
      resetPasswordExpires: {type: Date},
      roles:[String],
      admin: {type: Boolean, default: false},
      isVerified: {type: Boolean, default:false},
      verificationToken:{type: String},
      like: [String],
     // markSites: [String], 
      sitesUpvoted: [{ type: Schema.Types.ObjectId, ref: 'Site' }], 
      sitesDownvoted: [{ type: Schema.Types.ObjectId, ref: 'Site' }],
      sitesBookmark: [{ type: Schema.Types.ObjectId, ref: 'Site' }],
      personalize: {type: Boolean, default:false},
      personalizeDate: { type: Date },
      neVip: {type: Boolean, default:false},
      myGroups: [String],
      likeChannel: [String],
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});//, usePushEach: true

// methods ======================

// generating a hash
userSchema.methods.generateHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
// checking if password is valid

// in arrow-functions , the 'this'' value of the following statement is : window; // or the global object
// as to arrow function inside a function,  it's the this of the outer function
// arrow function expressions are best suited for non-method functions.
userSchema.methods.validPassword = function password(password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.time = time => {
  return moment(time).format('MMMM D,YYYY');
};

userSchema.methods.setPersonalize = async function(value) {
  this.personalize = value;
  if (value) {
      this.personalizeDate = new Date(); // Set the current date when personalize is true
  } else {
      this.personalizeDate = null; // Optionally clear the date if personalize is set to false
  }
  await this.save(); // Save the updated user document
};

userSchema.methods.processUser = user => {
   /**process the roles */
   let roles = user.roles;
   let latestRole;
   let vip = false;

   if(helper.inArray(roles,'Super')){
       latestRole = 'Super Admin';
   }else if(helper.inArray(roles,'Junior')){
       latestRole = 'Junior Admin';
   }else if(helper.inArray(roles,'Yearly')){    
       latestRole = 'Yearly';
   }else if(helper.inArray(roles,'Trial')){
       latestRole = 'Trial';
   }else{
       latestRole = 'Nope';
   }
   if(latestRole!=='Nope'){
       vip = true;
   } 
  let namefirstLetter = helper.getFirstLetter(user.username)
  return {
        _id: user._id,
        username: user.username,
        namefirstLetter: namefirstLetter.toUpperCase(),
        username_changed: user.username_changed,
        email: user.email,
        logo: user.logo,

        admin: user.admin,
        active: user.active,   
        botAllow: user.botAllow,
        
        like: user.like,
        sitesUpvoted: user.sitesUpvoted,
        sitesDownvoted: user.sitesDownvoted,
        sitesBookmark: user.sitesBookmark,
        verificationToken:user.verificationToken,
        isVerified: user.isVerified,
        neVip: user.neVip,
        myGroups: user.myGroups,
       roles: user.roles,
       latestRole: latestRole,
       vip: vip,
       personalizeDate: user.personalizeDate,
        likeChannel: user.likeChannel,
        personalize:user.personalize,
        created_at: user.time(user.created_at),
        updated_at: user.time(user.updated_at),
  };
};

// the schema is useless so far
// we need to create a model using it

// make this available to our users in our Node applications
module.exports = mongoose.model('User', userSchema);
