import Store from './Store';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';
import CategoryStore from './CategoryStore';
import d3 from 'd3';

let _selected = null;

function URLSelected(s){
	if (_selected == null){
		_selected = s;
	}else if (_selected === s){
		_selected = null;
	}else{
		_selected = s;
	}
	return _selected;
}

class URLStore extends Store{
	
	constructor(){
		super();
	}
	
	selected(){
		return _selected;
	}
}

let URLStoreInstance = new URLStore();

URLStoreInstance.dispatchToken = AppDispatcher.register(action => {
	
	switch(action.action.type){
	
		case ActionTypes.URL_SELECTED:
			URLSelected(action.action.url);
			break;

		default:
			return;
			
	}
	
	URLStoreInstance.emitChange();
	
});

export default URLStoreInstance;