import Store from './Store';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

let _data;

function _set_data(data){
	_data = data;
};

class BrowsingStore extends Store{

	constructor(){
		super();
	}
	
	data(){
		return _data || [];
	}	

}

let browsingStoreInstance = new BrowsingStore();

browsingStoreInstance.dispatchToken = AppDispatcher.register(action => {
	
	switch(action.action.type){
	
		case ActionTypes.HISTOGRAM_DATA:
			_set_data(action.action.data.browsing);
			break;	
			
		default:
			return;
			
	}
	
	browsingStoreInstance.emitChange();
	
});

export default browsingStoreInstance;