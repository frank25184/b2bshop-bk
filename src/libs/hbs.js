'use strict';
const exphbs = require('express-handlebars');
const blocks = {};
const config = require('../common/get-config');
var logger = require('./logger');
var util = require('./utility');
const moment = require('moment');

//短暂解决方案
//From version 4.6.0 on, Handlebars forbids accessing prototype properties and methods of the context object by default. The reason are various security issues that arise from this possibility.
//https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
// Handlebars.allowPrototypeAccess = allowInsecurePrototypeAccess;
//const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const insecureHandlebars = allowInsecurePrototypeAccess(exphbs)

const baseUrl = config.host;
const maps = function (name) {
  return baseUrl + '/src/public' + name;// in order to be fast ,  '/' should be added before name
};

module.exports = function (app) {
	// Create `ExpressHandlebars` instance with a default layout.
  var hbs = exphbs.create({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'main',
    helpers: {
      /**
       * JSON.stringify
       */
      JSON2String: (context) => {
        return JSON.stringify(context);
      },
      /**
       * JSON.stringify
       */
      json: (context) => {
        return JSON.stringify(context || []);
      },
      /**
       * 格式化日期
       */
      formatDate: (date) =>{
          if (!date) return '';
          return moment(date).format('MMM DD, YYYY');
      },
      /**
       * 从一个string里提取数字
       * 
       * @str String
       * @return Number String
     */ 
      extractNumber: (str) =>{
        return str.replace(/\D+/g, '');
      },
      /**
       * 把一个string的所有html tag去除
       * 
       * @str String
       * @return string
     */ 
      removeHTMLTags: (str) => {
        return util.removeHTMLTags(str);
      },
      truncateString: (str, num, dot) => {
        return util.truncateString(str, num,dot);
      },

    /**
       * 把一个string的第一个字母大写，'hello world' to 'Hello world'
       * 
     * @str String
     * @return string
     */ 
      capitalizeFirstLetterAll:  (str) => {
        return util.capitalizeFirstLetterAll(str);
      },
      /**
       * @arr String
       * Converts ["ac bc"] to ["ac-bc"]
       */
      concatStr: (str) => {
        return util.concatStr(str);
      },
      /**
       * @arr String   "frank lee" to "FL"
       * 
       */
      acronym: (str) => {
        return util.acronym(str);
      },
      /**
       * @arr String
       * Converts ["ac-bc"] to ["Ac Bc"]
       */
      changeBB: (str) => {
        return util.formatStr(str);
      },
      extend: (name, context) => {
        var block = blocks[name];
        if (!block) {
          block = blocks[name] = [];
        }
        block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
      },
      block: (name) => {
        var val = (blocks[name] || []).join('\n');

        // clear the block
        blocks[name] = [];
        return val;
      },
      static: (name) => {
        return maps(name);
      },
      math: (lvalue, operator, rvalue) => {
        // 如果是比较操作符，使用 compare 辅助函数的逻辑
        const compareOperators = ['>', '>=', '<', '<=', '==', '===', '!=', '!=='];
        
        if (compareOperators.includes(operator)) {
          const operators = {
            '>': (a, b) => a > b,
            '>=': (a, b) => a >= b,
            '<': (a, b) => a < b,
            '<=': (a, b) => a <= b,
            '==': (a, b) => a == b,
            '===': (a, b) => a === b,
            '!=': (a, b) => a != b,
            '!==': (a, b) => a !== b
          };
          
          const a = parseFloat(lvalue);
          const b = parseFloat(rvalue);
          return operators[operator](a, b);
        }
        
        // 数学运算
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        let value;
        
        switch (operator) {
          case '+':
            value = lvalue + rvalue;
            break;
          case '-':
            value = lvalue - rvalue;
            break;
          case '*':
            value = lvalue * rvalue;
            break;
          case '/':
            value = lvalue / rvalue;
            break;
          case '%':
            value = lvalue % rvalue;
            break;
          case 'max':
            value = Math.max(lvalue, rvalue);
            break;
          case 'min':
            value = Math.min(lvalue, rvalue);
            break;
          default:
            logger.info('Do not support the operator: ' + operator);
            value = lvalue; // 返回原值
        }
        return value;
      },




      /*https://github.com/fmvilas/swagger-node-codegen/blob/a8ef8c2f82fd1e84039c07c856e3a9dddf161b45/lib/helpers/handlebars.js#L69*/
        /**
   * Compares two values.
   */
      equal:  (lvalue, rvalue, options) => {
        // if (arguments.length < 3)
        //   throw new Error('Handlebars Helper equal needs 2 parameters');
        if (lvalue!=rvalue) {
          return options.inverse(this);
        }
      
        return options.fn(this);
      },


      /**
       * Checks if a string matches a RegExp.
       */
      match: (lvalue, rvalue, options) => {
        // if (arguments.length < 3)
        //   throw new Error('Handlebars Helper match needs 2 parameters');
        if (!lvalue.match(rvalue)) {
          return options.inverse(this);
        }

        return options.fn(this);
      },

      /**
       * Provides different ways to compare two values (i.e. equal, greater than, different, etc.)
       */
      compare: function() {
        // 处理参数
        const args = Array.prototype.slice.call(arguments);
        const options = args[args.length - 1];
        const operator = args.length === 4 ? args[1] : '==';
        const lvalue = args[0];
        const rvalue = args.length === 4 ? args[2] : args[1];
        
        const operators = {
          '==':       (l,r) => l == r,
          '===':      (l,r) => l === r,
          '!=':       (l,r) => l != r,
          '<':        (l,r) => l < r,
          '>':        (l,r) => l > r,
          '<=':       (l,r) => l <= r,
          '>=':       (l,r) => l >= r,
          'typeof':   (l,r) => typeof l == r
        };

        if (!operators[operator]) {
          throw new Error(`Handlebars Helper 'compare' doesn't support the operator: ${operator}`);
        }

        const result = operators[operator](lvalue, rvalue);

        // 如果是块级辅助函数
        if (options && options.fn) {
          return result ? options.fn(this) : (options.inverse ? options.inverse(this) : '');
        }
        
        // 内联辅助函数直接返回比较结果
        return result;
      },

      /**
       * Capitalizes a string.
       */
      capitalize: (str) => {
        return _.capitalize(str);
      },

      /**
       * Converts a string to its camel-cased version.
       */
      camelCase: (str) => {
        return _.camelCase(str);
      },


      /**
       * Converts a multi-line string to a single line.
       */
      inline: (str) => {
        return str ? str.replace(/\n/g, '') : '';
      },
      
      /**
       * Generate an array of numbers from start to end (inclusive)
       * @param {number} start - Start number
       * @param {number} end - End number
       * @return {Array} Array of numbers from start to end
       */
      range: (start, end) => {
        const result = [];
        start = parseInt(start);
        end = parseInt(end);
        
        if (start <= end) {
          for (let i = start; i <= end; i++) {
            result.push(i);
          }
        } else {
          for (let i = start; i >= end; i--) {
            result.push(i);
          }
        }
        
        return result;
      },
      
      /**
       * Truncate a string to a specified length and add an ellipsis
       * @param {string} str - The string to truncate
       * @param {number} length - Maximum length of the string
       * @param {string} [suffix='...'] - Optional suffix to add when truncated
       * @return {string} Truncated string
       */
      truncate: (str, length, options) => {
        if (typeof str !== 'string') return '';
        
        // Handle the case where length is passed as a string
        const maxLength = parseInt(length);
        const suffix = options && options.hash && options.hash.suffix ? options.hash.suffix : '...';
        
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + suffix;
      }

    },

    // Uses multiple partials dirs, templates in "shared/templates/" are shared
    // with the client-side of the app (see below).
    partialsDir: [
      //'shared/templates/',
      'src/views/partials/'
    ],
    layoutsDir: 'src/views/layouts'    
  });

	// Register `hbs` as our view engine using its bound `engine()` function.
  app.engine('handlebars', hbs.engine);
	// This view engine adds back the concept of "layout", which was removed in Express 3.x. It can be configured with a path to the layouts directory, by default it's set to "views/layouts/".
  app.set('view engine', 'handlebars');
};
