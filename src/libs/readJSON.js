"use strict";
const env = process.env.NODE_ENV || 'development';
const config = require(`../../config.${env}.js`);
const logger = require('./logger');
const moment = require('moment');


const utils = require('./utility');

//return array of keys
function read_JSON_Array(JSON_DATA, key){
    //let bulkdata = require(`./${param}.json`);
   // logger.debug(`bulk json: ${JSON.stringify(bulkdata)}`)

   let arrayForJson = JSON.parse(JSON.stringify(JSON_DATA));
   return arrayForJson;
 
}


function read_JSON_Obj(DATA){
    
    var result = [];
    for(var i in DATA)
      result.push([i, DATA [i]]);

    return result;
}




module.exports = {
    read_JSON_Array: read_JSON_Array,
    read_JSON_Obj: read_JSON_Obj
};