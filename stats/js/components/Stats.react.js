import React from 'react';
import ReactDOM from 'react-dom';
import CategoryTree from './CategoryTree.react';
import CategoryURLs from './CategoryURLs.react';
import CategoryHistogram from './CategoryHistogram.react';
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
			width: 1000,
			height: 200,
		}
		
		var urlstyle = {
			height: 500,
			overflowY:'auto',
		}
		
		return 	<div>
					<DeviceNavigator />
					<div className="row fullWidth">
						
					</div>
					<div className="row fullWidth">
						<div className="small-9 large-9 columns">
							<CategoryTree  {...treeprops}/>
						</div>
						<div className="small-3 large-3 columns">
							<div className="row">
								<div className="small-12 large-12 columns" style={urlstyle}>
									<h5> urls </h5>
									<hr/>
									<CategoryURLs />
								</div>
							</div>
						</div>
					</div>
					<div className="row fullWidth">
						<div className="small-9 large-9 columns">
							<CategoryBrowsing {...browsingprops} />
						</div>
						<div className="small-3 large-3 columns">
							<CategoryHistogram {...histogramprops}/>
						</div>
					</div>
			 	</div>
	}
}