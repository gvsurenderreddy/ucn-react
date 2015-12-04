/*
 * Copyright (c) 2015, Tom Lodge
 * All rights reserved.
 *
 * DevicesStore
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');
var WebAPIUtils = require('../utils/WebAPIUtils');
var extend = require('extend');

var CHANGE_EVENT = 'change';
var ActionTypes = Constants.ActionTypes;
var _family = "";
var _devices = [];
var _selected = [];
var _primary;
var _tmp;

_fetch_unclassified = function(){
	WebAPIUtils.fetch_unclassified(_selected);
};

_fetch_categories = function(classifier){
	WebAPIUtils.fetch_category_data(_selected, classifier);
};

_fetch_browsing_in_location = function(lat,lng){
	WebAPIUtils.fetch_browsing_in_location(_family, _selected, lat, lng);
};

_reset = function(){
	WebAPIUtils.fetch_browsing(_family, _selected); 
};

var _fetch_data_in_range = function(range){
	WebAPIUtils.fetch_browsing_range(_family, _selected, {
     	from: Math.floor(range[0]/1000),
      	to: Math.floor(range[1]/1000),
    });  
};

var _update_devices = function(data){
	
	if (data && data.devices && data.selected){
   		_devices = data.devices;
   		_selected = data.selected;
	}else if (_tmp && _tmp.length > 0){
		_selected = extend([], _tmp);
		_tmp = [];
	}
};

var _toggle_device_selected = function(device, screen){
	
	var idx = _selected.indexOf(device);	
	
	_tmp = extend([],_selected);
	
	if (idx == -1){
		_tmp.push(device);
		if (screen==="categories"){
			WebAPIUtils.fetch_category_data(_tmp);
		}else{
			WebAPIUtils.fetch_browsing(_family, _tmp);
		}
	}else{
		if (_selected.length > 1){  //always leave at least one device selected
			_tmp.splice(idx,1);
			if (screen==="categories"){
				WebAPIUtils.fetch_category_data(_tmp);
			}else{
				WebAPIUtils.fetch_browsing(_family, _tmp);
			}
		}
	}
};

var DevicesStore = assign({}, EventEmitter.prototype, {
 
  init: function(){
  
  	var params = location.search.substring(1).split('&').reduce(function(acc, pair){
    	var nv = pair.split("=");
    	acc[nv[0]]=nv[1];
    	return acc;
	},{});
  	
  	_primary = params.device;  
	_devices.push(params.device);
  	_selected.push(params.device);
  	_family = params.device.split(".")[0];
	
	//this kicks off everything!  	
  	WebAPIUtils.fetch_browsing(_family, _selected);
  },

  devices: function(){
    return _devices || [];
  },
	
  selected: function(){
  	return _selected || [];
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
DevicesStore.dispatchToken = AppDispatcher.register(function(action) {

  var action = action.action;
  
  switch(action.type) {

  	case ActionTypes.RAW_BROWSING_DATA:
      	_update_devices(action.rawData);   
      	break;
    
    case ActionTypes.RAW_CATEGORY_DATA:
    	_update_devices();
    	DevicesStore.emitChange();
    	break;
    	
    case ActionTypes.TOGGLE_DEVICE:
    	_toggle_device_selected(action.device, action.screen);
      	break;
    
    case ActionTypes.RANGE_CHANGE:
      _fetch_data_in_range(action.range);
      break;
      
    case ActionTypes.RESET:
      _reset();
      break;
    
    case ActionTypes.LOCATION_SELECTED:
      _fetch_browsing_in_location(action.lat, action.lng);
      break;
    
    case ActionTypes.FETCH_CATEGORIES:
      _fetch_categories(action.classifier)
      break;
    
    case ActionTypes.FETCH_UNCLASSIFIED:
      _fetch_unclassified();
      break;
      
    default:
      // no op
  }
});

module.exports = DevicesStore;
