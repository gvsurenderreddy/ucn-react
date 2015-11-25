var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');
var ActionTypes = Constants.ActionTypes;
var WebAPIUtils = require('../utils/WebAPIUtils');
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
  },

  locationselected: function(latlng){
  	 AppDispatcher.handleViewAction({
      type: ActionTypes.LOCATION_SELECTED,
      lat: latlng[0],
      lng: latlng[1],
    });
  },
  
  rangechange: function(range){
    
    AppDispatcher.handleViewAction({
      type: ActionTypes.RANGE_CHANGE,
      range: range,
   	});
   	
   	WebAPIUtils.fetch_browsing_range({
     	from: Math.floor(range[0]/1000),
      	to: Math.floor(range[1]/1000),
    });
  },
  
  togglelocations: function(){
  	AppDispatcher.handleViewAction({
      type: ActionTypes.TOGGLE_LOCATIONS,
   	});
  },

};
