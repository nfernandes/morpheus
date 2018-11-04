// 
/**
 * configuration for process environment
 * 
 * use the node env defined on dev in case none is defined 
 */
'use strict';

var env = process.env.NODE_ENV || 'dev';
var path = './' + env + '.js';

console.log(['loaded ', env, ' configuration'].join(''));
module.exports = require(path);