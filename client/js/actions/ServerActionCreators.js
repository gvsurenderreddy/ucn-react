var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');

var ActionTypes = Constants.ActionTypes;

module.exports = {

  receivedBrowsingData: function(data) {
  	console.log("dispatching received browsing data!");
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_BROWSING_DATA,
      rawData: data,
    });
  },

  receivedZoomedInData: function(data) {
    console.log("dispatching received data!");
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_ZOOM_DATA,
      rawData: data,
    });
  },
  
  receivedActivityData: function(data) {
   console.log("dispatching received activity");
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_ACTIVITY_DATA,
      rawData: data,
    });
  },
  
  receivedLocationData: function(data) {
   console.log("dispatching received location");
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_LOCATION_DATA,
      rawData: data,
    });
  },
  
  receivedURLData: function(data){
   console.log("dispatching received URL data");
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_URL_DATA,
      rawUrls: data,
    });
  },

  receivedURLHistoryData: function(data){
   console.log("dispatching received URL HISTORY DATA");
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_URL_HISTORY_DATA,
      rawData: data,
    });
  },

  receivedCategoryData: function(data){
    console.log("dispatching received CATEGORY DATA");
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_CATEGORY_DATA,
      rawData: data,
    });
  },

  receivedCategoryMatches : function(data){
  	console.log("dispatching received CATEGORY MATCHES");
    AppDispatcher.handleServerAction({
      type: ActionTypes.RAW_CATEGORY_MATCHES,
      rawData: data,
    });
  },

   receivedURLMatches: function(data){
   	console.log("dispatching received RAW MATCHES");
     AppDispatcher.handleServerAction({
       type: ActionTypes.RAW_URL_MATCHES,
        rawData: data,
      });
   },
};
