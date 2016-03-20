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


export function receivedZones(data){
	AppDispatcher.handleServerAction({
		type: ActionTypes.ZONES_DATA,
		data: data,
	});
}

export function receivedDuration(data){
	AppDispatcher.handleServerAction({
		type: ActionTypes.DURATION_DATA,
		data: data,
	});
}

export function receivedRoutine(data){
	AppDispatcher.handleServerAction({
		type: ActionTypes.ROUTINE_DATA,
		data: data,
	});
}

export function receivedDevices(devices){
	AppDispatcher.handleServerAction({
		type: ActionTypes.DEVICES_DATA,
		devices: devices,
	});
}

export function receivedFullCategories(data){
	
	AppDispatcher.handleServerAction({
		type: ActionTypes.FULL_CATEGORIES,
		data: data,
	});
}