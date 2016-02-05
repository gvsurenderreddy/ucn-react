import React from 'react';
import ReactDOM from 'react-dom';
import CategoryTree from './CategoryTree.react';

export default class Stats extends React.Component {
	
	constructor() {
		super();
	}

	render(){
	
		return <div>
					<CategoryTree />
			 	</div>
	}
}