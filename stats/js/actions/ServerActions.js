import AppDispatcher from  '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export function receivedCategories(data){
	AppDispatcher.handleServerAction({
		type: ActionTypes.CATEGORY_DATA,
		data: data,
	});
}