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
		TOGGLE_LOCATIONS: null,
		URL_CLICKED:null,
		CATEGORY_NODE_SELECTED: null,
  }),

  PayloadSources: keyMirror({
  	SERVER_ACTION: null,
    VIEW_ACTION: null
  }),
};
