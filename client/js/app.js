var React = require('react');
var Timeline  = require('./components/Timeline.react');
var Categories = require('./components/Categories.react');

var Router = require('react-router');
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;


React.initializeTouchEvents(true);

var App = React.createClass({


  render: function(){
    return(
      <div>
        <div className="navigation">
          <ul className="navbar inline-list">
            <li><Link to="timeline">timeline</Link></li>
            <li><Link to="categories">categorisation</Link></li>
          </ul>
        </div>
        <RouteHandler />
      </div>
    );
  }

});

var routes = (
  <Route handler={App}>
		<Route name="timeline"   handler={Timeline}/>
		<Route name="categories" handler={Categories}/>
		<DefaultRoute handler={Timeline} />
  </Route>
);

Router.run(routes, function(Handler, state){
    React.render(<Handler/>, document.getElementById('main'));
});
