/*global describe:true, it:true, beforeEach:true */
'use strict';

var assert             = require('assert');
var _                  = require('underscore');
var Backbone           = require('backbone');
var Marionette         = require('backbone.marionette');
var FilteredCollection = require('../../index.js');

var ItemView = Marionette.ItemView.extend({
  template: _.template('<% id %>'),
});

var CollectionView = Marionette.CollectionView.extend({
  childView: ItemView
});

var filter = function(model) {
  var id = model.get('id');
  return !(id % 2);
};

describe('Rendering a collection view', function(){

  var collection;
  var _collection;
  var el;
  var view;
  beforeEach(function(){
    _collection = new Backbone.Collection(_.range(100).map(function(i){ return { id: i }; }));
    collection  = new FilteredCollection({ collection: _collection });
    el          = document.createElement('div');
    view = new CollectionView({
      collection: collection,
      el: el
    });

  });

 it('should render', function(){
   collection.setFilter(filter);
   view.render();
   var result = view.el.querySelectorAll('div');
   assert.equal(50, result.length);
 });
});

