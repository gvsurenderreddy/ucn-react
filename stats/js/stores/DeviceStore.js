import Store from './Store';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';
import {fetchDevicesForUser} from '../utils/WebAPIUtils';
import {getCategories} from '../utils/WebAPIUtils';

let _devices;
let _selected;

function _set_data(devices){
	_devices = devices;
};

function _fetch_categories(device){
	_selected = device.id;
	getCategories(device.id);	
};

class DeviceStore extends Store{

	constructor(){
		super();
	}
	
	devices(){
		return _devices || [];
	}	
	
	selected(){
		return _selected || 0;
	}
	
	init(){
		var params = location.search.substring(1).split('&').reduce(function(acc, pair){
    		var nv = pair.split("=");
    		acc[nv[0]]=nv[1];
    		return acc;
		},{});
		fetchDevicesForUser(params.user);
	}
}

let devicesStoreInstance = new DeviceStore();

devicesStoreInstance.dispatchToken = AppDispatcher.register(action => {
	
	switch(action.action.type){
	
		case ActionTypes.DEVICES_DATA:
			_set_data(action.action.devices);
			break;	
		
		case ActionTypes.DEVICE_SELECTED:
			_fetch_categories(action.action.device);
			break;	
				
		default:
			return;
			
	}
	
	devicesStoreInstance.emitChange();
	
});

export default devicesStoreInstance;