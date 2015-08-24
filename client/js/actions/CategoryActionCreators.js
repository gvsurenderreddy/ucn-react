var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');
var ActionTypes = Constants.ActionTypes;

module.exports = {


  categoryselected: function(node){
    console.log("ok category selected");
    console.log(node);
    AppDispatcher.dispatch({
      type: ActionTypes.CATEGORY_NODE_SELECTED,
      node: node,
    });
  },

};
