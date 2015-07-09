var React = require('react');
var Main  = require('./components/Main.react');
var WebAPIUtils = require('./utils/WebAPIUtils');

React.initializeTouchEvents(true);
WebAPIUtils.fetch_browsing("afamily");

React.render(
    <Main/>, document.getElementById('main')
)
