import Store from './Store';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';
import {getHistogram} from '../utils/WebAPIUtils';
let _browsing;
let _locations;

let _deviceid;

function _fetch_histogram(path){
	if (_deviceid){
 		getHistogram(_deviceid, path);
 	}
};

function _set_deviceid(device){
	_deviceid = device.id;
};

function _set_browsing(data){
	_browsing = data;
};

function _set_locations(data){
	_locations = data;
};

class HistogramStore extends Store{

	constructor(){
		super();
	}
	
	browsing(){
		return _browsing || [];
	}	

	locations(){
		return _locations || [];
	}
}

let histogramStoreInstance = new HistogramStore();

histogramStoreInstance.dispatchToken = AppDispatcher.register(action => {
	
	switch(action.action.type){
	
		case ActionTypes.NODE_SELECTED:
			_fetch_histogram(action.action.node.path);
			break;
		
		case ActionTypes.HISTOGRAM_DATA:
			_set_browsing(action.action.data.histogram);
			_set_locations(action.action.data.locations);
			break;	
		
		case ActionTypes.DEVICE_SELECTED:
			_set_deviceid(action.action.device);
			break;		
		
		default:
			return;
			
	}
	
	histogramStoreInstance.emitChange();
	
});

export default histogramStoreInstance;