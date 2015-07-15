var keyMirror = require('keymirror');

module.exports = {

	ActionTypes: keyMirror({
			RECEIVED_RAW_BROWSING_DATA: null,
			RANGE_CHANGE: null,
			RAW_URL_DATA: null,
			RAW_URL_HISTORY_DATA: null,
			RAW_CATEGORY_DATA:null,
  }),

  PayloadSources: keyMirror({
  	SERVER_ACTION: null,
    VIEW_ACTION: null
  }),
};
