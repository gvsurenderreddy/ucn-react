/*
 * Copyright (c) 2015, Tom Lodge
 * All rights reserved.
 *
 * BrowsingDataStore
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var Utils = require('../utils/Utils');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';
var ActionTypes = Constants.ActionTypes;
var _timerange, _bin, _data, _keys,

_update_data = function(data){
  _timerange = data.timerange;
  _bin = data.bin;
  _data = data.binned;
  _keys = Utils.binkeys(_bin, _timerange.from, _timerange.to);
};

var BrowsingDataStore = assign({}, EventEmitter.prototype, {

  data(){
    return{
      timerange: this.timerange(),
      browsing: this.browsing(),
      bin: this.bin(),
      keys: this.keys()
    }
  },
  
  browsing(){
    return _data || {};
  },

  timerange(){
    return _timerange || {};
  },

  bin(){
    return _bin || -1
  },

  keys(){
    return _keys || [];
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

// Register callback to handle all updates
BrowsingDataStore.dispatchToken = AppDispatcher.register(function(action) {
  console.log("seen an action");
  console.log(action);

  switch(action.type) {

  	case ActionTypes.RECEIVED_RAW_BROWSING_DATA:
      _update_data(action.rawData);
      BrowsingDataStore.emitChange();
      break;

    default:
      // no op
  }
});

module.exports = BrowsingDataStore;
