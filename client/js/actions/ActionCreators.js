var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');

var ActionTypes = Constants.ActionTypes;

module.exports = {

  clicked: function() {
    console.log("clicked!!");
    AppDispatcher.dispatch({
      type: ActionTypes.MAIN_CLICKED,
      data: {},
    });
  },

  rangechange: function(range){
    AppDispatcher.dispatch({
      type: ActionTypes.RANGE_CHANGE,
      range: range,
    });
  }
  
};
