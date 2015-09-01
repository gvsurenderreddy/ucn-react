/*
 * Copyright (c) 2015, Tom Lodge
 * All rights reserved.
 *
 * ActivityDataStore
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var Utils = require('../utils/Utils');
var assign = require('object-assign');
var d3 = require('../lib/d3.min');

var CHANGE_EVENT = 'change';
var ActionTypes = Constants.ActionTypes;
var _data,

var _update_filtered_data = function(range){
  _data.range = range;
};

var _update_data = function(data){

};

var ActivityDataStore = assign({}, EventEmitter.prototype, {

  data: function(){
    return _data || {};
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
ActivityDataStore.dispatchToken = AppDispatcher.register(function(action) {

  var action = action.action;
 
  switch(action.type) {

  	case ActionTypes.RAW_ACTIVITY_DATA:
  	 	console.log("Activity store --- received activity data!!");
  	 	console.log(action.rawData);
      	_update_data(action.rawData);
      	ActivityDataStore.emitChange();
      	break;

    case ActionTypes.RANGE_CHANGE:
      	_update_filtered_data(action.range);
      	ActivityDataStore.emitChange();
      	break;

    default:
      // no op
  }
});

module.exports = ActivityDataStore;
