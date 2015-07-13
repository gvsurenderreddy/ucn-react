var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');
var WebAPIUtils = require('../utils/WebAPIUtils');
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
    WebAPIUtils.fetch_urls({
      from: Math.floor(range[0]/1000),
      to: Math.floor(range[1]/1000),
    });
  }

};
