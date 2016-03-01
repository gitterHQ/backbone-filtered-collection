/*global describe:true, it:true, beforeEach:true */
'use strict';

var assert                     = require('assert');
var Backbone                   = require('backbone');
var _                          = require('underscore');
var BackboneFilteredCollection = require('../../index.js');

describe('BackboneFilteredCollection', function() {

  var collection;
  var _collection;
  var filter = function(model) {
    return !(model.get('id') % 2);
  };

  var compare = function() { return 0; };

  beforeEach(function() {
    _collection = new Backbone.Collection(_.range(100).map(function(i) {
      return { id: i };
    }));

    collection = new BackboneFilteredCollection({ collection: _collection, comparator: compare });
  });

  it('should not filter if no filter is provided', function() {
    assert.equal(_collection.length, collection.length);
    assert.deepEqual(_collection.models, collection.models);
  });

  it('should filter the collection when setFilter is called', function() {
    collection.setFilter(filter);
    assert.equal(50, collection.length);
    assert.equal(50, collection.models.length);
  });

  it('should maintain the at function', function() {
    collection.setFilter(filter);
    assert.equal(2, collection.at(1).get('id'));
  });

  it('should save the filter function', function() {
    collection.setFilter(filter);
    assert.equal(collection.getFilter(), filter);
  });

  it('should maintain the add functionality', function() {
    collection.add({ id: 101 });
    assert.equal(101, collection.length);
    assert.equal(collection.length, _collection.length);
  });

  it('should filter after an add', function() {
    collection.setFilter(filter);
    collection.add({ id: 101 });
    assert.equal(50, collection.length);
    collection.add({ id: 102 });
    assert.equal(51, collection.length);
  });

  it('should work when add passes an array', function() {
    collection.setFilter(filter);
    collection.add([
      { id: 101 },
      { id: 102 },
      { id: 103 },
      { id: 104 },
    ]);
    assert.equal(52, collection.length);
  });

  it('should work when you add to the underlying collection', function() {
    collection.setFilter(filter);
    _collection.add([
      { id: 101 },
      { id: 102 },
      { id: 103 },
      { id: 104 },
    ]);
    assert.equal(52, collection.length);
  });

  it('should fire add events when models are added to the underlying collection', function(done) {
    collection.on('add', function() {
      assert(true);
      done();
    });

    _collection.add({ id: 202 });
  });

  it('should not fire add events when models are added to the underlying collection which should be filtered', function(done) {
    collection.setFilter(filter);
    collection.on('add', function() {
      assert(false);
    });

    _collection.add({ id: 201 });
    done();
  });

  it('should remove models from the collection', function() {
    collection.setFilter(filter);
    collection.remove(collection.at(0));
    assert.equal(collection.length, 49);
  });

  it('should remove an array of models', function() {
    collection.setFilter(filter);
    collection.remove([collection.at(0), collection.at(1), collection.at(2)]);
    assert.equal(collection.length, 47);
  });

  it('should remove models when they are removed from the underlying collection', function() {
    collection.setFilter(filter);
    _collection.remove(collection.at(0));
    assert.equal(collection.length, 49);
    assert.equal(_collection.length, 99);
  });

  it('should remove models when they are removed from the underlying collection', function() {
    collection.setFilter(filter);
    _collection.remove([collection.at(0), collection.at(1), collection.at(2)]);
    assert.equal(collection.length, 47);
    assert.equal(_collection.length, 97);
  });

  it('should reset properly', function() {
    collection.setFilter(filter);
    collection.reset();
    assert.equal(0, collection.length);
    assert.equal(0, _collection.length);
  });

  it('should obay the default collection filter', function() {
    var TestCollection = function() { BackboneFilteredCollection.apply(this, arguments); };

    TestCollection.prototype = _.extend(TestCollection.prototype, BackboneFilteredCollection.prototype, { collectionFilter: filter });
    collection = new TestCollection({ collection: _collection });
    assert.equal(50, collection.length);
  });

  it('should emit a filter-complete event after filtering', function(done) {
    collection.on('filter-complete', function() {
      assert(true);
      done();
    });

    collection.setFilter(filter);
  });

  it('should call initialize on an extended collection', function(done) {
    var Collection = function() { BackboneFilteredCollection.apply(this, arguments); };

    Collection.prototype = _.extend(Collection.prototype, BackboneFilteredCollection.prototype, {
      initialize: function(attrs, options) {
        assert(attrs);
        assert(attrs.collection);
        assert(options);
        done();
      },
    });
    var c = new Collection({ collection: _collection }, {});
  });

  it('should call an error if no collection is called', function(done) {
    try { new BackboneFilteredCollection(); }
    catch (e) {
      assert.equal(e.message, 'A valid collection must be passed to a new instance of BackboneFilteredCollection');
      done();
    }
  });

  it('should maintain the comparator', function() {
    assert.equal(compare, _collection.comparator);
  });

  it('should just refilter if no filter function is applied', function() {
    collection.setFilter(filter);
    assert.equal(50, collection.length);
    collection.setFilter();
    assert.equal(50, collection.length);
  });

  it('should react to change events', function() {
    collection.setFilter(filter);
    assert.equal(50, collection.length);
    collection.at(0).set('id', 301);
    collection.at(1).set('id', 303);
    collection.at(2).set('id', 305);
    collection.at(3).set('id', 307);
    collection.at(4).set('id', 309);
    assert.equal(45, collection.length);
  });

  it('should proxy change events', function(done) {

    collection.on('change', function() {
      assert(true);
      done();
    });

    collection.setFilter(filter);
    assert.equal(50, collection.length);
    collection.at(0).set('id', 301);

  });

  it('should not proxy change events on models that have been filtered', function(done) {

    collection.on('change', function() {
      assert(false);
    });

    collection.setFilter(filter);
    assert.equal(50, collection.length);
    _collection.get(1).set('id', 301);
    done();

  });

  it('should sort the collection', function(){
    collection.comparator = function(a, b){
      return a.get('id') < b.get('id') ? -1 : 1;
    };
    collection.setFilter(filter);

    collection.reset(_collection.models.slice().reverse());
    collection.sort();
    var model = collection.models[0];
    assert.equal(0, model.get('id'));
    model = collection.models[1];
    assert.equal(2, model.get('id'));

  });

  it('should obey resetWith', function(){
    collection.setFilter(filter);
    var secondCollection = new Backbone.Collection(_.range(50).map(function(i){
      return { id: (200 + i) };
    }));
    collection.switchCollection(secondCollection);
    assert.equal(25, collection.length);
  });

});
