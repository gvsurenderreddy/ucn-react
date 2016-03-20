import AppDispatcher from  '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export function zoneSelected(zone){
	AppDispatcher.handleViewAction({
		type: ActionTypes.ZONE_SELECTED,
		zone: zone,
	});
}