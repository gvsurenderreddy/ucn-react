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
      return <li>{url.url} <span>({url.total})</span></li>
    });
    return <div style={{height:310, overflowY:'auto'}}><ul className="no-bullet" style={{fontSize:'70%'}}>{{urls}}</ul></div>
  },

  _onChange: function() {
     this.setState(getStateFromStores());
  }
});
module.exports = Urls;
