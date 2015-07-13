var React = require('react');
var Timeline  = require('./components/Timeline.react');
var WebAPIUtils = require('./utils/WebAPIUtils');
var Router = require('react-router');
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;


React.initializeTouchEvents(true);
WebAPIUtils.fetch_browsing("afamily");

var App = React.createClass({


  render: function(){
    return(
      <div>
        <RouteHandler />
        <div className="navigation">
          <ul className="navbar">
            <li><Link to="timeline">timeline</Link></li>
            <li><Link to="categories">categorisation</Link></li>
          </ul>
        </div>
      </div>
    );
  }

});

var routes = (
  <Route handler={App}>
		<Route name="timeline"   handler={Timeline}/>
		<Route name="categories" handler={Timeline}/>
		<DefaultRoute handler={Timeline} />
  </Route>
);

Router.run(routes, function(Handler, state){
    React.render(<Handler/>, document.getElementById('main'));
});
