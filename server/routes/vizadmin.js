var express = require('express');
var router = express.Router();
var pgdb = require('../pgdb');
var User 	= require('../models/User');
var Device = require('../models/Device');

//all /viz/admin routes will go through this check..

router.use(function(req, res, next) {
	
	console.log(req.user);
	
    if (!req.user || !req.user.isadmin) {
        return res.redirect("/ucn/auth/login");
        //var robj =  res.locals.renderobj;
        //robj.loggedin = false;
        //robj.error = res.__('error_not_authorized');
        //return res.render('login', robj);
    }
    next();
});

router.get('/', function(req,res,next){
	console.log("ok user is");
	console.log(req.user);
	
	User.findAllUsers().then(function(users){
		return users;
	})
	.then(function(users){
		return Promise.all(users.map(function(user){
			return Promise.all([user.username, user.familyname, Device.findDevicesForUser(user.username)]);
		}));
		
	}).then(function(results){
		var families = results.map(function(result){
			return {username:result[0], family:result[1], devices: result[2].map(function(device){
				return device.devname;
			})};
		});
		
		res.render("admin", {families:families});
	});
});

module.exports = router;