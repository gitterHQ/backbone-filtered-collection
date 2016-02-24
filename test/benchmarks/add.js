'use strict';

var _                  = global._          = require('underscore');
var Backbone           = global.Backbone   = require('backbone');
var assert             = require('assert');
var Lazy               = require('lazy');
var Benchmark          = require('benchmark').Suite();
var FilteredCollection = require('../../index.js');

require('../../vendor/backbone-filtered-collection');

var filter = function(model) {
  var id = model.get('id');
  return !(id % 2);
};

var collection            = new Backbone.Collection(null);
var oldFilteredCollection = new Backbone.FilteredCollection(null, { collection: collection });
var newFilteredCollection = new Backbone.FilteredCollection(null, { collection: collection });

Benchmark.add('Old filtering collections by adding models', function() {
  oldFilteredCollection.setFilter(filter);
  _.range(100).forEach(function(i) {
    collection.add({ id: i });
  });
  assert.equal(50, oldFilteredCollection.length);
});

Benchmark.add('New filtering collections by adding models', function() {
  newFilteredCollection.setFilter(filter);
  _.range(100).forEach(function(i) {
    collection.add({ id: i });
  });
  assert.equal(50, newFilteredCollection.length);
});

Benchmark.on('cycle', function(e) {
  console.log(String(e.target));
});

Benchmark.on('error', function(e) {
  console.error(e);
});

Benchmark.run();
