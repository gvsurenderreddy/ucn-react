var keyMirror = require('keymirror');

module.exports = {

	ActionTypes: keyMirror({
			MAIN_CLICKED: null,
			RECEIVED_RAW_BROWSING_DATA: null,
			RANGE_CHANGE: null
  }),

  PayloadSources: keyMirror({
  	SERVER_ACTION: null,
    VIEW_ACTION: null
  }),
};
