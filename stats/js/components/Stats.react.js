import React from 'react';
import ReactDOM from 'react-dom';
import CategoryTree from './CategoryTree.react';
import CategoryURLs from './CategoryURLs.react';
import CategoryHistogram from './CategoryHistogram.react';
import LocationHistogram from './LocationHistogram.react';
import CategoryBrowsing from './CategoryBrowsing.react';
import DeviceNavigator from  './DeviceNavigator.react';

export default class Stats extends React.Component {
	
	constructor() {
		super();
	}

	render(){
	
		var treeprops = {
			deviceid: '29',
			width: 800,
			height: 500,
		}
		
		var histogramprops = {
			width:  200,
			height: 200,
		}
		
		var browsingprops = {
			width: 1200,
			height: 200,
		}
		
		
		var urlstyle = {
			height: 500,
			overflowY:'auto',
		}
		
		var mapstyle={
			height: 250,
			width: 240,
		}
		
		return 	<div>
					<DeviceNavigator />
					<div className="row fullWidth"></div>
					<div className="row fullWidth">
						<div className="small-7 large-7 columns">
							<CategoryTree  {...treeprops}/>
						</div>
						<div className="small-5 large-5 columns">
							<div className="row">
								<div className="small-6 large-6 columns">
									<h5> urls </h5>
									<hr/>
									<CategoryURLs />
								</div>
								<div className="small-6 large-6 columns">
									<CategoryHistogram {...histogramprops}/>
								</div>
							</div>
							<div className="row">
								<div className="small-6 large-6 columns">
									<LocationHistogram {...histogramprops}/>
								</div>
								<div className="small-6 large-6 columns">
									<h5> map <small>click bars to view location</small></h5>
									<hr/>
									<div id="map" style={mapstyle}></div>
								</div>
							</div>
						</div>
					</div>
					<div className="row fullWidth">
						<div className="small-12 large-12 columns">
							<CategoryBrowsing {...browsingprops} />
						</div>
					</div>
			 	</div>
			 	
	}
}