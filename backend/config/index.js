// configuration for process environment
'use strict';

var env = process.env.NODE_ENV || 'dev';
var path = './' + env + '.js';

console.log(['loaded ', env, ' configuration'].join(''));
module.exports = require(path);