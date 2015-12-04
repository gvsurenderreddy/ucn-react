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

  locationhighlighted: function(latlng){
  	 AppDispatcher.handleViewAction({
      type: ActionTypes.LOCATION_HIGHLIGHTED,
      lat: latlng[0],
      lng: latlng[1],
    });
  },
  
  
  locationselected: function(latlng){
  	console.log("dispatching a location selected!!");
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
  },
  
  togglelocations: function(){
  	AppDispatcher.handleViewAction({
      type: ActionTypes.TOGGLE_LOCATIONS,
   	});
  },
  
  toggleselected: function(device, screen){
  	AppDispatcher.handleViewAction({
  		type: ActionTypes.TOGGLE_DEVICE,
  		device: device,
  		screen: screen,
  	});
  },

  reset: function(){
  	AppDispatcher.handleViewAction({
  		type: ActionTypes.RESET,
  	});
  },
  
  fetchcategories: function(classifier){
  		AppDispatcher.handleViewAction({
  		type: ActionTypes.FETCH_CATEGORIES,
  		classifier: classifier,
  	});
  },
  
  fetchunclassified: function(){
  	AppDispatcher.handleViewAction({
  		type: ActionTypes.FETCH_UNCLASSIFIED,
  	});
  },
};
