import {receivedCategories} from '../actions/ServerActions';
import {receivedHistogram} from '../actions/ServerActions';
import {receivedDevices} from '../actions/ServerActions';

import request from 'superagent';

export function getCategories(device){

	request.get(`/viz/stats/categories?id=${device}`)
	.set('Accept', 'application/json')
	.end((err, response)=>{
		if (err) console.error(err);
		if (response.body && response.body.length > 0){
			console.log("GOT CATEGORIES!!!");
			console.log(response.body);
			receivedCategories(response.body)
		}
	});	
}

export function getHistogram(device,path){

	request.get('/viz/stats/histogram')
	.query({id:device, path:path})
	.set('Accept', 'application/json')
	.end((err, response)=>{
		if (err) console.error(err);
		console.log("got");
		console.log(response.body);
		receivedHistogram(response.body)
	});	
}

export function fetchDevicesForUser(user){
	request.get('/viz/stats/devices')
	.query({user:user})
	.set('Accept', 'application/json')
	.end((err, response)=>{
		if (err) console.error(err);
		console.log(response.body);
		receivedDevices(response.body)
	});	
}