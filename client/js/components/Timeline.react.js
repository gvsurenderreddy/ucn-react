var React = require('react');
var ActionCreators = require('../actions/ActionCreators');
var Chart = require('./Chart.react');
var Urls = require('./Urls.react');
var BrowsingDataStore = require('../stores/BrowsingDataStore');
var NetworkAccessStore = require('../stores/NetworkAccessStore');
var WebAPIUtils = require('../utils/WebAPIUtils');
var moment = require('moment');

function getStateFromStores() {
    return {
      data: BrowsingDataStore.data(),
      zoomdata: BrowsingDataStore.zoomdata(), 
      fetching: NetworkAccessStore.accessingNetwork(),
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
  
  	var rangestr = ""
  	
  	var rangestyle = {
  		paddingLeft: 40,
  	}
  	
  	if ('range' in this.state.zoomdata){
  		var from = moment(this.state.zoomdata.range[0]).format("MMMM Do YYYY, h:mm:ss");
  		var to   = moment(this.state.zoomdata.range[1]).format("MMMM Do YYYY, h:mm:ss");
  	 	rangestr = from + " to " + to;
  	}
  	
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
                  <h5 style={rangestyle}> {rangestr} </h5>
                  <Chart type="Browsing" data={this.state.zoomdata} options={browsingoptions}/>
                </div>
                <div className="small-3 columns">
                  <Urls/>
                </div>
              </div>
              <div className="row fullWidth">
              	<div className="small-9 columns">
					<dl className="sub-nav">
						<dt>Overlays:</dt>
						<dd><a href="#" onClick={this._fetchActivity}>overlay activity</a></dd>
						<dd><a href="#" onClick={this._toggleLocation}>overlay locations</a></dd>
					</dl> 
				</div>
              </div>
          </div>
  },
  
  _fetchActivity: function(){
  	console.log("fetching activity!");
  	WebAPIUtils.fetch_activity();
  },

  _toggleLocation: function(){
	ActionCreators.togglelocations();
  },
  
  _onChange: function() {
     this.setState(getStateFromStores());
  }
});
module.exports = Timeline;
