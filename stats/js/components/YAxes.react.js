import Axis from './Axis.react';
import React from 'react';

export default class YAxes extends React.Component {
	
	constructor(props) {
		super(props);
	}
	
	render(){
		
		let ySettings = {
			translate: `translate(${this.props.padding},0)`,
			scale: this.props.yScale,
			orient: 'left',
		};
		
		return (
			<g className="xy-axes">
				<Axis {...ySettings} />
			</g>
		);	
	}
}