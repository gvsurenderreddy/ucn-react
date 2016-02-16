import React from 'react';
import HistogramStore from '../stores/HistogramStore';
import XYAxes from './XYAxes.react';
import d3 from 'd3';

let xscale = d3.scale.linear();
let yscale = d3.scale.linear();
		
export default class CategoryHistogram extends React.Component {
	
	constructor(props) {
		super(props);
		this._onChange = this._onChange.bind(this);
		this.state = {}
		this.state.data = HistogramStore.data();
	}
	
	componentDidMount(){
		HistogramStore.addChangeListener(this._onChange);
	}
	
	componentWillUnmount(){
		HistogramStore.removeChangeListener(this._onChange);
	}
	
	render(){		
		
		let width = this.props.width, height = this.props.height;
  		
  		let marginright = 0, marginleft = 20, marginbottom = 0, margintop = 40;
		
		let chartprops = {
			width: width+marginleft+marginright,
			height: height+margintop+marginbottom,
		}
		
		let gprops = {
			transform: 'translate(' + marginleft  + ',' + marginbottom + ')'
		}
		
		xscale.domain([0, 23]);
		xscale.range([0,this.props.width]);
		
		yscale.domain([
					
						this.state.data.reduce(function(acc, item){
							if (item.value > acc)
								return item.value;
							return acc;
						}, 0),
						0
					   ]
					 );
		
		yscale.range([0, this.props.height]);
		
		let bars = this.state.data.map((item,i)=>{
			let props = {
				key: i,
				x: xscale(item.hour),
				y: this.props.height-(this.props.height-yscale(item.value)),
				width: this.props.width / 24,
				height: this.props.height-yscale(item.value),
			}
			
			let style = {
				fill: 'lightsteelblue',
				stroke: 'steelblue'
			} 
			
			return <rect {...props} style={style}/>
		});
		
		
		var scaleprops = {
			padding: 0,
			height: height,
			width: width,
		}
					
		return	<div>
					<h5> 24hr histogram <small>% browsing by hour</small></h5>
					<hr/>
					<svg {...chartprops}>
						<g {...gprops}>
							{bars}
							<XYAxes xScale={xscale} yScale={yscale} {...scaleprops}/>
						</g>
					</svg>
				</div>
	}
	
	_onChange(){
		this.setState({
						data:  HistogramStore.data(), 
						
					 });
	}

}