var React = require('react');
var ActionCreators = require('../actions/ActionCreators');
var Chart = require('./Chart.react');
var Urls = require('./Urls.react');
var BrowsingDataStore = require('../stores/BrowsingDataStore');
var WebAPIUtils = require('../utils/WebAPIUtils');

function getStateFromStores() {
    return {
      data: BrowsingDataStore.data(),
      zoomdata: BrowsingDataStore.zoomdata(),
    }
}; 

var Timeline = React.createClass({
    
  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function(){
    BrowsingDataStore.addChangeListener(this._onChange);
    WebAPIUtils.fetch_browsing();
  },

  componentWillUnmount: function(){
    BrowsingDataStore.removeChangeListener(this._onChange);
  },

  render: function(){
   var browsingoptions = {
                    height: 300,
                    width: 800,
                    xaxis:{orientation:'bottom'},
                    yaxis:{orientation:'left'},
                    margin:{left: 40, right:10, top:10, bottom:60}
                };

   var zoomoptions = {
                   height: 100,
                   width: 1000,
                   xaxis:{orientation:'bottom'},
                   yaxis:{orientation:'left'},
                   margin:{left: 40, right:10, top:10, bottom:60}
               };

   return <div className="container">
              <div className="row fullWidth">
                <div className="small-12 columns" style={{overflowY:'auto'}}>
                  <Chart type="Zoom" data={this.state.data} options={zoomoptions}/>
                </div>
              </div>
              <div className="row fullWidth">
                <div className="small-9 columns" style={{overflowY:'auto'}}>
                  <Chart type="Browsing" data={this.state.zoomdata} options={browsingoptions}/>
                </div>
                <div className="small-3 columns">
                  <Urls/>
                </div>
              </div>
              <div className="row fullWidth">
              	<ul className="inline-list">
              		<li><a href="#" onClick={this._fetchActivity}>overlay activity</a></li>
              	</ul> 
              </div>
          </div>
  },
  
  _fetchActivity: function(){
  	console.log("fetching activity!");
  	WebAPIUtils.fetch_activity();
  },

  _onChange: function() {
     this.setState(getStateFromStores());
  }
});
module.exports = Timeline;
