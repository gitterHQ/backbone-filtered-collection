'use strict';

var chalk = require('chalk');

console.log(chalk.cyan('Filtering large initial collections'));
require('./new.js');

console.log(chalk.cyan('Adding items one by one'));
require('./add.js');

console.log(chalk.cyan('Adding items in a batch array'));
require('./batch-add.js');

console.log(chalk.cyan('Removing items one by one'));
require('./remove.js');

console.log(chalk.cyan('Removing items in a batch array'));
require('./batch-remove.js');


console.log(chalk.cyan('Resetting all the models in a collection'));
require('./reset.js');

console.log(chalk.cyan('Resetting some of the models in a collection'));
require('./reset-partial.js');

console.log(chalk.cyan('Library filter comparision'));
require('./libraries.js');
