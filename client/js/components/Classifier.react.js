var React = require('react');
var ActionCreators = require('../actions/ActionCreators');
var CategoryStore = require('../stores/CategoryStore');
var WebAPIUtils = require('../utils/WebAPIUtils');
var ENTER_KEY_CODE = 13;

function getStateFromStores() {
    return {
      urls: CategoryStore.urls(),
    };
}

var Classifier = React.createClass({

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function(){
    CategoryStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function(){
    CategoryStore.removeChangeListener(this._onChange);
  },

  render: function(){
    //dedup urls
    var urls = Object.keys(this.state.urls.reduce(function(acc, url){
      acc[url] = url;
      return acc;
    },{})).map(function(url){
      return <li> {url} </li>;
    });

    return  <div>
              <Typeahead />
              <ul>{urls}</ul>
            </div>;
  },
  
  _fetchActivity: function(){
  	console.log("fetching activity!");
  },

  _onChange: function() {
     this.setState(getStateFromStores());
  }
});

Typeahead = React.createClass({
  
  getInitialState: function() {
    return {text: ''};
  },


  render: function(){
    return (<div className="row">
              <div className="large-12 columns">
                  <div className="row collapse">
                    <div className="small-9 columns">
                        <input type="text"  value={this.state.text} onChange={this._onChange} onKeyDown={this._onKeyDown} placeholder="category" />
                    </div>
                    <div className="small-3 columns">
                      <a href="#" className="button postfix">find</a>
                    </div>
                  </div>
              </div>
          </div>);
  },

  _onChange: function(event, value) {
    this.setState({text: event.target.value});
    WebAPIUtils.match_categories(event.target.value);
  },

  _onKeyDown: function(event) {
    if (event.keyCode === ENTER_KEY_CODE) {
      event.preventDefault();
      var text = this.state.text.trim();
      if (text) {
        console.log("ENTER PRESSED!!!");
      }
      this.setState({text: ''});
    }
  }

});
module.exports = Classifier;
