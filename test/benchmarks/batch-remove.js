'use strict';


var _                  = require('underscore');
var Backbone           = require('backbone');
var Benchmark          = require('benchmark');
var assert             = require('assert');
var FilteredCollection = require('../../index.js');
var lazy               = require('lazy.js');
var lodash             = require('lodash');
var compare            = require('./helpers/compare');

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

global.models = _.range(100).map(function(i) {
  return { id: i };
});

suite.add('old', function() {

  filtered.setFilter(filter);
  collection.remove(global.models);

}, {

  setup: function() {
    collection = new Backbone.Collection(global.models);
    filtered   = new Backbone.FilteredCollection(null, { collection: collection });
    assert.equal(filtered.length, 100);
    assert.equal(collection.length, 100);
  },

  teardown: function() {
    assert.equal(filtered.length, 0);
    assert.equal(collection.length, 0);
    collection.reset();
    filtered.stopListening();
  },

});



suite.add('new', function() {

  filtered.setFilter(filter);
  collection.remove(global.models);

}, {

  setup: function() {
    collection = new Backbone.Collection(global.models);
    filtered   = new global.FilteredCollection({ collection: collection });
    assert.equal(filtered.length, 100);
    assert.equal(collection.length, 100);
  },

  teardown: function() {
    assert.equal(filtered.length, 0);
    assert.equal(collection.length, 0);
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
