'use strict';
const fs = require('fs');
const logger = require('./logger');
const https = require('https');
const request = require('request');
const xss = require('xss');


module.exports = {

  // formatDate: function(date) {
  //   return moment(date).format('MMM DD, YYYY');
  // },
  /**generateUUID
   * 
   * **/
  generateUUID: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
/**
 * 将指定属性及其值添加到数组中的每个对象。
 * 
 * @param {Array} arr - 要更新的对象数组。
 * @param {string} propertyName - 要添加的属性名称。
 * @param {*} propertyValue - 要添加的属性值。
 * 
 * 该函数首先检查传入的第一个参数是否为数组。如果不是，则在控制台输出错误信息并返回。
 * 然后，使用 map 方法遍历数组中的每个对象，创建一个新对象，该对象保留原有的属性，并添加指定的属性及其值。
 * 最后，返回更新后的新数组。
 */
  addPropertyToArray:(arr, propertyName, propertyValue)=> {
    // 检查 sites 是否为数组
    if (!Array.isArray(arr)) {
        console.error('The first argument must be an array.');
        return;
    }

    // 使用 map 方法创建一个新数组，将 categoryPopulated 添加到每个元素中
    const updatedSites = arr.map(site => {
        return {
            ...arr, // 保留原有的属性
            [propertyName]: propertyValue // 添加 category 属性
        };
    });

    // 返回更新后的数组
    return updatedSites;
  },
  getFirstLetter: (str) => {
    // Check if the input is a string and not empty
    if (typeof str === 'string' && str.length > 0) {
        return str.charAt(0); // Return the first character
    }
    return ''; // Return an empty string if input is invalid
  },

  removeHTMLTags:  (html) => {
  // Regular expression to match HTML tags
  const tagPattern = /<\/?[^>]+(>|$)/g;
  // Replace HTML entities with a space or empty string
  const entityPattern = /&nbsp;|&lt;|&gt;|&amp;|&quot;|&apos;/g; // Add more entities as needed
  // Remove HTML tags, replace entities, and trim whitespace
  return html
    .replace(tagPattern, '') // Remove HTML tags
    .replace(entityPattern, ' ') // Replace HTML entities
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim(); // Trim leading and trailing whitespace
  },
  isAmazonURL: (url) => {
    // Regular expression to match 'amazon' or 'amzn' in the domain of a URL
    const amazonPattern = /(?:https?:\/\/)?(?:www\.)?(amazon|amzn)\.[a-z]{2,5}(\/|$)/i;
    return amazonPattern.test(url);
  },
  removeBlankFromText: (text) => {
    text = text
      .replace( /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') // 移除字符串开始和结束处的所有空白字符（包括空格、制表符、换行符等）
    return text;
  },
  trimMetaDescription: (description) => {
    const maxLength = 160;
    return description.length > maxLength ? description.substring(0, maxLength) + '...': description;
  },
  // name_changed: (str)=>{
  //   return xss(str).split(' ').join('-');
  // },

  /**
   * 把url "best-tool-for-them"  to "best tool for them"
   * 
 * @str String
 * @return string
 */ 
  urlUnbeautify: (str) => {
    // Step 1: Replace hyphens with spaces
    str = str.replace(/-/g, ' ');
    // Step 2: Trim whitespace from the beginning and end
    str = str.trim();  
    return str;
  },

/**
   * 把url "Best Tool: for Them"  to "best-tool-for-them"
   * 
 * @str String
 * @return string
 */ 
urlBeautify: (str) => {
  function blankExist(str) {
    return str.trim().indexOf(" ") !== -1;
  }
  str = str.trim().toLowerCase();
  if (str.includes(':')) {
    str = str.replace(/\s*[:：]\s*/g, '-');
  }
  if (blankExist(str)) {
    return str.replace(/\s+/g, '-');
  } else {
    return str;
  }
},

/**
   * 把一个string的每个单词的第一个字母大写，'hello world' to 'Hello World'
   * 
 * @str String
 * @return string
 */ 
capitalizeFirstLetterAll: (str) => {
  return str.replace(/\b\w/g, first => first.toUpperCase())
           .replace(/\band\b/g, 'and')
           .replace(/\bto\b/g, 'to')
           .replace(/\bor\b/g, 'or')
           .replace(/\bby\b/g, 'by'); //except "and" 
},
/**
   * 把一个string的第一个字母大写，'hello world' to 'Hello world'
   * 
 * @str String
 * @return string
 */ 
capitalizeFirstLetter: (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
},

/**
   * check if it's a link .
   * for example,console.log(isValidUrl("https://example.com")); // true
                 console.log(isValidUrl("invalid-url")); // false
 * @url String
 * @return true or false
 */  
isValidUrl: (string) => {
  try {
      new URL(string);
      return true;
  } catch (_) {
      return false;
  }
},

/**
   * check if a link is accessible.
   * 
 * @url String
 * @return true or false
 */  
linkAccessible: (url)=>{
  function checkLink(link) {
    return new Promise((resolve, reject) => {
      request(link, (error, response) => {
        if (error) {
          reject(error);
        } else {
          const statusCode = response.statusCode;
          if (statusCode >= 200 && statusCode < 300) {
            // The link is accessible, now check if there is a body element
            const body = response.body;
            if (body.includes('<body')) {
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            // The link is not accessible
            resolve(false);
          }
        }
      });
    });
  }

  return checkLink(url);


},
stringToArray: (str) => {
  let tagsArray = [];
  // str = this.commaSeparatedStringWithNoEmptyValue(str);
  
    if (str && str.includes(',')) {
        const filteredArray = str.split(',').filter(value => value.trim() !== '');
        str = filteredArray.join(',');

        tagsArray = str.split(',');
        console.log(`str: ${str}`)
     } else {
       tagsArray = str ? [str] : []; 
       console.log(`str: ${str}`)
     }

   return tagsArray;
},
/**
   * remove  any leading or trailing spaces from each value of the array.
   * // Output: from [" like it", "it like "] to ["like it", "it like"]
 * @arr Array
 */  
rmArrBlank: (arr)=>{
  const modifiedArray = arr.map(value => value.trim());
  return modifiedArray;
},

/**
   * remove empty values after a comma-separated string
   * // Output: from  " li,ke " to "li,ke"
 * @arr Array
 */  
commaSeparatedStringWithNoEmptyValue: (str)=>{
  const filteredArray = str.split(',').filter(value => value.trim() !== '');
  const result = filteredArray.join(',');
  return result;
},


  /**
   * to know if the user marked the site
 * @str string
 * @num the number of str
 */
  truncateString: (str,num,dot) => {
    if(str){
      if (str.length > num) {
        if(dot){
          return str.slice(0, num) + dot;
        }else{
          return str.slice(0, num);
        }
  
      }
      return str;
    }

  },
  /**
   * to know if the user bookmark the site
 * @user user object
 * @site_id site_id
 */  
  userBookmark: (user,product_id, type) =>{
    let isBookmark = false;
    if(user){
      let userBookmarkArr;
      if(type == 'site'){
        userBookmarkArr = user.sitesBookmark;
      }
      if(userBookmarkArr && userBookmarkArr.length){
        if(userBookmarkArr.includes(product_id)){
          isBookmark = true;
        }
      }
   }
   
   return isBookmark;
  },
  /**
   * to know if the user downvote the site
 * @user user object
 * @site_id site_id
 */  
  userDownvote: (user,product_id, type) =>{
    let isDownvote = false;
    if(user){
      let userDownvoteArr;
      if(type == 'site'){
        userDownvoteArr = user.sitesDownvoted;
      }
      if(userDownvoteArr && userDownvoteArr.length){
        if(userDownvoteArr.includes(product_id)){
          isDownvote = true;
        }
      }
   }
   
   return isDownvote;
  },
  /**
   * to know if the user upvote the site
 * @user user object
 * @site_id site_id
 */
  userUpvote: (user,product_id, type) =>{
    let isUpvote = false;
    if(user){

      let userUpvoteArr;
      if(type == 'site'){
        userUpvoteArr = user.sitesUpvoted;
      }

      if(userUpvoteArr && userUpvoteArr.length){
        if(userUpvoteArr.includes(product_id)){
          isUpvote = true;
        }
      }
   }
   
   return isUpvote;
  },

  /**
   * to know if the user marked the site
 * @user user object
 * @site_id site_id
 */
  userMarkedSite: (user,site_id) =>{
    let markit = false;
    if(user){
      let userMarkedSites = user.markSites;
      if(userMarkedSites){
        if(userMarkedSites.includes(site_id)){
          markit = true;
        }
      }
   }
   
   return markit;
  },

  /**
 * @str Arr of links  get ordered list of social links
 * 
 */
  getSocialLink: (socialLinks) => {
    let discordLink = '';
    let instagramLink = '';
    let twitterLink = '';
    let mailLink = '';
    let facebookLink = '';
    let linkedinLink = '';
    let youtubeLink = '';

  
    // Find the Discord, Instagram, and Twitter links in the socialLinks array
    socialLinks.forEach(link => {
      if (link.includes('mailto')) {
        mailLink = link;
      } else if (link.includes('instagram')) {
        instagramLink = link;
      } else if (link.includes('twitter')) {
        twitterLink = link;
      } else if (link.includes('discord')) {
        discordLink = link;
      } else if (link.includes('facebook')) {
        facebookLink = link;
      } else if (link.includes('linkedin')) {
        linkedinLink = link;
      } else if (link.includes('youtube')) {
        youtubeLink = link;
      }
    });

    return [mailLink,instagramLink,twitterLink,discordLink,facebookLink,linkedinLink,youtubeLink]

  },
  /**
 * @str String  make sure whether the string has a space and 
 * 
 */
 hasSpace: (str) =>{
    // Check if the string contains a space character and that it's not at the beginning or end of the string； console.log(hasSpace(" Hello World ")); // false, because there are spaces at the beginning and end
    return str.includes(" ") && str.trim()[0] !== " " && str.trim()[str.trim().length - 1] !== " ";
  },
  /**
 * @str String  make "Lee Frank" to "LF"
 * 
 */
  acronym: function(str){
    let acronym;
    // Split the phrase into an array of words
    let words;
    if(this.hasSpace(str)){
       words = str.split(' ');
    }else{
      words = [str]
    }
    // Iterate over each word, and add the first character to the acronym string
    for (let i = 0; i < words.length; i++) {
      acronym += words[i].charAt(0);
    }

    // Convert the acronym string to uppercase
    acronym = acronym.toUpperCase();
    return acronym;
  },

  /**
 * @arr Array  turn ["a-b"] to ["A B"]
 * 
 */

  formatStr: function  (str) {
    // split the string into words by hyphen
    const words = str.split('-');
    // capitalize the first letter of each word
    const capitalizedWords = words.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    // join the capitalized words with space
    const formattedStr = capitalizedWords.join(' ');
    // return the formatted string as an array
      return  formattedStr
  },

// /**
//  * @str String  turn "a b" to "a-b"
//  * for name_changed function
//  */

// concatStr: function  (str) {
//   if(this.blankExit(str)){
//     str = str.trim().split(/\s+/).join('-');
//   }else{
//     str = str;
//   }   
//   return str;
// },




  /**
 * @arr Array  turn ["a-b"] to ["A B"]
 * 
 */

  formatArray: function  (arr) {
    // get the array element as string
    const str = arr[0];
    // split the string into words by hyphen
    const words = str.split('-');
    // capitalize the first letter of each word
    const capitalizedWords = words.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    // join the capitalized words with space
    const formattedStr = capitalizedWords.join(' ');
    // return the formatted string as an array
    return [formattedStr];
  },
 
  /**
 * @imageUrl String (img url to download)
 * @filePath String(filePath)
 */
  downloadImage: function (imageUrl, filePath) {
    // Create an HTTP request to the image URL.
    https.get(imageUrl, (response) => {
      // Set up a writable stream to save the image to the file path.
      const fileStream = fs.createWriteStream(filePath);
  
      // When the response stream receives data, write it to the file stream.
      response.on('data', (data) => {
        fileStream.write(data);
      }); 
  
      // When the response stream ends, close the file stream.
      response.on('end', () => {
        fileStream.close();
      });
    });
  },

  /**
 * @min Number (included)
 * @max Number(included)
 */

  getRandomInt: function (min, max) {
    // The Math.floor() function returns the largest integer less than or equal to a given number.
    // The Math.random() function returns a floating-point, pseudo-random number in the range [0, 1)
    // (excluding 1). By multiplying it by (max - min + 1), we get a number in the range [0, max - min].
    // We then add min to shift the range to [min, max].
    return Math.floor(Math.random() * (max - min + 1) + min);
  },


  /**
 * @str String 
 * @return Boolean
 */
blankExit: (str) => {
  str = str.trim();
  if(str.indexOf(" ") == -1){
      return false;
  }else{
      return true;
  }
},
/**
 * param 将要转为URL参数字符串的对象
 * key URL参数字符串的前缀
 * encode true/false 是否进行URL编码,默认为true
 * 
 * return URL参数字符串
 */
 urlEncode: (param, key, encode)=>{
  let globeThis = this;
  if(param==null) return '';
  var paramStr = '';
  var t = typeof (param);
  if (t == 'string' || t == 'number' || t == 'boolean') {
    paramStr += '&' + key + '=' + ((encode==null||encode) ? encodeURIComponent(param) : param);
  } else {
    for (var i in param) {
      var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
      paramStr += urlEncode(param[i], k, encode);
    }
  }
  return paramStr;
 },
 

 /**
  * #Control flow pattern
     series- an async
      @param {Array}callbacks: an array of callback functions
      @param {Function} final: a final function
      you need to provide a function like async(arg,callback) with arg,and clallback with an argument which will be used in the series function to put it to the result array;

    Example

        function async(arg, callback) { //callback  is the next function and arg(after processed) will be passed to the next function
            var delay = Math.floor(Math.random() * 5 + 1) * 100; // random ms
            console.log('async with \''+arg+'\', return in '+delay+' ms');
            setTimeout(function() { callback(arg * 2); }, delay);
        }
        function final(results) { console.log('Done', results); }

        series([
        function(next) { async(1, next); },
        function(next) { async(2, next); },
        function(next) { async(3, next); },
        function(next) { async(4, next); },
        function(next) { async(5, next); },
        function(next) { async(6, next); }
        ], final);
        series(..,function(){...})
        //LOG "Done" [[2],[4],[6],[8],[10],[12]]

        //next is the function:
            function() {
                results.push(Array.prototype.slice.call(arguments));//arguments is the arg*2 value
                next();
            }

  */

  series: (callbacks, last) => {
    var results = [];
    function next () {
      var callback = callbacks.shift();
      if (callback) {
        callback(function () {
          results.push(Array.prototype.slice.call(arguments));
          next();
        });
      } else {
        last(results);
      }
    }
    next();
  },

  inArray: (arr, ele) => {
    return arr.some(function (v) {
      return v === ele;
    });
  },
  getTime: (time = '') => {
    let date;
    if (time === '') {
      date = new Date();
    } else {
      date = new Date(time);// equl to Date.now()
    }

    let year = date.getFullYear(),
      month = date.getMonth(),
      day = date.getDate();

    let getTimes = {
      'year': year,
      'month': month,
      'day': day
    };
    return getTimes;
  },
    /**
     * check if a directory exist! make it if it does not exist
     * @param {String} dir : the directory's name
     * @param {Function} callback: asyn function if checking dir finishes
     * usage: require('./utility.js').checkDir(dataDir);
     */
  checkDir: (dir, callback = function () {}) => {
            // var callback = callback || function(){};
    fs.stat(dir, function (err, stat) {
      if (err == null) {
        logger.debug('Dir Exists');
                    // you still need to rename the file(what the function do) if dir exists,it's a must'
        callback();
        return;
      } else if (err.code == 'ENOENT') {
                    // file does not exist
        logger.debug('no dir exists. Creating it...');
        fs.mkdirSync(dir);

        callback();

                    // since the fs.stat is async so the action should be put here ensuring the dir is actually generated before the real action in the callback happens!
        return;
      } else {
        logger.error('Some other error: ', err.code);
        return;
      }
    });
  },

    /**
     * slugify the url to make it  more beautiful
     * @param {String} url or text
     */
  slugify: text => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
  },

  
  unslugify: text => {
    return text.toString().toLowerCase()
        .replace(/-/g, ' ')        // Replace spaces with -
        .replace(/[^\w\-]+/g, ' ')   // Remove all non-word chars
        .replace(/\-\-+/g, ' ')      // Replace multiple - with single -
        .replace(/^-+/, ' ')          // Trim - from start of text
        .replace(/-+$/, ' ');         // Trim - from end of text
  },

    /**
     *  use generator and promise for asynchronous task running;a function that can call a generator and start the iterator;It calls the generator to create an iterator and stores the iterator in task.
     * @param {Function}: a task definition (a generator function)
     * usage:
     */
  run: taskDef => {
        // create the iterator, make available elsewhere
    let task = taskDef();

        // start the task
    let result = task.next();

        // recursive function to iterate through
    (function step () {
            // if there's more to do
      if (!result.done) {
                // resolve to a promise to make it easy
        let promise = Promise.resolve(result.value);
        promise.then(function (value) {
          result = task.next(value);
          step();
        }).catch(function (error) {
          result = task.throw(error);
          step();
        });
      }
    }());
  },

    /**
     * use es6 set to eliminate duplicates of the array
     * @param {Function}: a task definition (a generator function)
     * usage:
     * let numbers = [1, 2, 3, 3, 3, 4, 5], noDuplicates = eliminateDuplicates(numbers); console.log(noDuplicates); // [1,2,3,4,5]
     */
  eliminateDuplicates: items => [...new Set(items)],

  isMobile: (req) => {
    const ua = req.headers['user-agent'].toLowerCase();
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4))) {
      return true;
    } else {
      return false;
    }
  },
  /**
   * get rid of white space at the beginning or end of the string
   * @param {String}
   **/
  trim: function (str) {
    return str.replace(/(^\s+)|(\s+$)/g, '');
  },

  ObjectIsEmpty: function(obj) {
    for (var k in obj) 
       if (obj.hasOwnProperty(k))
           return false;
    return true;
  } 

};
