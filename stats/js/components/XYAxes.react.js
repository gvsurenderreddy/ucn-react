import Axis from './Axis.react';
import React from 'react';

export default class XYAxes extends React.Component {
	
	constructor(props) {
		super(props);
	}
	
	render(){
		
		let xSettings = {
			translate: `translate(0, ${this.props.height-this.props.padding})`,
			scale: this.props.xScale,
			orient: 'bottom',
		};
		
		let ySettings = {
			translate: `translate(${this.props.padding},0)`,
			scale: this.props.yScale,
			orient: 'left',
		};
		
		return (
			<g className="xy-axes">
				<Axis {...xSettings} />
				<Axis {...ySettings} />
			</g>
		);
		
	}
	
}