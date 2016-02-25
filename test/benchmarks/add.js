'use strict';

var _                  = require('underscore');
var Backbone           = require('backbone');
var Benchmark          = require('benchmark');
var assert             = require('assert');
var FilteredCollection = require('../../index.js');
var lazy               = require('lazy.js');
var lodash             = require('lodash');

global.Backbone           = Backbone;
global._                  = _;
global.assert             = assert;
global.FilteredCollection = FilteredCollection;

require('../../vendor/backbone-filtered-collection');

var filter  = global.filter  = function(model) {
  var id = model.get('id');
  return !(id % 2);
};

var suite = Benchmark.Suite();

var collection;
var filtered;

suite.add('old', function() {

  filtered.setFilter(filter);
  _.range(100).forEach(function(i) {
    collection.add({ id: i });
  });

}, {

  setup: function() {
    collection = new Backbone.Collection(null);
    filtered   = new Backbone.FilteredCollection(null, { collection: collection });
    assert.equal(filtered.length, 0);
    assert.equal(collection.length, 0);
  },

  teardown: function() {
    assert.equal(filtered.length, 50);
    assert.equal(collection.length, 100);
    collection.reset();
    filtered.stopListening();
  },

});



suite.add('new', function() {

  filtered.setFilter(filter);
  _.range(100).forEach(function(i) {
    collection.add({ id: i });
  });

}, {

  setup: function() {
    collection = new Backbone.Collection(null);
    filtered   = new global.FilteredCollection({ collection: collection });
    assert.equal(filtered.length, 0);
    assert.equal(collection.length, 0);
  },

  teardown: function() {
    assert.equal(filtered.length, 50);
    assert.equal(collection.length, 100);
    collection.reset();
    filtered.stopListening();
  },

});



//RUN THE SUITE
suite.on('cycle', function(e) {
  console.log(String(e.target));
});

suite.on('error', function(e){
  console.log(e.target.error);
});

suite.on('complete', require('./helpers/end'));

suite.run();
