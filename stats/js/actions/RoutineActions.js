import AppDispatcher from  '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export function toggleBrowsing(){
	AppDispatcher.handleViewAction({
		type: ActionTypes.ROUTINE_TOGGLE_BROWSING,
	});
}

export function toggleCategories(){
	AppDispatcher.handleViewAction({
		type: ActionTypes.ROUTINE_TOGGLE_CATEGORIES,
	});
}