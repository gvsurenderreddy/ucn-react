import React from 'react';
import ReactDOM from 'react-dom';
import {getCategories} from '../utils/WebAPIUtils';
import CategoryStore from '../stores/CategoryStore';
import TreeStore from '../stores/TreeStore';
import {nodeSelected} from '../actions/TreeActions';
import d3 from 'd3';

export default class CategoryTree extends React.Component {
	
	constructor(props) {
		super(props);
		this._onChange = this._onChange.bind(this);
		this.state = {}
		this.state.nodes = TreeStore.nodes();
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
		
		let width = 500, height = 500;
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
  				r:  10,
  				fill: 'lightsteelblue'
  			}
  			
  			return <g className="node" {...props}> 
  					 <circle {...cprops} />
  					</g>
		});
  	
  		console.log(this.state);
  		
		return <svg {...chartprops}>
               	<g {...gprops}>
               		{nodes}
               	</g>
               </svg>
              
	}
	
	_onChange(){
		this.setState({nodes:TreeStore.nodes()});
	}

}