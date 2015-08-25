/*
 * Copyright (c) 2015, Tom Lodge
 * All rights reserved.
 *
 * CategoryStore
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/Constants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';
var ActionTypes = Constants.ActionTypes;
var _parentfor = {};
var _nodefor = {};
var _totalsize = 0;
var _data = {};
var _selectednode = null;
var _urls = [];
var _categorymatches = [];
var _urlmatches = [];

var _updatecategorymatches = function(matches){
    _categorymatches = matches;
};

var _updateurlmatches = function(matches){
    _urlmatches = matches;
};

var _node_selected = function(node){
  _urls = node.urls || [];
};

var _updatetree = function(data){
    var _tree = _buildtree(data);
    _data = {name:"browsing", size:_totalsize, children:_tree};
};

var _buildtree = function(data){

     _totalsize = 0;
    var _tree = {};

    data.forEach(function(node){
        var size = node.ts.split(",").length;
        var ts = node.ts.split(",");
        var tld = node.tld.split(",");

        _totalsize += size;

        //var parent = node;
        var lastkey;
        //can either be a sub of
        node.classification.forEach(function(key){

            //var parent = parentfor[key] //if this node already has a parent

            //if node has been seen before
            var n = _nodefor[key];

            if (n) { //if this node has been seen before.
                n.size += size;
                n.urls.concat(tld);
                n.ts.concat(ts);
            }
            else if (lastkey){ //add as child to previous node if one exists
                _createnewparent(lastkey, key, node.ts, node.tld);
            }
            else{ //this is a brand new node
                _createroot(_tree, key, node.ts, node.tld);
            }
            lastkey = key;
        });
    });

    //now need to turn all children objects into arrays for format required by d3
   
    var arraytree = _convertchildrentoarrays(_tree);

    return Object.keys(arraytree).map(function(key){
      return arraytree[key];
    });
};

var _createnewparent = function(parentkey, key, ts, tld){
  //will have already added tlds,size to this node
  ts = ts.split(",");
  tld = tld.split(",");

  var parent = _nodefor[parentkey];
  parent.children = parent.children || {};
  parent.children[key] = {name:key, path:parent.path + "/" + key, size: ts.length, ts:ts, urls:tld};
  _parentfor[key] = parent;
  _nodefor[key] = parent.children[key];
};

var _createroot = function(_tree, key, ts, tld){

  ts = ts.split(",");
  _tree[key] = {name:key, path:key, size: ts.length, ts:ts, urls:tld.split(",")};
  _nodefor[key] = _tree[key];
};

var _convertchildrentoarrays = function(_tree){
    return Object.keys(_tree).map(function(key){
         //base case - if no chilren, don't do anything.
        var node = _tree[key];

        if (!node.children){

            return{
              name:node.name,
              path: node.path,
              ts: node.ts,
              urls: node.urls,
              size: node.size,
          };
        }

        return {
          name:node.name,
          path:node.path,
          ts: node.ts,
          urls: node.urls,
          size: node.size,
          children:  _convertchildrentoarrays(node.children)
        };

    });
};


var _getparentfor = function(key){
  return _parentfor[key];
};

var _getextrafor = function(node){
  //var details = extra[node.name]
  var details = {ts: node.ts, urls: node.urls, name: node.name};
  details.percentage = ((node.size/_totalsize)*100).toFixed(2);
  //nodechanged(details);
  //dispatcher.dispatch("node_changed", details);
};

var CategoryStore = assign({}, EventEmitter.prototype, {

  urls: function(){
    return _urls;
  },

  data: function(){
    return _data;
  },

  categorymatches: function(){
    return _categorymatches;
  },

  urlmatches: function(){
    return _urlmatches;
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
CategoryStore.dispatchToken = AppDispatcher.register(function(action) {
 
  switch(action.action.type) {

  	case ActionTypes.RAW_CATEGORY_DATA:
      _updatetree(action.action.rawData);
      CategoryStore.emitChange();
      break;

    case ActionTypes.RAW_CATEGORY_MATCHES:
      _updatecategorymatches(action.action.rawData);
      CategoryStore.emitChange();
      break;

    case ActionTypes.RAW_URL_MATCHES:
      _updateurlmatches(action.action.rawData);
      CategoryStore.emitChange();
      break;

    case ActionTypes.CATEGORY_NODE_SELECTED:
      _updateurlmatches([]);
      _node_selected(action.action.node);
      CategoryStore.emitChange();
      break;
    
    default:
      // no op
  }
});

module.exports = CategoryStore;
