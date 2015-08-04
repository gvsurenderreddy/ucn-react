var keyMirror = require('keymirror');

module.exports = {

	ActionTypes: keyMirror({
			
			RANGE_CHANGE: null,
			RAW_URL_DATA: null,
			RAW_URL_HISTORY_DATA: null,
			RAW_BROWSING_DATA: null,
			RAW_CATEGORY_DATA:null,
			RAW_ACTIVITY_DATA:null,
			URL_CLICKED:null,
  }),

  PayloadSources: keyMirror({
  	SERVER_ACTION: null,
    VIEW_ACTION: null
  }),
};
