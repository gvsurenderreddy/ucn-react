var React = require('react');
var ActionCreators = require('../actions/ActionCreators');
var Chart = require('./Chart.react');
var Urls = require('./Urls.react');
var BrowsingDataStore = require('../stores/BrowsingDataStore');
var DevicesStore = require('../stores/DevicesStore');
var WebAPIUtils = require('../utils/WebAPIUtils');
var moment = require('moment');
var GoogleMapsLoader = require('google-maps');
var map, googleapi, marker;
var cx = require('react/lib/cx');

function getStateFromStores() {
    return {
      data: BrowsingDataStore.data(),
      zoomdata: BrowsingDataStore.zoomdata(), 
      location: BrowsingDataStore.location(),
      locationoverlay: BrowsingDataStore.locationoverlay(),
      devices: DevicesStore.devices(),
      selected: DevicesStore.selected(),
    }
}; 
	
var Timeline = React.createClass({
    
  getInitialState: function() {
  	DevicesStore.init();
    return getStateFromStores();
  },


  componentDidMount: function(){
  	
    BrowsingDataStore.addChangeListener(this._onChange);
    DevicesStore.addChangeListener(this._onChange);
    
    GoogleMapsLoader.load(function(google){
    	
    	console.log(google.maps);
    	googleapi = google;
    	
    	map = new google.maps.Map(document.getElementById("map"),
    	{
    		center: {lat: -34.397, lng: 150.644},
    		zoom: 12
    	});
    	
    	marker = new google.maps.Marker({
    		position: {lat: -34.397, lng: 150.644},
    		map: map,
    		title: "here you are",
    	});
    });
  },

  componentWillUnmount: function(){
    BrowsingDataStore.removeChangeListener(this._onChange);
    DevicesStore.removeChangeListener(this._onChange);
  },

  render: function(){
  
  	var rangestr = "";
  	
  	if (googleapi && map && this.state.location.lat){
  		map.setCenter({lat: this.state.location.lat, lng: this.state.location.lng});
  		marker.setPosition({lat: this.state.location.lat, lng: this.state.location.lng});
  	}
  	
  	var rangestyle = {
  		paddingLeft: 40,
  	}
  
  	if ('browsing' in this.state.zoomdata){
  		var from = moment(this.state.zoomdata.browsing.timerange.from*1000).format("MMMM Do YYYY, h:mm:ss");
  		var to   = moment(this.state.zoomdata.browsing.timerange.to*1000).format("MMMM Do YYYY, h:mm:ss");
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
                   height: 200,
                   width: 1000,
                   xaxis:{orientation:'bottom'},
                   yaxis:{orientation:'left'},
                   margin:{left: 40, right:10, top:10, bottom:60}
               };

   var mapstyle ={
  		height: "200px",
  		width: 1050,
  		marginLeft: "15px",
   };
  	
   var mapcontainer = {
  		visibility: this.state.locationoverlay ? 'visible' : 'hidden',
  		height: this.state.locationoverlay ? "200px" : "0px",
   };
   
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
  
   
   return <div className="container">
   			  <div className="row fullWidth">
   			  	<div className="small-12 columns">
   			  		{devices}
   			  	</div>
   			  </div>
   			  <div className="row fullWidth">
   			  	<div style={mapcontainer}>
   			  		<div id="map" style={mapstyle}></div>
   			  	</div>
   			  </div>
              <div className="row fullWidth">
                <div className="small-12 columns" style={{overflowY:'auto'}}>
                  <Chart type="Zoom" data={this.state.data} options={zoomoptions}/>
                </div>
              </div>
              <div className="row fullWidth">
                <div className="small-9 columns" style={{overflowY:'auto'}}>
                  <h5 style={rangestyle}> {rangestr} </h5>
                  <Chart type="BrowsingBar" data={this.state.zoomdata} options={browsingoptions}/>
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
  
  _selectDevice: function(device){
  	ActionCreators.toggleselected(device);
  },
  
  _fetchActivity: function(){
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
