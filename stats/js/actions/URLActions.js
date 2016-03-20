import AppDispatcher from  '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export function urlSelected(url){
	AppDispatcher.handleViewAction({
		type: ActionTypes.URL_SELECTED,
		url,
	});
}