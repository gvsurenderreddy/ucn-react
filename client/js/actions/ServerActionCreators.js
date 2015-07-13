var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');

var ActionTypes = Constants.ActionTypes;

module.exports = {

  receiveBrowsingData: function(data) {

    AppDispatcher.dispatch({
      type: ActionTypes.RECEIVED_RAW_BROWSING_DATA,
      rawData: data,
    });
  },

  receivedURLData: function(data){
    AppDispatcher.dispatch({
      type: ActionTypes.RAW_URL_DATA,
      rawUrls: data,
    });
  }

};
