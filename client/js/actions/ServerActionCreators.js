var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');

var ActionTypes = Constants.ActionTypes;

module.exports = {

  receivedBrowsingData: function(data) {

    AppDispatcher.dispatch({
      type: ActionTypes.RAW_BROWSING_DATA,
      rawData: data,
    });
  },

  receivedActivityData: function(data) {

    AppDispatcher.dispatch({
      type: ActionTypes.RAW_ACTIVITY_DATA,
      rawData: data,
    });
  },
  
  receivedURLData: function(data){
    AppDispatcher.dispatch({
      type: ActionTypes.RAW_URL_DATA,
      rawUrls: data,
    });
  },

  receivedURLHistoryData: function(data){
    AppDispatcher.dispatch({
      type: ActionTypes.RAW_URL_HISTORY_DATA,
      rawData: data,
    });
  },

  receivedCategoryData: function(data){
    AppDispatcher.dispatch({
      type: ActionTypes.RAW_CATEGORY_DATA,
      rawData: data,
    });
  }

};
