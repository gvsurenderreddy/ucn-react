import Store from './Store';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

let _data;
let _selected;
let _coverage;

function _set_data(data){
	_coverage = data.coverage;
	_data = data.zones;
};

function _set_selected(zone){
	_selected = zone;
};

class ZonesStore extends Store{

	constructor(){
		super();
	}
	
	data(){
		return _data || [];
	}	
	
	selected(){
		return _selected;
	}
	
	coverage(){
		return _coverage;
	}

}

let zonesStoreInstance = new ZonesStore();

zonesStoreInstance.dispatchToken = AppDispatcher.register(action => {
	
	switch(action.action.type){
	
		case ActionTypes.ZONES_DATA:
			_set_data(action.action.data);
			break;	
			
		case ActionTypes.ZONE_SELECTED:
			_set_selected(action.action.zone);
			break;
			
		default:
			return;
			
	}
	
	zonesStoreInstance.emitChange();
	
});

export default zonesStoreInstance;