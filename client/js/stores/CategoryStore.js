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
var _selectedurls = [];
var _selectedcategory = "";

var _resetglobal = function(){
	_parentfor = {};
	_nodefor = {};
	_categorymatches = [];
	_urlmatches = [];
 	_selectedurls = [];
 	_selectedcategory = "";
};

var _updatecategorymatches = function(matches){
    _categorymatches = matches;
};

var _updateurlmatches = function(matches){
    _urlmatches = matches;
};

var _node_selected = function(node){
	console.log("node selected ");
	console.log(node);
	_urls = node.urls || [];
};

var _category_selected = function(category){
	if (_selectedcategory === category){
		_selectedcategory = "";
	}else{
  		_selectedcategory = category;
  	}
};

var _url_selected = function(url){
	var idx = _selectedurls.indexOf(url);
	if (idx == -1){
		_selectedurls.push(url);
	}else{
		_selectedurls.splice(idx,1);
	}
};

var _updatetree = function(data){
	_resetglobal();
    var _tree = _buildtree(data);
    _data = {name:"browsing", size:_totalsize, children:_tree};
};

var _buildtree = function(data){

     _totalsize = 0;
    var _tree = {};

    data.forEach(function(node){
    	
        var size = node.size;
        var tld = node.tld;

        _totalsize += size;

       
        var lastkey;
        //can either be a sub of
        node.classification.forEach(function(key){

            var n = _nodefor[key];

            if (n) { //if this node has been seen before.
                n.size += size;
                n.urls.concat(tld);
            }
            else if (lastkey){ //add as child to previous node if one exists
                _createnewparent(lastkey, key, node.size,/*node.ts,*/ node.tld);
            }
            else{ //this is a brand new node
                _createroot(_tree, key, node.size,/*node.ts,*/ node.tld);
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

var _createnewparent = function(parentkey, key, size,/*ts,*/ tld){
  var parent = _nodefor[parentkey];
  parent.children = parent.children || {};
  parent.children[key] = {name:key, path:parent.path + "/" + key, size: size, urls:tld};
  _parentfor[key] = parent;
  _nodefor[key] = parent.children[key];
};

var _createroot = function(_tree, key, size, /*ts,*/ tld){
  _tree[key] = {name:key, path:key, size: size, urls:tld};
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
              urls: node.urls,
              size: node.size,
          };
        }

        return {
          name:node.name,
          path:node.path,
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
  
  var details = {urls: node.urls, name: node.name};
  details.percentage = ((node.size/_totalsize)*100).toFixed(2);
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
  
  selectedurls: function(){
  	return _selectedurls;
  },
  
  selectedcategory: function(){
  	return _selectedcategory;
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
  	  console.log("seen raw category data, so rebuilding tree...");
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
    
    case ActionTypes.CATEGORY_SELECTED:
      _category_selected(action.action.category);
      CategoryStore.emitChange();
      break;
      
    case ActionTypes.CATEGORY_URL_SELECTED:
      _url_selected(action.action.url);
      CategoryStore.emitChange();
      break;
      
    default:
      // no op
  }
});

module.exports = CategoryStore;
