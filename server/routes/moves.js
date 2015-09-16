var express = require('express');
var router = express.Router();
var pgdb = require('../pgdb');
var User 	= require('../models/User');
var Device = require('../models/Device');
var request = require('superagent');
var config = require('../config');


/*
 * postgres moves schema
  CREATE TABLE TOKENS (
    deviceid integer NOT NULL,
    api varchar(255),
    token varchar(255),
    attr varchar(255),
    lastUpdate bigint
   );    
 */
 

router.get('/', function(req,res,next){

	console.log("seen moves callback!!");
	var login = req.query.login;
	var code  = req.query.code;
	console.log("login:"  + login);
	console.log("code: " + code);

	var data = {
		client_id: config.moves.CLIENT_ID,
		client_secret:config.moves.CLIENT_SECRET,
		redirect_uri: 'https://ucnproject.uk/viz/movescallback?login='+login,
		code: code,
		grant_type: 'authorization_code',
	}
	//swap the code for a token, build the url
	console.log("calling out to");
	console.log(config.moves.OAUTH_URL+'/access_token');
	
	request
     	.post(config.moves.OAUTH_URL+'/access_token')
     	.send(data)
     	.set('Accept', 'application/json')
     	.type('json')
     	.end(function(err, result){
			if (err){
		    	console.log(err);
		    	res.send({success:false});
			}else{     
				pgdb.fetch_device_id_for_device(login).then(function(deviceid){
					return pgdb.insert_token_for_device(deviceid, 'moves', result.body.access_token).then(function(result){
						console.log("am here!");
					 	res.send({success:true});
						return;
					});
				}, function(err){
					console.log("error!!");
					console.log(err);
					res.send({success:false});
					throw err;
				});	
			}
		});
		
	
});

module.exports = router;