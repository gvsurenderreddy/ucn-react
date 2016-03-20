import React from 'react';
import ZonesStore from '../stores/ZonesStore';
import XYAxes from './XYAxes.react';
import d3 from 'd3';
import {colour} from '../utils/utils';

let xscale = d3.scale.linear();
let yscale = d3.scale.linear();

export default class ZoneChart extends React.Component {
	
	constructor(props) {
		super(props);
	}
	
	render(){
	
		if (!this.props.histogram){
			return <div></div>
		}
		
		let chartprops = {
			width: this.props.width+this.props.marginleft+this.props.marginright, 
			height: this.props.height + this.props.margintop + this.props.marginbottom
		}
		
		let yextent = d3.extent(this.props.histogram, (item)=>{return item.value});
		
		
		xscale.domain([0, 23]);
		xscale.range([0,this.props.width]);
		
		yscale.domain([0, yextent[1]]);
		yscale.range([0,this.props.height]);
		
		let bars = this.props.histogram.map((item,i)=>{
			let props = {
				key: i,
				x: xscale(parseInt(item.hour)),
				y: this.props.height - yscale(item.value),
				width: this.props.width / 24,
				height: yscale(item.value),
				//onClick: this._selectZone.bind(this, item),
			}
			
			let style = {
				fill: colour(this.props.name),
				stroke: '#000'
			} 
			
			return <rect  {...props} style={style}/>
		});
		
		
		let scaleprops = {
			padding: 0,
			height: this.props.height,
			width: this.props.width,
		}
					
		let yaxiscale = d3.scale.linear();
		yaxiscale.domain([yextent[1],0]);
		yaxiscale.range([0, this.props.height]);
		
		let gprops = {
			transform: `translate(${this.props.marginleft},${this.props.marginbottom})`
		}
		
		
		let containerprops = {
			width: chartprops.width,
			height: chartprops.height,
			overflow: 'hidden',
			textAlign: 'center',
			float: 'left',
		}
		
		let style={
			border: this.props.selected ? "2px solid #ff0000" : "none",
		}
		
		return	<div onClick={this.props.onClick} style={style}>	
					<h5> {this.props.name} <small>{this.props.overallpercentage}%</small></h5>
					<p> {this.props.hours} hours</p>
					<hr/>
					<svg {...chartprops}>
						<g {...gprops}>
							{bars}
							<XYAxes xScale={xscale} yScale={yaxiscale} {...scaleprops}/>
						</g>
					</svg>
				</div>
					
	}
	
};