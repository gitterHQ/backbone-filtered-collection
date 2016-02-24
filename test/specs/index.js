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

  beforeEach(function() {
    _collection = new Backbone.Collection(_.range(100).map(function(i) {
      return { id: i };
    }));

    collection = new BackboneFilteredCollection({ collection: _collection });
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

  it('should maintain the at function', function(){
    collection.setFilter(filter);
    assert.equal(2, collection.at(1).get('id'));
  });

  it('should save the filter function', function(){
    collection.setFilter(filter);
    assert.equal(collection.getFilter(), filter);
  });

  it('should maintain the add functionality', function(){
    collection.add({ id: 101 });
    assert.equal(101, collection.length);
    assert.equal(collection.length, _collection.length);
  });

  it('should filter after an add', function(){
    collection.setFilter(filter);
    collection.add({ id: 101 });
    assert.equal(50, collection.length);
    collection.add({ id: 102 });
    assert.equal(51, collection.length);
  });

  it('should work when add passes an array', function(){
    collection.setFilter(filter);
    collection.add([
      { id: 101 },
      { id: 102 },
      { id: 103 },
      { id: 104 },
    ]);
    assert.equal(52, collection.length);
  });

  it('should work when you add to the underlying collection', function(){
    collection.setFilter(filter);
    _collection.add([
      { id: 101 },
      { id: 102 },
      { id: 103 },
      { id: 104 },
    ]);
    assert.equal(52, collection.length);
  });

  it('should fire add events when models are added to the underlying collection', function(done){
    collection.on('add', function(){
      assert(true);
      done();
    });
    _collection.add({ id: 202 });
  });

  it('should not fire add events when models are added to the underlying collection whicih should be filtered', function(done){
    collection.setFilter(filter);
    collection.on('add', function(){
      assert(false);
    });
    _collection.add({ id: 201 });
    done();
  });

});
