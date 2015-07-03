var React = require('react');
var Main  = require('./components/Main.react');

React.initializeTouchEvents(true);

React.render(
    <Main/>, document.getElementById('main')
)
