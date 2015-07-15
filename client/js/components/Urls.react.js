var React = require('react');
var ActionCreators = require('../actions/ActionCreators');
var UrlDataStore = require('../stores/UrlDataStore');


function getStateFromStores() {
    return {
      urls: UrlDataStore.urls(),
    }
};

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
    var urls = this.state.urls.map(function(url){

      return <Url handleClick={this._handleClick} url={url.url} total={url.total}/>
    }.bind(this));

    return <div style={{height:310, overflowY:'auto'}}><ul className="no-bullet" style={{fontSize:'70%'}}>{{urls}}</ul></div>
  },

  _handleClick: function(url){
    console.log("url " + url  + "clicked");
    ActionCreators.urlclicked(url);
  },

  _onChange: function() {
     this.setState(getStateFromStores());
  }
});

var Url = React.createClass({

  render: function(){
    return <li onClick={this._onClick}>{this.props.url} <span>({this.props.total})</span></li>
  },

  _onClick: function(){
    this.props.handleClick(this.props.url);
  }

});
module.exports = Urls;
