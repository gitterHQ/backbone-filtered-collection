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

var collection = new Backbone.Collection(_.range(100).map(function(i) {
  return { id: i };
}));

assert.equal(100, collection.length);

Benchmark.add('Old filtering collections on init', function() {
  var oldFilteredCollection = new Backbone.FilteredCollection(null, { collection: collection });
  oldFilteredCollection.setFilter(filter);
  assert.equal(50, oldFilteredCollection.length);
});

Benchmark.add('New filtering collections on init', function() {
  var newFilteredCollection = new FilteredCollection({ collection: collection });
  newFilteredCollection.setFilter(filter);
  assert.equal(50, newFilteredCollection.length);
});

Benchmark.on('cycle', function(e) {
  console.log(String(e.target));
});

Benchmark.on('error', function(e) {
  console.error(e);
});

Benchmark.run();
