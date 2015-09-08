var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');

var ActionTypes = Constants.ActionTypes;

module.exports = {

  receivedBrowsingData: function(data) {
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_BROWSING_DATA,
      rawData: data,
    });
  },

  receivedActivityData: function(data) {

    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_ACTIVITY_DATA,
      rawData: data,
    });
  },
  
  receivedURLData: function(data){
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_URL_DATA,
      rawUrls: data,
    });
  },

  receivedURLHistoryData: function(data){
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_URL_HISTORY_DATA,
      rawData: data,
    });
  },

  receivedCategoryData: function(data){
    console.log("firsing a handle server action");
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_CATEGORY_DATA,
      rawData: data,
    });
  },

  receivedCategoryMatches : function(data){
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_CATEGORY_MATCHES,
      rawData: data,
    });
  },

   receivedURLMatches: function(data){
     AppDispatcher.handleServerAction({
       type: ActionTypes.RAW_URL_MATCHES,
        rawData: data,
      });
   },
};
