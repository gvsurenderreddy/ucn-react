import AppDispatcher from  '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export function receivedCategories(data){
	AppDispatcher.handleServerAction({
		type: ActionTypes.CATEGORY_DATA,
		data: data,
	});
}

export function receivedHistogram(data){
	AppDispatcher.handleServerAction({
		type: ActionTypes.HISTOGRAM_DATA,
		data: data,
	});
}

export function receivedDevices(devices){
	AppDispatcher.handleServerAction({
		type: ActionTypes.DEVICES_DATA,
		devices: devices,
	});
}