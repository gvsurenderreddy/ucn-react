var React = require('react');
var Timeline  = require('./components/Timeline.react');
var Categories = require('./components/Categories.react');

var Router = require('react-router');
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var $ = jQuery = require('jquery');
var foundation = require('foundation-sites');
$(document).foundation();

React.initializeTouchEvents(true);

var App = React.createClass({


  render: function(){
	var margin={
		marginBottom: 30,
	}
   	return (<div>
			<nav className="top-bar" style={margin} data-topbar role="navigation">
			  <ul className="title-area">
				<li className="name">
				  <h1><a>ucn - my activity</a></h1>
				</li>
			  </ul>
			  
			  <section className="top-bar-section">
				<ul className="right">
					<li><a href="/ucn/auth/logout">logout</a></li>
				</ul>
				<ul className="left">
					<li><Link to="timeline" activeClassName="active">timeline</Link></li>
					<li><Link to="categories" activeClassName="active">categorisation</Link></li>
				</ul>
			  </section>
			</nav>
			<RouteHandler/>
    	</div>);
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
