/*
 * Copyright (c) 2015, Tom Lodge
 * All rights reserved.
 *
 * NetworkAccessStore
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var WebAPIUtils = require('../utils/WebAPIUtils');
var BrowsingDataStore = require('./BrowsingDataStore');
var UrlDataStore = require('./UrlDataStore');
var assign = require('object-assign');
var extend = require('extend');
var CHANGE_EVENT = 'change';
var ActionTypes = Constants.ActionTypes;
var _accessingNetwork = WebAPIUtils.accessing_network();
var _url = "";

var _setnetworkaccess = function(value){
	//if (_accessingNetwork != WebAPIUtils.accessing_network()){
  		_accessingNetwork = value;//WebAPIUtils.accessing_network();
  		console.log("caccesisng network is ");
  		console.log(_accessingNetwork);
  			
  	//}
};

var _toggle_url = function(url){
	if (_url !== url){
		_url = url;
		_setnetworkaccess(true);
		NetworkAccessStore.emitChange();
	}else{
		_url = "";
	}
};

var NetworkAccessStore = assign({}, EventEmitter.prototype, {

  accessingNetwork : function(){
  	return _accessingNetwork;
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
NetworkAccessStore.dispatchToken = AppDispatcher.register(function(action) {
	var action = action.action;
 
  	switch(action.type) {
  		
  		case ActionTypes.RANGE_CHANGE:
  			_setnetworkaccess(true);
  			NetworkAccessStore.emitChange();
  			break;
  		
  	    case ActionTypes.URL_CLICKED:
      		_toggle_url(action.url);
      		break;
  			
  				
  		default:
  			_setnetworkaccess(false);
  			NetworkAccessStore.emitChange();
  	}
  		
});

module.exports = NetworkAccessStore;
