var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');
var WebAPIUtils = require('../utils/WebAPIUtils');
var ActionTypes = Constants.ActionTypes;

module.exports = {

  clicked: function() {
   
    AppDispatcher.handleViewAction({
      type: ActionTypes.MAIN_CLICKED,
      data: {},
    });
  },

  urlclicked: function(url){
    AppDispatcher.handleViewAction({
      type: ActionTypes.URL_CLICKED,
      url: url,
    });
    WebAPIUtils.fetch_url_history(url);
  },

  rangechange: function(range){
    AppDispatcher.handleViewAction({
      type: ActionTypes.RANGE_CHANGE,
      range: range,
   });
    
    
    //aha this is the problem - as two incoming messages will cause a double dispatch!
    //rewrite so that either all data is returned in a single dispatch OR chain them so that
    //once urls are received, range is called! - or make these get called in the stores?
    
    WebAPIUtils.fetch_browsing_range({
     	from: Math.floor(range[0]/1000),
      	to: Math.floor(range[1]/1000),
    });
    
    /*
	WebAPIUtils.fetch_urls({
      from: Math.floor(range[0]/1000),
      to: Math.floor(range[1]/1000),
    });
  	
  	//should only do this if range requires a change from current bin. 
    WebAPIUtils.fetch_browsing_range({
      from: Math.floor(range[0]/1000),
      to: Math.floor(range[1]/1000),
    });*/
  }

};
