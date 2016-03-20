import React from 'react';
import TreeStore from '../stores/TreeStore';
import URLStore from '../stores/URLStore';
import {urlSelected} from '../actions/URLActions';

export default class CategoryURLs extends React.Component {
	
	constructor(props) {
		super(props);
		this._onChange = this._onChange.bind(this);
		this.state = {}
		this.state.urls = TreeStore.urls();
		this.state.selected = URLStore.selected();
	}
	
	componentDidMount(){
		TreeStore.addChangeListener(this._onChange);
		URLStore.addChangeListener(this._onChange);
	}
	
	componentWillUnmount(){
		TreeStore.removeChangeListener(this._onChange);
		URLStore.removeChangeListener(this._onChange);
	}
	
	render(){		
	
		let maxheight = {
			height: 240,
			overflowY: 'auto',
			overflowX: 'hidden',
		}
		
  		let urls = this.state.urls ? this.state.urls.map( (url, i)=>{
  			let style={
  				fontSize: "0.6rem",
  				fontWeight: this.state.selected === url ? "bold" : "normal",
  			}
  			return <li onClick={this._urlSelected.bind(this,url)} style={style} key={i}>{url}</li>
  		}) : [];
  		
		return	<ul className="no-bullet" style={maxheight}>
               		{urls}
               	</ul> 
	}
	
	
	_urlSelected(url){
		urlSelected(url);
	}
	
	_onChange(){
		this.setState({urls: TreeStore.urls(), selected: URLStore.selected()});
	}

}