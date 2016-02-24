'use strict';

var _                       = require('underscore');
var Backbone                = require('backbone');
var BackboneProxyCollection = require('backbone-proxy-collection');

var BackboneFilteredCollection = function(attrs, options) {

  Object.defineProperty(this, 'length', {
    get: function() {
      return ((this._models && this._models.length) || this.collection.length);
    },
  });

  Object.defineProperty(this, 'models', {
    get: function() {
      return (this._models || this.collection.models);
    },
  });

  options = (options || {});
  options.dontDefineProps = true;
  BackboneProxyCollection.call(this, attrs, options);
};

BackboneFilteredCollection.prototype = _.extend(
  BackboneFilteredCollection.prototype,
  BackboneProxyCollection.prototype, {

  _models: null,
  _filter: null,

  setFilter: function(fn){
    this._filter = fn;
    this._models = this.collection.models.filter(fn);
  },

  at: function(index){
    return !!this._models ?
      this._models[index] :
      this.collection.at.apply(this.collection, arguments);
  },

  getFilter: function (){
    return this._filter;
  },

  add: function (model){
    if(!this._filter) { return this.collection.add.apply(this.collection, arguments); }
    model = new this.collection.model(model);
    if(this._filter(model)) {
      this._models.push(model);
      this.collection.add.apply(this.collection, arguments);
    }
  },

});

module.exports = BackboneFilteredCollection;
