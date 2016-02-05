import AppDispatcher from  '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export function nodeSelected(node){
	AppDispatcher.handleServerAction({
		type: ActionTypes.NODE_SELECTED,
		node: node,
	});
}