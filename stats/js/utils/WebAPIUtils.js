import {receivedCategories} from '../actions/ServerActions';
import {receivedHistogram} from '../actions/ServerActions';
import {receivedDevices} from '../actions/ServerActions';
import {receivedZones} from '../actions/ServerActions';
import {receivedDuration} from '../actions/ServerActions';
import {receivedRoutine} from '../actions/ServerActions';
import {receivedFullCategories} from '../actions/ServerActions';

import request from 'superagent';


export function fetchZoneBreakdown(device, zone, from, to){
	
	let query = {
		id: device,
		zone: zone,
	}
	
	if (from && to){
		query.from = parseInt(from);
		query.to = parseInt(to);
	}
	
	request.get('/viz/stats/zonebreakdown')
	.query(query)
	.set('Accept', 'application/json')
	.end((err, response)=>{
		if (err) console.error(err);
		if (response.body && response.body.length > 0){
			console.log(response.body);
		}
	});		
}

export function fetchCategoriesByTime(device){
	console.log("getching categories by time!!");
	
	request.get('/viz/stats/fullclassification')
	.query({id:device})
	.set('Accept', 'application/json')
	.end((err, response)=>{
		if (err) console.error(err);
	
		if (response.body){
			console.log("great - got results!!!!!");
			receivedFullCategories(response.body)
		}
	});	
}

export function getCategories(device){

	
	
	request.get('/viz/stats/categories')
	.query({id:device})
	.set('Accept', 'application/json')
	.end((err, response)=>{
		if (err) console.error(err);
		if (response.body && response.body.length > 0){
			receivedCategories(response.body)
		}
	});	
}

export function bootstrap(device){
	request.get(`/viz/stats/bootstrap?id=${device}`)
	.set('Accept', 'application/json')
	.end((err, response)=>{
		if (err) console.error(err);
		receivedCategories(response.body.categories);
		receivedZones(response.body.zones);
		receivedDuration(response.body.duration);
		receivedRoutine(response.body.routine);
	});	
}

export function getHistogram(device,path){

	request.get('/viz/stats/histogram')
	.query({id:device, path:path})
	.set('Accept', 'application/json')
	.end((err, response)=>{
		if (err) console.error(err);
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