import {receivedCategories} from '../actions/ServerActions';
import request from 'superagent';

export function getCategories(device){

	request.get(`/viz/stats/categories?id=${device}`)
	.set('Accept', 'application/json')
	.end((err, response)=>{
		if (err) console.error(err);
		receivedCategories(response.body)
	});	
}