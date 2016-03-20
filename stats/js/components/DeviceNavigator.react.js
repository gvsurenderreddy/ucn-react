import React from 'react';
import DeviceStore from '../stores/DeviceStore';
import {deviceSelected} from '../actions/DeviceActions';

export default class DeviceNavigator extends React.Component {
	
	constructor(props) {
		super(props);
		this._onChange = this._onChange.bind(this);
		this.state = {}
		this.state.devices = DeviceStore.devices();
		this.state.selected = DeviceStore.selected();
	}
	
	componentDidMount(){
		DeviceStore.init();
		DeviceStore.addChangeListener(this._onChange);
	}
	
	componentWillUnmount(){
		DeviceStore.removeChangeListener(this._onChange);
	}
	
	render(){		
		
		let devices = this.state.devices.map((device)=>{
			var cname = device.id == this.state.selected ? "active" : "";
			
			return <li key={device.id}>
						<a className={cname} onClick={this._selectDevice.bind(this, device)}>{device.name}</a>
					</li>
		});
		
		return	<nav className="top-bar">
					<ul className="title-area">
						<li className="name">
							<h1> <a href="/viz/admin">devices</a></h1>
						</li>
					</ul>
					<section className="top-bar-section">
						<ul className="left">
							{devices}
						</ul>
					</section>
				</nav>
	}
	
	_selectDevice(device){
		console.log(device);
		deviceSelected(device);
	}
	
	_onChange(){
		this.setState({
							devices:  DeviceStore.devices(),
							selected: DeviceStore.selected()	
						});
	}

}