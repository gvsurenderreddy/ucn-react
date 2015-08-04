var React = require('react');
var ActionCreators = require('../actions/ActionCreators');
var UrlDataStore = require('../stores/UrlDataStore');
var cx = require('react/lib/cx');


function getStateFromStores() {
    return {
      urls: UrlDataStore.urls(),
      selected: UrlDataStore.selected()
    }
}

var Urls = React.createClass({

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function(){
    UrlDataStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function(){
    UrlDataStore.removeChangeListener(this._onChange);
  },

  render: function(){
  	
  	var urlstyle ={
  		height: 310,
  		overflowY: "auto",
  	};
  	
  	var linestyle = {
  	  fontSize:"70%"
  	};
  	
    var urls = this.state.urls.map(function(url){

      return <Url handleClick={this._handleClick} selected={this.state.selected==url.url} url={url.url} total={url.total}/>
    }.bind(this));
	
	return (<div style={urlstyle}>
				<ul className="no-bullet" style={linestyle}>
					{urls}
				</ul>
			</div>)
 	
  },

  _handleClick: function(url){
    ActionCreators.urlclicked(url);
  },

  _onChange: function() {
     this.setState(getStateFromStores());
  }
  
});

var Url = React.createClass({

  render: function(){
    return <li  className={cx({'active': this.props.selected})} onClick={this._onClick}>{this.props.url} <span>({this.props.total})</span></li>
  },

  _onClick: function(){
    this.props.handleClick(this.props.url);
  }

});

module.exports = Urls;
