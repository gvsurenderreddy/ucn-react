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
var d3 = require('../lib/d3.min');
var WebAPIUtils = require('../utils/WebAPIUtils');
var extend = require('extend');

var CHANGE_EVENT = 'change';
var ActionTypes = Constants.ActionTypes;
var _data, _zoomdata, _urlhistory;

var overlaylocations = false;

var _toggle_locations = function(){
	if (!overlaylocations){
		WebAPIUtils.fetch_locations();
	}else{
		_data.locations = [];
		_zoomdata.locations = [];
		_data.range =  d3.extent(_data.keys, function(d){return d*1000});
		_zoomdata.range =  d3.extent(_zoomdata.keys, function(d){return d*1000});
	}
	overlaylocations = !overlaylocations;
};

var _update_filtered_data = function(range){
 	_zoomdata.range = range;
};

var _update_location_data = function(data){
  _data.locations = data.locations;	
  _zoomdata.locations  = data.locations;
  
  _data.range = data.locations.reduce(function(acc, obj){
  	if (acc[0] > obj.exit*1000){
  		acc[0] = obj.exit*1000;
  	}
  	if (acc[1] < obj.enter*1000){
  		acc[1] = obj.enter*1000;
  	}
  	
  	return acc;
  },_data.range);
};

var _update_raw_url_history_data = function(data){
  _urlhistory  = data.timestamps;
  _data.urlhistory = _urlhistory;
  _zoomdata.urlhistory =_urlhistory;
};

var _update_zoom_data = function(data){
	console.log("---- updating zoom data ----");
	_zoomdata = _format_data(data);
	//set the locations data to whatever it currently is...
	_zoomdata.locations = _data.locations;
	console.log(_zoomdata);
};

var _update_data = function(data){
  _data = _format_data(data);
  _zoomdata = extend({}, _data);
};

_format_data = function(data){

  var keys = Utils.binkeys(data.bin, data.timerange.from, data.timerange.to);

  var _bins = data.binned.reduce(function(acc, item){
      acc[item.host] =  acc[item.host]  || {};
      acc[item.host][item.bin] = item.total;
      return acc;
  },{});

  var hosts = Object.keys(_bins);
	
  //create browsing as:
  //[{name:hostname, values:[{date:javascriptts, y:number},..], name:hostname2, values:[{date:javascriptts, y:number}]];

  var browsing = hosts.map(function(host){
    return {
      name:host,
      //do a data.keys map here and give 0 if no sorresponding entry in data.hosts!
      values: keys.map(function(d){
          //console.log("looking up key " + (d) + " for host " + host);
          return {
            date: d*1000,
            y: _bins[host][d] ? +(_bins[host][d]) : 0
          }
      })
    }
  });


  return {
      keys: keys,
      hosts: hosts,
      browsing: browsing,
      range:  d3.extent(keys, function(d){return d*1000}),
      urlhistory: _urlhistory || []
  }
};

var BrowsingDataStore = assign({}, EventEmitter.prototype, {

  data: function(){
    return _data || {};
  },

  zoomdata: function(){
  	return _zoomdata || _data || {};
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

  var action = action.action;
  
  switch(action.type) {

  	case ActionTypes.RAW_BROWSING_DATA:
      _update_data(action.rawData.browsing);   
      console.log("Browsing: update_data, emitting change");
      BrowsingDataStore.emitChange();
      break;
      
    case ActionTypes.RAW_ZOOM_DATA:
      _update_zoom_data(action.rawData.browsing);
       console.log("Browsing: update_zoom_data, emitting change");
      BrowsingDataStore.emitChange();
	  break;
    
    case ActionTypes.RANGE_CHANGE:
      _update_filtered_data(action.range);
      console.log("Browsing: range change, emitting change");
      BrowsingDataStore.emitChange();
      break;

    case ActionTypes.RAW_URL_HISTORY_DATA:
      _update_raw_url_history_data(action.rawData);
      console.log("Browsing: url hustory, emitting change");
      BrowsingDataStore.emitChange();
      break;	   	
	
	case ActionTypes.RAW_LOCATION_DATA:
      _update_location_data(action.rawData);
      BrowsingDataStore.emitChange();
      break;
     
    case ActionTypes.TOGGLE_LOCATIONS:
      _toggle_locations();
      BrowsingDataStore.emitChange();
      break;
    	 
    default:
      // no op
  }
});

module.exports = BrowsingDataStore;
