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
var NetworkAccessStore = require('./stores/NetworkAccessStore');

$(document).foundation();

React.initializeTouchEvents(true);

function getStateFromStores() {
    return { 
      fetching: NetworkAccessStore.accessingNetwork(),
    }
}; 

var App = React.createClass({
    
  getInitialState: function() {
    return {fetching: true}
  },

  componentDidMount: function(){
    NetworkAccessStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function(){
    NetworkAccessStore.removeChangeListener(this._onChange);
  },
  
  render: function(){
	var margin={
		marginBottom: 30,
	}
	
	var righthandtoolbar;
   
   	if (this.state.fetching){
   	 	righthandtoolbar = <ul className="right">
   	 							<li><a href="#"><i className="fa fa-circle-o-notch fa-spin"></i></a></li>
								<li><a href="/ucn/auth/logout">logout</a></li>
							</ul>
   	}else{
   		righthandtoolbar = <ul className="right">
								<li><a href="/ucn/auth/logout">logout</a></li>
							</ul>
   	}
   
   	return (<div>
			<nav className="top-bar" style={margin} data-topbar role="navigation">
			  <ul className="title-area">
				<li className="name">
				  <h1><a>ucn - my activity</a></h1>
				</li>
			  </ul>
			  
			  <section className="top-bar-section">
				{righthandtoolbar}
				<ul className="left">
					<li><Link to="timeline" activeClassName="active">timeline</Link></li>
					<li><Link to="categories" activeClassName="active">categorisation</Link></li>
				</ul>
			  </section>
			</nav>
			<RouteHandler/>
    	</div>);
  	},
  	
  	_onChange: function(){
  		this.setState(getStateFromStores());
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
