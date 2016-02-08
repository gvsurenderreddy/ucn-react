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
		getCategories('29');
	}
	
	componentDidMount(){
		TreeStore.addChangeListener(this._onChange);
	}
	
	componentWillUnmount(){
		TreeStore.removeChangeListener(this._onChange);
	}
	
	
	
	render(){
		
		if (!this.state.nodes)
			return <h3> waiting for data.. </h3>;
		
		let width = 1000, height = 500;
		let marginright = 50, marginleft = 100, marginbottom = 10, margintop = 0;
		
		let chartprops = {
			width: width+marginleft+marginright,
			height: height+margintop+marginbottom,
		}
		
		let gprops = {
			transform: 'translate(' + marginleft  + ',' + marginbottom + ')'
		}
		
		
		
		let nodes = this.state.nodes.map( (node,i)=>{
			let props = {
  				key: i,
  				transform: "translate(" + node.y + "," + node.x + ")",
  				onClick: nodeSelected.bind(this,node),
  			}
  			
  			let cprops = {
  				r:  node.r,
  				fill: 'lightsteelblue'
  			}
  			
  			let textprops = {
  				x:  node.children || node._children ? -10 : 10,
     			dy: ".35em",
      			textAnchor: node.children || node._children ? "end" : "start",
  			}

  			
  			return  <g className="node" {...props}> 
  					 	<circle {...cprops} />
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
  		
		return <svg {...chartprops}>
               	<g {...gprops}>
               		{paths}
               		{nodes}
               	</g>
               </svg>
              
	}
	
	_onChange(){
		this.setState({nodes:TreeStore.nodes(), paths: TreeStore.paths()});
	}

}