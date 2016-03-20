import Store from './Store';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

let _data;

function _set_data(data){
	_data = data;
};

class DurationStore extends Store{

	constructor(){
		super();
	}
	
	duration(){
		return _data || 0;
	}	

}

let durationStoreInstance = new DurationStore();

durationStoreInstance.dispatchToken = AppDispatcher.register(action => {
	
	switch(action.action.type){
	
		case ActionTypes.DURATION_DATA:
			_set_data(action.action.data);
			break;	
			
		default:
			return;
			
	}
	
	durationStoreInstance.emitChange();
	
});

export default durationStoreInstance;