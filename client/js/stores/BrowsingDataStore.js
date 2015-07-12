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

var CHANGE_EVENT = 'change';
var ActionTypes = Constants.ActionTypes;
var _data, _filtered,

_update_filtered_data = function(range){
  _filtered.range = range;
},

_update_data = function(data){

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


  _filtered = _data ={
      keys: keys,
      hosts: hosts,
      browsing: browsing,
  }

  _filtered.range = d3.extent(keys, function(d){return d*1000});

};

var BrowsingDataStore = assign({}, EventEmitter.prototype, {

  data(){
    return _data || {};
  },

  filtered(){
    return _filtered || {};
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

  switch(action.type) {

  	case ActionTypes.RECEIVED_RAW_BROWSING_DATA:
      _update_data(action.rawData);
      BrowsingDataStore.emitChange();
      break;

    case ActionTypes.RANGE_CHANGE:
        _update_filtered_data(action.range);
        BrowsingDataStore.emitChange();
        break;

    default:
      // no op
  }
});

module.exports = BrowsingDataStore;
