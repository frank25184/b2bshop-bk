//./models/Tag.js
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
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
var oepnSouceCatSchema = new Schema({
          //user_id: { type: String, required: true },
          subcategories: [{ type: String}],
          name: { type: String, required: true},
          name_changed: { type: String, required: true},
          intro:  { type: String},
          url:  { type: String},
          hidden: {type: Boolean, default: 'false'},
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

oepnSouceCatSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};

oepnSouceCatSchema.methods.processCategoroy = cate=>{
    return {
        _id:cate._id,
        user_id: cate.user_id,
        name: cate.title,
        name_changed: cate.name_changed,
        intro: cate.intro,
        url: cate.url,
        hidden: cate.hidden,
        created_at: cate.time(cate.created_at),
        updated_at: tacateg.time(cate.updated_at),            
    };
};



// make this available to our users in our Node applications
module.exports = mongoose.model('PromptCategory', oepnSouceCatSchema);