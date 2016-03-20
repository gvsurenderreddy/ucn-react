import Store from './Store';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';
import {fetchZoneBreakdown} from '../utils/WebAPIUtils';
import {fetchCategoriesByTime} from '../utils/WebAPIUtils';

let _data, _deviceid;
let _showbrowsing = false;
let _showcategories = false;
let _fullcategories = null;

function _setFullCategories(data){
	_fullcategories = data;
};

function _set_data(data){
	_data = data;
};

function _fetch_zone_breakdown(zone){
	if (_deviceid && zone.enter && zone.exit){
		fetchZoneBreakdown(_deviceid, zone.name, parseInt(zone.enter), parseInt(zone.exit));
	}
};

function _togglebrowsing(){
	_showbrowsing = !_showbrowsing;
};

function _togglecategories(){
	_showcategories = !_showcategories;
	if (_showcategories && _fullcategories == null){
		console.log("fetching categories now!");
		fetchCategoriesByTime(_deviceid);
	}
};

function _set_device(device){
	_deviceid = device.id;
	
};

class RoutineStore extends Store{

	constructor(){
		super();
	}
	
	data(){
		return _data || [];
	}
	
	showbrowsing(){
		return _showbrowsing;
	}
	
	showcategories(){
		return _showcategories;
	}
	
	categoriesByTime(){
		return _fullcategories;
	}
}


let routineStoreInstance = new RoutineStore();

routineStoreInstance.dispatchToken = AppDispatcher.register(action => {
	
	switch(action.action.type){
	
		case ActionTypes.ROUTINE_DATA:
			_set_data(action.action.data);
			break;	
		
		case ActionTypes.ROUTINE_TOGGLE_BROWSING:
			_togglebrowsing();
			break;	
		
		case ActionTypes.ROUTINE_TOGGLE_CATEGORIES:
			_togglecategories();
			break;
			
		case ActionTypes.ZONE_SELECTED:
			_fetch_zone_breakdown(action.action.zone);
			break;
			
		case ActionTypes.DEVICE_SELECTED:
			_set_device(action.action.device);
			break;
			
		case ActionTypes.ROUTINE_ZONE_DATA:
			break;
		
		case ActionTypes.FULL_CATEGORIES:
			_setFullCategories(action.action.data);
			break;	
						
		default:
			return;
			
	}
	
	routineStoreInstance.emitChange();
	
});

export default routineStoreInstance;