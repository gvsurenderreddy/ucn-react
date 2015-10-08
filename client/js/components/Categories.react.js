var React = require('react');
var ActionCreators = require('../actions/ActionCreators');
var CategoryStore = require('../stores/CategoryStore');
var WebAPIUtils = require('../utils/WebAPIUtils');
var Chart = require('./Chart.react');
var Classifier = require('./Classifier.react');
injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

var ENTER_KEY_CODE = 13;
var chart;

function getStateFromStores() {
    return {
      categories: CategoryStore.data(),
      urls: CategoryStore.urlmatches(),
    };
}

var Categories = React.createClass({

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function(){
    CategoryStore.addChangeListener(this._onChange);
    WebAPIUtils.fetch_category_data();
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

    
    var chart = <h5> ..waiting for data </h5>;
    
    var chartdata = {
      categories: this.state.categories,
      expanded: this.state.urls,
    };

    if (this.state.categories.children){
      chart = <Chart type="Categories" data={chartdata} options={options}/>;
    } 
    
    return  <div>
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
  		WebAPIUtils.fetch_unclassified();
  },

  _fetchUserclassified: function(){
  		console.log("fetching user classified data");
  		WebAPIUtils.fetch_category_data("user");
  },
  
  _fetchClassified: function(){
  		console.log("fetching user classified data");
  		WebAPIUtils.fetch_category_data();
  },
  
  _onChange: function() {
     var state = getStateFromStores();
     this.setState(state);
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
