var keyMirror = require('keymirror');

module.exports = {

	ActionTypes: keyMirror({	
		RANGE_CHANGE: null,
		RAW_URL_HISTORY_DATA: null,
		RAW_BROWSING_DATA: null,
		RAW_CATEGORY_DATA:null,
		RAW_CATEGORY_MATCHES: null,
		RAW_URL_MATCHES: null,
		RAW_ACTIVITY_DATA:null,
		RAW_LOCATION_DATA:null,
		RAW_UNCLASSIFIED: null,
		TOGGLE_LOCATIONS: null,
		TOGGLE_DEVICE: null,
		LOCATION_SELECTED: null,
		LOCATION_HIGHLIGHTED: null,
		URL_CLICKED:null,
		CATEGORY_NODE_SELECTED: null,
		CATEGORY_SELECTED: null,
		CATEGORY_URL_SELECTED: null,
		CATEGORISE: null,
  }),

  PayloadSources: keyMirror({
  	SERVER_ACTION: null,
    VIEW_ACTION: null
  }),
};
