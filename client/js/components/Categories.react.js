var React = require('react');
var ActionCreators = require('../actions/ActionCreators');
var CategoryStore = require('../stores/CategoryStore');
var DevicesStore = require('../stores/DevicesStore');
var WebAPIUtils = require('../utils/WebAPIUtils');
var Chart = require('./Chart.react');
var Classifier = require('./Classifier.react');
var cx = require('react/lib/cx');
injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

var ENTER_KEY_CODE = 13;
var chart;

function getStateFromStores() {
    return {
      categories: CategoryStore.data(),
      urls: CategoryStore.urlmatches(),
      devices: DevicesStore.devices(),
      selected: DevicesStore.selected(),
    };
}

var Categories = React.createClass({

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function(){
    CategoryStore.addChangeListener(this._onChange);
    ActionCreators.fetchcategories();
  },

  componentWillUnmount: function(){
    CategoryStore.removeChangeListener(this._onChange);
  },
  
  render: function(){
    var options =    {
                        height: 500,
                        width: 1000,
                        margin:{left: 100, right:10, top:10, bottom:60},
                      };

    
    var chart = <i className="fa fa-circle-o-notch fa-spin fa-4"></i>;
    
    var chartdata = {
      categories: this.state.categories,
      expanded: this.state.urls,
    };
    
   

    if (this.state.categories.children){
       chart = <Chart type="Categories" data={chartdata} options={options}/>;
    }
    var devices;
   
  
   if (this.state.devices){
  	  var buttons = this.state.devices.map(function(device){
  	  	var className= cx({ 	
  	  		button: true,
  	  		tiny: true,
  	  		alert: this.state.selected.indexOf(device) != -1,
  	  	});
  	  	
  	  	return <li><a onClick={this._selectDevice.bind(this,device)} className={className}>{device}</a></li>
  	  }.bind(this));
  	  devices = <ul className="button-group">{buttons}</ul>
   }
  
    return  <div>
    		  <div className="row fullWidth">
   			  	<div className="small-11 columns">
   			  		{devices}
   			  	</div>
   			  </div>
              <div className="row fullWidth">
                  <div className="small-8 columns">
                      <LocateURL />
                  </div>
                  <div className="small-4 columns">
                  	 <ul className="button-group">
                  	 	<li><a onTouchTap={this._fetchUnclassified} className="button tiny">unclassified</a></li>
                  	 	<li><a onTouchTap={this._fetchUserclassified} className="button tiny">user classified</a></li>
                  	 	<li><a onTouchTap={this._fetchClassified} className="button tiny">full classification</a></li>
                  	 </ul>
                  </div>
              </div>
              <div className="row fullWidth">
                <div className="small-8 columns" style={{overflowY:'auto'}}>
                  {chart}
                </div>
                 <div className="small-4 columns" style={{overflowY:'auto'}}>
                  <Classifier />
                </div>
             </div>
           </div>;

  },
  
  _fetchUnclassified: function(){
  	ActionCreators.fetchunclassified();
  },

  _fetchUserclassified: function(){
  	ActionCreators.fetchcategories("user");
  },
  
  _fetchClassified: function(){
  	ActionCreators.fetchcategories();
  },
  
  _selectDevice: function(device){
  	ActionCreators.toggleselected(device, "categories");
  },
  
  
  _onChange: function() {
     this.setState(getStateFromStores());
  }
});


var LocateURL = React.createClass({

  getInitialState: function() {
    return {text: ''};
  },

  render: function(){
    return (<div>
              <div className="row">
                <div className="small-6 columns">
                    <div className="row collapse">
                      <div className="small-9 columns">
                          <input type="text"  value={this.state.text} onChange={this._onChange} onKeyDown={this._onKeyDown} placeholder="find url" />
                      </div>
                      <div className="small-3 columns">
                        <a onTouchTap={this._matchURLS} className="button postfix">find</a>
                      </div>
                    </div>
                </div>
              </div>
            </div>);
  },

  _matchURLS: function(event){
      event.preventDefault();
      var text = this.state.text.trim();
      if (text){
        WebAPIUtils.match_urls(text);
      }
  },


  _onChange: function(event, value) {
    this.setState({text: event.target.value});
  },

  _onKeyDown: function(event) {
    if (event.keyCode === ENTER_KEY_CODE) {
      event.preventDefault();
      var text = this.state.text.trim();
      if (text) {
        WebAPIUtils.match_urls(text);
      }
      this.setState({text: ''});
    }
  }

});

module.exports = Categories;
