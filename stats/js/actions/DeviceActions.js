import AppDispatcher from  '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export function deviceSelected(device){
	AppDispatcher.handleViewAction({
		type: ActionTypes.DEVICE_SELECTED,
		device: device,
	});
}