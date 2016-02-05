import React from 'react';
import ReactDOM from 'react-dom';
import Stats from './components/Stats.react';

export default class App extends React.Component {
	
	constructor() {
		super();
	}

	render(){
		return <Stats  />
	}
}

//render
ReactDOM.render(<App/>, document.getElementById('main'));