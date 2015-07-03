/*
 * Copyright (c) 2015, Tom Lodge
 * All rights reserved.
 *
 * DefaultStore
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';
var ActionTypes = Constants.ActionTypes;
var _clickcount = 0;

var DefaultStore = assign({}, EventEmitter.prototype, {

  clickCount: function(){
    return _clickcount;
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
DefaultStore.dispatchToken = AppDispatcher.register(function(action) {

  switch(action.type) {

  	case ActionTypes.MAIN_CLICKED:
      _clickcount += 1;
      DefaultStore.emitChange();
      break;

    default:
      // no op
  }
});

module.exports = DefaultStore;
