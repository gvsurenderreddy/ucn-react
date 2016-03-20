import React from 'react';
import BrowsingStore from '../stores/BrowsingStore';
import TreeStore from '../stores/TreeStore';
import URLStore from '../stores/URLStore';
import XYAxes from './XYAxes.react';
import d3 from 'd3';

let xscale = d3.scale.linear();
let yscale = d3.scale.linear();
const ROWHEIGHT = 15;	
const ROWPADDING = 2;
const TEXTLENGTH = 200;

export default class CategoryBrowsing extends React.Component {
	
	
	constructor(props) {
		super(props);
		this._onChange = this._onChange.bind(this);
		this.state = {}
		this.state.data = BrowsingStore.data();
		this.state.selected = TreeStore.selected();
		this.state.selectedURL = URLStore.selected();
	}
	
	componentDidMount(){
		BrowsingStore.addChangeListener(this._onChange);
		TreeStore.addChangeListener(this._onChange);
		URLStore.addChangeListener(this._onChange);
	}
	
	componentWillUnmount(){
		BrowsingStore.removeChangeListener(this._onChange);
		TreeStore.addChangeListener(this._onChange);
		URLStore.removeChangeListener(this._onChange);
	}
	
	render(){		
		
		let totalrows =  Object.keys(this.state.data).length;
		
		let width = this.props.width, height = this.props.height;
  		
  		let marginright = 0, marginleft = 0, marginbottom = 0, margintop = 40;
		
		let chartprops = {
			width: width+marginleft+marginright,
			height: ((ROWHEIGHT + ROWPADDING) * totalrows) +margintop+marginbottom,
		}
		
		let gprops = {
			transform: 'translate(' + marginleft  + ',' + marginbottom + ')'
		}
		
		yscale.domain([0,totalrows]);
		
		xscale.domain(Object.keys(this.state.data).reduce((acc, key)=>{
			this.state.data[key].forEach((row)=>{
				acc[0] = acc[0] ? row.ts < acc[0] ? row.ts : acc[0] : row.ts;
				acc[1] = acc[1] ? row.ts > acc[1] ? row.ts : acc[1] : row.ts;
			});
			return acc;
		},[]));
		
		xscale.range([TEXTLENGTH,this.props.width]);
		yscale.range([0, chartprops.height]);
		
		let scaleprops = {
			padding: 0,
			height: height,
			width: width,
		}
		
		let rows = Object.keys(this.state.data).map((key, i)=>{
			let gprops = {
				transform: `translate(0, ${yscale(i)})`
			}
	
			
			let lines = this.state.data[key].map((row,i)=>{
			
				let props = {
					x1: xscale(row.ts),
					y1: ROWPADDING,
					x2: xscale(row.ts),
					y2: ROWHEIGHT-(ROWPADDING*2), 
					key: i,
				}
				let style = {
					fill:  this.state.selectedURL ? this.state.selectedURL === row.tld ? 'red' : 'black' : 'black',
					stroke: this.state.selectedURL ? this.state.selectedURL === row.tld ? 'red' : 'black' : 'black',
					strokeWidth: this.state.selectedURL ? this.state.selectedURL === row.tld ? 1 : 0 : 1,
				} 
				return <line {...props} style={style}/>
			});
			
			return <g {...gprops}>
					 {lines}
				   </g>
			
		});
      
      
      	let dividers = Object.keys(this.state.data).map(function(key, i){
      		let props = {
      			x1:TEXTLENGTH, 
      			x2:width,
      			y1:yscale(i) + ROWHEIGHT + (ROWPADDING/2),
      			y2:yscale(i) + ROWHEIGHT + (ROWPADDING/2),
      			key: i,
      		};
      		
      		let style={
      			stroke: "#ececec",
      			shapeRendering: 'crispEdges',
      		}
      		
      		return <line {...props} style={style}/>
      	});
      	
		let text = Object.keys(this.state.data).map(function(key, i){
			let props  = {
				x: 0,
				y: yscale(i) + 10,
				textAnchor: 'start',
				key: i,
			};
			
			let style = {
				fontSize: 10,
				
			};
			return <text {...props} style={style}>{key}</text>
		});
		
		//<XYAxes xScale={xscale} yScale={yscale} {...scaleprops}/>
		
		return	<div>
					<h5> browsing breakdown <small>{this.state.selected.path || ""}</small></h5>
					<hr/>
					<svg {...chartprops}>
						<g {...gprops}>
							{rows}
							{dividers}
							{text}
						</g>
					</svg>
				</div>
	}
	
	_onChange(){
		this.setState({data:  BrowsingStore.data(), selected:TreeStore.selected(), selectedURL:URLStore.selected()});
	}

}