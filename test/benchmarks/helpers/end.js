'use strict';

var compare = require('./compare');
var chalk = require('chalk');
var util = require('util');

module.exports = function end(name, time1, time2){
  var fastest = this.filter('fastest').map('name');
  var percentage = compare(this[1].hz, this[0].hz);
  var formatter = (fastest == 'new') ? chalk.green : chalk.red;
  var msg = util.format('Fastest is %s by %d%%', fastest, percentage);
  msg = formatter(msg);
  console.log(msg);
};
