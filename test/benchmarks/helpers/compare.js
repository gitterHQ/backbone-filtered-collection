'use strict';

module.exports = function compare(a, b) {
  var diff;
  if (a > b) {
    diff = a - b;
    return (diff / b * 100).toFixed();
  }
  if (a == b) {
    return 'the same';
  }
  diff = b - a;
  return (diff / a * 100).toFixed();
};
