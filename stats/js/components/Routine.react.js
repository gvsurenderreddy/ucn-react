import React from 'react';
import moment from 'moment';
import RoutineStore from '../stores/RoutineStore';
import ZonesStore from '../stores/ZonesStore';
import {colour} from '../utils/utils';
import d3 from 'd3';
import GoogleMapsLoader from 'google-maps';
import {zoneSelected} from '../actions/ZoneActions';
import {toggleBrowsing} from '../actions/RoutineActions';
import {toggleCategories} from '../actions/RoutineActions';
const DAY = 60 * 60 * 24 * 1000;
const BARHEIGHT = 20;
const TEXTCOLUMNWIDTH = 90;

let map, googleapi, marker;

export default class Routine extends React.Component {
	
	constructor(props) {
		super(props);
		this._onChange = this._onChange.bind(this);
		this.state = {};
		this.state.data = RoutineStore.data();
		this.state.showbrowsing = RoutineStore.showbrowsing();
		this.state.showcategories = RoutineStore.showcategories();
		this.state.selected = ZonesStore.selected();
		this.state.categoriesbytime = RoutineStore.categoriesByTime();
	}
	
	componentDidMount(){
		RoutineStore.addChangeListener(this._onChange);
		ZonesStore.addChangeListener(this._onChange);
		GoogleMapsLoader.load(function(google){
			
			googleapi = google;

			map = new google.maps.Map(document.getElementById("routinemap"),
			{
				center: {lat: 52.95450, lng: -1.15749},
				zoom: 17
			});
	
			marker = new google.maps.Marker({
				position: {lat: 52.95450, lng: -1.15749},
				map: map,
				title: "here you are",
			});
		});
	}
	
	componentWillUnmount(){
		RoutineStore.removeChangeListener(this._onChange);
		ZonesStore.removeChangeListener(this._onChange);
	}

	
	render(){		

		
		let width = this.props.width, height = this.state.data.length * BARHEIGHT;
  		let marginright = 10, marginleft = 20, marginbottom = 0, margintop = 40;
		let xscale = d3.scale.linear();
		let from, to, duration;
		
	
		let chartprops = {
			width: width+marginleft+marginright,
			height: height+margintop+marginbottom,
		}
		
		let mapprops = {
			height: height-150,
			width: 200,
		}
		
		let gprops = {
			transform: `translate(${marginleft}, ${marginbottom})`,
		}
		
		let days = this.state.data.map((day,i)=>{
			
			let props  = {
				x: 0,
				y: 0,
				textAnchor: 'start',
				key: i,
			};
			
			let lineprops = {
				transform: `translate(0, ${ (i*BARHEIGHT)+(BARHEIGHT/2)})`,
				key: i,
			}
			
			let style = {
				fontSize: 10,
				color: "#000",	
			};
			
			let date = moment(parseInt(day.date)).format('ddd MMM Do YY');
			
			return <g {...lineprops}>
						<text {...props} style={style}>{date}</text>
				   </g>
		});
		
		
		
		let routines = this.state.data.map((day,i)=>{
			
			xscale.domain([parseInt(day.date), parseInt(day.date) + DAY]);
			xscale.range([TEXTCOLUMNWIDTH, this.props.width]);
			
			let categories = [];
			
			if (this.state.showcategories){
				categories = this.state.categoriesbytime[""+day.date];
			}
		
			let lineprops = {
				transform: `translate(0, ${i*BARHEIGHT})`,
				key: i,
			}
			
			let zones = day.values.map((zone, i)=>{
			
				let selected = false;
				
				if (this.state.selected && this.state.selected.name){
					selected = zone.name === this.state.selected.name;
					let start = parseInt(this.state.selected.enter);
					let end = parseInt(this.state.selected.exit);
					from = moment(start).format('h:mm a');
					to   = moment(end).format('h:mm a');
					duration = moment.duration(end-start).humanize();
					
				} 
				
				let zoneprops = {
					x: xscale(zone.enter),
					y: 0,
					width: xscale(zone.exit) - xscale(zone.enter),
					height: BARHEIGHT-5,
					key: i,
					onClick: this._onClick.bind(this,zone),
				}
				
				let style = {		
					fill: colour(zone.name),
					stroke: selected ? '#000': this.state.showbrowsing ? "#000": colour(zone.name),
					strokeWidth: 1,
					fillOpacity: selected ? 1.0 : this.state.showbrowsing ? 0 : 0.3,
					strokeOpacity: this.state.showbrowsing? 0.1: 1.0,
				}
				
				let browsing = zone.browsing.map((browse, i)=>{
					
					let browseprops ={
						x1: xscale(browse.ts),
						y1: 0,
						x2: xscale(browse.ts),
						y2: BARHEIGHT-5,
						key: i,
					}
					let browsestyle ={
						stroke: colour(browse.devices[0]),
						strokeWidth:1,
						strokeOpacity: this.state.showbrowsing ? 1 : 0,
						
					}
					return <line {...browseprops} style={browsestyle} />
				});
				
				
				
				return  <g>
							<rect {...zoneprops} style={style}></rect>
							{browsing}
						</g>		
			})
		
			
			return <g {...lineprops}> 
						{zones} 
					</g>
		});
		
		xscale.domain([0,24]);
		let markers = [];
			
		for (let i = 0; i <= 24; i++){
			let lineprops = {
				x1: xscale(i),
				x2: xscale(i),
				y1:0,
				y2:height,
			}
			let style = {
				stroke: "#37474f",
				strokeWidth: 1,
			}	
			
			
			let textprops  = {
				x: xscale(i),
				y: height + 10,
				textAnchor: 'middle',
				key: i,
				fontSize: 10,
			};
			
			let marker = <g>
							<line {...lineprops} style={style}></line>
							<text {...textprops} style={style}>{i}</text>
						 </g>
							
			markers.push(marker);
		}
		
		return	<div>
					<h5>routines</h5>
					<a onClick={toggleBrowsing}> toggle browsing </a>
					<a onClick={toggleCategories}> toggle categories </a>
					<hr/>
					<div className="row fullWidth">
						<div className="small-10 large-10 columns">
							<svg {...chartprops}>
								<g {...gprops}>
									{days}
									{routines}
									{markers}
								</g>
							</svg>	
						</div>
						<div className="small-2 large-2 columns">
							<div className="row">
								<div className="small-12 large-12 columns">
									<p><strong>{from}</strong> to  <strong>{to}</strong></p>
									<p><strong>{duration}</strong></p>
								</div>
							</div>
							<div className="row">
								<div className="small-12 large-12 columns">
									<div id="routinemap" style={mapprops}></div>
								</div>
							</div>	
						</div>
					</div>
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
				data: RoutineStore.data(), 
				selected: ZonesStore.selected(),
				showbrowsing: RoutineStore.showbrowsing(),
				showcategories: RoutineStore.showcategories(),
				categoriesbytime: RoutineStore.categoriesByTime(),
		});
	}

};