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
  _applyFilter: function(){
    this._models = [];
    for(var i = 0; i < this.collection.length; i++) {
      var model = this.collection.models[i];
      if(this._filter(model)) {
        this._models.push(model);
      }
    }
  },

  _onCollectionEvent: function (type){
    var args = Array.prototype.slice.apply(arguments);
    var model = args[1];

    //No filter means we just proxy everything
    if(!this._filter) {
      return BackboneProxyCollection.prototype._onCollectionEvent.apply(this, arguments);
    }

    //only trigger if we are adding a model and it passes the filter
    if(type === 'add') {
      if(this._filter && this._filter(model)){
        this._models.push(model);
        BackboneProxyCollection.prototype._onCollectionEvent.apply(this, arguments);
      }
    }

    else if(type === 'remove') {
      if(this._filter && this._filter(model)){
        this._models.splice(this._models.indexOf(model), 1);
      }
    }

    //proxy everything else
    else {
      BackboneProxyCollection.prototype._onCollectionEvent.apply(this, arguments);
    }
  },

  setFilter: function(fn){
    this._filter = fn;
    this._applyFilter();
  },

  at: function(index){
    return !!this._models ?
      this._models[index] :
      this.collection.at.apply(this.collection, arguments);
  },

  getFilter: function (){
    return this._filter;
  },

  destroy: function (){
    this.stopListening();
  },

});

module.exports = BackboneFilteredCollection;
