'use strict';

var _                  = require('underscore');
var Backbone           = require('backbone');
var Benchmark          = require('benchmark');
var assert             = require('assert');
var FilteredCollection = require('../../index.js');
var lazy               = require('lazy.js');
var lodash             = require('lodash');

global.Backbone = Backbone;
global._        = _;
global.assert   = assert;

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

function UnderscoreCol() {
  FilteredCollection.apply(this, arguments);
}
UnderscoreCol.prototype = _.extend(UnderscoreCol.prototype, FilteredCollection.prototype, {
  _applyFilter: function() {
    this._models = _.filter(this.collection.models, this._filter);
  },
});
global.UnderscoreCol = UnderscoreCol;

suite.add('underscore', function() {

  filtered.setFilter(filter);
  _.range(100).forEach(function(i) {
    collection.add({ id: i });
  });

}, {

  setup: function() {
    collection = new Backbone.Collection(null);
    filtered   = new global.UnderscoreCol({ collection: collection });
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


function NativeCol() {
  FilteredCollection.apply(this, arguments);
}
NativeCol.prototype = _.extend(NativeCol.prototype, FilteredCollection.prototype, {
  _applyFilter: function() {
    this._models = [];
    for (var i = 0; i < this.collection.length; i++) {
      var model = this.collection.models[i];
      if (this._filter(model)) {
        this._models.push(model);
      }
    }
  },
});
global.NativeCol = NativeCol;

suite.add('native', function() {

  filtered.setFilter(filter);
  _.range(100).forEach(function(i) {
    collection.add({ id: i });
  });

}, {

  setup: function() {
    collection = new Backbone.Collection(null);
    filtered   = new global.NativeCol({ collection: collection });
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

function LazyCol() {
  FilteredCollection.apply(this, arguments);
}
LazyCol.prototype = _.extend(LazyCol.prototype, FilteredCollection.prototype, {
  _applyFilter: function() {
    this._models = lazy(this.collection.models).filter(this._filter).toArray();
  },
});
global.LazyCol = LazyCol;

suite.add('lazy', function() {

  filtered.setFilter(filter);
  _.range(100).forEach(function(i) {
    collection.add({ id: i });
  });

}, {

  setup: function() {
    collection = new Backbone.Collection(null);
    filtered   = new global.LazyCol({ collection: collection });
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

function LodashCol() {
  FilteredCollection.apply(this, arguments);
}
LodashCol.prototype = _.extend(LodashCol.prototype, FilteredCollection.prototype, {
  _applyFilter: function() {
    this._models = lodash.filter(this.collection.models, this._filter);
  },
});
global.LodashCol = LodashCol;

suite.add('lodash', function() {

  filtered.setFilter(filter);
  _.range(100).forEach(function(i) {
    collection.add({ id: i });
  });

}, {

  setup: function() {
    collection = new Backbone.Collection(null);
    filtered   = new global.LodashCol({ collection: collection });
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

suite.on('complete', function(e){
  console.log('Fastest is ' + this.filter('fastest').map('name'));
});

suite.run();
