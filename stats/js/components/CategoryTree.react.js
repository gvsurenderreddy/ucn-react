import React from 'react';
import ReactDOM from 'react-dom';
import {getCategories} from '../utils/WebAPIUtils';
import CategoryStore from '../stores/CategoryStore';
import TreeStore from '../stores/TreeStore';
import {nodeSelected} from '../actions/TreeActions';
import d3 from 'd3';

let diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

export default class CategoryTree extends React.Component {
	
	constructor(props) {
		super(props);
		this._onChange = this._onChange.bind(this);
		this.state = {}
		this.state.nodes = TreeStore.nodes();
		this.state.paths = TreeStore.paths();
		this.state.selected = TreeStore.selected();
	}
	
	componentDidMount(){
		TreeStore.addChangeListener(this._onChange);
	}
	
	componentWillUnmount(){
		TreeStore.removeChangeListener(this._onChange);
	}
	
	
	
	render(){
		
		if (!this.state.nodes)
			return <h5> select a device (above) to browse </h5>;
		
		let width = this.props.width, height = this.props.height;
		let marginright = 50, marginleft = 100, marginbottom = 10, margintop = 0;
		
		let chartprops = {
			width: width+marginleft+marginright,
			height: height+margintop+marginbottom,
		}
		
		let gprops = {
			transform: 'translate(' + marginleft  + ',' + marginbottom + ')'
		}
		
		
		
		let nodes = this.state.nodes.map( (node,i)=>{
		
			console.log(node.path);
			
			let selected = node.path === this.state.selected.path;
		
			let props = {
  				key: i,
  				transform: "translate(" + node.y + "," + node.x + ")",
  				onClick: nodeSelected.bind(this,node),
  			}
  			
  			let cprops = {
  				r:  node.r,
  			}
  			
  			let cstyle ={
  				fill: selected ? "#ff2a2a" : node._children || node.children ? "lightsteelblue" : "#fff", 
  				stroke: selected ? "#d40000" : "steelblue"
  			}
  			
  			let textprops = {
  				x:  node.children || node._children ? -10 : 10,
     			dy: ".35em",
      			textAnchor: node.children || node._children ? "end" : "start",
  			}

  			
  			return  <g className="node" {...props}> 
  					 	<circle {...cprops} style={cstyle}/>
  					 	<text {...textprops}>{node.text}</text>
  					</g>
  					
		});
		
		let paths = this.state.paths.map( (path,i)=>{
  			let pathprops = {
  				key: i,
  				d: path.d,
  			}
			return <path className="link" {...pathprops}/>
		});
  		  		
		return	<div>
					<h5> category tree <small>{this.state.selected.path || ""}</small></h5>
					<hr/>
					<svg {...chartprops}>
						<g {...gprops}>
							{paths}
							{nodes}
						</g>
					</svg>	
              	</div>
	}
	
	_onChange(){
		this.setState({
							nodes:TreeStore.nodes(), 
							paths: TreeStore.paths(),
							selected: TreeStore.selected(),	
						});
	}

}