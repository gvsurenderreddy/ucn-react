import AppDispatcher from  '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

export function nodeSelected(node){
	AppDispatcher.handleViewAction({
		type: ActionTypes.NODE_SELECTED,
		node: node,
	});
}