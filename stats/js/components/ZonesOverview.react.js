import React from 'react';
import ZonesStore from '../stores/ZonesStore';
import DurationStore from '../stores/DurationStore';
import ZoneChart from './ZoneChart.react';
import GoogleMapsLoader from 'google-maps';
import {zoneSelected} from '../actions/ZoneActions';
import {colour} from '../utils/utils';
let map, googleapi, marker;
let circles = {};

export default class ZonesOverview extends React.Component {
	
	constructor(props) {
		super(props);
		this._onChange = this._onChange.bind(this);
		this.state = {}
		this.state.data = ZonesStore.data();
		this.state.selected = ZonesStore.selected();
		this.state.duration = DurationStore.duration();
	}
	
	componentDidMount(){
		
		ZonesStore.addChangeListener(this._onChange);
		DurationStore.addChangeListener(this._onChange);
		
		GoogleMapsLoader.load(function(google){
			
			googleapi = google;

			map = new google.maps.Map(document.getElementById("zonemap"),
			{
				center: {lat: 52.95450, lng: -1.15749},
				zoom: 18
			});
	
			marker = new google.maps.Marker({
				position: {lat: 52.95450, lng: -1.15749},
				map: map,
				title: "here you are",
			});
		});
		
	}
	
	componentWillUnmount(){
		ZonesStore.removeChangeListener(this._onChange);
		DurationStore.removeChangeListener(this._onChange);
	}

	
	render(){		

		let width = 150, height = 100;
		let marginright = 0, marginleft = 30, marginbottom = 20, margintop = 20;
		
		let zones = this.state.data.map((zone,i)=>{
			
			
			if (googleapi && map){
				if (!circles[zone.name]){
					let circle = new googleapi.maps.Circle({
						strokeColor: colour(zone.name),
						strokeOpacity: 1.0,
						strokeWeight: 2,
						fillColor: colour(zone.name),
						fillOpacity: Math.max(0.2, zone.overallpercentage/100),
						map: map,
						center: {lat:zone.lat, lng: zone.lng},
						radius: Math.max(6, 1.5 * zone.overallpercentage),
					});
					
					googleapi.maps.event.addListener(circle, 'click', this._onClick.bind(this,zone));
					circles[zone.name] = circle;
				}
			}
			 
			let props = {
							key: i,
							width: width,
						 	height: height,
						 	margintop:margintop,
						 	marginleft:marginleft,
						 	marginbottom:marginbottom,
						 	marginright:marginright,
						 	name:zone.name,
						 	histogram: zone.histogram,
						 	hours: zone.hours,
						 	overallpercentage: zone.overallpercentage,
						 	selected: this.state.selected ? zone.name===this.state.selected.name : false,
						 	onClick: this._onClick.bind(this,zone),
						 }
						 
			return <li><ZoneChart {...props}/></li>
		});
	
		let mapprops = {
			width:1300,
			height: 400,
			padding: 10,
			marginBottom: 10,
		}
		
		return	<div>
					<h5>location breakdown</h5>
					<hr/>
					<div id="zonemap" style={mapprops}></div>
					<ul className="small-block-grid-6 large-block-grid-6">
						{zones}
					</ul>
				</div>
	}
	

	_onClick(zone){
		zoneSelected(zone);
		if (googleapi && map && zone.lat){
  			map.setCenter({lat: zone.lat, lng: zone.lng});
  			marker.setPosition({lat: zone.lat, lng: zone.lng});
  		}
  		
	}
	
	_onChange(){
		this.setState({
				data:  ZonesStore.data(), 
				selected: ZonesStore.selected(),
				duration: DurationStore.duration(),
		});
	}

};