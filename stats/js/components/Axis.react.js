import d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';

export default class Axis extends React.Component {
	
	constructor(props) {
		super(props);
	}
	
	componentDidUpdate(){
		
		this.renderAxis();
		
	}
	
	componentDidMount(){
		
		this.renderAxis();
	}
	
	render(){
		return (
			<g className="axis"  ref="axis" transform={this.props.translate}></g>
		);
	}
	
	renderAxis(){
		let axis = d3.svg.axis().orient(this.props.orient).scale(this.props.scale);
		d3.select(this.refs.axis).call(axis);
	}
	
}