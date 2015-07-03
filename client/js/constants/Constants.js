var keyMirror = require('keymirror');

module.exports = {

	ActionTypes: keyMirror({
			MAIN_CLICKED: null
  }),

  PayloadSources: keyMirror({
  	SERVER_ACTION: null,
    VIEW_ACTION: null
  }),
};
