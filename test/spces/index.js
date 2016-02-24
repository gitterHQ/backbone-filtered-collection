/*global describe:true, it:true, beforeEach:true */
'use strict';

var assert                     = require('assert');
var Backbone                   = require('backbone');
var BackboneFilteredCollection = require('../../index.js');

describe('BackboneFilteredCollection', function(){

  var collection;
  beforeEach(function(){
    collection = new BackboneFilteredCollection({ id: 1 });
  });

  it('should be an instance of Backbone.Collection', function(){


    assert(collection.length);
    assert(collection.models);
  });

});
