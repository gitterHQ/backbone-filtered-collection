'use strict';

var _                       = require('underscore');
var Backbone                = require('backbone');
var BackboneProxyCollection = require('backbone-proxy-collection');

var BackboneFilteredCollection = function(attrs, options) {

  Object.defineProperty(this, 'length', {
    get: function() {
      return this._models.length;
    },
  });

  Object.defineProperty(this, 'models', {
    get: function() {
      return this._models
    },
  });

  attrs   = (attrs || {});
  options = (options || {});
  options.dontDefineProps = true;

  if(!attrs.collection) {
    throw new Error('A valid collection must be passed to a new instance of BackboneFilteredCollection');
  }

  var compare = (this.comparator || attrs.comparator);
  if(compare) { attrs.collection.comparator = compare; }

  BackboneProxyCollection.call(this, attrs, options);

  //apply default filtering
  if (this.collectionFilter) {
    this._filter = this.collectionFilter;
    this._applyFilter();
  }

  else {
    this._models = this.collection.models;
  }

  if(this.initialize) { this.initialize.apply(this, arguments); }

};

BackboneFilteredCollection.prototype = _.extend(
  BackboneFilteredCollection.prototype,
  BackboneProxyCollection.prototype, {

  _models: [],
  _filter: null,
  _applyFilter: function() {

    var oldModels = (this._models || []);
    this._models = [];
    for (var index = 0; index < this.collection.length; index++) {
      var model = this.collection.models[index];
      if (this._filter(model, index)) {
        this._models.push(model);
        if((oldModels.indexOf(model) === -1)) {
          //TODO make this more efficient
          if(this.comparator) {
            this._models.sort(this.comparator);
          }
          this.trigger('add', model, this, { index: this._models.indexOf(model)});
        }
      }
      else {
        if((oldModels.indexOf(model) !== -1)) {
          if(this.comparator) {
            this._models.sort(this.comparator);
          }
          this.trigger('remove', model, this, { index: this._models.indexOf(model)});
        }
      }
    }
    this.trigger('filter-complete');
  },

  initialize: function() {},

  _onCollectionEvent: function(type) {
    var args = Array.prototype.slice.apply(arguments);
    var model = args[1];
    var index = this._models.indexOf(model);

    //No filter means we just proxy everything
    if (!this._filter) {
      return BackboneProxyCollection.prototype._onCollectionEvent.apply(this, arguments);
    }

    //only trigger if we are adding a model and it passes the filter
    if (type === 'add') {
      if (this._filter && this._filter(model, index)) {
        this._models.push(model);
        BackboneProxyCollection.prototype._onCollectionEvent.apply(this, arguments);
      }
    }
    //
    else if (type === 'remove') {
      if (this._filter && this._filter(model, index)) {
        this._models.splice(this._models.indexOf(model), 1);
        BackboneProxyCollection.prototype._onCollectionEvent.apply(this, arguments);
      }
    }
    //
    else if (type === 'reset') {
      this._applyFilter();
      BackboneProxyCollection.prototype._onCollectionEvent.apply(this, arguments);
    }
    //
    else if(type === 'change') {
      if (this._filter && this._filter(model, index)) {
        if(index === -1) {
          this._models.push(model);
          this._models = this._models.sort(this.comparator);
        }
        BackboneProxyCollection.prototype._onCollectionEvent.apply(this, arguments);
      }
      else {
        if(index !== -1){
          this._models.splice(index, 1);
          this._models = this._models.sort(this.comparator);
          BackboneProxyCollection.prototype._onCollectionEvent.apply(this, arguments);
        }
      }

    }

    //proxy everything else
    else {
      BackboneProxyCollection.prototype._onCollectionEvent.apply(this, arguments);
    }
  },

  setFilter: function(fn) {
    if(fn) { this._filter = fn; }
    this._applyFilter();
  },

  at: function(index) {
    return !!this._models ?
      this._models[index] :
      this.collection.at.apply(this.collection, arguments);
  },

  getFilter: function() {
    return this._filter;
  },

  sort: function (){
    if(this._models) { this._models.sort(this.comparator);}
    this.collection.sort.apply(this.collection, arguments);
  },

  destroy: function() {
    this.stopListening();
  },

  switchCollection: function(collection){
    if(!collection) { return; }
    this._models = null;
    BackboneProxyCollection.prototype.switchCollection.apply(this, arguments);
    this._applyFilter();
  },

  toArray: function (){
    return this.models;
  },

  toJSON: function(){
    return this.models.map(function(model){
      return model.toJSON();
    });
  },

  filter: function (fn){
    return this._models.filter(fn);
  },

});

module.exports = BackboneFilteredCollection;
