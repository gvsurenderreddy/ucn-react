var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');
var ActionTypes = Constants.ActionTypes;
var WebAPIUtils = require('../utils/WebAPIUtils');

module.exports = {


  nodeselected: function(node){
    AppDispatcher.handleViewAction({
      type: ActionTypes.CATEGORY_NODE_SELECTED,
      node: node,
    });
  },
  
  urlselected: function(url){
  	 AppDispatcher.handleViewAction({
      type: ActionTypes.CATEGORY_URL_SELECTED,
      url: url,
    });
  },
  
  categoryselected: function(category){
    AppDispatcher.handleViewAction({
      type: ActionTypes.CATEGORY_SELECTED,
      category: category,
    });
  },
  
  categorise: function(obj){
  	 AppDispatcher.handleViewAction({
      type: ActionTypes.CATEGORISE,
      data: obj,
    });
  },

};
