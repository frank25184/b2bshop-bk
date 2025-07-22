//./models/Post.js
// grab the things we need
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('../models/User'),
      moment = require('moment');

// create a schema
//The allowed SchemaTypes are:
// String
// Number
// Date
// Buffer
// Boolean
// Mixed
// ObjectId
// Array
var errorExistSchema = new Schema({
          project_id: { type: String, required: true},
          author: { type: Schema.Types.ObjectId, ref: 'User'},
          content: { type: String, required: true, min:5 },//,match: /[0-9a-zA-Z_-]/
          accepted: {type: Boolean, default: 'false'},
}, {timestamps:{createdAt: 'created_at', updatedAt: 'updated_at'}});


errorExistSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};

errorExistSchema.methods.processError = err=>{
    return {
        author: err.author,
        project_id: err.post_id,
        content: err.content,   
        accepted: err.accepted,      
        created_at: err.time(err.created_at),
        updated_at: err.time(err.updated_at),     
    };
};




// make this available to our users in our Node applications
module.exports = mongoose.model('errorExist', errorExistSchema);